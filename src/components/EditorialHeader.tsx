import React from 'react';
import { PORTFOLIO_DB } from '../data/portfolioData';
import { ArrowUpRight } from './Icons';

interface EditorialHeaderProps {
  onToggleIndex: () => void;
  isIndexOpen: boolean;
  onOpenQuery: (query: string) => void;
}

export const EditorialHeader: React.FC<EditorialHeaderProps> = ({
  onToggleIndex,
  isIndexOpen,
  onOpenQuery
}) => {
  const perfil = PORTFOLIO_DB.perfil[0];

  return (
    <header className="sticky top-0 z-40 bg-[#f7f6f2]/90 backdrop-blur-md border-b border-editorial-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Left: Architectural Monogram Logo (like Edison Fang Workshop) */}
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#141517]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="10" width="8" height="24" stroke="currentColor" strokeWidth="2" />
            <rect x="10" y="2" width="10" height="32" stroke="currentColor" strokeWidth="2" />
            <rect x="20" y="16" width="14" height="18" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="leading-tight">
            <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-[#141517] block">
              ANTHONY ANDINO
            </span>
            <span className="font-mono text-[10px] tracking-widest text-editorial-muted uppercase block">
              DATA ANALYST & CONSULTING
            </span>
          </div>
        </div>

        {/* Center: Category tags */}
        <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono tracking-[0.2em] text-editorial-muted uppercase">
          <span>SQL RELATIONAL</span>
          <span className="text-editorial-border">•</span>
          <span>DATA AUDITING</span>
          <span className="text-editorial-border">•</span>
          <span>BI DASHBOARDS</span>
        </div>

        {/* Right: Quick actions & Menu Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenQuery("SELECT * FROM perfil;")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-editorial-border hover:border-[#141517] bg-white text-xs font-mono text-[#141517] transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent inline-block" />
            <span>anthony_db.active</span>
          </button>

          <a
            href={perfil.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-editorial-muted hover:text-[#141517] transition-colors px-2 py-1"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="w-3 h-3 text-current" />
          </a>

          {/* Menu Circle Button (exact style of Edison Fang Workshop MENU (=)) */}
          <button
            onClick={onToggleIndex}
            className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border transition-all text-xs font-mono uppercase tracking-widest ${
              isIndexOpen
                ? 'bg-[#141517] text-white border-[#141517]'
                : 'bg-white hover:bg-[#141517] hover:text-white border-editorial-border text-[#141517]'
            }`}
            title="Abrir índice interactivo de consultas"
          >
            <span>{isIndexOpen ? 'CLOSE' : 'INDEX'}</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
              isIndexOpen ? 'bg-white/20 text-white' : 'bg-[#f0ede4] text-[#141517]'
            }`}>
              {isIndexOpen ? '✕' : '≡'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
