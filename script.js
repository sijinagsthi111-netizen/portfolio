/**
 * Sijin Agasthi - Interactive Portfolio Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const phoneCopyBtn = document.getElementById('phone-copy-btn');
  const searchInput = document.getElementById('site-search');
  const searchBtn = document.getElementById('search-btn');
  const contactForm = document.getElementById('contact-form');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  // Carousel Elements
  const prevProjectBtn = document.getElementById('prev-project-btn');
  const nextProjectBtn = document.getElementById('next-project-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  let currentProjectIndex = 0;

  // 1. Toast Notification Helper
  function showToast(message, duration = 3500) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // 2. Project Carousel Logic
  function setProject(index) {
    if (projectCards.length === 0) return;
    
    // Bounds wrapping
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

  if (prevProjectBtn) {
    prevProjectBtn.addEventListener('click', () => setProject(currentProjectIndex - 1));
  }
  if (nextProjectBtn) {
    nextProjectBtn.addEventListener('click', () => setProject(currentProjectIndex + 1));
  }

  indicatorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'), 10);
      setProject(index);
    });
  });

  // 4. Copy Phone to Clipboard
  if (phoneCopyBtn) {
    phoneCopyBtn.addEventListener('click', () => {
      const phone = '8593990351';
      navigator.clipboard.writeText(phone).then(() => {
        showToast('📞 Phone number copied: 8593990351');
      }).catch(() => {
        showToast('Phone: +91 8593990351');
      });
    });
  }

  // 5. Interactive Search Bar
  function performSearch() {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      showToast('Please type a keyword (e.g., Python, .NET, VisionAid)');
      return;
    }

    if (query.includes('project') || query.includes('vision') || query.includes('drowsiness') || query.includes('ai') || query.includes('ml')) {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
        showToast(`Showing projects related to "${query}"`);
      }
    } else if (query.includes('.net') || query.includes('c#') || query.includes('service') || query.includes('what i do')) {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
        showToast(`Navigated to services for "${query}"`);
      }
    } else if (query.includes('resume') || query.includes('edu') || query.includes('cert') || query.includes('iit')) {
      const resumeSection = document.getElementById('resume');
      if (resumeSection) {
        resumeSection.scrollIntoView({ behavior: 'smooth' });
        showToast(`Showing certifications & education for "${query}"`);
      }
    } else if (query.includes('contact') || query.includes('talk') || query.includes('email') || query.includes('hire')) {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      showToast(`Found skills & experience matching "${query}"`);
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  // 6. Direct Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('sender-name')?.value || 'Friend';
      showToast(`Thank you, ${senderName}! Your message has been sent to Sijin.`);
      contactForm.reset();
    });
  }

  // 7. Mobile Navigation Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }
});
