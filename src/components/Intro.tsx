import React from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data/portfolio';

export const Intro: React.FC = () => {
  // Stagger container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative w-full py-28 sm:py-36 md:py-48 bg-black overflow-hidden flex items-center justify-center">
      {/* Background: dark moody studio image of laptop on desk with heavy black gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center opacity-25 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        {/* Heavy black gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
        <div className="absolute inset-0 bg-radial-spotlight opacity-40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="flex flex-col items-center"
        >
          {/* Section Pill Label */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="pill-label">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ENGINEERING & INTELLIGENCE
            </span>
          </motion.div>

          {/* Centred Big White Heading with the Role */}
          <motion.h2
            variants={itemVariants}
            className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white mb-8 sm:mb-12 max-w-4xl"
          >
            {profile.role}
            <span className="text-neutral-600">.</span>
          </motion.h2>

          {/* Hero Tagline with highlighted phrases */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-2xl md:text-3xl text-neutral-400 font-light leading-relaxed sm:leading-snug max-w-3xl mb-6"
          >
            Welcome to my portfolio, a space dedicated to building{' '}
            <span className="text-white font-medium underline decoration-white/30 decoration-1 underline-offset-8">
              intelligent, scalable software
            </span>{' '}
            and{' '}
            <span className="text-white font-medium underline decoration-white/30 decoration-1 underline-offset-8">
              real-world AI solutions
            </span>
            .
          </motion.p>

          {/* Sub Tagline */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-neutral-500 max-w-2xl font-normal tracking-wide"
          >
            {profile.subTagline}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
