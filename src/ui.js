/**
 * UI & Overlay Manager for 3D Open-World Portfolio
 * Manages the animated loader, fullscreen mobile hamburger menu, equalizer sound toggle,
 * floating in-world 3D overlay cards with close buttons, mobile virtual joystick,
 * boost button, and Accessible Fallback view.
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
    this.closeMenuBtn = document.getElementById('close-menu-btn');
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
      progress += Math.floor(Math.random() * 8) + 5;
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
    }, 40);
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
    }

    if (this.closeMenuBtn && this.menuPanel) {
      this.closeMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.menuPanel.classList.add('hidden');
      });
    }

    // Esc key toggles menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menuPanel) {
        this.menuPanel.classList.add('hidden');
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
      btn.addEventListener('click', () => {
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

    // Tap outside to dismiss card overlay
    document.addEventListener('click', (e) => {
      if (this.cardOverlay && !this.cardOverlay.contains(e.target) && !e.target.closest('#menu-btn') && !e.target.closest('#menu-panel') && !e.target.closest('#touch-controls')) {
        this.hideStopCard();
      }
    });
  }

  setupMobileControls() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    const autoRideBtn = document.getElementById('auto-ride-btn');
    const boostBtn = document.getElementById('boost-btn');
    const touchControls = document.getElementById('touch-controls');

    // Auto-hide on non-touch desktop screens
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;
    if (touchControls) {
      if (!isTouch && window.innerWidth >= 1024) {
        touchControls.classList.add('hidden');
      } else {
        touchControls.classList.remove('hidden');
      }
    }

    if (autoRideBtn && this.player) {
      autoRideBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = this.player.toggleAutoRide();
        autoRideBtn.classList.toggle('bg-amber-500', active);
        autoRideBtn.classList.toggle('text-black', active);
        autoRideBtn.classList.toggle('bg-black/70', !active);
        autoRideBtn.textContent = active ? 'AUTO: ON' : 'AUTO: OFF';
      });
    }

    // Boost button touch/pointer interaction
    if (boostBtn && this.player) {
      const startBoost = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.player.keys.boost = true;
        boostBtn.classList.add('bg-amber-300', 'scale-90');
      };
      const endBoost = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.player.keys.boost = false;
        boostBtn.classList.remove('bg-amber-300', 'scale-90');
      };
      boostBtn.addEventListener('touchstart', startBoost, { passive: false });
      boostBtn.addEventListener('touchend', endBoost, { passive: false });
      boostBtn.addEventListener('mousedown', startBoost);
      boostBtn.addEventListener('mouseup', endBoost);
      boostBtn.addEventListener('mouseleave', endBoost);
    }

    // Virtual Joystick logic with touch/pointer support
    if (joystickBase && joystickThumb && this.player) {
      let isTouching = false;
      let startX = 0;
      let startY = 0;
      const maxRadius = 38;

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

    const closeButtonHtml = `
      <button id="dismiss-card-btn" class="absolute top-3 right-3 w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white text-xs font-bold transition-all touch-target" aria-label="Dismiss info card">
        ✕
      </button>
    `;

    if (stop.id === 'hero') {
      contentHtml = `
        <div class="relative space-y-2 pr-8">
          ${closeButtonHtml}
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● SPAWN PLAZA</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">${stop.heading}</h2>
          <p class="text-xs sm:text-sm text-amber-200 font-medium">${stop.subheading}</p>
          <p class="text-xs text-neutral-300 italic pt-0.5">${stop.tagline}</p>
          <div class="pt-2 text-[11px] text-neutral-400 font-mono flex items-center space-x-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>${stop.promptText}</span>
          </div>
        </div>
      `;
    } else if (stop.id === 'about') {
      contentHtml = `
        <div class="relative space-y-2.5 pr-8">
          ${closeButtonHtml}
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● LANDMARK ARCH</span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-white">${stop.heading}</h2>
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
            `<span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-neutral-200">${s.name}</span>`
        )
        .join(' ');
      contentHtml = `
        <div class="relative space-y-2.5 pr-8">
          ${closeButtonHtml}
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● THE SKILL ZONE GATE</span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-white">${stop.heading}</h2>
          <p class="text-xs text-neutral-300">${stop.subheading}</p>
          <div class="flex flex-wrap gap-1.5 pt-1">${skillPills}</div>
        </div>
      `;
    } else if (stop.id === 'projects') {
      const projCards = stop.projects
        .map(
          (p) => `
          <div class="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div class="flex items-center justify-between">
              <h3 class="font-display text-xs sm:text-sm font-bold text-white">${p.title}</h3>
              <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-400 text-black font-semibold">${p.metric}</span>
            </div>
            <p class="text-xs text-neutral-300 font-light leading-relaxed">${p.description}</p>
            <div class="pt-1 flex items-center justify-between">
              <span class="text-[9px] font-mono text-neutral-400">${p.tags.slice(0, 3).join(' • ')}</span>
              <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] min-w-[44px] inline-flex items-center text-xs font-mono text-amber-300 hover:underline">Code →</a>
            </div>
          </div>
        `
        )
        .join('');
      contentHtml = `
        <div class="relative space-y-2 pr-8">
          ${closeButtonHtml}
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● CANAL BRIDGE ROAD</span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-white">${stop.heading}</h2>
          <div class="space-y-2 pt-1 max-h-[45dvh] overflow-y-auto">${projCards}</div>
        </div>
      `;
    } else if (stop.id === 'timeline') {
      const timelineHtml = stop.timeline
        .map(
          (t) => `
          <div class="flex items-start space-x-2.5 text-xs">
            <span class="font-display font-bold text-amber-300 text-xs shrink-0 w-10">${t.year}</span>
            <div class="text-neutral-200 space-y-0.5">
              ${t.items.map((i) => `<p class="font-light">• ${i}</p>`).join('')}
            </div>
          </div>
        `
        )
        .join('');
      contentHtml = `
        <div class="relative space-y-2 pr-8">
          ${closeButtonHtml}
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-amber-300 uppercase">
            <span>● JOURNEY ROAD</span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-white">${stop.heading}</h2>
          <div class="space-y-2 pt-1 border-t border-white/10 max-h-[45dvh] overflow-y-auto">${timelineHtml}</div>
        </div>
      `;
    } else if (stop.id === 'contact') {
      contentHtml = `
        <div class="relative space-y-3 pr-8">
          ${closeButtonHtml}
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[10px] tracking-widest text-sky-300 uppercase">
            <span>● DAYTIME BIOME</span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-white">${stop.heading}</h2>
          <p class="text-xs text-neutral-200 leading-relaxed font-light">${stop.contact.note}</p>
          <div class="pt-1 flex flex-col gap-2 font-mono">
            <a href="mailto:${stop.contact.email}" class="min-h-[48px] p-3 rounded-xl bg-amber-400 text-black font-bold flex items-center justify-between active:scale-95 transition-all touch-target">
              <span>✉ ${stop.contact.email}</span>
              <span class="text-xs">Send Email →</span>
            </a>
            <a href="${stop.contact.github}" target="_blank" rel="noopener noreferrer" class="min-h-[48px] p-3 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-between hover:bg-white/20 active:scale-95 transition-all touch-target">
              <span>🐙 GitHub Profile</span>
              <span class="text-xs text-sky-300">Visit →</span>
            </a>
          </div>
        </div>
      `;
    } else {
      contentHtml = `
        <div class="relative space-y-2 pr-8">
          ${closeButtonHtml}
          <h2 class="font-display text-lg sm:text-xl font-bold text-white">${stop.heading}</h2>
          <p class="text-xs text-neutral-300 font-light leading-relaxed">${stop.subheading || ''}</p>
          ${stop.quote ? `<p class="text-xs text-amber-200 italic pt-1">"${stop.quote}"</p>` : ''}
        </div>
      `;
    }

    this.cardOverlay.innerHTML = contentHtml;
    this.cardOverlay.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    this.cardOverlay.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');

    // Attach listener to dismiss button
    const dismissBtn = document.getElementById('dismiss-card-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideStopCard();
      });
    }
  }

  hideStopCard() {
    if (!this.cardOverlay) return;
    this.cardOverlay.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    this.cardOverlay.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
  }
}
