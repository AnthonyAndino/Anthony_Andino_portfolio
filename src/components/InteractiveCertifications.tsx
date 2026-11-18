import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Certification } from '../types/portfolio';

interface InteractiveCertificationsProps {
  certs: Certification[];
  onOpenQuery: (query: string) => void;
}

export const InteractiveCertifications: React.FC<InteractiveCertificationsProps> = ({
  certs,
  onOpenQuery,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedCert, setExpandedCert] = useState<Certification | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Drag interaction state
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const pointerStartTime = useRef<number>(0);
  const isPointerDown = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalCloseBtnRef = useRef<HTMLButtonElement>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const total = certs.length;

  // Circular navigation (wraps around)
  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Keyboard navigation for carousel
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (expandedCert) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext, expandedCert]
  );

  // Modal Escape key and focus trap
  useEffect(() => {
    if (!expandedCert) return;
    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedCert(null);
      }
    };
    window.addEventListener('keydown', handleModalKeyDown);
    modalCloseBtnRef.current?.focus();
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [expandedCert]);

  // Pointer event handlers for drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isPointerDown.current = true;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    pointerStartTime.current = performance.now();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current || pointerStartX.current === null || pointerStartY.current === null) {
      isPointerDown.current = false;
      return;
    }
    const deltaX = e.clientX - pointerStartX.current;
    const deltaY = e.clientY - pointerStartY.current;
    const deltaTime = performance.now() - pointerStartTime.current;
    const dist = Math.hypot(deltaX, deltaY);

    if (dist >= 5) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < -50 || (deltaX < -25 && deltaTime < 280)) {
          handleNext();
        } else if (deltaX > 50 || (deltaX > 25 && deltaTime < 280)) {
          handlePrev();
        }
      }
    }

    isPointerDown.current = false;
    pointerStartX.current = null;
    pointerStartY.current = null;
  };

  // Helper: compute circular offset (0 = activa, 1 = 1ª detrás, etc.)
  const getCircularOffset = (index: number): number => {
    return ((index - activeIndex) % total + total) % total;
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Carrusel de certificaciones internacionales"
      onKeyDown={handleKeyDown}
      className="w-full min-h-0 bg-[#121316] rounded-[24px] border border-white/[0.08] p-5 sm:p-6 lg:p-7 outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00] flex flex-col justify-center shadow-none select-none"
    >
      {/* ================================================================= */}
      {/* 1. DESKTOP (≥ 1024px): Layout fiel a la referencia                  */}
      {/* ================================================================= */}
      <div className="hidden lg:grid lg:grid-cols-[clamp(280px,32%,360px)_1fr] gap-6 xl:gap-8 items-stretch w-full h-[clamp(340px,46vh,440px)] min-h-0">
        
        {/* Columna Izquierda: Formación + Lista + Flechas/Contador al pie */}
        <div className="flex flex-col justify-between h-full min-h-0">
          
          {/* Header de la columna: Título "Formación" */}
          <div className="flex items-baseline justify-between pb-3 flex-shrink-0">
            <h2 className="font-display font-bold text-2xl xl:text-3xl text-white tracking-tight">
              Formación
            </h2>
            <button
              type="button"
              onClick={() => onOpenQuery('SELECT * FROM certificaciones;')}
              className="text-[11px] font-mono text-[#ff3e00] hover:underline cursor-pointer flex-shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00] rounded"
            >
              SELECT * FROM certificaciones;
            </button>
          </div>

          {/* Lista de certificaciones con formato idéntico a la referencia */}
          <div className="flex-1 flex flex-col justify-evenly py-1 min-h-0">
            {certs.map((cert, index) => {
              const isActive = index === activeIndex;
              // Extraer año de cert.fecha (ej: "Julio 2026" -> "2026")
              const yearMatch = cert.fecha?.match(/\b\d{4}\b/)?.[0] || '2026';

              return (
                <div
                  key={cert.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                  aria-label={`Seleccionar certificación ${index + 1}: ${cert.nombre}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group relative flex items-center justify-between py-2 px-2 transition-all cursor-pointer border-b border-white/[0.07] outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00] ${
                    isActive ? 'border-b-[#ff3e00]' : 'hover:border-b-white/20'
                  }`}
                >
                  {/* Año a la izquierda en monospace tenue */}
                  <span
                    className={`font-mono text-xs w-16 flex-shrink-0 transition-colors ${
                      isActive ? 'text-[#ff3e00] font-semibold' : 'text-white/40 group-hover:text-white/70'
                    }`}
                  >
                    {yearMatch}
                  </span>

                  {/* Título de la certificación */}
                  <h4
                    className={`font-sans text-[13px] xl:text-[14px] leading-snug flex-1 truncate transition-colors ${
                      isActive
                        ? 'text-white font-medium'
                        : 'text-white/60 group-hover:text-white'
                    }`}
                  >
                    {cert.nombre}
                  </h4>

                  {/* Indicador sutil de selección si está activo */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00] flex-shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Pie de lista: Contador 02 / 06 + Flechas circulares + Instrucción */}
          <div className="pt-3 flex flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Contador "01 / 06" */}
              <div aria-live="polite" className="font-mono text-xs tracking-widest">
                <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, '0')}</span>
                <span className="text-white/30 font-normal"> / </span>
                <span className="text-white/60">{String(total).padStart(2, '0')}</span>
              </div>

              {/* Botones de navegación redondos tipo la referencia */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Certificación anterior"
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/[0.04] text-white/80 hover:text-white hover:border-[#ff3e00] hover:bg-[#ff3e00]/10 flex items-center justify-center transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00] active:scale-95 text-xs font-mono"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Certificación siguiente"
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/[0.04] text-white/80 hover:text-white hover:border-[#ff3e00] hover:bg-[#ff3e00]/10 flex items-center justify-center transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00] active:scale-95 text-xs font-mono"
                >
                  →
                </button>
              </div>
            </div>

            {/* Texto de ayuda en monoespaciada pequeña */}
            <span className="text-[9.5px] font-mono tracking-wider text-white/35 uppercase">
              HAZ CLIC EN UNA CARTA O ARRASTRA LA PRIMERA
            </span>
          </div>
        </div>

        {/* Columna Derecha: Cartas Apiladas como en la referencia */}
        <div
          className="relative h-full w-full overflow-hidden flex items-center select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {certs.map((cert, index) => {
            const circularOffset = getCircularOffset(index);
            const isActive = circularOffset === 0;
            const isBack = circularOffset >= 1 && circularOffset <= 3;
            const isHidden = circularOffset > 3;

            const isHovered = hoveredIndex === index;
            let translateX = 0;
            let scaleY = 1;
            let opacity = 0;
            let zIndex = 10;
            let pointerEvents: 'auto' | 'none' = 'none';

            if (isActive) {
              translateX = 0;
              scaleY = 1;
              opacity = 1;
              zIndex = 40;
              pointerEvents = 'auto';
            } else if (isBack) {
              // Franja visible de 145px para que se distinga mucho más de cada carta detrás
              translateX = circularOffset * 145 - (isHovered ? 10 : 0);
              scaleY = 1 - 0.04 * circularOffset;
              opacity = 1;
              zIndex = 30 - circularOffset * 5;
              pointerEvents = 'auto';
            } else if (isHidden) {
              translateX = 3 * 145;
              scaleY = 1 - 0.04 * 3;
              opacity = 0;
              zIndex = 10;
              pointerEvents = 'none';
            }

            // Capa tenue sobre las cartas traseras
            const overlayOpacity = isBack
              ? isHovered
                ? circularOffset === 1
                  ? 'bg-black/10'
                  : circularOffset === 2
                  ? 'bg-black/20'
                  : 'bg-black/30'
                : circularOffset === 1
                ? 'bg-black/20'
                : circularOffset === 2
                ? 'bg-black/30'
                : 'bg-black/40'
              : 'bg-transparent';

            const hasValidDate = cert.fecha && cert.fecha !== 'FECHA_AQUI';

            return (
              <div
                key={cert.id}
                role="region"
                aria-label={`Certificación ${index + 1} de ${total}: ${cert.nombre}`}
                style={{
                  transform: reducedMotion
                    ? 'none'
                    : `translate3d(${translateX}px, 0, 0) scaleY(${scaleY})`,
                  transformOrigin: 'center center',
                  opacity: reducedMotion ? (isActive ? 1 : 0) : opacity,
                  zIndex,
                  pointerEvents,
                  boxShadow: isActive
                    ? '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px -5px rgba(255, 62, 0, 0.2)'
                    : '0 10px 25px -10px rgba(0, 0, 0, 0.5)',
                  transition: reducedMotion
                    ? 'none'
                    : 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 450ms ease-out',
                }}
                className={`absolute left-0 w-[clamp(320px,calc(100%-336px),480px)] h-full rounded-[16px] border bg-[#16171b] text-white p-3.5 sm:p-4 flex flex-col overflow-hidden ${
                  isActive ? 'border-[#ff3e00]/40 ring-1 ring-[#ff3e00]/20' : 'border-white/10'
                }`}
              >
                {/* 1. ZONA SUPERIOR: Certificado (~54% del alto) que llena el contorno del recuadro */}
                <div
                  onClick={(e) => {
                    if (!isActive) return;
                    e.stopPropagation();
                    setExpandedCert(cert);
                  }}
                  title={isActive ? 'Clic para ampliar certificado' : undefined}
                  className={`w-full h-[54%] rounded-[10px] bg-white border border-[#2b2c34] p-0 flex items-center justify-center relative overflow-hidden flex-shrink-0 ${
                    isActive ? 'cursor-zoom-in group' : ''
                  }`}
                >
                  {cert.imagen ? (
                    <img
                      src={cert.imagen}
                      alt={`Certificado ${cert.nombre}`}
                      className="w-full h-full object-cover select-none transition-transform duration-200 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#15161a] rounded-[6px]">
                      <span
                        className="font-mono text-5xl font-light"
                        style={{ WebkitTextStroke: '1.5px #ff3e00', color: 'transparent' }}
                      >
                        {cert.fecha?.match(/\b\d{4}\b/)?.[0] || String(cert.id).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. ZONA INFERIOR: Metadatos & Botón Verificar alineado a la derecha */}
                <div
                  className={`w-full flex-1 min-h-0 flex flex-col justify-between pt-2 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  inert={!isActive ? true : undefined}
                >
                  <div className="min-h-0 flex flex-col gap-0.5">
                    {/* Título de la certificación */}
                    <h4 className="font-display font-bold text-[15px] sm:text-base text-[#f4f1ea] tracking-tight leading-snug line-clamp-1">
                      {cert.nombre}
                    </h4>

                    {/* Emisor y fecha */}
                    <div className="font-mono text-[10px] text-[#ff3e00] font-semibold uppercase tracking-wider">
                      <span>{cert.emisor}</span>
                      {hasValidDate && (
                        <>
                          <span className="text-white/30 mx-1">·</span>
                          <span className="text-[#a1a1aa] font-normal">{cert.fecha}</span>
                        </>
                      )}
                    </div>

                    {/* Descripción concisa (hasta 2 líneas completas legibles) */}
                    {cert.descripcion && (
                      <p className="font-sans text-[11px] text-[#b0b0b8] leading-relaxed line-clamp-2 mt-0.5">
                        {cert.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Botón Verificar en Credly en la parte DERECHA */}
                  {cert.urlVerificacion && (
                    <div className="pt-1.5 flex items-center justify-end">
                      <a
                        href={cert.urlVerificacion}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Verificar credencial de ${cert.nombre} en Credly (se abre en una pestaña nueva)`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3e00] hover:bg-[#e03700] text-white font-mono text-[10.5px] font-semibold transition-colors shadow-xs group outline-none focus-visible:ring-1 focus-visible:ring-white"
                      >
                        <span>Verificar en Credly</span>
                        <svg
                          className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* Overlay de clic para las cartas de atrás (en la franja visible) */}
                {isBack && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(index);
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    aria-label={`Ir a la certificación ${index + 1} de ${total}, ${cert.nombre}`}
                    className="absolute right-0 top-0 w-[145px] h-full cursor-pointer z-10 outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00] rounded-r-[16px]"
                  />
                )}

                {/* Capa de contraste para cartas traseras */}
                {isBack && (
                  <div
                    className={`absolute inset-0 rounded-[16px] pointer-events-none transition-colors duration-300 ${overlayOpacity}`}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. MOBILE (< 1024px): Carrusel horizontal con scroll-snap           */}
      {/* ================================================================= */}
      <div className="lg:hidden flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-white">Formación</h3>
            <span aria-live="polite" className="font-mono text-xs text-white/70 font-bold">
              {String(activeIndex + 1).padStart(2, '0')}{' '}
              <span className="text-white/40">/</span> {String(total).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Certificación anterior"
                className="w-6 h-6 rounded-full border border-white/20 bg-white/[0.05] text-[#f4f1ea] text-xs flex items-center justify-center cursor-pointer shadow-2xs"
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Certificación siguiente"
                className="w-6 h-6 rounded-full border border-white/20 bg-white/[0.05] text-[#f4f1ea] text-xs flex items-center justify-center cursor-pointer shadow-2xs"
              >
                →
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenQuery('SELECT * FROM certificaciones;')}
            className="text-[10px] font-mono text-[#ff3e00] hover:underline cursor-pointer"
          >
            SELECT * FROM certificaciones;
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 py-2 scroll-smooth snap-x snap-mandatory scrollbar-none w-full">
          {certs.map((cert, index) => (
            <div
              key={cert.id}
              role="region"
              aria-label={`Certificación ${index + 1} de ${total}: ${cert.nombre}`}
              className="w-[85vw] max-w-[340px] flex-shrink-0 snap-center rounded-[14px] bg-[#16171b] border border-white/10 text-white p-3.5 flex flex-col gap-3 shadow-lg"
            >
              <div
                onClick={() => setExpandedCert(cert)}
                className="w-full aspect-[16/10] rounded-[8px] bg-white border border-[#2b2c34] p-1 flex items-center justify-center relative overflow-hidden cursor-zoom-in"
              >
                {cert.imagen ? (
                  <img
                    src={cert.imagen}
                    alt={`Certificado ${cert.nombre}`}
                    style={
                      cert.rotate
                        ? {
                            transform: `rotate(${cert.rotate}deg)`,
                            maxHeight: '80%',
                            maxWidth: '135%',
                          }
                        : undefined
                    }
                    className="max-w-full max-h-full object-contain select-none"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#15161a] rounded-[6px]">
                    <span
                      className="font-mono text-5xl font-light"
                      style={{ WebkitTextStroke: '1.8px #ff3e00', color: 'transparent' }}
                    >
                      {cert.fecha?.match(/\b\d{4}\b/)?.[0] || String(cert.id).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-[#f4f1ea] leading-snug line-clamp-2">
                  {cert.nombre}
                </h4>
                <div className="font-mono text-[10px] text-[#ff3e00] font-semibold uppercase tracking-wider mt-1">
                  <span>{cert.emisor}</span>
                  {cert.fecha && cert.fecha !== 'FECHA_AQUI' && (
                    <>
                      <span className="text-white/30 mx-1">·</span>
                      <span className="text-[#a1a1aa] font-normal">{cert.fecha}</span>
                    </>
                  )}
                </div>
                {cert.descripcion && (
                  <p className="font-sans text-[11px] text-[#b0b0b8] leading-relaxed line-clamp-3 mt-1.5">
                    {cert.descripcion}
                  </p>
                )}
              </div>

              {cert.urlVerificacion && (
                <div className="pt-1 flex justify-end">
                  <a
                    href={cert.urlVerificacion}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Verificar credencial de ${cert.nombre} en Credly (se abre en una pestaña nueva)`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3e00] text-white font-mono text-[10px] font-semibold"
                  >
                    <span>Verificar en Credly</span>
                    <svg
                      className="w-2.5 h-2.5"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. LIGHTBOX MODAL: Vista ampliada del certificado                  */}
      {/* ================================================================= */}
      {expandedCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de ${expandedCert.nombre}`}
          onClick={() => setExpandedCert(null)}
          className="fixed inset-0 z-[9999] bg-[#0e0f12]/95 flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full bg-[#15161a] border border-[#ff3e00]/50 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="min-w-0 pr-4">
                <h3 className="font-display font-bold text-base sm:text-lg text-white truncate">
                  {expandedCert.nombre}
                </h3>
                <p className="font-mono text-xs text-[#ff3e00] mt-0.5">
                  {expandedCert.emisor}
                  {expandedCert.fecha && expandedCert.fecha !== 'FECHA_AQUI' ? ` · ${expandedCert.fecha}` : ''}
                </p>
              </div>
              <button
                ref={modalCloseBtnRef}
                type="button"
                onClick={() => setExpandedCert(null)}
                aria-label="Cerrar vista ampliada"
                className="w-8 h-8 rounded-full border border-white/20 hover:border-[#ff3e00] hover:text-[#ff3e00] text-white flex items-center justify-center transition-colors text-sm font-mono cursor-pointer flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-[300px] max-h-[68vh] w-full bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden border border-[#2b2c34]">
              {expandedCert.imagen ? (
                <img
                  src={expandedCert.imagen}
                  alt={`Certificado ${expandedCert.nombre}`}
                  className="max-w-full max-h-full object-contain select-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#15161a] rounded-lg">
                  <span
                    className="font-mono text-7xl font-light"
                    style={{ WebkitTextStroke: '2px #ff3e00', color: 'transparent' }}
                  >
                    {expandedCert.fecha?.match(/\b\d{4}\b/)?.[0] || String(expandedCert.id).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {expandedCert.urlVerificacion && (
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
                <span className="text-[#a1a1aa] hidden sm:inline">Credencial oficial verificada</span>
                <a
                  href={expandedCert.urlVerificacion}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Verificar credencial de ${expandedCert.nombre} en Credly (se abre en una pestaña nueva)`}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ff3e00] hover:bg-[#e03700] text-white font-semibold transition-colors"
                >
                  <span>Verificar en Credly</span>
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
