import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Github, ExternalLink, Activity } from 'lucide-react';
import { profile, type ProjectItem } from '../data/portfolio';

// Individual 3D Interactive Tilt Card
const ProjectCard: React.FC<{ project: ProjectItem; index: number }> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -8;
    const rY = ((x - centerX) / centerX) * 8;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Curated dark tech imagery placeholders matching the project concept
  const projectThumbnails: Record<string, string> = {
    'VisionAid': 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop',
    'Driver Drowsiness Detection': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop',
  };

  const bgImage = projectThumbnails[project.title] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.2 }}
      style={{ perspective: 1200 }}
      className="w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="group relative glass-card p-6 sm:p-10 rounded-[24px] border-white/10 hover:border-white/25 overflow-hidden flex flex-col justify-between"
      >
        {/* Top subtle light reflection */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/60 transition-all" />

        {/* Project Image Placeholder Area */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden mb-8 bg-neutral-950 border border-white/10">
          <img
            src={bgImage}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover filter grayscale contrast-125 brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Metric Highlight Badge if present */}
          {project.metric && (
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold tracking-wider shadow-xl">
                <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{project.metric}</span>
              </span>
            </div>
          )}

          {/* Floating Arrow icon that appears on hover */}
          <div className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="absolute bottom-4 left-4 z-20">
            <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
              FEATURED PROJECT 0{index + 1}
            </span>
          </div>
        </div>

        {/* Project Details */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:text-white transition-colors">
                {project.title}
              </h3>
              <p className="text-sm sm:text-base font-medium text-neutral-400 mt-1">
                {project.subtitle}
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed my-5">
            {project.description}
          </p>

          {/* Stack Chips */}
          <div className="flex flex-wrap gap-2 pt-2 mb-6">
            {project.stack.map((item, sIdx) => (
              <span
                key={sIdx}
                className="text-[11px] font-mono tracking-wider text-neutral-300 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons: Live & Code (hides if empty) */}
        {(project.liveUrl || project.codeUrl) && (
          <div className="pt-6 border-t border-white/[0.08] flex items-center space-x-4">
            {project.codeUrl && (
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-white hover:text-neutral-300 transition-colors py-2 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10"
              >
                <Github className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-black bg-white hover:bg-neutral-200 transition-colors py-2 px-4 rounded-xl shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Preview</span>
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const Projects: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  // Large muted grey heading PORTFOLIO. that brightens to white as it scrolls into view
  const headingColor = useTransform(scrollYProgress, [0, 1], ['#555555', '#FFFFFF']);

  return (
    <section
      id="portfolio"
      ref={containerRef}
      className="relative w-full py-24 sm:py-32 md:py-40 bg-black overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Dynamic Brightening */}
        <div className="mb-16 sm:mb-24">
          <div className="mb-3">
            <span className="pill-label">CASE STUDIES & BUILDS</span>
          </div>
          <motion.h2
            style={{ color: headingColor }}
            className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none transition-colors duration-300"
          >
            PORTFOLIO<span className="text-neutral-600">.</span>
          </motion.h2>
        </div>

        {/* Two Large Project Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {profile.projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
