import React from 'react';
import { Github, Linkedin, ArrowUpRight, Mail, Phone } from 'lucide-react';
import { profile } from '../data/portfolio';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative w-full bg-black border-t border-white/[0.08] pt-20 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/[0.08]">
          {/* Brand & Short Description on the Left */}
          <div className="lg:col-span-5 space-y-4">
            <a
              href="#home"
              onClick={(e) => handleScrollTo(e, 'home')}
              className="inline-flex items-baseline font-heading text-3xl font-black tracking-tight text-white"
            >
              <span>{profile.brand}</span>
              <span className="text-neutral-500 font-bold ml-0.5">.</span>
            </a>
            <p className="text-sm text-neutral-400 font-light max-w-sm leading-relaxed">
              Software Developer & AI Engineer dedicated to building intelligent, scalable systems, .NET architectures, and real-world machine learning solutions.
            </p>
            <p className="text-xs font-mono text-neutral-500 tracking-wider">
              Based in {profile.location}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono tracking-[0.2em] uppercase text-white font-semibold">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-xs uppercase tracking-wider text-neutral-400 font-medium">
              {['home', 'about', 'experience', 'portfolio', 'certifications', 'contact'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item}`}
                    onClick={(e) => handleScrollTo(e, item)}
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono tracking-[0.2em] uppercase text-white font-semibold">
              CONTACT
            </h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <a
                href={`mailto:${profile.email}`}
                className="hover:text-white transition-colors flex items-center space-x-2 py-0.5"
              >
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate">{profile.email}</span>
              </a>
              <a
                href={`tel:${profile.phone}`}
                className="hover:text-white transition-colors flex items-center space-x-2 py-0.5"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>+91 {profile.phone}</span>
              </a>
            </div>
          </div>

          {/* Connect Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono tracking-[0.2em] uppercase text-white font-semibold">
              CONNECT
            </h4>
            <div className="flex flex-col space-y-2 text-xs font-medium text-neutral-400">
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 hover:text-white transition-colors py-0.5"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3 h-3 text-neutral-600" />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 hover:text-white transition-colors py-0.5"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 text-neutral-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 font-mono gap-4">
          <p>© {currentYear} {profile.name}. All rights reserved.</p>
          <p className="tracking-widest uppercase text-[10px]">
            DESIGNED & ENGINEERED WITH PRECISION
          </p>
        </div>
      </div>
    </footer>
  );
};
