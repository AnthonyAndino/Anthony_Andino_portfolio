import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { WORK_EXPERIENCE_DATA } from '../data/portfolioData';
import { Checkmark } from '../components/Icons';
import { WorkExperienceCase } from '../types/portfolio';

// Stagger vertical offset for Card 2 (Alto, Bajo, Alto)
const STAGGER_OFFSET_PX = 44;

// Precise gap between horizontal timeline line and top of high cards (Cards 1 & 3)
const TIMELINE_TO_CARD_GAP = 36;

interface WorkPageProps {
  onOpenQuery: (query: string) => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const WorkPage: React.FC<WorkPageProps> = ({ onOpenQuery, onScrollToSection }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveTriggerRef = useRef<HTMLElement | null>(null);

  // Active case for hover/focus (controls year fill & line glow: 1, 2, or 3)
  const [hoveredCase, setHoveredCase] = useState<1 | 2 | 3 | null>(null);

  // Active case for full in-place detail view (1 or 2; 3 scrolls to projects)
  const [activeDetailCase, setActiveDetailCase] = useState<1 | 2 | null>(null);

  const miniStep = 3; // 1, 2, 3 for La Reyna mini visual

  // Detail ledger interactive step (for Case 1 inside modal)
  const [detailLedgerStep, setDetailLedgerStep] = useState<number>(3);

  // Scroll arrival state to light up timeline nodes
  const [isNode2024Active, setIsNode2024Active] = useState<boolean>(false);
  const [isNode2025Active, setIsNode2025Active] = useState<boolean>(false);
  const [isNode2026Active, setIsNode2026Active] = useState<boolean>(false);
  const activeNodesRef = useRef([false, false, false]);

  // Entrance animation trigger
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  const caseReyna = WORK_EXPERIENCE_DATA.find((c) => c.id === 1)!;
  const casePorsalud = WORK_EXPERIENCE_DATA.find((c) => c.id === 2)!;
  const casePresent = WORK_EXPERIENCE_DATA.find((c) => c.id === 3)!;

  // IntersectionObserver for entrance animation & prefers-reduced-motion check
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      activeNodesRef.current = [true, true, true];
      setHasEntered(true);
      setIsNode2024Active(true);
      setIsNode2025Active(true);
      setIsNode2026Active(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Scroll listener to activate nodes as the continuous red thread traverses them
  useEffect(() => {
    const handleScroll = () => {
      const node2024 = document.getElementById('work-node-2024');
      const node2025 = document.getElementById('work-node-2025');
      const node2026 = document.getElementById('work-node-2026');
      const viewTrigger = window.innerHeight * 0.70;

      if (node2024) {
        const rect1 = node2024.getBoundingClientRect();
        const active = rect1.top <= viewTrigger;
        if (activeNodesRef.current[0] !== active) {
          activeNodesRef.current[0] = active;
          setIsNode2024Active(active);
        }
      }
      if (node2025) {
        const rect2 = node2025.getBoundingClientRect();
        const active = rect2.top <= viewTrigger;
        if (activeNodesRef.current[1] !== active) {
          activeNodesRef.current[1] = active;
          setIsNode2025Active(active);
        }
      }
      if (node2026) {
        const rect3 = node2026.getBoundingClientRect();
        const active = rect3.top <= viewTrigger;
        if (activeNodesRef.current[2] !== active) {
          activeNodesRef.current[2] = active;
          setIsNode2026Active(active);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // State for high-performance zero-lag modal opening
  const [isOpenAnimated, setIsOpenAnimated] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isContentReady, setIsContentReady] = useState<boolean>(false);

  // Body scroll lock and class toggle while detail modal is open
  useEffect(() => {
    if (activeDetailCase) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('work-modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('work-modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('work-modal-open');
    };
  }, [activeDetailCase]);

  // Open detail immediately with zero false delay and staggered content entry
  const handleOpenDetail = useCallback((caseId: 1 | 2, triggerEl?: HTMLElement | null) => {
    if (triggerEl) {
      lastActiveTriggerRef.current = triggerEl;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setActiveDetailCase(caseId);
    setIsClosing(false);

    if (prefersReducedMotion) {
      setIsOpenAnimated(true);
      setIsContentReady(true);
      return;
    }

    // Set initial frame then trigger transition on next animation frame
    setIsOpenAnimated(false);
    setIsContentReady(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpenAnimated(true);
      });
    });

    // Stagger content entry (bullets, stack, interactive ledger) to after the panel shell finishes opening (~180ms)
    setTimeout(() => {
      setIsContentReady(true);
    }, 180);
  }, []);

  // Navigate to projects from Card 3
  const handleNavigateToProjects = useCallback(() => {
    if (onScrollToSection) {
      onScrollToSection('projects');
    } else {
      document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [onScrollToSection]);

  // Close detail with smooth transform/opacity exit, restoring trigger focus
  const handleCloseDetail = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setActiveDetailCase(null);
      setIsOpenAnimated(false);
      setIsClosing(false);
      setIsContentReady(false);
      if (lastActiveTriggerRef.current) {
        lastActiveTriggerRef.current.focus();
      }
      return;
    }

    setIsClosing(true);
    setTimeout(() => {
      setActiveDetailCase(null);
      setIsOpenAnimated(false);
      setIsClosing(false);
      setIsContentReady(false);
      if (lastActiveTriggerRef.current) {
        lastActiveTriggerRef.current.focus();
      }
    }, 150);
  }, []);

  // Keyboard navigation & Focus Trap for detail panel
  useEffect(() => {
    if (!activeDetailCase) return;

    const timer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseDetail();
        return;
      }

      if (e.key === 'Tab' && detailPanelRef.current) {
        const focusableElements = detailPanelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDetailCase, handleCloseDetail]);

  const activeDetailData: WorkExperienceCase | undefined =
    activeDetailCase === 1 ? caseReyna : activeDetailCase === 2 ? casePorsalud : undefined;

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] pt-14 sm:pt-16 pb-4 px-4 sm:px-8 lg:px-12 text-[#f4f1ea] select-none flex flex-col justify-between transition-colors duration-500 overflow-hidden relative"
    >
      {/* Background layer (below the red thread) */}
      <div className="section-bg" aria-hidden="true">
        <div className="absolute inset-0 bg-[#121316]" />
      </div>

      <div data-thread-content="1" className="section-content max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* 1. Header with Title and Counter 01 / 03                                    */}
        {/* ========================================================================= */}
        <div className="border-b border-white/10 pb-2.5 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff3e00] font-bold block mb-0.5">
              01 / EXPERIENCIA PROFESIONAL EN PRODUCCIÓN
            </span>
            <h2 className="font-display font-light text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
              Work & Audits
            </h2>
          </div>

          <div className="font-mono text-xs text-[#a1a1aa] flex items-center gap-1.5 pb-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00]" />
            <span className="tracking-widest font-bold text-white">01 / 03</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Unified Centered Block: Timeline + Exact Connectors + Staggered Cards   */}
        {/* ========================================================================= */}
        <div className="my-auto w-full flex flex-col justify-center py-1">
          {/* Timeline Track (Desktop) */}
          <div className="hidden lg:block w-full">
            {/* 3 Columns matching card widths exactly */}
            <div className="grid grid-cols-3 gap-5">
              {/* --- COLUMN 1 HEADER --- */}
              <div className="text-left">
                <span
                  className={`font-display font-extrabold text-5xl xl:text-6xl tracking-tight transition-all duration-300 block leading-none ${
                    hoveredCase === 1
                      ? 'text-[#ff3e00]'
                      : 'text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.25)]'
                  }`}
                >
                  2024
                </span>
                <span className="text-[10px] xl:text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wider block mt-1">
                  HITO 01 · AUDITORÍA SQL
                </span>
              </div>

              {/* --- COLUMN 2 HEADER --- */}
              <div className="text-left">
                <span
                  className={`font-display font-extrabold text-5xl xl:text-6xl tracking-tight transition-all duration-300 block leading-none ${
                    hoveredCase === 2
                      ? 'text-[#ff3e00]'
                      : 'text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.25)]'
                  }`}
                >
                  2025
                </span>
                <span className="text-[10px] xl:text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wider block mt-1">
                  HITO 02 · STORED PROCEDURES
                </span>
              </div>

              {/* --- COLUMN 3 HEADER --- */}
              <div className="text-left">
                <span
                  className={`font-display font-extrabold text-5xl xl:text-6xl tracking-tight transition-all duration-300 block leading-none ${
                    hoveredCase === 3
                      ? 'text-[#ff3e00]'
                      : 'text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.25)]'
                  }`}
                >
                  2026 →
                </span>
                <span className="text-[10px] xl:text-[11px] font-mono text-[#ff3e00] font-bold uppercase tracking-wider block mt-1 flex items-center gap-1.5">
                  <span>HITO 03 · EN CURSO</span>
                </span>
              </div>
            </div>

            {/* Timeline Bar with Continuous Horizontal Line & Left-Aligned Nodes */}
            <div className="relative w-full h-4 mt-2 flex items-center">
              {/* 3 Column Track Container */}
              <div data-thread-anchor="work-track" className="grid grid-cols-3 gap-5 w-full h-full relative">
                {/* Node 1 & Connector (Aligned to Card 1 Left: left-6 = 24px) */}
                <div className="relative h-full">
                  <div
                    id="work-node-2024"
                    className="absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-all duration-500"
                  >
                    <div
                      data-thread-node-pulse="1"
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-500 bg-[#121316] flex items-center justify-center ${
                        isNode2024Active || hoveredCase === 1
                          ? 'border-[#ff3e00] shadow-[0_0_14px_rgba(255,62,0,0.85)]'
                          : 'border-white/30'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                          isNode2024Active || hoveredCase === 1 ? 'bg-[#ff3e00]' : 'bg-white/40'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Vertical connecting line to Card 1 top border (Exact length: TIMELINE_TO_CARD_GAP = 36px) */}
                  <div
                    className={`absolute left-6 w-px top-1/2 transition-colors duration-300 z-0 ${
                      isNode2024Active || hoveredCase === 1 ? 'bg-[#ff3e00]' : 'bg-white/20'
                    }`}
                    style={{ height: `${TIMELINE_TO_CARD_GAP}px` }}
                  />
                </div>

                {/* Node 2 & Connector (Aligned to Card 2 Left: left-6 = 24px) */}
                <div className="relative h-full">
                  <div
                    id="work-node-2025"
                    className="absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-all duration-500"
                  >
                    <div
                      data-thread-node-pulse="1"
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-500 bg-[#121316] flex items-center justify-center ${
                        isNode2025Active || hoveredCase === 2
                          ? 'border-[#ff3e00] shadow-[0_0_14px_rgba(255,62,0,0.85)]'
                          : 'border-white/30'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                          isNode2025Active || hoveredCase === 2 ? 'bg-[#ff3e00]' : 'bg-white/40'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Vertical connecting line to Card 2 top border (Exact length: 36 + 44 = 80px) */}
                  <div
                    className={`absolute left-6 w-px top-1/2 transition-colors duration-300 z-0 ${
                      isNode2025Active || hoveredCase === 2 ? 'bg-[#ff3e00]' : 'bg-white/20'
                    }`}
                    style={{ height: `${TIMELINE_TO_CARD_GAP + STAGGER_OFFSET_PX}px` }}
                  />
                </div>

                {/* Node 3 & Connector (Aligned to Card 3 Left: left-6 = 24px) */}
                <div className="relative h-full">
                  <div
                    id="work-node-2026"
                    className="absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-all duration-500"
                  >
                    <div
                      data-thread-node-pulse="1"
                      data-thread-node-final="1"
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-500 bg-[#121316] flex items-center justify-center ${
                        isNode2026Active || hoveredCase === 3
                          ? 'border-[#ff3e00] shadow-[0_0_14px_rgba(255,62,0,0.85)]'
                          : 'border-[#ff3e00]/60'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                          isNode2026Active || hoveredCase === 3 ? 'bg-[#ff3e00]' : 'bg-[#ff3e00]/70'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Vertical connecting line to Card 3 top border (Exact length: TIMELINE_TO_CARD_GAP = 36px) */}
                  <div
                    className={`absolute left-6 w-px top-1/2 transition-colors duration-300 z-0 ${
                      isNode2026Active || hoveredCase === 3 ? 'bg-[#ff3e00]' : 'bg-white/20'
                    }`}
                    style={{ height: `${TIMELINE_TO_CARD_GAP}px` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3 Staggered Cards (Starts exactly at TIMELINE_TO_CARD_GAP below the baseline) */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch mt-4"
            style={{ marginTop: `calc(${TIMELINE_TO_CARD_GAP}px - 8px)` }}
          >
            {/* ---------------- CARD 1: LA REYNA (ALTO) ---------------- */}
            <div
              tabIndex={0}
              role="button"
              aria-label="Ver detalles de caso Cooperativa La Reyna"
              onClick={(e) => handleOpenDetail(1, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDetail(1, e.currentTarget);
                }
              }}
              onMouseEnter={() => setHoveredCase(1)}
              onMouseLeave={() => setHoveredCase(null)}
              onFocus={() => setHoveredCase(1)}
              onBlur={() => setHoveredCase(null)}
              className={`group text-left bg-[#1a1b1f] border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#ff3e00] ${
                hoveredCase === 1
                  ? 'border-[#ff3e00]/60 bg-[#1c1d22] lg:-translate-y-1.5'
                  : 'border-[#2e3038] lg:translate-y-0'
              } ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="space-y-1">
                {/* Clean 2-Line Header: Company (Line 1), Exact Role & Full Dates (Line 2) */}
                <div className="flex items-center justify-between text-xs font-mono font-bold text-white tracking-wide">
                  <span>{caseReyna.resumen.company || caseReyna.company}</span>
                  <span className="lg:hidden text-xs font-bold text-[#ff3e00]">2024</span>
                </div>
                <div className="text-[11px] font-mono leading-snug min-h-[2.4rem] flex flex-col justify-center">
                  <span className="text-[#a1a1aa] block">{caseReyna.resumen.role || caseReyna.role}</span>
                  <span className="text-[#8a8a93] block">{caseReyna.resumen.dates || caseReyna.period}</span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug group-hover:text-[#ff3e00] transition-colors pt-0.5">
                  {caseReyna.resumen.result}
                </h3>

                <p className="text-xs text-[#d4d4d8] leading-relaxed line-clamp-2 font-sans">
                  {caseReyna.resumen.summary}
                </p>
              </div>

              {/* Mini Visual: 3 Compact Steps */}
              <div className="my-2 p-2 rounded-xl bg-[#0f1012] border border-white/10 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#71717a] uppercase font-bold tracking-wider">
                  <span>AUDIT PIPELINE</span>
                  <span className="text-emerald-400 inline-flex items-center gap-1 font-bold">
                    <Checkmark className="w-2.5 h-2.5 text-emerald-400" />
                    <span>RECONCILED</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center text-[9px] sm:text-[10px]">
                  <div
                    className={`py-1 rounded transition-colors ${
                      miniStep >= 1
                        ? 'bg-white/15 text-white font-bold'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    1. Scan
                  </div>
                  <div
                    className={`py-1 rounded transition-colors ${
                      miniStep >= 2
                        ? 'bg-white/15 text-white font-bold'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    2. Cross-Check
                  </div>
                  <div
                    className={`py-1 rounded transition-colors inline-flex items-center justify-center gap-1 ${
                      miniStep >= 3
                        ? 'bg-[#ff3e00] text-white font-bold'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    <span>3. Fixed</span>
                    <Checkmark className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Row: Tags & CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex flex-wrap gap-1">
                  {caseReyna.resumen.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-white/5 text-white/80 text-[10px] font-mono border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-mono font-bold text-[#ff3e00] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Ver caso</span>
                  <span>→</span>
                </span>
              </div>
            </div>

            {/* ---------------- CARD 2: PORSALUD (BAJO: +44px offset) ---------------- */}
            <div
              tabIndex={0}
              role="button"
              aria-label="Ver detalles de caso Porsalud"
              onClick={(e) => handleOpenDetail(2, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDetail(2, e.currentTarget);
                }
              }}
              onMouseEnter={() => setHoveredCase(2)}
              onMouseLeave={() => setHoveredCase(null)}
              onFocus={() => setHoveredCase(2)}
              onBlur={() => setHoveredCase(null)}
              className={`group text-left bg-[#1a1b1f] border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#ff3e00] ${
                hoveredCase === 2
                  ? 'border-[#ff3e00]/60 bg-[#1c1d22] lg:translate-y-[38px]'
                  : 'border-[#2e3038] lg:translate-y-[44px]'
              } ${hasEntered ? 'opacity-100' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="space-y-1">
                {/* Clean 2-Line Header: Company (Line 1), Exact Role & Full Dates (Line 2) */}
                <div className="flex items-center justify-between text-xs font-mono font-bold text-white tracking-wide">
                  <span>{casePorsalud.resumen.company || casePorsalud.company}</span>
                  <span className="lg:hidden text-xs font-bold text-[#ff3e00]">2025</span>
                </div>
                <div className="text-[11px] font-mono leading-snug min-h-[2.4rem] flex flex-col justify-center">
                  <span className="text-[#a1a1aa] block">{casePorsalud.resumen.role || casePorsalud.role}</span>
                  <span className="text-[#8a8a93] block">{casePorsalud.resumen.dates || casePorsalud.period}</span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug group-hover:text-[#ff3e00] transition-colors pt-0.5">
                  {casePorsalud.resumen.result}
                </h3>

                <p className="text-xs text-[#d4d4d8] leading-relaxed line-clamp-2 font-sans">
                  {casePorsalud.resumen.summary}
                </p>
              </div>

              {/* Mini Visual: Procedure Debugger TEST DB > PROD with check */}
              <div className="my-2 p-2 rounded-xl bg-[#0f1012] border border-white/10 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#ff3e00] font-bold tracking-wider">
                  <span>PROCEDURE DEBUGGER</span>
                  <span className="text-emerald-400 inline-flex items-center gap-1 font-bold">
                    <span>TEST DB &gt; PROD</span>
                    <Checkmark className="w-2.5 h-2.5 text-emerald-400" />
                  </span>
                </div>
                <div className="text-[10px] text-white/70 bg-white/5 p-1 rounded border border-white/5 truncate">
                  <span className="text-[#ff3e00]">ALTER PROCEDURE</span> sp_AuditarMarcaciones
                </div>
              </div>

              {/* Bottom Row: Tags & CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex flex-wrap gap-1">
                  {casePorsalud.resumen.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-white/5 text-white/80 text-[10px] font-mono border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-mono font-bold text-[#ff3e00] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Ver caso</span>
                  <span>→</span>
                </span>
              </div>
            </div>

            {/* ---------------- CARD 3: PRESENTE (ALTO) ---------------- */}
            <div
              tabIndex={0}
              role="button"
              aria-label="Ver proyectos personales en curso"
              onClick={handleNavigateToProjects}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNavigateToProjects();
                }
              }}
              onMouseEnter={() => setHoveredCase(3)}
              onMouseLeave={() => setHoveredCase(null)}
              onFocus={() => setHoveredCase(3)}
              onBlur={() => setHoveredCase(null)}
              className={`group text-left bg-[#1a1b1f] border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#ff3e00] ${
                hoveredCase === 3
                  ? 'border-[#ff3e00] bg-[#1c1d22] lg:-translate-y-1.5'
                  : 'border-[#2e3038] lg:translate-y-0'
              } ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="space-y-1">
                {/* Clean 2-Line Header: Company (Line 1), Exact Role & Full Dates (Line 2) */}
                <div className="flex items-center justify-between text-xs font-mono font-bold text-white tracking-wide">
                  <span>{casePresent.resumen.company || casePresent.company}</span>
                  <span className="lg:hidden text-xs font-bold text-[#ff3e00]">2026</span>
                </div>
                <div className="text-[11px] font-mono leading-snug min-h-[2.4rem] flex flex-col justify-center">
                  <span className="text-[#a1a1aa] block">{casePresent.resumen.role || casePresent.role}</span>
                  <span className="text-[#8a8a93] block">{casePresent.resumen.dates || casePresent.period}</span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug group-hover:text-[#ff3e00] transition-colors pt-0.5">
                  {casePresent.resumen.result}
                </h3>

                <p className="text-xs text-[#d4d4d8] leading-relaxed line-clamp-2 font-sans">
                  {casePresent.resumen.summary}
                </p>
              </div>

              {/* Mini Visual: Ascending Data Trend Line */}
              <div className="my-2 p-2 rounded-xl bg-[#0f1012] border border-white/10 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#ff3e00] font-bold tracking-wider">
                  <span>UPSKILLING & PROJECTS</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>EXPANDING</span>
                    {!activeDetailCase && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </span>
                </div>
                <div className="h-5 w-full flex items-center px-1">
                  <svg className="w-full h-4 overflow-visible" viewBox="0 0 160 16" fill="none">
                    <path
                      d="M 5 13 L 45 10 L 85 7 L 120 4 L 155 1"
                      stroke="#ff3e00"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="5" cy="13" r="2" fill="#ff3e00" />
                    <circle cx="45" cy="10" r="2" fill="#ff3e00" />
                    <circle cx="85" cy="7" r="2" fill="#ff3e00" />
                    <circle cx="120" cy="4" r="2" fill="#ff3e00" />
                    <circle cx="155" cy="1" r="2.8" fill="#f4f1ea" stroke="#ff3e00" strokeWidth="1.8" />
                  </svg>
                </div>
              </div>

              {/* Bottom Row: Tags & CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex flex-wrap gap-1">
                  {casePresent.resumen.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-white/5 text-white/80 text-[10px] font-mono border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-mono font-bold text-[#ff3e00] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Ver proyectos</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. Bottom Footer Tracking Bar                                              */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#71717a]">
          <span>TIMELINE · RECONCILIACIÓN, PROCEDURES & FORMACIÓN CONTINUA</span>
          <span className="text-[#ff3e00]">SELECT * FROM experiencia;</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. In-place Expanded Detail Panel (Portal to document.body, zero blur)     */}
      {/* ========================================================================= */}
      {activeDetailCase && activeDetailData && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="work-detail-title"
          className={`fixed inset-0 z-40 bg-[rgba(12,13,15,0.88)] flex items-center justify-center p-3 sm:p-6 lg:p-8 transition-opacity duration-150 ${
            isClosing ? 'opacity-0 pointer-events-none' : isOpenAnimated ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDetail();
            }
          }}
        >
          <div
            ref={detailPanelRef}
            className={`bg-[#18191e] border border-[#2e3038] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 flex flex-col justify-between space-y-5 transition-all duration-200 ease-out ${
              isClosing
                ? 'opacity-0 scale-95 translate-y-2'
                : isOpenAnimated
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-2'
            }`}
            style={{
              willChange: (!isContentReady || isClosing) ? 'transform, opacity' : 'auto',
            }}
          >
            {/* Detail Top Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff3e00]" />
                  <h3 id="work-detail-title" className="font-display font-bold text-xl sm:text-2xl text-white">
                    {activeDetailData.company}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono border border-white/15">
                    {activeDetailData.period}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#a1a1aa] mt-1">
                  {activeDetailData.role} · {activeDetailData.location}
                </p>
              </div>

              {/* Close Button X */}
              <button
                ref={closeButtonRef}
                onClick={handleCloseDetail}
                aria-label="Cerrar detalle de caso"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3e00] cursor-pointer"
              >
                <span className="text-base leading-none">✕</span>
              </button>
            </div>

            {/* Detail Body (Staggered Content: Fades in cleanly after frame finishes opening) */}
            <div
              className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-opacity duration-150 ${
                isContentReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Left Column: Full Points & Stack */}
              <div className="lg:col-span-6 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff3e00] font-bold block">
                  {activeDetailData.detalle?.challengeTitle}
                </span>

                <ul className="space-y-2.5 text-xs sm:text-sm text-[#d4d4d8] font-sans">
                  {activeDetailData.detalle?.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#ff3e00] font-bold mt-0.5">―</span>
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">
                    Stack Tecnológico:
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {activeDetailData.detalle?.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 rounded-full bg-white/5 text-white/90 border border-white/10 text-[11px]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SQL Quick Action Button */}
                {activeDetailData.detalle && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onOpenQuery(activeDetailData.detalle!.sqlQuery);
                        handleCloseDetail();
                      }}
                      className="px-3.5 py-1.5 rounded-full border border-[#ff3e00] hover:bg-[#ff3e00] text-white transition-colors text-xs font-mono cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>SELECT * FROM {activeDetailData.detalle.sqlTable};</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Full Interactive Ledger / Debugger */}
              <div className="lg:col-span-6">
                {activeDetailCase === 1 ? (
                  <div className="rounded-xl border border-white/15 bg-[#0f1012] p-4 sm:p-5 shadow-md font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                        AUDIT LEDGER / DISCREPANCY RECONCILER
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold inline-flex items-center gap-1">
                        <span>4 CASOS VERIFICADOS</span>
                        <Checkmark className="w-2.5 h-2.5 text-emerald-400" />
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      <button
                        onClick={() => setDetailLedgerStep(1)}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          detailLedgerStep === 1
                            ? 'bg-white text-[#121316] font-bold'
                            : 'bg-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        1. Scan Tables
                      </button>
                      <button
                        onClick={() => setDetailLedgerStep(2)}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          detailLedgerStep === 2
                            ? 'bg-white text-[#121316] font-bold'
                            : 'bg-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        2. Cross-Check
                      </button>
                      <button
                        onClick={() => setDetailLedgerStep(3)}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer inline-flex items-center gap-1 ${
                          detailLedgerStep === 3
                            ? 'bg-[#ff3e00] text-white font-bold'
                            : 'bg-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        <span>3. Reconciled</span>
                        <Checkmark className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                      <div className="flex justify-between py-0.5 border-b border-white/5">
                        <span className="text-[#a1a1aa]">CUENTAS AUDITADAS:</span>
                        <span className="font-bold text-white">AHORRO & CRÉDITO</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-white/5">
                        <span className="text-[#a1a1aa]">MÉTODO DE LOCALIZACIÓN:</span>
                        <span className="font-bold text-[#ff3e00]">SQL GROUP BY & HAVING</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-white/5">
                        <span className="text-[#a1a1aa]">REGISTROS EN DISCREPANCIA:</span>
                        <span className="font-bold text-white">4 INCIDENCIAS CRÍTICAS</span>
                      </div>
                      <div className="flex justify-between py-1 bg-emerald-950/60 border border-emerald-800/40 px-2 rounded">
                        <span className="text-emerald-400 font-bold">ESTADO FINAL:</span>
                        <span className="text-emerald-300 font-bold">SALDOS RECONCILIADOS AL 100%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#0e0f12] text-white p-4 sm:p-5 font-mono text-xs space-y-3 border border-white/15 shadow-lg">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[#ff3e00] font-bold text-[11px]">
                      <span>PROCEDURE DEBUGGER</span>
                      <span className="text-emerald-400 inline-flex items-center gap-1">
                        <span>TEST DB &gt; PROD</span>
                        <Checkmark className="w-2.5 h-2.5 text-emerald-400" />
                      </span>
                    </div>
                    <div className="space-y-1 text-white/80 text-[11px] bg-white/5 p-3 rounded-lg border border-white/5">
                      <p className="text-[#ff3e00] font-semibold">-- Validación de lógica de marcaciones</p>
                      <p className="text-white/70">ALTER PROCEDURE sp_AuditarMarcacionesMultiSede</p>
                      <p className="text-white/60">  @SedeId INT, @Colaboradores TABLE (Id INT)</p>
                      <p className="text-white/60">AS BEGIN</p>
                      <p className="text-white/60 pl-3">-- Corrección de desfases horarios multi-sede</p>
                      <p className="text-white/60">END;</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] flex items-center gap-2">
                      <Checkmark className="w-3 h-3 flex-shrink-0 text-emerald-400" />
                      <span>Gráficos y módulos validados y corregidos para personal multi-sede.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
