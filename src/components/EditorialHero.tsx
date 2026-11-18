import React from 'react';
import { PORTFOLIO_DB } from '../data/portfolioData';
import { ArrowUpRight } from './Icons';

interface EditorialHeroProps {
  onQuickQuery: (query: string) => void;
  onOpenIndex: () => void;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({ onQuickQuery, onOpenIndex }) => {
  const perfil = PORTFOLIO_DB.perfil[0];

  return (
    <section className="relative pt-8 sm:pt-14 pb-16 border-b border-editorial-border select-none overflow-hidden">
      {/* Top category indicator (Edison Fang style: INTERIOR · EXHIBITION · ...) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-8 sm:mb-12">
        <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-editorial-muted uppercase flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent" />
          <span>SQL AUDIT & VALIDATION</span>
          <span className="text-editorial-border">•</span>
          <span>STORED PROCEDURES</span>
          <span className="text-editorial-border">•</span>
          <span>DASHBOARDS & BI</span>
          <span className="text-editorial-border">•</span>
          <span>PYTHON FOR DATA</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative flex flex-col lg:flex-row items-start justify-between gap-12">
        {/* Left vertical label like Edison Fang ("TAICHUNG / TAIWAN") */}
        <div className="hidden xl:flex flex-col items-center gap-12 text-[10px] font-mono tracking-[0.25em] text-editorial-faint uppercase absolute -left-4 top-4">
          <span className="writing-mode-vertical">TEGUCIGALPA / HONDURAS</span>
          <span className="w-8 h-px bg-editorial-border" />
          <span className="writing-mode-vertical">UNAH GRADUATE · 2026</span>
          <span className="w-8 h-px bg-editorial-border" />
          <span className="writing-mode-vertical">DATA ANALYST</span>
        </div>

        {/* Main Huge Staggered Typography (exact visual rhythm of "Let's give it form.") */}
        <div className="flex-1 max-w-4xl xl:pl-10">
          <h1 className="font-display font-light text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#141517] leading-[0.92] tracking-[-0.04em]">
            <span className="block transform hover:translate-x-2 transition-transform duration-300">
              Turn
            </span>
            <span className="block pl-10 sm:pl-24 md:pl-36 italic font-serif font-light text-[#222326] transform hover:translate-x-2 transition-transform duration-300">
              raw data
            </span>
            <span className="block pl-20 sm:pl-48 md:pl-72 text-right sm:text-left transform hover:translate-x-2 transition-transform duration-300">
              into truth.
            </span>
          </h1>

          {/* Subtitle & summary description */}
          <div className="mt-10 sm:mt-14 max-w-2xl pl-0 sm:pl-8 border-l-0 sm:border-l-2 border-editorial-border">
            <p className="text-sm sm:text-base text-editorial-muted leading-relaxed font-sans font-normal">
              {perfil.resumen}
            </p>

            {/* Quick action buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenIndex}
                className="px-5 py-2.5 rounded-full bg-[#141517] hover:bg-[#2a2c33] text-white text-xs font-mono uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
              >
                <span>Explorar Índice de Datos</span>
                <span>→</span>
              </button>

              <button
                onClick={() => onQuickQuery("SELECT * FROM experiencia;")}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-[#eceae4] border border-editorial-border text-xs font-mono text-[#141517] transition-all"
              >
                SELECT * FROM experiencia;
              </button>

              <a
                href={perfil.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-muted hover:text-[#141517] transition-colors inline-flex items-center gap-1"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 text-current" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Metric Card / Case Summary */}
        <div className="w-full lg:w-80 flex flex-col gap-3 text-xs font-mono">
          <div className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-editorial-muted block mb-1">
              CASO DE ÉXITO 01
            </span>
            <span className="text-2xl font-bold font-display text-[#141517] block">
              4 Descuadres
            </span>
            <p className="text-editorial-muted text-[11px] mt-1 leading-snug">
              Identificados y resueltos en Cooperativa La Reyna cruzando registros en SQL.
            </p>
            <button
              onClick={() => onQuickQuery("SELECT empresa, cargo, impacto FROM experiencia WHERE empresa = 'Cooperativa La Reyna';")}
              className="mt-3 text-[11px] text-editorial-accent hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver consulta de auditoría</span>
              <span>→</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-editorial-muted block mb-1">
              EXPERIENCIA 02
            </span>
            <span className="text-2xl font-bold font-display text-[#141517] block">
              Porsalud Sistemas
            </span>
            <p className="text-editorial-muted text-[11px] mt-1 leading-snug">
              Depuración de Stored Procedures y corrección de reportes de marcaciones multi-sede.
            </p>
            <button
              onClick={() => onQuickQuery("SELECT * FROM experiencia WHERE empresa = 'Porsalud';")}
              className="mt-3 text-[11px] text-[#141517] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver detalles de desarrollo</span>
              <span>→</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-editorial-muted block mb-1">
              CERTIFICACIONES
            </span>
            <span className="text-2xl font-bold font-display text-[#141517] block">
              6 Credenciales
            </span>
            <p className="text-editorial-muted text-[11px] mt-1 leading-snug">
              IBM Data Science, Cisco Cyber & Networking, The Linux Foundation.
            </p>
            <button
              onClick={() => onQuickQuery("SELECT * FROM certificaciones;")}
              className="mt-3 text-[11px] text-editorial-muted hover:text-[#141517] hover:underline flex items-center gap-1"
            >
              <span>Inspeccionar certificaciones</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
