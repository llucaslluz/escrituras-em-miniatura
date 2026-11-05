// Contemplative Web Audio API ambient generator (zero external MP3 dependencies).
const CHORDS = {
  bible: [130.81, 164.81, 196.0, 246.94, 293.66],   // Cmaj9 warm pastoral voicing
  mormon: [146.83, 185.0, 220.0, 277.18, 329.63],   // Dmaj9 hopeful covenant voicing
  dc: [138.59, 174.61, 207.65, 261.63, 311.13],     // Dbmaj9 morning restoration voicing
  pearl: [123.47, 155.56, 185.0, 233.08, 277.18],   // Bmaj9 eternal cosmos voicing
  solemn: [110.0, 130.81, 164.81, 196.0, 246.94],   // Am9 reverent Gethsemane/Golgotha voicing
};

const SOLEMN_SCENES = new Set(['B29', 'B30', 'M14', 'P04', 'D10']);

export class ContemplativeAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.filter = null;
    this.voices = [];
    this.enabled = false;
    this.currentBook = 'bible';
    this.currentSceneId = 'B17';
  }

  init() {
    if (this.ctx || typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0001;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 360;
    this.filter.Q.value = 0.7;

    this.filter.connect(this.master);
    this.master.connect(this.ctx.destination);

    const freqs = this.getFrequencies();
    this.voices = freqs.map((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;

      // Subtle slow breathing modulation per voice
      lfo.type = 'sine';
      lfo.frequency.value = 0.07 + i * 0.019;
      lfoGain.gain.value = 0.012;

      gain.gain.value = [0.055, 0.042, 0.038, 0.028, 0.02][i] || 0.025;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(this.filter);

      osc.start();
      lfo.start();
      return { osc, gain };
    });
  }

  getFrequencies() {
    if (SOLEMN_SCENES.has(this.currentSceneId)) return CHORDS.solemn;
    return CHORDS[this.currentBook] || CHORDS.bible;
  }

  setStory(story) {
    if (!story) return;
    this.currentBook = story.book || 'bible';
    this.currentSceneId = story.id || 'B17';
    if (!this.ctx || !this.voices.length) return;
    const freqs = this.getFrequencies();
    const now = this.ctx.currentTime;
    this.voices.forEach((v, i) => {
      const target = freqs[i] || freqs[0];
      v.osc.frequency.cancelScheduledValues(now);
      v.osc.frequency.setTargetAtTime(target, now, 1.4);
    });
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.enabled) {
      this.init();
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0.16, now, 1.2);
    } else if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0.0001, now, 0.6);
    }
    return this.enabled;
  }

  toggle() {
    return this.setEnabled(!this.enabled);
  }
}

export const soundscape = new ContemplativeAudio();
