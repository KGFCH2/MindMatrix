import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Lightbulb, Zap, Info, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp, Brain, Trophy, PartyPopper, Share2, Timer, LayoutGrid, Medal, Star } from 'lucide-react';
import { solveSudoku, generateSudoku, analyzeSudoku, getHint } from '../services/api';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { isGridCompleteAndValid } from '../lib/sudoku';

type Grid = number[][];

export default function Solver() {
  const location = useLocation();
  const [gridSize, setGridSize] = useState<6 | 9>(6);
  const [grid, setGrid] = useState<Grid>(Array.from({ length: 6 }, () => Array(6).fill(0)));
  const [initialGrid, setInitialGrid] = useState<Grid>(Array.from({ length: 6 }, () => Array(6).fill(0)));
  const [solutionGrid, setSolutionGrid] = useState<Grid | null>(null);
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const [solving, setSolving] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ difficulty: string; emptyCells: number } | null>(null);
  const [hint, setHint] = useState<{ row: number; col: number; value: number; explanation: string } | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [wasAssisted, setWasAssisted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeTaken, setTimeTaken] = useState<number | null>(null);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [history, setHistory] = useState<Grid[]>([]);

  useEffect(() => {
    if (location.state?.grid) {
      const size = location.state.grid.length as 6 | 9;
      setGridSize(size);
      setGrid(location.state.grid);
      setInitialGrid(location.state.grid);
    }
  }, [location.state]);

  useEffect(() => {
    if (startTime && !showSuccess && !solving && !animating) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, showSuccess, solving, animating]);

  useEffect(() => {
    handleAnalyze();
    if (isGridCompleteAndValid(grid) && !showSuccess && !solving && !animating) {
      const timer = setTimeout(() => triggerSuccess(), 500);
      return () => clearTimeout(timer);
    }
  }, [grid, solving, animating]);

  useEffect(() => {
    if (showSuccess) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    // Always celebrate with party confetti!
    const duration = 7 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 10000, colors: ['#f43f5e', '#10b981', '#fbbf24'] };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      
      // Centralized burst that feels part of the trophy page
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: 0.5, y: 0.6 },
        scalar: 1.2,
        drift: 0,
        gravity: 0.8
      });
      
      // Smaller side bursts relative to center
      if (timeLeft % 800 < 200) {
        confetti({ ...defaults, particleCount: 20, origin: { x: 0.3, y: 0.6 } });
        confetti({ ...defaults, particleCount: 20, origin: { x: 0.7, y: 0.6 } });
      }
    }, 400);
  };

  const handleCellChange = (r: number, c: number, val: string) => {
    if (animating || solving || isProcessing || isInitial(r, c)) return;
    const num = parseInt(val) || 0;
    if (num >= 0 && num <= gridSize) {
      if (!startTime && num !== 0) {
        setStartTime(Date.now());
      }
      setHistory(prev => [...prev, grid.map(row => [...row])]);
      const newGrid = grid.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? num : cell)));
      setGrid(newGrid);
      setError(null);
      setHint(null);
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || solving || animating || isProcessing) return;
    const previousGrid = history[history.length - 1];
    setGrid(previousGrid);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleSolve = async () => {
    setIsProcessing(true);
    setSolving(true);
    setError(null);
    setWasAssisted(true);
    try {
      const result = await solveSudoku(grid);
      if (result.solvedGrid) {
        setGrid(result.solvedGrid);
        setTimeTaken(result.timeTaken);
        setSteps(result.steps);
      } else {
        setError("This puzzle has no valid solution.");
      }
    } catch (err) {
      setError("An error occurred while solving.");
    } finally {
      setSolving(false);
      setIsProcessing(false);
    }
  };

  const handleAnimateSolve = async () => {
    setIsProcessing(true);
    setAnimating(true);
    setError(null);
    setWasAssisted(true);
    try {
      const result = await solveSudoku(grid);
      if (result.solvedGrid) {
        const solveSteps = result.steps;
        let stepIndex = 0;
        
        const animate = () => {
          if (stepIndex >= solveSteps.length) {
            setAnimating(false);
            setIsProcessing(false);
            setGrid(result.solvedGrid);
            setTimeTaken(result.timeTaken);
            return;
          }

          const step = solveSteps[stepIndex];
          setGrid(prev => {
            const newGrid = prev.map(row => [...row]);
            newGrid[step.row][step.col] = step.value;
            return newGrid;
          });
          setActiveCell({ r: step.row, c: step.col });
          stepIndex++;
          animationRef.current = window.setTimeout(animate, 10); // Adjust speed here
        };

        animate();
      } else {
        setError("This puzzle has no valid solution.");
        setAnimating(false);
        setIsProcessing(false);
      }
    } catch (err) {
      setError("An error occurred while solving.");
      setAnimating(false);
      setIsProcessing(false);
    }
  };

  const handleGenerate = async (diff: 'Easy' | 'Medium' | 'Hard') => {
    setIsProcessing(true);
    setSolving(true);
    setShowSuccess(false);
    setStartTime(null);
    setElapsedTime(0);
    try {
      const result = await generateSudoku(diff, gridSize);
      setGrid(result.grid);
      setInitialGrid(result.grid);
      setSolutionGrid(result.solution);
      setDifficulty(diff);
      setWasAssisted(false);
      setHistory([]);
      setTimeTaken(null);
      setSteps([]);
      setHint(null);
    } catch (err) {
      setError("Failed to generate puzzle.");
    } finally {
      setSolving(false);
      setIsProcessing(false);
    }
  };

  const handleGridSizeChange = (size: 6 | 9) => {
    setGridSize(size);
    setGrid(Array.from({ length: size }, () => Array(size).fill(0)));
    setInitialGrid(Array.from({ length: size }, () => Array(size).fill(0)));
    setSolutionGrid(null);
    setStartTime(null);
    setElapsedTime(0);
    setDifficulty(null);
    setAnalysis(null);
    setHint(null);
    setError(null);
    setSteps([]);
  };

  const handleShare = async () => {
    const text = `I just solved a ${gridSize}x${gridSize} Sudoku puzzle on ${difficulty || 'Unknown'} difficulty in ${formatTime(elapsedTime)}! Can you beat my time?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MindMatrix',
          text: text,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert("Result copied to clipboard!");
    }
  };

  const getTrophyIcon = () => {
    const diff = analysis?.difficulty || 'Easy';
    const sizeLabel = gridSize === 6 ? '6x6' : '9x9';
    
    if (gridSize === 6) {
      switch (diff) {
        case 'Hard': return (
          <div className="relative">
            <Medal className="w-20 h-20 text-orange-500 drop-shadow-lg" />
            <span className="absolute -bottom-2 -right-2 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-stone-900 uppercase tracking-tighter">6x6 Hard</span>
          </div>
        );
        case 'Medium': return (
          <div className="relative">
            <Star className="w-20 h-20 text-amber-500 drop-shadow-lg" />
            <span className="absolute -bottom-2 -right-2 bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-stone-900 uppercase tracking-tighter">6x6 Med</span>
          </div>
        );
        default: return (
          <div className="relative">
            <Trophy className="w-20 h-20 text-primary drop-shadow-lg" />
            <span className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-stone-900 uppercase tracking-tighter">6x6 Easy</span>
          </div>
        );
      }
    } else {
      switch (diff) {
        case 'Hard': return (
          <div className="relative">
            <Medal className="w-20 h-20 text-violet-500 drop-shadow-lg" />
            <span className="absolute -bottom-2 -right-2 bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-stone-900 uppercase tracking-tighter">9x9 Hard</span>
          </div>
        );
        case 'Medium': return (
          <div className="relative">
            <Star className="w-20 h-20 text-indigo-500 drop-shadow-lg" />
            <span className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-stone-900 uppercase tracking-tighter">9x9 Med</span>
          </div>
        );
        default: return (
          <div className="relative">
            <Trophy className="w-20 h-20 text-blue-500 drop-shadow-lg" />
            <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-stone-900 uppercase tracking-tighter">9x9 Easy</span>
          </div>
        );
      }
    }
  };

  const handleAnalyze = async () => {
    try {
      const result = await analyzeSudoku(grid);
      setAnalysis(result);
    } catch (err) {}
  };

  const handleAiChat = async () => {
    if (isGridCompleteAndValid(grid)) {
      setAiResponse("All grids are filled; nothing to recommend. Start a new game and ask me.");
      return;
    }
    setIsAiThinking(true);
    setAiResponse(null);
    try {
      const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: "Analyze this Sudoku grid and give me a strategic tip for my next move. Be concise.",
          grid 
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("AI Chat Error Response:", text);
        try {
          const json = JSON.parse(text);
          setError(json.error || `Server error: ${response.status}`);
        } catch {
          setError(`HTTP Error ${response.status}: ${text.slice(0, 100) || "Failed to reach AI service."}`);
        }
        setIsAiThinking(false);
        return;
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAiResponse(data.response);
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setError("Failed to connect to AI service. Please check your internet connection.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleHint = async () => {
    setIsProcessing(true);
    try {
      const result = await getHint(grid);
      if (result.error) {
        setError(result.error);
      } else {
        setHint(result);
        setActiveCell({ r: result.row, c: result.col });
      }
    } catch (err) {
      setError("Failed to get hint.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmReset = () => {
    setIsProcessing(true);
    if (animationRef.current) clearTimeout(animationRef.current);
    setGrid(initialGrid);
    setAnimating(false);
    setSolving(false);
    setTimeTaken(null);
    setSteps([]);
    setHint(null);
    setError(null);
    setWasAssisted(false);
    setHistory([]);
    setShowSuccess(false);
    setShowResetConfirm(false);
    setStartTime(null);
    setElapsedTime(0);
    setTimeout(() => setIsProcessing(false), 300); // Small delay for visual feedback
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (animating || solving || isProcessing) return;
    
    switch (e.key) {
      case 'ArrowUp':
        if (r > 0) setActiveCell({ r: r - 1, c });
        break;
      case 'ArrowDown':
        if (r < gridSize - 1) setActiveCell({ r: r + 1, c });
        break;
      case 'ArrowLeft':
        if (c > 0) setActiveCell({ r, c: c - 1 });
        break;
      case 'ArrowRight':
        if (c < gridSize - 1) setActiveCell({ r, c: c + 1 });
        break;
      case 'Backspace':
      case 'Delete':
        handleCellChange(r, c, '0');
        break;
      default:
        if (/^[1-9]$/.test(e.key)) {
          handleCellChange(r, c, e.key);
        }
    }
  };

  const isInitial = (r: number, c: number) => initialGrid[r][c] !== 0;

  useEffect(() => {
    if (activeCell) {
      const input = document.querySelector(`input[data-cell="${activeCell.r}-${activeCell.c}"]`) as HTMLInputElement;
      if (input) input.focus();
    }
  }, [activeCell]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-2 relative">
      <AnimatePresence>
        {showSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
              className="z-99999 flex items-center justify-center p-0 bg-white/30 dark:bg-black/30 backdrop-blur-[200px]"
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="bg-white dark:bg-stone-900 p-8 rounded-[48px] border-4 border-stone-100 dark:border-stone-800 shadow-2xl max-w-md w-full space-y-8 text-center relative"
            >
              
              <div className="space-y-6">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 120, delay: 0.3 }}
                  className={`w-32 h-32 rounded-4xl flex items-center justify-center mx-auto shadow-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700`}
                >
                  {wasAssisted ? (
                    <div className="flex flex-col items-center">
                      <Brain className="w-20 h-20 text-stone-300 dark:text-stone-700" />
                      <span className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-tighter">AI Assisted</span>
                    </div>
                  ) : getTrophyIcon()}
                </motion.div>
                
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight uppercase">
                    {wasAssisted ? "Grid Solved" : "Masterpiece!"}
                  </h2>
                  <p className="text-lg text-stone-500 dark:text-stone-400 font-medium">
                    {wasAssisted 
                      ? "The AI finished the grid for you. Try solving it manually next time for a trophy!" 
                      : `You've successfully conquered the ${gridSize}x${gridSize} grid.`
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-100 dark:border-stone-700">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Time Elapsed</p>
                    <p className="text-xl font-black text-primary">{formatTime(elapsedTime)}</p>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-100 dark:border-stone-700">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Difficulty</p>
                    <p className="text-xl font-black text-amber-500">{analysis?.difficulty || 'Easy'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleGenerate('Medium')}
                  className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold text-base hover:bg-secondary transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Play Another
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSuccess(false);
                      setStartTime(null);
                      setElapsedTime(0);
                    }}
                    className="flex-1 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-lg font-bold hover:bg-stone-200 transition-all text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 px-4 py-2.5 bg-stone-900 dark:bg-stone-700 text-white rounded-lg font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResetConfirm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-xs w-full space-y-4"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-red-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Reset Puzzle?</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs font-medium">
                    This will clear all your progress.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 text-sm"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left: Sudoku Grid */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <Timer className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-lg text-stone-900 dark:text-stone-100">{formatTime(elapsedTime)}</span>
              </div>
            </div>
            <div className="flex bg-stone-200 dark:bg-stone-800 p-1 rounded-xl gap-1">
              <button
                onClick={handleUndo}
                disabled={history.length === 0 || solving || animating || isProcessing}
                className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-100 shadow-sm disabled:opacity-30 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Undo
              </button>
              <div className="w-px h-full bg-stone-300 dark:bg-stone-600 mx-1" />
              {[6, 9].map((size) => (
                <button
                  key={size}
                  onClick={() => handleGridSizeChange(size as 6 | 9)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${gridSize === size ? 'bg-white dark:bg-stone-700 text-primary shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Difficulty Controls */}
          <div className="lg:hidden grid grid-cols-3 gap-2 px-2">
            {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => handleGenerate(diff)}
                className={`
                  px-2 py-2.5 rounded-xl font-bold text-xs transition-all border-2
                  ${difficulty === diff ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'}
                `}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-stone-900 p-2 md:p-3 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-100 dark:shadow-stone-950 transition-colors duration-500 max-w-125 mx-auto">
            <div className={`grid ${gridSize === 6 ? 'grid-cols-6' : 'grid-cols-9'} border-2 border-stone-900 dark:border-stone-100 overflow-hidden rounded-lg`}>
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const boxRows = gridSize === 6 ? 2 : 3;
                  const boxCols = 3;
                  const isUserEntered = !isInitial(r, c) && cell !== 0;
                  const isCorrect = isUserEntered && solutionGrid && cell === solutionGrid[r][c];
                  const isWrong = isUserEntered && solutionGrid && cell !== solutionGrid[r][c];

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`
                        relative aspect-square flex items-center justify-center text-lg md:text-xl font-bold border border-stone-100 dark:border-stone-800
                        ${(c + 1) % boxCols === 0 && c !== gridSize - 1 ? 'border-r-2 border-r-stone-900 dark:border-r-stone-100' : ''}
                        ${(r + 1) % boxRows === 0 && r !== gridSize - 1 ? 'border-b-2 border-b-stone-900 dark:border-b-stone-100' : ''}
                        ${activeCell?.r === r && activeCell?.c === c ? 'bg-primary/10 ring-2 ring-inset ring-primary' : 'hover:bg-primary/5'}
                        ${isInitial(r, c) ? 'text-stone-900 dark:text-stone-100 bg-stone-50/50 dark:bg-stone-800/50' : 
                          isCorrect ? 'text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-900/20' :
                          isWrong ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' :
                          'text-primary'}
                        transition-all duration-150
                      `}
                    >
                      <input
                        type="text"
                        data-cell={`${r}-${c}`}
                        value={cell === 0 ? '' : cell}
                        onChange={(e) => handleCellChange(r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, r, c)}
                        onFocus={() => setActiveCell({ r, c })}
                        aria-label={`Cell at row ${r + 1}, column ${c + 1}`}
                        className="w-full h-full text-center bg-transparent outline-none focus:bg-stone-50 dark:focus:bg-stone-800 transition-colors"
                        maxLength={1}
                        disabled={solving || animating || isProcessing}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 max-w-125 mx-auto px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (activeCell) handleCellChange(activeCell.r, activeCell.c, num.toString());
                }}
                className={`
                  aspect-square flex items-center justify-center rounded-xl font-black transition-all
                  ${num === 0 
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 border border-stone-200 dark:border-stone-700' 
                    : 'bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 hover:border-primary hover:text-primary active:scale-95 shadow-sm'}
                `}
              >
                {num === 0 ? <RotateCcw className="w-4 h-4" /> : num}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleSolve}
              disabled={solving || animating || isProcessing}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 dark:bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary hover:scale-105 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 shadow-md min-w-32.5 justify-center"
            >
              {isProcessing && solving && !animating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Solve
            </button>
            <button
              onClick={handleAnimateSolve}
              disabled={solving || animating || isProcessing}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary dark:bg-stone-800 text-white dark:text-stone-100 rounded-xl font-bold text-sm hover:bg-stone-900 dark:hover:bg-stone-700 hover:scale-105 hover:shadow-xl transition-all disabled:opacity-50 shadow-md min-w-32.5 justify-center"
            >
              {isProcessing && animating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Animate
            </button>
            <p className="w-full text-[9px] text-center text-stone-400 dark:text-stone-500 font-medium mt-1">
              Note: Using <span className="text-primary font-bold">Animate</span> or <span className="text-stone-900 dark:text-stone-100 font-bold">Solve</span> disqualifies you from winning a trophy.
            </p>
            <button
              onClick={handleHint}
              disabled={solving || animating || isProcessing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-800 rounded-xl font-bold text-sm hover:border-primary hover:scale-105 hover:shadow-lg transition-all disabled:opacity-50 min-w-27.5 justify-center"
            >
              {isProcessing && !solving && !animating && hint === null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4 text-amber-500" />}
              Hint
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={solving || animating || isProcessing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-700 rounded-xl font-bold text-sm hover:border-red-500 hover:text-red-500 hover:scale-105 hover:shadow-lg transition-all disabled:opacity-50 min-w-25 justify-center"
            >
              {isProcessing && !solving && !animating && hint !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Reset
            </button>
          </div>
        </div>

        {/* Right: Controls & Info */}
        <div className="w-full lg:w-64 space-y-3">
          <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3 shadow-lg shadow-stone-100 dark:shadow-stone-950 transition-colors duration-500">
            <h3 className="text-lg font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <Brain className="w-5 h-5 text-primary" />
              Controls
            </h3>
            
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">New Puzzle</p>
              <div className="grid grid-cols-1 gap-1.5">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleGenerate(diff)}
                    className={`
                      px-3 py-2 rounded-lg font-bold text-left transition-all border-2 text-sm
                      ${difficulty === diff ? 'bg-primary/10 border-primary text-primary' : 'bg-stone-50 dark:bg-stone-800 border-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'}
                    `}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Difficulty</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  difficulty === 'Hard' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 
                  difficulty === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 
                  difficulty === 'Easy' ? 'bg-primary/10 text-primary' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                }`}>
                  {difficulty || 'Unknown'}
                </span>
              </div>
              
              <button
                onClick={handleAiChat}
                disabled={isAiThinking || isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold text-xs hover:bg-primary dark:hover:bg-primary dark:hover:text-white hover:scale-[1.02] hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isAiThinking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                Ask MindMatrix
              </button>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Empty Cells</span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{analysis?.emptyCells || 0}</span>
              </div>
              {timeTaken !== null && (
                <div className="flex justify-between items-center text-primary">
                  <span className="text-xs font-medium">Solve Time</span>
                  <span className="text-sm font-bold">{timeTaken}ms</span>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 p-3 rounded-xl flex items-start gap-2 text-red-700 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </motion.div>
            )}

            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 p-3 rounded-xl space-y-1.5 shadow-xl"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Brain className="w-4 h-4 text-primary" />
                  MindMatrix Insight
                </div>
                <p className="text-[10px] font-medium leading-relaxed">
                  {aiResponse}
                </p>
                <button 
                  onClick={() => setAiResponse(null)}
                  className="text-[9px] uppercase tracking-widest font-black opacity-50 hover:opacity-100"
                >
                  Dismiss
                </button>
              </motion.div>
            )}

            {hint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 p-3 rounded-xl space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <Lightbulb className="w-4 h-4" />
                  AI Suggestion
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  {hint.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {steps.length > 0 && (
            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-lg shadow-stone-100 dark:shadow-stone-950 transition-colors duration-500">
              <button 
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between font-bold text-stone-900 dark:text-stone-100 text-sm"
              >
                Logic
                {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <AnimatePresence>
                {showSteps && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {steps.slice(0, 50).map((step, i) => (
                        <div key={i} className="text-[10px] flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${step.isBacktrack ? 'bg-red-400' : 'bg-primary/40'}`} />
                          {step.isBacktrack ? 'Backtrack' : 'Place'} {step.value} at ({step.row + 1}, {step.col + 1})
                        </div>
                      ))}
                      {steps.length > 50 && <div className="text-[10px] text-stone-400 italic">...and {steps.length - 50} more</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
