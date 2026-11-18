import React, { useState } from 'react';
import { Maximize2, ExternalLink } from 'lucide-react';

interface NodeItem {
  id: string;
  label: string;
  category: 'center' | 'exp' | 'skill' | 'project' | 'cert';
  subLabel?: string;
  badge?: string;
  relationLabel: string;
  x: number; // percentage
  y: number; // percentage
  query: string;
  color: string;
}

interface InteractiveNodeGraphProps {
  onSelectQuery: (query: string) => void;
  onOpenFullscreen: (title: string, query: string) => void;
}

export const InteractiveNodeGraph: React.FC<InteractiveNodeGraphProps> = ({
  onSelectQuery,
  onOpenFullscreen,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('center');

  // Node layout coordinates (optimized for responsive SVG canvas)
  const nodes: NodeItem[] = [
    {
      id: 'center',
      label: 'Anthony Andino',
      subLabel: 'Lic. Informática Administrativa',
      category: 'center',
      relationLabel: 'SELF',
      x: 50,
      y: 50,
      query: 'SELECT * FROM perfil;',
      color: '#ff6b35'
    },
    // Top-Left: Experience Porsalud
    {
      id: 'porsalud',
      label: 'PORSALUD',
      subLabel: 'Desarrollo & Sistemas',
      badge: 'Stored Procedures',
      category: 'exp',
      relationLabel: 'EXPERIENCIA',
      x: 24,
      y: 28,
      query: "SELECT * FROM experiencia WHERE empresa = 'Porsalud';",
      color: '#ff8c42'
    },
    // Top-Right: Experience Cooperativa La Reyna
    {
      id: 'coop',
      label: 'COOP. LA REYNA',
      subLabel: '4 Descuadres Resueltos',
      badge: 'Auditoría SQL',
      category: 'exp',
      relationLabel: '4 CASOS',
      x: 76,
      y: 26,
      query: "SELECT * FROM experiencia WHERE empresa = 'Cooperativa La Reyna';",
      color: '#2ecc71'
    },
    // Left-Mid: SQL & Relational DBs
    {
      id: 'sql_skills',
      label: 'SQL & BASES DE DATOS',
      subLabel: 'PostgreSQL · MySQL · Prisma',
      badge: 'Avanzado',
      category: 'skill',
      relationLabel: 'DOMINIO',
      x: 18,
      y: 58,
      query: "SELECT * FROM habilidades WHERE tipo = 'db';",
      color: '#00d2ff'
    },
    // Right-Mid: Analytics & Python
    {
      id: 'analytics_skills',
      label: 'ANALYTICS & PYTHON',
      subLabel: 'Excel · Power BI · KPIs',
      badge: 'Data Stack',
      category: 'skill',
      relationLabel: 'ANÁLISIS',
      x: 82,
      y: 56,
      query: "SELECT * FROM habilidades WHERE tipo = 'data';",
      color: '#b388ff'
    },
    // Bottom-Left: RH Manager Project
    {
      id: 'rh_project',
      label: 'RH MANAGER',
      subLabel: 'Dashboard & Gestión de Personal',
      badge: 'KPIs & Nóminas',
      category: 'project',
      relationLabel: 'PROYECTO',
      x: 30,
      y: 78,
      query: "SELECT * FROM proyectos WHERE id = 2;",
      color: '#1f6f5c'
    },
    // Bottom-Right: Certificaciones IBM & Cisco
    {
      id: 'certs_node',
      label: '6 CERTIFICACIONES',
      subLabel: 'IBM Data Science · Cisco · Linux',
      badge: 'Acreditado',
      category: 'cert',
      relationLabel: 'CREDENCIALES',
      x: 70,
      y: 80,
      query: 'SELECT * FROM certificaciones;',
      color: '#f1c40f'
    }
  ];

  const centerNode = nodes.find(n => n.id === 'center')!;
  const outerNodes = nodes.filter(n => n.id !== 'center');
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || centerNode;

  const handleNodeClick = (node: NodeItem) => {
    setSelectedNodeId(node.id);
    onSelectQuery(node.query);
  };

  return (
    <div className="relative w-full rounded-3xl bg-[#15171c] border border-engine-border shadow-2xl p-4 sm:p-6 overflow-hidden">
      {/* Top Header of Node Graph Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-engine-border/70 select-none">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-engine-amber animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#858b99]">
            RELATIONAL_GRAPH · KNOWLEDGE_MAP
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-engine-amber/10 border border-engine-amber/30 text-engine-amber">
            INTERACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenFullscreen(selectedNode.label, selectedNode.query)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-engine-card hover:bg-engine-cardHover border border-engine-border hover:border-engine-amber text-[#c9d1d9] hover:text-white transition-all"
            title="Expandir a pantalla completa"
          >
            <Maximize2 className="w-3.5 h-3.5 text-engine-amber" />
            <span className="hidden sm:inline">Vista Inmersiva</span>
          </button>
        </div>
      </div>

      {/* Graph Area */}
      <div className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center select-none">
        {/* SVG Connectors Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {outerNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <g key={`wire-${node.id}`}>
                {/* Connecting wire */}
                <line
                  x1={`${centerNode.x}%`}
                  y1={`${centerNode.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke={isSelected ? node.color : '#3d414e'}
                  strokeWidth={isSelected ? 2 : 1.2}
                  strokeDasharray={isSelected ? '6 4' : '4 4'}
                  className={isSelected ? 'animated-dashed-line' : ''}
                  strokeOpacity={isSelected ? 0.9 : 0.45}
                />

                {/* Relationship Tag along the wire */}
                <foreignObject
                  x={`${(centerNode.x + node.x) / 2 - 6}%`}
                  y={`${(centerNode.y + node.y) / 2 - 2.5}%`}
                  width="80"
                  height="26"
                  className="overflow-visible"
                >
                  <div
                    className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider transition-all transform -translate-x-1/2 -translate-y-1/2 ${
                      isSelected
                        ? 'bg-engine-amber text-black font-bold shadow-md'
                        : 'bg-[#1b1d23] text-[#858b99] border border-engine-border/80'
                    }`}
                  >
                    {node.relationLabel}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Outer Nodes */}
        {outerNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-300 group z-10 ${
                isSelected ? 'scale-105' : 'hover:scale-102 opacity-85 hover:opacity-100'
              }`}
            >
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1b1d23] border transition-all ${
                  isSelected
                    ? 'border-engine-amber shadow-[0_0_20px_rgba(255,107,53,0.3)] ring-1 ring-engine-amber/50'
                    : 'border-engine-border hover:border-engine-borderHover'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: node.color }}
                />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-white tracking-wide">
                      {node.label}
                    </span>
                    {node.badge && (
                      <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#858b99] border border-white/10">
                        {node.badge}
                      </span>
                    )}
                  </div>
                  {node.subLabel && (
                    <span className="block text-[10px] text-[#858b99] truncate max-w-[130px] sm:max-w-[160px]">
                      {node.subLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Center Node (Anthony Andino) */}
        <div
          onClick={() => handleNodeClick(centerNode)}
          style={{
            left: `${centerNode.x}%`,
            top: `${centerNode.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute cursor-pointer transition-all duration-300 z-20 ${
            selectedNodeId === 'center' ? 'scale-105' : 'hover:scale-102'
          }`}
        >
          <div className="p-4 rounded-2xl bg-[#23252d] border-2 border-engine-amber/80 shadow-[0_0_35px_rgba(255,107,53,0.35)] flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-engine-amber to-engine-orange flex items-center justify-center text-white text-lg font-bold shadow-inner">
              📊
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                  {centerNode.label}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-engine-amber/20 text-engine-amber border border-engine-amber/30">
                  ROOT
                </span>
              </div>
              <p className="text-xs text-engine-amber font-mono">
                Analista de Datos
              </p>
              <p className="text-[10px] text-[#858b99] font-mono">
                Tegucigalpa, Honduras
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Bottom Bar */}
      <div className="mt-3 pt-3 border-t border-engine-border/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#858b99]">
          <span className="text-engine-amber">Active Node:</span>
          <span className="text-white font-semibold">{selectedNode.label}</span>
          <span className="text-[#3d414e]">|</span>
          <span className="text-[11px] text-[#858b99] hidden sm:inline">{selectedNode.query}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectQuery(selectedNode.query)}
            className="px-3 py-1 rounded-lg bg-engine-amber/20 hover:bg-engine-amber/30 text-engine-amber border border-engine-amber/40 transition-all font-semibold flex items-center gap-1.5"
          >
            <span>Ejecutar SQL</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={() => onOpenFullscreen(selectedNode.label, selectedNode.query)}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            Ver en Pantalla Completa
          </button>
        </div>
      </div>
    </div>
  );
};
