import { motion } from 'motion/react';
import { Eye, ShieldCheck, Database, Share2, UserCheck, Mail } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our solver, or communicate with us. This may include your email address, puzzle data, and usage statistics."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "2. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect <span className='text-brand font-bold'>MindMatrix</span> and our users."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "3. Data Storage and Security",
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction."
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "4. Sharing of Information",
      content: "We do not share your personal information with third parties except as described in this Privacy Policy, such as with your consent or to comply with laws."
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "5. Your Choices",
      content: (
        <span>
          You may update, correct or delete information about you at any time by logging into your online account or emailing us at{' '}
          <a href="mailto:babinbid05@gmail.com" className="text-primary hover:underline">
            babinbid05@gmail.com
          </a>.
        </span>
      )
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "6. Contact Us",
      content: (
        <span>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:babinbid05@gmail.com" className="text-primary hover:underline">
            babinbid05@gmail.com
          </a>.
        </span>
      )
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
          Privacy <span className="text-primary">Policy</span>
        </h1>
        <p className="text-stone-500 dark:text-stone-400 font-medium transition-colors duration-500">Last updated: March 17, 2026</p>
      </motion.div>

      <div className="grid gap-8">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white dark:bg-stone-900 p-4 rounded-4xl border border-stone-200 dark:border-stone-800 hover:shadow-2xl hover:shadow-stone-100 dark:hover:shadow-stone-950 transition-all duration-500 hover:border-primary hover:-translate-y-1"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl text-stone-400 dark:text-stone-600 group-hover:bg-primary dark:group-hover:bg-secondary group-hover:text-white transition-all duration-500 transform group-hover:scale-110">
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
        className="bg-primary dark:bg-secondary/20 p-6 rounded-[40px] text-center text-white space-y-6 border border-transparent dark:border-secondary/40 transition-colors duration-500"
      >
        <h2 className="text-3xl font-bold dark:text-secondary">Your Privacy is Our Priority</h2>
        <p className="text-rose-100 dark:text-secondary/80 max-w-xl mx-auto font-medium">
          We are committed to protecting your data and being transparent about how we use it.
        </p>
      </motion.div>
    </div>
  );
}
