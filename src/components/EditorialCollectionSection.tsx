import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CollectionItem {
  index: string;
  title: string;
  description: string;
  query: string;
  tags: string[];
}

interface EditorialCollectionSectionProps {
  onSelectItem: (query: string) => void;
}

const COLLECTIONS: CollectionItem[] = [
  {
    index: '01',
    title: 'Experiencia Profesional',
    description: 'Porsalud (Stored Procedures, C#, JS) y Cooperativa La Reyna (4 descuadres contables resueltos en SQL).',
    query: 'SELECT * FROM experiencia;',
    tags: ['SQL Stored Procedures', 'Auditoría Contable', 'Multi-sede', 'Bases de Datos'],
  },
  {
    index: '02',
    title: 'Proyectos de Analítica',
    description: 'Olist E-Commerce Analytics, RH Manager (asistencia y nóminas), DayMark, Networking Labs y Smart Theme Switcher.',
    query: 'SELECT * FROM proyectos;',
    tags: ['Dashboards KPIs', 'React', 'TypeScript', 'People Analytics'],
  },
  {
    index: '03',
    title: 'Habilidades & Stack',
    description: 'SQL avanzado, Python para datos, Excel intermedio, Power BI, PostgreSQL, MySQL y Prisma ORM.',
    query: 'SELECT * FROM habilidades;',
    tags: ['SQL', 'Python', 'Excel', 'Power BI', 'MySQL', 'PostgreSQL'],
  },
  {
    index: '04',
    title: 'Certificaciones Oficiales',
    description: 'IBM CognitiveClass Python for Data Science, Cisco Networking Academy y The Linux Foundation.',
    query: 'SELECT * FROM certificaciones;',
    tags: ['IBM Data Science', 'Cisco Cyber', 'Linux Foundation', 'Redes'],
  },
  {
    index: '05',
    title: 'Formación Académica',
    description: 'Licenciatura en Informática Administrativa — Universidad Nacional Autónoma de Honduras (UNAH).',
    query: 'SELECT * FROM educacion;',
    tags: ['UNAH 2020-2026', 'Titulado', 'Gestión & TI'],
  },
  {
    index: '06',
    title: 'Canales de Contacto',
    description: 'Conéctate conmigo vía LinkedIn, WhatsApp directo, correo electrónico o agenda una reunión.',
    query: 'SELECT * FROM contacto;',
    tags: ['LinkedIn', 'WhatsApp', 'Email', 'Tegucigalpa'],
  },
];

export const EditorialCollectionSection: React.FC<EditorialCollectionSectionProps> = ({ onSelectItem }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 select-none border-b border-editorial-border">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-editorial-border">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-editorial-muted block mb-1">
            EXPLORACIÓN RELACIONAL
          </span>
          <h2 className="font-display font-light text-3xl sm:text-4xl text-[#141517] tracking-tight">
            Colección de Datos & Especialidades
          </h2>
        </div>
        <span className="text-xs font-mono text-editorial-muted">
          Haz clic en cualquier área para consultar los datos
        </span>
      </div>

      <div className="divide-y divide-editorial-border">
        {COLLECTIONS.map((item) => (
          <div
            key={item.index}
            onClick={() => onSelectItem(item.query)}
            className="group py-8 sm:py-10 flex flex-col md:flex-row md:items-baseline justify-between gap-6 cursor-pointer transition-all duration-300 hover:pl-4"
          >
            <div className="flex items-baseline gap-6 sm:gap-10">
              <span className="font-mono text-xs sm:text-sm text-editorial-muted group-hover:text-editorial-accent transition-colors font-medium">
                {item.index}
              </span>
              <div>
                <h3 className="font-display font-light text-2xl sm:text-3xl md:text-4xl text-[#141517] group-hover:italic transition-all">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-editorial-muted mt-2 max-w-xl font-sans font-normal leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white border border-editorial-border text-editorial-muted group-hover:border-[#141517] group-hover:text-[#141517] transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:self-center font-mono text-xs text-editorial-muted group-hover:text-[#141517] transition-colors">
              <span className="hidden sm:inline text-[11px] text-editorial-accent font-semibold">{item.query}</span>
              <div className="w-9 h-9 rounded-full border border-editorial-border group-hover:border-[#141517] group-hover:bg-[#141517] group-hover:text-white flex items-center justify-center transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
