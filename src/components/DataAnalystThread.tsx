import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SectionId } from './NavigationHeader';

/**
 * DataAnalystThread - A single continuous vermillion SVG line from Home to Contact.
 *
 * Architecture (layer model):
 * - Page root is `position: relative`; the thread SVG is `position: absolute`
 *   (top 0 / left 0 / height = document height) with `z-index: 1`.
 * - Section backgrounds live in `.section-bg` (z-index 0) -> BELOW the thread.
 * - Section content lives in `.section-content` (z-index 2) -> ABOVE the thread.
 * - Sections must NOT carry transform / filter / opacity / z-index of their
 *   own, so no stacking context breaks this order.
 *
 * Draw model (performance):
 * - One route built from measured sections; every path is a "piece" whose
 *   getTotalLength() is cached once (never called inside the frame loop).
 * - A single self-stopping rAF loop advances time-based animations with the
 *   rAF timestamp (identical duration at 60 Hz and 120 Hz) and writes
 *   strokeDashoffset straight to the DOM. Zero React state per frame; style
 *   writes happen only when a value actually changed.
 * - Only the pieces of the active section +/- 1 are rendered (display), the
 *   rest are hidden to cut paint cost.
 * - Timed figure draws start after the scroll settles; Work, Projects, and the
 *   Skills handoff instead follow the smoothed scroll position.
 *   A re-measure only recalculates geometry and keeps the current progress.
 *
 * Home figure ("base de datos auditada con lupa"):
 * - Starts inside the viewport 40-60px above the top cap; the stroke has no
 *   separate start or end marker.
 * - Timed animation (not scroll linked): 300ms delay, ~2.6s ease-in-out. The
 *   thread is ONE continuous line: drawn once, then KEPT. Going down extends
 *   it, going up retracts only the parts below the figure. An interrupted
 *   draw resumes from where it stopped — it never fades out nor restarts
 *   from the node; a check appears inside the lens at the end.
 * - The Home -> Work connector starts at the unmarked END of the figure.
 *
 * Work figure ("el pipeline de auditoría") - SCROLL LINKED:
 * - One measured path connects the Home handle through the left margin and
 *   milestone centers. It fills from Work entering the viewport until aligned.
 * - Milestone pulses use positions sampled from the cached path length; the
 *   path retracts naturally on scroll-up.
 * - The exit stroke starts at the 2026 node and follows scroll toward Projects.
 *
 * Skills figure ("el hilo se conecta al grafo") - SCROLL LINKED:
 * - The measured Projects-to-About route follows the scroll marker across its
 *   section anchors.
 * - Its fixed marker appears when the incoming route reaches it; a short link
 *   then connects it to the measured DATA hub.
 * - The exit to About follows the same smoothed scroll progress.
 */

const THREAD_COLOR = '#ff3e00';
const NARROW_MARGIN_PX = 56;
const MIN_FIGURE_PX = 72;
const EDGE_INSET = 8;
const RAMP_RATIO = 0.15; // vertical span used by side-change connections
const THREAD_SCROLL_MARKER_RATIO = 0.5;
const PIECE_DRAW_MS = 260; // duration of the draw-in of a single piece
const PIECE_GAP_MS = 45; // pause between two consecutive pieces (sequential draw)
const HOME_FIGURE_ID = 'home-figure';
const HOME_CHECK_ID = 'home-figure-check';
const HOME_FIGURE_DELAY_MS = 300; // pause before the figure starts drawing
const HOME_FIGURE_DURATION_MS = 2600; // total duration of the figure
const HOME_CHECK_DURATION_MS = 200; // the check inside the lens
const HOME_PATH_START_GAP_PX = 50; // line starts 40-60px above the top cap
const SCROLL_SETTLE_MS = 100; // quiet scroll time before a draw sequence starts
const RESIZE_DEBOUNCE_MS = 150;
const THREAD_WAVE_LENGTH = 250; // long, broad S-curves (desktop)
const THREAD_WAVE_LENGTH_NARROW = 190; // same, tuned for narrow viewports
const THREAD_WAVE_HARMONIC = 0.22; // secondary wobble that breaks the pure sine
const THREAD_WAVE_LENGTH_ABOUT = 440; // two big, wide S-curves in the About corridor
const THREAD_WAVE_HARMONIC_ABOUT = 0.1;
const THREAD_WAVE_LENGTH_SQL = 380; // two broad S-curves down the console's right corridor
const SQL_RIGHT_AMPLITUDE_CAP = 110;
const ABOUT_ENTRY_RUN_PX = 120; // vertical run that keeps the Skills->About handoff steep
const SKILLS_ROUTE_PIECE_IDS = new Set([
  'skills-margin-in',
  'skills-signal',
  'skills-about-out',
]);
const ABOUT_ROUTE_PIECE_IDS = new Set([
  'about-left-flow',
  'about-sql-desc',
  'about-sql-glide',
]);
const SQL_ROUTE_PIECE_IDS = new Set([
  'sql-flow',
  'sql-tuck',
  'sql-contact-desc',
  'sql-contact-glide',
]);
const SCROLL_LINKED_PIECE_IDS = new Set([
  'work-line',
  'work-exit',
  ...SKILLS_ROUTE_PIECE_IDS,
  ...ABOUT_ROUTE_PIECE_IDS,
  ...SQL_ROUTE_PIECE_IDS,
]);

const SECTION_BY_KEY: Record<SectionId, string> = {
  home: 'hero-section',
  work: 'work-section',
  projects: 'projects-section',
  skills: 'skills-section',
  about: 'about-section',
  sql: 'sql-section',
  contact: 'contact-section',
};

const SECTION_ORDER = [
  'hero-section',
  'work-section',
  'projects-section',
  'skills-section',
  'about-section',
  'sql-section',
  'contact-section',
];

interface AnimState {
  start: number;
  targets: {
    id: string;
    delay: number;
    duration: number;
    from: number;
    to: number;
    ease?: 'out' | 'inout';
  }[]
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface PieceDef {
  id: string;
  d: string;
  section: string; // section that owns this piece (drives the draw-in animation)
  a0: number; // anchor start (virtual document Y)
  a1: number; // anchor end (virtual document Y)
  opacity: number;
  rail?: true; // static gray Work rail behind the scroll-linked stroke
  width?: number; // stroke width override (dots)
  figureStart?: { x: number; y: number };
  projectNodes?: { x: number; y: number }[];
}

interface Sample {
  dist: number;
  x: number;
  y: number;
}

interface PieceRun {
  def: PieceDef;
  el: SVGPathElement | null;
  overlayEl: SVGPathElement | null;
  len: number;
  samples: Sample[];
}

const progressAtPathY = (run: PieceRun, y: number) => {
  if (run.len <= 0 || run.samples.length === 0 || y < run.samples[0].y) return 0;
  for (let i = 1; i < run.samples.length; i++) {
    const previous = run.samples[i - 1];
    const current = run.samples[i];
    if (y <= current.y) {
      const span = current.y - previous.y;
      const t = span > 0 ? clamp((y - previous.y) / span, 0, 1) : 1;
      return (previous.dist + (current.dist - previous.dist) * t) / run.len;
    }
  }
  return 1;
};

interface SecGeom {
  id: string;
  el: HTMLElement;
  top: number;
  bottom: number;
  contentTop: number;
  contentBottom: number;
  contentLeft: number;
  contentRight: number;
  leftMargin: number;
  rightMargin: number;
  indicatorLeft: number; // left edge of the fixed section index (right rail)
  mlX: number; // X used by the thread inside the left margin
  mrX: number; // X used by the thread inside the right margin
  leftOpacity: number;
  rightOpacity: number;
  projectRows: { number: string; y: number }[];
  projectThreadX?: number;
  projectThreadAmplitude?: number;
  workTrack: { width: number; height: number } | null;
  workMilestones: { x: number; y: number }[];
  aboutContentLeft: number | null;
  skillsSignal: {
    y: number;
    waveAmplitude: number;
    peakHeight: number;
    peakCount: number;
    compact: boolean;
    sphere: { x: number; y: number; radius: number } | null;
    legendLeft: number;
    legendRight: number;
    legendTop: number;
    legendBottom: number;
  } | null;
  contactBandTop: number;
  contactBandBottom: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const progressAtY = (position: number, start: number, end: number) =>
  clamp((position - start) / Math.max(1, end - start), 0, 1);
const round1 = (v: number) => Math.round(v * 10) / 10;
const round3 = (v: number) => Math.round(v * 1000) / 1000;
const isFiniteNum = (v: number) => Number.isFinite(v);

/* ------------------------- measurement ------------------------- */

function measureSections(): SecGeom[] {
  const W = window.innerWidth;
  const sy = window.scrollY;
  const out: SecGeom[] = [];

  // Fixed section index (right edge): the thread must not run through it
  const indicator = document.querySelector('aside[aria-label="Indicador de sección activa"]');
  const indLeft = indicator ? indicator.getBoundingClientRect().left : W + 1;

  for (const id of SECTION_ORDER) {
    const el = document.getElementById(id);
    if (!el) continue;

    const r = el.getBoundingClientRect();
    const contentEl = el.querySelector('[data-thread-content]') as HTMLElement | null;
    const fallbackEl = el.querySelector('.section-content') as HTMLElement | null;
    const boxEl: HTMLElement = contentEl || fallbackEl || el;
    const cr = boxEl.getBoundingClientRect();
    const workTrackEl =
      id === 'work-section'
        ? (el.querySelector('[data-thread-anchor="work-track"]') as HTMLElement | null)
        : null;
    const workTrackRect = workTrackEl?.getBoundingClientRect();
    const workMilestones =
      id === 'work-section'
        ? ['work-node-2024', 'work-node-2025', 'work-node-2026']
            .map((nodeId) => {
              const node = el.querySelector<HTMLElement>(`#${nodeId}`);
              if (!node) return null;
              const nr = node.getBoundingClientRect();
              return {
                x: nr.left + nr.width / 2,
                y: nr.top + sy + nr.height / 2,
              };
            })
            .filter((node): node is { x: number; y: number } => node !== null)
        : [];
    const skillsCanvas =
      id === 'skills-section' ? el.querySelector('canvas') : null;
    const skillsCanvasRect = skillsCanvas?.getBoundingClientRect();
    const aboutText =
      id === 'about-section' ? el.querySelector<HTMLElement>('p') : null;
    const aboutTextRect = aboutText?.getBoundingClientRect();
    const skillsMobileStack =
      id === 'skills-section'
        ? Array.from(boxEl.children).find((child) =>
            child.classList.contains('lg:hidden')
          ) as HTMLElement | undefined
        : undefined;
    const skillsMobileRect = skillsMobileStack?.getBoundingClientRect();
    const skillsLegend =
      id === 'skills-section' ? (boxEl.lastElementChild as HTMLElement | null) : null;
    const skillsLegendRect = skillsLegend?.getBoundingClientRect();
    const skillsLegendParts = skillsLegend
      ? Array.from(skillsLegend.children)
          .map((child) => child.getBoundingClientRect())
          .filter((rect) => rect.width > 0 && rect.height > 0)
      : [];
    const pillsEl =
      id === 'contact-section'
        ? (el.querySelector('[data-thread-anchor="contact-pills"]') as HTMLElement | null)
        : null;
    const footerEl =
      id === 'contact-section'
        ? (el.querySelector('[data-thread-anchor="contact-footer"]') as HTMLElement | null)
        : null;
    const pillsRect = pillsEl?.getBoundingClientRect();
    const footerRect = footerEl?.getBoundingClientRect();
    let skillsSignal: SecGeom['skillsSignal'] = null;
    if (id === 'skills-section') {
      const legendTop = skillsLegendRect
        ? skillsLegendRect.top + sy
        : r.bottom + sy;
      const legendBottom = skillsLegendRect
        ? skillsLegendRect.bottom + sy
        : r.bottom + sy;
      const legendLeft = skillsLegendParts.length
        ? Math.min(...skillsLegendParts.map((rect) => rect.left))
        : skillsLegendRect?.left ?? cr.left;
      const legendRight = skillsLegendParts.length
        ? Math.max(...skillsLegendParts.map((rect) => rect.right))
        : skillsLegendRect?.right ?? cr.right;
      let visualBottom = cr.bottom + sy;
      let sphere: NonNullable<SecGeom['skillsSignal']>['sphere'] = null;
      if (skillsCanvasRect && skillsCanvasRect.width > 0 && skillsCanvasRect.height > 0) {
        const height = skillsCanvasRect.height;
        const width = skillsCanvasRect.width;
        const maxScale = 1.2;
        const hubBuffer = 26;
        const padY = 36;
        const padX = 24;
        const radius = Math.min(
          Math.max(80, (height * 0.5 - (hubBuffer + padY)) / maxScale),
          Math.max(80, (width * 0.5 - (hubBuffer + padX + 80)) / maxScale)
        );
        const sphereRadius = radius * maxScale + hubBuffer;
        const sphereX = skillsCanvasRect.left + width * 0.5;
        const sphereY = skillsCanvasRect.top + sy + height * 0.5;
        sphere = { x: sphereX, y: sphereY, radius: sphereRadius };
        visualBottom =
          sphereY + sphereRadius;
      } else if (skillsMobileRect && skillsMobileRect.height > 0) {
        visualBottom = skillsMobileRect.bottom + sy;
      }

      const safeTop = visualBottom + 16;
      const safeBottom = legendTop - 16;
      const signalBand = safeBottom - safeTop;
      const amplitudeScale = clamp(signalBand / 90, 0, 1);
      const viewportScale = W < 1024 ? 0.6 : 1;
      skillsSignal = {
        y:
          signalBand >= 0
            ? (safeTop + safeBottom) / 2
            : (visualBottom + legendTop) / 2,
        waveAmplitude: 20 * amplitudeScale * viewportScale,
        peakHeight: Math.max(18, 46 * amplitudeScale * viewportScale),
        peakCount: W < 1024 ? 1 : 2,
        compact: W < 1024,
        sphere,
        legendLeft,
        legendRight,
        legendTop,
        legendBottom,
      };
    }

    const contentLeft = cr.left;
    const contentRight = cr.right;
    const leftMargin = Math.max(0, contentLeft);
    const rightMargin = Math.max(0, W - contentRight);

    const leftNarrow = leftMargin < NARROW_MARGIN_PX;
    const rightNarrow = rightMargin < NARROW_MARGIN_PX;

    // Usable right margin: between the content edge and the fixed section index
    const rightUsable = Math.max(0, Math.min(rightMargin, indLeft - 10 - contentRight));
    const rightEdgeMode = rightNarrow || rightUsable < NARROW_MARGIN_PX;
    const mrX = rightEdgeMode ? W - EDGE_INSET : contentRight + rightUsable / 2;
    const projectRightLimit = W - EDGE_INSET;
    const projectThreadMinX = contentRight + 24;
    const projectThreadMaxX = Math.min(projectRightLimit, contentRight + 40);
    const hasProjectThreadMargin =
      id === 'projects-section' && projectThreadMaxX >= projectThreadMinX;
    const projectThreadX = hasProjectThreadMargin
      ? (projectThreadMinX + projectThreadMaxX) / 2
      : id === 'projects-section'
        ? mrX
        : undefined;
    const projectThreadAmplitude = hasProjectThreadMargin
      ? Math.min(10, (projectThreadMaxX - projectThreadMinX) / 2)
      : 0;
    const projectRows =
      id === 'projects-section'
        ? Array.from(el.querySelectorAll<HTMLElement>('.project-row'))
            .map((row) => {
              const number = row.querySelector<HTMLElement>(
                '.project-row-content > div:first-child > span'
              );
              if (!number) return null;
              const nr = number.getBoundingClientRect();
              return {
                number: number.textContent?.trim() ?? '',
                y: nr.top + sy + nr.height / 2,
              };
            })
            .filter((row): row is { number: string; y: number } => row !== null)
        : [];

    out.push({
      id,
      el,
      top: r.top + sy,
      bottom: r.bottom + sy,
      contentTop: cr.top + sy,
      contentBottom: cr.bottom + sy,
      contentLeft,
      contentRight,
      leftMargin,
      rightMargin,
      indicatorLeft: indLeft,
      mlX: leftNarrow ? EDGE_INSET : contentLeft / 2,
      mrX,
      leftOpacity: leftNarrow ? 0.6 : 1,
      rightOpacity: rightEdgeMode ? 0.6 : 1,
      projectRows,
      projectThreadX,
      projectThreadAmplitude,
      workTrack:
        workTrackRect && workTrackRect.width > 0 && workTrackRect.height > 0
          ? { width: workTrackRect.width, height: workTrackRect.height }
          : null,
      workMilestones,
      aboutContentLeft:
        aboutTextRect && aboutTextRect.width > 0 ? aboutTextRect.left : null,
      skillsSignal,
      contactBandTop: pillsRect
        ? pillsRect.bottom + sy
        : cr.bottom + sy,
      contactBandBottom: footerRect
        ? footerRect.top + sy
        : r.bottom + sy,
    });
  }

  return out;
}

/* ------------------------- route builder ------------------------- */

interface Builder {
  pieces: PieceDef[];
  x: number;
  y: number;
  section: string;
}

const pushPiece = (
  b: Builder,
  id: string,
  d: string,
  a0: number,
  a1: number,
  opacity: number,
  extra?: Partial<PieceDef>
) => {
  if (!d || /NaN|Infinity/.test(d)) return;
  if (!isFiniteNum(a0) || !isFiniteNum(a1)) return;
  b.pieces.push({ id, d, section: b.section, a0, a1, opacity, ...extra });
};

/** Broad cubic with vertical tangents at both ends. */
const sCurveTo = (b: Builder, id: string, x: number, y: number, opacity = 1) => {
  const x1 = b.x;
  const y1 = b.y;
  const dy = y - y1;
  const dir = Math.sign(dy) || 1;
  const k = Math.min(120, Math.abs(dy) * 0.45);
  const d =
    Math.abs(dy) < 1
      ? `M ${round1(x1)} ${round1(y1)} C ${round1(x1 + (x - x1) * 0.35)} ${round1(y1)}, ${round1(x1 + (x - x1) * 0.65)} ${round1(y)} ${round1(x)} ${round1(y)}`
      : `M ${round1(x1)} ${round1(y1)} C ${round1(x1)} ${round1(y1 + dir * k)}, ${round1(x)} ${round1(y - dir * k)}, ${round1(x)} ${round1(y)}`;
  pushPiece(b, id, d, y1, y, opacity);
  b.x = x;
  b.y = y;
};

const verticalWave = (x: number, y1: number, y2: number, sway: number) => {
  const dy = y2 - y1;
  if (Math.abs(dy) < 1) return '';
  if (Math.abs(sway) < 1) {
    const k = Math.min(120, Math.abs(dy) * 0.45);
    const dir = Math.sign(dy);
    return `C ${round1(x)} ${round1(y1 + dir * k)}, ${round1(x)} ${round1(y2 - dir * k)}, ${round1(x)} ${round1(y2)} `;
  }

  const offset = Math.sign(sway) * Math.min(Math.abs(sway), Math.abs(dy) * 0.2);
  const midY = y1 + dy * 0.5;
  return (
    `C ${round1(x)} ${round1(y1 + dy * 0.25)}, ${round1(x + offset)} ${round1(midY - dy * 0.25)}, ${round1(x + offset)} ${round1(midY)} ` +
    `C ${round1(x + offset)} ${round1(midY + dy * 0.25)}, ${round1(x)} ${round1(y2 - dy * 0.25)}, ${round1(x)} ${round1(y2)} `
  );
};

/** Smooth margin descent; a measured lateral wave stays inside the free margin. */
const descendTo = (b: Builder, id: string, x: number, y: number, opacity = 1, sway = 0) => {
  const x1 = b.x;
  const y1 = b.y;
  const dx = x - x1;
  const dy = y - y1;
  const dir = Math.sign(dy) || 1;
  let d: string;

  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

  if (Math.abs(dx) > 1) {
    const k = Math.min(120, Math.abs(dy) * 0.45);
    d =
      Math.abs(dy) < 1
        ? `M ${round1(x1)} ${round1(y1)} C ${round1(x1 + dx * 0.35)} ${round1(y1)}, ${round1(x1 + dx * 0.65)} ${round1(y)} ${round1(x)} ${round1(y)}`
        : `M ${round1(x1)} ${round1(y1)} C ${round1(x1)} ${round1(y1 + dir * k)}, ${round1(x)} ${round1(y - dir * k)}, ${round1(x)} ${round1(y)}`;
  } else {
    d = `M ${round1(x1)} ${round1(y1)} ${verticalWave(x1, y1, y, sway)}`;
  }

  pushPiece(b, id, d, y1, y, opacity);
  b.x = x;
  b.y = y;
};

/** Free band inside a section, above its content (used for side changes). */
const topBandY = (sec: SecGeom) => {
  const band = sec.contentTop - sec.top;
  return sec.top + clamp(band * 0.5, 10, 40);
};

const marginSway = (sec: SecGeom, side: 'left' | 'right', viewportWidth: number) => {
  const center = side === 'left' ? sec.mlX : sec.mrX;
  const minX = side === 'left' ? 0 : sec.contentRight;
  const maxX =
    side === 'left'
      ? sec.contentLeft
      : center < viewportWidth - EDGE_INSET
      ? sec.contentRight + 2 * (center - sec.contentRight)
      : viewportWidth;
  const towardLeft = center - minX;
  const towardRight = maxX - center;
  const available = Math.max(towardLeft, towardRight);
  return Math.sign(towardRight - towardLeft || 1) * Math.min(32, Math.max(0, available - 4));
};

const bandSway = (sec: SecGeom, y: number) => {
  const above = y - sec.top;
  const below = sec.contentTop - y;
  const available = Math.max(above, below);
  return Math.sign(below - above || 1) * Math.min(32, Math.max(0, available - 4));
};

/** Vertical placement of a figure inside a section band. */
const bandCenter = (sec: SecGeom, h: number) => {
  const top = sec.contentTop;
  const bottom = sec.contentBottom;
  const band = Math.max(0, bottom - top);
  return top + Math.max(0, (band - h) / 2);
};

const measureMarginWave = (
  sec: SecGeom,
  side: 'left' | 'right',
  viewportWidth: number
) => {
  const lower = side === 'right' ? sec.contentRight + 24 : 12;
  const upper = side === 'right' ? viewportWidth - 12 : sec.contentLeft - 24;
  const feasible = upper >= lower;
  const centerX = feasible
    ? (lower + upper) / 2
    : side === 'right'
      ? viewportWidth - 12
      : 12;
  const clearance = feasible ? Math.max(0, Math.min(centerX - lower, upper - centerX)) : 0;
  const viewportScale = viewportWidth < 1024 ? 0.6 : 1;
  const amplitude = Math.min(40 * viewportScale, clearance);
  return {
    centerX,
    minX: feasible ? lower : centerX,
    maxX: feasible ? upper : centerX,
    amplitude,
  };
};

const verticalOscillationPath = (
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
  amplitude: number,
  wavelength = 300,
  positiveAmplitude = amplitude,
  harmonic = 0
) => {
  const distance = yEnd - yStart;
  if (distance <= 0) return '';

  const steps = Math.max(2, Math.ceil(distance / Math.min(24, wavelength / 8)));
  const shortWave = clamp((wavelength * 0.6 - distance) / (wavelength * 0.6), 0, 1);
  const linearAmplitude = (amplitude + positiveAmplitude) / 2;
  const quadraticAmplitude = (positiveAmplitude - amplitude) / 2;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const y = yStart + distance * t;
    const envelope = Math.pow(Math.sin(Math.PI * t), 2);
    const center = xStart + (xEnd - xStart) * t * t * (3 - 2 * t);
    const primary = Math.sin(((y - yStart) * Math.PI * 2) / wavelength);
    const secondary = harmonic
      ? Math.sin(((y - yStart) * Math.PI * 2) / (wavelength * 0.46) + 1.1)
      : 0;
    const raw = (primary + harmonic * secondary) / (1 + harmonic);
    const oscillation = raw * (1 - shortWave) + shortWave * 0.75;
    const displacement =
      linearAmplitude * oscillation +
      quadraticAmplitude * oscillation * oscillation;
    return { x: center + envelope * displacement, y };
  });

  const slopeAt = (i: number) => {
    if (i === 0 || i === steps) return 0;
    const previous = points[i - 1];
    const next = points[i + 1];
    return (next.x - previous.x) / (next.y - previous.y);
  };

  let d = '';
  for (let i = 0; i < steps; i++) {
    const current = points[i];
    const next = points[i + 1];
    const segmentHeight = next.y - current.y;
    const currentSlope = slopeAt(i);
    const nextSlope = slopeAt(i + 1);
    d +=
      `C ${round1(current.x + currentSlope * segmentHeight / 3)} ` +
      `${round1(current.y + segmentHeight / 3)}, ` +
      `${round1(next.x - nextSlope * segmentHeight / 3)} ` +
      `${round1(next.y - segmentHeight / 3)} ` +
      `${round1(next.x)} ${round1(next.y)} `;
  }
  return d;
};

const signalWavePath = (
  xStart: number,
  xEnd: number,
  yBase: number,
  waveAmplitude: number,
  peakHeight: number,
  peakCount: number,
  sphere: NonNullable<SecGeom['skillsSignal']>['sphere'],
  legendTop: number
) => {
  const span = Math.abs(xEnd - xStart);
  const steps = clamp(Math.ceil(span / 12), 16, 160);
  const peakCenters = peakCount === 1 ? [0.5] : [0.35, 0.7];
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const x = xStart + (xEnd - xStart) * t;
    const decayProgress = clamp((t - 0.7) / 0.3, 0, 1);
    const damping = 1 - decayProgress * decayProgress * (3 - 2 * decayProgress);
    const wave =
      waveAmplitude *
      Math.sin(((xStart - x) * Math.PI * 2) / 140) *
      damping;
    const peak = Math.max(
      ...peakCenters.map((center) => {
        const distance = (t - center) / 0.045;
        return peakHeight * Math.exp(-0.5 * distance * distance);
      })
    );
    const candidateY = yBase + wave - peak;
    const sphereBottom = sphere
      ? Math.abs(x - sphere.x) < sphere.radius
        ? sphere.y + Math.sqrt(sphere.radius ** 2 - (x - sphere.x) ** 2) + 16
        : Number.NEGATIVE_INFINITY
      : Number.NEGATIVE_INFINITY;
    const legendLimit = legendTop - 16;
    const y =
      sphereBottom <= legendLimit
        ? clamp(candidateY, sphereBottom, legendLimit)
        : (sphereBottom + legendLimit) / 2;
    return { x, y };
  });

  const slopeAt = (i: number) => {
    if (i === 0 || i === steps) return 0;
    const previous = points[i - 1];
    const next = points[i + 1];
    return (next.y - previous.y) / (next.x - previous.x);
  };
  let d = '';
  for (let i = 0; i < steps; i++) {
    const current = points[i];
    const next = points[i + 1];
    const segmentWidth = next.x - current.x;
    const currentSlope = slopeAt(i);
    const nextSlope = slopeAt(i + 1);
    d +=
      `C ${round1(current.x + segmentWidth / 3)} ` +
      `${round1(current.y + currentSlope * segmentWidth / 3)}, ` +
      `${round1(next.x - segmentWidth / 3)} ` +
      `${round1(next.y - nextSlope * segmentWidth / 3)} ` +
      `${round1(next.x)} ${round1(next.y)} `;
  }
  return d;
};

/* ------------------------- figure motifs ------------------------- */

const threadWaveLength = (viewportWidth: number) =>
  viewportWidth < 1024 ? THREAD_WAVE_LENGTH_NARROW : THREAD_WAVE_LENGTH;

const aboutWaveLength = (viewportWidth: number) =>
  viewportWidth < 1024 ? THREAD_WAVE_LENGTH_NARROW : THREAD_WAVE_LENGTH_ABOUT;

const aboutWaveHarmonic = (viewportWidth: number) =>
  viewportWidth < 1024 ? THREAD_WAVE_HARMONIC : THREAD_WAVE_HARMONIC_ABOUT;

/** Center/amplitude for the thread inside the console's free left margin. */
const sqlMarginRoute = (sec: SecGeom) => {
  const x = sec.contentLeft >= 30 ? sec.contentLeft / 2 : EDGE_INSET;
  const buffer = 6;
  const amplitude = Math.max(
    0,
    Math.min(x - buffer, sec.contentLeft - x - buffer)
  );
  return { x, amplitude };
};

/**
 * Center/amplitude for the thread inside the console's free right corridor:
 * between the (narrowed) console and the fixed section index on the right rail.
 */
const sqlRightRoute = (sec: SecGeom) => {
  const lower = sec.contentRight + 28;
  const upper = Math.min(sec.indicatorLeft - 14, sec.contentRight + 300);
  const room = upper - lower;
  const feasible = room >= 70;
  const x = feasible ? (lower + upper) / 2 : Math.max(lower, upper - 20);
  const amplitude = feasible ? Math.min(SQL_RIGHT_AMPLITUDE_CAP, room / 2) : 0;
  return { x, amplitude, feasible };
};

interface AboutMarginRoute {
  start: { x: number; y: number };
  end: { x: number; y: number };
  scrollStart: number;
  scrollEnd: number;
  path: string;
  amplitude: number;
  inwardAmplitude: number;
}

const aboutMarginRoute = (
  sec: SecGeom,
  viewportWidth: number,
  endY: number,
  startYOverride?: number
): AboutMarginRoute => {
  const contentLeft = sec.aboutContentLeft ?? sec.contentLeft;
  const viewportScale = viewportWidth < 1024 ? 0.6 : 1;
  const safeLeft = 6;
  const safeRight = Math.max(safeLeft, contentLeft - 6);
  const x = (safeLeft + safeRight) / 2;
  const amplitude = Math.min(200 * viewportScale, (safeRight - safeLeft) / 2);
  const inwardAmplitude = amplitude;
  const startY = Math.max(
    topBandY(sec),
    Math.min(sec.bottom - 160, startYOverride ?? sec.top + ABOUT_ENTRY_RUN_PX)
  );
  const finalY = Math.max(startY, endY);
  const start = { x: round1(x), y: round1(startY) };
  const end = { x: round1(x), y: round1(finalY) };
  const path =
    `M ${start.x} ${start.y} ` +
    verticalOscillationPath(
      x,
      x,
      startY,
      finalY,
      amplitude,
      aboutWaveLength(viewportWidth),
      inwardAmplitude,
      aboutWaveHarmonic(viewportWidth)
    );
  return {
    start,
    end,
    scrollStart: start.y,
    scrollEnd: end.y,
    path,
    amplitude,
    inwardAmplitude,
  };
};

const sealCheck = (cx: number, cy: number, r: number) => {
  const d =
    ` M ${round1(cx - r)} ${round1(cy)} A ${round1(r)} ${round1(r)} 0 1 0 ${round1(cx + r)} ${round1(cy)} A ${round1(r)} ${round1(r)} 0 1 0 ${round1(cx - r)} ${round1(cy)}` +
    ` M ${round1(cx - r * 0.42)} ${round1(cy)} L ${round1(cx - r * 0.08)} ${round1(cy + r * 0.36)} L ${round1(cx + r * 0.46)} ${round1(cy - r * 0.38)}`;
  return d;
};

/* ------------------------- HOME figure ------------------------- */

/**
 * "Base de datos auditada con lupa".
 * A single continuous stroke (no pen lift) that:
 * 1. starts 40-60px above the top cap without a separate start marker,
 *   2. draws a database cylinder (elliptical top cap, two intermediate curved
 *      bands, bottom base),
 *   3. leaves the cylinder and forms a magnifying glass: the lens closes over
 *      the middle band and the handle descends diagonally, ending in the final
 *      unmarked handle.
 * A small check appears inside the lens once the magnifier is finished.
 *
 * The figure is authored in a 220 x 250 local box and scaled uniformly.
 */
const HOME_BOX_W = 220;
const HOME_BOX_H = 250;
const HOME_CX = 66; // cylinder centre X
const HOME_RX = 46; // cylinder radius X
const HOME_RY = 13; // cylinder radius Y (ellipse)
const HOME_Y_TOP = 34; // top cap centre Y
const HOME_Y_BAND_1 = 72; // first band Y
const HOME_Y_BAND_2 = 110; // second band Y
const HOME_Y_BOTTOM = 148; // bottom base centre Y
const HOME_LENS_X = 140; // lens centre X
const HOME_LENS_Y = 88; // lens centre Y
const HOME_LENS_R = 34; // lens radius
const HOME_HANDLE_X = 198; // magnifier handle endpoint X
const HOME_HANDLE_Y = 150; // magnifier handle endpoint Y

const buildHomeFigure = (
  sec: SecGeom,
  W: number,
  vh: number
): {
  d: string;
  check: string;
  startY: number;
  start: { x: number; y: number };
  endX: number;
  endY: number;
  endTangentX: number;
  endTangentY: number;
} | null => {
  if (!sec) return null;

  const narrow = W < 1024;
  const maxH = vh * 0.55;

  // Free zone: right side of the hero, over the background chart, never over
  // the headline block nor over the three bottom columns.
  const rightEdge = Math.min(W - 40, sec.contentRight + (W - sec.contentRight) * 0.75);
  const leftLimit = sec.contentRight - 0.35 * (sec.contentRight - sec.contentLeft);
  const availW = Math.max(80, rightEdge - leftLimit);

  const scale = narrow ? (maxH / HOME_BOX_H) * 0.7 : Math.min(maxH / HOME_BOX_H, availW / HOME_BOX_W);

  const boxW = HOME_BOX_W * scale;
  const boxH = HOME_BOX_H * scale;
  const boxX = narrow ? W - 12 - boxW : rightEdge - boxW;
  const boxY = narrow ? sec.bottom - 12 - boxH : sec.top + vh * 0.5 - boxH / 2;

  const X = (v: number) => round1(boxX + v * scale);
  const Y = (v: number) => round1(boxY + v * scale);
  const RX = round1(HOME_RX * scale);
  const RY = round1(HOME_RY * scale);
  const LR = round1(HOME_LENS_R * scale);

  // Keep the path's original in-viewport start position.
  const capTopY = boxY + (HOME_Y_TOP - HOME_RY) * scale;
  const startY = Math.max(8, capTopY - (narrow ? 40 : HOME_PATH_START_GAP_PX));
  const start = { x: X(HOME_CX), y: round1(startY) };

  const d = [
    // 1. the path drops onto the top cap
    `M ${start.x} ${start.y}`,
    `L ${X(HOME_CX)} ${Y(HOME_Y_TOP - HOME_RY)}`,
    // 2. the elliptical top cap: two half arcs (an arc with equal end points
    //    is omitted by the SVG spec, so the ellipse is split in two)
    `A ${RX} ${RY} 0 0 1 ${X(HOME_CX)} ${Y(HOME_Y_TOP + HOME_RY)}`,
    `A ${RX} ${RY} 0 0 1 ${X(HOME_CX)} ${Y(HOME_Y_TOP - HOME_RY)}`,
    // quarter arc down to the right flank
    `A ${RX} ${RY} 0 0 1 ${X(HOME_CX + HOME_RX)} ${Y(HOME_Y_TOP)}`,
    // right flank down to the first band
    `L ${X(HOME_CX + HOME_RX)} ${Y(HOME_Y_BAND_1)}`,
    // first band (front half, bulging down)
    `A ${RX} ${RY} 0 0 1 ${X(HOME_CX - HOME_RX)} ${Y(HOME_Y_BAND_1)}`,
    // left flank down to the second band
    `L ${X(HOME_CX - HOME_RX)} ${Y(HOME_Y_BAND_2)}`,
    // second band (front half, bulging down)
    `A ${RX} ${RY} 0 0 0 ${X(HOME_CX + HOME_RX)} ${Y(HOME_Y_BAND_2)}`,
    // right flank down to the base
    `L ${X(HOME_CX + HOME_RX)} ${Y(HOME_Y_BOTTOM - HOME_RY)}`,
    // bottom base (front half)
    `A ${RX} ${RY} 0 0 1 ${X(HOME_CX - HOME_RX)} ${Y(HOME_Y_BOTTOM - HOME_RY)}`,
    // 3. leaves the cylinder and flows into the magnifying glass
    `C ${X(60)} ${Y(178)}, ${X(120)} ${Y(150)}, ${X(HOME_LENS_X + HOME_LENS_R * 0.7071)} ${Y(
      HOME_LENS_Y + HOME_LENS_R * 0.7071
    )}`,
    // the lens closes over the middle band: a short arc (the lower half of the
    // 90 degrees chord) plus the long complementary arc (270 degrees)
    `A ${LR} ${LR} 0 0 1 ${X(HOME_LENS_X - HOME_LENS_R * 0.7071)} ${Y(
      HOME_LENS_Y + HOME_LENS_R * 0.7071
    )}`,
    `A ${LR} ${LR} 0 1 1 ${X(HOME_LENS_X + HOME_LENS_R * 0.7071)} ${Y(
      HOME_LENS_Y + HOME_LENS_R * 0.7071
    )}`,
    // the handle descends diagonally to its unmarked endpoint
    `L ${X(HOME_HANDLE_X)} ${Y(HOME_HANDLE_Y)}`,
  ].join(' ');

  // small check inside the lens
  const check = `M ${X(HOME_LENS_X - 11)} ${Y(HOME_LENS_Y)} L ${X(HOME_LENS_X - 3)} ${Y(
    HOME_LENS_Y + 9
  )} L ${X(HOME_LENS_X + 12)} ${Y(HOME_LENS_Y - 12)}`;

  return {
    d,
    check,
    startY,
    start,
    endX: boxX + HOME_HANDLE_X * scale,
    endY: boxY + HOME_HANDLE_Y * scale,
    endTangentX: (HOME_HANDLE_X - (HOME_LENS_X + HOME_LENS_R * 0.7071)) * scale,
    endTangentY: (HOME_HANDLE_Y - (HOME_LENS_Y + HOME_LENS_R * 0.7071)) * scale,
  };
};

/* ------------------------- route ------------------------- */

function buildRoute(secs: SecGeom[], W: number): PieceDef[] {
  const b: Builder = { pieces: [], x: 0, y: 0, section: 'hero-section' };
  const vh = window.innerHeight;
  const ramp = Math.max(40, Math.round(vh * RAMP_RATIO));

  const [home, work, projects, skills, about, sql, contact] = secs;
  const aboutGlideY = sql ? topBandY(sql) : null;
  const aboutConsoleLeadY =
    about && aboutGlideY !== null
      ? Math.max(topBandY(about), aboutGlideY - ramp)
      : about?.bottom ?? 0;
  const aboutEntrySignal = skills?.skillsSignal ?? null;
  const aboutEntryY = about
    ? Math.max(
        about.top + ABOUT_ENTRY_RUN_PX,
        aboutEntrySignal ? aboutEntrySignal.y + 150 : 0,
        aboutEntrySignal ? aboutEntrySignal.legendBottom + 28 : 0
      )
    : 0;
  const aboutRoute = about
    ? aboutMarginRoute(
        about,
        W,
        Math.min(about.bottom, aboutConsoleLeadY),
        aboutEntryY
      )
    : null;
  let homeEndTangent = { x: 0, y: 1 };
  const projectHandoff = (lastNodeY: number, smallestRowGap: number) => {
    const exitY = skills
      ? Math.max(lastNodeY, Math.min(lastNodeY + 40, topBandY(skills) - 120))
      : lastNodeY;
    const baseTangentY = smallestRowGap ? smallestRowGap * 0.4 : 24;
    return {
      y: exitY,
      tangentX: Math.min(10, projects?.projectThreadAmplitude ?? 10) * 0.5,
      tangentY: Math.min(
        baseTangentY,
        Math.max(0, (exitY - lastNodeY) * 0.9)
      ),
    };
  };

  /* -- HOME: the audited database with the magnifying glass -- */
  if (home) {
    const figure = buildHomeFigure(home, W, vh);
    if (figure && figure.d && !/NaN|Infinity/.test(figure.d)) {
      // the figure's path remains separate from its timed check
      b.pieces.push({
        id: HOME_FIGURE_ID,
        d: figure.d,
        section: 'hero-section',
        a0: figure.startY,
        a1: figure.endY,
        opacity: 1,
        figureStart: figure.start,
      });
      // the connector to the next section is born at the END of the figure
      b.x = figure.endX;
      b.y = figure.endY;
      homeEndTangent = { x: figure.endTangentX, y: figure.endTangentY };
      // the check inside the lens (own path, drawn when the lens is finished)
      pushPiece(b, HOME_CHECK_ID, figure.check, figure.startY, figure.endY, 1);
    } else {
      b.x = home.contentRight - 40;
      b.y = home.top + 220;
      sCurveTo(b, 'home-out', home.mrX, b.y + 60, home.rightOpacity);
    }
  }

  /* -- HOME -> WORK: one scroll-linked curve into the measured milestone rail -- */
  if (home && work) {
    b.section = 'work-section';
    const measuredNodes = work.workMilestones;

    if (work.workTrack && measuredNodes.length === 3) {
      const x24 = measuredNodes[0].x;
      const x26 = measuredNodes[2].x;
      const y26 = measuredNodes[2].y;

      pushPiece(
        b,
        'work-rail',
        `M ${round1(x24)} ${round1(y26)} L ${round1(x26)} ${round1(y26)}`,
        y26,
        y26,
        1,
        { rail: true }
      );

      // Route the connector through the measured side margins and cross the
      // section boundary with a broad S-curve.
      const boundaryY = work.top;
      const homeDeltaY = boundaryY - b.y;
      const bridgeRadius = Math.min(120, Math.max(0, homeDeltaY * 0.25));
      const boundaryStartY = boundaryY - bridgeRadius;
      const boundaryEndY = boundaryY + bridgeRadius;
      const homeCurveY = Math.min(boundaryStartY, b.y + Math.min(180, homeDeltaY * 0.5));
      const homeTangentLength = Math.hypot(homeEndTangent.x, homeEndTangent.y) || 1;
      const homeTangentX = homeEndTangent.x / homeTangentLength;
      const homeTangentY = homeEndTangent.y / homeTangentLength;
      const homeEndControl = Math.min(120, Math.max(0, (homeCurveY - b.y) * 0.45));
      const homeStartControl = Math.min(
        120,
        Math.max(0, (W - EDGE_INSET - b.x) / Math.max(0.1, homeTangentX)),
        Math.max(0, (homeCurveY - b.y - homeEndControl) / Math.max(0.1, homeTangentY))
      );
      const entryY = Math.max(y26 - ramp, work.contentTop, boundaryEndY + 24);
      const turnDistance = Math.max(0, Math.min(y26 - entryY, x24 - work.mlX));
      const turnControl = Math.min(120, turnDistance * 0.8);
      const turnDir = Math.sign(y26 - entryY) || 1;
      const connection =
        `M ${round1(b.x)} ${round1(b.y)} ` +
        `C ${round1(b.x + homeTangentX * homeStartControl)} ${round1(b.y + homeTangentY * homeStartControl)}, ${round1(home.mrX)} ${round1(homeCurveY - homeEndControl)} ${round1(home.mrX)} ${round1(homeCurveY)} ` +
        `${verticalWave(home.mrX, homeCurveY, boundaryStartY, marginSway(home, 'right', W))}` +
        `C ${round1(home.mrX)} ${round1(boundaryY)}, ${round1(work.mlX)} ${round1(boundaryY)}, ${round1(work.mlX)} ${round1(boundaryEndY)} ` +
        `${verticalWave(work.mlX, boundaryEndY, entryY, marginSway(work, 'left', W))}` +
        `C ${round1(work.mlX)} ${round1(entryY + turnDir * turnControl)} ${round1(x24 - turnControl)} ${round1(y26)} ${round1(x24)} ${round1(y26)} ` +
        `L ${round1(x26)} ${round1(y26)}`;
      pushPiece(b, 'work-line', connection, b.y, y26, 1);

      b.x = x26;
      b.y = y26;

      // Exit stroke starts at the measured center of the 2026 node.
      if (projects) {
        const projectThreadX = projects.projectThreadX ?? projects.mrX;
        const projectNodes = projects.projectRows.map((row) => ({
          x: projectThreadX,
          y: row.y,
        }));
        const firstProjectNode = projectNodes[0] ?? {
          x: projects.mrX,
          y: bandCenter(projects, 160),
        };
        const figTop = firstProjectNode.y;
        const exitX = firstProjectNode.x;
        const rowGaps = projectNodes
          .slice(1)
          .map((node, i) => node.y - projectNodes[i].y)
          .filter((gap) => gap > 0);
        const smallestRowGap = rowGaps.length ? Math.min(...rowGaps) : 0;
        const swayAmplitude = Math.min(10, projects.projectThreadAmplitude ?? 10);
        const swayControlX = swayAmplitude / 0.2886751345948129;
        const swayTangentY = smallestRowGap
          ? smallestRowGap * 0.4
          : 24;
        const lastProjectNode =
          projectNodes[projectNodes.length - 1] ?? firstProjectNode;
        const handoff = projectHandoff(lastProjectNode.y, smallestRowGap);
        const departureControl = Math.min(120, Math.max(0, (work.mrX - x26) * 0.65));
        const departureRadius = Math.max(80, departureControl);
        const arrivalY = y26 + departureRadius;
        const arrivalControl = Math.min(120, departureRadius * 0.75);
        const exitBridgeRadius = Math.min(120, Math.max(0, (projects.top - arrivalY) * 0.25));
        const exitBoundaryStartY = projects.top - exitBridgeRadius;
        const exitBoundaryEndY = projects.top + exitBridgeRadius;
        let exitPath =
          `M ${round1(x26)} ${round1(y26)} ` +
          `C ${round1(x26 + departureControl)} ${round1(y26)}, ${round1(work.mrX)} ${round1(arrivalY - arrivalControl)} ${round1(work.mrX)} ${round1(arrivalY)} ` +
          `${verticalWave(work.mrX, arrivalY, exitBoundaryStartY, marginSway(work, 'right', W))}` +
          `C ${round1(work.mrX)} ${round1(projects.top)}, ${round1(exitX)} ${round1(projects.top)}, ${round1(exitX)} ${round1(exitBoundaryEndY)} ` +
          `C ${round1(exitX)} ${round1(exitBoundaryEndY + Math.min(80, Math.max(40, (figTop - exitBoundaryEndY) * 0.45)))} ` +
          `${round1(exitX - swayControlX)} ${round1(figTop - swayTangentY)} ${round1(exitX)} ${round1(figTop)} `;

        let projectEnd = firstProjectNode;
        if (projectNodes.length === 5) {
          for (let i = 0; i < projectNodes.length - 1; i++) {
            const start = projectNodes[i];
            const end = projectNodes[i + 1];
            const lastSegment = i === projectNodes.length - 2;
            const endTangentX = lastSegment ? handoff.tangentX : swayControlX;
            const endTangentY = lastSegment ? handoff.tangentY : swayTangentY;
            exitPath +=
              `C ${round1(start.x + swayControlX)} ${round1(start.y + swayTangentY)}, ` +
              `${round1(end.x - endTangentX)} ${round1(end.y - endTangentY)} ` +
              `${round1(end.x)} ${round1(end.y)} `;
          }
          projectEnd = projectNodes[projectNodes.length - 1];
        }

        pushPiece(
          b,
          'work-exit',
          exitPath,
          y26,
          projectEnd.y,
          work.rightOpacity,
          {
            projectNodes: projectNodes.length === 5 ? projectNodes : undefined,
          }
        );
        b.x = projectEnd.x;
        b.y = projectEnd.y;
      }
    } else {
      sCurveTo(b, 'work-connector', work.mlX, topBandY(work), work.leftOpacity);
    }
  }

  /* -- PROJECTS -> SKILLS: stay on the right margin, then trace the lower band -- */
  if (projects && skills?.skillsSignal) {
    const signal = skills.skillsSignal;
    const projectRowsGap = projects.projectRows
      .slice(1)
      .map((row, i) => row.y - projects.projectRows[i].y)
      .filter((gap) => gap > 0);
    const smallestRowGap = projectRowsGap.length ? Math.min(...projectRowsGap) : 0;
    const finalProjectRow = projects.projectRows[projects.projectRows.length - 1];
    if (finalProjectRow) {
      b.x = projects.projectThreadX ?? projects.mrX;
      b.y = finalProjectRow.y;
    }
    const handoff = projectHandoff(b.y, smallestRowGap);
    const compactSignal = signal.compact;
    const rightMargin = measureMarginWave(skills, 'right', W);
    const leftMargin = measureMarginWave(skills, 'left', W);
    const turnRadius = Math.min(
      compactSignal ? 36 : 80,
      Math.max(1, (aboutEntryY - signal.y) * 0.9)
    );
    const rightX = rightMargin.centerX;
    const compactMarginClearance = Math.min(
      rightX - skills.contentRight,
      rightX - signal.legendRight
    );
    const rightRoomY = Math.max(0, signal.legendTop - 24 - signal.y);
    const rightTurnRadius = compactSignal
      ? Math.min(
          turnRadius,
          compactMarginClearance >= 16
            ? turnRadius
            : Math.max(0, signal.legendTop - 16 - signal.y)
        )
      : Math.max(
          0,
          Math.min(
            turnRadius,
            compactMarginClearance >= 16
              ? compactMarginClearance - 8
              : rightRoomY
          )
        );
    const leftClearance = Math.max(
      0,
      signal.legendLeft - 16 - leftMargin.centerX
    );
    const leftRoomY = Math.max(0, signal.legendTop - 24 - signal.y);
    const leftTurnRadius = Math.max(
      0,
      Math.min(turnRadius, leftClearance >= 16 ? leftClearance : leftRoomY)
    );
    const leftSignalX = leftMargin.centerX + leftTurnRadius;
    const signalStartY = signal.y - rightTurnRadius;
    const waveStartY = Math.min(
      signalStartY,
      Math.max(handoff.y, b.y + Math.min(120, Math.max(60, 300 * 0.4)))
    );
    const leadDeltaY = Math.max(0, waveStartY - b.y);
    const tangentLength = Math.hypot(handoff.tangentX, handoff.tangentY) || 1;
    const leadHandle = Math.max(1, Math.min(60, rightMargin.amplitude));
    const leadControlX = clamp(
      b.x + (handoff.tangentX / tangentLength) * leadHandle,
      rightMargin.minX,
      rightMargin.maxX
    );
    const leadControlY =
      b.y + (handoff.tangentY / tangentLength) * leadHandle;
    const leadControl2Y =
      waveStartY - Math.max(1, Math.min(80, leadDeltaY * 0.45));
    const marginEntry =
      `M ${round1(b.x)} ${round1(b.y)} ` +
      `C ${round1(leadControlX)} ${round1(leadControlY)}, ` +
      `${round1(rightX)} ${round1(leadControl2Y)} ` +
      `${round1(rightX)} ${round1(waveStartY)} ` +
      `${verticalOscillationPath(
        rightX,
        rightX,
        waveStartY,
        signalStartY,
        rightMargin.amplitude
      )}`;
    b.section = 'skills-section';
    pushPiece(b, 'skills-margin-in', marginEntry, b.y, signalStartY, skills.rightOpacity);
    b.x = rightX;
    b.y = signalStartY;

    const signalPath = compactSignal
      ? `M ${round1(rightX)} ${round1(signalStartY)} ` +
        `${verticalOscillationPath(
          rightX,
          rightX,
          signalStartY,
          signal.y + rightTurnRadius,
          Math.min(rightMargin.amplitude, signal.peakHeight * 0.6)
        )}`
      : (() => {
          const signalStartX = rightX - rightTurnRadius;
          const signalEndX = leftSignalX;
          return (
            `M ${round1(rightX)} ${round1(signalStartY)} ` +
            `C ${round1(rightX)} ${round1(signal.y - rightTurnRadius * 0.35)}, ` +
            `${round1(signalStartX + rightTurnRadius * 0.35)} ${round1(signal.y)} ` +
            `${round1(signalStartX)} ${round1(signal.y)} ` +
            `${signalWavePath(
              signalStartX,
              signalEndX,
              signal.y,
              signal.waveAmplitude,
              signal.peakHeight,
              signal.peakCount,
              signal.sphere,
              signal.legendTop
            )} ` +
            `C ${round1(signalEndX - leftTurnRadius * 0.35)} ${round1(signal.y)}, ` +
            `${round1(leftMargin.centerX)} ${round1(signal.y + leftTurnRadius * 0.65)} ` +
            `${round1(leftMargin.centerX)} ${round1(signal.y + leftTurnRadius)}`
          );
        })();
    pushPiece(
      b,
      'skills-signal',
      signalPath,
      signalStartY,
      signal.y + leftTurnRadius,
      skills.leftOpacity
    );
    b.x = compactSignal ? rightX : leftMargin.centerX;
    b.y = signal.y + (compactSignal ? rightTurnRadius : leftTurnRadius);

    if (about) {
      const aboutStart = aboutRoute?.start ?? { x: about.mlX, y: topBandY(about) };
      const aboutAmplitude = Math.min(
        leftMargin.amplitude,
        aboutRoute?.inwardAmplitude ?? 0
      );
      const aboutExit =
        `M ${round1(b.x)} ${round1(b.y)} ` +
        `${verticalOscillationPath(
          b.x,
          aboutStart.x,
          b.y,
          aboutStart.y,
          aboutAmplitude,
          threadWaveLength(W),
          aboutAmplitude,
          THREAD_WAVE_HARMONIC
        )}`;
      pushPiece(b, 'skills-about-out', aboutExit, b.y, aboutStart.y, skills.leftOpacity);
      b.x = aboutStart.x;
      b.y = aboutStart.y;
    }
  } else if (projects && skills) {
    const signalY = bandCenter(skills, 80);
    b.section = 'skills-section';
    descendTo(b, 'skills-margin-in', skills.mrX, signalY, skills.rightOpacity);
  }

  /* -- SKILLS -> ABOUT: continue from the measured handoff point -- */
  if (skills && about) {
    b.section = 'about-section';
  }

  /* -- ABOUT: scroll-linked S-curve down the measured left margin -- */
  if (about) {
    b.section = 'about-section';
    if (aboutRoute) {
      pushPiece(
        b,
        'about-left-flow',
        aboutRoute.path,
        aboutRoute.scrollStart,
        aboutRoute.scrollEnd,
        about.leftOpacity
      );
      b.x = aboutRoute.end.x;
      b.y = aboutRoute.end.y;
    }
  }

  /* -- ABOUT -> CONSOLE: continue the margin wave behind the certifications card -- */
  if (about && sql) {
    const glideY = sql.top;
    const sqlMarginX = sqlMarginRoute(sql).x;
    // Desktop: dive into the opaque console panel so the handoff to the right
    // corridor stays hidden behind the card instead of parking in the margin.
    const entryX = W >= 1024 ? sql.contentLeft + 80 : sqlMarginX;
    const entryY = W >= 1024 ? sql.contentTop + 70 : glideY;
    b.section = 'sql-section';
    if (b.y < aboutConsoleLeadY) {
      const d =
        `M ${round1(b.x)} ${round1(b.y)} ` +
        verticalOscillationPath(
          b.x,
          b.x,
          b.y,
          aboutConsoleLeadY,
          aboutRoute?.amplitude ?? 0,
          aboutWaveLength(W),
          aboutRoute?.inwardAmplitude ?? 0,
          aboutWaveHarmonic(W)
        );
      pushPiece(
        b,
        'about-sql-desc',
        d,
        b.y,
        aboutConsoleLeadY,
        about.leftOpacity
      );
      b.y = aboutConsoleLeadY;
    }
    descendTo(b, 'about-sql-glide', entryX, entryY, about.leftOpacity, bandSway(sql, entryY));
  }

  /* -- CONSOLE: big scroll-linked S-curve down the free right corridor -- */
  if (sql) {
    b.section = 'sql-section';
    const viewportScale = W < 1024 ? 0.6 : 1;
    const rightCorridor = W >= 1024 ? sqlRightRoute(sql) : null;

    if (rightCorridor) {
      const startY = sql.top + 4;
      const endY = Math.max(
        startY + 120,
        Math.min(sql.contentBottom - 96, sql.bottom - ramp)
      );
      const amplitude = Math.min(
        SQL_RIGHT_AMPLITUDE_CAP * viewportScale,
        rightCorridor.amplitude
      );
      b.x = rightCorridor.x;
      b.y = startY;
      const d =
        `M ${round1(rightCorridor.x)} ${round1(startY)} ` +
        verticalOscillationPath(
          rightCorridor.x,
          rightCorridor.x,
          startY,
          endY,
          amplitude,
          THREAD_WAVE_LENGTH_SQL,
          amplitude,
          THREAD_WAVE_HARMONIC
        );
      pushPiece(b, 'sql-flow', d, startY, endY, sql.rightOpacity);
      b.y = endY;

      // Slip behind the console's right edge so the handoff to the contact
      // side stays hidden inside the opaque cards.
      const tuckY = Math.min(sql.contentBottom - 48, endY + 34);
      const tuck =
        `M ${round1(rightCorridor.x)} ${round1(endY)} ` +
        `C ${round1(rightCorridor.x)} ${round1(endY + (tuckY - endY) * 0.5)}, ` +
        `${round1(sql.contentRight + 40)} ${round1(tuckY)}, ` +
        `${round1(sql.contentRight - 10)} ${round1(tuckY)}`;
      pushPiece(b, 'sql-tuck', tuck, endY, tuckY, sql.rightOpacity);

      b.x = sql.contentLeft - 2;
      b.y = tuckY;
    } else {
      const { x: marginX, amplitude: marginAmplitude } = sqlMarginRoute(sql);
      const startY = b.y;
      const endY = contact
        ? Math.max(startY, Math.min(sql.bottom, topBandY(contact) - ramp))
        : sql.bottom;
      const amplitude = Math.min(90 * viewportScale, marginAmplitude);
      const d =
        `M ${round1(b.x)} ${round1(startY)} ` +
        verticalOscillationPath(
          b.x,
          marginX,
          startY,
          endY,
          amplitude,
          threadWaveLength(W),
          amplitude,
          THREAD_WAVE_HARMONIC
        );
      pushPiece(b, 'sql-flow', d, startY, endY, sql.leftOpacity);
      b.x = marginX;
      b.y = endY;
    }
  }

  /* -- CONSOLE -> CONTACT: emerge at the console's left edge and flow into the footer band -- */
  if (sql && contact) {
    const glideY = topBandY(contact);
    b.section = 'contact-section';
    descendTo(
      b,
      'sql-contact-desc',
      contact.mlX,
      Math.max(b.y, glideY),
      sql.leftOpacity,
      bandSway(contact, glideY)
    );
    descendTo(b, 'sql-contact-glide', contact.mlX, glideY, sql.leftOpacity, bandSway(contact, glideY));
  }

  /* -- CONTACT: check seal in the free band between pills and footer -- */
  if (contact) {
    b.section = 'contact-section';
    const bandTop = contact.contactBandTop;
    const bandBottom = contact.contactBandBottom;
    const marginX = contact.mlX;

    const band = Math.max(0, bandBottom - bandTop);
    const size = Math.min(140, band - 16, contact.leftMargin - 20);

    descendTo(
      b,
      'contact-in',
      marginX,
      bandTop + Math.max(0, (band - size) / 2),
      contact.leftOpacity,
      marginSway(contact, 'left', W)
    );

    if (size >= MIN_FIGURE_PX) {
      const cy = bandTop + (band - size) / 2 + size / 2;
      const motif = sealCheck(marginX, cy, size / 2);
      pushPiece(b, 'contact-seal', motif, cy - size / 2, cy + size / 2, contact.leftOpacity);
      b.x = marginX;
      b.y = cy + size / 2;
    }
  }

  /* -- Final descent along the left margin to the end of the document -- */
  if (contact) {
    const docBottom = Math.max(contact.bottom, document.documentElement.scrollHeight);
    descendTo(b, 'contact-out', contact.mlX, docBottom - 6, contact.leftOpacity, marginSway(contact, 'left', W));
  }

  return b.pieces;
}

/* ------------------------- component ------------------------- */

export const DataAnalystThread: React.FC<{ activeSection: SectionId }> = ({ activeSection }) => {
  const [defs, setDefs] = useState<PieceDef[]>([]);
  const [docHeight, setDocHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const overlayPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const ghostRefs = useRef<(SVGPathElement | null)[]>([]);
  const homeStartMarkerRef = useRef<SVGGElement | null>(null);
  const homeStartMarkerVisibleRef = useRef(false);
  const runsRef = useRef<PieceRun[]>([]);
  const idIndexRef = useRef<Map<string, number>>(new Map());
  const progRef = useRef<number[]>([]);
  const writtenRef = useRef<number[]>([]); // last written progress (skips style churn)
  const animRef = useRef<AnimState | null>(null);
  const pendingRef = useRef<(() => void) | null>(null); // draw start, deferred to scroll settle
  const rangeRef = useRef<{ start: number; end: number }>({ start: 0, end: -1 });
  const prevRangeRef = useRef<{ start: number; end: number } | null>(null);
  const lastAnimatedSectionRef = useRef<string | null>(null);
  const activeSectionElRef = useRef<string>(SECTION_BY_KEY.home);
  const scrollYRef = useRef(0);
  const scrollRangeRef = useRef(1);
  const targetScrollProgressRef = useRef(0);
  const displayedScrollProgressRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const hasMeasuredRef = useRef(false);
  const vhRef = useRef(0);
  const modeRef = useRef<'up' | 'down'>('down');
  const reducedRef = useRef(false);
  const lowEndRef = useRef(false);
  const rafRef = useRef(0);
  const tickRef = useRef<((now: number) => void) | null>(null);
  const hiddenAtRef = useRef(0);
  const lastScrollAtRef = useRef(0);
  const settleTimerRef = useRef(0);
  const secBoundsRef = useRef<Map<string, { top: number; bottom: number }>>(new Map());
  const workMilestonePointsRef = useRef<{ x: number; y: number }[]>([]);
  const workPulseNodesRef = useRef<HTMLElement[]>([]);
  const workNodeProgressRef = useRef<number[]>([]);
  const workNodePassedRef = useRef<boolean[]>([]);
  const workFinalNodeRef = useRef<HTMLElement | null>(null);
  const projectNodeRefs = useRef<(SVGGElement | null)[]>([]);
  const projectNodeProgressRef = useRef<number[]>([]);
  const projectNodePassedRef = useRef<boolean[]>([]);
  const skillsRouteRef = useRef<
    { id: string; length: number; startY: number; endY: number }[]
  >([]);

  const dur = (ms: number) => Math.round(ms * (lowEndRef.current ? 0.7 : 1));

  /* -- Show only the pieces of the active section +/- 1 (cut paint cost) -- */
  const gateRuns = React.useCallback(() => {
    const activeIdx = SECTION_ORDER.indexOf(activeSectionElRef.current);
    const projectsIdx = SECTION_ORDER.indexOf('projects-section');
    for (let i = 0; i < runsRef.current.length; i++) {
      const r = runsRef.current[i];
      const sectionVisible = Math.abs(SECTION_ORDER.indexOf(r.def.section) - activeIdx) <= 1;
      const projectExitVisible =
        r.def.id === 'work-exit' && Math.abs(projectsIdx - activeIdx) <= 1;
      const vis = sectionVisible || projectExitVisible;
      const disp = vis ? '' : 'none';
      const el = pathRefs.current[i];
      if (el && el.style.display !== disp) el.style.display = disp;
      const g = ghostRefs.current[i];
      if (g && g.style.display !== disp) g.style.display = disp;
      const overlay = overlayPathRefs.current[i];
      if (overlay && overlay.style.display !== disp) overlay.style.display = disp;
    }
  }, []);

  const startLoop = React.useCallback(() => {
    if (rafRef.current || document.hidden || typeof tickRef.current !== 'function') return;
    rafRef.current = requestAnimationFrame(tickRef.current);
  }, []);

  /* -- Build (measure + route) -- */
  const rebuild = React.useCallback(() => {
    const secs = measureSections();
    secBoundsRef.current = new Map(secs.map((s) => [s.id, { top: s.top, bottom: s.bottom }]));
    workMilestonePointsRef.current =
      secs.find((s) => s.id === 'work-section')?.workMilestones ?? [];
    const pieces = buildRoute(secs, window.innerWidth);
    const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    scrollRangeRef.current = Math.max(1, docH - window.innerHeight);
    targetScrollProgressRef.current = clamp(
      scrollYRef.current / scrollRangeRef.current,
      0,
      1
    );
    if (!hasMeasuredRef.current) {
      displayedScrollProgressRef.current = round3(targetScrollProgressRef.current);
      hasMeasuredRef.current = true;
    }
    setDocHeight(docH);
    setViewportWidth(window.innerWidth);
    setDefs(pieces);
  }, []);

  /* -- Measure the rendered pieces (cached length + samples, once per piece) -- */
  useLayoutEffect(() => {
    const runs: PieceRun[] = [];
    // keep the progress of the pieces that survive a rebuild (by id)
    const previous = new Map<string, number>();
    runsRef.current.forEach((r, i) => previous.set(r.def.id, progRef.current[i] ?? 0));

    const stride = lowEndRef.current ? 20 : 12;
    const maxSamples = lowEndRef.current ? 120 : 240;

    pathRefs.current.forEach((el, i) => {
      const def = defs[i];
      if (!el || !def) return;
      if (def.rail) {
        runs.push({ def, el, overlayEl: overlayPathRefs.current[i], len: 0, samples: [] });
        return;
      }
      const overlayEl = overlayPathRefs.current[i];
      let len = 0;
      const samples: Sample[] = [];
      try {
        len = el.getTotalLength();
        const count = clamp(Math.round(len / stride), 10, maxSamples);
        for (let s = 0; s <= count; s++) {
          const dist = (len * s) / count;
          const p = el.getPointAtLength(dist);
          samples.push({ dist, x: p.x, y: p.y });
        }
      } catch {
        len = 0;
      }
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      if (overlayEl) {
        overlayEl.style.strokeDasharray = `${len}`;
        overlayEl.style.strokeDashoffset = `${len}`;
      }
      runs.push({ def, el, overlayEl, len, samples });
    });

    runsRef.current = runs;
    idIndexRef.current = new Map(runs.map((r, i) => [r.def.id, i]));
    progRef.current = runs.map((r) => previous.get(r.def.id) ?? 0);
    writtenRef.current = runs.map(() => NaN); // force one style rewrite after rebuild
    workPulseNodesRef.current = Array.from(
      document.querySelectorAll<HTMLElement>('[data-thread-node-pulse]')
    );
    workFinalNodeRef.current = document.querySelector<HTMLElement>('[data-thread-node-final]');
    const workLine = runs.find((r) => r.def.id === 'work-line');
    workNodeProgressRef.current = workLine?.len
      ? workMilestonePointsRef.current.map((target) => {
          let closestDistance = 0;
          let closestGap = Infinity;
          workLine.samples.forEach((sample) => {
            const gap = Math.hypot(sample.x - target.x, sample.y - target.y);
            if (gap < closestGap) {
              closestGap = gap;
              closestDistance = sample.dist;
            }
          });
          return closestDistance / workLine.len;
        })
      : [];
    const workBounds = secBoundsRef.current.get('work-section');
    const viewportHeight = Math.max(1, window.innerHeight);
    const displayedScrollY =
      displayedScrollProgressRef.current * scrollRangeRef.current;
    const initialWorkProgress = reducedRef.current
      ? 1
      : workBounds
        ? clamp(
            (displayedScrollY - (workBounds.top - viewportHeight)) / viewportHeight,
            0,
            1
          )
        : 0;
    workNodePassedRef.current = workNodeProgressRef.current.map(
      (progress) => initialWorkProgress >= progress
    );
    if (workFinalNodeRef.current) {
      workFinalNodeRef.current.style.boxShadow = workNodePassedRef.current[2]
        ? '0 0 18px rgba(255, 62, 0, 0.45)'
        : '';
    }
    const projectExit = runs.find((run) => run.def.id === 'work-exit');
    const projectExitNodes = projectExit?.def.projectNodes ?? [];
    const projectExitLength = projectExit?.len ?? 0;
    const projectExitSamples = projectExit?.samples ?? [];
    projectNodeProgressRef.current =
      projectExitLength > 0 && projectExitNodes.length === 5
        ? projectExitNodes.map((target) => {
          let closestDistance = 0;
          let closestGap = Infinity;
          projectExitSamples.forEach((sample) => {
            const gap = Math.hypot(sample.x - target.x, sample.y - target.y);
            if (gap < closestGap) {
              closestGap = gap;
              closestDistance = sample.dist;
            }
          });
          return closestDistance / projectExitLength;
        })
        : [];
    const initialProjectsProgress = reducedRef.current
      ? 1
      : projectExit
        ? progressAtPathY(
            projectExit,
            displayedScrollY + viewportHeight * THREAD_SCROLL_MARKER_RATIO
          )
        : 0;
    projectNodePassedRef.current = projectNodeProgressRef.current.map(
      (progress) => initialProjectsProgress >= progress
    );
    projectNodeRefs.current.forEach((node, i) => {
      if (node) {
        const passed = projectNodePassedRef.current[i];
        node.style.opacity = passed ? '1' : '0';
        node.setAttribute('transform', passed ? 'scale(1)' : 'scale(0.6)');
      }
    });
    skillsRouteRef.current = runs
      .filter((run) => SKILLS_ROUTE_PIECE_IDS.has(run.def.id))
      .map((run) => ({
        id: run.def.id,
        length: run.len,
        startY: run.def.a0,
        endY: run.def.a1,
      }));
    gateRuns();
    startLoop();
  }, [defs, gateRuns, startLoop]);

  /* -- Setup: measure, observe, recalculate (debounced + rAF-coalesced) -- */
  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    lowEndRef.current = (navigator.hardwareConcurrency || 8) <= 4;
    vhRef.current = window.innerHeight;

    let rafId = 0;
    let debounceT = 0;
    const scheduleRebuild = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        rebuild();
      });
    };
    const debouncedRebuild = () => {
      if (debounceT) clearTimeout(debounceT);
      debounceT = window.setTimeout(() => {
        debounceT = 0;
        scheduleRebuild();
      }, RESIZE_DEBOUNCE_MS);
    };
    const cacheVh = () => {
      vhRef.current = window.innerHeight;
    };

    scrollYRef.current = window.scrollY || window.pageYOffset;
    debouncedRebuild();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(debouncedRebuild);
    }

    let resizeObs: ResizeObserver | null = null;
    try {
      resizeObs = new ResizeObserver(debouncedRebuild);
      resizeObs.observe(document.body);
    } catch {
      /* no observer support */
    }

    window.addEventListener('resize', debouncedRebuild, { passive: true });
    window.addEventListener('resize', cacheVh, { passive: true });
    window.addEventListener('load', debouncedRebuild);

    return () => {
      clearTimeout(debounceT);
      if (rafId) cancelAnimationFrame(rafId);
      resizeObs?.disconnect();
      window.removeEventListener('resize', debouncedRebuild);
      window.removeEventListener('resize', cacheVh);
      window.removeEventListener('load', debouncedRebuild);
    };
  }, [rebuild]);

  /* -- Single rAF loop: time-based progress -> straight DOM writes -- */
  useEffect(() => {
    let perfAccum = 0;
    let perfFrames = 0;

    const tick = (now: number) => {
      rafRef.current = 0;
      const t0 = performance.now();
      const runs = runsRef.current;
      const prog = progRef.current;
      const written = writtenRef.current;
      let busy = false;

      if (runs.length && prog.length === runs.length) {
        const previousFrameTime = lastFrameTimeRef.current;
        const dt = previousFrameTime === null ? 0 : (now - previousFrameTime) / 1000;
        lastFrameTimeRef.current = now;
        const targetScrollProgress = targetScrollProgressRef.current;
        const currentScrollProgress = displayedScrollProgressRef.current;
        const scrollDifference = targetScrollProgress - currentScrollProgress;
        const displayedScrollProgress = reducedRef.current
          ? round3(targetScrollProgress)
          : Math.abs(scrollDifference) < 0.0005
            ? round3(targetScrollProgress)
            : round3(
                currentScrollProgress +
                  scrollDifference *
                    (1 - Math.exp(-dt / (modeRef.current === 'up' ? 0.12 : 0.08)))
              );
        displayedScrollProgressRef.current = displayedScrollProgress;
        if (
          !reducedRef.current &&
          Math.abs(targetScrollProgress - displayedScrollProgress) >= 0.0005
        ) {
          busy = true;
        }

        // 1. Time-based animations (rAF timestamp -> same duration at 60/120 Hz)
        const anim = animRef.current;
        const animated: Record<number, boolean> = {};
        if (anim) {
          const t = now - anim.start;
          let done = true;
          for (const tg of anim.targets) {
            const idx = idIndexRef.current.get(tg.id);
            if (idx === undefined) continue; // piece vanished: ignore, don't hang
            const p = clamp((t - tg.delay) / Math.max(1, tg.duration), 0, 1);
            if (p < 1) done = false;
            const eased = tg.ease === 'inout' ? easeInOutCubic(p) : easeOutCubic(p);
            prog[idx] = tg.from + (tg.to - tg.from) * eased;
            animated[idx] = true;
          }
          animRef.current = done ? null : anim;
          if (!done) busy = true;
        }

        // 2. Targets: going down the thread draws itself section by section,
        //    going up it follows the visitor back (scroll linked).
        const sy = displayedScrollProgress * scrollRangeRef.current;
        const cut = sy + vhRef.current * 0.45;
        const threadScrollY =
          sy + vhRef.current * THREAD_SCROLL_MARKER_RATIO;
        const goingUp = modeRef.current === 'up';
        const range = rangeRef.current;

        const figureIdx = idIndexRef.current.get(HOME_FIGURE_ID) ?? -1;
        const checkIdx = idIndexRef.current.get(HOME_CHECK_ID) ?? -1;

        const homeStartMarker = homeStartMarkerRef.current;
        const homeFigureAnimation = animRef.current?.targets.some(
          (target) => target.id === HOME_FIGURE_ID && target.to === 1
        );
        const homeStartMarkerVisible = reducedRef.current
          ? figureIdx >= 0 && prog[figureIdx] >= 1
          : figureIdx >= 0 && (prog[figureIdx] > 0 || !!homeFigureAnimation);
        if (
          homeStartMarker &&
          homeStartMarkerVisible !== homeStartMarkerVisibleRef.current
        ) {
          homeStartMarker.style.transition = reducedRef.current
            ? 'none'
            : 'opacity 200ms ease, transform 200ms ease';
          homeStartMarker.style.opacity = homeStartMarkerVisible ? '1' : '0';
          homeStartMarker.style.transform = homeStartMarkerVisible
            ? 'scale(1)'
            : 'scale(0.6)';
          homeStartMarkerVisibleRef.current = homeStartMarkerVisible;
        }

        // Work fills from viewport entry until the measured 2026 node reaches the scroll marker.
        const wb = secBoundsRef.current.get('work-section');
        let workProg = -1;
        if (wb && wb.bottom > wb.top) {
          const wStart = wb.top - vhRef.current;
          const finalMilestoneY = workMilestonePointsRef.current[2]?.y;
          const wEnd =
            finalMilestoneY === undefined
              ? wb.top
              : finalMilestoneY - vhRef.current * THREAD_SCROLL_MARKER_RATIO;
          const targetScrollY = targetScrollProgress * scrollRangeRef.current;
          workProg =
            finalMilestoneY !== undefined &&
            targetScrollY + vhRef.current * THREAD_SCROLL_MARKER_RATIO >= finalMilestoneY
              ? 1
              : clamp((sy - wStart) / Math.max(1, wEnd - wStart), 0, 1);
        }
        const projectRouteIndex = idIndexRef.current.get('work-exit');
        const projectRoute =
          projectRouteIndex === undefined ? undefined : runs[projectRouteIndex];
        let workExitProgress = projectRoute
          ? progressAtPathY(projectRoute, threadScrollY)
          : 0;
        if (reducedRef.current && workProg >= 0) workProg = 1;
        if (reducedRef.current) workExitProgress = 1;
        const workLineProgress = workProg < 0 ? 0 : workProg;

        for (let i = 0; i < runs.length; i++) {
          const run = runs[i];
          if (animated[i]) continue;
          // the Home figure and its check run on their own timed animation
          if (i === figureIdx || i === checkIdx) continue;
          const def = run.def;
          if (def.section === 'work-section' && workProg >= 0) {
            let target: number | null = null;
            if (def.id === 'work-line') {
              target = workLineProgress;
            } else if (def.id === 'work-exit') {
              target = workExitProgress;
            }

            if (target !== null) {
              const distance = Math.abs(target - prog[i]);
              if ((target === 0 || target === 1) ? distance > 0 : distance > 0.001) {
                prog[i] = target;
                busy = true;
              }
              continue;
            }
          }
          if (SKILLS_ROUTE_PIECE_IDS.has(def.id)) {
            const routePiece = skillsRouteRef.current.find(
              (piece) => piece.id === def.id
            );
            const target =
              routePiece && routePiece.length > 0
                ? reducedRef.current
                  ? 1
                  : progressAtY(threadScrollY, routePiece.startY, routePiece.endY)
                : 0;
            if (Math.abs(target - prog[i]) > 0.001) {
              prog[i] = round3(target);
              busy = true;
            }
            continue;
          }
          if (ABOUT_ROUTE_PIECE_IDS.has(def.id) || SQL_ROUTE_PIECE_IDS.has(def.id)) {
            const target =
              reducedRef.current
                ? 1
                : progressAtY(threadScrollY, def.a0, def.a1);
            if (Math.abs(target - prog[i]) > 0.001) {
              prog[i] = round3(target);
              busy = true;
            }
            continue;
          }
          const target = goingUp
            ? clamp((cut - def.a0) / Math.max(1, def.a1 - def.a0), 0, 1)
            : i <= range.end
            ? 1
            : 0;
          if (Math.abs(target - prog[i]) > 0.001) {
            prog[i] = round3(target);
            busy = true;
          }
        }

        if (workProg >= 0) {
          workNodeProgressRef.current.forEach((threshold, i) => {
            const passed = workLineProgress >= threshold;
            if (passed === workNodePassedRef.current[i]) return;

            if (passed && !reducedRef.current) {
              workPulseNodesRef.current[i]?.animate(
                [{ scale: '1' }, { scale: '1.2' }, { scale: '1' }],
                { duration: 400, easing: 'ease-in-out' }
              );
            }
            if (i === 2 && workFinalNodeRef.current) {
              workFinalNodeRef.current.style.boxShadow = passed
                ? '0 0 18px rgba(255, 62, 0, 0.45)'
                : '';
            }
            workNodePassedRef.current[i] = passed;
          });
        }

        if (projectRoute) {
          projectNodeProgressRef.current.forEach((threshold, i) => {
            const passed = workExitProgress >= threshold;
            if (passed === projectNodePassedRef.current[i]) return;

            const node = projectNodeRefs.current[i];
            if (node) {
              node.style.opacity = passed ? '1' : '0';
              node.setAttribute('transform', passed ? 'scale(1)' : 'scale(0.6)');
              if (passed && !reducedRef.current) {
                node.animate(
                  [{ scale: '1' }, { scale: '1.25' }, { scale: '1' }],
                  { duration: 300, easing: 'ease-in-out' }
                );
              }
            }
            projectNodePassedRef.current[i] = passed;
          });
        }

        // The check appears inside the lens once the magnifier is finished
        if (figureIdx >= 0 && checkIdx >= 0 && !animated[checkIdx]) {
          const checkSpan = HOME_CHECK_DURATION_MS / HOME_FIGURE_DURATION_MS;
          prog[checkIdx] = clamp((prog[figureIdx] - (1 - checkSpan)) / checkSpan, 0, 1);
        }

        // 3. DOM writes: dashoffset only when the value changed (no reflow)
        for (let i = 0; i < runs.length; i++) {
          const run = runs[i];
          const p = round3(prog[i]);
          if (run.el && run.len > 0) {
            if (!Number.isFinite(written[i]) || Math.abs(written[i] - p) > 0.001) {
              const offset = `${run.len * (1 - p)}`;
              run.el.style.strokeDashoffset = offset;
              if (run.overlayEl) run.overlayEl.style.strokeDashoffset = offset;
              written[i] = p;
            }
          }
        }

      }

      const cost = performance.now() - t0;
      perfAccum += cost;
      perfFrames++;
      if (perfFrames >= 30) {
        (window as unknown as Record<string, unknown>).__threadPerf = {
          avgMs: perfAccum / perfFrames,
          samples: perfFrames,
        };
        if ((window as unknown as Record<string, unknown>).__threadDebug) {
          (window as unknown as Record<string, unknown>).__threadDebug = {
            mode: modeRef.current,
            range: { ...rangeRef.current },
            scrollY: Math.round(scrollYRef.current),
            pieces: runs.map((r, i) => ({
              id: r.def.id,
              sec: r.def.section,
              p: Math.round(prog[i] * 100) / 100,
            })),
          };
        }
        perfAccum = 0;
        perfFrames = 0;
      }

      if (busy) startLoop(); // idle -> the loop stops until something changes
      else lastFrameTimeRef.current = null;
    };

    tickRef.current = tick;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [startLoop]);

  /* -- Timed figure draws start after the scroll settles; scroll-linked
        sections keep their progress tied to the measured route instead. -- */
  useEffect(() => {
    const elId = SECTION_BY_KEY[activeSection];
    activeSectionElRef.current = elId;
    gateRuns();

    const runs = runsRef.current;
    if (!runs.length || progRef.current.length !== runs.length) return;
    if (!runs.some((r) => r.def.section === elId)) return;

    // A re-measure (resize / fonts) must not restart a running animation;
    // an active section change always passes this guard and restarts.
    if (lastAnimatedSectionRef.current === elId) return;

    const prev = prevRangeRef.current;
    lastAnimatedSectionRef.current = elId;

    const startSequence = () => {
      const runsNow = runsRef.current;
      const progNow = progRef.current;
      if (!runsNow.length || progNow.length !== runsNow.length) return;

      const idxsNow: number[] = [];
      runsNow.forEach((r, i) => {
        if (r.def.section === elId) idxsNow.push(i);
      });
      if (!idxsNow.length) return;
      const startNow = idxsNow[0];
      const endNow = idxsNow[idxsNow.length - 1];
      rangeRef.current = { start: startNow, end: endNow };
      prevRangeRef.current = { start: startNow, end: endNow };

      const fi = idIndexRef.current.get(HOME_FIGURE_ID) ?? -1;

      if (reducedRef.current) {
        // static: only this section fully drawn, no timed animation
        runsNow.forEach((_, i) => {
          progNow[i] = i >= startNow && i <= endNow ? 1 : 0;
        });
        animRef.current = null;
        startLoop();
        return;
      }

      if (elId === 'hero-section') {
        // the figure is drawn ONCE and kept: an animation that already owns
        // it is left untouched, a frozen mid-draw resumes where it stopped,
        // a finished figure stays static (never retracts, never fades)
        if (fi >= 0) {
          const running = animRef.current?.targets.some(
            (tg) => tg.id === HOME_FIGURE_ID && tg.to === 1
          );
          if (!running) {
            const from = clamp(progNow[fi], 0, 1);
            if (from < 0.999) {
              animRef.current = {
                start: performance.now(),
                targets: [
                  {
                    id: HOME_FIGURE_ID,
                    delay: from > 0.001 ? 100 : dur(HOME_FIGURE_DELAY_MS),
                    duration: dur(HOME_FIGURE_DURATION_MS),
                    from,
                    to: 1,
                    ease: 'inout',
                  },
                ],
              };
            }
          }
        }
        startLoop();
        return;
      }

      if (elId === 'work-section') {
        // Work is scroll-linked: no timed sequence, the line follows the
        // scroll; symbols fire on their own once their gate piece completes
        for (let i = endNow + 1; i < progNow.length; i++) progNow[i] = 0;
        startLoop();
        return;
      }

      // going up: the thread follows the visitor back (scroll linked in tick)
      const movingDown = !prev || startNow > prev.start;
      if (!movingDown) {
        startLoop();
        return;
      }

      // going down: this section draws itself, everything below is hidden
      for (let i = endNow + 1; i < progNow.length; i++) progNow[i] = 0;

      const timedIdxsNow = idxsNow.filter(
        (i) => !SCROLL_LINKED_PIECE_IDS.has(runsNow[i].def.id)
      );
      if (!timedIdxsNow.length) {
        animRef.current = null;
        startLoop();
        return;
      }

      const targets: AnimState['targets'] = timedIdxsNow.map((i, k) => ({
        id: runsNow[i].def.id,
        delay: k * (dur(PIECE_DRAW_MS) + PIECE_GAP_MS),
        duration: dur(PIECE_DRAW_MS),
        from: clamp(progNow[i], 0, 1),
        to: 1,
      }));

      animRef.current = { start: performance.now(), targets };
      startLoop();
    };

    // cancel whatever was queued and wait for the scroll to settle
    animRef.current = null;
    pendingRef.current = startSequence;
    if (performance.now() - lastScrollAtRef.current > SCROLL_SETTLE_MS) {
      pendingRef.current = null;
      startSequence();
    }
  }, [activeSection, defs, gateRuns, startLoop]);

  /* -- Scroll direction + settle + visibility (all passive listeners) -- */
  useEffect(() => {
    let last = window.scrollY || window.pageYOffset;
    let downAccum = 0;

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      const delta = y - last;
      last = y;
      scrollYRef.current = y;
      targetScrollProgressRef.current = clamp(
        y / scrollRangeRef.current,
        0,
        1
      );
      lastScrollAtRef.current = performance.now();

      if (delta < -1) {
        modeRef.current = 'up';
        downAccum = 0;
        // Going up: sequential draw-ins are cancelled so the thread follows
        // the visitor back — EXCEPT the Home figure (owns its own timing).
        const a = animRef.current;
        if (a && !a.targets.some((tg) => tg.id === HOME_FIGURE_ID))
          animRef.current = null;
      } else if (delta > 1) {
        downAccum += delta;
        // hysteresis: only switch back to "down" after a clear downward move,
        // so small direction changes do not make the thread jump
        if (downAccum > 140) modeRef.current = 'down';
      }

      // deferred draw start: runs once the scroll has been quiet for a moment
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = 0;
        const startIt = pendingRef.current;
        if (startIt) {
          pendingRef.current = null;
          startIt();
        }
      }, SCROLL_SETTLE_MS);

      // Scroll-linked routes need frames while the user moves.
      startLoop();
    };

    const onVisibility = () => {
      if (document.hidden) {
        hiddenAtRef.current = performance.now();
        lastFrameTimeRef.current = null;
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      } else {
        // pause, don't skip: shift the animation start by the hidden time
        if (animRef.current && hiddenAtRef.current) {
          animRef.current.start += performance.now() - hiddenAtRef.current;
        }
        lastFrameTimeRef.current = null;
        startLoop();
      }
    };

    scrollYRef.current = last;
    targetScrollProgressRef.current = clamp(
      last / scrollRangeRef.current,
      0,
      1
    );
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [startLoop]);

  const homeFigureStart = defs.find((def) => def.id === HOME_FIGURE_ID)?.figureStart;
  const projectRoute = defs.find(
    (def) => def.id === 'work-exit' && def.projectNodes?.length === 5
  );
  const activeSectionIndex = SECTION_ORDER.indexOf(SECTION_BY_KEY[activeSection]);
  const showProjectMarkers =
    SECTION_ORDER.indexOf('projects-section') === activeSectionIndex;

  return (
    <>
      {/* 1. The thread itself: above the section backgrounds, below the content */}
      <div
        className="absolute top-0 left-0 w-full pointer-events-none"
        data-thread-layer="path"
        style={{
          height: docHeight ? `${docHeight}px` : '100%',
          zIndex: 1,
          contain: 'layout paint',
          willChange: 'transform',
        }}
        aria-hidden="true"
      >
        <svg
          width={viewportWidth || undefined}
          height={docHeight || undefined}
          fill="none"
          style={{
            display: 'block',
            contain: 'layout paint',
            willChange: 'transform',
          }}
        >
          {defs.map((def, i) => (
            <path
              key={`g-${def.id}-${i}`}
              ref={(el) => {
                ghostRefs.current[i] = el;
              }}
              d={def.d}
              stroke={THREAD_COLOR}
              strokeWidth={1}
              strokeOpacity={
                def.rail ||
                def.section === 'work-section' ||
                ABOUT_ROUTE_PIECE_IDS.has(def.id) ||
                SQL_ROUTE_PIECE_IDS.has(def.id)
                  ? 0
                  : 0.05
              }
              strokeDasharray="4 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {defs.map((def, i) => (
            <path
              key={def.id + i}
              data-thread-piece={def.id}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={def.d}
              stroke={def.rail ? '#fff' : THREAD_COLOR}
              strokeWidth={def.width ?? 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeOpacity={def.rail ? 0.1 : undefined}
              opacity={def.rail ? 1 : def.opacity}
            />
          ))}
          {homeFigureStart && (
            <g
              transform={`translate(${round1(homeFigureStart.x)} ${round1(homeFigureStart.y)})`}
              pointerEvents="none"
              data-thread-start-marker
            >
              <g
                ref={homeStartMarkerRef}
                transform="scale(0.6)"
                opacity={0}
                style={{
                  transition: 'opacity 200ms ease, transform 200ms ease',
                }}
              >
                <circle r={5} fill="none" stroke={THREAD_COLOR} strokeWidth={2} />
                <circle r={1.5} fill={THREAD_COLOR} />
              </g>
            </g>
          )}
          {projectRoute?.projectNodes?.map((node, i) => (
            <g
              key={`project-node-${i}`}
              transform={`translate(${round1(node.x)} ${round1(node.y)})`}
              pointerEvents="none"
              data-thread-project-node={i + 1}
              style={{ display: showProjectMarkers ? undefined : 'none' }}
            >
              <g
                ref={(el) => {
                  projectNodeRefs.current[i] = el;
                }}
                transform="scale(0.6)"
                opacity={0}
              >
                <circle r={3.5} fill="#f4f1ea" />
                <circle r={4} fill="none" stroke={THREAD_COLOR} strokeWidth={2} />
                <circle r={1.5} fill={THREAD_COLOR} />
              </g>
            </g>
          ))}
        </svg>
      </div>
      <div
        className="absolute top-0 left-0 w-full pointer-events-none"
        data-thread-layer="skills-overlay"
        style={{
          height: docHeight ? `${docHeight}px` : '100%',
          zIndex: 3,
          contain: 'layout paint',
        }}
        aria-hidden="true"
      >
        <svg
          width={viewportWidth || undefined}
          height={docHeight || undefined}
          fill="none"
          style={{ display: 'block' }}
        >
          {defs.map((def, i) =>
            def.id === 'skills-signal' ? (
              <path
                key={`${def.id}-${i}`}
                ref={(el) => {
                  overlayPathRefs.current[i] = el;
                }}
                data-thread-skills-signal
                d={def.d}
                stroke={THREAD_COLOR}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null
          )}
        </svg>
      </div>
    </>
  );
};
