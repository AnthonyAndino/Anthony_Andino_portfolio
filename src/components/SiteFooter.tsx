import React from 'react';
import { SectionId } from './NavigationHeader';
import { PORTFOLIO_DB } from '../data/portfolioData';
import { ArrowUpRight } from './Icons';
import { gmailComposeUrl } from '../utils/contactLinks';
import { useLanguage } from '../i18n/LanguageContext';

interface SiteFooterProps {
  onScrollToSection: (sectionId: SectionId) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onScrollToSection }) => {
  const perfil = PORTFOLIO_DB.perfil[0];
  const { t } = useLanguage();

  return (
    <footer id="footer-section" className="bg-[#0c0d0f] border-t border-white/10 py-12 text-xs font-mono text-[#a1a1aa] select-none transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <span className="font-display font-bold text-sm text-white uppercase tracking-wider block">
              ANTHONY JAFED ANDINO MARINERO
            </span>
            <span className="text-[11px] text-[#71717a] mt-0.5 block">
              Licenciado en Informática Administrativa (UNAH) · Analista de Datos
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <a
              href={perfil.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#ff3e00] transition-colors"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <a
              href={gmailComposeUrl(String(perfil.email))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${String(perfil.email)} — ${t('nav.openGmail')}`}
              className="inline-flex items-center gap-1 hover:text-[#ff3e00] transition-colors"
            >
              <span>Email</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <a
              href={perfil.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#ff3e00] transition-colors"
            >
              <span>Web</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00]" />
            <span>Tegucigalpa, Honduras · Disponibilidad Inmediata</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => onScrollToSection('home')} className="hover:text-white transition-colors">Home</button>
            <span className="text-white/20">•</span>
            <button onClick={() => onScrollToSection('work')} className="hover:text-white transition-colors">Work</button>
            <span className="text-white/20">•</span>
            <button onClick={() => onScrollToSection('projects')} className="hover:text-white transition-colors">Projects</button>
            <span className="text-white/20">•</span>
            <button onClick={() => onScrollToSection('skills')} className="hover:text-white transition-colors">Stack</button>
            <span className="text-white/20">•</span>
            <button onClick={() => onScrollToSection('about')} className="hover:text-white transition-colors">About</button>
            <span className="text-white/20">•</span>
            <button onClick={() => onScrollToSection('sql')} className="hover:text-white transition-colors">Console</button>
            <span className="text-white/20">•</span>
            <button onClick={() => onScrollToSection('contact')} className="hover:text-white transition-colors">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
