/**
 * Sijin Agasthi - Ultra-Creative Interactive Portfolio Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elements
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderFill = document.getElementById('preloader-fill');
  const spotlight = document.getElementById('cursor-spotlight');
  const canvas = document.getElementById('particle-canvas');
  const toast = document.getElementById('toast');
  const typewriterText = document.getElementById('typewriter-text');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const phoneCopyBtn = document.getElementById('phone-copy-btn');
  const contactForm = document.getElementById('contact-form');

  // Terminal Elements
  const terminalModal = document.getElementById('terminal-modal');
  const terminalToggleBtn = document.getElementById('terminal-toggle-btn');
  const terminalCloseBtn = document.getElementById('terminal-close-btn');
  const terminalExitIcon = document.getElementById('terminal-exit-icon');
  const terminalInput = document.getElementById('terminal-input');
  const terminalHistory = document.getElementById('terminal-history');
  const terminalChips = document.querySelectorAll('.term-chip');

  // Carousel Elements
  const prevProjectBtn = document.getElementById('prev-project-btn');
  const nextProjectBtn = document.getElementById('next-project-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  let currentProjectIndex = 0;

  // 2. Cinematic Preloader Sequence
  setTimeout(() => {
    if (preloaderBar) preloaderBar.style.width = '100%';
    if (preloaderFill) preloaderFill.classList.add('filled');
  }, 100);

  setTimeout(() => {
    if (preloader) {
      preloader.classList.add('fade-out');
      document.body.classList.remove('loading');
    }
  }, 1100);

  // 3. Toast Helper
  function showToast(message, duration = 3200) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // 4. Cursor Spotlight Tracker
  if (spotlight && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      spotlight.style.left = `${e.clientX}px`;
      spotlight.style.top = `${e.clientY}px`;
    });
  }

  // 5. Interactive Constellation Canvas
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(width < 768 ? 25 : 55, 65);
    const mouse = { x: null, y: null, radius: 120 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 1.8 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse avoidance/attraction
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.8;
            this.y -= (dy / dist) * force * 1.8;
          }
        }
      }
      draw() {
        const theme = document.documentElement.getAttribute('data-theme') || 'aurora';
        let fill = 'rgba(0, 229, 153, 0.55)';
        let shadow = '#00E599';
        if (theme === 'violet') {
          fill = 'rgba(168, 85, 247, 0.6)';
          shadow = '#a855f7';
        } else if (theme === 'cyberpunk') {
          fill = 'rgba(244, 63, 94, 0.6)';
          shadow = '#f43f5e';
        } else if (theme === 'aurora') {
          fill = 'rgba(0, 242, 254, 0.6)';
          shadow = '#00f2fe';
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.shadowColor = shadow;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      // Connect lines
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'aurora';
      let strokeRgb = '0, 229, 153';
      if (currentTheme === 'violet') strokeRgb = '168, 85, 247';
      else if (currentTheme === 'cyberpunk') strokeRgb = '244, 63, 94';
      else if (currentTheme === 'aurora') strokeRgb = '0, 242, 254';

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = `rgba(${strokeRgb}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // 6. Dynamic Typewriter Effect
  if (typewriterText) {
    const roles = [
      'Software Developer & AI Engineer',
      '.NET Core & C# Architect',
      'Generative AI & LLM Specialist',
      'Computer Vision Innovator',
      'Data Analytics & Power BI Pro'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingDelay = 90;

    function typeLoop() {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        typewriterText.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        typingDelay = 45;
      } else {
        typewriterText.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        typingDelay = 90;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        typingDelay = 1800; // pause at end
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typingDelay = 400; // pause before next
      }

      setTimeout(typeLoop, typingDelay);
    }
    setTimeout(typeLoop, 800);
  }

  // 7. 3D Mouse Tilt Effect on Elements
  const tiltItems = document.querySelectorAll('.tilt-item, #profile-tilt-card');
  if (window.matchMedia('(pointer: fine)').matches) {
    tiltItems.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -9;
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  }

  // 8. Interactive Skills Filter Tabs
  const skillTabs = document.querySelectorAll('.skill-tab');
  const techCards = document.querySelectorAll('.tech-badge-card');

  skillTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      skillTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      techCards.forEach((card) => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // 9. Projects Carousel Logic
  function setProject(index) {
    if (projectCards.length === 0) return;
    if (index < 0) {
      currentProjectIndex = projectCards.length - 1;
    } else if (index >= projectCards.length) {
      currentProjectIndex = 0;
    } else {
      currentProjectIndex = index;
    }

    projectCards.forEach((card, idx) => {
      if (idx === currentProjectIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    indicatorDots.forEach((dot, idx) => {
      if (idx === currentProjectIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  if (prevProjectBtn) prevProjectBtn.addEventListener('click', () => setProject(currentProjectIndex - 1));
  if (nextProjectBtn) nextProjectBtn.addEventListener('click', () => setProject(currentProjectIndex + 1));

  indicatorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      setProject(idx);
    });
  });

  // Mobile Touch Swipe on Projects Deck
  const projectsDeck = document.getElementById('projects-deck');
  if (projectsDeck) {
    let touchStartX = 0;
    let touchEndX = 0;

    projectsDeck.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    projectsDeck.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) {
          setProject(currentProjectIndex + 1);
        } else {
          setProject(currentProjectIndex - 1);
        }
      }
    }, { passive: true });
  }

  // 10. Copy Phone / Direct Email
  if (phoneCopyBtn) {
    phoneCopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('8593990351').then(() => {
        showToast('📞 Phone copied: +91 8593990351');
      }).catch(() => {
        showToast('Phone: +91 8593990351');
      });
    });
  }

  // 11. Interactive Hacker Terminal Logic
  function openTerminal() {
    if (terminalModal) {
      terminalModal.classList.add('open');
      terminalModal.setAttribute('aria-hidden', 'false');
      if (terminalInput) terminalInput.focus();
    }
  }

  function closeTerminal() {
    if (terminalModal) {
      terminalModal.classList.remove('open');
      terminalModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (terminalToggleBtn) terminalToggleBtn.addEventListener('click', openTerminal);
  if (terminalCloseBtn) terminalCloseBtn.addEventListener('click', closeTerminal);
  if (terminalExitIcon) terminalExitIcon.addEventListener('click', closeTerminal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && terminalModal && terminalModal.classList.contains('open')) {
      closeTerminal();
    }
    // Quick shortcut backtick opens terminal
    if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      if (terminalModal.classList.contains('open')) closeTerminal();
      else openTerminal();
    }
  });

  const commands = {
    help: 'Available commands:\n  • whoami    - About Sijin Agasthi\n  • skills    - Technical toolkit & stack\n  • projects  - Highlighted engineering builds\n  • resume    - Download or view curriculum vitae\n  • contact   - Reach out via email, phone, or WhatsApp\n  • clear     - Clear terminal window',
    whoami: 'Sijin Agasthi — Software Developer & AI Engineer\nLocation: Kannur, Kerala (Open to Remote / Worldwide)\nDegree: B.Tech, Vimal Jyothi Engineering College\nFocus: Building scalable .NET backend architectures & applied Generative AI systems.',
    skills: 'Technical Stack Overview:\n  Languages: Python, C#, Java, C, C++, R\n  Frameworks: .NET Core, ASP.NET, REST APIs\n  AI / ML: Generative AI, Multimodal LLMs, PyTorch, OpenCV, LSTM-KNN\n  Analytics: Power BI, Power Query, Matplotlib, Statistical Modeling\n  Tools: Git, GitHub, Raspberry Pi, Software QA Testing',
    projects: 'Featured Projects:\n  1. VisionAid: Assistive glasses with Raspberry Pi, camera & multimodal LLMs for scene-to-speech.\n  2. Driver Drowsiness Monitoring: Real-time ML face tracking & EAR fatigue alarm (81.5% accuracy).',
    resume: 'Resume PDF is ready. Opening PDF document...',
    contact: 'Contact Sijin Agasthi:\n  Email:    sijinagsthi111@gmail.com\n  Phone:    +91 8593990351\n  WhatsApp: https://wa.me/918593990351\n  GitHub:   https://github.com/sijinagsthi111-netizen',
    clear: ''
  };

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    // Echo input
    const userLine = document.createElement('div');
    userLine.className = 'term-line';
    userLine.innerHTML = `<span class="term-prompt">sijin@dev:~$</span> <span class="output-success">${cmd}</span>`;
    terminalHistory.appendChild(userLine);

    if (cmd === 'clear') {
      terminalHistory.innerHTML = '';
      if (terminalInput) terminalInput.value = '';
      return;
    }

    if (cmd === 'resume') {
      window.open('assets/Sijin_Agasthi_Resume.pdf', '_blank');
    }

    const outputLine = document.createElement('div');
    outputLine.className = 'term-line';

    if (commands[cmd]) {
      outputLine.className = 'term-line output-accent';
      outputLine.style.whiteSpace = 'pre-line';
      outputLine.textContent = commands[cmd];
    } else {
      outputLine.className = 'term-line output-muted';
      outputLine.textContent = `Command not recognized: "${cmd}". Type 'help' to see valid commands.`;
    }

    terminalHistory.appendChild(outputLine);
    if (terminalInput) terminalInput.value = '';
    const body = document.getElementById('terminal-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCommand(terminalInput.value);
      }
    });
  }

  terminalChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      executeCommand(cmd);
    });
  });

  // 12. Contact Form Simulation
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('sender-name')?.value || 'Friend';
      showToast(`Thank you, ${senderName}! Your message has been sent to Sijin.`);
      contactForm.reset();
    });
  }

  // 13. Mobile Navigation Toggle & Outside-Click Close
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('mobile-open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when tapping anywhere outside the nav on mobile
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        if (navMenu.classList.contains('mobile-open')) {
          navMenu.classList.remove('mobile-open');
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  // 14. Permanent Ultra-Attractive Aurora Prism Theme
  document.documentElement.setAttribute('data-theme', 'aurora');
});

