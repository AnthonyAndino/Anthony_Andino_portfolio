import React, { useState, useEffect } from 'react';
import { NavigationHeader, SectionId } from './components/NavigationHeader';
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsPage } from './pages/SkillsPage';
import { AboutPage } from './pages/AboutPage';
import { SqlConsolePage } from './pages/SqlConsolePage';
import { ContactSection } from './components/ContactSection';
import { ContactModal } from './components/ContactModal';
import { DataAnalystThread } from './components/DataAnalystThread';
import { CustomCursor } from './components/CustomCursor';
import { IntroSignature } from './components/IntroSignature';
import { SectionProgressIndicator } from './components/SectionProgressIndicator';

const SHOW_THREAD = false;

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [activeQuery, setActiveQuery] = useState<string>('SELECT * FROM perfil;');
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Check on mount if intro was already seen in this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem('anthony_intro_seen') === 'true') {
        setShowIntro(false);
      }
    } catch {
      // Ignore storage errors in restricted iframes
    }
  }, []);

  // ScrollSpy via IntersectionObserver (no layout reads on every scroll event):
  // the active section is the one covering the middle band of the viewport.
  useEffect(() => {
    const sectionIds: { id: SectionId; elementId: string }[] = [
      { id: 'home', elementId: 'hero-section' },
      { id: 'work', elementId: 'work-section' },
      { id: 'projects', elementId: 'projects-section' },
      { id: 'skills', elementId: 'skills-section' },
      { id: 'about', elementId: 'about-section' },
      { id: 'sql', elementId: 'sql-section' },
      { id: 'contact', elementId: 'contact-section' },
    ];

    if (typeof IntersectionObserver === 'undefined') {
      const sectionTops = new Map<SectionId, number>();
      const measureSectionTops = () => {
        sectionTops.clear();
        sectionIds.forEach(({ id, elementId }) => {
          const el = document.getElementById(elementId);
          if (el) {
            sectionTops.set(id, window.scrollY + el.getBoundingClientRect().top);
          }
        });
      };
      let resizeTimer = 0;
      const handleResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(measureSectionTops, 150);
      };
      const handleScrollSpy = () => {
        const scrollPos = window.scrollY + window.innerHeight * 0.5;
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const sectionTop = sectionTops.get(sectionIds[i].id);
          if (sectionTop !== undefined && scrollPos >= sectionTop) {
            setActiveSection(sectionIds[i].id);
            break;
          }
        }
      };
      measureSectionTops();
      window.addEventListener('scroll', handleScrollSpy, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
      handleScrollSpy();
      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener('scroll', handleScrollSpy);
        window.removeEventListener('resize', handleResize);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const match = sectionIds.find((s) => s.elementId === entry.target.id);
            if (match) setActiveSection(match.id);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sectionIds.forEach((s) => {
      const el = document.getElementById(s.elementId);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  // Smooth scroll to a section by ID
  const handleScrollToSection = (sectionId: SectionId | string) => {
    const targetElementId = sectionId === 'home' ? 'hero-section' : `${sectionId}-section`;
    const el = document.getElementById(targetElementId);
    if (el) {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';
      el.scrollIntoView({ behavior });
    }
  };

  // Open SQL Console and execute query
  const handleOpenQuery = (query: string) => {
    setActiveQuery(query);
    setTimeout(() => {
      handleScrollToSection('sql');
    }, 160);
  };

  return (
    <div className="relative min-h-screen bg-[#0c0d0f] text-[#141517] font-sans selection:bg-[#ff3e00] selection:text-white flex flex-col justify-between overflow-x-clip">
      {/* 1. Intro Animation with Signature (Runs once per session) */}
      {showIntro && (
        <IntroSignature onComplete={() => setShowIntro(false)} />
      )}

      {/* 2. Custom Cursor with high-contrast inversion over vermillion buttons and modal support */}
      <CustomCursor />

      {/* 3. The Continuous Data Analyst SVG Thread (draws itself on section change) */}
      {SHOW_THREAD && <DataAnalystThread activeSection={activeSection} />}

      {/* 4. Discrete 01-06 Section Progress Tracker */}
      <SectionProgressIndicator
        activeSection={activeSection}
        onNavigateSection={handleScrollToSection}
      />

      {/* 5. Sticky Navigation Header with Dark/Light theme switching & ScrollSpy */}
      <NavigationHeader
        activeSection={activeSection}
        onNavigateSection={handleScrollToSection}
      />

      {/* 6. Single Continuous Page Content */}
      <main className="relative flex-1">
        {/* Section 00: HOME HERO */}
        <section id="hero-section" className="snap-start relative">
          <HomePage
            onScrollToSection={handleScrollToSection}
            onOpenQuery={handleOpenQuery}
          />
        </section>

        {/* Section 01: WORK & AUDITS (Dark Theme Background) */}
        <section id="work-section" className="snap-start relative">
          <WorkPage
            onOpenQuery={handleOpenQuery}
            onScrollToSection={handleScrollToSection}
          />
        </section>

        {/* Section 02: PROJECTS & BI (Editorial List, 100dvh) */}
        <section id="projects-section" className="snap-start relative">
          <ProjectsPage
            onOpenQuery={handleOpenQuery}
          />
        </section>

        {/* Section 03: SKILLS & STACK (Dark Theme Background) */}
        <section id="skills-section" className="snap-start relative">
          <SkillsPage
            onOpenQuery={handleOpenQuery}
          />
        </section>

        {/* Section 04: ABOUT & CERTIFICATIONS (Linen/Light Theme Background) */}
        <section id="about-section" className="snap-start relative">
          <AboutPage
            onOpenQuery={handleOpenQuery}
          />
        </section>

        {/* Section 05: SQL ENGINE (Deep Dark Terminal Background) */}
        <section id="sql-section" className="snap-start relative">
          <SqlConsolePage
            initialQuery={activeQuery}
            onOpenContact={() => setIsContactOpen(true)}
          />
        </section>

        {/* Section 06: CONTACT (Final screen with integrated footer) */}
        <section id="contact-section" className="snap-start relative">
          <ContactSection
            onOpenContact={() => setIsContactOpen(true)}
            onScrollToHome={() => handleScrollToSection('home')}
          />
        </section>
      </main>

      {/* Contact Modal (SQL Transaction Terminal Interface) */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
};

export default App;
