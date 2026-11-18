import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface CustomCursorProps {
  color?: string; // default: #ff3e00
  sizeDefault?: number; // default: 26
  sizeHovered?: number; // default: 52
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  color = '#ff3e00',
  sizeDefault = 26,
  sizeHovered = 52,
}) => {
  const { t } = useLanguage();
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isInputHovered, setIsInputHovered] = useState<boolean>(false);
  const [isOverRed, setIsOverRed] = useState<boolean>(false);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [customStyle, setCustomStyle] = useState<{ color?: string; bg?: string } | null>(null);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({
    currentX: -100,
    currentY: -100,
    targetX: -100,
    targetY: -100,
  });

  useEffect(() => {
    // Detect if device supports hover pointer
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasHover) {
      setIsTouchDevice(true);
      return;
    }
    setIsTouchDevice(false);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        // Detect text inputs
        const isInputField = target.matches('input[type="text"], input[type="email"], textarea');
        setIsInputHovered(isInputField);

        // Detect all clickable items including modal elements
        const clickable = target.closest(
          'a, button, [role="button"], input[type="submit"], input[type="button"], select, .cursor-pointer, [data-clickable="true"]'
        );
        setIsHovered(!!clickable || isInputField);

        // Detect if hovering over a vermillion/red element so cursor contrasts in white/cream!
        const overRed = target.closest(
          'button.bg-\\[\\#ff3e00\\], .bg-\\[\\#ff3e00\\], [data-cursor-contrast="true"], button[type="submit"]'
        );
        setIsOverRed(!!overRed);

        // Detect custom cursor text & styling (e.g., project rows with VER)
        const customTarget = target.closest('[data-cursor-text]') as HTMLElement | null;
        const noneTarget = target.closest('[data-cursor-none="true"]') as HTMLElement | null;

        // If noneTarget is closer to target than customTarget, suppress custom cursor text
        let isSuppressed = false;
        if (noneTarget) {
          if (!customTarget) {
            isSuppressed = true;
          } else if (customTarget.contains(noneTarget)) {
            isSuppressed = true;
          }
        }

        if (customTarget && !isSuppressed) {
          const txt = customTarget.getAttribute('data-cursor-text');
          if (!txt || txt === 'none') {
            setCursorText(null);
            setCustomStyle(null);
          } else {
            const tColor = customTarget.getAttribute('data-cursor-color');
            const bColor = customTarget.getAttribute('data-cursor-bg');
            setCursorText(txt);
            setCustomStyle(tColor || bColor ? { color: tColor || undefined, bg: bColor || undefined } : null);
          }
        } else {
          setCursorText(null);
          setCustomStyle(null);
        }
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let animationFrameId: number;

    const renderLoop = () => {
      if (cursorRef.current) {
        if (prefersReducedMotion) {
          posRef.current.currentX = posRef.current.targetX;
          posRef.current.currentY = posRef.current.targetY;
        } else {
          // Responsive follow factor (0.28 gives immediate tracking with silky deceleration)
          posRef.current.currentX += (posRef.current.targetX - posRef.current.currentX) * 0.28;
          posRef.current.currentY += (posRef.current.targetY - posRef.current.currentY) * 0.28;
        }

        cursorRef.current.style.transform = `translate3d(${posRef.current.currentX}px, ${posRef.current.currentY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (isTouchDevice) {
    return null;
  }

  const currentSize = isHovered ? sizeHovered : sizeDefault;
  const halfSize = currentSize / 2;

  // Background and border colors with contrast inversion on red elements
  let bgColor = 'transparent';
  let borderColor = color;
  let textColor = '#ffffff';

  if (isHovered) {
    if (customStyle) {
      // Custom contrast styling when hovering over project row
      bgColor = customStyle.bg || color;
      borderColor = customStyle.color || '#ffffff';
      textColor = customStyle.color || '#ffffff';
    } else if (isOverRed) {
      // Invert to white/cream with dark vermillion text when over red button!
      bgColor = '#ffffff';
      borderColor = '#ffffff';
      textColor = color;
    } else if (isInputHovered) {
      bgColor = 'rgba(255, 62, 0, 0.15)';
      borderColor = color;
      textColor = color;
    } else {
      bgColor = color;
      borderColor = color;
      textColor = '#ffffff';
    }
  }

  const displayText = cursorText || (isInputHovered ? t('cursor.type') : t('cursor.go'));

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999] select-none"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      <div
        className="flex items-center justify-center rounded-full font-mono font-bold tracking-widest text-[9px] transition-all duration-200 ease-out shadow-sm"
        style={{
          width: `${currentSize}px`,
          height: `${currentSize}px`,
          marginLeft: `-${halfSize}px`,
          marginTop: `-${halfSize}px`,
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          color: textColor,
          transform: isMouseDown ? 'scale(0.85)' : 'scale(1)',
          boxShadow: isHovered
            ? isOverRed
              ? '0 4px 18px rgba(0, 0, 0, 0.4)'
              : '0 4px 16px rgba(255, 62, 0, 0.4)'
            : 'none',
        }}
      >
        <span
          className="transition-opacity duration-150"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1)' : 'scale(0.6)',
          }}
        >
          {displayText}
        </span>
      </div>
    </div>
  );
};
