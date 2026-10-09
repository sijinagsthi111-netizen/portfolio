import React, { Suspense, useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SPLINE_SCENE_URL } from '../config';
import { SiPython, SiDotnet, SiReact, SiTypescript } from 'react-icons/si';
import { TbBrandCSharp } from 'react-icons/tb';
import { Sparkles } from 'lucide-react';

// Lazy-load Spline to optimize initial bundle performance
const Spline = React.lazy(() => import('@splinetool/react-spline'));

// Fallback interactive 3D futuristic Robot / Core avatar
const InteractiveRobotFallback: React.FC<{ mousePos: { x: number; y: number } }> = ({ mousePos }) => {
  return (
    <div className="relative w-72 h-80 sm:w-96 sm:h-[450px] flex items-center justify-center select-none pointer-events-none">
      {/* Glow orb */}
      <div 
        className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-white/10 via-neutral-500/10 to-transparent blur-3xl"
        style={{
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      />
      
      {/* Cybernetic Humanoid Silhouette / Robot Visual */}
      <div 
        className="relative z-10 flex flex-col items-center"
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x * 15}deg) rotateX(${-mousePos.y * 12}deg)`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)'
        }}
      >
        {/* Head / Visor */}
        <div className="relative w-20 h-24 sm:w-28 sm:h-32 rounded-3xl bg-gradient-to-b from-neutral-800 to-black border border-white/20 shadow-2xl flex items-center justify-center p-3">
          {/* Glowing Eye Visor */}
          <div className="w-full h-8 sm:h-10 rounded-full bg-black/80 border border-white/30 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <div 
              className="w-8 h-2 sm:w-12 sm:h-2.5 bg-white rounded-full shadow-[0_0_12px_#ffffff]"
              style={{
                transform: `translateX(${mousePos.x * 12}px)`
              }}
            />
          </div>
          {/* Subtle audio / status dots */}
          <div className="absolute -bottom-2 flex space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
          </div>
        </div>

        {/* Neck connector */}
        <div className="w-8 h-4 bg-neutral-900 border-x border-white/10 my-1" />

        {/* Torso / Glossy Armor */}
        <div className="relative w-40 sm:w-56 h-36 sm:h-48 rounded-t-3xl rounded-b-2xl bg-gradient-to-b from-neutral-900 via-black to-neutral-950 border border-white/20 shadow-2xl flex flex-col items-center pt-4 px-4 overflow-hidden">
          {/* Chest Arc Reactor / Core */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/40 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-white to-neutral-400 shadow-[0_0_15px_#ffffff] animate-pulse" />
          </div>
          <div className="mt-4 text-[9px] uppercase tracking-[0.25em] text-neutral-500 font-mono">
            NEURAL_CORE_AI
          </div>
          {/* Mechanical Shoulder Caps */}
          <div className="absolute -left-6 top-3 w-10 h-16 rounded-l-2xl bg-neutral-900 border border-white/10" />
          <div className="absolute -right-6 top-3 w-10 h-16 rounded-r-2xl bg-neutral-900 border border-white/10" />
        </div>
      </div>

      {/* Floating Badge Label */}
      <div className="absolute -bottom-6 px-3.5 py-1 rounded-full bg-black/80 border border-white/15 text-[10px] uppercase tracking-widest text-neutral-400 backdrop-blur-md">
        3D Interactive Robot
      </div>
    </div>
  );
};

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [splineFailed, setSplineFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);
  const robotY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const floatingBadges = [
    { icon: SiPython, label: 'Python', delay: '0s', pos: 'bottom-20 left-6 sm:left-16' },
    { icon: SiDotnet, label: '.NET Core', delay: '1.5s', pos: 'bottom-28 right-8 sm:right-24' },
    { icon: Sparkles, label: 'Generative AI', delay: '3s', pos: 'bottom-12 left-1/3' },
    { icon: SiReact, label: 'React', delay: '0.8s', pos: 'top-32 right-12 hidden lg:flex' },
    { icon: TbBrandCSharp, label: 'C#', delay: '2.2s', pos: 'top-40 left-12 hidden lg:flex' },
    { icon: SiTypescript, label: 'TypeScript', delay: '1s', pos: 'bottom-40 right-1/4 hidden md:flex' },
  ];

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-black select-none"
    >
      {/* Top subtle radial spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[400px] radial-spotlight-top pointer-events-none" />

      {/* Layer 1: Background Gigantic PORTFOLIO Typography */}
      <motion.div
        style={{ scale: textScale, opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <h1 className="font-heading font-black text-[17vw] sm:text-[18vw] leading-none tracking-tighter text-white/90 select-none text-center transform -translate-y-4 sm:-translate-y-8">
          PORTFOLIO
        </h1>
      </motion.div>

      {/* Layer 2: 3D Robot in Center (Overlapping the Typography) */}
      <motion.div
        style={{ y: robotY }}
        className="relative z-20 w-full max-w-4xl h-[70vh] flex items-center justify-center"
      >
        {/* On mobile or if Spline fails or is invalid, use our crisp responsive fallback */}
        {isMobile || splineFailed || !SPLINE_SCENE_URL ? (
          <InteractiveRobotFallback mousePos={mousePos} />
        ) : (
          <Suspense fallback={<InteractiveRobotFallback mousePos={mousePos} />}>
            <div className="w-full h-full relative">
              <Spline
                scene={SPLINE_SCENE_URL}
                onError={() => setSplineFailed(true)}
                className="w-full h-full"
              />
            </div>
          </Suspense>
        )}
      </motion.div>

      {/* Oversized dim grey text 'Sijin' partly cropped by the fold at bottom-left */}
      <div className="absolute -bottom-8 -left-4 z-10 pointer-events-none select-none opacity-20 hover:opacity-30 transition-opacity">
        <span className="font-heading font-black text-[13vw] sm:text-[11vw] leading-none text-neutral-700 tracking-tighter">
          Sijin
        </span>
      </div>

      {/* Floating small glass tiles with tech icons */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingBadges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div
              key={idx}
              style={{ animationDelay: badge.delay }}
              className={`absolute ${badge.pos} animate-float-slow pointer-events-auto`}
            >
              <div className="glass-card px-3.5 py-2 flex items-center space-x-2.5 shadow-2xl hover:scale-110 hover:border-white/30 transition-all cursor-default">
                <Icon className="w-4 h-4 tech-logo" />
                <span className="text-[11px] font-medium text-neutral-300 tracking-wider">
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll indicator prompt */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-30 flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase text-neutral-500">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        <span>SCROLL TO EXPLORE</span>
      </div>
    </section>
  );
};
