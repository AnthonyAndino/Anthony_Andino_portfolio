import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { usePortfolioData } from '../i18n/usePortfolioData';
import { ProjectItem } from '../types/portfolio';
import { ArrowUpRight } from '../components/Icons';

// Calculate relative luminance and WCAG contrast to determine text color over accent
function getContrastColor(hexColor: string): '#0c0d0f' | '#ffffff' {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const srgb = [r, g, b].map((val) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  );
  const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];

  // Contrast with white vs black
  const cWhite = (1 + 0.05) / (lum + 0.05);
  const cBlack = (lum + 0.05) / (0.05 + 0.05);

  return cWhite >= cBlack ? '#ffffff' : '#0c0d0f';
}

interface ProjectsPageProps {
  onOpenQuery: (query: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onOpenQuery }) => {
  const { t, tx } = useLanguage();
  const { PROJECTS_DATA } = usePortfolioData();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveTriggerRef = useRef<HTMLElement | null>(null);

  // Active project for detail modal
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [isOpenAnimated, setIsOpenAnimated] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isContentReady, setIsContentReady] = useState<boolean>(false);

  // Gallery and Lightbox state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isImageFading, setIsImageFading] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  // Lock body scroll and sink navigation below overlay while modal is open
  useEffect(() => {
    if (activeProject !== null) {
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
  }, [activeProject]);

  // Open detail modal with GPU transform & staggered content entry
  const handleOpenDetail = useCallback((project: ProjectItem, triggerEl?: HTMLElement | null) => {
    if (triggerEl) {
      lastActiveTriggerRef.current = triggerEl;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setActiveProject(project);
    setSelectedImageIndex(0);
    setIsLightboxOpen(false);
    setIsClosing(false);

    if (prefersReducedMotion) {
      setIsOpenAnimated(true);
      setIsContentReady(true);
      return;
    }

    setIsOpenAnimated(false);
    setIsContentReady(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpenAnimated(true);
      });
    });

    // Stagger heavy content after modal container scales into view
    setTimeout(() => {
      setIsContentReady(true);
    }, 180);
  }, []);

  // Thumbnail selection with smooth fade
  const handleSelectImage = useCallback((index: number) => {
    if (index === selectedImageIndex) return;
    setIsImageFading(true);
    setTimeout(() => {
      setSelectedImageIndex(index);
      setIsImageFading(false);
    }, 100);
  }, [selectedImageIndex]);

  // Close detail modal
  const handleCloseDetail = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsLightboxOpen(false);

    if (prefersReducedMotion) {
      setActiveProject(null);
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
      setActiveProject(null);
      setIsOpenAnimated(false);
      setIsClosing(false);
      setIsContentReady(false);
      if (lastActiveTriggerRef.current) {
        lastActiveTriggerRef.current.focus();
      }
    }, 150);
  }, []);

  // Focus lightbox close button when opened
  useEffect(() => {
    if (!isLightboxOpen) return;
    const timer = setTimeout(() => {
      lightboxCloseBtnRef.current?.focus();
    }, 40);
    return () => clearTimeout(timer);
  }, [isLightboxOpen]);

  // Focus trap & Keyboard navigation handler (Detail Modal + Lightbox)
  useEffect(() => {
    if (!activeProject) return;

    if (!isLightboxOpen) {
      const timer = setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [activeProject, isLightboxOpen]);

  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. If Lightbox is open, handle lightbox keyboard events exclusively
      if (isLightboxOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setIsLightboxOpen(false);
          return;
        }

        if (activeProject.images && activeProject.images.length > 1) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setLightboxIndex((prev) =>
              prev > 0 ? prev - 1 : activeProject.images!.length - 1
            );
            return;
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            setLightboxIndex((prev) =>
              prev < activeProject.images!.length - 1 ? prev + 1 : 0
            );
            return;
          }
        }

        if (e.key === 'Tab' && lightboxRef.current) {
          const focusable = lightboxRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        return;
      }

      // 2. If Lightbox is NOT open, handle detail modal keyboard events
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

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProject, isLightboxOpen, handleCloseDetail]);

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] pt-14 sm:pt-16 pb-4 sm:pb-6 px-4 sm:px-8 lg:px-12 text-[#141517] relative flex flex-col justify-between select-none"
    >
      {/* Background layer (below the red thread) */}
      <div className="section-bg" aria-hidden="true">
        <div className="absolute inset-0 bg-[#f4f1ea]" />
      </div>

      <div data-thread-content="1" className="section-content max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* 1. Header with Title and Counter 01 / 05                                    */}
        {/* ========================================================================= */}
        <div className="border-b border-[#ded9ce] pb-2 sm:pb-3">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff3e00] font-bold">
              {tx('02 / PROYECTOS & ARQUITECTURA ANALÍTICA', '02 / PROJECTS & ANALYTICAL ARCHITECTURE')}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display font-light text-2xl sm:text-3xl md:text-4xl text-[#141517] tracking-tight">
              {t('section.projects')}
            </h2>
            <div className="flex items-center gap-2 font-mono text-xs text-[#71717a] flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00]" />
              <span className="tracking-widest font-bold text-[#141517]">01 / 05</span>
            </div>
          </div>
          <p className="font-sans text-xs text-[#71717a] mt-0.5 leading-snug">
            {tx('Análisis de datos en SQL y Power BI, aplicaciones web y laboratorios de redes.', 'SQL and Power BI data analysis, web applications, and networking labs.')}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. Editorial 5-Row Full Width Interactive List                              */}
        {/* ========================================================================= */}
        <div className="projects-list flex-1 flex flex-col justify-between border-b border-[#ded9ce] my-2 sm:my-3">
          {PROJECTS_DATA.map((proj) => {
            const contrast = getContrastColor(proj.accent);

            return (
              <div
                key={proj.id}
                tabIndex={0}
                role="button"
                aria-label={`${tx('Ver detalles del proyecto', 'View details for project')} ${proj.title}`}
                onClick={(e) => handleOpenDetail(proj, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenDetail(proj, e.currentTarget);
                  }
                }}
                data-cursor-text={tx('VER', 'VIEW')}
                data-cursor-bg={proj.accent}
                data-cursor-color={contrast}
                className="project-row group flex-1 flex items-center px-2 sm:px-4 lg:px-6 transition-all duration-300 border-b border-[#ded9ce] last:border-b-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#ff3e00] rounded-lg"
                style={
                  {
                    '--accent': proj.accent,
                    '--accent-contrast': contrast,
                  } as React.CSSProperties
                }
              >
                {/* Horizontal Sweep Layer (Left-to-Right enter, Exit-to-Right) */}
                <div className="project-row-sweep rounded-lg" aria-hidden="true" />

                {/* Row Content Layer */}
                <div className="project-row-content flex items-center justify-between w-full py-2 sm:py-2.5 lg:py-3 gap-2 sm:gap-4 lg:gap-6">
                  {/* Left: Number, Title + Distinct Badge & Category on 2nd Line */}
                  <div className="flex items-start gap-3 sm:gap-4 lg:gap-5 min-w-0">
                    {/* Number in Monospace */}
                    <span className="project-text-dynamic text-xs sm:text-sm font-mono font-bold text-[#ff3e00] w-5 sm:w-6 flex-shrink-0 transition-colors mt-1 sm:mt-1.5">
                      {proj.number}
                    </span>

                    {/* Title + Category Stack */}
                    <div className="flex flex-col min-w-0">
                      <h3 className="project-text-dynamic font-display font-bold tracking-tight whitespace-nowrap text-xl sm:text-2xl md:text-3xl lg:text-[2.35rem] xl:text-[2.75rem] text-[#141517] leading-[1.12] transition-colors">
                        {proj.title}
                      </h3>

                      {/* Category in small monospace on second line with generous descender clearance */}
                      <span className="project-text-dynamic text-[10px] sm:text-[11px] font-mono text-[#71717a] transition-colors truncate mt-2 sm:mt-2.5 block">
                        {proj.category}
                      </span>
                    </div>
                  </div>

                  {/* Right: Rounded Tags & Arrow */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <div className="hidden sm:flex flex-wrap items-center gap-1 sm:gap-1.5 justify-end">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="project-tag-pill px-2 sm:px-2.5 py-0.5 rounded-full bg-[#eae6dc] text-[#2e3038] text-[9px] sm:text-[10px] font-mono border border-[#ded9ce] transition-colors whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="project-text-dynamic text-sm sm:text-base font-mono font-bold text-[#ff3e00] group-hover:translate-x-1 transition-transform ml-1 sm:ml-2">
                      →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. In-Place Expanded Detail Panel (Portal to document.body, Zero Blur)     */}
      {/* ========================================================================= */}
      {activeProject && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
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
            className={`bg-[#18191e] border border-[#2e3038] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[88vh] flex flex-col p-4 sm:p-6 lg:p-7 transition-all duration-200 ease-out ${
              isClosing
                ? 'opacity-0 scale-95 translate-y-2'
                : isOpenAnimated
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-2'
            }`}
            style={{
              willChange: !isContentReady || isClosing ? 'transform, opacity' : 'auto',
            }}
          >
            {/* Detail Top Header (Full width across top) */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3 sm:pb-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activeProject.accent }}
                  />
                  <span
                    className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${activeProject.accent}20`,
                      color: activeProject.accent,
                    }}
                  >
                    {activeProject.number}
                  </span>
                  <h3 id="project-detail-title" className="font-display font-bold text-lg sm:text-xl md:text-2xl text-white">
                    {activeProject.title}
                  </h3>
                </div>
                <p className="text-xs font-mono text-[#a1a1aa] mt-1">
                  {activeProject.category}
                </p>
              </div>

              {/* Close Button X */}
              <button
                ref={closeButtonRef}
                onClick={handleCloseDetail}
                aria-label={tx('Cerrar detalle del proyecto', 'Close project details')}
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3e00] cursor-pointer"
              >
                <span className="text-base leading-none">✕</span>
              </button>
            </div>

            {/* Detail Body (Staggered Content: Fades in cleanly after frame finishes opening) */}
            <div
              className={`flex-1 min-h-0 pt-3 sm:pt-4 transition-opacity duration-150 ${
                isContentReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {(() => {
                const hasImages = Boolean(activeProject.images && activeProject.images.length > 0);

                return (
                  <div
                    className={`h-full flex flex-col ${
                      hasImages
                        ? 'lg:flex-row lg:items-stretch gap-4 sm:gap-5 lg:gap-7 overflow-y-auto lg:overflow-visible'
                        : 'w-full overflow-y-auto lg:overflow-visible'
                    }`}
                  >
                    {/* ========================================================================= */}
                    {/* Left Column: Image & Thumbnails (~40% on desktop, max-h 50vh, no scroll)  */}
                    {/* ========================================================================= */}
                    {hasImages && (
                      <div className="w-full lg:w-[42%] flex-shrink-0 flex flex-col justify-start">
                        {/* Main Image Container */}
                        <div
                          tabIndex={0}
                          role="button"
                          aria-label={`${tx('Ampliar imagen:', 'Enlarge image:')} ${activeProject.images![selectedImageIndex]?.alt || activeProject.title}`}
                          onClick={() => {
                            setLightboxIndex(selectedImageIndex);
                            setIsLightboxOpen(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setLightboxIndex(selectedImageIndex);
                              setIsLightboxOpen(true);
                            }
                          }}
                          className="w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] max-h-[18vh] sm:max-h-[22vh] lg:max-h-[50vh] bg-[#0e0f12] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center cursor-zoom-in relative group outline-none focus-visible:ring-2 focus-visible:ring-[#ff3e00]"
                        >
                          <img
                            src={activeProject.images![selectedImageIndex]?.src}
                            alt={activeProject.images![selectedImageIndex]?.alt}
                            loading="lazy"
                            className={`w-full h-full object-contain p-1 sm:p-2 transition-opacity duration-200 ${
                              isImageFading ? 'opacity-0' : 'opacity-100'
                            }`}
                          />
                          {/* Zoom button badge */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxIndex(selectedImageIndex);
                              setIsLightboxOpen(true);
                            }}
                            aria-label={tx('Ampliar imagen', 'Enlarge image')}
                            className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-[#0c0d0f]/85 hover:bg-[#18191e] border border-white/15 text-[10px] font-mono text-white/90 opacity-90 group-hover:opacity-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <span>{tx('Ampliar', 'Enlarge')}</span>
                            <span aria-hidden="true">⤢</span>
                          </button>
                        </div>

                        {/* Caption if provided */}
                        {activeProject.images![selectedImageIndex]?.caption && (
                          <p className="text-[11px] font-mono text-[#a1a1aa] text-center pt-1.5 leading-tight">
                            {activeProject.images![selectedImageIndex]?.caption}
                          </p>
                        )}

                        {/* Thumbnails row below (if > 1 image) */}
                        {activeProject.images!.length > 1 && (
                          <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1">
                            {activeProject.images!.map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectImage(idx)}
                                className={`w-14 sm:w-16 h-10 sm:h-12 rounded-lg overflow-hidden border transition-all cursor-pointer flex-shrink-0 bg-[#0e0f12] ${
                                  idx === selectedImageIndex
                                    ? 'border-[#ff3e00] ring-1 ring-[#ff3e00] opacity-100'
                                    : 'border-white/15 opacity-60 hover:opacity-100'
                                }`}
                                aria-label={`${tx('Ver imagen', 'View image')} ${idx + 1}: ${img.alt}`}
                              >
                                <img
                                  src={img.src}
                                  alt=""
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* Right Column: Text & Actions (~60% on desktop, or 100% if no images)       */}
                    {/* ========================================================================= */}
                    <div
                      className={`flex-1 min-w-0 flex flex-col justify-between ${
                        hasImages
                          ? 'w-full lg:w-[58%] overflow-y-auto lg:pr-1 space-y-3'
                          : 'w-full overflow-y-auto pr-1 space-y-3'
                      }`}
                    >
                      <div className="space-y-2.5 sm:space-y-3">
                        {/* Summary Paragraph */}
                        <p className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed font-sans">
                          {activeProject.summary}
                        </p>

                        {/* Big Number Cards for Olist Findings (if any) */}
                        {activeProject.findings && activeProject.findings.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold block text-white/70">
                              {tx('HALLAZGOS CLAVE DEL ANÁLISIS:', 'KEY FINDINGS:')}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {activeProject.findings.map((f, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="p-2.5 sm:p-3 rounded-xl bg-[#0e0f12] border border-white/10 flex flex-col justify-between"
                                >
                                  <span className="text-[9px] sm:text-[10px] font-mono text-[#8a8a93] uppercase tracking-wider block">
                                    {f.label}
                                  </span>
                                  <span
                                    className="font-display font-extrabold text-lg sm:text-xl tracking-tight mt-0.5"
                                    style={{ color: activeProject.accent }}
                                  >
                                    {f.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Detail Bullets (Process, architecture, analytical criteria) */}
                        <div className="space-y-1.5 sm:space-y-2">
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold block text-white/70">
                            {tx('ARQUITECTURA & CARACTERÍSTICAS TÉCNICAS:', 'ARCHITECTURE & TECHNICAL FEATURES:')}
                          </span>
                          <ul className="space-y-1 sm:space-y-1.5 text-xs text-[#d4d4d8] font-sans">
                            {activeProject.detailBullets.map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span
                                  className="font-bold mt-0.5 flex-shrink-0 text-xs"
                                  style={{ color: activeProject.accent }}
                                >
                                  ―
                                </span>
                                <span className="leading-snug">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tags & Stack */}
                        <div className="pt-1.5 flex flex-wrap gap-1 font-mono text-[10px] sm:text-[11px]">
                          {activeProject.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-white/5 text-white/90 border border-white/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons: Repository, Live Demo & SQL Query Trigger (Anchored at the bottom) */}
                      <div className="pt-2.5 sm:pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 mt-auto flex-shrink-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {activeProject.links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer text-white border"
                              style={{
                                backgroundColor: lIdx === 0 ? activeProject.accent : 'transparent',
                                borderColor: activeProject.accent,
                              }}
                            >
                              <span>{link.label}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          ))}
                        </div>

                        {/* SQL Query Action Button */}
                        <button
                          onClick={() => {
                            onOpenQuery(`SELECT * FROM proyectos WHERE id = ${activeProject.id};`);
                            handleCloseDetail();
                          }}
                          className="px-3 py-1.5 rounded-full border border-white/20 hover:border-white/50 text-[#d4d4d8] hover:text-white transition-colors text-xs font-mono cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span className="truncate max-w-[200px] sm:max-w-none">
                            SELECT * FROM proyectos WHERE id = {activeProject.id};
                          </span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 5. In-Place Lightbox Overlay (Solid dark, zero blur, trapped focus)        */}
      {/* ========================================================================= */}
      {isLightboxOpen && activeProject && activeProject.images && activeProject.images.length > 0 && typeof document !== 'undefined' && createPortal(
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${tx('Vista ampliada:', 'Enlarged view:')} ${activeProject.images[lightboxIndex]?.alt || activeProject.title}`}
          className="fixed inset-0 z-50 bg-[#0c0d0f]/95 flex flex-col justify-between p-4 sm:p-6 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLightboxOpen(false);
            }
          }}
        >
          {/* Top Bar with title / counter and close button */}
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto pb-3 border-b border-white/10 text-white">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-sm sm:text-base tracking-tight">
                {activeProject.title}
              </span>
              {activeProject.images.length > 1 && (
                <span className="text-xs font-mono text-[#a1a1aa]">
                  {lightboxIndex + 1} / {activeProject.images.length}
                </span>
              )}
            </div>

            <button
              ref={lightboxCloseBtnRef}
              onClick={() => setIsLightboxOpen(false)}
              aria-label={tx('Cerrar vista ampliada', 'Close enlarged view')}
              className="w-9 h-9 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3e00] cursor-pointer"
            >
              <span className="text-base leading-none">✕</span>
            </button>
          </div>

          {/* Main expanded image with navigation arrows */}
          <div className="flex-1 flex items-center justify-center relative w-full max-w-6xl mx-auto my-3 overflow-hidden">
            {activeProject.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev > 0 ? prev - 1 : activeProject.images!.length - 1
                  );
                }}
                aria-label={tx('Imagen anterior', 'Previous image')}
                className="absolute left-2 sm:left-4 z-10 w-10 h-10 rounded-full bg-[#18191e]/90 hover:bg-[#252730] border border-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3e00] cursor-pointer shadow-lg"
              >
                <span className="text-xl leading-none">←</span>
              </button>
            )}

            <img
              src={activeProject.images[lightboxIndex]?.src}
              alt={activeProject.images[lightboxIndex]?.alt}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {activeProject.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev < activeProject.images!.length - 1 ? prev + 1 : 0
                  );
                }}
                aria-label={tx('Imagen siguiente', 'Next image')}
                className="absolute right-2 sm:right-4 z-10 w-10 h-10 rounded-full bg-[#18191e]/90 hover:bg-[#252730] border border-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3e00] cursor-pointer shadow-lg"
              >
                <span className="text-xl leading-none">→</span>
              </button>
            )}
          </div>

          {/* Bottom caption / alt text */}
          <div className="w-full max-w-3xl mx-auto pt-2 text-center">
            <p className="text-xs sm:text-sm text-[#d4d4d8] font-sans">
              {activeProject.images[lightboxIndex]?.caption || activeProject.images[lightboxIndex]?.alt}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
