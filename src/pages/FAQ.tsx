import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Zap, Brain, Grid3X3, Lightbulb, Shield, Smartphone, Globe, Clock, Wrench, User, Mail, Star, Settings } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      icon: <Zap className="w-5 h-5" />,
      question: "How does the AI solver work?",
      answer: "Our AI uses a sophisticated backtracking algorithm combined with constraint propagation to explore possible solutions and find the correct one in milliseconds."
    },
    {
      icon: <Brain className="w-5 h-5" />,
      question: "Can it solve any Sudoku puzzle?",
      answer: "Yes, as long as the puzzle is valid and has at least one solution, our AI will find it. It can even detect if a puzzle is unsolvable."
    },
    {
      icon: <Grid3X3 className="w-5 h-5" />,
      question: "How do I input my own puzzle?",
      answer: "Simply navigate to the Solver page and click on any cell to type a number (1-9). Use 0 or backspace to clear a cell."
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      question: "What is the 'Get Hint' feature?",
      answer: "The hint feature analyzes the current state of your grid and suggests the next logical move, explaining the reasoning behind it without solving the entire puzzle."
    },
    {
      icon: <Shield className="w-5 h-5" />,
      question: "Is my data secure?",
      answer: "Absolutely. We don't store your personal puzzles unless you explicitly save them to your account. All processing happens securely on our servers."
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      question: "Does it work on mobile devices?",
      answer: "Yes, MindMatrix is fully responsive and works perfectly on smartphones, tablets, and desktops."
    },
    {
      icon: <Globe className="w-5 h-5" />,
      question: "Is the service free to use?",
      answer: "The basic solver and learning tools are free. We may offer premium features like cloud syncing in the future."
    },
    {
      icon: <Clock className="w-5 h-5" />,
      question: "How long does it take to solve a puzzle?",
      answer: "Most puzzles are solved in less than 10 milliseconds. Even the most 'unsolvable' human-made puzzles take less than a second."
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      question: "What is the 'Animate Solve' feature?",
      answer: "It visualizes the backtracking algorithm in real-time, showing you how the AI explores different branches and backtracks when it hits a dead end."
    },
    {
      icon: <User className="w-5 h-5" />,
      question: "Do I need an account to use the solver?",
      answer: "No, you can use the solver and all basic features without an account. Accounts are only needed for saving progress and custom settings."
    },
    {
      icon: <Mail className="w-5 h-5" />,
      question: "How can I contact support?",
      answer: (
        <span>
          You can reach out to us via the contact form or email us directly at{' '}
          <a href="mailto:babinbid05@gmail.com" className="text-primary hover:underline">
            babinbid05@gmail.com
          </a>.
        </span>
      )
    },
    {
      icon: <Star className="w-5 h-5" />,
      question: "Can I use this for competitions?",
      answer: "While our tool is great for learning, we recommend checking the specific rules of any competition regarding the use of AI assistance."
    },
    {
      icon: <Settings className="w-5 h-5" />,
      question: "Are there different difficulty settings?",
      answer: "Yes, you can generate new puzzles in Easy, Medium, and Hard modes. The AI also analyzes the difficulty of any puzzle you input manually."
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      question: "How accurate is the difficulty analyzer?",
      answer: "Our analyzer uses a combination of empty cell count and the complexity of the strategies required to solve the puzzle to determine difficulty."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-black tracking-tighter text-stone-900 dark:text-stone-100 uppercase transition-colors duration-500">
          Frequently <span className="text-primary">Asked</span> Questions
        </h1>
        <p className="text-stone-500 dark:text-stone-400 font-medium transition-colors duration-500">Everything you need to know about <span className="text-brand">MindMatrix</span>.</p>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-primary dark:hover:border-secondary transition-all duration-300 shadow-xl shadow-stone-100 dark:shadow-stone-950 hover:shadow-2xl hover:-translate-y-1"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${openIndex === i ? 'bg-primary text-white' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 group-hover:bg-primary/10 dark:group-hover:bg-secondary/10 group-hover:text-primary dark:group-hover:text-secondary'}`}>
                  {faq.icon}
                </div>
                <span className="text-lg font-bold text-stone-900 dark:text-stone-100 transition-colors duration-500">{faq.question}</span>
              </div>
              {openIndex === i ? <ChevronUp className="w-5 h-5 text-stone-400 dark:text-stone-600" /> : <ChevronDown className="w-5 h-5 text-stone-400 dark:text-stone-600" />}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 ml-16 text-stone-600 dark:text-stone-400 font-medium leading-relaxed border-t border-stone-50 dark:border-stone-800 transition-colors duration-500">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { CheckCircle2 } from 'lucide-react';
