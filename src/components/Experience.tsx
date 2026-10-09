import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';
import { profile } from '../data/portfolio';

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="relative w-full py-24 sm:py-32 md:py-40 bg-black overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 sm:mb-20">
          <div className="mb-3">
            <span className="pill-label">CAREER MILESTONES</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white">
            Experience<span className="text-neutral-600">.</span>
          </h2>
        </div>

        {/* Vertical Stack of Glass Cards */}
        <div className="space-y-8 sm:space-y-10">
          {profile.experience.map((exp, index) => (
            <motion.div
              key={`${exp.company}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group glass-card p-8 sm:p-10 transition-all duration-400 hover:-translate-y-2 hover:border-white/25 hover:shadow-2xl hover:shadow-white/[0.03] relative"
            >
              {/* Header inside card */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center space-x-3 mb-1.5">
                    <span className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {exp.role}
                    </h3>
                  </div>
                  <p className="text-base font-medium text-neutral-300 ml-11">
                    {exp.company}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono tracking-wider text-neutral-400 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/10 w-fit">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{exp.period}</span>
                </div>
              </div>

              {/* Bullets */}
              <ul className="mt-6 space-y-3.5">
                {exp.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start space-x-3 text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0 mt-1 stroke-[1.75]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Pill Chips */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap gap-2.5">
                {exp.chips.map((chip, cIdx) => (
                  <span
                    key={cIdx}
                    className="text-[11px] font-mono tracking-wider text-neutral-400 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:text-white transition-colors"
                  >
                    #{chip}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
