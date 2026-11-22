(function () {
  const NS = (window.DroneGame = window.DroneGame || {});

  const SCALES = {
    greece: [392, 440, 494, 587, 659, 784],
    egypt: [196, 233, 294, 311, 392, 466],
    magical: [349, 415, 523, 622, 698, 831],
    space: [220, 262, 330, 392, 494, 587]
  };

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.world = 'greece';
      this.timer = null;
      this.step = 0;
    }

    ensure() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      return this.ctx;
    }

    tone(freq, duration, type, volume, delay) {
      if (this.muted) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const start = ctx.currentTime + (delay || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume || 0.07, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    }

    setWorld(id) {
      this.world = id;
      this.step = 0;
    }

    startAmbience() {
      this.ensure();
      this.stopAmbience();
      const self = this;
      this.timer = setInterval(function () { self.ambienceStep(); }, 420);
      this.ambienceStep();
    }

    stopAmbience() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
    }

    ambienceStep() {
      if (this.muted) return;
      const notes = SCALES[this.world] || SCALES.greece;
      const i = this.step % notes.length;
      this.tone(notes[i], 0.6, 'triangle', 0.022);
      if (this.step % 4 === 0) this.tone(notes[0] / 2, 1.4, 'sine', 0.03);
      if (this.world === 'magical' && this.step % 3 === 0) this.tone(notes[i] * 2, 0.35, 'sine', 0.015, 0.18);
      if (this.world === 'space' && this.step % 5 === 0) this.tone(notes[i] * 0.5, 1.8, 'sine', 0.022);
      this.step++;
    }

    sfx(name) {
      if (this.muted) return;
      switch (name) {
        case 'hook':
          this.tone(330, 0.12, 'triangle', 0.09);
          this.tone(520, 0.16, 'sine', 0.06, 0.07);
          break;
        case 'drop':
          this.tone(240, 0.14, 'triangle', 0.08);
          break;
        case 'perfect':
          [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.4, 'sine', 0.07, i * 0.06));
          break;
        case 'place':
          this.tone(180, 0.18, 'square', 0.05);
          this.tone(360, 0.3, 'triangle', 0.06, 0.04);
          break;
        case 'hit':
          this.tone(140, 0.35, 'sawtooth', 0.1);
          this.tone(90, 0.45, 'square', 0.05, 0.04);
          break;
        case 'loseLife':
          this.tone(220, 0.3, 'sawtooth', 0.08);
          this.tone(165, 0.5, 'sine', 0.06, 0.12);
          break;
        case 'win':
          [392, 494, 587, 784, 988].forEach((f, i) => this.tone(f, 0.7, 'triangle', 0.08, i * 0.13));
          break;
        case 'lose':
          [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.7, 'sawtooth', 0.07, i * 0.18));
          break;
        case 'click':
          this.tone(600, 0.07, 'sine', 0.05);
          break;
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) this.stopAmbience();
      else if (this.ctx) this.startAmbience();
      return this.muted;
    }
  }

  NS.AudioEngine = AudioEngine;
})();
