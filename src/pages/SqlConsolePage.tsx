import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SqlEngine } from '../utils/sqlEngine';
import { QueryResult } from '../types/portfolio';
import { Checkmark } from '../components/Icons';
import { ScrollReveal } from '../components/ScrollReveal';
import { SqlCanvasBackground, SqlCanvasBackgroundRef } from '../components/SqlCanvasBackground';
import { CHALLENGE_LEVELS, ChallengeLevelConfig, CHALLENGE_DB } from '../data/challengeData';

interface SqlConsolePageProps {
  initialQuery?: string;
  onOpenContact?: () => void;
}

type TabMode = 'challenge' | 'free';

interface SuggestionItem {
  label: string;
  query: string;
  category: string;
}

const FREE_PRESETS: SuggestionItem[] = [
  {
    label: 'Perfil y Contacto',
    query: 'SELECT nombre, titulo, ubicacion, disponibilidad FROM perfil;',
    category: 'Básico',
  },
  {
    label: 'Experiencia Laboral',
    query: 'SELECT empresa, cargo, periodo FROM experiencia;',
    category: 'Carrera',
  },
  {
    label: 'Proyectos Principales',
    query: 'SELECT nombre, categoria, stack_resumen FROM proyectos;',
    category: 'Proyectos',
  },
  {
    label: 'Habilidades Técnicas',
    query: 'SELECT categoria, nivel, destacadas FROM habilidades;',
    category: 'Skills',
  },
  {
    label: 'Certificaciones',
    query: 'SELECT titulo, entidad, fecha FROM certificaciones;',
    category: 'Educación',
  },
  {
    label: 'Educación Universitaria',
    query: 'SELECT titulo, institucion, periodo, estado FROM educacion;',
    category: 'Educación',
  },
];

const STORAGE_KEY = 'sql_lab_challenge_state_v2';
const BG_HINT_KEY = 'sql_bg_hint_dismissed_v1';

interface StoredChallengeState {
  currentLevelIndex: number;
  hintsUsedCount: number;
  helpedLevelsCount: number;
  revealedHintsPerLevel: Record<number, number>;
  isCaseClosed: boolean;
  activeTab?: TabMode;
}

export const SqlConsolePage: React.FC<SqlConsolePageProps> = ({
  initialQuery,
}) => {
  // Mode selection: 'challenge' | 'free'
  const [activeTab, setActiveTab] = useState<TabMode>('challenge');

  // Challenge game state
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [hintsUsedTotal, setHintsUsedTotal] = useState<number>(0);
  const [helpedLevelsCount, setHelpedLevelsCount] = useState<number>(0);
  const [isCaseClosed, setIsCaseClosed] = useState<boolean>(false);
  const [challengeFeedback, setChallengeFeedback] = useState<{
    success: boolean;
    message: string;
    matchedRowKeys?: (number | string)[];
  } | null>(null);
  const [isExpedienteOpenMobile, setIsExpedienteOpenMobile] = useState<boolean>(true);

  // Pulse effect on level 1 Run button until first interaction
  const [hasInteractedLevel1, setHasInteractedLevel1] = useState<boolean>(false);

  // "Resolver por mí" typing state
  const [isSolvingForMe, setIsSolvingForMe] = useState<boolean>(false);
  const solvingTimerRef = useRef<number | null>(null);

  // Level 5 duplicate selection state
  const [clickedDuplicateId, setClickedDuplicateId] = useState<number | null>(null);

  // Free Console state
  const [freeInputVal, setFreeInputVal] = useState<string>(FREE_PRESETS[0].query);
  const [freeResult, setFreeResult] = useState<QueryResult | null>(null);
  const [freePage, setFreePage] = useState<number>(1);
  const [showAllColumns, setShowAllColumns] = useState<boolean>(false);
  const [activeCellPopover, setActiveCellPopover] = useState<{
    rowIndex: number;
    colKey: string;
    content: string;
  } | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  // Challenge input state - Level 1 starts with input pre-filled
  const [challengeInputVal, setChallengeInputVal] = useState<string>(
    CHALLENGE_LEVELS[0].solution
  );
  const [challengeResult, setChallengeResult] = useState<QueryResult | null>(null);

  // Common UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [isContentFading, setIsContentFading] = useState<boolean>(false);
  const [showBgHint, setShowBgHint] = useState<boolean>(true);

  // Pointer gesture tracking for background clicks (ignoring drag/selection)
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number; button: number } | null>(null);

  // DOM Refs
  const canvasBackgroundRef = useRef<SqlCanvasBackgroundRef | null>(null);
  const challengeInputRef = useRef<HTMLInputElement>(null);
  const freeInputRef = useRef<HTMLInputElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const sectionContainerRef = useRef<HTMLDivElement>(null);

  const currentLevel: ChallengeLevelConfig = CHALLENGE_LEVELS[currentLevelIdx] || CHALLENGE_LEVELS[0];


  // 1. Calculate rows per page based on window height once on mount and on resize
  useEffect(() => {
    const updateRowsPerPage = () => {
      const vh = window.innerHeight;
      if (vh >= 1000) {
        setRowsPerPage(8);
      } else if (vh >= 850) {
        setRowsPerPage(7);
      } else if (vh >= 750) {
        setRowsPerPage(6);
      } else {
        setRowsPerPage(5);
      }
    };
    updateRowsPerPage();
    window.addEventListener('resize', updateRowsPerPage, { passive: true });
    return () => window.removeEventListener('resize', updateRowsPerPage);
  }, []);

  // 2. Load saved challenge progress from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: StoredChallengeState = JSON.parse(saved);
        if (
          typeof parsed.currentLevelIndex === 'number' &&
          parsed.currentLevelIndex >= 0 &&
          parsed.currentLevelIndex < CHALLENGE_LEVELS.length
        ) {
          setCurrentLevelIdx(parsed.currentLevelIndex);
          setHintsUsedTotal(parsed.hintsUsedCount || 0);
          setHelpedLevelsCount(parsed.helpedLevelsCount || 0);
          setRevealedHints(parsed.revealedHintsPerLevel?.[parsed.currentLevelIndex] || 0);
          setIsCaseClosed(!!parsed.isCaseClosed);
          if (parsed.activeTab) {
            setActiveTab(parsed.activeTab);
          }
          if (parsed.currentLevelIndex > 0) {
            setIsExpedienteOpenMobile(false);
            setHasInteractedLevel1(true);
            setChallengeInputVal('');
          }
        }
      }

      const hintDismissed = sessionStorage.getItem(BG_HINT_KEY);
      if (hintDismissed === 'true') {
        setShowBgHint(false);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  // Save progress helper
  const saveChallengeProgress = useCallback(
    (
      lvlIdx: number,
      hintsTotal: number,
      helpedTotal: number,
      revHints: number,
      caseClosed: boolean,
      tab?: TabMode
    ) => {
      try {
        const stateToSave: StoredChallengeState = {
          currentLevelIndex: lvlIdx,
          hintsUsedCount: hintsTotal,
          helpedLevelsCount: helpedTotal,
          revealedHintsPerLevel: { [lvlIdx]: revHints },
          isCaseClosed: caseClosed,
          activeTab: tab || activeTab,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch {
        // Ignore
      }
    },
    [activeTab]
  );

  // Track previous initialQuery so we only trigger when a NEW external query arrives
  const prevInitialQueryRef = useRef<string | undefined>(undefined);

  // 3. React to external onOpenQuery (e.g. from Projects, Work, Hero)
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && initialQuery !== prevInitialQueryRef.current) {
      prevInitialQueryRef.current = initialQuery;
      setActiveTab('free');
      setFreeInputVal(initialQuery);
      setFreePage(1);
      const res = SqlEngine.execute(initialQuery, { context: 'portfolio' });
      setFreeResult(res);

      // Trigger wave from center, ONLY if section is visible in viewport
      canvasBackgroundRef.current?.triggerQueryRipple(
        res.type === 'ERROR' ? 'incorrect' : 'correct',
        res.totalRows || 1,
        undefined,
        undefined,
        true // forceVisibleCheck
      );
    }
  }, [initialQuery]);

  // Set initial free result once on mount if empty
  useEffect(() => {
    if (!freeResult) {
      const defaultQ = FREE_PRESETS[0].query;
      const res = SqlEngine.execute(defaultQ, { context: 'portfolio' });
      setFreeResult(res);
    }
  }, [freeResult]);

  // Cleanup typewriter timer on unmount
  useEffect(() => {
    return () => {
      if (solvingTimerRef.current) clearInterval(solvingTimerRef.current);
    };
  }, []);

  // Handle Tab Switching with keyboard accessibility
  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTab: TabMode = activeTab === 'challenge' ? 'free' : 'challenge';
      setActiveTab(nextTab);
      saveChallengeProgress(
        currentLevelIdx,
        hintsUsedTotal,
        helpedLevelsCount,
        revealedHints,
        isCaseClosed,
        nextTab
      );
    }
  };

  // Execute Challenge Query
  const handleRunChallengeQuery = (queryToRun?: string) => {
    const q = (queryToRun !== undefined ? queryToRun : challengeInputVal).trim();
    if (!q) return;

    setHasInteractedLevel1(true);
    setIsContentFading(true);

    setTimeout(() => {
      const res = SqlEngine.execute(q, { context: 'challenge' });
      setChallengeResult(res);
      setIsContentFading(false);

      if (res.type === 'ERROR') {
        setChallengeFeedback({
          success: false,
          message: res.errorMessage || 'Error de sintaxis al procesar la instrucción.',
        });
        canvasBackgroundRef.current?.triggerQueryRipple('incorrect', 1);
        return;
      }

      // Validate result according to current level rules
      const val = currentLevel.validate(res.rows || []);
      setChallengeFeedback({
        success: val.success,
        message: val.feedback,
        matchedRowKeys: val.matchedRowKeys,
      });

      if (val.success) {
        if (currentLevel.id === 5) {
          canvasBackgroundRef.current?.triggerQueryRipple('correct', res.totalRows || 6);
        } else {
          canvasBackgroundRef.current?.triggerQueryRipple('level_up', res.totalRows || 1);
        }
      } else {
        canvasBackgroundRef.current?.triggerQueryRipple('incorrect', res.totalRows || 1);
      }
    }, 150);
  };

  // "Resolver por mí" Action: Types solution character-by-character (~25ms/char)
  const handleSolveForMe = () => {
    if (isSolvingForMe) return;

    const solution = currentLevel.solution;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setHasInteractedLevel1(true);

    if (isReducedMotion) {
      setChallengeInputVal(solution);
      setHelpedLevelsCount((prev) => {
        const next = prev + 1;
        saveChallengeProgress(currentLevelIdx, hintsUsedTotal, next, revealedHints, isCaseClosed);
        return next;
      });
      handleRunChallengeQuery(solution);
      if (currentLevel.id === 5) {
        setTimeout(() => handleDuplicateRowClick(1043), 300);
      }
      return;
    }

    // Interactive typewriter mode
    setIsSolvingForMe(true);
    setChallengeInputVal('');
    let charIdx = 0;
    const totalChars = solution.length;
    // Calculate interval: approx 25ms per char, capped at 2000ms max
    const intervalMs = Math.min(25, Math.max(12, Math.floor(1800 / totalChars)));

    if (solvingTimerRef.current) clearInterval(solvingTimerRef.current);

    solvingTimerRef.current = window.setInterval(() => {
      charIdx++;
      setChallengeInputVal(solution.substring(0, charIdx));

      if (charIdx >= totalChars) {
        if (solvingTimerRef.current) clearInterval(solvingTimerRef.current);
        solvingTimerRef.current = null;
        setIsSolvingForMe(false);

        setHelpedLevelsCount((prev) => {
          const next = prev + 1;
          saveChallengeProgress(currentLevelIdx, hintsUsedTotal, next, revealedHints, isCaseClosed);
          return next;
        });

        // Auto execute on completion
        handleRunChallengeQuery(solution);

        // On Level 5, automatically resolve the duplicate selection
        if (currentLevel.id === 5) {
          setTimeout(() => handleDuplicateRowClick(1043), 350);
        }
      }
    }, intervalMs);
  };

  // Cancel typing when user presses Esc or any key
  const handleChallengeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSolvingForMe) {
      if (solvingTimerRef.current) clearInterval(solvingTimerRef.current);
      solvingTimerRef.current = null;
      setIsSolvingForMe(false);
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunChallengeQuery();
    }
  };

  // Handle Level 5 Row Click on duplicate transactions (1043 or 1044)
  const handleDuplicateRowClick = (rowId: number) => {
    if (currentLevel.id !== 5) return;
    if (rowId === 1043 || rowId === 1044) {
      setClickedDuplicateId(rowId);
      setIsCaseClosed(true);
      saveChallengeProgress(4, hintsUsedTotal, helpedLevelsCount, revealedHints, true);
      // Sweeping section wave
      canvasBackgroundRef.current?.triggerQueryRipple('case_closed');
    }
  };

  // Next level handler
  const handleNextLevel = () => {
    if (currentLevelIdx < CHALLENGE_LEVELS.length - 1) {
      const nextIdx = currentLevelIdx + 1;
      setCurrentLevelIdx(nextIdx);
      setRevealedHints(0);
      setChallengeFeedback(null);
      setChallengeResult(null);
      setChallengeInputVal('');
      setClickedDuplicateId(null);
      saveChallengeProgress(nextIdx, hintsUsedTotal, helpedLevelsCount, 0, false);
      setIsExpedienteOpenMobile(false);
      setTimeout(() => challengeInputRef.current?.focus(), 100);
    }
  };

  // Reveal next hint
  const handleRevealNextHint = () => {
    if (revealedHints < currentLevel.hints.length) {
      const nextRev = revealedHints + 1;
      const nextTotal = hintsUsedTotal + 1;
      setRevealedHints(nextRev);
      setHintsUsedTotal(nextTotal);
      saveChallengeProgress(currentLevelIdx, nextTotal, helpedLevelsCount, nextRev, isCaseClosed);
    }
  };

  // Reset challenge
  const handleRestartChallenge = () => {
    if (solvingTimerRef.current) clearInterval(solvingTimerRef.current);
    solvingTimerRef.current = null;
    setIsSolvingForMe(false);

    setCurrentLevelIdx(0);
    setRevealedHints(0);
    setHintsUsedTotal(0);
    setHelpedLevelsCount(0);
    setIsCaseClosed(false);
    setChallengeFeedback(null);
    setChallengeResult(null);
    setChallengeInputVal(CHALLENGE_LEVELS[0].solution);
    setHasInteractedLevel1(false);
    setClickedDuplicateId(null);
    saveChallengeProgress(0, 0, 0, 0, false);
    setIsExpedienteOpenMobile(true);
  };

  // Execute Free Query
  const handleRunFreeQuery = (queryToRun?: string) => {
    const q = (queryToRun !== undefined ? queryToRun : freeInputVal).trim();
    if (!q) return;

    setIsContentFading(true);
    setTimeout(() => {
      const res = SqlEngine.execute(q, { context: 'portfolio' });
      setFreeResult(res);
      setFreePage(1);
      setShowAllColumns(false);
      setActiveCellPopover(null);
      setIsContentFading(false);

      const isError = res.type === 'ERROR';
      canvasBackgroundRef.current?.triggerQueryRipple(
        isError ? 'incorrect' : 'correct',
        res.totalRows || 1
      );
    }, 150);
  };

  // Copy JSON handler
  const handleCopyJSON = () => {
    const rows = activeTab === 'challenge' ? challengeResult?.rows : freeResult?.rows;
    if (rows) {
      navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle Background Clicks (Pointer gesture filtering)
  const handleContainerPointerDown = (e: React.PointerEvent) => {
    pointerDownPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
      button: e.button,
    };
  };

  const handleContainerPointerUp = (e: React.PointerEvent) => {
    const downPos = pointerDownPosRef.current;
    pointerDownPosRef.current = null;
    if (!downPos) return;

    // Condition 1: Primary button only
    if (e.button !== 0 || downPos.button !== 0) return;

    // Condition 2: Movement < 5 px (do not trigger on drag/selection)
    const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    if (dist >= 5) return;

    // Condition 3: No active text selection
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) return;

    // Condition 4: Not inside an interactive element or panel with data-no-ripple
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.closest(
        'button, a, input, textarea, select, [role="tab"], [role="tablist"], [data-no-ripple]'
      )
    ) {
      return;
    }

    // Trigger click wave on background canvas
    const triggered = canvasBackgroundRef.current?.triggerClickRipple(e.clientX, e.clientY);
    if (triggered && showBgHint) {
      setShowBgHint(false);
      try {
        sessionStorage.setItem(BG_HINT_KEY, 'true');
      } catch {
        // Ignore
      }
    }
  };

  // Pagination in Free Console
  const freeTotalRows = freeResult?.rows?.length || 0;
  const freeTotalPages = Math.max(1, Math.ceil(freeTotalRows / rowsPerPage));
  const currentFreeRows =
    freeResult?.rows?.slice(
      (freePage - 1) * rowsPerPage,
      freePage * rowsPerPage
    ) || [];

  // Determine columns for Free Console
  const allFreeColumns = freeResult?.columns || [];
  const visibleFreeColumns =
    showAllColumns || allFreeColumns.length <= 6
      ? allFreeColumns
      : allFreeColumns.slice(0, 6);

  // Single-row representation check
  const isFreeSingleRow =
    freeResult?.rows &&
    freeResult.rows.length === 1 &&
    freeResult.type !== 'HELP' &&
    freeResult.type !== 'SHOW_TABLES';

  // Preview Data for Left Card (3 rows of relevant table)
  const previewRows =
    currentLevel.id === 1 || currentLevel.id === 2
      ? CHALLENGE_DB.cuentas.slice(0, 3)
      : currentLevel.id === 3 || currentLevel.id === 4
      ? CHALLENGE_DB.conciliacion.slice(0, 3)
      : CHALLENGE_DB.movimientos.filter((m) => m.cuenta_id === 7).slice(0, 3);

  return (
    <div
      ref={sectionContainerRef}
      onPointerDown={handleContainerPointerDown}
      onPointerUp={handleContainerPointerUp}
      className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] text-[#f4f1ea] select-none flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-5 sm:py-6 overflow-hidden snap-start"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Background layer (below the red thread) */}
      <div className="section-bg" aria-hidden="true">
        <div className="absolute inset-0 bg-[#0c0d0f]" />

        {/* Background Animated Canvas with voter model & wave ripples */}
        <SqlCanvasBackground canvasRef={canvasBackgroundRef} />
      </div>

      {/* Discoverability Hint in Bottom-Right Corner (Fades out after first click) */}
      {showBgHint && (
        <div
          aria-hidden="true"
          className="absolute bottom-3 right-4 sm:right-8 lg:right-12 z-20 pointer-events-none transition-opacity duration-500 font-mono text-[10.5px] text-white/35"
        >
          Haz clic en el fondo
        </div>
      )}

      {/* Main Container - Fills vertical height up to 760px, vertically centered when screen > 760px */}
      <div data-thread-content="1" className="section-content max-w-[1180px] w-full mx-auto flex flex-col gap-2.5 sm:gap-3.5 h-full max-h-[760px] my-auto min-h-0">
        
        {/* ========================================================================= */}
        {/* 1. Header de Sección: 05 / LABORATORIO SQL + Find the mismatch.           */}
        {/* ========================================================================= */}
        <ScrollReveal delay={20} direction="up" distance={8}>
          <div
            data-no-ripple="true"
            className="border-b border-white/[0.08] pb-2 sm:pb-2.5 flex flex-col md:flex-row md:items-end justify-between gap-1.5 flex-shrink-0"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff3e00] font-bold block mb-0.5">
                05 / LABORATORIO SQL
              </span>
              <h2 className="font-display font-light text-2xl sm:text-3xl lg:text-[36px] text-white tracking-tight leading-none">
                Find the mismatch.
              </h2>
              {/* Línea descriptiva + Enlace directo a Contacto */}
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-mono text-white/50">
                <span>5 niveles · unos 3 minutos · con pistas y modo guiado</span>
                <span className="text-white/20">|</span>
                <button
                  type="button"
                  onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/40 hover:text-[#ff3e00] underline transition-colors cursor-pointer"
                >
                  ¿Sin tiempo? Ir a Contacto →
                </button>
              </div>
            </div>
            <p className="font-sans text-xs text-[#a1a1aa] max-w-md leading-relaxed hidden md:block">
              Un caso corto con datos ficticios: resuélvelo con SQL, o explora mi información en la consola libre.
            </p>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* 2. Selector de Modo: Pestañas "Desafío" y "Consola libre" (role="tablist")  */}
        {/* ========================================================================= */}
        <div
          ref={tablistRef}
          data-no-ripple="true"
          role="tablist"
          aria-label="Modos de operación del laboratorio SQL"
          onKeyDown={handleTabKeyDown}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <button
            role="tab"
            id="tab-challenge"
            aria-selected={activeTab === 'challenge'}
            aria-controls="panel-challenge"
            tabIndex={activeTab === 'challenge' ? 0 : -1}
            onClick={() => {
              setActiveTab('challenge');
              saveChallengeProgress(
                currentLevelIdx,
                hintsUsedTotal,
                helpedLevelsCount,
                revealedHints,
                isCaseClosed,
                'challenge'
              );
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00] ${
              activeTab === 'challenge'
                ? 'bg-[#ff3e00] text-white font-semibold shadow-sm'
                : 'bg-[#0c0d0f] text-white/60 hover:text-white hover:bg-[#1a1b1f] border border-white/[0.10]'
            }`}
          >
            Desafío
          </button>
          <button
            role="tab"
            id="tab-free"
            aria-selected={activeTab === 'free'}
            aria-controls="panel-free"
            tabIndex={activeTab === 'free' ? 0 : -1}
            onClick={() => {
              setActiveTab('free');
              saveChallengeProgress(
                currentLevelIdx,
                hintsUsedTotal,
                helpedLevelsCount,
                revealedHints,
                isCaseClosed,
                'free'
              );
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00] ${
              activeTab === 'free'
                ? 'bg-[#ff3e00] text-white font-semibold shadow-sm'
                : 'bg-[#0c0d0f] text-white/60 hover:text-white hover:bg-[#1a1b1f] border border-white/[0.10]'
            }`}
          >
            Consola libre
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. MODO DESAFÍO: Dos columnas en Desktop estiradas al alto disponible     */}
        {/* ========================================================================= */}
        {activeTab === 'challenge' && (
          <div
            id="panel-challenge"
            role="tabpanel"
            aria-labelledby="tab-challenge"
            className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch"
          >
            {/* Columna Izquierda: Tarjeta "Expediente" (aprox 25% / 3 cols) */}
            <div
              data-no-ripple="true"
              className="lg:col-span-3 h-full flex flex-col justify-between bg-[#121316] rounded-xl border border-white/[0.08] p-3 sm:p-3.5 space-y-2 overflow-hidden"
            >
              {/* Header de Expediente */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff3e00]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white font-bold">
                    Expediente
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/[0.06] font-mono text-[10px] text-[#ff3e00] font-semibold">
                    Nivel {currentLevel.id}/5
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsExpedienteOpenMobile(!isExpedienteOpenMobile)}
                    className="lg:hidden text-[10px] font-mono text-white/60 hover:text-white px-1.5 py-0.5 border border-white/10 rounded"
                    aria-label="Alternar expediente en móvil"
                  >
                    {isExpedienteOpenMobile ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              {/* Contenido Central del Expediente */}
              <div
                className={`flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-y-auto ${
                  isExpedienteOpenMobile ? 'flex' : 'hidden lg:flex'
                }`}
              >
                {/* Misión y esquema */}
                <div className="space-y-1.5 flex-shrink-0">
                  <h3 className="text-xs font-mono text-white font-bold">
                    {currentLevel.title}
                  </h3>
                  <p className="text-[11.5px] font-sans text-white/80 leading-relaxed">
                    {currentLevel.mission}
                  </p>
                  <div className="bg-[#0c0d0f]/60 rounded-lg p-1.5 border border-white/[0.06] font-mono text-[10px]">
                    <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">
                      Tabla: <strong className="text-[#ff3e00]">{currentLevel.tableSchema.name}</strong>
                    </span>
                    <span className="text-white/70 block leading-tight truncate">
                      {currentLevel.tableSchema.columns}
                    </span>
                  </div>
                </div>

                {/* Botón Pista + Botón Resolver por mí */}
                <div className="space-y-1.5 pt-1 border-t border-white/[0.06] flex-shrink-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-mono text-white/40 uppercase">
                      Pistas ({revealedHints}/{currentLevel.hints.length})
                    </span>
                    <div className="flex items-center gap-1.5">
                      {revealedHints < currentLevel.hints.length && (
                        <button
                          type="button"
                          onClick={handleRevealNextHint}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] hover:bg-white/[0.12] text-white/90 hover:text-white border border-white/10 transition-colors cursor-pointer"
                        >
                          + Pista {revealedHints + 1}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isSolvingForMe}
                        onClick={handleSolveForMe}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#ff3e00]/15 hover:bg-[#ff3e00]/25 text-[#ff3e00] hover:text-white border border-[#ff3e00]/30 transition-all cursor-pointer disabled:opacity-40"
                        title="Escribe la solución y resuelve automáticamente"
                      >
                        {isSolvingForMe ? 'Escribiendo...' : 'Resolver por mí'}
                      </button>
                    </div>
                  </div>

                  {revealedHints > 0 && (
                    <div className="space-y-1 bg-[#0c0d0f]/50 p-1.5 rounded-lg border border-white/[0.06] font-mono text-[10.5px] text-amber-200/90 leading-tight">
                      {currentLevel.hints.slice(0, revealedHints).map((hint, hIdx) => (
                        <div key={hIdx} className="flex gap-1.5 items-start">
                          <span className="text-[#ff3e00] font-bold text-[9.5px]">{hIdx + 1}.</span>
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vista previa de datos (3 primeras filas de la tabla relevante) */}
                <div className="hidden min-[720px]:block bg-[#0c0d0f]/40 rounded-lg p-2 border border-white/[0.05] font-mono text-[10px] flex-shrink-0">
                  <div className="text-[9px] uppercase tracking-wider text-white/35 mb-1 flex items-center justify-between">
                    <span>Muestra de datos (3 filas)</span>
                    <span className="text-white/20">Solo lectura</span>
                  </div>
                  <div className="space-y-1 divide-y divide-white/[0.03]">
                    {previewRows.map((row, rIdx) => (
                      <div key={rIdx} className="pt-0.5 text-white/60 truncate flex gap-2">
                        <span className="text-[#ff3e00] font-semibold">{rIdx + 1}.</span>
                        <span className="truncate">
                          {Object.entries(row)
                            .slice(0, 3)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(' · ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer del Expediente con métricas discretas y reinicio */}
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex-shrink-0">
                  <span>Pistas: {hintsUsedTotal} · Ayudas: {helpedLevelsCount}</span>
                  <button
                    type="button"
                    onClick={handleRestartChallenge}
                    className="text-white/50 hover:text-[#ff3e00] transition-colors cursor-pointer"
                  >
                    Reiniciar caso
                  </button>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Input + Ejemplo + Resultados con flex-1 */}
            <div className="lg:col-span-9 h-full flex flex-col gap-2.5 min-h-0">
              {/* Barra de Entrada + Chip Ejemplo */}
              <div
                data-no-ripple="true"
                className="bg-[#121316] rounded-xl border border-white/[0.08] p-2 sm:p-2.5 space-y-1.5 flex-shrink-0"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <label htmlFor="challenge-query-input" className="sr-only">
                      Consulta SQL para el desafío
                    </label>
                    <input
                      id="challenge-query-input"
                      ref={challengeInputRef}
                      type="text"
                      readOnly={isSolvingForMe}
                      value={challengeInputVal}
                      placeholder={`Escribe SQL sobre '${currentLevel.targetTable}'...`}
                      onChange={(e) => setChallengeInputVal(e.target.value)}
                      onKeyDown={handleChallengeInputKeyDown}
                      className="w-full bg-transparent font-mono text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isSolvingForMe}
                    onClick={() => handleRunChallengeQuery()}
                    className={`px-3 py-1 rounded-lg text-white font-mono text-xs font-semibold transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white flex-shrink-0 ${
                      currentLevelIdx === 0 && !hasInteractedLevel1
                        ? 'bg-[#ff3e00] shadow-[0_0_12px_rgba(255,62,0,0.5)] animate-pulse'
                        : 'bg-[#ff3e00] hover:bg-[#e03700]'
                    }`}
                  >
                    Ejecutar
                  </button>
                </div>

                {/* Fila Inferior de Barra: Chip Ejemplo y Etiqueta Ficticia */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-white/[0.05] text-[10.5px] font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-white/40">Ejemplo:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setChallengeInputVal(currentLevel.exampleQuery);
                        challengeInputRef.current?.focus();
                      }}
                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/[0.08] truncate transition-colors cursor-pointer"
                      title="Copia una consulta de sintaxis similar al input sin ejecutarla"
                    >
                      {currentLevel.exampleQuery}
                    </button>
                  </div>
                  <span className="text-white/35 text-[9.5px] flex-shrink-0">
                    Datos ficticios · no corresponden a ningún cliente real
                  </span>
                </div>
              </div>

              {/* Área de Resultados: flex-1 absorbe el espacio restante sin mover el bloque */}
              <div
                data-no-ripple="true"
                aria-live="polite"
                className="bg-[#121316] rounded-xl border border-white/[0.08] p-3 flex-1 min-h-0 flex flex-col justify-between overflow-hidden shadow-none"
              >
                {/* Header Superior del Panel de Resultados */}
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06] text-xs font-mono flex-shrink-0">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="text-[#ff3e00] font-bold">AUDIT&gt;</span>
                    <span className="text-white/80 truncate text-xs">
                      {challengeResult ? challengeResult.query : `Nivel ${currentLevel.id}: Esperando ejecución`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-[#a1a1aa] text-[11px]">
                      {challengeResult?.totalRows ?? 0} {challengeResult?.totalRows === 1 ? 'fila' : 'filas'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyJSON}
                      disabled={!challengeResult?.rows}
                      className="px-2 py-0.5 rounded border border-white/10 hover:border-white/30 bg-white/[0.04] text-[10px] font-mono text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {copied ? 'Copiado' : 'Copiar JSON'}
                    </button>
                  </div>
                </div>

                {/* Contenido Central: Caso Cerrado O Tabla de Resultados */}
                <div
                  className={`flex-1 min-h-0 my-1 overflow-hidden transition-opacity duration-150 ${
                    isContentFading ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  {isCaseClosed ? (
                    /* Pantalla "Caso cerrado" tras completar nivel 5 */
                    <div className="h-full flex flex-col items-center justify-center text-center p-3 space-y-2">
                      <div className="w-8 h-8 rounded-full bg-[#ff3e00]/20 border border-[#ff3e00] flex items-center justify-center text-[#ff3e00]">
                        <Checkmark className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-mono text-white font-bold">
                        Caso cerrado
                      </h4>
                      <p className="text-xs font-sans text-white/80 max-w-md leading-relaxed">
                        Encontraste el movimiento duplicado. Muchas veces un descuadre es algo así: un detalle pequeño escondido entre muchos movimientos.
                      </p>
                      <span className="text-[10.5px] font-mono text-white/50 block">
                        Pistas consultadas: {hintsUsedTotal} · Niveles con ayuda: {helpedLevelsCount}
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
                          className="px-3 py-1 rounded-lg bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-mono font-semibold transition-all cursor-pointer"
                        >
                          Ir a Contacto
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('free')}
                          className="px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-mono transition-all cursor-pointer"
                        >
                          Seguir en consola libre
                        </button>
                        <button
                          type="button"
                          onClick={handleRestartChallenge}
                          className="px-3 py-1 rounded-lg border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-all cursor-pointer"
                        >
                          Reiniciar caso
                        </button>
                      </div>
                    </div>
                  ) : challengeResult?.rows && challengeResult.rows.length > 0 ? (
                    /* Tabla de Datos de Resultados del Desafío */
                    <div className="h-full overflow-hidden rounded-lg border border-white/[0.06] bg-[#0c0d0f]/50">
                      <table className="w-full text-left font-mono text-[11px] border-collapse table-fixed">
                        <thead className="bg-[#0e0f12] border-b border-white/[0.08]">
                          <tr>
                            {challengeResult.columns?.map((col) => (
                              <th
                                key={col}
                                className="px-2.5 py-1.5 text-white/50 font-bold uppercase tracking-wider text-[10px] truncate"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {challengeResult.rows.map((row, rIdx) => {
                            const rowId = Number(row.id ?? row.cuenta_id ?? rIdx);
                            const isDuplicateRow =
                              currentLevel.id === 5 && (row.id === 1043 || row.id === 1044);
                            const isHighlighted =
                              (challengeFeedback?.matchedRowKeys?.includes(rowId) &&
                                currentLevel.id !== 5) ||
                              (clickedDuplicateId !== null && isDuplicateRow);

                            return (
                              <tr
                                key={rIdx}
                                onClick={() => isDuplicateRow && handleDuplicateRowClick(Number(row.id))}
                                onKeyDown={(e) => {
                                  if (isDuplicateRow && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    handleDuplicateRowClick(Number(row.id));
                                  }
                                }}
                                tabIndex={isDuplicateRow ? 0 : -1}
                                role={isDuplicateRow ? 'button' : undefined}
                                aria-label={isDuplicateRow ? `Transacción duplicada de depósito id ${row.id}` : undefined}
                                className={`transition-colors ${
                                  isHighlighted
                                    ? 'bg-[#ff3e00]/25 text-white font-semibold'
                                    : 'hover:bg-white/[0.02] text-white/90'
                                } ${isDuplicateRow ? 'cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00]' : ''}`}
                              >
                                {challengeResult.columns?.map((col) => (
                                  <td
                                    key={col}
                                    className="px-2.5 py-1.5 truncate text-[11px]"
                                  >
                                    {String(row[col] ?? 'NULL')}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Placeholder inicial o sin datos */
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <p className="text-xs font-mono text-white/40">
                        {challengeFeedback
                          ? challengeFeedback.message
                          : "Escribe una instrucción SQL y presiona 'Ejecutar' o prueba el botón 'Resolver por mí'."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Barra Inferior del Panel de Resultados */}
                <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono flex-shrink-0">
                  <div className="flex items-center gap-2 truncate mr-2">
                    {challengeFeedback?.success ? (
                      <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-[11px] truncate">
                        <Checkmark className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{challengeFeedback.message}</span>
                      </span>
                    ) : challengeFeedback ? (
                      <span className="text-amber-400 text-[11px] truncate">
                        {challengeFeedback.message}
                      </span>
                    ) : (
                      <span className="text-white/40 text-[11px]">
                        {challengeResult ? `${challengeResult.executionTimeMs} ms` : 'Modo Desafío'}
                      </span>
                    )}
                  </div>

                  {challengeFeedback?.success && currentLevel.id < 5 && !isCaseClosed && (
                    <button
                      type="button"
                      onClick={handleNextLevel}
                      className="px-3 py-1 rounded bg-[#ff3e00] hover:bg-[#e03700] text-white font-mono text-[11px] font-semibold transition-all cursor-pointer flex-shrink-0 shadow-sm"
                    >
                      Siguiente nivel →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. MODO CONSOLA LIBRE: Panel Centrado con Presets Cortos y Paginación      */}
        {/* ========================================================================= */}
        {activeTab === 'free' && (
          <div
            id="panel-free"
            role="tabpanel"
            aria-labelledby="tab-free"
            className="w-full flex-1 min-h-0 flex flex-col gap-2.5"
          >
            {/* Input y Presets Curados */}
            <div
              data-no-ripple="true"
              className="bg-[#121316] rounded-xl border border-white/[0.08] p-2.5 space-y-2 flex-shrink-0"
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-[#ff3e00] font-mono font-bold text-xs pl-1">
                  SQL&gt;
                </span>
                <div className="flex-1 min-w-0">
                  <label htmlFor="free-query-input" className="sr-only">
                    Instrucción SQL libre
                  </label>
                  <input
                    id="free-query-input"
                    ref={freeInputRef}
                    type="text"
                    value={freeInputVal}
                    placeholder="Escribe SELECT, SHOW TABLES o HELP..."
                    onChange={(e) => setFreeInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRunFreeQuery();
                      }
                    }}
                    className="w-full bg-transparent font-mono text-xs text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRunFreeQuery()}
                  className="px-3 py-1 rounded-lg bg-[#ff3e00] hover:bg-[#e03700] text-white font-mono text-xs font-semibold transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white flex-shrink-0"
                >
                  Ejecutar
                </button>
              </div>

              {/* Presets Cortos Curados */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-white/[0.05]">
                {FREE_PRESETS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setFreeInputVal(item.query);
                      handleRunFreeQuery(item.query);
                    }}
                    className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-[#0c0d0f] border border-white/[0.08] hover:border-[#ff3e00] text-white/70 hover:text-white transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel de Resultados: flex-1 absorbe el alto disponible sin desbordar */}
            <div
              data-no-ripple="true"
              aria-live="polite"
              className="bg-[#121316] rounded-xl border border-white/[0.08] p-3 flex-1 min-h-0 flex flex-col justify-between overflow-hidden shadow-none"
            >
              {/* Barra superior de la tabla */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06] text-xs font-mono flex-shrink-0">
                <div className="flex items-center gap-2 truncate mr-2">
                  <span className="text-[#ff3e00] font-bold">SQL&gt;</span>
                  <span className="font-semibold text-white text-xs truncate max-w-md">
                    {freeResult?.query}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {allFreeColumns.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setShowAllColumns(!showAllColumns)}
                      className="text-[10.5px] text-[#ff3e00] hover:underline cursor-pointer"
                    >
                      {showAllColumns
                        ? 'Ver 6 principales'
                        : `Ver todas las columnas (${allFreeColumns.length})`}
                    </button>
                  )}
                  <span className="text-[#a1a1aa] text-[11px]">
                    {freeTotalRows} {freeTotalRows === 1 ? 'fila' : 'filas'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyJSON}
                    className="px-2.5 py-0.5 rounded border border-white/10 hover:border-white/30 bg-white/[0.04] text-[10px] text-white transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00]"
                  >
                    {copied ? 'Copiado' : 'Copiar JSON'}
                  </button>
                </div>
              </div>

              {/* Contenido Central: 1 Fila o Tabla Paginada */}
              <div
                className={`flex-1 min-h-0 my-1 overflow-hidden transition-opacity duration-150 ${
                  isContentFading ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {freeResult?.rows && freeResult.rows.length > 0 ? (
                  isFreeSingleRow ? (
                    /* Vista Vertical Campo/Valor para 1 Sola Fila */
                    <div className="h-full overflow-hidden rounded-lg border border-white/[0.06] bg-[#0c0d0f]/50 p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      {Object.entries(freeResult.rows[0]).map(([field, val]) => (
                        <div
                          key={field}
                          className="flex flex-col gap-0.5 p-1.5 rounded bg-white/[0.02] border border-white/[0.04]"
                        >
                          <span className="text-[#ff3e00] text-[10px] font-bold uppercase tracking-wider">
                            {field}
                          </span>
                          <span className="text-white/90 text-[11px] truncate">
                            {Array.isArray(val)
                              ? val.join(', ')
                              : String(val ?? 'NULL')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Tabla Paginada */
                    <div className="h-full overflow-hidden rounded-lg border border-white/[0.06] bg-[#0c0d0f]/50 relative">
                      <table className="w-full text-left font-mono text-[11px] border-collapse table-fixed">
                        <thead className="bg-[#0e0f12] border-b border-white/[0.08]">
                          <tr>
                            {visibleFreeColumns.map((col) => (
                              <th
                                key={col}
                                className="px-2.5 py-1.5 text-white/50 font-bold uppercase tracking-wider text-[10px] truncate"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {currentFreeRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              {visibleFreeColumns.map((col) => {
                                const val = row[col];
                                const strVal = Array.isArray(val)
                                  ? val.join(', ')
                                  : String(val ?? 'NULL');
                                const isLongText = strVal.length > 30;

                                return (
                                  <td
                                    key={col}
                                    className="px-2.5 py-2 text-[11px] text-white/90 truncate relative"
                                  >
                                    {isLongText ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveCellPopover({
                                            rowIndex: rIdx,
                                            colKey: col,
                                            content: strVal,
                                          })
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            setActiveCellPopover({
                                              rowIndex: rIdx,
                                              colKey: col,
                                              content: strVal,
                                            });
                                          }
                                        }}
                                        className="text-left w-full truncate line-clamp-2 hover:text-[#ff3e00] transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#ff3e00]"
                                        title="Click o Enter para expandir contenido completo"
                                      >
                                        {strVal}
                                      </button>
                                    ) : (
                                      <span className="truncate block">{strVal}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Popover anclado para texto completo accesible */}
                      {activeCellPopover && (
                        <div
                          className="absolute inset-x-4 top-4 bottom-4 bg-[#181a20] border border-white/20 rounded-lg p-3 z-30 shadow-2xl flex flex-col justify-between font-mono text-xs animate-fadeIn"
                          role="dialog"
                          aria-label={`Detalle completo de ${activeCellPopover.colKey}`}
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                            <span className="text-[#ff3e00] text-[10.5px] uppercase font-bold">
                              Columna: {activeCellPopover.colKey}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveCellPopover(null)}
                              className="text-white/60 hover:text-white px-2 py-0.5 rounded text-xs bg-white/5 cursor-pointer"
                            >
                              Cerrar (Esc)
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto my-2 text-white/90 text-[11px] leading-relaxed break-words">
                            {activeCellPopover.content}
                          </div>
                          <span className="text-[10px] text-white/40">
                            Presiona Esc o Cerrar para regresar
                          </span>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="h-full flex items-center justify-center p-3 text-center">
                    <p className="text-xs font-mono text-[#a1a1aa]">
                      {freeResult?.errorMessage || '0 filas devueltas.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Barra Inferior del Panel de Resultados */}
              <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono flex-shrink-0">
                <div className="flex items-center gap-2 text-white/60">
                  <span>
                    {freeTotalRows} {freeTotalRows === 1 ? 'fila' : 'filas'} ·{' '}
                    {freeResult?.executionTimeMs ?? 1} ms
                  </span>
                </div>

                {/* Controles de Paginación */}
                {freeTotalPages > 1 && !isFreeSingleRow && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={freePage <= 1}
                      onClick={() => setFreePage((p) => Math.max(1, p - 1))}
                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed text-white/80 transition-colors cursor-pointer"
                    >
                      ← Ant
                    </button>
                    <span className="text-white/40 text-[10px]">
                      {freePage} de {freeTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={freePage >= freeTotalPages}
                      onClick={() => setFreePage((p) => Math.min(freeTotalPages, p + 1))}
                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed text-white/80 transition-colors cursor-pointer"
                    >
                      Sig →
                    </button>
                  </div>
                )}

                <span className="text-white/40 text-[10.5px]">Consulta de solo lectura</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
