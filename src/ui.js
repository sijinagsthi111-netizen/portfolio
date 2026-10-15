/**
 * UI & Overlay Manager for 3D Open-World Portfolio
 * Manages the animated loader, top-right hamburger menu, equalizer sound toggle,
 * floating in-world 3D overlay cards, mobile virtual joystick, and Accessible Fallback view.
 */

import { stops } from './stops.js';
import { content } from './content.js';
import { audio } from './audio.js';

export class UIManager {
  constructor(player, world) {
    this.player = player;
    this.world = world;
    this.activeStop = null;
    this.currentStopIndex = -1;

    this.initDOM();
    this.setupEvents();
    this.setupMobileControls();
  }

  initDOM() {
    this.loaderEl = document.getElementById('loader-screen');
    this.percentEl = document.getElementById('loader-percent');
    this.startBtn = document.getElementById('loader-start-btn');
    this.dissolveEl = document.getElementById('dissolve-overlay');

    this.menuBtn = document.getElementById('menu-btn');
    this.menuPanel = document.getElementById('menu-panel');
    this.soundBtn = document.getElementById('sound-toggle-btn');
    this.soundBars = document.querySelectorAll('.sound-bar');

    this.cardOverlay = document.getElementById('floating-card-overlay');
    this.simpleVersionModal = document.getElementById('simple-version-modal');
    this.hudStopLabel = document.getElementById('hud-stop-label');

    // Run simulated percent counter up to 100%
    this.runLoaderCounter();
  }

  runLoaderCounter() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (this.percentEl) this.percentEl.textContent = '100%';
        if (this.startBtn) {
          this.startBtn.classList.remove('opacity-0', 'pointer-events-none');
          this.startBtn.classList.add('opacity-100', 'cursor-pointer');
        }
      } else {
        if (this.percentEl) {
          this.percentEl.textContent = progress.toString().padStart(3, '0') + '%';
        }
      }
    }, 45);
  }

  dismissLoader() {
    if (this.dissolveEl) {
      this.dissolveEl.classList.remove('opacity-0', 'pointer-events-none');
      this.dissolveEl.classList.add('opacity-100');
    }

    setTimeout(() => {
      if (this.loaderEl) {
        this.loaderEl.classList.add('hidden');
      }
      // White-out dissolve into the 3D world
      setTimeout(() => {
        if (this.dissolveEl) {
          this.dissolveEl.classList.remove('opacity-100');
          this.dissolveEl.classList.add('opacity-0', 'pointer-events-none');
        }
      }, 400);
    }, 350);
  }

  setupEvents() {
    // Start button
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        this.dismissLoader();
      });
    }

    // Hamburger menu toggle
    if (this.menuBtn && this.menuPanel) {
      this.menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.menuPanel.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!this.menuPanel.contains(e.target) && e.target !== this.menuBtn) {
          this.menuPanel.classList.add('hidden');
        }
      });
    }

    // Esc key toggles menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menuPanel) {
        this.menuPanel.classList.toggle('hidden');
      }
    });

    // Sound toggle
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        this.soundBars.forEach((b) => {
          if (isMuted) {
            b.classList.remove('animate-pulse');
            b.style.height = '4px';
          } else {
            b.classList.add('animate-pulse');
          }
        });
      });
    }

    // Menu Jump-To links
    document.querySelectorAll('[data-jump-stop]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const stopId = btn.getAttribute('data-jump-stop');
        this.jumpToStop(stopId);
        if (this.menuPanel) this.menuPanel.classList.add('hidden');
      });
    });

    // Simple version toggle
    const simpleBtn = document.getElementById('view-simple-btn');
    const closeSimpleBtn = document.getElementById('close-simple-btn');
    if (simpleBtn && this.simpleVersionModal) {
      simpleBtn.addEventListener('click', () => {
        this.simpleVersionModal.classList.remove('hidden');
        if (this.menuPanel) this.menuPanel.classList.add('hidden');
      });
    }
    if (closeSimpleBtn && this.simpleVersionModal) {
      closeSimpleBtn.addEventListener('click', () => {
        this.simpleVersionModal.classList.add('hidden');
      });
    }

    // Check prefers-reduced-motion for automatic accessible view
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (this.simpleVersionModal) {
        this.simpleVersionModal.classList.remove('hidden');
      }
    }
  }

  setupMobileControls() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    const autoRideBtn = document.getElementById('auto-ride-btn');

    if (autoRideBtn && this.player) {
      autoRideBtn.addEventListener('click', () => {
        const active = this.player.toggleAutoRide();
        autoRideBtn.classList.toggle('bg-amber-500', active);
        autoRideBtn.classList.toggle('bg-black/60', !active);
        autoRideBtn.textContent = active ? 'AUTO RIDE: ON' : 'AUTO RIDE: OFF';
      });
    }

    if (joystickBase && joystickThumb && this.player) {
      let isTouching = false;
      let startX = 0;
      let startY = 0;
      const maxRadius = 40;

      const handleStart = (clientX, clientY) => {
        isTouching = true;
        const rect = joystickBase.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        handleMove(clientX, clientY);
      };

      const handleMove = (clientX, clientY) => {
        if (!isTouching) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);

        const x = Math.cos(angle) * clampedDist;
        const y = Math.sin(angle) * clampedDist;

        joystickThumb.style.transform = `translate(${x}px, ${y}px)`;

        // Normalize vector (-1 to 1) with inverted Y for forward
        this.player.setJoystick({
          x: x / maxRadius,
          y: -y / maxRadius,
        });
      };

      const handleEnd = () => {
        isTouching = false;
        joystickThumb.style.transform = `translate(0px, 0px)`;
        this.player.setJoystick({ x: 0, y: 0 });
      };

      joystickBase.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        handleStart(t.clientX, t.clientY);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      }, { passive: true });

      window.addEventListener('touchend', handleEnd, { passive: true });
      window.addEventListener('touchcancel', handleEnd, { passive: true });
    }
  }

  jumpToStop(stopId) {
    const targetIdx = stops.findIndex((s) => s.id === stopId);
    if (targetIdx !== -1 && this.player) {
      const progress = targetIdx / stops.length;
      this.player.jumpToProgress(progress);
    }
  }

  update(playerPos) {
    if (!playerPos || !this.cardOverlay) return;

    // Check proximity to all 10 stops
    let foundStop = null;
    let foundIdx = -1;

    for (let i = 0; i < stops.length; i++) {
      const s = stops[i];
      const dx = playerPos.x - s.position.x;
      const dz = playerPos.z - s.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < s.triggerRadius) {
        foundStop = s;
        foundIdx = i;
        break;
      }
    }

    if (foundStop && foundIdx !== this.currentStopIndex) {
      this.currentStopIndex = foundIdx;
      this.renderStopCard(foundStop);
      if (this.hudStopLabel) {
        this.hudStopLabel.textContent = `STOP 0${foundStop.stopIndex}: ${foundStop.name}`;
      }
    } else if (!foundStop && this.currentStopIndex !== -1) {
      this.currentStopIndex = -1;
      this.hideStopCard();
      if (this.hudStopLabel) {
        this.hudStopLabel.textContent = 'EXPLORING THE OPEN WORLD';
      }
    }
  }

  renderStopCard(stop) {
    if (!this.cardOverlay) return;

    let contentHtml = '';

    if (stop.id === 'hero') {
      contentHtml = `
        <div class="space-y-2">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● SPAWN PLAZA</span>
          </div>
          <h2 class="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">${stop.heading}</h2>
          <p class="text-sm sm:text-base text-amber-200 font-medium">${stop.subheading}</p>
          <p class="text-xs text-neutral-300 italic pt-1">${stop.tagline}</p>
          <div class="pt-3 text-[11px] text-neutral-400 font-mono flex items-center space-x-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>${stop.promptText}</span>
          </div>
        </div>
      `;
    } else if (stop.id === 'about') {
      contentHtml = `
        <div class="space-y-3">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● LANDMARK ARCH</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl font-bold text-white">${stop.heading}</h2>
          <p class="text-xs sm:text-sm text-neutral-200 leading-relaxed font-light">${stop.bio}</p>
          <div class="pt-2 border-t border-white/10 text-[11px] font-mono text-neutral-300 space-y-1">
            <p>🎓 ${stop.education}</p>
            <p>📍 ${stop.location}</p>
          </div>
        </div>
      `;
    } else if (stop.id === 'skills') {
      const skillPills = stop.skills
        .map(
          (s) =>
            `<span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-neutral-200 hover:text-white hover:border-amber-400 transition-colors">${s.name}</span>`
        )
        .join(' ');
      contentHtml = `
        <div class="space-y-3 max-w-lg">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● THE SKILL ZONE GATE</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl font-bold text-white">${stop.heading}</h2>
          <p class="text-xs text-neutral-300">${stop.subheading}</p>
          <div class="flex flex-wrap gap-1.5 pt-1">${skillPills}</div>
        </div>
      `;
    } else if (stop.id === 'projects') {
      const projCards = stop.projects
        .map(
          (p) => `
          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <div class="flex items-center justify-between">
              <h3 class="font-display text-base font-bold text-white">${p.title}</h3>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400 text-black font-semibold">${p.metric}</span>
            </div>
            <p class="text-xs text-neutral-300 font-light leading-relaxed">${p.description}</p>
            <div class="pt-1 flex items-center justify-between">
              <span class="text-[10px] font-mono text-neutral-400">${p.tags.join(' • ')}</span>
              <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-amber-300 hover:underline">Code →</a>
            </div>
          </div>
        `
        )
        .join('');
      contentHtml = `
        <div class="space-y-3 max-w-xl">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● CANAL BRIDGE ROAD</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl font-bold text-white">${stop.heading}</h2>
          <div class="space-y-2.5 pt-1">${projCards}</div>
        </div>
      `;
    } else if (stop.id === 'timeline') {
      const timelineHtml = stop.timeline
        .map(
          (t) => `
          <div class="flex items-start space-x-3 text-xs">
            <span class="font-display font-bold text-amber-300 text-sm shrink-0 w-12">${t.year}</span>
            <div class="text-neutral-200 space-y-0.5">
              ${t.items.map((i) => `<p class="font-light">• ${i}</p>`).join('')}
            </div>
          </div>
        `
        )
        .join('');
      contentHtml = `
        <div class="space-y-3 max-w-lg">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● JOURNEY ROAD</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl font-bold text-white">${stop.heading}</h2>
          <div class="space-y-2 pt-1 border-t border-white/10">${timelineHtml}</div>
        </div>
      `;
    } else if (stop.id === 'contact') {
      contentHtml = `
        <div class="space-y-3 max-w-md">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-sky-300 uppercase">
            <span>● DAYTIME BIOME</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl font-bold text-white">${stop.heading}</h2>
          <p class="text-xs text-neutral-200 leading-relaxed font-light">${stop.contact.note}</p>
          <div class="pt-2 flex flex-col space-y-2 text-xs font-mono">
            <a href="mailto:${stop.contact.email}" class="p-2.5 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-between hover:bg-white/20 transition-all">
              <span>📧 ${stop.contact.email}</span>
              <span class="text-sky-300">Send Mail →</span>
            </a>
            <a href="${stop.contact.github}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-between hover:bg-white/20 transition-all">
              <span>🐙 github.com/sijinagsthi111-netizen</span>
              <span class="text-sky-300">View Profile →</span>
            </a>
          </div>
        </div>
      `;
    } else {
      contentHtml = `
        <div class="space-y-2">
          <h2 class="font-display text-xl font-bold text-white">${stop.heading}</h2>
          <p class="text-xs text-neutral-300 font-light leading-relaxed">${stop.subheading || ''}</p>
          ${stop.quote ? `<p class="text-xs text-amber-200 italic pt-1">"${stop.quote}"</p>` : ''}
        </div>
      `;
    }

    this.cardOverlay.innerHTML = contentHtml;
    this.cardOverlay.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    this.cardOverlay.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
  }

  hideStopCard() {
    if (!this.cardOverlay) return;
    this.cardOverlay.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    this.cardOverlay.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
  }
}
