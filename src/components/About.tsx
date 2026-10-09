import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, GraduationCap } from 'lucide-react';
import { profile } from '../data/portfolio';

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 0.96]);
  const imageY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-24 sm:py-32 md:py-40 bg-black overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 sm:mb-20">
          <div className="mb-3">
            <span className="pill-label">ABOUT DISCIPLINE</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white">
            Engineering with Precision<span className="text-neutral-600">.</span>
          </h2>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Grayscale Portrait with Soft Edge Vignette */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              style={{ scale: imageScale, y: imageY }}
              className="relative w-full max-w-md aspect-[4/5] rounded-[24px] overflow-hidden glass-card p-2 border-white/10 shadow-2xl"
            >
              {/* Fallback artistic developer portrait with grayscale filter */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                alt={profile.name}
                loading="lazy"
                className="w-full h-full object-cover rounded-[18px] filter grayscale contrast-125 brightness-90 transition-all duration-700 hover:scale-105"
              />
              {/* Soft edge radial vignette fading into black */}
              <div className="absolute inset-0 rounded-[20px] pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.85)] bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Status pill overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass-card py-2.5 px-4 backdrop-blur-xl border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-white tracking-wide">Available for roles</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">2026</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Bio, Education, Focus */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center space-y-8"
          >
            {/* Education Line */}
            <div className="flex items-start space-x-3.5 pb-6 border-b border-white/[0.08]">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white shrink-0 mt-0.5">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Education</p>
                <h4 className="text-base sm:text-lg font-heading font-bold text-white mt-0.5">
                  {profile.education.degree}
                </h4>
                <p className="text-xs sm:text-sm text-neutral-400">{profile.education.school}</p>
              </div>
            </div>

            {/* FOCUS Label with short white accent line */}
            <div className="flex items-center space-x-4">
              <span className="text-[11px] font-mono font-semibold tracking-[0.25em] text-white uppercase">
                FOCUS
              </span>
              <div className="w-12 h-[1.5px] bg-white rounded-full" />
            </div>

            {/* About Paragraph */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 font-light leading-relaxed">
              {profile.about}
            </p>

            {/* Location as small muted line */}
            <div className="flex items-center space-x-2 text-xs text-neutral-500 font-mono tracking-wider pt-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>{profile.location}</span>
              <span className="text-neutral-700">•</span>
              <span>Open to Remote & Global Relocation</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
