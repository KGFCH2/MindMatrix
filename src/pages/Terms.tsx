import { motion } from 'motion/react';
import { Shield, Scale, FileText, Clock, Globe, Lock } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "1. Acceptance of Terms",
      content: "By accessing and using <span className='text-brand font-bold'>MindMatrix</span>, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "2. Use License",
      content: "Permission is granted to temporarily download one copy of the materials (information or software) on MindMatrix's website for personal, non-commercial transitory viewing only."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "3. Disclaimer",
      content: "The materials on MindMatrix's website are provided on an 'as is' basis. MindMatrix makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "4. Limitations",
      content: "In no event shall MindMatrix or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "5. Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the service operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "6. User Conduct",
      content: "Users are expected to use the AI solver responsibly. Any attempt to reverse engineer the algorithm, scrape data excessively, or disrupt the service will result in immediate termination of access."
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
          Terms <span className="text-primary">of</span> Service
        </h1>
        <p className="text-stone-500 dark:text-stone-400 font-medium transition-colors duration-500">Last updated: March 17, 2026</p>
      </motion.div>

      <div className="grid gap-8">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white dark:bg-stone-900 p-4 rounded-4xl border border-stone-200 dark:border-stone-800 hover:shadow-2xl hover:shadow-stone-100 dark:hover:shadow-stone-950 transition-all duration-500 hover:border-primary hover:-translate-y-1"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl text-stone-400 dark:text-stone-600 group-hover:bg-primary dark:group-hover:bg-secondary group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                {section.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 transition-colors duration-500">{section.title}</h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium transition-colors duration-500">
                  {section.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-stone-900 dark:bg-secondary/20 p-6 rounded-[40px] text-center text-white space-y-6 border border-transparent dark:border-secondary/40 transition-colors duration-500"
      >
        <h2 className="text-3xl font-bold dark:text-secondary">Questions about our terms?</h2>
        <p className="text-stone-400 dark:text-secondary/80 max-w-xl mx-auto font-medium">
          If you have any questions regarding these terms, please contact our legal team at{' '}
          <a href="mailto:babinbid05@gmail.com" className="text-primary dark:text-secondary hover:underline">
            babinbid05@gmail.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
