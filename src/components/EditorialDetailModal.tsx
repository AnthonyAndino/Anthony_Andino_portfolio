import React, { useState } from 'react';
import { Table, LayoutGrid, Copy, Check, ExternalLink, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import { QueryResult } from '../types/portfolio';
import { gmailComposeUrl } from '../utils/contactLinks';
import { ArrowUpRight } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';

interface EditorialDetailModalProps {
  result: QueryResult | null;
  onClose: () => void;
  onRunQuery: (query: string) => void;
}

export const EditorialDetailModal: React.FC<EditorialDetailModalProps> = ({
  result,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copied, setCopied] = useState<boolean>(false);

  if (!result) return null;

  const handleCopyJSON = () => {
    if (result.rows) {
      navigator.clipboard.writeText(JSON.stringify(result.rows, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#f7f6f2] border border-editorial-border shadow-2xl overflow-hidden animate-pop-in">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-5 bg-white border-b border-editorial-border select-none">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-editorial-accent" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm sm:text-base uppercase tracking-wider text-[#141517]">
                  {result.tableName ? `INSPECCIÓN: ${result.tableName.toUpperCase()}` : 'RESULTADO SQL'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#f0ede4] text-[#141517]">
                  {result.totalRows ?? (result.rows?.length || 0)} registros
                </span>
              </div>
              <p className="font-mono text-xs text-editorial-muted mt-0.5">
                Query: <span className="text-[#141517] font-semibold">{result.query}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-[#f0ede4] p-0.5 rounded-full text-xs font-mono">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#141517] font-bold shadow-sm'
                    : 'text-editorial-muted hover:text-[#141517]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Editorial</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#141517] font-bold shadow-sm'
                    : 'text-editorial-muted hover:text-[#141517]'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Grid SQL</span>
              </button>
            </div>

            <button
              onClick={handleCopyJSON}
              className="p-2 rounded-full border border-editorial-border bg-white hover:bg-[#f0ede4] text-[#141517] transition-all"
              title="Copiar JSON"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border border-editorial-border bg-white hover:bg-[#141517] hover:text-white transition-all text-xs font-mono uppercase tracking-wider text-[#141517]"
            >
              <span>CLOSE</span>
              <div className="w-5 h-5 rounded-full bg-[#f0ede4] flex items-center justify-center text-[10px]">
                ✕
              </div>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {viewMode === 'table' || !result.tableName ? (
            <CleanTableView columns={result.columns || []} rows={result.rows || []} />
          ) : (
            <EditorialCardsView tableName={result.tableName} rows={result.rows || []} />
          )}
        </div>

        {/* Bottom Footer */}
        <div className="px-6 sm:px-8 py-3 bg-white border-t border-editorial-border flex items-center justify-between text-xs font-mono text-editorial-muted">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tiempo de ejecución: {result.executionTimeMs} ms</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono underline hover:text-[#141517]"
          >
            Cerrar ventana [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   EDITORIAL CARDS BY ENTITY
   ========================================================================= */
interface EditorialCardsViewProps {
  tableName: string;
  rows: Record<string, unknown>[];
}

const EditorialCardsView: React.FC<EditorialCardsViewProps> = ({ tableName, rows }) => {
  const { t } = useLanguage();
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-xs font-mono text-editorial-muted">
        0 registros coincidentes con los filtros aplicados.
      </div>
    );
  }

  switch (tableName) {
    case 'perfil': {
      const p = rows[0];
      return (
        <div className="p-8 rounded-3xl bg-white border border-editorial-border space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-editorial-borderLight">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-editorial-muted block mb-1">
                PERFIL EJECUTIVO & RESUMEN
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#141517]">
                {String(p.nombre)}
              </h3>
              <p className="text-sm font-mono text-editorial-accent mt-1">
                {String(p.titulo)} · {String(p.grado)}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#f0ede4] text-[#141517]">
              {String(p.disponibilidad || 'Inmediata')}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-editorial-muted block font-semibold">
              PROPUESTA DE VALOR
            </span>
            <p className="text-sm sm:text-base text-[#222326] leading-relaxed font-normal">
              {String(p.resumen)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-editorial-borderLight font-mono text-xs">
            <div className="p-4 rounded-2xl bg-[#f7f6f2] border border-editorial-border">
              <span className="text-[10px] uppercase text-editorial-muted block mb-0.5">Correo</span>
              <a
                href={gmailComposeUrl(String(p.email))}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${String(p.email)} — ${t('nav.openGmail')}`}
                className="text-[#141517] font-semibold hover:underline truncate block"
              >
                {String(p.email)}
              </a>
            </div>
            <div className="p-4 rounded-2xl bg-[#f7f6f2] border border-editorial-border">
              <span className="text-[10px] uppercase text-editorial-muted block mb-0.5">LinkedIn</span>
              <a href={String(p.linkedin || 'https://linkedin.com/in/anthony-andino-ad')} target="_blank" rel="noopener noreferrer" className="text-[#141517] font-semibold hover:underline truncate block">
                linkedin.com/in/anthony-andino-ad
              </a>
            </div>
            <div className="p-4 rounded-2xl bg-[#f7f6f2] border border-editorial-border">
              <span className="text-[10px] uppercase text-editorial-muted block mb-0.5">Portfolio Online</span>
              <a href={String(p.portfolio)} target="_blank" rel="noopener noreferrer" className="text-editorial-accent font-semibold hover:underline truncate block flex items-center gap-1">
                <span>anthonyandino-portfolio.vercel.app</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    case 'experiencia': {
      return (
        <div className="space-y-6">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-editorial-border shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-editorial-borderLight">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-editorial-accent" />
                    <h4 className="font-display font-bold text-xl text-[#141517]">
                      {String(row.empresa)}
                    </h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f0ede4] text-[#141517] font-mono">
                      {String(row.tipo || 'Puesto')}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-editorial-muted mt-0.5">{String(row.cargo)}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-editorial-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{String(row.periodo)}</span>
                </div>
              </div>

              {/* Responsibilities */}
              {Array.isArray(row.puntos_clave) && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-editorial-muted block font-semibold">
                    RESPONSABILIDADES & DESAFÍOS TÉCNICOS:
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#222326]">
                    {row.puntos_clave.map((item, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3">
                        <span className="text-editorial-accent font-bold mt-0.5">―</span>
                        <span className="leading-relaxed">{String(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stack tags */}
              {Array.isArray(row.tecnologias) && (
                <div className="pt-3 border-t border-editorial-borderLight flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-editorial-muted mr-1">
                    Herramientas:
                  </span>
                  {row.tecnologias.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#f0ede4] text-[#141517]"
                    >
                      {String(tech)}
                    </span>
                  ))}
                </div>
              )}

              {/* Impact Callout */}
              {Boolean(row.impacto) && (
                <div className="p-3.5 rounded-2xl bg-[#f5f4ef] border border-editorial-border text-xs font-mono">
                  <span className="font-bold text-editorial-accent block mb-0.5">Impacto Verificable:</span>
                  <span className="text-[#141517] font-sans text-sm">{String(row.impacto)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'habilidades': {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((row, idx) => {
            const skills = Array.isArray(row.habilidades) ? row.habilidades : [];
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-editorial-border shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-editorial-borderLight">
                    <h4 className="font-display font-bold text-base text-[#141517]">
                      {String(row.categoria)}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0ede4] text-[#141517]">
                      {String(row.nivel || 'Dominio')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1 rounded-full text-xs font-mono bg-[#f7f6f2] border border-editorial-border hover:border-[#141517] text-[#141517] transition-colors"
                      >
                        {String(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'proyectos': {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-editorial-border shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2">
                  <h4 className="font-display font-bold text-xl text-[#141517]">
                    {String(row.nombre)}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0ede4] text-[#141517]">
                    {String(row.tipo)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">
                  {String(row.descripcion)}
                </p>

                {Array.isArray(row.metricas_o_caracteristicas) && (
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-editorial-muted block font-semibold">
                      Capacidades Clave:
                    </span>
                    <ul className="space-y-1 text-xs text-[#222326]">
                      {row.metricas_o_caracteristicas.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-center gap-2">
                          <span className="text-editorial-accent">▪</span>
                          <span>{String(m)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {Array.isArray(row.stack) && (
                <div className="pt-3 border-t border-editorial-borderLight flex flex-wrap gap-1.5">
                  {row.stack.map((stk, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#f0ede4] text-[#141517]"
                    >
                      {String(stk)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'certificaciones': {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white border border-editorial-border shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{String(row.icono || '📜')}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0ede4] text-editorial-muted">
                    {String(row.categoria)}
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm sm:text-base text-[#141517] leading-snug">
                  {String(row.nombre)}
                </h4>
                <p className="text-xs font-mono text-editorial-muted mt-1">{String(row.emisor)}</p>
              </div>

              <div className="pt-3 mt-4 border-t border-editorial-borderLight text-[11px] font-mono text-editorial-muted">
                📅 {String(row.fecha)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'educacion': {
      const edu = rows[0];
      return (
        <div className="p-8 rounded-3xl bg-white border border-editorial-border shadow-sm space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-editorial-muted block">
            FORMACIÓN ACADÉMICA TITULADA
          </span>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#141517]">
            {String(edu.carrera)}
          </h3>
          <p className="text-sm font-mono text-editorial-accent">
            {String(edu.institucion)} · {String(edu.ubicacion)}
          </p>

          <div className="py-3 border-y border-editorial-borderLight flex flex-wrap items-center gap-4 text-xs font-mono text-editorial-muted">
            <span>Periodo: {String(edu.periodo)}</span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f0ede4] text-[#141517]">
              {String(edu.estado)}
            </span>
          </div>

          {Boolean(edu.enfoque) && (
            <p className="text-sm text-[#222326] leading-relaxed pt-2">
              <strong className="font-mono text-xs uppercase text-editorial-muted block mb-1">
                Enfoque Disciplinar:
              </strong>
              {String(edu.enfoque)}
            </p>
          )}
        </div>
      );
    }

    case 'contacto': {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row, idx) => (
            <a
              key={idx}
              href={String(row.enlace)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={String(row.enlace).startsWith('https://mail.google.com') ? `${String(row.valor)} — ${t('nav.openGmail')}` : undefined}
              className="p-6 rounded-3xl bg-white hover:bg-[#fbfbf9] border border-editorial-border hover:border-[#141517] transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-editorial-muted block mb-1">
                  {String(row.medio)}
                </span>
                <span className="text-sm sm:text-base font-display font-bold text-[#141517] group-hover:text-editorial-accent transition-colors block truncate">
                  {String(row.valor)}
                </span>
              </div>
              <div className="mt-6 pt-3 border-t border-editorial-borderLight flex items-center justify-between text-xs font-mono text-[#141517]">
                <span>{String(row.accion || 'Contactar')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-current group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      );
    }

    default:
      return <CleanTableView columns={Object.keys(rows[0])} rows={rows} />;
  }
};

/* =========================================================================
   CLEAN EDITORIAL TABLE
   ========================================================================= */
const CleanTableView: React.FC<{ columns: string[]; rows: Record<string, unknown>[] }> = ({ columns, rows }) => {
  if (rows.length === 0) {
    return <div className="text-center py-8 text-xs font-mono text-editorial-muted">0 filas.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-editorial-border bg-white">
      <table className="w-full text-left font-mono text-xs border-collapse">
        <thead>
          <tr className="bg-[#f0ede4] border-b border-editorial-border text-[#141517]">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-editorial-borderLight">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[#f7f6f2] transition-colors">
              {columns.map((col) => {
                const val = row[col] || row[col.toLowerCase()];
                return (
                  <td key={col} className="px-4 py-3 text-[#141517] align-top whitespace-pre-wrap max-w-xs truncate">
                    {formatCellValue(val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function formatCellValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (Array.isArray(val)) return `[ ${val.join(', ')} ]`;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}
