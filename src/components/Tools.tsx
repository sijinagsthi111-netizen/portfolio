import React from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data/portfolio';
import { 
  SiPython, SiCplusplus, SiC, SiDotnet, SiR 
} from 'react-icons/si';
import { TbBrandCSharp } from 'react-icons/tb';
import { FaJava } from 'react-icons/fa';
import { 
  Code2, BrainCircuit, Sparkles, BarChart3, LineChart, ShieldCheck, Layers 
} from 'lucide-react';

interface ToolItem {
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const toolsList: ToolItem[] = [
  { name: 'Python', category: 'Language', icon: SiPython, color: '#3776AB' },
  { name: 'C#', category: 'Language', icon: TbBrandCSharp, color: '#239120' },
  { name: 'Java', category: 'Language', icon: FaJava, color: '#007396' },
  { name: 'C++', category: 'Language', icon: SiCplusplus, color: '#00599C' },
  { name: 'C', category: 'Language', icon: SiC, color: '#A8B9CC' },
  { name: '.NET', category: 'Framework', icon: SiDotnet, color: '#512BD4' },
  { name: 'ASP.NET', category: 'Framework', icon: SiDotnet, color: '#512BD4' },
  { name: 'Power BI', category: 'Data Viz', icon: BarChart3, color: '#F2C811' },
  { name: 'Matplotlib', category: 'Data Viz', icon: LineChart, color: '#11557C' },
  { name: 'R Programming', category: 'Data Viz', icon: SiR, color: '#276DC3' },
];

const domainIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Software Development': Code2,
  'Machine Learning': BrainCircuit,
  'Generative AI': Sparkles,
  'Data Analysis': BarChart3,
  'Software Testing': ShieldCheck,
};

const domainDescriptions: Record<string, string> = {
  'Software Development': 'Engineering robust backend architectures and scalable APIs with .NET and C#.',
  'Machine Learning': 'Developing predictive pipelines, facial feature detection, and classification models.',
  'Generative AI': 'Multi-modal systems, LLM orchestration, and speech synthesis pipelines.',
  'Data Analysis': 'Statistical analysis, Power BI dashboards, and data transformations in Python and R.',
  'Software Testing': 'Comprehensive QA verification, pre-release defect tracking, and regression coverage.',
};

export const Tools: React.FC = () => {
  return (
    <section className="relative w-full py-24 sm:py-32 md:py-40 bg-black overflow-hidden">
      {/* Background soft radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] radial-spotlight pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-3 flex justify-center">
            <span className="pill-label">STACK & CAPABILITIES</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white mb-4">
            Expertise & Tools<span className="text-neutral-600">.</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
            Leveraging modern technologies and frameworks to build intelligent, high-performance software.
          </p>
        </motion.div>
      </div>

      {/* Infinite Horizontal Marquee with Mask Gradient Edges */}
      <div className="relative w-full overflow-hidden marquee-mask py-4 my-8">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] space-x-6">
          {/* Double array to create seamless infinite loop */}
          {[...toolsList, ...toolsList].map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div
                key={`${tool.name}-${index}`}
                className="group glass-card px-6 py-4 flex items-center space-x-4 shrink-0 transition-all duration-300 hover:scale-105 hover:bg-white/[0.07] border-white/[0.08]"
              >
                <div 
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-white/30"
                >
                  <Icon className="w-5 h-5 tech-logo group-hover:filter-none" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide group-hover:text-white">
                    {tool.name}
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                    {tool.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Grid Underneath */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-mono">
            Core Engineering Domains
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.skills.domains.map((domain, index) => {
            const IconComponent = domainIcons[domain] || Layers;
            const description = domainDescriptions[domain] || 'Delivering high-caliber engineering solutions.';
            return (
              <motion.div
                key={domain}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass-card p-7 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle top accent gradient */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/50 transition-all" />

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white mb-6 group-hover:border-white/30 group-hover:bg-white/[0.08] transition-all">
                    <IconComponent className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-2 tracking-tight group-hover:text-white">
                    {domain}
                  </h3>
                  <p className="text-sm text-neutral-400 font-light leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                    DOMAIN 0{index + 1}
                  </span>
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
