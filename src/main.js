/**
 * Main Application Orchestrator for Sijin Agasthi's 3D Open-World Portfolio
 * Coordinates Three.js, Camera, World, Player, Audio, UI, and Debug Overlay.
 */

import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { UIManager } from './ui.js';
import './index.css';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    this.isPaused = false;
    this.frameCount = 0;
    this.fps = 60;
    this.lastFpsUpdate = performance.now();

    this.initThree();
    this.initWorld();
    this.initPlayer();
    this.initUI();
    this.initDebug();
    this.setupEvents();

    // Expose for Playwright test automation & inspection
    window.__PORTFOLIO_APP__ = this;
    window.__PORTFOLIO_PLAYER__ = this.player;

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  showSimpleFallback() {
    const simpleModal = document.getElementById('simple-version-modal');
    if (simpleModal) {
      simpleModal.classList.remove('hidden');
      simpleModal.classList.add('flex');
    }
  }

  initThree() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFCA88E); // Sunset peach

    // Camera with portrait-aware FOV
    const aspect = window.innerWidth / window.innerHeight;
    const isPortrait = window.innerHeight > window.innerWidth;
    const fov = isPortrait ? 72 : 45;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 650);
    this.camera.position.set(0, 4, 10);

    // Renderer with WebGL error fallback
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (e) {
      console.error('WebGL initialization failed, falling back to simple version:', e);
      this.showSimpleFallback();
      return;
    }

    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('WebGL Context Lost. Displaying simple HTML fallback.');
      this.showSimpleFallback();
    }, false);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Performance target: Cap DPR at 2 (1.5 on mobile)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    const maxDPR = isMobile ? 1.5 : 2.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);
  }

  initWorld() {
    this.world = new World(this.scene, this.renderer);
  }

  initPlayer() {
    this.player = new Player(this.scene, this.camera, this.world.pathCurve);
  }

  initUI() {
    this.ui = new UIManager(this.player, this.world);
  }

  initDebug() {
    const urlParams = new URLSearchParams(window.location.search);
    this.isDebug = urlParams.has('debug');

    if (this.isDebug) {
      // Build Real-Time Debug HUD Overlay
      const hud = document.createElement('div');
      hud.id = 'debug-hud-overlay';
      hud.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.85);
        color: #00FF66;
        font-family: monospace;
        font-size: 11px;
        line-height: 1.5;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid rgba(0, 255, 102, 0.3);
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      `;
      document.body.appendChild(hud);
      this.debugHud = hud;

      // Also load lil-gui for parameter manipulation
      import('lil-gui').then(({ GUI }) => {
        const gui = new GUI({ title: '3D World Inspector', autoPlace: false });
        gui.domElement.style.position = 'fixed';
        gui.domElement.style.top = '72px';
        gui.domElement.style.left = '16px';
        gui.domElement.style.zIndex = '999';
        gui.domElement.style.maxWidth = '240px';
        document.body.appendChild(gui.domElement);

        const camFolder = gui.addFolder('Camera');
        camFolder.add(this.camera, 'fov', 30, 80).onChange(() => this.camera.updateProjectionMatrix());

        const modeFolder = gui.addFolder('Controls');
        modeFolder.add(this.player, 'progress', 0, 1, 0.001).name('Progress').listen();
        modeFolder.add(this.player, 'targetProgress', 0, 1, 0.001).name('Target Prog').listen();
        modeFolder.add(this.player, 'autoRide').name('Auto Ride').listen();

        const biomeFolder = gui.addFolder('Biome');
        biomeFolder.add({ biome: 'sunset' }, 'biome', ['sunset', 'day']).onChange((b) => this.world.setBiome(b));
      }).catch(() => {});
    }
  }

  enableLowQuality() {
    if (this.isLowQuality) return;
    this.isLowQuality = true;
    console.warn('FPS below 30 detected: Auto-lowering quality settings for smooth performance.');
    if (this.renderer) {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
    }
    if (this.world && typeof this.world.enableLowQualityMode === 'function') {
      this.world.enableLowQualityMode();
    }
  }

  setupEvents() {
    // Window Resize & Orientation Change
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;

      this.camera.fov = isPortrait ? 72 : 45;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      if (this.renderer) {
        this.renderer.setSize(width, height);
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || width < 768;
        const maxDPR = isMobile ? 1.5 : 2.0;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });

    // Pause when tab hidden and prevent delta spikes on resume
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (!this.isPaused) {
        this.clock.getDelta(); // flush pause duration
      }
    });
  }

  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      // Auto-lower quality if FPS drops below 30 over several checks (after initial 3s grace period)
      if (now > 3000 && this.fps < 30) {
        this.lowFpsCount = (this.lowFpsCount || 0) + 1;
        if (this.lowFpsCount >= 4 && !this.isLowQuality) {
          this.enableLowQuality();
        }
      } else {
        this.lowFpsCount = Math.max(0, (this.lowFpsCount || 0) - 1);
      }
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    if (this.isPaused) return;

    // Clamp delta to prevent physics jumps
    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);

    this.updateFPS();

    // Update Player physics, unified input, and animation mixer
    this.player.update(delta);

    // Update World environment animations
    this.world.update(delta, this.player.position);

    // Update UI floating stop overlay detection
    this.ui.update(this.player.position);

    // Update Debug HUD if active
    if (this.isDebug && this.debugHud) {
      const stats = this.player.getDebugStats();
      this.debugHud.innerHTML = `
        <div style="font-weight:bold; color:#FFF; margin-bottom:4px;">⚡ 3D PORTFOLIO DEBUG</div>
        <div>FPS: <span style="color:#FFF">${this.fps}</span></div>
        <div>Progress: <span style="color:#FFF">${stats.progress}</span></div>
        <div>TargetProgress: <span style="color:#FFF">${stats.targetProgress}</span></div>
        <div>Speed: <span style="color:#FFF">${stats.speed}</span></div>
        <div>NormalizedSpeed: <span style="color:#FFF">${stats.normalizedSpeed}</span></div>
        <div>Animation: <span style="color:#FFF; font-weight:bold;">${stats.animation}</span></div>
        <div>Mixer Time: <span style="color:#FFF">${stats.mixerTime}s</span></div>
      `;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
