import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface ScrollThreadProps {
  color?: string;
  strokeWidth?: number;
  className?: string;
  pageKey?: string; // Changes whenever the page switches to trigger recalculation
}

export const ScrollThread: React.FC<ScrollThreadProps> = ({
  color = 'var(--thread-color, #ff3e00)',
  strokeWidth = 2.5,
  className = '',
  pageKey
}) => {
  const progress = useScrollProgress();
  const pathRef = useRef<SVGPathElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? 2000 : 2000,
  });

  const [pathLength, setPathLength] = useState<number>(0);
  const [nodePosition, setNodePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update dimensions based on the scrollable document or container height
  useEffect(() => {
    const updateDimensions = () => {
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );
      const clientWidth = document.documentElement.clientWidth || window.innerWidth;

      setDimensions({
        width: clientWidth,
        height: scrollHeight,
      });
    };

    updateDimensions();

    // Small delay to allow page elements to mount and lay out properly
    const timer = setTimeout(updateDimensions, 100);
    const timer2 = setTimeout(updateDimensions, 400);

    window.addEventListener('resize', updateDimensions);
    const observer = new ResizeObserver(updateDimensions);
    if (document.body) {
      observer.observe(document.body);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
    };
  }, [pageKey]);

  // Compute curved SVG path dynamically to weave through sections
  const pathData = useMemo(() => {
    const W = dimensions.width;
    const H = dimensions.height;

    if (H <= 0 || W <= 0) return '';

    // Calculate curve points adapted to viewport width
    const leftX = Math.max(24, W * 0.08);
    const midLeftX = W * 0.28;
    const centerX = W * 0.5;
    const midRightX = W * 0.72;
    const rightX = Math.min(W - 24, W * 0.92);

    // Number of weaving segments based on page height
    const segmentCount = Math.max(4, Math.floor(H / 420));
    const stepY = H / segmentCount;

    // Start near top-center or top-left
    let d = `M ${centerX} 20`;

    // Generate wide, elegant S-curves that alternate across the layout
    for (let i = 1; i <= segmentCount; i++) {
      const currentY = i * stepY;
      const prevY = (i - 1) * stepY;
      const midY = (prevY + currentY) / 2;

      // Alternate targets
      const isEven = i % 2 === 0;
      const targetX = isEven ? (i % 4 === 0 ? rightX : midRightX) : (i % 3 === 0 ? leftX : midLeftX);
      const controlX1 = isEven ? leftX : rightX;
      const controlX2 = isEven ? midRightX : midLeftX;

      d += ` C ${controlX1} ${midY - stepY * 0.15}, ${controlX2} ${midY + stepY * 0.15}, ${targetX} ${currentY}`;
    }

    return d;
  }, [dimensions.width, dimensions.height]);

  // Measure total path length whenever pathData changes
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [pathData]);

  // Calculate tip node position based on current progress
  useEffect(() => {
    if (pathRef.current && pathLength > 0) {
      const currentDistance = Math.min(pathLength, Math.max(0, pathLength * progress));
      try {
        const point = pathRef.current.getPointAtLength(currentDistance);
        setNodePosition({ x: point.x, y: point.y });
      } catch {
        // Fallback in case SVG isn't rendered yet
      }
    }
  }, [progress, pathLength]);

  const strokeDashoffset = pathLength > 0 ? pathLength * (1 - progress) : 0;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-10 overflow-hidden ${className}`}
      style={{ height: dimensions.height }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full overflow-visible"
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        fill="none"
      >
        {/* Subtle background guide path for context (very faint) */}
        <path
          d={pathData}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.06}
          strokeDasharray="4 6"
          fill="none"
        />

        {/* Active drawing thread */}
        <path
          ref={pathRef}
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength || 1000}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          style={{
            transition: 'stroke-dashoffset 0.04s linear',
          }}
        />

        {/* Traveling tip node: outer circle with inner dot */}
        {pathLength > 0 && progress > 0.005 && (
          <g
            transform={`translate(${nodePosition.x}, ${nodePosition.y})`}
            style={{
              transition: 'transform 0.05s linear',
            }}
          >
            {/* Outer halo / glow */}
            <circle
              r={12}
              fill={color}
              fillOpacity={0.15}
              className="animate-ping"
              style={{ animationDuration: '2s' }}
            />
            {/* Outer ring */}
            <circle
              r={7}
              fill="#f4f1ea"
              stroke={color}
              strokeWidth={2}
            />
            {/* Inner solid dot */}
            <circle
              r={3}
              fill={color}
            />
          </g>
        )}
      </svg>
    </div>
  );
};
