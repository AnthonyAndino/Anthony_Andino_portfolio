import React from 'react';
import { 
  Terminal, 
  User, 
  Briefcase, 
  Cpu, 
  BarChart3, 
  Award, 
  GraduationCap, 
  Send, 
  Database,
  HelpCircle,
  Trash2,
  TableProperties,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { QUICK_QUERIES } from '../data/portfolioData';
import { TableName } from '../types/portfolio';

interface QuickQueriesProps {
  onSelectQuery: (query: string) => void;
  onOpenFullscreen: (title: string, query: string) => void;
  isExecuting: boolean;
  activeQuery: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  User: <User className="w-4 h-4 text-engine-amber" />,
  Briefcase: <Briefcase className="w-4 h-4 text-engine-green" />,
  Cpu: <Cpu className="w-4 h-4 text-engine-cyan" />,
  BarChart3: <BarChart3 className="w-4 h-4 text-engine-orange" />,
  Award: <Award className="w-4 h-4 text-amber-400" />,
  GraduationCap: <GraduationCap className="w-4 h-4 text-engine-purple" />,
  Send: <Send className="w-4 h-4 text-engine-cyan" />,
  Database: <Database className="w-4 h-4 text-engine-amber" />
};

export const QuickQueries: React.FC<QuickQueriesProps> = ({
  onSelectQuery,
  onOpenFullscreen,
  isExecuting,
  activeQuery
}) => {
  const schemaTables: TableName[] = [
    'perfil',
    'experiencia',
    'habilidades',
    'proyectos',
    'certificaciones',
    'educacion',
    'contacto'
  ];

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4">
      {/* Quick Queries Card */}
      <div className="bg-[#15171c] border border-engine-border rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-engine-border/70 select-none">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-engine-amber" />
            <span>Consultas Rápidas</span>
          </h2>
          <span className="text-[10px] font-mono text-engine-amber bg-engine-amber/10 px-2 py-0.5 rounded border border-engine-amber/30">
            AUTO-TYPE
          </span>
        </div>

        <p className="text-xs text-[#858b99] mb-3 leading-relaxed">
          Haz clic en cualquier consulta para auto-escribirla y ver los datos:
        </p>

        <div className="flex flex-col gap-1.5">
          {QUICK_QUERIES.map((item) => {
            const isActive = activeQuery.trim().toLowerCase() === item.query.trim().toLowerCase();
            return (
              <div
                key={item.id}
                className={`group flex items-center justify-between p-2 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-[#38261e]/80 border-engine-amber/60 text-white shadow-md'
                    : 'bg-[#1b1d23] hover:bg-[#23252d] border-engine-border hover:border-engine-borderHover text-[#c9d1d9]'
                }`}
              >
                <button
                  disabled={isExecuting}
                  onClick={() => onSelectQuery(item.query)}
                  className="flex-1 text-left min-w-0 pr-2 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-xs font-medium truncate">
                    {ICON_MAP[item.iconName] || <Terminal className="w-4 h-4" />}
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#858b99] group-hover:text-engine-amber/90 transition-colors truncate mt-0.5">
                    {item.query}
                  </div>
                </button>

                <button
                  onClick={() => onOpenFullscreen(item.label, item.query)}
                  className="p-1.5 rounded-lg text-[#858b99] hover:text-white hover:bg-white/10 transition-colors opacity-60 group-hover:opacity-100"
                  title="Abrir en pantalla completa"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-engine-amber" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database Schema Explorer */}
      <div className="bg-[#15171c] border border-engine-border rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-engine-border/70 select-none">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-engine-green" />
            <span>Esquema Relacional</span>
          </h2>
          <span className="text-[10px] font-mono text-[#858b99]">
            DESCRIBE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
          {schemaTables.map((tbl) => (
            <button
              key={tbl}
              disabled={isExecuting}
              onClick={() => onSelectQuery(`DESCRIBE ${tbl};`)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1b1d23] hover:bg-[#23252d] border border-engine-border hover:border-engine-green text-[#c9d1d9] hover:text-engine-green transition-all truncate text-left"
              title={`Ver columnas de ${tbl}`}
            >
              <span className="text-engine-green">▪</span>
              <span className="truncate">{tbl}</span>
            </button>
          ))}
          <button
            disabled={isExecuting}
            onClick={() => onSelectQuery("SELECT * FROM easter_egg;")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1b1d23] hover:bg-[#23252d] border border-dashed border-engine-purple/40 hover:border-engine-purple text-engine-purple/80 hover:text-engine-purple transition-all truncate text-left"
            title="Sector secreto"
          >
            <span>🎯</span>
            <span className="truncate">easter_egg</span>
          </button>
        </div>
      </div>

      {/* Meta Utilities */}
      <div className="bg-[#15171c] border border-engine-border rounded-2xl p-3 flex items-center justify-between gap-2 shadow-lg">
        <button
          onClick={() => onSelectQuery("HELP;")}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#1b1d23] hover:bg-[#23252d] border border-engine-border hover:border-engine-amber text-[#858b99] hover:text-white transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5 text-engine-amber" />
          <span>HELP;</span>
        </button>

        <button
          onClick={() => onSelectQuery("SHOW TABLES;")}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#1b1d23] hover:bg-[#23252d] border border-engine-border hover:border-engine-green text-[#858b99] hover:text-white transition-all"
        >
          <Database className="w-3.5 h-3.5 text-engine-green" />
          <span>TABLES</span>
        </button>

        <button
          onClick={() => onSelectQuery("CLEAR;")}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#1b1d23] hover:bg-[#23252d] border border-engine-border hover:border-red-400 text-[#858b99] hover:text-red-400 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>CLEAR</span>
        </button>
      </div>
    </aside>
  );
};
