import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds (e.g. 100, 200)
  staggerIndex?: number; // Or automatically calculate delay = staggerIndex * step
  staggerStep?: number; // Milliseconds per item, default 80ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number; // Pixels to move, default 24px
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  staggerIndex,
  staggerStep = 90,
  direction = 'up',
  distance = 24,
  threshold = 0.12,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold });

  const totalDelay = staggerIndex !== undefined ? staggerIndex * staggerStep : delay;

  const getTransform = () => {
    if (isVisible || direction === 'none') return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: '0.65s',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${totalDelay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};

interface RevealTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  wordClassName?: string;
  delay?: number;
  wordDelayStep?: number; // ms between each word
}

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  as: Component = 'div',
  className = '',
  wordClassName = '',
  delay = 0,
  wordDelayStep = 45,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  const words = text.split(' ');

  return (
    <Component ref={ref as any} className={`inline-block ${className}`}>
      {words.map((word, idx) => (
        <span
          key={idx}
          className={`inline-block overflow-hidden mr-[0.25em] last:mr-0 ${wordClassName}`}
        >
          <span
            className="inline-block"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 30%, 0)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '0.6s',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: `${delay + idx * wordDelayStep}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
};
