import React, { useState } from 'react';

interface IndexMenuItem {
  number: string;
  title: string;
  subtitle: string;
  query: string;
  offsetClass: string;
}

interface EditorialIndexMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
}

const MENU_ITEMS: IndexMenuItem[] = [
  {
    number: '01',
    title: 'HOME',
    subtitle: 'Introducción, perfil ejecutivo y propuesta de valor',
    query: 'SELECT * FROM perfil;',
    offsetClass: 'pl-0 sm:pl-4',
  },
  {
    number: '02',
    title: 'WORK',
    subtitle: 'Experiencia profesional: Porsalud & Cooperativa La Reyna',
    query: 'SELECT * FROM experiencia;',
    offsetClass: 'pl-10 sm:pl-36 md:pl-56',
  },
  {
    number: '03',
    title: 'PROJECTS',
    subtitle: 'Olist E-Commerce, RH Manager, DayMark, Networking Labs y Smart Theme Switcher',
    query: 'SELECT * FROM proyectos;',
    offsetClass: 'pl-4 sm:pl-16 md:pl-28',
  },
  {
    number: '04',
    title: 'SKILLS',
    subtitle: 'SQL, Python, Excel, Power BI, PostgreSQL, MySQL y Stored Procedures',
    query: 'SELECT * FROM habilidades;',
    offsetClass: 'pl-12 sm:pl-44 md:pl-72',
  },
  {
    number: '05',
    title: 'CERTS',
    subtitle: '6 Credenciales: IBM Data Science, Cisco Networking & Linux Foundation',
    query: 'SELECT * FROM certificaciones;',
    offsetClass: 'pl-2 sm:pl-12 md:pl-20',
  },
  {
    number: '06',
    title: 'CONTACT',
    subtitle: 'LinkedIn, correo electrónico y web oficial',
    query: 'SELECT * FROM contacto;',
    offsetClass: 'pl-16 sm:pl-52 md:pl-80',
  },
];

export const EditorialIndexMenu: React.FC<EditorialIndexMenuProps> = ({
  isOpen,
  onClose,
  onSelectQuery
}) => {
  const [, setHoveredItem] = useState<IndexMenuItem | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f4f0] flex flex-col justify-between p-6 sm:p-12 overflow-y-auto animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-editorial-border">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#141517]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="10" width="8" height="24" stroke="currentColor" strokeWidth="2" />
            <rect x="10" y="2" width="10" height="32" stroke="currentColor" strokeWidth="2" />
            <rect x="20" y="16" width="14" height="18" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="leading-tight">
            <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-[#141517] block">
              EDISON FANG STYLE · INDEX
            </span>
            <span className="font-mono text-[10px] tracking-widest text-editorial-muted uppercase block">
              COLLECTION INDEX / DATA ANALYTICS
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-editorial-border hover:bg-[#141517] hover:text-white bg-white transition-all text-xs font-mono uppercase tracking-widest text-[#141517]"
        >
          <span>CLOSE</span>
          <div className="w-6 h-6 rounded-full bg-[#f0ede4] flex items-center justify-center text-xs">
            ✕
          </div>
        </button>
      </div>

      {/* Main Staggered Index Menu (exact rhythm of Image 2) */}
      <div className="py-12 sm:py-16 max-w-5xl mx-auto w-full flex flex-col gap-6 sm:gap-10">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.25em] text-editorial-muted uppercase pb-2">
          <span>COLLECTION INDEX</span>
          <span>DATA ANALYTICS / SQL ARCHITECTURE</span>
        </div>

        {MENU_ITEMS.map((item) => {
          return (
            <div
              key={item.number}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                onSelectQuery(item.query);
                onClose();
              }}
              className={`cursor-pointer group transition-all duration-300 ${item.offsetClass}`}
            >
              <div className="inline-flex items-baseline gap-4 sm:gap-6">
                <span className="font-mono text-xs sm:text-sm text-editorial-faint group-hover:text-editorial-accent transition-colors font-medium">
                  {item.number}
                </span>

                <div>
                  <h2 className="font-display font-light text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#141517] tracking-tight group-hover:italic group-hover:translate-x-3 transition-all duration-300">
                    {item.title}
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-editorial-muted mt-1 max-w-md group-hover:text-[#141517] transition-colors">
                    {item.subtitle}
                  </p>
                  <span className="inline-block mt-1 font-mono text-[11px] text-editorial-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.query} ↵
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer bar */}
      <div className="pt-6 border-t border-editorial-border flex flex-wrap items-center justify-between text-xs font-mono text-editorial-muted">
        <div>
          <span>ANTHONY JAFED ANDINO MARINERO</span>
          <span className="mx-2">•</span>
          <span>LICENCIADO EN INFORMÁTICA ADMINISTRATIVA</span>
        </div>

        <div className="flex items-center gap-4">
          <span>TEGUCIGALPA, HONDURAS</span>
          <span>•</span>
          <span className="text-editorial-accent font-semibold">DISPONIBILIDAD INMEDIATA</span>
        </div>
      </div>
    </div>
  );
};
