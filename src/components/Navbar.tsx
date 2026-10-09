import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { profile } from '../data/portfolio';

interface NavbarProps {
  activeSection: string;
}

const navLinks = [
  { name: 'HOME', href: '#home' },
  { name: 'ABOUT', href: '#about' },
  { name: 'EXPERIENCE', href: '#experience' },
  { name: 'PORTFOLIO', href: '#portfolio' },
  { name: 'CERTIFICATIONS', href: '#certifications' },
  { name: 'CONTACT', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 sm:py-4 bg-black/60 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl'
            : 'py-5 sm:py-7 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Brand Wordmark */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-baseline font-heading text-xl sm:text-2xl font-black tracking-tight text-white transition-opacity hover:opacity-80"
          >
            <span>{profile.brand}</span>
            <span className="text-neutral-500 font-bold ml-0.5">.</span>
          </a>

          {/* Centre Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-7 lg:space-x-9">
            {navLinks.map((link) => {
              const isActive = activeSection === link.name.toLowerCase();
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`text-[11px] font-medium tracking-[0.2em] uppercase transition-all duration-300 relative py-1 ${
                    isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white rounded-full transition-all" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right: HIRE ME Button (Desktop) & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-black bg-white hover:bg-neutral-200 transition-all duration-300 rounded-full shadow-lg hover:shadow-white/10 hover:scale-105 active:scale-95"
            >
              <span>HIRE ME</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl md:hidden pt-24 px-6 flex flex-col justify-between pb-12 transition-all">
          <nav className="flex flex-col space-y-5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.name.toLowerCase();
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`text-lg font-heading font-bold tracking-wider py-2 flex items-center justify-between border-b border-white/[0.06] ${
                    isActive ? 'text-white pl-2 border-white/20' : 'text-neutral-400'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-white" />}
                </a>
              );
            })}
          </nav>

          <div className="pt-6">
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="w-full flex items-center justify-center py-3.5 text-xs font-bold tracking-[0.15em] uppercase text-black bg-white rounded-full"
            >
              <span>HIRE ME</span>
              <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </a>
            <p className="text-center text-xs text-neutral-500 mt-4 tracking-wide">
              {profile.role} · {profile.location}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
