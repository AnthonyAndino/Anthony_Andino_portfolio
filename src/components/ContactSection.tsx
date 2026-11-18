import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CONTACT_DATA } from '../data/portfolioData';
import { ScrollReveal } from './ScrollReveal';

interface ContactSectionProps {
  onOpenContact: () => void;
  onScrollToHome: () => void;
}

// ─── SVG Signature path (reused from IntroSignature) ───
const SIGNATURE_PATH =
  'M 30 110 C 45 40, 65 20, 80 20 C 95 20, 105 85, 115 110 M 55 75 C 75 72, 105 70, 125 72 M 130 100 C 135 85, 142 80, 150 95 C 158 108, 165 85, 175 105 M 180 82 C 185 75, 195 72, 202 85 C 205 98, 208 108, 215 108 M 220 65 C 220 85, 222 108, 225 108 M 215 80 C 225 78, 235 78, 240 78 M 245 80 C 248 105, 252 115, 258 100 C 262 90, 268 85, 275 88 C 280 92, 280 115, 280 120 M 310 110 C 325 35, 345 20, 360 20 C 375 20, 385 85, 395 110 M 335 75 C 355 72, 385 70, 405 72 M 410 88 C 418 80, 428 85, 432 98 C 435 108, 442 85, 450 105 M 455 70 C 458 85, 460 105, 465 108 M 470 85 C 475 78, 485 78, 490 92 C 492 105, 498 108, 505 105';

// ─── Icons ───
const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 3h10v10M17 3L7 13" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 3v10M6 9l4 4 4-4M4 15h12" />
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="6" y="6" width="10" height="10" rx="2" />
    <path d="M14 6V4a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h2" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 10 8 14 16 6" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10h12M12 6l4 4-4 4" />
  </svg>
);

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 16V4M6 8l4-4 4 4" />
  </svg>
);

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenContact, onScrollToHome }) => {
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<SVGPathElement>(null);
  const signatureWrapRef = useRef<HTMLDivElement>(null);
  const hasDrawnRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [showSignature, setShowSignature] = useState(true);

  // ─── Copy email with fallback ───
  const handleCopyEmail = useCallback(async () => {
    if (copied) return;
    const email = CONTACT_DATA.email;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Silent fail
    }
  }, [copied]);

  // ─── Position signature in the free band between pills and footer ───
  useEffect(() => {
    const measure = () => {
      const pills = pillsRef.current;
      const footer = footerRef.current;
      const sigWrap = signatureWrapRef.current;
      if (!pills || !footer || !sigWrap) return;

      const pillsBottom = pills.getBoundingClientRect().bottom;
      const footerTop = footer.getBoundingClientRect().top;
      const freeHeight = footerTop - pillsBottom;

      if (freeHeight < 120) {
        setShowSignature(false);
        return;
      }
      setShowSignature(true);

      // Position the signature container in the free band
      const sectionRect = sectionRef.current?.getBoundingClientRect();
      if (!sectionRect) return;
      const topOffset = pillsBottom - sectionRect.top + 8; // 8px gap from pills
      const availHeight = freeHeight - 16; // 16px total margin

      sigWrap.style.top = `${topOffset}px`;
      sigWrap.style.height = `${availHeight}px`;
    };

    measure();
    window.addEventListener('resize', measure, { passive: true });
    // Re-measure after layout settles
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 800);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // ─── Signature draw-in animation via IntersectionObserver ───
  useEffect(() => {
    const section = sectionRef.current;
    const path = signatureRef.current;
    if (!section || !path) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const totalLength = path.getTotalLength();
    path.style.strokeDasharray = `${totalLength}`;

    if (prefersReduced) {
      path.style.strokeDashoffset = '0';
      hasDrawnRef.current = true;
      return;
    }

    path.style.strokeDashoffset = `${totalLength}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasDrawnRef.current) {
          hasDrawnRef.current = true;
          path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)';
          path.style.strokeDashoffset = '0';
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // ─── Handle scroll to home (respects reduced motion) ───
  const handleScrollToTop = useCallback(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      onScrollToHome();
    }
  }, [onScrollToHome]);

  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    linkedin: LinkedInIcon,
    github: GitHubIcon,
  };

  return (
    <div
      ref={sectionRef}
      className="min-h-[100dvh] text-[#f4f1ea] select-none flex flex-col relative overflow-hidden"
    >
      {/* Background layer (below the red thread) */}
      <div className="section-bg" aria-hidden="true">
        <div className="absolute inset-0 bg-[#0c0d0f]" />
      </div>

      {/* ── Background Signature (decorative) ──
           Positioned dynamically in the free band between pills and footer.
           Hidden if free band < 120px. Opacity 0.04–0.05.
           White 4.5% on #0c0d0f = no perceptible surface; text contrast unaffected.
           Text white #fff on #0c0d0f = 19.5:1 ratio (WCAG AAA). */}
      {showSignature && (
        <div
          ref={signatureWrapRef}
          className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
          style={{ top: '75%', height: '15%' }} /* defaults, overridden by JS */
        >
          <svg
            className="w-full h-full max-w-none px-4"
            viewBox="0 0 520 140"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              ref={signatureRef}
              d={SIGNATURE_PATH}
              stroke="rgba(255, 255, 255, 0.045)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      )}

      {/* ── Content wrapper ── */}
      <div className="section-content flex-1 flex flex-col px-4 sm:px-8 lg:px-12 pt-14 sm:pt-16 pb-0">
        <div data-thread-content="1" className="max-w-7xl mx-auto w-full flex-1 flex flex-col">

          {/* ── Header ── */}
          <ScrollReveal delay={50} direction="up">
            <div className="border-b border-white/10 pb-2 sm:pb-2.5 flex-shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff3e00] font-bold block mb-0.5">
                06 / CONTACTO
              </span>
              <h2 className="font-display font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white tracking-tight">
                Get in{' '}
                <span className="font-serif italic font-normal text-[#ff3e00]">touch.</span>
              </h2>
            </div>
          </ScrollReveal>

          {/* ── Main block: centered vertically ── */}
          <div className="flex-1 flex items-center py-8 sm:py-12 lg:py-0">
            <ScrollReveal delay={100} direction="up" distance={20} className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">

                {/* Left: availability, intro, email + copy, links */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Availability */}
                  <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                    <span className="w-2 h-2 rounded-full bg-[#ff3e00] flex-shrink-0" />
                    <span>{CONTACT_DATA.availability}</span>
                  </div>

                  {/* Intro paragraph */}
                  <p
                    className="font-sans text-white/70 leading-[1.5] max-w-[52ch] w-full lg:max-w-[52ch]"
                    style={{
                      fontSize: 'clamp(16px, 1.1vw + 6px, 20px)',
                      marginBottom: '14px',
                      textWrap: 'balance',
                    }}
                  >
                    {CONTACT_DATA.intro}
                  </p>

                  {/* Email + Copy button on same line */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href={`mailto:${CONTACT_DATA.email}`}
                      className="text-white font-display font-light tracking-tight hover:text-[#ff3e00] transition-colors whitespace-nowrap"
                      style={{ fontSize: 'clamp(22px, 3.6vw, 56px)' }}
                    >
                      {CONTACT_DATA.email}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-[11px] font-mono text-white/60 hover:text-white hover:border-white/30 transition-all cursor-pointer flex-shrink-0"
                      aria-label={copied ? 'Correo copiado' : 'Copiar correo'}
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 text-[#ff3e00]" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                    <span aria-live="polite" className="sr-only">
                      {copied ? 'Correo copiado al portapapeles' : ''}
                    </span>
                  </div>

                  {/* Social links + Download CV */}
                  <div ref={pillsRef} data-thread-anchor="contact-pills" className="flex flex-wrap gap-3 pt-1">
                    {CONTACT_DATA.links.map((link) => {
                      const Icon = iconMap[link.icon];
                      return (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${link.label} (se abre en una pestaña nueva)`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-xs font-mono text-white/80 hover:text-white hover:border-white/30 transition-all"
                        >
                          {Icon && <Icon className="w-4 h-4" />}
                          <span>{link.label}</span>
                          <ExternalLinkIcon className="w-3.5 h-3.5 opacity-50" />
                        </a>
                      );
                    })}
                    <a
                      href="/Anthony-Andino-CV.pdf"
                      download="Anthony-Andino-CV.pdf"
                      aria-label="Descargar CV de Anthony Andino (PDF, se abre en una pestaña nueva)"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-xs font-mono text-white/80 hover:text-white hover:border-white/30 transition-all"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      <span>Descargar CV</span>
                    </a>
                  </div>
                </div>

                {/* Right: CTA button */}
                <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center">
                  <button
                    ref={buttonRef}
                    type="button"
                    onClick={onOpenContact}
                    data-cursor-contrast="true"
                    className="group w-full lg:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[#ff3e00] hover:bg-[#e03700] text-white font-mono text-sm uppercase tracking-widest font-bold transition-all duration-300 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
                  >
                    <span>Escríbeme</span>
                    <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* ── Integrated Footer Bar ── */}
      <footer ref={footerRef} data-thread-anchor="contact-footer" className="section-content border-t border-white/[0.08] px-4 sm:px-8 lg:px-12 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#71717a]">
          <span className="text-center sm:text-left">{CONTACT_DATA.footerName}</span>
          <span className="hidden sm:block">{CONTACT_DATA.footerLocation}</span>
          <div className="flex items-center gap-3">
            <span>© 2026</span>
            <button
              type="button"
              onClick={handleScrollToTop}
              className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <span>Volver arriba</span>
              <ArrowUpIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
