/**
 * Web Audio API based emergency siren & audio feedback
 * Zero external audio files required, runs 100% reliably in any modern browser
 */

class SoundEffectsManager {
  private audioCtx: AudioContext | null = null;
  private sirenOscillator: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: any = null;
  private isSirenActive = false;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playBeep(frequency = 880, durationMs = 120): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio feedback blocked by browser autoplay policy:', e);
    }
  }

  public startEmergencySiren(): void {
    if (this.isSirenActive) return;
    try {
      const ctx = this.getContext();
      this.isSirenActive = true;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      this.sirenOscillator = osc;
      this.sirenGain = gain;

      let high = false;
      this.sirenInterval = setInterval(() => {
        if (!this.isSirenActive || !this.audioCtx) return;
        const targetFreq = high ? 650 : 950;
        this.sirenOscillator?.frequency.exponentialRampToValueAtTime(targetFreq, this.audioCtx.currentTime + 0.35);
        high = !high;
      }, 400);
    } catch (e) {
      console.warn('Failed to start siren audio:', e);
    }
  }

  public stopEmergencySiren(): void {
    this.isSirenActive = false;
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOscillator) {
      try {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
      } catch (e) {}
      this.sirenOscillator = null;
    }
    if (this.sirenGain) {
      try {
        this.sirenGain.disconnect();
      } catch (e) {}
      this.sirenGain = null;
    }
  }
}

export const soundEffects = new SoundEffectsManager();
