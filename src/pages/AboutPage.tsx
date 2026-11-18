import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { usePortfolioData } from '../i18n/usePortfolioData';
import { InteractiveCertifications } from '../components/InteractiveCertifications';

interface AboutPageProps {
  onOpenQuery: (query: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenQuery }) => {
  const { tx } = useLanguage();
  const { PORTFOLIO_DB, ABOUT_DATA } = usePortfolioData();

  const certs = PORTFOLIO_DB.certificaciones;
  const [photoError, setPhotoError] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', listener);

    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 50);

    return () => {
      media.removeEventListener('change', listener);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] w-full bg-[#f4f1ea] text-[#141517] select-none flex flex-col justify-between pt-10 sm:pt-12 pb-2 sm:pb-3 px-0 relative overflow-y-auto lg:overflow-hidden transition-colors duration-500"
    >
      {/* Background layer (below the red thread) */}
      <div className="section-bg" aria-hidden="true">
        <div className="absolute inset-0 bg-[#f4f1ea]" />
      </div>

      <div className="section-content w-full flex-1 flex flex-col justify-between my-auto gap-[clamp(16px,2vh,32px)] min-h-0">
        {/* ========================================================================= */}
        {/* 1. ZONA SUPERIOR: Dos Columnas (Bio + Ilustración) - Alineación max-w-7xl  */}
        {/* ========================================================================= */}
        <div data-thread-content="1" className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 xl:pl-[240px] flex-shrink-0">
          <section
            aria-label={tx('Presentación y formación de Anthony Andino', 'Introduction and education of Anthony Andino')}
            className="flex-shrink-0 flex flex-col lg:flex-row items-start justify-start gap-[clamp(32px,4vw,64px)] border-b border-[#ded9ce] pb-3"
          >
          {/* Columna Izquierda: Presentación (hasta 760px ancho, max 70ch) */}
          <div className="w-full lg:max-w-[760px] xl:max-w-[610px] flex-shrink-0 flex flex-col justify-start">
            {/* Etiqueta pequeña */}
            <span
              style={{
                opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                transform: reducedMotion ? 'none' : isAnimated ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 350ms ease-out, transform 350ms ease-out',
              }}
              className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#ff3e00] font-bold block mb-1"
            >
              {tx('04 / FORMACIÓN & CERTIFICACIONES', '04 / EDUCATION & CERTIFICATIONS')}
            </span>

            {/* Título: "About" en sans grande con "Anthony" en serif cursiva */}
            <h2
              style={{
                opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                transform: reducedMotion ? 'none' : isAnimated ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 400ms ease-out 60ms, transform 400ms ease-out 60ms',
              }}
              className="font-sans font-light text-3xl sm:text-4xl lg:text-[2.5rem] text-[#141517] tracking-tight leading-none mb-2.5"
            >
              {tx('Sobre', 'About')} <span className="font-serif italic font-normal text-[#ff3e00]">Anthony</span>
            </h2>

            {/* Texto de presentación: 3 párrafos compactos (clamp 15px - 18px, leading 1.5, max 70ch) */}
            <div className="space-y-2 mb-2.5 max-w-[70ch]">
              {ABOUT_DATA.bio.map((paragraph, pIdx) => (
                <p
                  key={pIdx}
                  style={{
                    opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                    transform: reducedMotion ? 'none' : isAnimated ? 'translateY(0)' : 'translateY(10px)',
                    transition: `opacity 400ms ease-out ${100 + pIdx * 60}ms, transform 400ms ease-out ${100 + pIdx * 60}ms`,
                    fontSize: 'clamp(15px, calc(0.75vw + 7px), 18px)',
                    lineHeight: 1.5,
                    textWrap: 'pretty',
                  }}
                  className="font-sans text-[#2e3036] font-normal [text-wrap:pretty]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Fila de etiquetas redondeadas en monoespaciada (solo tags) */}
            <div
              style={{
                opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                transform: reducedMotion ? 'none' : isAnimated ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 400ms ease-out 280ms, transform 400ms ease-out 280ms',
              }}
              className="flex flex-wrap items-center gap-1.5"
            >
              {ABOUT_DATA.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full border border-[#ded9ce] bg-white/70 text-[#141517] font-mono text-[11px] font-medium shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Ilustración cuadrada clamp(200px, 29vh, 270px) + Educación/Idiomas alineados a su izquierda */}
          <div className="flex-shrink-0 flex flex-col items-start lg:pt-1">
            <div
              style={{
                opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                transform: reducedMotion
                  ? 'rotate(3deg)'
                  : isAnimated
                  ? 'translateY(0) rotate(3deg)'
                  : 'translateY(-12px) rotate(0deg)',
                transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease-out',
              }}
              className="relative p-1 bg-white border border-[#ded9ce] rounded-2xl shadow-md w-[clamp(200px,29vh,270px)] aspect-square flex items-center justify-center group hover:rotate-0 transition-transform duration-300"
            >
              {!photoError ? (
                <img
                  src="/about/profilepic.jfif"
                  alt={tx('Foto de Anthony Andino', 'Photo of Anthony Andino')}
                  onError={() => setPhotoError(true)}
                  className="w-full h-full object-cover rounded-xl select-none"
                  loading="lazy"
                />
              ) : (
                /* Fallback: Monograma "AA" en un marco con la misma forma */
                <div className="w-full h-full rounded-xl bg-[#ece7dc] flex items-center justify-center font-display font-bold text-3xl sm:text-4xl text-[#ff3e00] tracking-wider border border-[#ded9ce]">
                  AA
                </div>
              )}

              {/* Píldora Superior: "TEGUCIGALPA, HN" */}
              <div
                style={{
                  opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                  transform: reducedMotion ? 'none' : isAnimated ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 400ms ease-out 300ms, transform 400ms ease-out 300ms',
                }}
                className="absolute -top-2.5 -left-2.5 bg-[#141517] text-white px-2.5 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-bold shadow-md select-none border border-white/20"
              >
                TEGUCIGALPA, HN
              </div>

              {/* Píldora Inferior: "UNAH · LIC. 2026" */}
              <div
                style={{
                  opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                  transform: reducedMotion ? 'none' : isAnimated ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 400ms ease-out 360ms, transform 400ms ease-out 360ms',
                }}
                className="absolute -bottom-2.5 -right-2 bg-white text-[#141517] border border-[#ded9ce] px-2.5 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-bold shadow-md select-none"
              >
                UNAH · LIC. 2026
              </div>
            </div>

            {/* Debajo de la ilustración: Educación e Idiomas compactos y alineados a la izquierda de la ilustración */}
            <div className="w-[clamp(200px,29vh,270px)] mt-2.5 space-y-1 text-left">
              {/* Línea compacta con título universitario */}
              <div
                style={{
                  opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                  transform: reducedMotion ? 'none' : isAnimated ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 400ms ease-out 320ms, transform 400ms ease-out 320ms',
                }}
                className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10.5px] font-mono text-[#71717a]"
              >
                <span className="text-[#141517] font-semibold">
                  {tx('Licenciatura en Informática Administrativa', "Bachelor's Degree in Administrative Informatics")}
                </span>
                <span>·</span>
                <span>UNAH</span>
                <span>·</span>
                <span>2020–2026</span>
                <span>·</span>
                <span className="text-emerald-800 font-bold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 text-[9.5px]">
                  {tx('Titulado', 'Degree Awarded')}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenQuery('SELECT * FROM educacion;')}
                  className="px-1.5 py-0.5 rounded-full border border-[#141517] hover:bg-[#141517] hover:text-white transition-colors text-[9px] font-mono cursor-pointer ml-0.5 flex-shrink-0"
                >
                  SELECT * FROM educacion;
                </button>
              </div>

              {/* Línea de idiomas */}
              <div
                style={{
                  opacity: reducedMotion ? 1 : isAnimated ? 1 : 0,
                  transform: reducedMotion ? 'none' : isAnimated ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 400ms ease-out 360ms, transform 400ms ease-out 360ms',
                }}
                className="text-[10.5px] font-mono text-[#71717a]"
              >
                <span>{tx('Idiomas: ', 'Languages: ')}</span>
                <strong className="text-[#141517]">{tx('Español (Nativo)', 'Spanish (Native)')}</strong>
                <span className="mx-1">·</span>
                <strong className="text-[#ff3e00]">{tx('Inglés (B1)', 'English (B1)')}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 2. ZONA INFERIOR: Certificaciones                                          */}
      {/* ========================================================================= */}
      <section
        aria-label={tx('Certificaciones internacionales oficiales', 'Official international certifications')}
        className="flex-1 min-h-0 w-full flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12"
      >
        <div className="max-w-7xl w-full mx-auto min-h-0 flex flex-col justify-center">
          <InteractiveCertifications certs={certs} onOpenQuery={onOpenQuery} />
        </div>
      </section>
    </div>
  </div>
);
};
