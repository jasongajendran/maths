/**
 * Sound Effects Engine using Web Audio API
 * Provides cheerful, kid-friendly acoustic feedback for quiz questions,
 * interactive checkpoints, matching pair connections, and victory celebrations.
 */

class SoundEffectsEngine {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Load persisted sound preference if available
    try {
      const stored = localStorage.getItem('sat_maths_sound_fx');
      if (stored !== null) {
        this.isEnabled = stored === 'true';
      }
    } catch {
      this.isEnabled = true;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('sat_maths_sound_fx', enabled ? 'true' : 'false');
    } catch {
      // Ignore local storage error
    }
  }

  public toggle(): boolean {
    const nextState = !this.isEnabled;
    this.setEnabled(nextState);
    if (nextState) {
      // Play a quick cheerful confirmation chime
      this.playCorrectSound();
    }
    return nextState;
  }

  /**
   * Cheerful, uplifting ascending chime arpeggio for correct answers (✨ Ding-Ding-Ding-DING!)
   */
  public playCorrectSound(): void {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C5, E5, G5, C6 major chord arpeggio with warm harmonics
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.28 },  // C5
      { freq: 659.25, time: 0.08, dur: 0.32 }, // E5
      { freq: 783.99, time: 0.16, dur: 0.36 }, // G5
      { freq: 1046.5, time: 0.24, dur: 0.55 }, // C6 (sparkle high note)
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Soft highpass/band filter for crisp bell-like chime
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now + time);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      // Envelope: instant punchy attack, smooth musical decay
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.28, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);

      // Add a soft higher harmonic sparkle for the final note
      if (freq === 1046.5) {
        const sparkleOsc = ctx.createOscillator();
        const sparkleGain = ctx.createGain();
        sparkleOsc.type = 'sine';
        sparkleOsc.frequency.setValueAtTime(2093.0, now + time); // C7 octave harmonic
        sparkleGain.gain.setValueAtTime(0.0001, now + time);
        sparkleGain.gain.exponentialRampToValueAtTime(0.12, now + time + 0.02);
        sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.45);

        sparkleOsc.connect(sparkleGain);
        sparkleGain.connect(ctx.destination);
        sparkleOsc.start(now + time);
        sparkleOsc.stop(now + time + 0.45);
      }
    });
  }

  /**
   * Gentle, encouraging "uh-oh" bounce tone for wrong answers (not jarring, encourages trying again)
   */
  public playWrongSound(): void {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Friendly cartoonish two-note drop (F3 -> C#3) with gentle pitch-dip
    const tones = [
      { startFreq: 260, endFreq: 220, time: 0.0, dur: 0.22 },
      { startFreq: 190, endFreq: 155, time: 0.16, dur: 0.32 },
    ];

    tones.forEach(({ startFreq, endFreq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now + time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + time + dur * 0.9);

      // Soft envelope
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.25, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }

  /**
   * Mini pop/chime sound when connecting matching pairs
   */
  public playPairConnectedSound(): void {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Grand victory fanfare when achieving 100% or completing the assessment!
   */
  public playVictoryFanfare(): void {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const fanfare = [
      { freq: 523.25, time: 0.0, dur: 0.18 },  // C5
      { freq: 523.25, time: 0.16, dur: 0.18 }, // C5
      { freq: 523.25, time: 0.32, dur: 0.18 }, // C5
      { freq: 659.25, time: 0.48, dur: 0.35 }, // E5
      { freq: 783.99, time: 0.80, dur: 0.25 }, // G5
      { freq: 1046.5, time: 1.05, dur: 0.8 },  // C6 (Triumphant long note)
    ];

    fanfare.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = freq === 1046.5 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.28, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }
}

export const soundEffects = new SoundEffectsEngine();
