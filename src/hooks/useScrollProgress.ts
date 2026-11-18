import { useState, useEffect } from 'react';

/**
 * Hook to track scroll progress smoothly from 0 to 1.
 * Uses requestAnimationFrame with linear interpolation (lerp) for jitter-free fluidity.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let animationFrameId: number;
    let targetProgress = 0;
    let currentProgress = 0;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const calculateProgress = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight <= 0) {
        return 0;
      }
      return Math.min(1, Math.max(0, scrollY / docHeight));
    };

    const handleScroll = () => {
      targetProgress = calculateProgress();
      if (prefersReducedMotion) {
        setProgress(targetProgress);
      }
    };

    const updateLoop = () => {
      if (!prefersReducedMotion) {
        // Smooth lerp (factor 0.12 gives responsive yet silky motion)
        currentProgress += (targetProgress - currentProgress) * 0.12;
        
        // Snap to target if very close
        if (Math.abs(targetProgress - currentProgress) < 0.001) {
          currentProgress = targetProgress;
        }
        
        setProgress(currentProgress);
      }
      animationFrameId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();
    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return progress;
}
