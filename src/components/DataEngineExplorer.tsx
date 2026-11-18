import React, { useState } from 'react';
import { Folder, FileCode, ArrowRight, Play, Maximize2 } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  path: string;
  query: string;
  type: 'sql' | 'json' | 'md' | 'csv';
  size: string;
  recordsCount: number;
}

interface DirectoryGroup {
  dir: string;
  files: FileNode[];
}

interface DataEngineExplorerProps {
  onSelectQuery: (query: string) => void;
  onOpenFullscreen: (title: string, query: string) => void;
}

export const DataEngineExplorer: React.FC<DataEngineExplorerProps> = ({
  onSelectQuery,
  onOpenFullscreen,
}) => {
  const fileSystem: DirectoryGroup[] = [
    {
      dir: 'perfil/',
      files: [
        {
          id: 'profile_main',
          name: 'anthony_andino_overview.sql',
          path: '/anthony_db/perfil/overview.sql',
          query: 'SELECT * FROM perfil;',
          type: 'sql',
          size: '1.4 KB',
          recordsCount: 1,
        }
      ]
    },
    {
      dir: 'experiencia/',
      files: [
        {
          id: 'exp_porsalud',
          name: 'porsalud_stored_procedures.sql',
          path: '/anthony_db/experiencia/porsalud.sql',
          query: "SELECT * FROM experiencia WHERE empresa = 'Porsalud';",
          type: 'sql',
          size: '3.8 KB',
          recordsCount: 1,
        },
        {
          id: 'exp_reyna',
          name: 'cooperativa_reyna_audit_4cases.sql',
          path: '/anthony_db/experiencia/cooperativa_reyna.sql',
          query: "SELECT * FROM experiencia WHERE empresa = 'Cooperativa La Reyna';",
          type: 'sql',
          size: '4.2 KB',
          recordsCount: 1,
        }
      ]
    },
    {
      dir: 'habilidades/',
      files: [
        {
          id: 'skills_db',
          name: 'sql_postgres_mysql_stack.json',
          path: '/anthony_db/habilidades/database_engines.json',
          query: "SELECT * FROM habilidades WHERE tipo = 'db';",
          type: 'json',
          size: '2.1 KB',
          recordsCount: 5,
        },
        {
          id: 'skills_analytics',
          name: 'python_excel_powerbi.json',
          path: '/anthony_db/habilidades/analytics.json',
          query: "SELECT * FROM habilidades WHERE tipo = 'data';",
          type: 'json',
          size: '2.5 KB',
          recordsCount: 6,
        }
      ]
    },
    {
      dir: 'proyectos/',
      files: [
        {
          id: 'proj_rh',
          name: 'rh_enterprise_people_analytics.md',
          path: '/anthony_db/proyectos/rh_enterprise.md',
          query: 'SELECT * FROM proyectos WHERE id = 1;',
          type: 'md',
          size: '5.1 KB',
          recordsCount: 1,
        },
        {
          id: 'proj_fin',
          name: 'dashboard_financiero_react_ts.md',
          path: '/anthony_db/proyectos/dashboard_financiero.md',
          query: 'SELECT * FROM proyectos WHERE id = 2;',
          type: 'md',
          size: '4.6 KB',
          recordsCount: 1,
        }
      ]
    },
    {
      dir: 'certificaciones/',
      files: [
        {
          id: 'certs_all',
          name: 'ibm_cisco_linux_credentials.csv',
          path: '/anthony_db/certificaciones/credentials.csv',
          query: 'SELECT * FROM certificaciones;',
          type: 'csv',
          size: '3.2 KB',
          recordsCount: 5,
        }
      ]
    }
  ];

  const [activeFile, setActiveFile] = useState<FileNode>(fileSystem[0].files[0]);

  const handleFileClick = (file: FileNode) => {
    setActiveFile(file);
    onSelectQuery(file.query);
  };

  return (
    <div className="relative w-full rounded-3xl bg-[#121316] border border-engine-border shadow-2xl p-4 sm:p-7 overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-engine-border/70 select-none">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-engine-amber animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
            DATA_ENGINE · VFS BROWSER
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-engine-amber/10 border border-engine-amber/30 text-engine-amber">
            VIRTUAL FILE SYSTEM
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#858b99]">
          <span className="hidden sm:inline">Path: {activeFile.path}</span>
          <button
            onClick={() => onOpenFullscreen(activeFile.name, activeFile.query)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-engine-card hover:bg-engine-cardHover border border-engine-border hover:border-engine-amber text-white transition-all"
            title="Expandir a pantalla completa"
          >
            <Maximize2 className="w-3.5 h-3.5 text-engine-amber" />
            <span className="hidden sm:inline">Pantalla Completa</span>
          </button>
        </div>
      </div>

      {/* Connected Dual-Panel Layout (Image 1 Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT PANEL: Directory Tree (Image 1 Left Card) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#1a1b1f] border border-engine-border shadow-xl p-5 select-none transition-all">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-engine-border/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-engine-amber" />
              <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                CONTEXT_ENGINE · VFS
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#858b99] bg-[#121316] px-2 py-0.5 rounded border border-engine-border">
              BROWSE
            </span>
          </div>

          <div className="font-mono text-xs space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {fileSystem.map((group) => (
              <div key={group.dir} className="space-y-1">
                <div className="flex items-center gap-2 text-[#858b99] font-medium py-0.5">
                  <Folder className="w-3.5 h-3.5 text-engine-amber/80" />
                  <span>{group.dir}</span>
                </div>

                <div className="pl-4 space-y-1 border-l border-engine-border/60 ml-1.5">
                  {group.files.map((file) => {
                    const isSelected = activeFile.id === file.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => handleFileClick(file)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-all ${
                          isSelected
                            ? 'bg-[#38261e]/80 border border-engine-amber/50 text-white font-semibold shadow-sm'
                            : 'text-[#858b99] hover:bg-[#23252d] hover:text-[#c9d1d9]'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-engine-amber' : 'text-[#858b99]'}`} />
                          <span className="truncate">{file.name}</span>
                        </span>
                        <span className="text-[10px] text-[#6b7280] font-normal flex-shrink-0">
                          {file.size}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONNECTING WIRE / CONNECTOR (Image 1 Dashed Link) */}
        <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center relative">
          <div className="w-full h-0.5 border-t-2 border-dashed border-engine-amber/70 animated-dashed-line relative">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-engine-amber shadow-[0_0_12px_#ff6b35] animate-ping opacity-75" />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-sm" />
          </div>
          <span className="text-[9px] font-mono text-engine-amber mt-2 uppercase tracking-widest font-semibold">
            STREAM
          </span>
        </div>

        {/* RIGHT PANEL: Live Inspection Card (Image 1 Right Card) */}
        <div className="lg:col-span-6 rounded-2xl bg-[#1a1b1f] border border-engine-border shadow-xl p-5 transition-all">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-engine-border/60">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-engine-amber" />
              <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold truncate">
                {activeFile.path.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => onSelectQuery(activeFile.query)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-engine-amber hover:bg-engine-amberGlow text-black font-mono font-bold text-xs transition-all shadow-md flex-shrink-0"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>RUN</span>
            </button>
          </div>

          {/* Inspector Body with animated data skeleton bars & preview */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#121316] border border-engine-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#858b99] uppercase block">SQL Query Mapping</span>
                <span className="text-engine-amber font-semibold">{activeFile.query}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-engine-amber/10 border border-engine-amber/30 text-engine-amber text-[10px]">
                {activeFile.recordsCount} row(s)
              </span>
            </div>

            {/* Simulated Data Skeleton / Inspector bars (like Image 1) */}
            <div className="p-4 rounded-xl bg-[#121316]/80 border border-engine-border/70 space-y-2.5">
              <div className="h-2.5 w-11/12 rounded bg-gradient-to-r from-[#2c2f38] to-[#1e2027] animate-pulse" />
              <div className="h-2.5 w-4/5 rounded bg-gradient-to-r from-[#2c2f38] to-[#1e2027] animate-pulse" />
              <div className="h-2.5 w-full rounded bg-gradient-to-r from-[#2c2f38] to-[#1e2027] animate-pulse" />
              <div className="h-2.5 w-3/4 rounded bg-gradient-to-r from-[#2c2f38] to-[#1e2027] animate-pulse" />
              <div className="h-2.5 w-5/6 rounded bg-gradient-to-r from-[#2c2f38] to-[#1e2027] animate-pulse" />
            </div>

            <div className="flex items-center justify-between pt-2 text-[#858b99] text-[11px]">
              <span>Status: <span className="text-engine-green font-semibold">Ready to Inspect</span></span>
              <button
                onClick={() => onOpenFullscreen(activeFile.name, activeFile.query)}
                className="text-engine-amber hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Abrir en Pantalla Completa</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
