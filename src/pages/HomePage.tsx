import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { usePortfolioData } from '../i18n/usePortfolioData';

interface HomePageProps {
  onScrollToSection: (sectionId: string) => void;
  onOpenQuery: (query: string) => void;
}

const GLITCH_POOL = ['#', 'N', 'U', 'L', 'L', 'R', 'E', 'F', '!', '%', '0', 'x', '1', '9', 'a', 'N', '?', '$'];

interface DataCleaningTextProps {
  targetText: string;
  isInitial?: boolean;
}

const DataCleaningText: React.FC<DataCleaningTextProps> = ({ targetText, isInitial = false }) => {
  const [displayText, setDisplayText] = useState<string>(targetText);
  const [isCleaned, setIsCleaned] = useState<boolean>(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayText(targetText);
      setIsCleaned(true);
      return;
    }

    setIsCleaned(false);
    // 1.2s on first load, 650ms on phrase rotations
    const duration = isInitial ? 1200 : 650;
    let startTime: number | null = null;
    let animationFrameId: number;

    const chars = targetText.split('');
    const totalChars = chars.length;

    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Characters progressively resolved from left to right
      const resolvedCount = Math.floor(progress * totalChars);

      let current = '';
      for (let i = 0; i < totalChars; i++) {
        if (chars[i] === ' ') {
          current += ' ';
        } else if (i < resolvedCount) {
          current += chars[i];
        } else {
          // Glitch / dirty data character
          const rand = GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
          current += rand;
        }
      }

      setDisplayText(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setDisplayText(targetText);
        setIsCleaned(true);
      }
    };

    const delay = isInitial ? 200 : 80;
    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetText, isInitial]);

  return (
    <span
      aria-label={targetText}
      className={`font-serif italic font-normal tracking-[-0.02em] inline-block transition-colors duration-300 ${
        isCleaned ? 'text-[#1e1f22]' : 'text-[#ff3e00]'
      }`}
    >
      {displayText}
    </span>
  );
};

// Subtle background architectural chart with forwardRef for parallax displacement
const HeroBackgroundChart = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const { t } = useLanguage();

  return (
    <div
      ref={ref}
      className="absolute right-0 top-1/2 -translate-y-1/2 w-full sm:w-[85%] md:w-[70%] lg:w-[58%] h-[75%] sm:h-[82%] pointer-events-none select-none z-0 overflow-visible opacity-35 sm:opacity-45 will-change-transform"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 640 400"
        fill="none"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle Horizontal Grid lines */}
        <line x1="40" y1="90" x2="600" y2="90" stroke="#141517" strokeOpacity="0.08" strokeDasharray="3 4" />
        <line x1="40" y1="170" x2="600" y2="170" stroke="#141517" strokeOpacity="0.08" strokeDasharray="3 4" />
        <line x1="40" y1="250" x2="600" y2="250" stroke="#141517" strokeOpacity="0.08" strokeDasharray="3 4" />
        <line x1="40" y1="330" x2="600" y2="330" stroke="#141517" strokeOpacity="0.10" />

        {/* Faint axis labels */}
        <text x="45" y="85" fill="#71717a" fillOpacity="0.45" fontSize="8" fontFamily="monospace">{t('home.svg.reconciled')}</text>
        <text x="45" y="165" fill="#71717a" fillOpacity="0.45" fontSize="8" fontFamily="monospace">{t('home.svg.audited')}</text>
        <text x="45" y="245" fill="#71717a" fillOpacity="0.45" fontSize="8" fontFamily="monospace">{t('home.svg.parsed')}</text>
        <text x="45" y="325" fill="#71717a" fillOpacity="0.45" fontSize="8" fontFamily="monospace">{t('home.svg.base')}</text>

        {/* 6 Architectural Distribution Bar Outlines */}
        <rect x="140" y="230" width="36" height="100" stroke="#141517" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <rect x="205" y="180" width="36" height="150" stroke="#141517" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <rect x="270" y="210" width="36" height="120" stroke="#141517" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <rect x="335" y="130" width="36" height="200" stroke="#141517" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <rect x="400" y="150" width="36" height="180" stroke="#141517" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <rect x="465" y="80" width="36" height="250" stroke="#141517" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="3 3" fill="none" />

        {/* Shaded bar caps */}
        <line x1="140" y1="230" x2="176" y2="230" stroke="#141517" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="205" y1="180" x2="241" y2="180" stroke="#141517" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="270" y1="210" x2="306" y2="210" stroke="#141517" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="335" y1="130" x2="371" y2="130" stroke="#141517" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="400" y1="150" x2="436" y2="150" stroke="#141517" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="465" y1="80" x2="501" y2="80" stroke="#141517" strokeOpacity="0.30" strokeWidth="1.5" />

        {/* Smooth Trendline sweeping upwards across the chart */}
        <path
          d="M 100 280 C 160 250, 205 180, 270 200 C 335 150, 395 160, 475 80 C 515 40, 555 70, 580 95"
          stroke="#141517"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Trendline Intermediate Data Nodes */}
        <circle cx="205" cy="180" r="3" fill="#f4f1ea" stroke="#141517" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="270" cy="200" r="3" fill="#f4f1ea" stroke="#141517" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="371" cy="130" r="3" fill="#f4f1ea" stroke="#141517" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="475" cy="80" r="3.5" fill="#f4f1ea" stroke="#ff3e00" strokeOpacity="0.6" strokeWidth="1.5" />

        {/* Final Culminating Node (Origin point for the red thread) */}
        <g data-thread-anchor="home-start" transform="translate(580, 95)">
          <circle r="9" fill="#ff3e00" fillOpacity="0.12" />
          <circle r="5" fill="#f4f1ea" stroke="#ff3e00" strokeWidth="1.8" />
          <circle r="2" fill="#ff3e00" />
          <text x="0" y="19" fill="#71717a" fillOpacity="0.6" fontSize="7" fontFamily="monospace" textAnchor="middle" letterSpacing="0.08em">
            {t('home.start')}
          </text>
        </g>
      </svg>
    </div>
  );
});

HeroBackgroundChart.displayName = 'HeroBackgroundChart';

export const HomePage: React.FC<HomePageProps> = ({
  onScrollToSection,
}) => {
  const { t } = useLanguage();
  const { HOME_HERO_DATA } = usePortfolioData();

  // Layer refs for 60fps direct transform mutation (Zero React re-renders)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const greetingRef = useRef<HTMLDivElement | null>(null);
  const row1Ref = useRef<HTMLDivElement | null>(null);
  const row2Ref = useRef<HTMLDivElement | null>(null);
  const row3Ref = useRef<HTMLDivElement | null>(null);
  const sideLabelRef = useRef<HTMLDivElement | null>(null);
  const bottomColumnsRef = useRef<HTMLDivElement | null>(null);

  // Entrance animation state for the greeting
  const [isGreetingVisible, setIsGreetingVisible] = useState<boolean>(false);

  // Phrase rotation state (changes every 4 seconds continuously)
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [transitionStage, setTransitionStage] = useState<'visible' | 'exiting' | 'entering'>('visible');

  // Current active phrase
  const currentPhrase = HOME_HERO_DATA.phrases[phraseIndex] || HOME_HERO_DATA.phrases[0];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsGreetingVisible(true);
      return;
    }
    const timer = setTimeout(() => {
      setIsGreetingVisible(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Phrase rotation loop: always changes every 4 seconds continuously
  useEffect(() => {
    const intervalTimer = setInterval(() => {
      // Step 1: Exit phase (rows translate up & fade out, staggered)
      setTransitionStage('exiting');

      // Step 2: Swap phrase & prepare entrance from below
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % HOME_HERO_DATA.phrases.length);
        setTransitionStage('entering');

        // Step 3: Trigger entrance transition in next animation frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionStage('visible');
          });
        });
      }, 350);
    }, 4000);

    return () => clearInterval(intervalTimer);
  }, []);

  // Parallax physics loop with Inertia (Lerp)
  useEffect(() => {
    // Disable on touch screens and if user prefers reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isVisible = true;
    let rafId: number;

    const cfg = HOME_HERO_DATA.parallax;

    const tick = () => {
      if (!isVisible) return;

      // Smooth Lerp toward cursor target
      currentX += (targetX - currentX) * cfg.lerpEase;
      currentY += (targetY - currentY) * cfg.lerpEase;

      // Layer 0: Greeting (Very subtle parallax)
      if (greetingRef.current) {
        const gx = currentX * cfg.greeting;
        const gy = currentY * cfg.greeting;
        greetingRef.current.style.transform = `translate3d(${gx.toFixed(2)}px, ${gy.toFixed(2)}px, 0)`;
      }

      // Layer 1: Background Chart (Moves in OPPOSITE direction for true depth)
      if (chartRef.current) {
        const cx = currentX * cfg.backgroundChart;
        const cy = currentY * cfg.backgroundChart;
        chartRef.current.style.transform = `translate3d(${cx.toFixed(2)}px, calc(-50% + ${cy.toFixed(2)}px), 0)`;
      }

      // Layer 2: Headline Row 1
      if (row1Ref.current) {
        const r1x = currentX * cfg.headlineRow1;
        const r1y = currentY * cfg.headlineRow1;
        row1Ref.current.style.transform = `translate3d(${r1x.toFixed(2)}px, ${r1y.toFixed(2)}px, 0)`;
      }

      // Layer 3: Headline Row 2
      if (row2Ref.current) {
        const r2x = currentX * cfg.headlineRow2;
        const r2y = currentY * cfg.headlineRow2;
        row2Ref.current.style.transform = `translate3d(${r2x.toFixed(2)}px, ${r2y.toFixed(2)}px, 0)`;
      }

      // Layer 4: Headline Row 3
      if (row3Ref.current) {
        const r3x = currentX * cfg.headlineRow3;
        const r3y = currentY * cfg.headlineRow3;
        row3Ref.current.style.transform = `translate3d(${r3x.toFixed(2)}px, ${r3y.toFixed(2)}px, 0)`;
      }

      // Layer 5: Left Vertical Badges
      if (sideLabelRef.current) {
        const sx = currentX * cfg.verticalLabel;
        const sy = currentY * cfg.verticalLabel;
        sideLabelRef.current.style.transform = `translate3d(${sx.toFixed(2)}px, calc(-50% + ${sy.toFixed(2)}px), 0) rotate(180deg)`;
      }

      // Layer 6: Bottom Information Columns
      if (bottomColumnsRef.current) {
        const bx = currentX * cfg.bottomColumns;
        const by = currentY * cfg.bottomColumns;
        bottomColumnsRef.current.style.transform = `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetX = Math.max(-1, Math.min(1, x));
      targetY = Math.max(-1, Math.min(1, y));
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    // IntersectionObserver: Pause loops when Home is outside viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Compute staggered classes for exiting, entering, and visible stages
  const getRowTransitionClass = (delayMs: number) => {
    if (transitionStage === 'exiting') {
      return `opacity-0 -translate-y-3 transition-all duration-300 ease-in ${
        delayMs === 75 ? 'delay-75' : delayMs === 150 ? 'delay-150' : ''
      }`;
    }
    if (transitionStage === 'entering') {
      return 'opacity-0 translate-y-3 transition-none';
    }
    return `opacity-100 translate-y-0 transition-all duration-400 ease-out ${
      delayMs === 75 ? 'delay-75' : delayMs === 150 ? 'delay-150' : ''
    }`;
  };

  return (
    <div
      id="hero-section"
      ref={containerRef}
      className="relative select-none text-[#141517] min-h-[100dvh] flex flex-col justify-between pt-16 pb-6 px-4 sm:px-8 lg:px-12 scroll-mt-16 overflow-hidden"
    >
      {/* 0. Background layer (below the red thread) */}
      <div className="section-bg" aria-hidden="true">
        <div className="absolute inset-0 bg-[#f4f1ea]" />
        {/* 1. Background Architectural Chart with Parallax Layer */}
        <HeroBackgroundChart ref={chartRef} />
      </div>

      {/* 2. Left vertical labels track (Desktop) with Parallax Layer */}
      <div
        ref={sideLabelRef}
        className="hidden lg:flex absolute left-48 xl:left-56 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] rotate-180 origin-center text-[9px] font-mono tracking-[0.3em] text-[#8a8a93] uppercase whitespace-nowrap select-none pointer-events-none z-[2] will-change-transform"
      >
        <span>{t('home.tag.integrity')}</span>
        <span className="mx-2 text-[#ff3e00]">·</span>
        <span>{t('home.tag.audit')}</span>
        <span className="mx-2 text-[#ff3e00]">·</span>
        <span>{t('home.tag.procedures')}</span>
        <span className="mx-2 text-[#ff3e00]">·</span>
        <span>{t('home.tag.bi')}</span>
      </div>

      {/* Main Content Area */}
      <div data-thread-content="1" className="section-content max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between py-2 sm:py-4">
        {/* Mobile top label */}
        <div className="lg:hidden pb-2 text-[9px] font-mono tracking-[0.25em] text-[#71717a] uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00]" />
          <span>{t('home.tag.integrity')} · {t('home.tag.audit')} · {t('home.tag.bi')}</span>
        </div>

        {/* 3. Massive Headline with Fixed Reserved Height & Anchored Rows */}
        <div
          id="hero-headline-block"
          className="my-auto cursor-default w-full"
          aria-live="off"
        >
          {/* Greeting: Hi, / I'm Anthony Andino. (Fixed height container) */}
          <div
            id="hero-greeting"
            ref={greetingRef}
            className="will-change-transform mb-2 sm:mb-4 h-10 sm:h-12 flex flex-col justify-end"
          >
            <div
              className={`font-sans font-bold text-sm sm:text-base md:text-lg lg:text-xl text-[#141517] leading-tight transition-all duration-700 ease-out ${
                isGreetingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              <span className="block whitespace-nowrap">{HOME_HERO_DATA.greeting.line1}</span>
              <span className="block whitespace-nowrap">{HOME_HERO_DATA.greeting.line2}</span>
            </div>
          </div>

          {/* Reserved 3-Row Headline Frame (Exact height independent of text) */}
          <div
            id="hero-rows-frame"
            className="flex flex-col justify-between h-[160px] xs:h-[190px] sm:h-[260px] md:h-[320px] lg:h-[380px] xl:h-[420px]"
          >
            {/* Line 1 */}
            <div
              id="hero-row-1"
              ref={row1Ref}
              className="h-[33.33%] flex items-center will-change-transform whitespace-nowrap overflow-visible"
            >
              <div className="transform hover:translate-x-3 transition-transform duration-300">
                <div className={getRowTransitionClass(0)}>
                  <h1 className="font-display font-extrabold tracking-[-0.04em] leading-none text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] xl:text-[8.5rem] text-[#141517] whitespace-nowrap">
                    <span className="sr-only">{t('home.srLine')}</span>
                    <span aria-hidden="true">{currentPhrase.line1}</span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Line 2: Serif Italic with Data Cleaning Animation */}
            <div
              id="hero-row-2"
              ref={row2Ref}
              className="h-[33.33%] flex items-center will-change-transform whitespace-nowrap overflow-visible pl-3 sm:pl-12 md:pl-20 lg:pl-28"
            >
              <div className="transform hover:translate-x-3 transition-transform duration-300">
                <div className={getRowTransitionClass(75)}>
                  <div className="font-serif italic font-normal tracking-[-0.02em] leading-none text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] xl:text-[8.5rem] whitespace-nowrap">
                    <DataCleaningText
                      targetText={currentPhrase.line2}
                      isInitial={phraseIndex === 0}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line 3: with final vermillion dot */}
            <div
              id="hero-row-3"
              ref={row3Ref}
              className="h-[33.33%] flex items-center will-change-transform whitespace-nowrap overflow-visible pl-6 sm:pl-20 md:pl-36 lg:pl-48"
            >
              <div className="transform hover:translate-x-3 transition-transform duration-300">
                <div className={getRowTransitionClass(150)}>
                  <div className="font-display font-extrabold tracking-[-0.04em] leading-none text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] xl:text-[8.5rem] text-[#141517] whitespace-nowrap">
                    <span>{currentPhrase.line3}</span>
                    <span className="text-[#ff3e00]">.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom 3-Column Strip & Scroll Indicator with Subtle Parallax */}
        <div
          id="hero-bottom-columns"
          ref={bottomColumnsRef}
          className="pt-4 border-t border-[#ded9ce] space-y-3 will-change-transform mt-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            {HOME_HERO_DATA.columns.map((col) => (
              <div key={col.id} className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#ff3e00] font-bold tracking-wider block uppercase">
                  {col.tag}
                </span>
                <p className="text-xs sm:text-[13px] font-sans font-medium text-[#27282b] leading-snug">
                  {col.value}
                </p>
              </div>
            ))}
          </div>

          {/* 5. Centered Scroll Indicator */}
          <div className="flex justify-center pt-1">
            <button
              onClick={() => onScrollToSection(HOME_HERO_DATA.scrollCta.targetSection)}
              className="group inline-flex flex-col items-center gap-1 font-mono text-[10px] tracking-[0.25em] text-[#71717a] hover:text-[#ff3e00] transition-colors uppercase focus:outline-none cursor-pointer"
            >
              <span>{HOME_HERO_DATA.scrollCta.label}</span>
              <span className="w-px h-4 bg-[#71717a] group-hover:bg-[#ff3e00] group-hover:h-6 transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
