import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Grid3X3, Zap, Brain, Eye, History, Calendar, MapPin, Globe, Sparkles, Hash, Terminal, BookOpen } from 'lucide-react';

const SudokuBackground = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0">
      <motion.div 
        style={{ 
          y: y1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', 
          backgroundSize: '40px 40px' 
        }} 
        className="absolute inset-0" 
      />
      <motion.div
        style={{ 
          y: y2,
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '120px 120px'
        }}
        animate={{
          x: [0, -40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0"
      />
    </div>
  );
};

const FeatureIllustration = ({ type }: { type: 'solve' | 'visualize' | 'hint' }) => {
  if (type === 'solve') {
    return (
      <div className="relative w-full aspect-video bg-amber-50 dark:bg-amber-900/20 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative z-10"
        >
          <Zap className="w-16 h-16 text-amber-500" />
        </motion.div>
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2 opacity-20">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor: ["rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.5)", "rgba(245, 158, 11, 0)"],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              className="rounded-sm border border-amber-200 dark:border-amber-800"
            />
          ))}
        </div>
      </div>
    );
  }
  if (type === 'visualize') {
    return (
      <div className="relative w-full aspect-video bg-blue-50 dark:bg-blue-900/20 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
        <motion.div
          animate={{
            x: [-20, 20, -20],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          <Eye className="w-16 h-16 text-blue-500" />
        </motion.div>
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-32 h-32 border-4 border-dashed border-blue-400/30 rounded-full animate-spin-slow" />
        </motion.div>
      </div>
    );
  }
  return (
    <div className="relative w-full aspect-video bg-primary/10 dark:bg-primary/20 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <Brain className="w-16 h-16 text-primary" />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
            className="absolute w-24 h-24 border-2 border-primary/20 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

const FloatingNumber = ({ number, delay, x, y }: { number: number; delay: number; x: string; y: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0.5, 1.2, 0.5],
      y: ["0%", "-20%", "0%"],
      x: ["0%", "10%", "0%"]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    style={{ left: x, top: y }}
    className="absolute text-brand/20 font-black text-6xl md:text-8xl select-none pointer-events-none"
  >
    {number}
  </motion.div>
);

const HeroIllustration = ({ size = 9, color = 'primary', delay = 0 }: { size?: 6 | 9, color?: 'primary' | 'secondary', delay?: number }) => (
    <motion.div 
    initial={{ opacity: 0, rotate: color === 'primary' ? -5 : 5, scale: 0.9 }}
    animate={{ opacity: 1, rotate: 0, scale: 1 }}
    transition={{ duration: 1, delay }}
    className="relative w-full aspect-square bg-white dark:bg-stone-900 rounded-[40px] shadow-2xl border-8 border-stone-100 dark:border-stone-800 p-6 overflow-hidden group"
  >
    <div className={`grid ${size === 9 ? 'grid-cols-3 grid-rows-3' : 'grid-cols-2 grid-rows-3'} gap-2 h-full w-full`}>
      {[...Array(size === 9 ? 9 : 6)].map((_, i) => (
        <div key={i} className={`border-2 border-stone-100 dark:border-stone-800 rounded-xl grid ${size === 9 ? 'grid-cols-3 grid-rows-3' : 'grid-cols-3 grid-rows-2'} p-1`}>
          {[...Array(size === 9 ? 9 : 6)].map((_, j) => {
            const isFilled = (i + j) % 3 === 0;
            return (
              <motion.div
                key={j}
                animate={isFilled ? {
                  backgroundColor: [
                    "rgba(var(--theme-primary-rgb), 0)", 
                    `rgba(var(--theme-${color}-rgb), 0.1)`, 
                    "rgba(var(--theme-primary-rgb), 0)"
                  ],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ duration: 3, repeat: Infinity, delay: (i + j) * 0.2 }}
                className="aspect-square flex items-center justify-center text-[10px] font-bold text-stone-300 dark:text-stone-700"
              >
                {isFilled ? (i * j % 9) + 1 : ""}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
    <div className={`absolute inset-0 bg-linear-to-tr ${color === 'primary' ? 'from-primary/10' : 'from-secondary/10'} to-transparent pointer-events-none`} />
    <motion.div
      animate={{
        top: ["-100%", "200%"],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`absolute left-0 right-0 h-24 bg-linear-to-b from-transparent ${color === 'primary' ? 'via-primary/20' : 'via-secondary/20'} to-transparent skew-y-12 pointer-events-none`}
    />
  </motion.div>
);

export default function Home() {
  const milestones = [
    {
      year: "18th Century",
      title: "The Mathematical Roots",
      desc: "Swiss mathematician Leonhard Euler develops 'Latin Squares,' a grid where every number appears once in each row and column. This laid the mathematical foundation for what would become Sudoku.",
      icon: <History className="w-6 h-6" />,
      align: "left"
    },
    {
      year: "1979",
      title: "Number Place is Born",
      desc: "Howard Garns, a retired architect from Indiana, publishes the first modern Sudoku-style puzzle called 'Number Place' in Dell Pencil Puzzles and Word Games.",
      icon: <Calendar className="w-6 h-6" />,
      align: "right"
    },
    {
      year: "1984",
      title: "The Name 'Sudoku'",
      desc: "Maki Kaji, president of Nikoli, introduces the puzzle to Japan. He renames it 'Sudoku,' short for 'Sūji wa dokushin ni kagiru' (the digits must be single).",
      icon: <MapPin className="w-6 h-6" />,
      align: "left"
    },
    {
      year: "1997",
      title: "The Digital Spark",
      desc: "Wayne Gould, a retired judge, discovers Sudoku in Tokyo and spends six years developing a computer program to generate unique puzzles instantly.",
      icon: <Zap className="w-6 h-6" />,
      align: "right"
    },
    {
      year: "2004",
      title: "Global Phenomenon",
      desc: "The Times (London) begins publishing daily Sudoku puzzles. Within months, it becomes a worldwide craze, appearing in newspapers from New York to Sydney.",
      icon: <Globe className="w-6 h-6" />,
      align: "left"
    },
    {
      year: "Today",
      title: "The AI Era",
      desc: "Sudoku is now a global staple for brain health. MindMatrix takes it further, using advanced algorithms to help you solve, learn, and master the grid.",
      icon: <Sparkles className="w-6 h-6" />,
      align: "right"
    }
  ];

  return (
    <div className="relative space-y-4 py-2 overflow-hidden">
      <SudokuBackground />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingNumber number={5} delay={0} x="10%" y="20%" />
        <FloatingNumber number={9} delay={2} x="85%" y="15%" />
        <FloatingNumber number={2} delay={4} x="15%" y="70%" />
        <FloatingNumber number={7} delay={6} x="80%" y="80%" />
      </div>

      <section className="relative z-10 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-6 min-h-[80vh]">
        {/* Left Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 text-center lg:text-left flex flex-col justify-center"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-wide uppercase lg:mx-0 mx-auto"
            >
              <Hash className="w-4 h-4" />
              Next-Gen Sudoku Experience
            </motion.div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-stone-900 dark:text-stone-100 leading-[0.85] drop-shadow-sm">
              <span className="text-stone-900 dark:text-stone-100">SOLVE</span> SUDOKU <br />
              WITH <span className="text-primary drop-shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]">MINDMATRIX</span>
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-300 max-w-xl lg:mx-0 mx-auto font-medium leading-relaxed">
              The ultimate Sudoku companion. Solve puzzles instantly, learn advanced strategies, and visualize the path to victory with our state-of-the-art backtracking engine.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap justify-center lg:justify-start gap-4"
          >
            <Link
              to="/solver"
              aria-label="Launch Sudoku Solver"
              className="group relative px-10 py-5 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-secondary hover:scale-105 hover:shadow-[0_20px_50px_rgba(var(--theme-primary-rgb),0.4)] transition-all shadow-2xl shadow-primary/40 overflow-hidden flex items-center gap-3"
            >
              <span className="relative z-10">Start Solving</span>
              <Zap className="w-6 h-6 relative z-10 fill-current" />
              <motion.div 
                className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              />
            </Link>
            <Link
              to="/learn"
              className="px-10 py-5 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-700 rounded-2xl font-bold text-xl hover:border-primary hover:scale-105 hover:shadow-xl transition-all flex items-center gap-3"
            >
              Learn Strategies
              <BookOpen className="w-6 h-6" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:block w-full max-w-xl ml-auto"
        >
          <HeroIllustration size={9} color="primary" delay={0.2} />
        </motion.div>
      </section>

      <section className="relative z-10 grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 py-12">
        {[
          {
            type: 'solve' as const,
            title: (
              <>
                <span className="text-primary">Instant</span> Solving
              </>
            ),
            desc: "Our backtracking AI finds solutions for even the hardest puzzles in milliseconds."
          },
          {
            type: 'visualize' as const,
            title: (
              <>
                Step <span className="text-primary">Visualization</span>
              </>
            ),
            desc: "Watch the AI think. Animate the solving process and see every decision made."
          },
          {
            type: 'hint' as const,
            title: (
              <>
                Smart <span className="text-primary">Hints</span>
              </>
            ),
            desc: "Stuck? Get a hint that explains the next best move without giving everything away."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 hover:-translate-y-2 transition-all duration-500"
          >
            <FeatureIllustration type={feature.type} />
            <h3 className="text-2xl font-bold mb-3 text-stone-900 dark:text-stone-100">{feature.title}</h3>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="space-y-8 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-stone-900 dark:text-stone-100 uppercase">
            The <span className="text-primary">Journey</span> of <span className="text-primary">The Grid</span>
          </h2>
          <p className="text-xl text-stone-500 dark:text-stone-400 max-w-2xl mx-auto font-medium">
            From 18th-century mathematics to a global digital phenomenon.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto px-4">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-stone-200 dark:bg-stone-800 hidden md:block" />

          <div className="space-y-6 md:space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className={`relative flex items-center justify-between w-full mb-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                <div className="hidden md:block w-5/12" />
                
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-primary rounded-full border-4 border-white dark:border-stone-950 text-white shadow-xl">
                  {m.icon}
                </div>

                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="w-full md:w-5/12 p-4 bg-white dark:bg-stone-900 rounded-4xl border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-100 dark:shadow-stone-950 relative group hover:border-primary hover:scale-[1.02] hover:shadow-2xl transition-all duration-500"
                >
                  <div className="md:hidden mb-4 inline-flex p-3 bg-primary rounded-2xl text-white">
                    {m.icon}
                  </div>
                  <span className="text-primary font-black text-sm uppercase tracking-widest mb-2 block">{m.year}</span>
                  <h3 className="text-2xl font-bold mb-3 text-stone-900 dark:text-stone-100">{m.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{m.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-primary rounded-[40px] p-6 md:p-12 text-white overflow-hidden max-w-7xl mx-auto mb-12">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              className="absolute"
            >
              <Grid3X3 className="w-8 h-8" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6">
              READY TO <span className="text-stone-900">MASTER</span> <br /> THE <span className="text-stone-900">GRID</span>?
            </h2>
            <p className="text-white/90 text-xl font-medium mb-8">
              Whether you're a beginner or a grandmaster, <span className="font-black">MindMatrix</span> is your perfect training partner.
            </p>
            <Link
              to="/solver"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary rounded-2xl font-bold text-lg hover:bg-stone-900 hover:text-white hover:scale-105 hover:shadow-2xl transition-all group"
            >
              <span>Start Solving Now</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-5 h-5 fill-current" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
        
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 hidden lg:block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <Grid3X3 className="w-150 h-150" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
