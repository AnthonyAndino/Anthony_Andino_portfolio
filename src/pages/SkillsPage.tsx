import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { usePortfolioData } from '../i18n/usePortfolioData';
import { ArrowRight } from '../components/Icons';

interface SkillsPageProps {
  onOpenQuery: (query: string) => void;
}

// Display labels for clean visual presentation (Max 20 chars for drawing)
export const SKILL_DISPLAY_LABELS: Record<string, string> = {
  'Soporte Técnico Especializado': 'Soporte Técnico',
  'Comunicación Interdisciplinaria': 'Comunicación',
  'Validación y Limpieza de Datos': 'Validación y Limpieza',
  'Inglés (B1 - Intermedio)': 'Inglés (B1)',
  'Resolución de Incidencias': 'Incidencias',
  'Auditoría de Registros': 'Auditoría',
  'Procedimientos Almacenados (Stored Procedures)': 'Stored Procedures',
};

// 3D Sphere Node Definition
interface SphereNode {
  id: string;
  isHub: boolean;
  isCore: boolean;
  catId: number;
  name: string;
  displayLabel: string;
  code?: string;
  nivel: 'Avanzado' | 'Intermedio' | 'Fundacional';
  tipo?: string;
  // Unit vector on sphere (x, y, z)
  baseVec: [number, number, number];
  expandedVec: [number, number, number];
  labelAnchorSide: 'right' | 'left' | 'center';
  // Runtime projection data
  projX: number;
  projY: number;
  projZ: number;
  projScale: number;
  projR: number;
  opacity: number;
}

const GOLDEN_ANGLE = 2.3999632; // ~137.5 degrees

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// 3D Math Helper Functions
function quatNormalize(q: [number, number, number, number]): [number, number, number, number] {
  const len = Math.hypot(q[0], q[1], q[2], q[3]);
  if (len < 0.00001) return [0, 0, 0, 1];
  return [q[0] / len, q[1] / len, q[2] / len, q[3] / len];
}

function quatMultiply(
  q1: [number, number, number, number],
  q2: [number, number, number, number]
): [number, number, number, number] {
  return [
    q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1],
    q1[3] * q2[1] - q1[0] * q2[2] + q1[1] * q2[3] + q1[2] * q2[0],
    q1[3] * q2[2] + q1[0] * q2[1] - q1[1] * q2[0] + q1[2] * q2[3],
    q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2],
  ];
}

function quatFromAxisAngle(
  axis: [number, number, number],
  angle: number
): [number, number, number, number] {
  const half = angle * 0.5;
  const s = Math.sin(half);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(half)];
}

function quatFromUnitVectors(
  vFrom: [number, number, number],
  vTo: [number, number, number]
): [number, number, number, number] {
  const dot = vFrom[0] * vTo[0] + vFrom[1] * vTo[1] + vFrom[2] * vTo[2];
  if (dot < -0.999999) {
    let axis: [number, number, number] = [0, 1, 0];
    if (Math.abs(vFrom[1]) > 0.85) axis = [1, 0, 0];
    return [axis[0], axis[1], axis[2], 0];
  }
  const cx = vFrom[1] * vTo[2] - vFrom[2] * vTo[1];
  const cy = vFrom[2] * vTo[0] - vFrom[0] * vTo[2];
  const cz = vFrom[0] * vTo[1] - vFrom[1] * vTo[0];
  return quatNormalize([cx, cy, cz, 1 + dot]);
}

function quatRotateVec(
  q: [number, number, number, number],
  v: [number, number, number]
): [number, number, number] {
  const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  const x = v[0], y = v[1], z = v[2];
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  return [
    ix * qw + iw * -qx + iy * -qz - iz * -qy,
    iy * qw + iw * -qy + iz * -qx - ix * -qz,
    iz * qw + iw * -qz + ix * -qy - iy * -qx,
  ];
}

function quatSlerp(
  qa: [number, number, number, number],
  qb: [number, number, number, number],
  t: number
): [number, number, number, number] {
  let cosHalfTheta = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];
  let qbCopy = [...qb] as [number, number, number, number];
  if (cosHalfTheta < 0) {
    qbCopy = [-qb[0], -qb[1], -qb[2], -qb[3]];
    cosHalfTheta = -cosHalfTheta;
  }
  if (Math.abs(cosHalfTheta) >= 1.0) return qa;
  const halfTheta = Math.acos(cosHalfTheta);
  const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
  if (Math.abs(sinHalfTheta) < 0.001) {
    return [
      qa[0] * 0.5 + qbCopy[0] * 0.5,
      qa[1] * 0.5 + qbCopy[1] * 0.5,
      qa[2] * 0.5 + qbCopy[2] * 0.5,
      qa[3] * 0.5 + qbCopy[3] * 0.5,
    ];
  }
  const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
  const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
  return [
    qa[0] * ratioA + qbCopy[0] * ratioB,
    qa[1] * ratioA + qbCopy[1] * ratioB,
    qa[2] * ratioA + qbCopy[2] * ratioB,
    qa[3] * ratioA + qbCopy[3] * ratioB,
  ];
}

function normalizeVec(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len < 0.00001) return [0, 0, 1];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function crossVec(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// Screen Space Hit-Testing for All Nodes (front and back)
function findHitNode(
  nodes: SphereNode[],
  mouseX: number,
  mouseY: number,
  isTouch: boolean
): SphereNode | null {
  const hubRadius = isTouch ? 22 : 18;
  const skillRadius = isTouch ? 16 : 12;

  const candidates: { node: SphereNode; dist: number }[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const threshold = n.isHub ? hubRadius : skillRadius;
    const dist = Math.hypot(mouseX - n.projX, mouseY - n.projY);
    if (dist <= threshold) {
      candidates.push({ node: n, dist });
    }
  }

  if (candidates.length === 0) return null;

  // Prioritization rule:
  // 1. Hub over skill
  // 2. Closest to cursor in screen space
  // 3. Closest to camera (higher projZ)
  candidates.sort((a, b) => {
    if (a.node.isHub && !b.node.isHub) return -1;
    if (!a.node.isHub && b.node.isHub) return 1;
    if (Math.abs(a.dist - b.dist) > 0.01) return a.dist - b.dist;
    return b.node.projZ - a.node.projZ;
  });

  return candidates[0].node;
}

// 8-Sector Shuffled Bag for Random Deselection Rotation (differing >= 60° without immediate repetition)
class DirectionBag {
  private bag: number[] = [];
  private lastAngle: number = 0;

  constructor(initialAngle: number = 0) {
    this.lastAngle = initialAngle;
  }

  private shuffle(arr: number[]): number[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private refill() {
    this.bag = this.shuffle([0, 1, 2, 3, 4, 5, 6, 7]);
  }

  public nextDirection(): [number, number, number] {
    if (this.bag.length === 0) {
      this.refill();
    }

    let chosenIdx = -1;
    let chosenAngle = 0;

    for (let i = 0; i < this.bag.length; i++) {
      const sector = this.bag[i];
      const baseAngle = sector * (Math.PI / 4);
      const jitter = (Math.random() - 0.5) * (14 * Math.PI / 180);
      const angle = (baseAngle + jitter + 2 * Math.PI) % (2 * Math.PI);
      const diff = Math.min(
        Math.abs(angle - this.lastAngle),
        2 * Math.PI - Math.abs(angle - this.lastAngle)
      );
      if (diff >= (60 * Math.PI / 180)) {
        chosenIdx = i;
        chosenAngle = angle;
        break;
      }
    }

    if (chosenIdx === -1) {
      let maxDiff = -1;
      let bestIdx = 0;
      let bestAngle = 0;
      for (let i = 0; i < this.bag.length; i++) {
        const sector = this.bag[i];
        const angle = (sector * (Math.PI / 4) + 2 * Math.PI) % (2 * Math.PI);
        const diff = Math.min(
          Math.abs(angle - this.lastAngle),
          2 * Math.PI - Math.abs(angle - this.lastAngle)
        );
        if (diff > maxDiff) {
          maxDiff = diff;
          bestIdx = i;
          bestAngle = angle;
        }
      }
      chosenIdx = bestIdx;
      if (maxDiff < (60 * Math.PI / 180)) {
        chosenAngle = (this.lastAngle + Math.PI / 3 + Math.random() * 0.1) % (2 * Math.PI);
      } else {
        chosenAngle = bestAngle;
      }
    }

    this.bag.splice(chosenIdx, 1);
    this.lastAngle = chosenAngle;

    return [Math.sin(chosenAngle), Math.cos(chosenAngle), 0];
  }
}

export const SkillsPage: React.FC<SkillsPageProps> = ({ onOpenQuery }) => {
  const { t, tx } = useLanguage();
  const { PORTFOLIO_DB, CORE_SKILLS, RELATED_SKILLS } = usePortfolioData();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgDotsRef = useRef<SVGGElement | null>(null);

  // Selected Category State
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Tab-accessible hub 2D screen positions (updated directly in RAF, zero React re-render)
  const hubButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Category mapping
  const selectedCategory = useMemo(() => {
    if (!selectedCatId) return null;
    return PORTFOLIO_DB.habilidades.find((c) => c.id === selectedCatId) || null;
  }, [selectedCatId]);

  // Generate 3D Spherical Node Mesh on exact surface of unit sphere (Golden Angle Cap)
  const nodes = useMemo<SphereNode[]>(() => {
    // 6 Octahedron Hub Vertices
    const hubUnitVectors: [number, number, number][] = [
      [0, 0, 1],   // 1 DATA (+Z, facing user)
      [1, 0, 0],   // 2 DB (+X, right)
      [0, 1, 0],   // 3 PROG (+Y, top)
      [-1, 0, 0],  // 4 TOOLS (-X, left)
      [0, -1, 0],  // 5 SOFT (-Y, bottom)
      [0, 0, -1],  // 6 LANG (-Z, back)
    ];

    const result: SphereNode[] = [];

    PORTFOLIO_DB.habilidades.forEach((cat, idx) => {
      const hubVec = hubUnitVectors[idx];
      let up: [number, number, number] = [0, 1, 0];
      if (Math.abs(hubVec[1]) > 0.85) up = [1, 0, 0];
      const u = normalizeVec(crossVec(hubVec, up));
      const v = crossVec(hubVec, u);

      // Hub Node
      result.push({
        id: `hub-${cat.id}`,
        isHub: true,
        isCore: false,
        catId: cat.id,
        name: cat.categoria,
        displayLabel: cat.categoria,
        code: `0${cat.id} · ${cat.tipo.toUpperCase()}`,
        nivel: cat.nivel,
        tipo: cat.tipo,
        baseVec: hubVec,
        expandedVec: hubVec,
        labelAnchorSide: 'center',
        projX: 0,
        projY: 0,
        projZ: 0,
        projScale: 1,
        projR: 14,
        opacity: 1,
      });

      // Skills on spherical surface within an angular cap (Fibonacci / Golden angle spiral)
      const count = cat.habilidades.length;
      const maxAngleRad = 26 * (Math.PI / 180); // 26° cap keeps skills tightly clustered around hub
      const cosMax = Math.cos(maxAngleRad);
      const qTarget = quatFromUnitVectors(hubVec, [0, 0, 1]);

      cat.habilidades.forEach((skill, sIdx) => {
        const t = (sIdx + 0.5) / count;
        // Area-preserving cap transformation
        const cosTheta = 1 - t * (1 - cosMax);
        const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
        const phi = sIdx * GOLDEN_ANGLE;

        const sVec: [number, number, number] = [
          cosTheta * hubVec[0] + sinTheta * (Math.cos(phi) * u[0] + Math.sin(phi) * v[0]),
          cosTheta * hubVec[1] + sinTheta * (Math.cos(phi) * u[1] + Math.sin(phi) * v[1]),
          cosTheta * hubVec[2] + sinTheta * (Math.cos(phi) * u[2] + Math.sin(phi) * v[2]),
        ];

        // Expanded cap (~48° outwards around hub for selected category)
        let expVec: [number, number, number];
        if (count <= 6) {
          const thetaExp = 46 * (Math.PI / 180);
          const phiExp = (sIdx / count) * 2 * Math.PI;
          expVec = [
            Math.cos(thetaExp) * hubVec[0] + Math.sin(thetaExp) * (Math.cos(phiExp) * u[0] + Math.sin(phiExp) * v[0]),
            Math.cos(thetaExp) * hubVec[1] + Math.sin(thetaExp) * (Math.cos(phiExp) * u[1] + Math.sin(phiExp) * v[1]),
            Math.cos(thetaExp) * hubVec[2] + Math.sin(thetaExp) * (Math.cos(phiExp) * u[2] + Math.sin(phiExp) * v[2]),
          ];
        } else {
          // Two concentric rings for PROG (10 skills): 4 inner at 26°, 6 outer at 48°
          const isInner = sIdx < 4;
          const thetaExp = (isInner ? 26 : 48) * (Math.PI / 180);
          const ringCount = isInner ? 4 : 6;
          const ringIdx = isInner ? sIdx : sIdx - 4;
          const phiOffset = isInner ? 0 : Math.PI / 6;
          const phiExp = (ringIdx / ringCount) * 2 * Math.PI + phiOffset;
          expVec = [
            Math.cos(thetaExp) * hubVec[0] + Math.sin(thetaExp) * (Math.cos(phiExp) * u[0] + Math.sin(phiExp) * v[0]),
            Math.cos(thetaExp) * hubVec[1] + Math.sin(thetaExp) * (Math.cos(phiExp) * u[1] + Math.sin(phiExp) * v[1]),
            Math.cos(thetaExp) * hubVec[2] + Math.sin(thetaExp) * (Math.cos(phiExp) * u[2] + Math.sin(phiExp) * v[2]),
          ];
        }

        // Canonical screen orientation when the category faces front:
        // Skills on the right half of the starburst anchor to the right;
        // skills on the left half anchor to the left, guaranteeing outward radiating labels
        // with zero collision between opposite nodes.
        const rotVec = quatRotateVec(qTarget, expVec);
        const isRight = rotVec[0] >= 0;

        result.push({
          id: `skill-${cat.id}-${sIdx}`,
          isHub: false,
          isCore: CORE_SKILLS.has(skill),
          catId: cat.id,
          name: skill,
          displayLabel: SKILL_DISPLAY_LABELS[skill] || skill,
          nivel: cat.nivel,
          baseVec: normalizeVec(sVec), // Exactly length 1.0 on sphere surface
          expandedVec: normalizeVec(expVec),
          labelAnchorSide: isRight ? 'right' : 'left',
          projX: 0,
          projY: 0,
          projZ: 0,
          projScale: 1,
          projR: 4,
          opacity: 0,
        });
      });
    });

    return result;
  }, []);

  // Octahedron Edges between adjacent hubs
  const octahedronEdges = useMemo<[number, number][]>(() => {
    return [
      [1, 2], [1, 3], [1, 4], [1, 5], // DATA to DB, PROG, TOOLS, SOFT
      [6, 2], [6, 3], [6, 4], [6, 5], // LANG to DB, PROG, TOOLS, SOFT
      [2, 3], [3, 4], [4, 5], [5, 2], // Equator ring
    ];
  }, []);

  // Fast Related Map for Cross-Category Connections
  const crossCategoryRelatedMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const skillCat = new Map<string, number>();

    PORTFOLIO_DB.habilidades.forEach((c) => {
      c.habilidades.forEach((s) => skillCat.set(s, c.id));
    });

    RELATED_SKILLS.forEach(([a, b]) => {
      const catA = skillCat.get(a);
      const catB = skillCat.get(b);
      if (catA && catB && catA !== catB) {
        if (!map.has(a)) map.set(a, []);
        if (!map.has(b)) map.set(b, []);
        map.get(a)!.push(b);
        map.get(b)!.push(a);
      }
    });

    return map;
  }, []);

  // Direction bag for random deselection rotation
  const directionBagRef = useRef<DirectionBag>(new DirectionBag(0));

  // Physics & Animation Mutable Refs (ZERO React state updates during render loop)
  const orientationRef = useRef<[number, number, number, number]>(
    quatFromAxisAngle([1, 0.4, 0], 0.22) // Aesthetic initial tilt
  );

  // Rotation axis & speed (Base: 1 full turn in ~108 s at 60 fps = ~0.000982 rad/frame, 25% slower for tranquil motion)
  const OMEGA_BASE = 0.000982;
  const initialAxis: [number, number, number] = normalizeVec([0, 1, 0.15]);
  const currentAxisRef = useRef<[number, number, number]>(initialAxis);
  const targetAxisRef = useRef<[number, number, number]>(initialAxis);
  const currentSpeedRef = useRef<number>(OMEGA_BASE);
  const resumeRampRef = useRef<{ startTime: number; duration: number } | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragPrevPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragTotalDistRef = useRef<number>(0);
  const dragSamplesRef = useRef<{ x: number; y: number; time: number }[]>([]);

  const hoverNodeRef = useRef<string | null>(null);
  const hoveredCategoryRef = useRef<number | null>(null);

  // Slerp Alignment Animation State (when selecting a category)
  const slerpStateRef = useRef<{
    active: boolean;
    startQuat: [number, number, number, number];
    targetQuat: [number, number, number, number];
    startTime: number;
    duration: number;
  }>({
    active: false,
    startQuat: [0, 0, 0, 1],
    targetQuat: [0, 0, 0, 1],
    startTime: 0,
    duration: 700,
  });

  const selectedCatIdRef = useRef<number | null>(null);
  selectedCatIdRef.current = selectedCatId;

  // 450ms Radial Expansion Animation State (when selecting a category)
  const expansionAnimRef = useRef<{
    currentProgress: number;
    targetProgress: number;
    startTime: number;
    startVal: number;
    duration: number;
    activeCatId: number | null;
  }>({
    currentProgress: 0,
    targetProgress: 0,
    startTime: 0,
    startVal: 0,
    duration: 450,
    activeCatId: null,
  });


  // Selected skill name reference to keep rear/front skill highlighted while selected
  const selectedSkillNameRef = useRef<string | null>(null);

  // Track cursor position on scene for subtle tilt
  const sceneTiltOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Function to smoothly align a chosen category to the front
  const alignCategoryToFront = useCallback(
    (catId: number, clickedSkillName?: string) => {
      const hubUnitVectors: [number, number, number][] = [
        [0, 0, 1],
        [1, 0, 0],
        [0, 1, 0],
        [-1, 0, 0],
        [0, -1, 0],
        [0, 0, -1],
      ];
      const hubVec = hubUnitVectors[catId - 1];
      if (!hubVec) return;

      // Target quaternion aligns hubVec with [0, 0, 1]
      const qTarget = quatFromUnitVectors(hubVec, [0, 0, 1]);

      slerpStateRef.current = {
        active: true,
        startQuat: [...orientationRef.current],
        targetQuat: qTarget,
        startTime: performance.now(),
        duration: 700,
      };

      // Trigger 450ms radial expansion ease-out animation
      expansionAnimRef.current = {
        currentProgress: expansionAnimRef.current.currentProgress,
        targetProgress: 1.0,
        startTime: performance.now(),
        startVal: expansionAnimRef.current.currentProgress,
        duration: 450,
        activeCatId: catId,
      };

      resumeRampRef.current = null;
      if (clickedSkillName) {
        selectedSkillNameRef.current = clickedSkillName;
        hoverNodeRef.current = clickedSkillName;
        hoveredCategoryRef.current = catId;
        setHoveredNodeId(clickedSkillName);
      } else {
        selectedSkillNameRef.current = null;
      }
      setSelectedCatId(catId);
    },
    []
  );

  // Deselect category and resume normal rotation with 1.2s ease-in-out ramp
  const deselectCategory = useCallback(() => {
    // Animate radial contraction back to normal 26° cap
    expansionAnimRef.current = {
      currentProgress: expansionAnimRef.current.currentProgress,
      targetProgress: 0.0,
      startTime: performance.now(),
      startVal: expansionAnimRef.current.currentProgress,
      duration: 450,
      activeCatId: selectedCatIdRef.current,
    };

    selectedSkillNameRef.current = null;
    hoverNodeRef.current = null;
    hoveredCategoryRef.current = null;
    setHoveredNodeId(null);
    setSelectedCatId(null);
    slerpStateRef.current.active = false;

    // Pick new random direction from 8-sector shuffled bag differing >= 60°
    const newAxis = directionBagRef.current.nextDirection();
    targetAxisRef.current = newAxis;
    currentAxisRef.current = newAxis;

    // Smoothly ramp angular speed from 0 to normal in 1.2 s (ease-in-out)
    currentSpeedRef.current = 0;
    resumeRampRef.current = {
      startTime: performance.now(),
      duration: 1200,
    };
  }, []);

  // Keyboard navigation between categories
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        deselectCategory();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextId = selectedCatIdRef.current ? (selectedCatIdRef.current % 6) + 1 : 1;
        alignCategoryToFront(nextId);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevId = selectedCatIdRef.current ? ((selectedCatIdRef.current - 2 + 6) % 6) + 1 : 6;
        alignCategoryToFront(prevId);
      }
    },
    [alignCategoryToFront, deselectCategory]
  );

  // Main 3D Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let rafId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check system preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Canvas Resize Handler
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Intersection Observer to pause rendering when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    // Visibility change handler
    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Frame Renderer
    const renderFrame = (timestamp: number) => {
      if (isVisible && width > 0 && height > 0) {
        ctx.save();
        ctx.scale(dpr, dpr);

        // Solid theme background #141518 (No blur)
        ctx.fillStyle = '#141518';
        ctx.fillRect(0, 0, width, height);

        // =========================================================================
        // 1. Precise Real Visual Extent Radius Calculation
        // Maximum perspective scale k_max = 1.20 (soft perspective)
        // Safety margins: 36px top/bottom (guarantees >= 12px below legend), 24px sides
        // =========================================================================
        const padY = 36;
        const padX = 24;
        const hubBuffer = 26; // Hub visual radius (16) + outer ring (5) + safety padding (5)
        const maxK = 1.20;

        const maxR_H = Math.max(80, (height * 0.5 - (hubBuffer + padY)) / maxK);
        const maxR_W = Math.max(80, (width * 0.5 - (hubBuffer + padX + 80)) / maxK);
        const radius = Math.min(maxR_H, maxR_W);

        const cx = width * 0.5;
        const cy = height * 0.5;
        const camDist = 6 * radius; // k(z=1) = 6R / (6R - R) = 1.20 max!

        // Update 450ms Ease-Out Radial Expansion Animation for Selected Category
        const exp = expansionAnimRef.current;
        if (exp.currentProgress !== exp.targetProgress) {
          const elapsed = timestamp - exp.startTime;
          const t = Math.min(1, Math.max(0, elapsed / exp.duration));
          const easeOut = 1 - Math.pow(1 - t, 3);
          exp.currentProgress = exp.startVal + (exp.targetProgress - exp.startVal) * easeOut;
          if (t >= 1) {
            exp.currentProgress = exp.targetProgress;
          }
        }

        // 2. Update Rotation / Slerp Physics
        if (slerpStateRef.current.active) {
          const elapsed = timestamp - slerpStateRef.current.startTime;
          const t = Math.min(1, elapsed / slerpStateRef.current.duration);
          const easeT = 1 - Math.pow(1 - t, 3);
          orientationRef.current = quatSlerp(
            slerpStateRef.current.startQuat,
            slerpStateRef.current.targetQuat,
            easeT
          );
          if (t >= 1) {
            slerpStateRef.current.active = false;
            currentSpeedRef.current = 0;
          }
        } else if (selectedCatIdRef.current !== null) {
          // Stationary while a category is selected
          currentSpeedRef.current = 0;
        } else if (!isDraggingRef.current && !prefersReducedMotion) {
          // Smoothly interpolate current axis towards target axis if changed
          const curA = currentAxisRef.current;
          const tgtA = targetAxisRef.current;
          const blendedAxis = normalizeVec([
            curA[0] + (tgtA[0] - curA[0]) * 0.08,
            curA[1] + (tgtA[1] - curA[1]) * 0.08,
            curA[2] + (tgtA[2] - curA[2]) * 0.08,
          ]);
          currentAxisRef.current = blendedAxis;

          // Compute angular speed
          if (resumeRampRef.current) {
            const elapsed = timestamp - resumeRampRef.current.startTime;
            const t = Math.min(1, elapsed / resumeRampRef.current.duration);
            // Ease-in-out curve
            const ease = 0.5 * (1 - Math.cos(Math.PI * t));
            currentSpeedRef.current = OMEGA_BASE * ease;
            if (t >= 1) {
              resumeRampRef.current = null;
              currentSpeedRef.current = OMEGA_BASE;
            }
          } else if (currentSpeedRef.current > OMEGA_BASE) {
            // Inertia decay towards normal speed (~0.8 s transition)
            currentSpeedRef.current = OMEGA_BASE + (currentSpeedRef.current - OMEGA_BASE) * 0.94;
            if (currentSpeedRef.current <= OMEGA_BASE * 1.005) {
              currentSpeedRef.current = OMEGA_BASE;
            }
          } else {
            currentSpeedRef.current = OMEGA_BASE;
          }

          if (currentSpeedRef.current > 0.00001) {
            const rotDelta = quatFromAxisAngle(currentAxisRef.current, currentSpeedRef.current);
            orientationRef.current = quatNormalize(
              quatMultiply(rotDelta, orientationRef.current)
            );
          }
        }

        // Convert current orientation quaternion to 3x3 rotation matrix
        const [qx, qy, qz, qw] = orientationRef.current;
        const r00 = 1 - 2 * (qy * qy + qz * qz);
        const r01 = 2 * (qx * qy - qz * qw);
        const r02 = 2 * (qx * qz + qy * qw);
        const r10 = 2 * (qx * qy + qz * qw);
        const r11 = 1 - 2 * (qx * qx + qz * qz);
        const r12 = 2 * (qy * qz - qx * qw);
        const r20 = 2 * (qx * qz - qy * qw);
        const r21 = 2 * (qy * qz + qx * qw);
        const r22 = 1 - 2 * (qx * qx + qy * qy);

        // Background subtle parallax opposite to sphere tilt
        if (bgDotsRef.current && !prefersReducedMotion) {
          const pxShift = (-sceneTiltOffsetRef.current.x * 2.5).toFixed(1);
          const pyShift = (-sceneTiltOffsetRef.current.y * 2.5).toFixed(1);
          bgDotsRef.current.style.transform = `translate3d(${pxShift}px, ${pyShift}px, 0)`;
        }

        // =========================================================================
        // 3. Draw Sphere Contour Ring & Rotating Celestial Equator
        // =========================================================================
        // A. Faint 1px Sphere Contour
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // B. Rotating Celestial Equator Ring (tilted with the sphere)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const equatorSteps = 48;
        for (let eIdx = 0; eIdx <= equatorSteps; eIdx++) {
          const angle = (eIdx / equatorSteps) * Math.PI * 2;
          const ex = Math.cos(angle);
          const ey = 0;
          const ez = Math.sin(angle);
          const rx = r00 * ex + r01 * ey + r02 * ez;
          const ry = r10 * ex + r11 * ey + r12 * ez;
          const rz = r20 * ex + r21 * ey + r22 * ez;
          const pScale = camDist / (camDist - rz * radius);
          const px = cx + rx * radius * pScale;
          const py = cy - ry * radius * pScale;
          if (eIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // =========================================================================
        // 4. Project all 3D nodes to 2D screen space with Smoothstep Opacity
        // =========================================================================
        const currentActiveCat = selectedCatIdRef.current;
        const currentHoveredSkill = hoverNodeRef.current;

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          let vec = n.baseVec;
          if (exp.currentProgress > 0 && n.catId === exp.activeCatId && !n.isHub) {
            const p = exp.currentProgress;
            vec = normalizeVec([
              n.baseVec[0] * (1 - p) + n.expandedVec[0] * p,
              n.baseVec[1] * (1 - p) + n.expandedVec[1] * p,
              n.baseVec[2] * (1 - p) + n.expandedVec[2] * p,
            ]);
          }

          const rx = r00 * vec[0] + r01 * vec[1] + r02 * vec[2];
          const ry = r10 * vec[0] + r11 * vec[1] + r12 * vec[2];
          const rz = r20 * vec[0] + r21 * vec[1] + r22 * vec[2];

          const pScale = camDist / (camDist - rz * radius);
          n.projX = cx + rx * radius * pScale;
          n.projY = cy - ry * radius * pScale;
          n.projZ = rz;
          n.projScale = pScale;
          n.projR = n.isHub
            ? Math.max(7, 13 * pScale)
            : (n.isCore ? 5.2 : 3.8) * pScale;

          // Opacidad por orientación:
          // opacidad = mínimo + (1 − mínimo) × smoothstep(−0.05, 0.55, z)
          // Mínimos: hubs 0.5, habilidades core 0.3, resto de habilidades 0.10.
          const minAlpha = n.isHub ? 0.5 : (n.isCore ? 0.3 : 0.10);
          const ss = smoothstep(-0.05, 0.55, rz);
          let alpha = minAlpha + (1 - minAlpha) * ss;

          if (currentActiveCat !== null) {
            if (n.catId === currentActiveCat) {
              alpha = 1.0;
            } else {
              alpha = n.isHub ? 0.40 : 0.08;
            }
          }

          if (
            hoverNodeRef.current === n.id ||
            hoverNodeRef.current === n.name ||
            selectedSkillNameRef.current === n.name
          ) {
            alpha = 1.0;
          }

          n.opacity = alpha;
        }

        // Update accessibility Tab buttons position for hubs (all 6 hubs always focusable)
        nodes.forEach((n) => {
          if (n.isHub) {
            const btn = hubButtonRefs.current[n.catId - 1];
            if (btn) {
              btn.style.transform = `translate3d(${(n.projX - 22).toFixed(1)}px, ${(
                n.projY - 22
              ).toFixed(1)}px, 0)`;
              btn.style.display = 'block';
            }
          }
        });

        // 5. Draw Octahedron Edges between Hubs (Faint celestial lines)
        ctx.lineWidth = 1;
        octahedronEdges.forEach(([h1, h2]) => {
          const node1 = nodes.find((n) => n.isHub && n.catId === h1);
          const node2 = nodes.find((n) => n.isHub && n.catId === h2);
          if (!node1 || !node2) return;

          const edgeAlpha = Math.min(node1.opacity, node2.opacity) * 0.25;
          ctx.strokeStyle = `rgba(255, 255, 255, ${edgeAlpha})`;
          ctx.beginPath();
          ctx.moveTo(node1.projX, node1.projY);
          ctx.lineTo(node2.projX, node2.projY);
          ctx.stroke();
        });

        // 6. Draw Category Tree Lines from each Hub to its Skills
        nodes.forEach((hub) => {
          if (!hub.isHub) return;
          const isCatSelected = currentActiveCat === hub.catId;

          nodes.forEach((skill) => {
            if (skill.isHub || skill.catId !== hub.catId) return;

            const isRelatedHighlight =
              currentHoveredSkill &&
              (skill.name === currentHoveredSkill ||
                crossCategoryRelatedMap.get(currentHoveredSkill)?.includes(skill.name));

            const lineAlpha = isCatSelected
              ? 0.85
              : isRelatedHighlight
              ? 0.80
              : currentActiveCat !== null
              ? 0.05
              : Math.min(hub.opacity, skill.opacity) * 0.30;

            ctx.lineWidth = isCatSelected || isRelatedHighlight ? 1.6 : 0.9;
            ctx.strokeStyle =
              isCatSelected || isRelatedHighlight
                ? `rgba(255, 62, 0, ${lineAlpha})`
                : `rgba(255, 255, 255, ${lineAlpha})`;

            ctx.beginPath();
            ctx.moveTo(hub.projX, hub.projY);
            ctx.lineTo(skill.projX, skill.projY);
            ctx.stroke();
          });
        });

        // 7. Draw Cross-Category Related Curves (Only when hovering a skill)
        if (currentHoveredSkill) {
          const hoveredNode = nodes.find((n) => n.name === currentHoveredSkill);
          const relatedTargets = crossCategoryRelatedMap.get(currentHoveredSkill) || [];

          if (hoveredNode && relatedTargets.length > 0) {
            relatedTargets.forEach((targetName) => {
              const targetNode = nodes.find((n) => n.name === targetName);
              if (!targetNode) return;

              // Smooth curved Bézier bridge
              const mx = (hoveredNode.projX + targetNode.projX) * 0.5;
              const my = (hoveredNode.projY + targetNode.projY) * 0.5 - 20;

              ctx.lineWidth = 1.8;
              ctx.strokeStyle = '#ff3e00';
              ctx.beginPath();
              ctx.moveTo(hoveredNode.projX, hoveredNode.projY);
              ctx.quadraticCurveTo(mx, my, targetNode.projX, targetNode.projY);
              ctx.stroke();

              // Concentric radar ring on target
              ctx.strokeStyle = '#ff3e00';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.arc(targetNode.projX, targetNode.projY, 8, 0, Math.PI * 2);
              ctx.stroke();
            });
          }
        }

        // 8. Sort nodes back-to-front for proper depth ordering
        const sortedNodes = [...nodes].sort((a, b) => a.projZ - b.projZ);

        // 9. Draw Nodes (Hubs, Core Skills, Regular Skills)
        sortedNodes.forEach((node) => {
          const isHovered =
            hoverNodeRef.current === node.id ||
            hoverNodeRef.current === node.name ||
            selectedSkillNameRef.current === node.name;
          const isCatSelected = currentActiveCat === node.catId;

          if (node.isHub) {
            const hubR = node.projR;
            const hubAlpha = currentActiveCat !== null ? (isCatSelected ? 1.0 : 0.40) : node.opacity;

            // Subtle concentric ring (Geometric glow, no blur)
            ctx.strokeStyle =
              isCatSelected || isHovered
                ? `rgba(255, 62, 0, ${hubAlpha * 0.5})`
                : `rgba(255, 255, 255, ${hubAlpha * 0.2})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(node.projX, node.projY, hubR + 5, 0, Math.PI * 2);
            ctx.stroke();

            // Primary Hub Body
            ctx.fillStyle = '#18191e';
            ctx.beginPath();
            ctx.arc(node.projX, node.projY, hubR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle =
              isCatSelected || isHovered
                ? '#ff3e00'
                : `rgba(255, 255, 255, ${hubAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Inner Indicator: Filled = Avanzado, Outline = Intermedio
            const innerR = Math.max(3.5, 6 * node.projScale);
            ctx.fillStyle = node.nivel === 'Avanzado' ? '#ff3e00' : 'transparent';
            ctx.strokeStyle = '#ff3e00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(node.projX, node.projY, innerR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // Skill Node
            const isCore = node.isCore;
            const skillR = node.projR;
            // When category is selected, other category nodes drop to 0.25
            const dotAlpha = currentActiveCat !== null
              ? (isCatSelected ? 1.0 : 0.25)
              : node.opacity;

            // Node Dot
            ctx.fillStyle = isHovered
              ? '#ff3e00'
              : isCore
              ? `rgba(255, 255, 255, ${dotAlpha})`
              : `rgba(161, 161, 170, ${dotAlpha})`;
            ctx.beginPath();
            ctx.arc(node.projX, node.projY, skillR, 0, Math.PI * 2);
            ctx.fill();

            if (isCore || isHovered) {
              ctx.strokeStyle = isHovered ? '#ffffff' : `rgba(255, 62, 0, ${dotAlpha})`;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            }
          }
        });

        // =========================================================================
        // 10. Rigid Satellite Anchoring: All 41 Labels Visible, Zero Repositioning
        // - Every label is permanently and rigidly anchored to its node (skills at fixed +/- 6px, hubs below).
        // - ZERO repositioning, ZERO distance changes, ZERO leader line jumps:
        //   Each label moves in 1:1 lockstep with its node on the sphere.
        // - Depth opacity via smoothstep: front is crisp & clear (0.75 - 1.0), rear recedes softly (0.12 - 0.25).
        // - Legibility guaranteed with 3px #141518 background outline (strokeText with lineJoin round).
        // =========================================================================
        ctx.textBaseline = 'middle';

        // Sort back-to-front (projZ ascending) so front labels naturally draw over back labels
        const sortedLabels = [...nodes].sort((a, b) => {
          const aHover = hoverNodeRef.current === a.id || hoverNodeRef.current === a.name;
          const bHover = hoverNodeRef.current === b.id || hoverNodeRef.current === b.name;
          if (aHover && !bHover) return 1;
          if (!aHover && bHover) return -1;
          if (currentActiveCat !== null) {
            const aInCat = a.catId === currentActiveCat;
            const bInCat = b.catId === currentActiveCat;
            if (aInCat && !bInCat) return 1;
            if (!aInCat && bInCat) return -1;
          }
          return a.projZ - b.projZ;
        });

        sortedLabels.forEach((node) => {
          const isHovered =
            hoverNodeRef.current === node.id ||
            hoverNodeRef.current === node.name ||
            selectedSkillNameRef.current === node.name;
          const isBold = node.isHub || node.isCore;
          const labelText = isHovered ? node.name : (node.code || node.displayLabel);

          let targetAlpha = node.opacity;
          if (currentActiveCat !== null) {
            targetAlpha = node.catId === currentActiveCat ? 1.0 : 0.10;
          }
          if (isHovered) {
            targetAlpha = 1.0;
          }

          // Rigid Anchor: 100% fixed relative to node position (NEVER shifts, NEVER dodges)
          let anchorX = node.projX;
          let anchorY = node.projY;
          let align: CanvasTextAlign = 'center';

          if (node.isHub) {
            anchorX = node.projX;
            anchorY = node.projY + node.projR + 12;
            align = 'center';
          } else {
            if (node.labelAnchorSide === 'right') {
              anchorX = node.projX + node.projR + 6;
              anchorY = node.projY;
              align = 'left';
            } else {
              anchorX = node.projX - node.projR - 6;
              anchorY = node.projY;
              align = 'right';
            }
          }

          ctx.font = isBold
            ? 'bold 11px "JetBrains Mono", monospace'
            : 'normal 11px "JetBrains Mono", monospace';
          ctx.textAlign = align;

          // 1. Outline 3px in #141518 (no shadowBlur)
          ctx.lineWidth = 3;
          ctx.strokeStyle = `rgba(20, 21, 24, ${targetAlpha})`;
          ctx.lineJoin = 'round';
          ctx.strokeText(labelText, anchorX, anchorY);

          // 2. Text fill
          ctx.fillStyle = isHovered
            ? '#ff3e00'
            : isBold
            ? `rgba(255, 255, 255, ${targetAlpha})`
            : `rgba(228, 228, 231, ${targetAlpha})`;
          ctx.fillText(labelText, anchorX, anchorY);
        });

        ctx.restore();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, [nodes, octahedronEdges, crossCategoryRelatedMap]);

  // Pointer Interaction Handlers for Dragging & Inertia
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragPrevPosRef.current = { x: e.clientX, y: e.clientY };
    dragTotalDistRef.current = 0;
    dragSamplesRef.current = [{ x: e.clientX, y: e.clientY, time: performance.now() }];
    resumeRampRef.current = null;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const now = performance.now();
      const dx = e.clientX - dragPrevPosRef.current.x;
      const dy = e.clientY - dragPrevPosRef.current.y;
      dragTotalDistRef.current += Math.hypot(dx, dy);
      dragPrevPosRef.current = { x: e.clientX, y: e.clientY };

      // If dragged while a category was selected: cancel selection, close card, follow drag
      if (selectedCatIdRef.current !== null && dragTotalDistRef.current >= 5) {
        setSelectedCatId(null);
        slerpStateRef.current.active = false;
      }

      // Buffer recent drag samples within ~120 ms
      dragSamplesRef.current.push({ x: e.clientX, y: e.clientY, time: now });
      dragSamplesRef.current = dragSamplesRef.current.filter((s) => now - s.time <= 120);

      // Direct quaternion rotation from drag delta (tactile weighted factor 0.0028 matches physical sphere radius)
      const speed = Math.hypot(dx, dy) * 0.0028;
      if (speed > 0.0001) {
        const axis: [number, number, number] = [dy / speed, dx / speed, 0];
        const dq = quatFromAxisAngle(axis, speed);
        orientationRef.current = quatNormalize(quatMultiply(dq, orientationRef.current));
      }
    } else {
      // Hover Detection over nodes (visual highlight only on all nodes front and back - NEVER halts rotation!)
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Update scene tilt offset (additive cursor parallax and subtle tilt)
      sceneTiltOffsetRef.current = {
        x: (mouseX / rect.width - 0.5) * 2,
        y: (mouseY / rect.height - 0.5) * 2,
      };

      const isTouch = e.pointerType === 'touch';
      const hitNode = findHitNode(nodes, mouseX, mouseY, isTouch);

      if (hitNode) {
        hoverNodeRef.current = hitNode.isHub ? hitNode.id : hitNode.name;
        hoveredCategoryRef.current = hitNode.catId;
        setHoveredNodeId(hitNode.isHub ? hitNode.id : hitNode.name);
      } else {
        if (selectedCatIdRef.current !== null && selectedSkillNameRef.current !== null) {
          hoverNodeRef.current = selectedSkillNameRef.current;
          hoveredCategoryRef.current = selectedCatIdRef.current;
          setHoveredNodeId(selectedSkillNameRef.current);
        } else {
          hoverNodeRef.current = null;
          hoveredCategoryRef.current = null;
          setHoveredNodeId(null);
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }

      const totalDist = Math.hypot(
        e.clientX - dragStartPosRef.current.x,
        e.clientY - dragStartPosRef.current.y
      );

      // Distinguish click (< 5px) vs drag
      if (totalDist < 5) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const isTouch = e.pointerType === 'touch';

        const hitNode = findHitNode(nodes, clickX, clickY, isTouch);

        if (hitNode) {
          if (hitNode.isHub) {
            selectedSkillNameRef.current = null;
            alignCategoryToFront(hitNode.catId);
            hoverNodeRef.current = hitNode.id;
            hoveredCategoryRef.current = hitNode.catId;
            setHoveredNodeId(hitNode.id);
          } else {
            // Clicked on a skill (at any depth): select its category and leave that skill highlighted!
            alignCategoryToFront(hitNode.catId, hitNode.name);
          }
        } else {
          // Clicked background -> deselect
          deselectCategory();
        }
      } else {
        // It was a drag: calculate direction & velocity from last ~100 ms of drag
        const now = performance.now();
        const recent = dragSamplesRef.current.filter((s) => now - s.time <= 100);

        if (recent.length >= 2) {
          const s0 = recent[0];
          const sLast = recent[recent.length - 1];
          const dx = sLast.x - s0.x;
          const dy = sLast.y - s0.y;
          const dt = sLast.time - s0.time;
          const dist = Math.hypot(dx, dy);
          const v = dist / Math.max(1, dt); // velocity in px/ms

          // If total drag >= 20px and release velocity >= 0.08 px/ms, continue in drag direction
          if (totalDist >= 20 && v >= 0.08 && dist > 0.001) {
            const newAxis: [number, number, number] = [dy / dist, dx / dist, 0];
            currentAxisRef.current = newAxis;
            targetAxisRef.current = newAxis;

            // Gentle, weighted release inertia (capped at 0.004 rad/frame, settles smoothly in ~0.8s without spinning wild)
            const initInertia = Math.min(0.004, Math.max(OMEGA_BASE, v * 0.0035));
            currentSpeedRef.current = initInertia;
            resumeRampRef.current = null;
          } else {
            // Short drag or nearly zero release speed: maintain current direction at base speed
            currentSpeedRef.current = OMEGA_BASE;
            resumeRampRef.current = null;
          }
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] pt-12 sm:pt-14 lg:pt-12 pb-3.5 sm:pb-4 lg:pb-3.5 px-4 sm:px-8 lg:px-12 text-[#f4f1ea] select-none flex flex-col justify-between relative overflow-y-auto lg:overflow-hidden transition-colors duration-500"
    >
      {/* Background layer (below the red thread) */}
      <div className="section-bg" aria-hidden="true">
        <div className="absolute inset-0 bg-[#141518]" />

        {/* Background Celestial Starry Dots Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="skills-bg-stars"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="0.75" fill="#ffffff" fillOpacity="0.08" />
              <circle cx="22" cy="24" r="0.75" fill="#ffffff" fillOpacity="0.04" />
              <circle cx="40" cy="18" r="0.5" fill="#ff3e00" fillOpacity="0.07" />
            </pattern>
          </defs>
          <g ref={bgDotsRef} style={{ transition: 'transform 80ms ease-out' }}>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#skills-bg-stars)" />
          </g>
        </svg>
      </div>

      {/* Invisible Screen Reader Navigation Tree for Full Accessibility */}
      <div className="sr-only">
        <h2>{tx('Capacidades Técnicas y Stack Tecnológico (Esfera 3D Interactiva)', 'Technical Skills and Technology Stack (Interactive 3D Sphere)')}</h2>
        {PORTFOLIO_DB.habilidades.map((cat) => (
          <div key={cat.id}>
            <h3>
              {cat.categoria} ({tx('Nivel', 'Level')} {cat.nivel}, {cat.habilidades.length} {tx('habilidades', 'skills')})
            </h3>
            <ul>
              {cat.habilidades.map((h) => (
                <li key={h}>
                  {h} {CORE_SKILLS.has(h) ? t('skills.core') : ''}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div data-thread-content="1" className="section-content max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* 1. Header with Title & Counter 03 / 06                                     */}
        {/* ========================================================================= */}
        <div className="border-b border-white/10 pb-2 sm:pb-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff3e00] font-bold">
              {t('skills.section')}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display font-light text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
              {t('section.skills')}
            </h2>

            <div className="flex items-center gap-2 font-mono text-xs text-[#a1a1aa] flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00]" />
              <span className="tracking-widest font-bold text-white">03 / 06</span>
            </div>
          </div>

          <p className="font-sans text-xs text-[#a1a1aa] mt-0.5 leading-snug">
            {tx('Consultas SQL avanzadas, optimización de Stored Procedures, modelado relacional y dashboards ejecutivos.', 'Advanced SQL queries, Stored Procedures optimization, relational modeling, and executive dashboards.')}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. Desktop 3D Interactive Sphere (≥ 1024px)                                */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative w-full my-auto overflow-hidden min-h-[460px]">
          {/* Main 3D Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            data-cursor-text={hoveredNodeId ? tx('VER', 'VIEW') : tx('ARRASTRA', 'DRAG')}
            data-cursor-bg="#ff3e00"
            className="w-full h-full block touch-none cursor-grab active:cursor-grabbing outline-none"
          />

          {/* Accessible Tab-Focusable Buttons Positioned Over 3D Hubs (all 6 hubs, front and back) */}
          {PORTFOLIO_DB.habilidades.map((cat, idx) => (
            <button
              key={cat.id}
              ref={(el) => {
                hubButtonRefs.current[idx] = el;
              }}
              type="button"
              tabIndex={0}
              aria-label={`${cat.categoria}, ${tx('nivel', 'level')} ${cat.nivel}, ${cat.habilidades.length} ${tx('habilidades', 'skills')}`}
              onFocus={() => {
                hoverNodeRef.current = `hub-${cat.id}`;
                hoveredCategoryRef.current = cat.id;
                setHoveredNodeId(`hub-${cat.id}`);
              }}
              onBlur={() => {
                if (selectedCatIdRef.current === null) {
                  hoverNodeRef.current = null;
                  hoveredCategoryRef.current = null;
                  setHoveredNodeId(null);
                }
              }}
              onClick={() => {
                selectedSkillNameRef.current = null;
                alignCategoryToFront(cat.id);
              }}
              className="absolute top-0 left-0 w-11 h-11 rounded-full opacity-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#ff3e00] focus-visible:bg-[#ff3e00]/20 pointer-events-none focus-visible:pointer-events-auto transition-opacity z-20 outline-none"
            />
          ))}

          {/* Compact Category Detail Card (Bottom-Left) */}
          {selectedCategory && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              data-cursor-none="true"
              className="absolute bottom-4 left-4 z-20 bg-[#18191e]/95 border border-[#ff3e00]/50 rounded-xl p-3.5 sm:p-4 shadow-2xl flex flex-col justify-between w-[320px] max-w-[90vw] animate-fadeIn"
              style={{
                height: '115px',
              }}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      selectedCategory.nivel === 'Avanzado'
                        ? 'bg-[#ff3e00]'
                        : 'border-2 border-[#ff3e00] bg-transparent'
                    }`}
                  />
                  <span className="font-mono text-xs font-bold text-white tracking-wider">
                    0{selectedCategory.id} · {selectedCategory.tipo.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/90 font-semibold">
                    {selectedCategory.nivel}
                  </span>
                  <button
                    type="button"
                    onClick={deselectCategory}
                    aria-label={tx('Cerrar ficha', 'Close card')}
                    data-cursor-text={tx('CERRAR', 'CLOSE')}
                    data-cursor-bg="#ff3e00"
                    className="w-5 h-5 flex items-center justify-center rounded-full text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors text-xs font-mono cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <h4 className="font-display font-bold text-sm text-white truncate mt-1">
                {selectedCategory.categoria}
              </h4>

              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    onOpenQuery(`SELECT * FROM habilidades WHERE id = ${selectedCategory.id};`)
                  }
                  data-cursor-text="SELECT"
                  data-cursor-bg="#ff3e00"
                  className="group font-mono text-[11px] text-[#ff3e00] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>SELECT * FROM habilidades WHERE id = {selectedCategory.id};</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. Mobile / Tablet Stack (< 1024px): Compact Cards with Normal Scroll      */}
        {/* ========================================================================= */}
        <div className="lg:hidden flex flex-col gap-3 py-3 w-full">
          {PORTFOLIO_DB.habilidades.map((cat, idx) => (
            <div
              key={cat.id}
              className="bg-[#18191e] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        cat.nivel === 'Avanzado'
                          ? 'bg-[#ff3e00]'
                          : 'border-2 border-[#ff3e00] bg-transparent'
                      }`}
                    />
                    <span className="font-mono text-xs text-[#a1a1aa] font-semibold">
                      0{idx + 1} · {cat.tipo.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-semibold">
                    {cat.nivel}
                  </span>
                </div>

                <h3 className="font-display font-bold text-sm text-white mb-2">{cat.categoria}</h3>

                <div className="flex flex-wrap gap-1.5">
                  {cat.habilidades.map((skill) => {
                    const isCore = CORE_SKILLS.has(skill);
                    const display = SKILL_DISPLAY_LABELS[skill] || skill;
                    return (
                      <span
                        key={skill}
                        title={skill}
                        className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono border transition-colors ${
                          isCore
                            ? 'bg-[#ff3e00]/15 border-[#ff3e00]/50 text-white font-bold'
                            : 'bg-white/5 border-white/10 text-white/90'
                        }`}
                      >
                        {display}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => onOpenQuery(`SELECT * FROM habilidades WHERE id = ${cat.id};`)}
                  className="text-[10px] font-mono text-[#ff3e00] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>SELECT * FROM habilidades WHERE id = {cat.id};</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 4. Discrete Bottom Legend                                                 */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-[#a1a1aa] gap-2 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3e00] inline-block" />
              <span>{tx('Avanzado', 'Advanced')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#ff3e00] inline-block" />
              <span>{tx('Intermedio', 'Intermediate')}</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
              <span className="w-2 h-2 rounded-full bg-white inline-block shadow-sm" />
              <span className="font-bold text-white">{t('skills.legendCore')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#71717a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00] animate-pulse" />
            <span>{tx('Arrastra para girar · Clic en una categoría', 'Drag to rotate · Click a category')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
