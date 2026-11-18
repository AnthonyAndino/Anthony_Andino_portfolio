import React from 'react';
import { Database, ShieldCheck, Award, Activity } from 'lucide-react';
import { PORTFOLIO_DB } from '../data/portfolioData';

interface DataStatsProps {
  queriesCount: number;
  onFilterClick: (query: string) => void;
}

export const DataStats: React.FC<DataStatsProps> = ({ queriesCount, onFilterClick }) => {
  const tablesCount = Object.keys(PORTFOLIO_DB).filter(k => k !== 'easter_egg').length;
  const certsCount = PORTFOLIO_DB.certificaciones.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-2 select-none">
      {/* Stat 1: Tables in DB */}
      <div 
        onClick={() => onFilterClick("SHOW TABLES;")}
        className="bg-[#15171c] border border-engine-border hover:border-engine-amber/60 p-4 rounded-2xl transition-all cursor-pointer group shadow-lg"
      >
        <div className="flex items-center justify-between text-[#858b99] mb-1">
          <span className="text-xs font-mono uppercase tracking-wider">Entidades Relacionales</span>
          <Database className="w-4 h-4 text-engine-amber group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">{tablesCount}</span>
          <span className="text-[11px] text-engine-green font-mono">tablas activas</span>
        </div>
        <span className="text-[10px] text-engine-amber/80 font-mono block mt-1">SHOW TABLES ↵</span>
      </div>

      {/* Stat 2: Descuadres corregidos */}
      <div 
        onClick={() => onFilterClick("SELECT empresa, cargo, impacto FROM experiencia WHERE empresa = 'Cooperativa La Reyna';")}
        className="bg-[#15171c] border border-engine-border hover:border-engine-green/60 p-4 rounded-2xl transition-all cursor-pointer group shadow-lg"
      >
        <div className="flex items-center justify-between text-[#858b99] mb-1">
          <span className="text-xs font-mono uppercase tracking-wider">Descuadres Resueltos</span>
          <ShieldCheck className="w-4 h-4 text-engine-green group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-engine-green">4</span>
          <span className="text-[11px] text-[#858b99] font-mono">auditorías críticas</span>
        </div>
        <span className="text-[10px] text-engine-green/80 font-mono block mt-1">Cooperativa La Reyna ↵</span>
      </div>

      {/* Stat 3: Certificaciones */}
      <div 
        onClick={() => onFilterClick("SELECT * FROM certificaciones;")}
        className="bg-[#15171c] border border-engine-border hover:border-amber-400/60 p-4 rounded-2xl transition-all cursor-pointer group shadow-lg"
      >
        <div className="flex items-center justify-between text-[#858b99] mb-1">
          <span className="text-xs font-mono uppercase tracking-wider">Certificaciones</span>
          <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">{certsCount}</span>
          <span className="text-[11px] text-amber-400 font-mono">IBM · Cisco · Linux</span>
        </div>
        <span className="text-[10px] text-amber-400/80 font-mono block mt-1">Ver acreditaciones ↵</span>
      </div>

      {/* Stat 4: Live query sessions */}
      <div className="bg-[#15171c] border border-engine-border p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between text-[#858b99] mb-1">
          <span className="text-xs font-mono uppercase tracking-wider">Consultas en Sesión</span>
          <Activity className="w-4 h-4 text-engine-amber" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-engine-amber">{queriesCount}</span>
          <span className="text-[11px] text-[#858b99] font-mono">ejecutadas</span>
        </div>
        <span className="text-[10px] text-engine-green font-mono block mt-1">● Motor SQL Activo</span>
      </div>
    </div>
  );
};
