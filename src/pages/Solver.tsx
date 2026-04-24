import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Lightbulb, Zap, Info, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp, Brain, Trophy, PartyPopper, Share2, Timer, LayoutGrid, Medal, Star, X, MessageCircle } from 'lucide-react';
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
  const confettiIntervalRef = useRef<number | null>(null);
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
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatHistory, isAiThinking]);

  const formatChatMessage = (text: string, isUser: boolean) => {
    // Regex to capture URLs and Mailto links
    const urlRegex = /((?:https?:\/\/|mailto:)[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part && part.match(/^(?:https?:\/\/|mailto:)/)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`underline font-black break-all ${isUser ? 'text-white' : 'text-primary'}`}
          >
            {part}
          </a>
        );
      }
      
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, bi) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return <strong key={`${i}-${bi}`} className="font-black">{bp.slice(2, -2)}</strong>;
        }
        const italicParts = bp.split(/(\*[^*]+\*)/g);
        return italicParts.map((ip, ii) => {
          if (ip.startsWith('*') && ip.endsWith('*')) {
            return <em key={`${i}-${bi}-${ii}`} className="italic opacity-90">{ip.slice(1, -1)}</em>;
          }
          return ip;
        });
      });
    });
  };
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
    const duration = 6 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 1000000, colors: ['#f43f5e', '#10b981', '#fbbf24'] };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      // Small delay before starting confetti so the trophy modal appears first
      if (Date.now() < animationEnd - duration + 800) return;

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 60 * (timeLeft / duration);

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
        confetti({
          ...defaults,
          particleCount: particleCount * 0.5,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount: particleCount * 0.5,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }
    }, 250);

    confettiIntervalRef.current = interval;
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
      } catch (err) { }
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
    } catch (err) { }
  };

  const handleAiChat = async (customMessage?: string) => {
    if (isGridCompleteAndValid(grid)) {
      setAiResponse("All grids are filled; nothing to recommend. Start a new game and ask me.");
      return;
    }

    const messageToSend = customMessage || "Analyze this Sudoku grid and give me a strategic tip for my next move. Be concise.";
    const historyMessage = customMessage || "Can you analyze the current grid?";

    setChatHistory(prev => [...prev, { role: 'user', text: historyMessage }]);

    setIsAiThinking(true);
    setAiResponse(null);
    try {
      const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
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
        const botResponse = data.response;
        setAiResponse(botResponse);
        setChatHistory(prev => [...prev, { role: 'bot', text: botResponse }]);
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setError("Failed to connect to AI service. Please check your internet connection.");
    } finally {
      setIsAiThinking(false);
      setChatInput("");
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
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
      confettiIntervalRef.current = null;
    }
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
    <div className="max-w-6xl mx-auto space-y-3 pt-1 pb-4 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
            className="z-99999 flex items-center justify-center p-0 bg-stone-900/40 backdrop-blur-md"
          >

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl p-10 rounded-[56px] border-4 border-white/50 dark:border-stone-800/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] max-w-md w-full space-y-8 text-center relative z-10"
            >
              <div className="space-y-6">
                <div className="relative">
                  {/* Celebratory Radial Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-amber-500/30 blur-[80px] rounded-full animate-pulse" />
                  <motion.div
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: [0, -5, 5, 0], scale: 1 }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      scale: { type: "spring", damping: 12, stiffness: 120, delay: 0.3 }
                    }}
                    className={`w-36 h-36 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 relative z-20`}
                  >
                    {wasAssisted ? (
                      <div className="flex flex-col items-center">
                        <Brain className="w-24 h-24 text-stone-300 dark:text-stone-700" />
                        <span className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-tighter">AI Assisted</span>
                      </div>
                    ) : getTrophyIcon()}
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <motion.h2 
                    animate={{ color: ['#f43f5e', '#10b981', '#fbbf24', '#f43f5e'] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-4xl font-black tracking-tighter uppercase italic"
                  >
                    {wasAssisted ? "Grid Solved" : "MASTERPIECE!"}
                  </motion.h2>
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
                      if (confettiIntervalRef.current) {
                        clearInterval(confettiIntervalRef.current);
                        confettiIntervalRef.current = null;
                      }
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

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:-mt-0">
        {/* Left Column: Controls */}
        <div className="hidden lg:flex w-full lg:w-52 flex-col gap-2.5 shrink-0 order-3 lg:order-1 h-auto lg:h-[480px] lg:pt-16">
          <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex-1 flex flex-col space-y-2.5 shadow-lg shadow-stone-100 dark:shadow-stone-950 transition-colors duration-500">
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

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
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

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Layout & History</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl gap-1">
                  {[6, 9].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleGridSizeChange(size as 6 | 9)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${gridSize === size ? 'bg-white dark:bg-stone-700 text-primary shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0 || solving || animating || isProcessing}
                  className="w-full py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-xs hover:bg-stone-200 dark:hover:bg-stone-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Undo Move
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Sudoku Grid */}
        <div className="flex-1 space-y-2.5 order-1 lg:order-2">
          {/* Mobile Top Controls (Simplified) */}
          <div className="lg:hidden bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex gap-1">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleGenerate(diff)}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all border ${difficulty === diff ? 'bg-primary/10 border-primary text-primary' : 'bg-stone-50 dark:bg-stone-800 border-transparent text-stone-500'}`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl gap-1">
                {[6, 9].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleGridSizeChange(size as 6 | 9)}
                    className={`flex-1 py-1 rounded-lg font-bold text-[10px] transition-all ${gridSize === size ? 'bg-white dark:bg-stone-700 text-primary shadow-sm' : 'text-stone-500'}`}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
              <button
                onClick={handleUndo}
                disabled={history.length === 0 || solving || animating || isProcessing}
                className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-[10px] uppercase hover:bg-stone-200 transition-all disabled:opacity-30 flex items-center gap-1 border border-stone-200 dark:border-stone-700 shadow-sm"
              >
                <RotateCcw className="w-3 h-3" /> Undo
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center px-2 gap-10 py-2">
            <div className="flex items-center gap-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-5 rounded-2xl shadow-xl shadow-primary/20 w-40 h-12 justify-center">
              <Timer className="w-5 h-5 text-primary" />
              <span className="font-mono font-black text-xl tracking-tighter">{formatTime(elapsedTime)}</span>
            </div>

            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={solving || animating || isProcessing}
              className="flex items-center gap-2 px-6 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-red-500 hover:text-red-500 hover:scale-105 transition-all disabled:opacity-50 shadow-md active:scale-95 w-40 h-12 justify-center"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>

          <div className="bg-white dark:bg-stone-900 p-2 md:p-2.5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-100 dark:shadow-stone-950 transition-colors duration-500 max-w-115 mx-auto">
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

          <div className="grid grid-cols-5 md:grid-cols-10 gap-1 max-w-115 mx-auto px-2">
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

          <div className="flex flex-wrap gap-1.5 justify-center">
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
              className="flex items-center gap-1 px-3 py-2 bg-primary dark:bg-stone-800 text-white dark:text-stone-100 rounded-xl font-bold text-sm hover:bg-stone-900 dark:hover:bg-stone-700 hover:scale-105 hover:shadow-xl transition-all disabled:opacity-50 shadow-md min-w-30 justify-center"
            >
              {isProcessing && animating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Animate
            </button>
            <p className="w-full text-[9px] text-center text-stone-400 dark:text-stone-500 font-medium mt-1">
              Note: Using <span className="text-primary font-bold">Animate</span> or <span className="text-stone-900 dark:text-stone-100 font-bold">Solve</span> disqualifies you from winning a trophy.
            </p>
          </div>
        </div>

        {/* Right Column: AI Answers & Info */}
        <div className="hidden lg:flex w-full lg:w-96 space-y-2.5 shrink-0 flex-col h-[600px] lg:h-[480px] lg:pt-16 order-2 lg:order-3">
          {/* Chatbot Interface */}
          <div className="bg-white dark:bg-stone-900 flex-1 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl flex flex-col overflow-hidden transition-colors duration-500">
            <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-none">MindMatrix AI</h3>
                  <span className="text-[10px] text-pink-500 dark:text-green-500 font-medium">Online Insight Bot</span>
                </div>
              </div>
              <button
                onClick={() => setChatHistory([])}
                className="text-[10px] font-bold text-stone-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-stone-900">
              {chatHistory.length === 0 && !aiResponse && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 opacity-50">
                  <Brain className="w-10 h-10 text-stone-300 mb-2" />
                  <p className="text-xs font-medium text-stone-500">Ask me anything about the grid or for a strategy move!</p>
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-2.5 rounded-2xl text-[11px] font-medium leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200 dark:border-stone-700 shadow-sm'}
                  `}>
                    {formatChatMessage(msg.text, msg.role === 'user')}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 dark:bg-stone-800 p-2.5 rounded-2xl rounded-tl-none border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-[10px] font-medium text-stone-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chatInput.trim() && !isAiThinking) handleAiChat(chatInput);
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask for a solution or tip..."
                  disabled={isAiThinking}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl py-2.5 pl-4 pr-12 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAiThinking}
                  className="absolute right-1.5 top-1.5 p-1.5 bg-primary text-white rounded-lg hover:bg-secondary transition-all disabled:opacity-30 disabled:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </form>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAiChat()}
                  disabled={isAiThinking || isProcessing}
                  className="flex-1 text-[9px] font-bold py-1.5 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg hover:bg-primary hover:text-white transition-all uppercase tracking-tighter"
                >
                  Analyze Grid
                </button>
                <button
                  onClick={handleHint}
                  className="flex-1 text-[9px] font-bold py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-500 hover:text-white transition-all uppercase tracking-tighter"
                >
                  Quick Hint
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 p-3 rounded-xl flex items-start gap-2 text-red-700 dark:text-red-400 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </motion.div>
            )}

            {hint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 p-3.5 rounded-xl space-y-2 shadow-sm relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" />
                    AI Suggestion
                  </div>
                  <button
                    onClick={() => setHint(null)}
                    className="p-1 hover:bg-amber-100 dark:hover:bg-amber-800/50 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </button>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed pr-4">
                  {hint.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {steps.length > 0 && (
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-lg shadow-stone-100 dark:shadow-stone-950 transition-colors duration-500">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-widest"
              >
                Solver Logic
                {showSteps ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
              </button>

              <AnimatePresence>
                {showSteps && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {steps.slice(0, 50).map((step, i) => (
                        <div key={i} className="text-[10px] flex items-center gap-1.5 text-stone-500 dark:text-stone-400 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${step.isBacktrack ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]' : 'bg-primary/40'}`} />
                          {step.isBacktrack ? 'Backtrack' : 'Place'} {step.value} at ({step.row + 1}, {step.col + 1})
                        </div>
                      ))}
                      {steps.length > 50 && <div className="text-[10px] text-stone-400 italic pt-1">...and {steps.length - 50} more steps</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Chat Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatModalOpen(true)}
          className="w-14 h-14 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white dark:border-stone-900 animate-pulse" />
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Chat Modal */}
      <AnimatePresence>
        {isChatModalOpen && (
          <div className="lg:hidden fixed inset-0 z-[60] flex flex-col bg-white dark:bg-stone-950">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100">MindMatrix AI</h3>
                  <span className="text-[10px] text-pink-500 dark:text-green-500 font-medium uppercase tracking-widest">Active Insight Bot</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatModalOpen(false)}
                className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-stone-900/50">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
                  <Brain className="w-16 h-16 text-stone-300" />
                  <div>
                    <p className="text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest">MindMatrix Intelligence</p>
                    <p className="text-xs text-stone-500 mt-1">Ask for solutions, tips, or anything about this Sudoku trainer.</p>
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm
                    ${msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200 dark:border-stone-700'}
                  `}>
                    {formatChatMessage(msg.text, msg.role === 'user')}
                  </div>
                </motion.div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl rounded-tl-none border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Analyzing Grid...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 pb-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chatInput.trim() && !isAiThinking) handleAiChat(chatInput);
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask for help or strategy..."
                  className="w-full bg-stone-100 dark:bg-stone-800 border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAiThinking}
                  className="absolute right-2 top-2 p-3 bg-primary text-white rounded-xl shadow-lg disabled:opacity-30"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </form>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAiChat()}
                  className="flex-1 py-3 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Grid Intelligence
                </button>
                <button
                  onClick={() => setChatHistory([])}
                  className="flex-1 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
