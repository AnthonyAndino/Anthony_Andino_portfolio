import React from 'react';
import { SectionId } from './NavigationHeader';
import { useLanguage } from '../i18n/LanguageContext';

interface SectionProgressIndicatorProps {
  activeSection: SectionId;
  onNavigateSection: (sectionId: SectionId) => void;
}

export const SectionProgressIndicator: React.FC<SectionProgressIndicatorProps> = ({
  activeSection,
  onNavigateSection,
}) => {
  const { t } = useLanguage();

  const sections: { id: SectionId; num: string; label: string }[] = [
    { id: 'work', num: '01', label: t('progress.work') },
    { id: 'projects', num: '02', label: t('progress.projects') },
    { id: 'skills', num: '03', label: t('progress.skills') },
    { id: 'about', num: '04', label: t('progress.about') },
    { id: 'sql', num: '05', label: t('progress.sql') },
    { id: 'contact', num: '06', label: t('progress.contact') },
  ];

  const isDark = activeSection === 'work' || activeSection === 'skills' || activeSection === 'sql' || activeSection === 'contact';

  // Only show once scrolled past hero
  if (activeSection === 'home') return null;

  return (
    <aside
      className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-end gap-3 pointer-events-auto select-none"
      aria-label={t('progress.label')}
    >
      {sections.map((s) => {
        const isActive = activeSection === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onNavigateSection(s.id)}
            className="group flex items-center gap-2.5 py-1 text-right focus:outline-none"
            title={s.label}
          >
            <span
              className={`text-[10px] font-mono tracking-widest transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                isDark ? 'text-white/80' : 'text-[#141517]'
              }`}
            >
              {s.label}
            </span>

            <span
              className={`font-mono text-[11px] font-bold transition-all duration-200 ${
                isActive
                  ? 'text-[#ff3e00] scale-110'
                  : isDark
                  ? 'text-white/30 group-hover:text-white/70'
                  : 'text-[#a1a1aa] group-hover:text-[#141517]'
              }`}
            >
              {s.num}
            </span>

            {/* Indicator bar */}
            <span
              className={`h-0.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-6 bg-[#ff3e00]'
                  : isDark
                  ? 'w-2 bg-white/20 group-hover:w-4 group-hover:bg-white/50'
                  : 'w-2 bg-black/20 group-hover:w-4 group-hover:bg-black/50'
              }`}
            />
          </button>
        );
      })}
    </aside>
  );
};
