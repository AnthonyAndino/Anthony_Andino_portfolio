import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SqlEngine } from '../utils/sqlEngine';
import { QueryResult } from '../types/portfolio';
import { ResultsViewer } from './ResultsViewer';

interface FullscreenDetailViewProps {
  title: string;
  query: string;
  onClose: () => void;
}

export const FullscreenDetailView: React.FC<FullscreenDetailViewProps> = ({
  title,
  query,
  onClose,
}) => {
  const [result, setResult] = useState<QueryResult | null>(null);

  useEffect(() => {
    // Execute query for this view
    const res = SqlEngine.execute(query);
    setResult(res);

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-[#15171c] border border-engine-border shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-pop-in">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#1b1d23] border-b border-engine-border select-none">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-engine-amber animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-engine-amber/15 text-engine-amber border border-engine-amber/30">
                  FULLSCREEN_INSPECTOR
                </span>
              </div>
              <p className="text-xs font-mono text-[#858b99] mt-0.5">
                SQL: <span className="text-engine-amber">{query}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#858b99] hidden sm:inline mr-2">
              Presiona <kbd className="px-1.5 py-0.5 rounded bg-[#121316] border border-engine-border text-white">ESC</kbd> para salir
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#121316] hover:bg-[#23252d] border border-engine-border hover:border-engine-amber text-[#858b99] hover:text-white transition-all"
              title="Cerrar vista completa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <ResultsViewer
            result={result}
            onRunQuery={(q) => {
              const res = SqlEngine.execute(q);
              setResult(res);
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#101216] border-t border-engine-border/80 flex items-center justify-between text-xs font-mono text-[#858b99]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-engine-green" />
            <span>anthony_db relational session active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-engine-amber hover:bg-engine-amberGlow text-black font-bold font-mono transition-all"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
