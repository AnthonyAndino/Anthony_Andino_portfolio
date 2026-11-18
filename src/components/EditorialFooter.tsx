import React from 'react';
import { PORTFOLIO_DB } from '../data/portfolioData';
import { ArrowUpRight } from './Icons';
import { gmailComposeUrl } from '../utils/contactLinks';
import { useLanguage } from '../i18n/LanguageContext';

interface EditorialFooterProps {
  onQuickQuery: (query: string) => void;
}

export const EditorialFooter: React.FC<EditorialFooterProps> = ({ onQuickQuery }) => {
  const perfil = PORTFOLIO_DB.perfil[0];
  const { t } = useLanguage();

  return (
    <footer className="bg-[#f7f6f2] border-t border-editorial-border py-12 sm:py-16 text-xs font-mono text-editorial-muted select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-editorial-borderLight">
          <div>
            <span className="font-display font-bold text-sm text-[#141517] uppercase tracking-wider block">
              ANTHONY JAFED ANDINO MARINERO
            </span>
            <span className="text-[11px] text-editorial-muted mt-0.5 block">
              Licenciado en Informática Administrativa · Orientado al Análisis de Datos & SQL
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#141517]">
            <a
              href={perfil.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-editorial-accent transition-colors inline-flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3 text-current" />
            </a>
            <a
              href={gmailComposeUrl(String(perfil.email))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${String(perfil.email)} — ${t('nav.openGmail')}`}
              className="hover:text-editorial-accent transition-colors inline-flex items-center gap-1"
            >
              <span>Email</span>
              <ArrowUpRight className="w-3 h-3 text-current" />
            </a>
            <a
              href={perfil.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-editorial-accent transition-colors inline-flex items-center gap-1"
            >
              <span>Web Portfolio</span>
              <ArrowUpRight className="w-3 h-3 text-current" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent" />
            <span>Tegucigalpa, Honduras · UNAH 2020 – 2026</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onQuickQuery("SELECT * FROM perfil;")}
              className="text-[#141517] hover:underline"
            >
              Consultar perfil SQL
            </button>
            <span>•</span>
            <span>Diseño Editorial Suizo & Arquitectónico</span>
            <span>•</span>
            <span>Vercel Deploy Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
