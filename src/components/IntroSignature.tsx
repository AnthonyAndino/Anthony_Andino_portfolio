import React, { useEffect, useState, useRef } from 'react';

interface IntroSignatureProps {
  onComplete: () => void;
}

/**
 * Intro animation showing handwritten signature "Anthony Andino"
 * drawing in with the vermillion thread, concluding with an upward trendline.
 * Runs once per session (sessionStorage), skippable via click or any key.
 */
export const IntroSignature: React.FC<IntroSignatureProps> = ({ onComplete }) => {
  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const [signatureDrawn, setSignatureDrawn] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSkip = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    try {
      sessionStorage.setItem('anthony_intro_seen', 'true');
    } catch {
      // Ignore storage errors in private modes
    }
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  useEffect(() => {
    // Check if user already saw the intro in this session or prefers reduced motion
    const alreadySeen = typeof window !== 'undefined' && sessionStorage.getItem('anthony_intro_seen') === 'true';
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen || prefersReducedMotion) {
      onComplete();
      return;
    }

    // Keyboard listener to skip with Escape, Enter, Space
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Sequence timer: Signature draws for 2.2s, then trendline finishes, then auto dismiss
    const drawTimer = setTimeout(() => {
      setSignatureDrawn(true);
    }, 1800);

    const finishTimer = setTimeout(() => {
      handleSkip();
    }, 3200);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(drawTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={handleSkip}
      className={`fixed inset-0 z-[1000] bg-[#0c0d0f] text-[#f4f1ea] flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-500 ease-out ${
        isDismissing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Introducción. Clic para saltar"
    >
      {/* Background subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ff3e00 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative max-w-xl w-full px-6 flex flex-col items-center">
        {/* Category tag */}
        <div className="text-[10px] font-mono tracking-[0.3em] text-[#ff3e00] uppercase mb-4 opacity-80 animate-fade-in">
          DATA ANALYTICS & DATABASE AUDITING
        </div>

        {/* 
          SVG Signature Vector
          NOTE: To replace with your real vectorized signature:
          Replace the 'd' attribute of the main path below with your SVG path string!
        */}
        <div className="w-full max-w-md h-32 relative">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 520 140"
            fill="none"
          >
            {/* Signature stroke "Anthony Andino" */}
            <path
              d="M 30 110 C 45 40, 65 20, 80 20 C 95 20, 105 85, 115 110 M 55 75 C 75 72, 105 70, 125 72 M 130 100 C 135 85, 142 80, 150 95 C 158 108, 165 85, 175 105 M 180 82 C 185 75, 195 72, 202 85 C 205 98, 208 108, 215 108 M 220 65 C 220 85, 222 108, 225 108 M 215 80 C 225 78, 235 78, 240 78 M 245 80 C 248 105, 252 115, 258 100 C 262 90, 268 85, 275 88 C 280 92, 280 115, 280 120 M 310 110 C 325 35, 345 20, 360 20 C 375 20, 385 85, 395 110 M 335 75 C 355 72, 385 70, 405 72 M 410 88 C 418 80, 428 85, 432 98 C 435 108, 442 85, 450 105 M 455 70 C 458 85, 460 105, 465 108 M 470 85 C 475 78, 485 78, 490 92 C 492 105, 498 108, 505 105"
              stroke="#ff3e00"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="signature-stroke"
            />

            {/* Trazo final que se convierte en línea de tendencia ascendente con nodos de datos */}
            <path
              d="M 505 105 C 530 100, 560 60, 590 30 L 630 15"
              stroke="#ff3e00"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="180"
              strokeDashoffset={signatureDrawn ? 0 : 180}
              className="transition-all duration-700 ease-out"
            />

            {/* Puntos de datos en la línea de tendencia final */}
            {signatureDrawn && (
              <g className="animate-fade-in">
                {/* Data point 1 */}
                <circle cx="560" cy="60" r="3.5" fill="#f4f1ea" stroke="#ff3e00" strokeWidth="2" />
                {/* Final apex milestone node */}
                <circle cx="630" cy="15" r="7" fill="#0c0d0f" stroke="#ff3e00" strokeWidth="2" />
                <circle cx="630" cy="15" r="3" fill="#ff3e00" />
              </g>
            )}
          </svg>
        </div>

        {/* Subtitle */}
        <div className="mt-8 text-center space-y-1">
          <h1 className="font-display font-bold text-lg sm:text-xl tracking-[0.2em] text-[#f4f1ea] uppercase">
            ANTHONY JAFED ANDINO
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] tracking-widest uppercase">
            LICENCIADO EN INFORMÁTICA ADMINISTRATIVA · UNAH
          </p>
        </div>

        {/* Skip instruction */}
        <div className="mt-12 flex items-center gap-2 text-[11px] font-mono text-[#71717a] hover:text-[#f4f1ea] transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e00] animate-ping" />
          <span>PRESIONA CUALQUIER TECLA O HAZ CLIC PARA ENTRAR</span>
        </div>
      </div>

      <style>{`
        .signature-stroke {
          stroke-dasharray: 1400;
          stroke-dashoffset: 1400;
          animation: drawSignature 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes drawSignature {
          0% {
            stroke-dashoffset: 1400;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
