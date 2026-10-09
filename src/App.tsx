import React from 'react';
import { useLenis } from './hooks/useLenis';
import { useActiveSection } from './hooks/useActiveSection';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Intro } from './components/Intro';
import { About } from './components/About';
import { Tools } from './components/Tools';
import { Experience } from './components/Experience';
import { Projects } from './components/Projects';
import { Certifications } from './components/Certifications';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';

export const App: React.FC = () => {
  // Initialize Lenis smooth scroll
  useLenis();

  // Track active section for Navbar links
  const activeSection = useActiveSection([
    'home',
    'about',
    'experience',
    'portfolio',
    'certifications',
    'contact',
  ]);

  return (
    <div className="relative min-h-screen bg-black text-[#9a9a9a] selection:bg-white selection:text-black">
      {/* 0. Preloader */}
      <Preloader />

      {/* Subtle film grain noise overlay */}
      <div className="film-grain" aria-hidden="true" />

      {/* 1. Fixed Transparent Navbar */}
      <Navbar activeSection={activeSection} />

      {/* Main Sections in Exact Specified Order */}
      <main>
        {/* 2. Hero: 100vh "PORTFOLIO" + 3D Robot */}
        <Hero />

        {/* 3. Intro: Software Developer & AI Engineer */}
        <Intro />

        {/* 4. About: Focus & Education */}
        <About />

        {/* 5. Expertise & Tools: Marquee + Domains Grid */}
        <Tools />

        {/* 6. Experience: Career Timeline */}
        <Experience />

        {/* 7. Portfolio: Case Studies with 3D Tilt */}
        <Projects />

        {/* 8. Certifications & Training: Always Learning */}
        <Certifications />

        {/* 9. Contact: Let's Work Together */}
        <Contact />
      </main>

      {/* 10. Footer */}
      <Footer />

      {/* Back to top floating button */}
      <BackToTop />
    </div>
  );
};

export default App;
