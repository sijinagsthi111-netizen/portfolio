import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appear after the hero section (roughly 500px or viewport height)
      setVisible(window.scrollY > window.innerHeight * 0.7);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-12 h-12 rounded-full glass-card bg-neutral-900/80 hover:bg-neutral-800 text-white flex items-center justify-center border-white/15 hover:border-white/40 shadow-2xl hover:scale-110 active:scale-95 transition-all focus:outline-none"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
