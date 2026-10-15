/**
 * Main Application Entrypoint for Sijin Agasthi's 3D Open-World Portfolio
 * Coordinates Three.js, Camera, World, Player, Audio, and UI.
 */

import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { UIManager } from './ui.js';
import { stops } from './stops.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    this.isPaused = false;

    this.initThree();
    this.initWorld();
    this.initPlayer();
    this.initUI();
    this.initDebug();
    this.setupEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFCA88E); // Warm sunset golden-hour peach

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 650);
    this.camera.position.set(0, 4, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Performance target: Cap DPR at 2 (1.5 on mobile)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    const maxDPR = isMobile ? 1.5 : 2.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    // Optional lil-gui behind ?debug parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      import('lil-gui').then(({ GUI }) => {
        const gui = new GUI({ title: '3D World Inspector' });
        const camFolder = gui.addFolder('Camera');
        camFolder.add(this.camera, 'fov', 30, 80).onChange(() => this.camera.updateProjectionMatrix());

        const modeFolder = gui.addFolder('Controls');
        modeFolder.add(this.player, 'controlMode', ['scroll', 'free']).name('Mode');
        modeFolder.add(this.player, 'scrollProgress', 0, 1, 0.01).name('Spline T').listen();
        modeFolder.add(this.player, 'autoRide').name('Auto Ride').listen();

        const biomeFolder = gui.addFolder('Biome');
        biomeFolder.add({ biome: 'sunset' }, 'biome', ['sunset', 'day']).onChange((b) => this.world.setBiome(b));
      });
    }
  }

  setupEvents() {
    // Resize handling
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pause render loop when tab is hidden to conserve GPU/battery
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (!this.isPaused) {
        this.clock.getDelta(); // reset delta so no physics jump
      }
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    if (this.isPaused) return;

    const delta = Math.min(this.clock.getDelta(), 0.06);

    // Update Player & Camera
    this.player.update(delta);

    // Update World environment animations
    this.world.update(delta, this.player.position);

    // Update UI floating stop overlay detection
    this.ui.update(this.player.position);

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
