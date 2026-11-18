import React, { useEffect, useRef } from 'react';

export type RippleEffectType = 'correct' | 'incorrect' | 'level_up' | 'case_closed' | boolean;

export interface SqlCanvasBackgroundRef {
  triggerQueryRipple: (
    effect: RippleEffectType,
    totalRows?: number,
    originX?: number,
    originY?: number,
    forceVisibleCheck?: boolean
  ) => void;
  triggerClickRipple: (clientX: number, clientY: number) => boolean;
  isSectionVisible: () => boolean;
  getActiveRippleCount: () => number;
}

interface SqlCanvasBackgroundProps {
  canvasRef?: React.RefObject<SqlCanvasBackgroundRef | null>;
}

interface Cell {
  state: 0 | 1;
  opacity: number;
  targetOpacity: number;
}

interface Ripple {
  x: number;
  y: number;
  maxRadius: number;
  currentRadius: number;
  startTime: number;
  duration: number;
  maxIntensity: number;
  isError: boolean;
  isClickRipple?: boolean;
  imprintedRadius?: number;
}

export const SqlCanvasBackground: React.FC<SqlCanvasBackgroundProps> = ({ canvasRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const isVisibleRef = useRef<boolean>(true);
  const isReducedMotionRef = useRef<boolean>(false);
  const isTouchRef = useRef<boolean>(false);

  // Mouse coordinates relative to canvas
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  // Ripple queue
  const ripplesRef = useRef<Ripple[]>([]);

  // Simulation Grid State
  const gridRef = useRef<{
    cols: number;
    rows: number;
    cellSize: number;
    cells: Cell[];
  }>({
    cols: 0,
    rows: 0,
    cellSize: 20,
    cells: [],
  });

  // Animation timing refs
  const lastSimTimeRef = useRef<number>(0);
  const lastDrawTimeRef = useRef<number>(0);
  const lastClickTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Expose triggerQueryRipple & triggerClickRipple methods
  useEffect(() => {
    if (canvasRef) {
      canvasRef.current = {
        isSectionVisible: () => isVisibleRef.current,
        getActiveRippleCount: () => ripplesRef.current.length,
        triggerQueryRipple: (
          effect: RippleEffectType,
          totalRows: number = 1,
          originX?: number,
          originY?: number,
          forceVisibleCheck: boolean = false
        ) => {
          if (isReducedMotionRef.current) return;
          if (forceVisibleCheck && !isVisibleRef.current) return;
          const canvas = canvasElementRef.current;
          if (!canvas) return;

          const rect = canvas.getBoundingClientRect();
          const startX = originX !== undefined ? originX - rect.left : rect.width / 2;
          const startY = originY !== undefined ? originY - rect.top : rect.height / 2;

          const isError = effect === true || effect === 'incorrect';
          const isLevelUp = effect === 'level_up';
          const isCaseClosed = effect === 'case_closed';

          let maxRadius: number;
          let duration: number;
          let maxIntensity: number;

          if (isCaseClosed) {
            maxRadius = Math.max(rect.width, rect.height) * 1.5;
            duration = 1100; // < 1.2s
            maxIntensity = 0.50;
          } else if (isLevelUp) {
            maxRadius = Math.min(rect.width * 0.85, 950);
            duration = 1000;
            maxIntensity = 0.45;
          } else if (isError) {
            const diagonal = Math.hypot(rect.width, rect.height);
            maxRadius = diagonal * 0.4;
            duration = 650;
            maxIntensity = 0.35;
          } else {
            // Standard correct query — covers entire section like a rock in water
            const rowScale = Math.min(Math.max(totalRows, 1), 20);
            const diagonal = Math.hypot(rect.width, rect.height);
            maxRadius = diagonal * 0.75 + rowScale * 8;
            duration = 1000 + rowScale * 10;
            maxIntensity = Math.min(0.35 + (rowScale / 20) * 0.10, 0.45);
          }

          ripplesRef.current.push({
            x: startX,
            y: startY,
            maxRadius,
            currentRadius: 0,
            startTime: performance.now(),
            duration,
            maxIntensity,
            isError,
          });
        },

        triggerClickRipple: (clientX: number, clientY: number): boolean => {
          if (isReducedMotionRef.current) return false;
          if (!isVisibleRef.current) return false;
          const now = performance.now();

          // Limit: max 3 simultaneous ripples
          if (ripplesRef.current.length >= 3) return false;

          // Limit: min 200ms between clicks
          if (now - lastClickTimeRef.current < 200) return false;
          lastClickTimeRef.current = now;

          const canvas = canvasElementRef.current;
          if (!canvas) return false;

          const rect = canvas.getBoundingClientRect();
          const clickX = clientX - rect.left;
          const clickY = clientY - rect.top;

          // Radius: min(420px, 40% of smallest section dimension)
          const minDim = Math.min(rect.width, rect.height);
          const maxRadius = Math.min(420, 0.40 * minDim);
          const duration = 900; // ~900 ms at ~700 px/s
          const maxIntensity = 0.45;

          ripplesRef.current.push({
            x: clickX,
            y: clickY,
            maxRadius,
            currentRadius: 0,
            startTime: now,
            duration,
            maxIntensity,
            isError: false,
            isClickRipple: true,
            imprintedRadius: 0,
          });

          return true;
        },
      };
    }
  }, [canvasRef]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect reduced motion and touch
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotionRef.current = motionQuery.matches;
    const motionHandler = (e: MediaQueryListEvent) => {
      isReducedMotionRef.current = e.matches;
    };
    motionQuery.addEventListener('change', motionHandler);

    isTouchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const canvas = canvasElementRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Initialize Grid Dimensions based on container
    const initGrid = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(rect.width, 320);
      const height = Math.max(rect.height, 400);

      // Desired cell size between 18 and 24 px to keep cells <= 6000
      let size = 21;
      let cols = Math.floor(width / size);
      let rows = Math.floor(height / size);
      let totalCells = cols * rows;

      if (totalCells > 6000) {
        size = Math.ceil(Math.sqrt((width * height) / 5800));
        cols = Math.floor(width / size);
        rows = Math.floor(height / size);
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const cells: Cell[] = new Array(cols * rows);
      for (let i = 0; i < cells.length; i++) {
        const state = Math.random() > 0.5 ? 1 : 0;
        const targetOpacity = state === 1 ? 0.10 + Math.random() * 0.06 : 0;
        cells[i] = {
          state,
          opacity: targetOpacity,
          targetOpacity,
        };
      }

      gridRef.current = {
        cols,
        rows,
        cellSize: size,
        cells,
      };

      // Draw once if reduced motion
      if (isReducedMotionRef.current) {
        renderStatic(canvas, dpr, gridRef.current);
      }
    };

    const renderStatic = (
      cvs: HTMLCanvasElement,
      dpr: number,
      grid: { cols: number; rows: number; cellSize: number; cells: Cell[] }
    ) => {
      const ctx = cvs.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cvs.width / dpr, cvs.height / dpr);

      // Render dot intersections
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let r = 0; r <= grid.rows; r++) {
        for (let c = 0; c <= grid.cols; c++) {
          ctx.beginPath();
          ctx.arc(c * grid.cellSize, r * grid.cellSize, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render static active cells
      ctx.fillStyle = '#ff3e00';
      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          const idx = r * grid.cols + c;
          const cell = grid.cells[idx];
          if (cell && cell.state === 1) {
            ctx.globalAlpha = 0.12;
            ctx.fillRect(c * grid.cellSize + 1, r * grid.cellSize + 1, grid.cellSize - 2, grid.cellSize - 2);
          }
        }
      }
      ctx.restore();
    };

    initGrid();

    // Resize Debounce
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(initGrid, 180);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Tracking on Section
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchRef.current || isReducedMotionRef.current) return;
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current.active = false;
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);

    // IntersectionObserver to pause rendering when section is not in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
      } else {
        const rect = container.getBoundingClientRect();
        isVisibleRef.current = rect.top < window.innerHeight && rect.bottom > 0;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ==========================================
    // Simulation Step: 10 updates per second (100ms)
    // ==========================================
    const simInterval = 100; // ms
    const runSimulationStep = () => {
      const grid = gridRef.current;
      const { cols, rows, cells } = grid;
      const total = cols * rows;
      if (total === 0) return;

      let countOnes = 0;

      // 1. Voter model: 8% of random cells copy one of their 4 neighbors
      const voterCount = Math.floor(total * 0.08);
      for (let i = 0; i < voterCount; i++) {
        const idx = Math.floor(Math.random() * total);
        const c = idx % cols;
        const r = Math.floor(idx / cols);

        // Pick random neighbor among 4 (N, S, E, W)
        const dir = Math.floor(Math.random() * 4);
        let nc = c;
        let nr = r;
        if (dir === 0 && r > 0) nr = r - 1;
        else if (dir === 1 && r < rows - 1) nr = r + 1;
        else if (dir === 2 && c > 0) nc = c - 1;
        else if (dir === 3 && c < cols - 1) nc = c + 1;

        const neighborIdx = nr * cols + nc;
        cells[idx].state = cells[neighborIdx].state;
      }

      // 2. Noise: 0.4% randomly flip
      const flipCount = Math.max(1, Math.floor(total * 0.004));
      for (let i = 0; i < flipCount; i++) {
        const idx = Math.floor(Math.random() * total);
        cells[idx].state = cells[idx].state === 1 ? 0 : 1;
      }

      // 3. Mouse influence: cells within 90px perturb with small probability
      if (mousePosRef.current.active && !isTouchRef.current) {
        const mx = mousePosRef.current.x;
        const my = mousePosRef.current.y;
        const cellSz = grid.cellSize;
        const mCol = Math.floor(mx / cellSz);
        const mRow = Math.floor(my / cellSz);
        const radiusCells = Math.ceil(90 / cellSz);

        const minR = Math.max(0, mRow - radiusCells);
        const maxR = Math.min(rows - 1, mRow + radiusCells);
        const minC = Math.max(0, mCol - radiusCells);
        const maxC = Math.min(cols - 1, mCol + radiusCells);

        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const dist = Math.hypot((c + 0.5) * cellSz - mx, (r + 0.5) * cellSz - my);
            if (dist <= 90) {
              if (Math.random() < 0.12) {
                const idx = r * cols + c;
                cells[idx].state = 1;
              }
            }
          }
        }
      }

      // Count state 1
      for (let i = 0; i < total; i++) {
        if (cells[i].state === 1) countOnes++;
      }

      // 4. Boundary Protection: maintain between 25% and 75%
      const ratio = countOnes / total;
      if (ratio < 0.25) {
        // Reseed small clusters of 1s in random patches
        const numClusters = 4;
        for (let k = 0; k < numClusters; k++) {
          const cr = Math.floor(Math.random() * rows);
          const cc = Math.floor(Math.random() * cols);
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const tr = cr + dr;
              const tc = cc + dc;
              if (tr >= 0 && tr < rows && tc >= 0 && tc < cols) {
                cells[tr * cols + tc].state = 1;
              }
            }
          }
        }
      } else if (ratio > 0.75) {
        // Reseed small clusters of 0s in random patches
        const numClusters = 4;
        for (let k = 0; k < numClusters; k++) {
          const cr = Math.floor(Math.random() * rows);
          const cc = Math.floor(Math.random() * cols);
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const tr = cr + dr;
              const tc = cc + dc;
              if (tr >= 0 && tr < rows && tc >= 0 && tc < cols) {
                cells[tr * cols + tc].state = 0;
              }
            }
          }
        }
      }

      // Update targetOpacities for rendering lerp
      for (let i = 0; i < total; i++) {
        if (cells[i].state === 1) {
          if (cells[i].targetOpacity === 0) {
            cells[i].targetOpacity = 0.10 + Math.random() * 0.06;
          }
        } else {
          cells[i].targetOpacity = 0;
        }
      }
    };

    // ==========================================
    // Render Loop (Max 30 FPS / ~33ms throttle)
    // ==========================================
    const renderFrame = (now: number) => {
      rafIdRef.current = requestAnimationFrame(renderFrame);

      if (!isVisibleRef.current || isReducedMotionRef.current) return;

      // Run simulation step at 10Hz
      if (now - lastSimTimeRef.current >= simInterval) {
        runSimulationStep();
        lastSimTimeRef.current = now;
      }

      // Throttle rendering to max 30 FPS (33ms)
      if (now - lastDrawTimeRef.current < 32) return;
      lastDrawTimeRef.current = now;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const grid = gridRef.current;
      const { cols, rows, cellSize, cells } = grid;
      if (cols === 0 || rows === 0) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Advance & filter active ripples
      const activeRipples = ripplesRef.current.filter((r) => {
        const elapsed = now - r.startTime;
        if (elapsed >= r.duration) return false;
        const progress = elapsed / r.duration;
        r.currentRadius = progress * r.maxRadius;
        return true;
      });
      ripplesRef.current = activeRipples;

      // Process click ripple cell imprint (huella: 40% of cells within the expanding ring become state 1)
      if (activeRipples.length > 0) {
        let state1Count = -1; // lazily compute only if needed
        for (let k = 0; k < activeRipples.length; k++) {
          const rp = activeRipples[k];
          if (rp.isClickRipple) {
            const prevRadius = rp.imprintedRadius || 0;
            const currentR = rp.currentRadius;
            if (currentR > prevRadius) {
              if (state1Count === -1) {
                state1Count = 0;
                for (let i = 0; i < cells.length; i++) {
                  if (cells[i].state === 1) state1Count++;
                }
              }
              const currentRatio = state1Count / Math.max(1, cells.length);

              // Maintain global ratio between 25% and 75%
              if (currentRatio < 0.72) {
                const minCol = Math.max(0, Math.floor((rp.x - currentR) / cellSize));
                const maxCol = Math.min(cols - 1, Math.ceil((rp.x + currentR) / cellSize));
                const minRow = Math.max(0, Math.floor((rp.y - currentR) / cellSize));
                const maxRow = Math.min(rows - 1, Math.ceil((rp.y + currentR) / cellSize));

                for (let r = minRow; r <= maxRow; r++) {
                  for (let c = minCol; c <= maxCol; c++) {
                    const centerX = (c + 0.5) * cellSize;
                    const centerY = (r + 0.5) * cellSize;
                    const dist = Math.hypot(centerX - rp.x, centerY - rp.y);
                    if (dist >= prevRadius && dist <= currentR) {
                      const idx = r * cols + c;
                      const cell = cells[idx];
                      if (cell && cell.state === 0 && Math.random() < 0.40) {
                        cell.state = 1;
                        cell.targetOpacity = 0.10 + Math.random() * 0.06;
                        state1Count++;
                      }
                    }
                  }
                }
              }
              rp.imprintedRadius = currentR;
            }
          }
        }
      }

      // 1. Draw Intersection Dots (5% White)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let r = 0; r <= rows; r++) {
        const y = r * cellSize;
        for (let c = 0; c <= cols; c++) {
          const x = c * cellSize;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Draw Active Cells with Smooth Lerp + Ripple Boost
      const vermillionR = 255;
      const vermillionG = 62;
      const vermillionB = 0;

      for (let r = 0; r < rows; r++) {
        const cy = r * cellSize;
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const cell = cells[idx];

          // Lerp opacity towards target
          cell.opacity += (cell.targetOpacity - cell.opacity) * 0.22;

          // Check ripple influence
          let rippleBoost = 0;
          let isErrorRipple = false;

          if (activeRipples.length > 0) {
            const centerX = (c + 0.5) * cellSize;
            const centerY = (r + 0.5) * cellSize;

            for (let k = 0; k < activeRipples.length; k++) {
              const rp = activeRipples[k];
              const dist = Math.hypot(centerX - rp.x, centerY - rp.y);
              const ringThickness = rp.isClickRipple ? Math.max(3 * cellSize, 56) : 65;
              const delta = Math.abs(dist - rp.currentRadius);

              if (delta < ringThickness) {
                const ringFactor = 1 - delta / ringThickness;
                const progress = (now - rp.startTime) / rp.duration;
                const fadeFactor = 1 - progress;
                const boost = ringFactor * fadeFactor * rp.maxIntensity;
                if (boost > rippleBoost) {
                  rippleBoost = boost;
                  isErrorRipple = rp.isError;
                }
              }
            }
          }

          const finalAlpha = Math.min(cell.opacity + rippleBoost, 0.48);

          if (finalAlpha > 0.01) {
            if (isErrorRipple && rippleBoost > 0.05) {
              // Warm white for error ripples
              ctx.fillStyle = `rgba(244, 241, 234, ${finalAlpha})`;
            } else {
              // Vermillion for standard active cells & normal ripples
              ctx.fillStyle = `rgba(${vermillionR}, ${vermillionG}, ${vermillionB}, ${finalAlpha})`;
            }
            ctx.fillRect(c * cellSize + 1, cy + 1, cellSize - 2, cellSize - 2);
          }
        }
      }

      ctx.restore();
    };

    rafIdRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      <canvas ref={canvasElementRef} className="block w-full h-full" />
      {/* Subtle radial darkening behind the console panel so table/data text never competes with cells */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 52%, rgba(12, 13, 15, 0.82) 0%, rgba(12, 13, 15, 0.4) 65%, transparent 100%)',
        }}
      />
    </div>
  );
};
