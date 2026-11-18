import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, RotateCcw, Sparkles, ChevronRight, CornerDownLeft, Maximize2 } from 'lucide-react';

interface SqlTerminalProps {
  currentInput: string;
  onInputChange: (val: string) => void;
  onExecute: (query: string) => void;
  onOpenFullscreen?: () => void;
  isExecuting: boolean;
  history: string[];
}

const AUTOCOMPLETE_KEYWORDS = [
  'SELECT * FROM perfil;',
  'SELECT * FROM experiencia;',
  'SELECT * FROM habilidades;',
  'SELECT * FROM proyectos;',
  'SELECT * FROM certificaciones;',
  'SELECT * FROM educacion;',
  'SELECT * FROM contacto;',
  'SHOW TABLES;',
  'DESCRIBE perfil;',
  'DESCRIBE experiencia;',
  'DESCRIBE habilidades;',
  'DESCRIBE proyectos;',
  'HELP;',
  'CLEAR;'
];

export const SqlTerminal: React.FC<SqlTerminalProps> = ({
  currentInput,
  onInputChange,
  onExecute,
  onOpenFullscreen,
  isExecuting,
  history
}) => {
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filter suggestions
  const trimmed = currentInput.trim().toLowerCase();
  const filteredSuggestions = trimmed.length > 0
    ? AUTOCOMPLETE_KEYWORDS.filter(k => k.toLowerCase().includes(trimmed) && k.toLowerCase() !== trimmed).slice(0, 5)
    : [];

  useEffect(() => {
    setSelectedSuggestionIndex(0);
    setShowSuggestions(filteredSuggestions.length > 0 && document.activeElement === inputRef.current);
  }, [currentInput, filteredSuggestions.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isExecuting) return;

    // Up Arrow for history / suggestions
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
      } else if (history.length > 0) {
        const nextIndex = historyIndex + 1 < history.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        onInputChange(history[nextIndex]);
      }
    }
    // Down Arrow
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedSuggestionIndex(prev => (prev + 1 < filteredSuggestions.length ? prev + 1 : 0));
      } else if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        onInputChange(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        onInputChange('');
      }
    }
    // Tab key: Autocomplete
    else if (e.key === 'Tab') {
      if (showSuggestions && filteredSuggestions.length > 0) {
        e.preventDefault();
        onInputChange(filteredSuggestions[selectedSuggestionIndex]);
        setShowSuggestions(false);
      }
    }
    // Enter key: Execute
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions[selectedSuggestionIndex] && e.ctrlKey) {
        onInputChange(filteredSuggestions[selectedSuggestionIndex]);
        setShowSuggestions(false);
      } else {
        setShowSuggestions(false);
        setHistoryIndex(-1);
        if (currentInput.trim()) {
          onExecute(currentInput);
        }
      }
    }
    // Escape
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-[#15171c] border border-engine-border rounded-2xl shadow-xl overflow-hidden focus-within:border-engine-amber/80 transition-all duration-200">
      {/* Title bar style MacOS / VS Code Terminal */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1b1d23] border-b border-engine-border/80 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f85149] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#d29922] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] inline-block" />
          </div>
          <span className="text-[#858b99] font-mono text-xs ml-2 flex items-center gap-1.5 font-medium">
            <Terminal className="w-3.5 h-3.5 text-engine-amber" />
            <span>query_console.sql — Data Analyst Terminal</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isExecuting && (
            <span className="text-xs font-mono text-engine-amber flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ejecutando...</span>
            </span>
          )}
          {onOpenFullscreen && (
            <button
              onClick={onOpenFullscreen}
              className="p-1 rounded-lg text-[#858b99] hover:text-white hover:bg-white/5 transition-colors"
              title="Maximizar en pantalla completa"
            >
              <Maximize2 className="w-3.5 h-3.5 text-engine-amber" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-4 sm:p-5 relative bg-[#121316]">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-engine-amber font-bold flex items-center gap-0.5 select-none text-xs sm:text-sm">
            anthony_db
            <ChevronRight className="w-4 h-4 text-white inline" />
          </span>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              disabled={isExecuting}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (filteredSuggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Escribe tu consulta SQL aquí (ej: SELECT * FROM experiencia;) o selecciona una opción..."
              className="w-full bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none placeholder:text-[#4a4f5c] tracking-wide"
              spellCheck={false}
              autoComplete="off"
            />

            {/* Autocomplete Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 bottom-full mb-2 w-full max-w-md bg-[#1b1d23] border border-engine-border rounded-xl shadow-2xl overflow-hidden z-30 font-mono text-xs">
                <div className="px-3 py-1.5 bg-[#121316] text-[#858b99] text-[10px] uppercase tracking-wider flex justify-between border-b border-engine-border/60">
                  <span>Sugerencias SQL</span>
                  <span>Presiona [TAB] para autocompletar</span>
                </div>
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onInputChange(item);
                      setShowSuggestions(false);
                      inputRef.current?.focus();
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      idx === selectedSuggestionIndex
                        ? 'bg-engine-amber/20 text-white font-medium'
                        : 'text-[#c9d1d9] hover:bg-[#23252d]'
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    <span className="text-[10px] text-engine-amber font-semibold ml-2">SQL</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => onExecute(currentInput)}
              disabled={isExecuting || !currentInput.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-engine-amber hover:bg-engine-amberGlow text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
              title="Ejecutar consulta (Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Ejecutar</span>
            </button>

            {currentInput && (
              <button
                onClick={() => onInputChange('')}
                disabled={isExecuting}
                className="p-1.5 rounded-xl text-[#858b99] hover:text-white hover:bg-white/5 border border-engine-border transition-all"
                title="Limpiar campo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tips Footer */}
        <div className="mt-3 pt-3 border-t border-engine-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#858b99]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1b1d23] border border-engine-border text-white">
                Enter
              </kbd>{' '}
              ejecutar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1b1d23] border border-engine-border text-white">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-[#1b1d23] border border-engine-border text-white">
                ↓
              </kbd>{' '}
              historial
            </span>
            <span className="hidden md:inline">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1b1d23] border border-engine-border text-white">
                Tab
              </kbd>{' '}
              autocompletar
            </span>
          </div>

          <div className="flex items-center gap-1 text-engine-amber">
            <CornerDownLeft className="w-3 h-3" />
            <span>Tip: Filtra por empresa o destreza usando WHERE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
