import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';

export type SectionId = 'home' | 'work' | 'projects' | 'skills' | 'about' | 'sql' | 'contact';

interface NavigationHeaderProps {
  activeSection: SectionId;
  onNavigateSection: (sectionId: SectionId) => void;
}

interface NavItem {
  id: SectionId;
  number: string;
  label: string;
  sublabel: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeSection,
  onNavigateSection,
}) => {
  const { locale, t, toggleLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<SectionId | null>(null);

  const NAV_ITEMS: NavItem[] = [
    { id: 'home', number: '00', label: t('nav.home'), sublabel: t('nav.sub.home') },
    { id: 'work', number: '01', label: t('nav.work'), sublabel: t('nav.sub.work') },
    { id: 'projects', number: '02', label: t('nav.projects'), sublabel: t('nav.sub.projects') },
    { id: 'skills', number: '03', label: t('nav.skills'), sublabel: t('nav.sub.skills') },
    { id: 'about', number: '04', label: t('nav.about'), sublabel: t('nav.sub.about') },
    { id: 'sql', number: '05', label: t('nav.sql'), sublabel: t('nav.sub.sql') },
    { id: 'contact', number: '06', label: t('nav.contact'), sublabel: t('nav.sub.contact') },
  ];

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);

  // Determine section background darkness (when menu is closed)
  const isDarkSection =
    activeSection === 'work' ||
    activeSection === 'skills' ||
    activeSection === 'sql' ||
    activeSection === 'contact';

  // Body scroll lock while full-screen menu overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto focus on open
      setTimeout(() => {
        firstItemRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key & trap focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }

      // Focus trap within menu overlay
      if (e.key === 'Tab' && isOpen && menuContainerRef.current) {
        const focusableElements = menuContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectSection = (id: SectionId) => {
    setIsOpen(false);
    onNavigateSection(id);
    menuButtonRef.current?.focus();
  };

  return (
    <>
      {/* 1. Floating Pill Trigger: Fixed in top-right corner with 24-32px margin on desktop, 16px on mobile */}
      <button
        ref={menuButtonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="fullscreen-navigation-menu"
        aria-label={isOpen ? t('nav.closeMenu') : t('nav.openMenu')}
        className={`fixed top-4 sm:top-6 lg:top-7 right-4 sm:right-6 lg:right-8 z-50 select-none group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-300 focus:outline-none cursor-pointer shadow-md ${
          isOpen
            ? 'bg-[#141517] text-white border border-[#141517]'
            : isDarkSection
            ? 'bg-[#18191e] border border-white/20 text-[#f4f1ea] hover:border-[#ff3e00] hover:text-[#ff3e00]'
            : 'bg-[#f4f1ea] border border-[#ded9ce] text-[#141517] hover:border-[#141517]'
        }`}
      >
        <span>{isOpen ? t('nav.close') : t('nav.menu')}</span>

        {/* Circular Editorial Icon (Three horizontal lines -> X) */}
        <div
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors duration-300 ${
            isOpen
              ? 'border-white/30 bg-white/10 text-white'
              : isDarkSection
              ? 'border-white/20 group-hover:border-[#ff3e00] group-hover:text-[#ff3e00]'
              : 'border-[#141517]/30 group-hover:border-[#ff3e00] group-hover:text-[#ff3e00]'
          }`}
        >
          {isOpen ? (
            // Cross X icon
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // Three even horizontal lines
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 4.75 H13 M3 8 H13 M3 11.25 H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Compact ES/EN locale toggle, immediately left of the menu pill */}
      <button
        type="button"
        onClick={toggleLocale}
        aria-label={t('nav.toggleLanguage')}
        className={`fixed top-4 sm:top-6 lg:top-7 right-28 sm:right-36 lg:right-40 z-50 select-none inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-300 focus:outline-none cursor-pointer shadow-md ${
          isOpen
            ? 'bg-[#141517] text-white border border-[#141517]'
            : isDarkSection
            ? 'bg-[#18191e] border border-white/20 text-[#f4f1ea] hover:border-[#ff3e00]'
            : 'bg-[#f4f1ea] border border-[#ded9ce] text-[#141517] hover:border-[#141517]'
        }`}
      >
        <span className={locale === 'es' ? 'text-[#ff3e00]' : 'opacity-40'}>ES</span>
        <span className="opacity-30">/</span>
        <span className={locale === 'en' ? 'text-[#ff3e00]' : 'opacity-40'}>EN</span>
      </button>

      {/* 2. Full-Screen Menu Overlay Layer */}
      <div
        id="fullscreen-navigation-menu"
        ref={menuContainerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.dialogLabel')}
        className={`fixed inset-0 z-40 bg-[#f4f1ea] text-[#141517] flex flex-col justify-between pt-16 sm:pt-20 pb-8 px-6 sm:px-12 lg:px-20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-4'
        }`}
      >
        {/* Subtle background collection index watermark */}
        <div
          className="absolute top-8 sm:top-10 left-6 sm:left-12 lg:left-20 text-[9px] font-mono uppercase tracking-[0.3em] text-[#8a8a93] pointer-events-none"
          aria-hidden="true"
        >
          {t('nav.collectionIndex')}
        </div>

        {/* Navigation List: Massive Editorial Scale */}
        <nav className="my-auto max-w-5xl w-full mx-auto py-4">
          <ul className="space-y-1 sm:space-y-2 md:space-y-3">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeSection === item.id;
              const isHovered = hoveredItem === item.id;
              const isAnyHovered = hoveredItem !== null;
              const shouldDim = isAnyHovered && !isHovered;

              return (
                <li key={item.id} className="relative">
                  <button
                    ref={idx === 0 ? firstItemRef : undefined}
                    onClick={() => handleSelectSection(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group w-full text-left py-1 sm:py-2 flex items-baseline gap-4 sm:gap-8 transition-opacity duration-300 focus:outline-none cursor-pointer ${
                      shouldDim ? 'opacity-25' : 'opacity-100'
                    }`}
                  >
                    {/* Number in monospace */}
                    <span className="font-mono text-xs sm:text-sm md:text-base font-bold text-[#ff3e00] tracking-widest w-7 sm:w-10">
                      {item.number}
                    </span>

                    {/* Section Label */}
                    <div className="relative inline-block">
                      <span className="font-display font-light text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-none text-[#141517] group-hover:text-[#ff3e00] transition-colors duration-200">
                        {item.label}
                      </span>

                      {/* Active indicator dot */}
                      {isActive && (
                        <span
                          className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ff3e00] ml-3 sm:ml-4 align-middle"
                          title={t('nav.activeSection')}
                        />
                      )}

                      {/* Underline drawn on hover */}
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#ff3e00] transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
                    </div>

                    {/* Subtitle description */}
                    <span className="hidden md:inline-block font-mono text-[11px] text-[#71717a] ml-4 tracking-wider opacity-60 group-hover:opacity-100 group-hover:text-[#141517] transition-all">
                      — {item.sublabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Layer: Direct Professional Channels */}
        <div className="max-w-5xl w-full mx-auto pt-6 border-t border-[#ded9ce] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#71717a]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00]" />
            <span>{t('nav.location')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#141517]">
            <a
              href="mailto:anthonyandino959@gmail.com"
              className="hover:text-[#ff3e00] transition-colors"
            >
              anthonyandino959@gmail.com
            </a>

            <a
              href="https://linkedin.com/in/anthony-andino-ad"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#ff3e00] transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#ff3e00]" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
