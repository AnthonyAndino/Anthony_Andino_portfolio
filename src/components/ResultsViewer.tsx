import React, { useState } from 'react';
import { 
  Table, 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  GraduationCap, 
  Sparkles,
  Copy,
  Check,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { QueryResult } from '../types/portfolio';

interface ResultsViewerProps {
  result: QueryResult | null;
  onRunQuery: (query: string) => void;
  onOpenFullscreen?: () => void;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({ 
  result, 
  onRunQuery,
  onOpenFullscreen 
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copied, setCopied] = useState<boolean>(false);

  if (!result) {
    return (
      <div className="bg-[#15171c] border border-engine-border rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[360px] shadow-xl">
        <div className="p-4 rounded-2xl bg-engine-amber/10 border border-engine-amber/30 text-engine-amber mb-4 shadow-lg shadow-engine-amber/10">
          <Sparkles className="w-9 h-9 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Consola Relacional de Datos
        </h3>
        <p className="text-sm text-[#858b99] max-w-md mx-auto mb-6 leading-relaxed">
          Explora toda mi experiencia analítica, formación académica y proyectos ejecutando consultas en tiempo real.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => onRunQuery("SELECT * FROM perfil;")}
            className="px-3.5 py-2 rounded-xl text-xs font-mono bg-engine-amber/20 hover:bg-engine-amber/30 text-engine-amber border border-engine-amber/40 font-semibold transition-all"
          >
            SELECT * FROM perfil;
          </button>
          <button
            onClick={() => onRunQuery("SELECT * FROM experiencia;")}
            className="px-3.5 py-2 rounded-xl text-xs font-mono bg-[#1b1d23] hover:bg-[#23252d] text-[#c9d1d9] border border-engine-border transition-all"
          >
            SELECT * FROM experiencia;
          </button>
          <button
            onClick={() => onRunQuery("SHOW TABLES;")}
            className="px-3.5 py-2 rounded-xl text-xs font-mono bg-engine-green/10 hover:bg-engine-green/20 text-engine-green border border-engine-green/30 transition-all"
          >
            SHOW TABLES;
          </button>
        </div>
      </div>
    );
  }

  // Handle CLEAR
  if (result.type === 'CLEAR') {
    return (
      <div className="bg-[#15171c] border border-engine-border rounded-2xl p-8 text-center text-[#858b99] font-mono text-xs">
        <p>Terminal limpia. Selecciona una consulta para comenzar nuevamente.</p>
      </div>
    );
  }

  // Handle ERROR
  if (result.type === 'ERROR') {
    return (
      <div className="bg-[#1f1315] border border-red-500/40 rounded-2xl p-5 text-red-200 shadow-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 font-mono text-xs space-y-2">
            <div className="font-bold text-red-400 flex items-center justify-between">
              <span>SQL Execution Error</span>
              <span className="text-[11px] text-[#858b99]">{result.timestamp}</span>
            </div>
            <p className="bg-[#161b22]/70 p-3 rounded-xl border border-red-500/20 text-red-300 whitespace-pre-wrap">
              {result.errorMessage}
            </p>
            <div className="text-[11px] text-[#858b99] pt-1">
              ¿Comandos válidos? Ejecuta <button onClick={() => onRunQuery('HELP;')} className="text-engine-amber underline">HELP;</button> o <button onClick={() => onRunQuery('SHOW TABLES;')} className="text-engine-green underline">SHOW TABLES;</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCopyJSON = () => {
    if (result.rows) {
      navigator.clipboard.writeText(JSON.stringify(result.rows, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#15171c] border border-engine-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Result Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#1b1d23] border-b border-engine-border text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-engine-green font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Query OK</span>
          </span>
          <span className="text-[#3d414e]">•</span>
          <span className="text-[#858b99]">
            {result.totalRows ?? (result.rows ? result.rows.length : 0)} filas encontradas
          </span>
          <span className="text-[#3d414e]">•</span>
          <span className="text-[#858b99] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-engine-amber" />
            <span>{result.executionTimeMs} ms</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Table / Cards view */}
          <div className="flex items-center bg-[#121316] p-0.5 rounded-xl border border-engine-border text-[11px]">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-engine-amber text-black font-bold'
                  : 'text-[#858b99] hover:text-white'
              }`}
              title="Vista de tarjetas visuales"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-engine-amber text-black font-bold'
                  : 'text-[#858b99] hover:text-white'
              }`}
              title="Vista de tabla relacional SQL"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Grid SQL</span>
            </button>
          </div>

          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-engine-border bg-[#1b1d23] hover:bg-[#23252d] text-[#858b99] hover:text-white text-[11px] transition-all"
            title="Copiar datos en formato JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-engine-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'JSON'}</span>
          </button>

          {onOpenFullscreen && (
            <button
              onClick={onOpenFullscreen}
              className="p-1 rounded-lg border border-engine-border bg-[#1b1d23] hover:bg-[#23252d] text-engine-amber hover:text-white transition-all"
              title="Expandir a pantalla completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Query echo */}
      <div className="px-4 py-2 bg-[#121316] border-b border-engine-border/60 font-mono text-xs text-[#858b99] flex items-center justify-between">
        <div className="truncate">
          <span className="text-engine-amber font-bold">SQL&gt;</span> <span className="text-white font-medium">{result.query}</span>
        </div>
        <span className="text-[11px] text-[#4a4f5c] ml-2 flex-shrink-0">
          Entity: {result.tableName || 'metadata'}
        </span>
      </div>

      {/* Result Content */}
      <div className="p-4 sm:p-5">
        {viewMode === 'table' || !result.tableName ? (
          <RawTableView columns={result.columns || []} rows={result.rows || []} />
        ) : (
          <CustomCardView tableName={result.tableName} rows={result.rows || []} />
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   CUSTOM CARD RENDERER BY TABLE ENTITY
   ========================================================================= */
interface CustomCardViewProps {
  tableName: string;
  rows: Record<string, unknown>[];
}

const CustomCardView: React.FC<CustomCardViewProps> = ({ tableName, rows }) => {
  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-xs font-mono text-[#858b99]">
        No se encontraron registros coincidentes con los filtros aplicados.
      </div>
    );
  }

  switch (tableName) {
    case 'perfil': {
      const p = rows[0];
      return (
        <div className="space-y-4">
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#1b1d23] to-[#20232a] border border-engine-border shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-engine-border/70">
              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-white">{String(p.nombre)}</h4>
                <p className="text-sm text-engine-amber font-medium mt-0.5">{String(p.titulo)}</p>
                <p className="text-xs text-[#858b99] font-mono mt-0.5">{String(p.grado)} · {String(p.ubicacion)}</p>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-engine-green/10 border border-engine-green/30 text-engine-green text-xs font-mono">
                {String(p.disponibilidad || 'Disponibilidad Inmediata')}
              </div>
            </div>

            <div className="mt-5">
              <h5 className="text-xs font-mono uppercase text-engine-amber tracking-wider mb-2 font-bold">
                Resumen Ejecutivo
              </h5>
              <p className="text-sm text-[#c9d1d9] leading-relaxed">
                {String(p.resumen)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-engine-border/70 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#121316] border border-engine-border">
                <span className="text-[#858b99] block text-[10px] uppercase font-bold">Email</span>
                <a href={`mailto:${p.email}`} className="text-engine-amber hover:underline truncate block font-medium">
                  {String(p.email)}
                </a>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121316] border border-engine-border">
                <span className="text-[#858b99] block text-[10px] uppercase font-bold">LinkedIn</span>
                <a href={String(p.linkedin || 'https://linkedin.com/in/anthony-andino-ad')} target="_blank" rel="noopener noreferrer" className="text-engine-green hover:underline truncate block font-medium">
                  linkedin.com/in/anthony-andino-ad
                </a>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121316] border border-engine-border">
                <span className="text-[#858b99] block text-[10px] uppercase font-bold">Portfolio Oficial</span>
                <a href={String(p.portfolio)} target="_blank" rel="noopener noreferrer" className="text-engine-purple hover:underline truncate block flex items-center gap-1 font-medium">
                  <span>anthonyandino.vercel.app</span>
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'experiencia': {
      return (
        <div className="space-y-4">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-[#1b1d23] border border-engine-border hover:border-engine-amber/50 transition-all shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-engine-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-engine-amber" />
                    <h4 className="text-base sm:text-lg font-bold text-white">{String(row.empresa)}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-engine-amber/15 text-engine-amber border border-engine-amber/30 font-mono">
                      {String(row.tipo || 'Empresa')}
                    </span>
                  </div>
                  <p className="text-sm text-engine-green font-medium mt-0.5">{String(row.cargo)}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#858b99]">
                  <Calendar className="w-3.5 h-3.5 text-engine-amber" />
                  <span>{String(row.periodo)}</span>
                </div>
              </div>

              {/* Bullet points */}
              {Array.isArray(row.puntos_clave) && (
                <div className="mt-4">
                  <h5 className="text-[11px] font-mono uppercase text-[#858b99] tracking-wider mb-2 font-bold">
                    Responsabilidades & Logros Técnicos:
                  </h5>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#c9d1d9]">
                    {row.puntos_clave.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5">
                        <ChevronRight className="w-4 h-4 text-engine-amber flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{String(pt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              {Array.isArray(row.tecnologias) && (
                <div className="mt-4 pt-3 border-t border-engine-border/50 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-[#858b99] mr-1">Stack:</span>
                  {row.tecnologias.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-mono bg-[#121316] text-engine-amber border border-engine-border"
                    >
                      {String(tech)}
                    </span>
                  ))}
                </div>
              )}

              {/* Impact summary */}
              {Boolean(row.impacto) && (
                <div className="mt-4 p-3 rounded-xl bg-engine-green/10 border border-engine-green/20 text-xs font-mono text-engine-green flex items-center gap-2">
                  <span className="font-bold">Impacto Medible:</span>
                  <span className="font-sans text-[#c9d1d9]">{String(row.impacto)}</span>
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
            const tipo = String(row.tipo || 'data');
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#1b1d23] border border-engine-border hover:border-engine-borderHover transition-all shadow-lg"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-engine-border/60">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-engine-amber" />
                    <h4 className="text-sm font-bold text-white">{String(row.categoria)}</h4>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-engine-amber/15 text-engine-amber border border-engine-amber/30">
                    {String(row.nivel || 'Dominio')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${getSkillStyle(tipo)}`}
                    >
                      {String(skill)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'proyectos': {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#1b1d23] border border-engine-border hover:border-engine-amber/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-base sm:text-lg font-bold text-white">{String(row.nombre)}</h4>
                  <span className="text-[11px] font-mono text-engine-green bg-engine-green/10 px-2 py-0.5 rounded-full border border-engine-green/20">
                    {String(row.tipo)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#858b99] mb-4 leading-relaxed">
                  {String(row.descripcion)}
                </p>

                {Array.isArray(row.metricas_o_caracteristicas) && (
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase text-engine-amber tracking-wider block mb-2 font-bold">
                      Características Clave:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#c9d1d9]">
                      {row.metricas_o_caracteristicas.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-center gap-2">
                          <span className="text-engine-amber">▸</span>
                          <span>{String(m)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {Array.isArray(row.stack) && (
                <div className="pt-3 border-t border-engine-border/50 flex flex-wrap gap-1.5">
                  {row.stack.map((stk, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#121316] text-engine-amber border border-engine-border"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-[#1b1d23] border border-engine-border hover:border-engine-amber/50 transition-all flex items-start gap-3.5 shadow-lg"
            >
              <div className="p-3 rounded-xl bg-engine-amber/10 border border-engine-amber/25 text-2xl flex-shrink-0">
                {String(row.icono || '📜')}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                  {String(row.nombre)}
                </h4>
                <p className="text-xs text-engine-amber font-mono mt-0.5">{String(row.emisor)}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-[#858b99]">
                  <span>📅 {String(row.fecha)}</span>
                  <span>·</span>
                  <span className="text-engine-green">{String(row.categoria)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'educacion': {
      const edu = rows[0];
      return (
        <div className="p-6 sm:p-7 rounded-2xl bg-[#1b1d23] border border-engine-border shadow-lg">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="p-3 rounded-2xl bg-engine-amber/10 border border-engine-amber/30 text-engine-amber">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white">{String(edu.carrera)}</h4>
              <p className="text-sm text-engine-amber font-medium">{String(edu.institucion)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#858b99] py-3.5 border-y border-engine-border/60">
            <span>📅 {String(edu.periodo)}</span>
            <span>📍 {String(edu.ubicacion)}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-engine-green/10 text-engine-green border border-engine-green/30">
              {String(edu.estado)}
            </span>
          </div>
          {Boolean(edu.enfoque) && (
            <p className="mt-4 text-xs sm:text-sm text-[#c9d1d9] leading-relaxed">
              <strong className="text-white font-mono text-xs">Enfoque: </strong>
              {String(edu.enfoque)}
            </p>
          )}
        </div>
      );
    }

    case 'contacto': {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map((row, idx) => (
            <a
              key={idx}
              href={String(row.enlace)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-[#1b1d23] hover:bg-[#23252d] border border-engine-border hover:border-engine-amber transition-all group flex flex-col justify-between shadow-lg"
            >
              <div>
                <span className="text-xs font-mono uppercase text-[#858b99] tracking-wider block mb-1">
                  {String(row.medio)}
                </span>
                <span className="text-sm font-bold text-white group-hover:text-engine-amber transition-colors block truncate">
                  {String(row.valor)}
                </span>
              </div>
              <div className="mt-4 pt-2.5 border-t border-engine-border/50 flex items-center justify-between text-xs font-mono text-engine-amber font-semibold">
                <span>{String(row.accion || 'Contactar')}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      );
    }

    case 'easter_egg': {
      const egg = rows[0];
      return (
        <div className="p-6 rounded-2xl bg-[#1b1d23] border border-engine-purple/50 font-mono text-xs space-y-4 shadow-xl">
          <div className="p-3 rounded-xl bg-engine-purple/10 border border-engine-purple/30 text-engine-purple font-bold text-sm">
            {String(egg.mensaje)}
          </div>
          <div className="space-y-1 text-[#c9d1d9]">
            <p><span className="text-engine-amber">SECRET_CODE:</span> {String(egg.codigo_secreto)}</p>
            <p><span className="text-engine-green">DATA_WISDOM:</span> {String(egg.consejo_data)}</p>
            <p className="text-amber-400 pt-2">{String(egg.easter_egg)}</p>
          </div>
        </div>
      );
    }

    default:
      return <RawTableView columns={Object.keys(rows[0])} rows={rows} />;
  }
};

/* =========================================================================
   RAW SQL TABLE VIEW
   ========================================================================= */
const RawTableView: React.FC<{ columns: string[]; rows: Record<string, unknown>[] }> = ({ columns, rows }) => {
  if (rows.length === 0) {
    return (
      <div className="text-center py-6 text-xs font-mono text-[#858b99]">
        0 filas devueltas.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-engine-border">
      <table className="w-full text-left font-mono text-xs border-collapse">
        <thead>
          <tr className="bg-[#121316] border-b border-engine-border text-engine-amber font-bold">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 uppercase tracking-wider text-[11px] whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-engine-border/60 bg-[#15171c]">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[#1f222a] transition-colors">
              {columns.map((col) => {
                const val = row[col] || row[col.toLowerCase()];
                return (
                  <td key={col} className="px-4 py-3 text-[#e6edf3] align-top whitespace-pre-wrap max-w-xs truncate">
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

function getSkillStyle(tipo: string): string {
  switch (tipo) {
    case 'data':
      return 'bg-engine-amber/10 border-engine-amber/30 text-engine-amber';
    case 'db':
      return 'bg-engine-green/10 border-engine-green/30 text-engine-green';
    case 'prog':
      return 'bg-engine-purple/10 border-engine-purple/30 text-engine-purple';
    case 'tools':
      return 'bg-engine-cyan/10 border-engine-cyan/30 text-engine-cyan';
    case 'soft':
      return 'bg-pink-500/10 border-pink-500/30 text-pink-400';
    case 'lang':
      return 'bg-amber-400/10 border-amber-400/30 text-amber-300';
    default:
      return 'bg-[#121316] border-engine-border text-[#c9d1d9]';
  }
}
