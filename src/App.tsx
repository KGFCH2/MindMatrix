import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Image as ImageIcon, Home as HomeIcon, Grid3X3, BookOpen, HelpCircle, Sun, Moon, Menu, X, Zap, FileText, Lock, Github, Linkedin, Mail } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

const Home = lazy(() => import('./pages/Home'));
const Solver = lazy(() => import('./pages/Solver'));
const Learn = lazy(() => import('./pages/Learn'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const FAQ = lazy(() => import('./pages/FAQ'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9, y: 1 }}
      onClick={toggleTheme}
      className="relative p-2.5 rounded-2xl overflow-hidden group transition-all duration-200 bg-white dark:bg-stone-900 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-stone-200/50 dark:border-stone-800/50"
      aria-label="Toggle Theme"
    >
      {/* Dynamic Bottom Edge Shade Glow */}
      <motion.div
        animate={{ 
          opacity: [0.4, 0.8, 0.4],
          scaleX: [1, 1.2, 1]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -bottom-1 left-0 right-0 h-2 blur-md z-0 transition-colors duration-300 ${
          theme === 'light' ? 'bg-primary/40' : 'bg-emerald-500/40'
        }`}
      />

      {/* High-Speed Background Shockwave */}
      <motion.div
        animate={{ 
          scale: theme === 'light' ? 1.5 : 3,
          opacity: theme === 'light' ? 0.2 : 0.4,
        }}
        transition={{ duration: 0.3, ease: "circOut" }}
        className="absolute inset-0 bg-linear-to-t from-primary/30 to-transparent dark:from-emerald-500/30 dark:to-transparent opacity-0 group-hover:opacity-100"
      />
      
      <div className="relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 400 }}
          >
            {theme === 'light' ? (
              <div className="relative">
                <Moon className="w-5 h-5 text-stone-700 drop-shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.4)]" />
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0, 0.3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-primary blur-xl rounded-full"
                />
              </div>
            ) : (
              <div className="relative">
                <Sun className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-500 blur-xl rounded-full"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ultra-Sharp Top Highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/20 dark:bg-white/10 z-20" />
    </motion.button>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Optimized initial load delay for better performance
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans flex flex-col transition-colors duration-500">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-100 bg-white dark:bg-stone-950 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] sudoku-pattern" />
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12">
              {/* Animated Grid Loader */}
              <div className="relative">
                <div className="grid grid-cols-3 gap-2 p-2 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl">
                  {[...Array(9)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.2, 1],
                        backgroundColor: [
                          "rgba(var(--theme-primary-rgb), 0.1)",
                          "rgba(var(--theme-primary-rgb), 0.8)",
                          "rgba(var(--theme-primary-rgb), 0.1)"
                        ],
                        borderRadius: ["20%", "40%", "20%"]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                      className="w-4 h-4 rounded-md"
                      style={{
                        backgroundColor: "rgba(var(--theme-primary-rgb), 0.1)"
                      }}
                    />
                  ))}
                </div>
                
                {/* Orbiting Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-6 border border-primary/10 rounded-full"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.5)]" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-10 border border-secondary/10 rounded-full"
                >
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_10px_rgba(var(--theme-secondary-rgb),0.5)]" />
                </motion.div>
              </div>

              {/* Text Elements */}
              <div className="flex flex-col items-center text-center space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1"
                >
                  <h1 className="text-3xl font-serif font-black tracking-tighter uppercase text-brand">
                    MindMatrix
                  </h1>
                  <div className="h-0.5 w-12 bg-linear-to-r from-primary to-secondary mx-auto rounded-full" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 animate-pulse">
                    Initializing Neural Grid
                  </span>
                  <div className="w-48 h-1 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      className="h-full bg-linear-to-r from-primary to-secondary"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Scanning Line Effect */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-primary/20 to-transparent z-20 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50 sticky top-0 z-50 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-12 items-center">
            <Link 
              to="/" 
              onClick={() => {
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1.5 group"
            >
              <img src="/Favicon.png" alt="Logo" className="w-6 h-6 object-contain group-hover:rotate-12 transition-transform duration-500" />
              <span className="text-base font-serif font-bold tracking-tight uppercase text-brand">MindMatrix</span>
            </Link>

            {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-primary hover:scale-105 transition-all font-bold uppercase tracking-wider text-[10px]">
                  <HomeIcon className="w-3.5 h-3.5" /> Home
                </Link>
                <Link to="/solver" className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-secondary hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20">
                  <Grid3X3 className="w-3.5 h-3.5" /> Solver
                </Link>
                <Link to="/learn" className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-primary hover:scale-105 transition-all font-bold uppercase tracking-wider text-[10px]">
                  <BookOpen className="w-3.5 h-3.5" /> Learn
                </Link>
              <Link to="/faq" className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-secondary hover:scale-105 transition-all font-bold uppercase tracking-wider text-[10px]">
                <HelpCircle className="w-3.5 h-3.5" /> FAQ
              </Link>
              <div className="h-4 w-px bg-stone-200 dark:bg-stone-800" />
              <ThemeToggle />
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden"
            >
                <div className="px-4 py-4 space-y-4">
                  <Link to="/" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-primary transition-colors font-bold uppercase tracking-wider text-xs">
                    <HomeIcon className="w-4 h-4" /> Home
                  </Link>
                  <Link to="/solver" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-secondary transition-colors font-bold uppercase tracking-wider text-xs">
                    <Grid3X3 className="w-4 h-4" /> Solver
                  </Link>
                  <Link to="/learn" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-primary transition-colors font-bold uppercase tracking-wider text-xs">
                    <BookOpen className="w-4 h-4" /> Learn
                  </Link>
                  <Link to="/faq" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-secondary transition-colors font-bold uppercase tracking-wider text-xs">
                    <HelpCircle className="w-4 h-4" /> FAQ
                  </Link>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <main className="grow w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 py-6 mt-auto transition-colors duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
            <div className="col-span-2 space-y-2">
              <div className="flex items-center gap-1.5">
                <img src="/Favicon.png" alt="Logo" className="w-5 h-5 object-contain" />
                <span className="text-base font-serif font-bold tracking-tight uppercase text-brand">MindMatrix</span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 text-xs font-medium leading-relaxed max-w-xs">
                Advanced AI-powered Sudoku solver. Playful, compact, and powerful.
              </p>
            </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-900 dark:text-stone-100">App</h4>
                <ul className="space-y-1">
                  <li><Link to="/solver" className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-primary text-[10px] font-bold uppercase transition-colors"><Grid3X3 className="w-3.5 h-3.5" /> Solver</Link></li>
                  <li><Link to="/learn" className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-accent text-[10px] font-bold uppercase transition-colors"><BookOpen className="w-3.5 h-3.5" /> Learn</Link></li>
                </ul>
              </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-900 dark:text-stone-100">Support</h4>
              <ul className="space-y-1">
                <li><Link to="/faq" className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-primary text-[10px] font-bold uppercase transition-colors"><HelpCircle className="w-3.5 h-3.5" /> FAQ</Link></li>
                <li><Link to="/terms" className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-accent text-[10px] font-bold uppercase transition-colors"><FileText className="w-3.5 h-3.5" /> Terms</Link></li>
                <li><Link to="/privacy" className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-primary text-[10px] font-bold uppercase transition-colors"><Lock className="w-3.5 h-3.5" /> Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center space-y-2">
            <div className="text-stone-400 dark:text-stone-500 text-[9px] font-bold uppercase tracking-[0.2em]">
              Created by <span className="text-primary font-black">Babin Bid</span> &copy; 2026 MindMatrix.
            </div>
            <div className="flex justify-center gap-4 text-[9px] font-bold uppercase tracking-widest transition-all">
              <a href="https://www.linkedin.com/in/babinbid123/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-stone-400 hover:text-primary transition-colors"><Linkedin className="w-4 h-4" /> LinkedIn</a>
              <a href="https://github.com/KGFCH2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-stone-400 hover:text-primary transition-colors"><Github className="w-4 h-4" /> GitHub</a>
              <a href="mailto:babinbid05@gmail.com" className="flex items-center gap-1.5 text-stone-400 hover:text-primary transition-colors"><Mail className="w-4 h-4" /> Email</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/solver" element={<Solver />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}
