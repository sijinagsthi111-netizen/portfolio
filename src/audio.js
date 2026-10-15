/**
 * Web Audio Synthesizer for 3D Open-World Portfolio
 * Provides procedural, zero-bandwidth CC0 ambient soundscape, scooter engine hum, and horn.
 * Starts muted by default as requested.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.ambientGain = null;
    this.engineGain = null;
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.isPlaying = false;
    this.analyser = null;
    this.ambientNodes = [];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();

    // Master analyser for visualizer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.connect(this.ctx.destination);

    // Master volume node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
    this.masterGain.connect(this.analyser);

    // Create Ambient Drone & Chime generator
    this.setupAmbientSoundscape();

    // Create Scooter Engine Sound generator
    this.setupEngineSound();
  }

  setupAmbientSoundscape() {
    if (!this.ctx) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    // Pentatonic chord frequencies for warm sunset golden-hour mood (F3, A3, C4, E4, G4)
    const freqs = [174.61, 220.0, 261.63, 329.63, 392.0];

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Gentle LFO modulation for warm analog warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(2.0, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.04 / (i + 1), this.ctx.currentTime);

      if (panner) {
        panner.pan.setValueAtTime((i % 2 === 0 ? 0.35 : -0.35), this.ctx.currentTime);
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.ambientGain);
      osc.start();

      this.ambientNodes.push({ osc, lfo, gain });
    });
  }

  setupEngineSound() {
    if (!this.ctx) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    // Low pass filter for muffled engine tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.engineGain.connect(filter);
    filter.connect(this.masterGain);

    // Dual oscillator for rich 2-stroke scooter buzz
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'triangle';
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
    this.engineOsc.connect(this.engineGain);
    this.engineOsc.start();

    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = 'sawtooth';
    this.engineSubOsc.frequency.setValueAtTime(90, this.ctx.currentTime);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.engineSubOsc.connect(subGain);
    subGain.connect(this.engineGain);
    this.engineSubOsc.start();
  }

  setSpeed(speedRatio) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const targetFreq = 45 + Math.abs(speedRatio) * 65;
    const targetVolume = Math.min(0.22, 0.04 + Math.abs(speedRatio) * 0.18);

    if (this.engineOsc) {
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    }
    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 2, now, 0.1);
    }
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(targetVolume, now, 0.1);
    }
  }

  honk() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0, now);
    hornGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    hornGain.connect(this.analyser);

    // Classic cheerful moped dual-tone (A4 + C#5)
    [440, 554.37].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(hornGain);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  toggleMute() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  getFrequencyData(dataArray) {
    if (this.analyser && !this.isMuted) {
      this.analyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }
}

export const audio = new AudioManager();
