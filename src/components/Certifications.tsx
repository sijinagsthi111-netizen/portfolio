import React from 'react';
import { motion } from 'framer-motion';
import { Award, Bot, BarChart2, ShieldCheck, Binary, LineChart } from 'lucide-react';
import { profile } from '../data/portfolio';

const getCertIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('robotics')) return Bot;
  if (t.includes('power bi')) return BarChart2;
  if (t.includes('security') || t.includes('hacking')) return ShieldCheck;
  if (t.includes('r programming')) return LineChart;
  if (t.includes('python')) return Binary;
  return Award;
};

export const Certifications: React.FC = () => {
  return (
    <section id="certifications" className="relative w-full py-24 sm:py-32 md:py-40 bg-black overflow-hidden">
      {/* Background radial spotlight */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] radial-spotlight pointer-events-none opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 sm:mb-20">
          <div className="mb-3">
            <span className="pill-label">CREDENTIALS & KNOWLEDGE</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white mb-4">
            Certifications & Training: Always Learning<span className="text-neutral-600">.</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-light max-w-2xl leading-relaxed">
            Continuous learning across data science, analytics, robotics and security.
          </p>
        </div>

        {/* Grid of Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {profile.certifications.map((cert, index) => {
            const IconComponent = getCertIcon(cert.title);
            return (
              <motion.div
                key={`${cert.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group glass-card p-7 flex flex-col justify-between hover:-translate-y-2 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/40 transition-all" />

                <div>
                  {/* Top Bar with Rounded-Square Icon Badge and Year */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white group-hover:bg-white/[0.08] group-hover:border-white/30 transition-all">
                      <IconComponent className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-mono font-medium tracking-widest text-neutral-400 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.08]">
                      {cert.year}
                    </span>
                  </div>

                  {/* Title & Issuer */}
                  <h3 className="font-heading text-xl font-bold text-white tracking-tight mb-2 group-hover:text-white">
                    {cert.title}
                  </h3>
                  {cert.issuer && (
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3">
                      {cert.issuer}
                    </p>
                  )}

                  {/* Note */}
                  {cert.note && (
                    <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed mt-2 pt-3 border-t border-white/[0.06]">
                      {cert.note}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-neutral-600 tracking-wider">
                  <span>VERIFIED WORKSHOP / CERT</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-white transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
