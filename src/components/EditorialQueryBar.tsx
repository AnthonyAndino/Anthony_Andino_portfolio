import React, { useRef } from 'react';
import { Play, RotateCcw, ArrowRight } from 'lucide-react';

interface EditorialQueryBarProps {
  currentInput: string;
  onInputChange: (val: string) => void;
  onExecute: (query: string) => void;
  onQuickSelect: (query: string) => void;
  isExecuting: boolean;
}

const QUICK_ENTITIES = [
  { label: 'Perfil', query: 'SELECT * FROM perfil;' },
  { label: 'Experiencia', query: 'SELECT * FROM experiencia;' },
  { label: 'Proyectos', query: 'SELECT * FROM proyectos;' },
  { label: 'Habilidades', query: 'SELECT * FROM habilidades;' },
  { label: 'Certificaciones', query: 'SELECT * FROM certificaciones;' },
  { label: 'Educación', query: 'SELECT * FROM educacion;' },
  { label: 'Contacto', query: 'SELECT * FROM contacto;' },
];

export const EditorialQueryBar: React.FC<EditorialQueryBarProps> = ({
  currentInput,
  onInputChange,
  onExecute,
  onQuickSelect,
  isExecuting
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      e.preventDefault();
      onExecute(currentInput);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 select-none">
      <div className="bg-white rounded-3xl border border-editorial-border p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-editorial-borderLight">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-editorial-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#141517] font-semibold">
              SQL PROMPT & CONSOLE
            </span>
          </div>
          <span className="text-[11px] font-mono text-editorial-muted">
            Presiona <kbd className="px-1.5 py-0.5 rounded bg-[#f0ede4] text-[#141517]">Enter ↵</kbd> para consultar
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 bg-[#f7f6f2] p-2.5 sm:p-3 rounded-2xl border border-editorial-border focus-within:border-[#141517] focus-within:bg-white transition-all">
          <span className="font-mono text-xs font-bold text-editorial-accent pl-2">
            anthony_db&gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            disabled={isExecuting}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una consulta SQL (ej. SELECT * FROM experiencia;) o haz clic abajo..."
            className="flex-1 bg-transparent text-[#141517] font-mono text-xs sm:text-sm focus:outline-none placeholder:text-editorial-faint"
            spellCheck={false}
          />

          <div className="flex items-center gap-1.5 pr-1">
            {currentInput && (
              <button
                onClick={() => onInputChange('')}
                className="p-1.5 rounded-lg text-editorial-muted hover:text-[#141517] hover:bg-black/5 transition-colors"
                title="Limpiar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onExecute(currentInput)}
              disabled={isExecuting || !currentInput.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141517] hover:bg-[#2a2c33] text-white text-xs font-mono font-medium disabled:opacity-40 transition-all shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Ejecutar</span>
            </button>
          </div>
        </div>

        {/* Quick entity tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-editorial-muted mr-1">
            Accesos Rápidos:
          </span>
          {QUICK_ENTITIES.map((item) => (
            <button
              key={item.label}
              disabled={isExecuting}
              onClick={() => onQuickSelect(item.query)}
              className="px-3 py-1 rounded-full text-xs font-mono bg-[#f0ede4] hover:bg-[#141517] hover:text-white text-[#141517] transition-all flex items-center gap-1 group"
            >
              <span>{item.label}</span>
              <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
