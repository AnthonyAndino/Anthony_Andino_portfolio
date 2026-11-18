import React from 'react';
import { Database, Terminal, Mail, MapPin, Network, FolderTree } from 'lucide-react';
import { PORTFOLIO_DB } from '../data/portfolioData';

export type ViewMode = 'graph' | 'vfs' | 'terminal';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onQuickQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onQuickQuery }) => {
  const perfil = PORTFOLIO_DB.perfil[0];

  return (
    <header className="relative z-10 pt-6 pb-4 border-b border-engine-border bg-[#0f1013]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top telemetry bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-engine-amber/10 border border-engine-amber/30 text-engine-amber">
            <span className="w-2 h-2 rounded-full bg-engine-amber animate-pulse" />
            <span>DATA_ENGINE: anthony_db · PRODUCTION</span>
            <span className="text-[#4a4f5c]">|</span>
            <span className="text-engine-green font-semibold">ONLINE (0ms latency)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#858b99]">
            <span className="hidden sm:inline">Engine: SQLite / PostgreSQL Emulation</span>
            <span className="px-2 py-0.5 rounded bg-engine-card border border-engine-border text-white">
              v2.8-TS
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-engine-amber to-engine-orange text-black font-bold shadow-lg shadow-engine-amber/20">
                <Database className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                  <span>{perfil.nombre}</span>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-engine-green/10 text-engine-green border border-engine-green/30">
                    Open to Work
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-engine-amber font-medium mt-0.5 flex items-center gap-2">
                  <span>{perfil.titulo}</span>
                  <span className="text-[#4a4f5c]">·</span>
                  <span className="text-[#858b99]">{perfil.grado}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs sm:text-sm text-[#858b99]">
              <span className="flex items-center gap-1.5 text-white/90">
                <MapPin className="w-3.5 h-3.5 text-engine-amber" />
                {perfil.ubicacion}
              </span>
              <span className="text-[#2a2d36] hidden sm:inline">•</span>
              <span className="text-engine-green font-mono">
                Disponibilidad: {perfil.disponibilidad}
              </span>
            </div>
          </div>

          {/* Social Contact Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={perfil.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-engine-card hover:bg-engine-cardHover border border-engine-border hover:border-engine-amber text-white transition-all shadow-sm"
              title="Visitar perfil de LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current text-engine-amber" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.66 1.66 0 0 0-1.66-1.66Z"/>
              </svg>
              <span>LinkedIn</span>
            </a>

            <a
              href={`mailto:${perfil.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-engine-card hover:bg-engine-cardHover border border-engine-border hover:border-engine-amber text-white transition-all shadow-sm"
              title="Enviar correo directo"
            >
              <Mail className="w-3.5 h-3.5 text-engine-amber" />
              <span>Email</span>
            </a>

            <button
              onClick={() => onQuickQuery("SELECT * FROM perfil;")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-engine-amber hover:bg-engine-amberGlow text-black font-bold transition-all shadow-md"
              title="Ejecutar consulta de perfil"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SELECT * FROM perfil;</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Graph vs VFS Engine vs SQL Terminal) */}
        <div className="mt-5 pt-4 border-t border-engine-border/70 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center bg-[#15171c] p-1 rounded-2xl border border-engine-border text-xs font-mono select-none">
            <button
              onClick={() => onViewChange('graph')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'graph'
                  ? 'bg-engine-amber text-black font-bold shadow-md'
                  : 'text-[#858b99] hover:text-white hover:bg-white/5'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Knowledge Graph (Nodos)</span>
            </button>

            <button
              onClick={() => onViewChange('vfs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'vfs'
                  ? 'bg-engine-amber text-black font-bold shadow-md'
                  : 'text-[#858b99] hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>VFS Context Engine</span>
            </button>

            <button
              onClick={() => onViewChange('terminal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'terminal'
                  ? 'bg-engine-amber text-black font-bold shadow-md'
                  : 'text-[#858b99] hover:text-white hover:bg-white/5'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Consola SQL Pura</span>
            </button>
          </div>

          <div className="text-xs font-mono text-[#858b99] flex items-center gap-2">
            <span className="hidden md:inline">Selecciona cualquier vista interactiva</span>
            <span className="w-2 h-2 rounded-full bg-engine-amber animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
};
