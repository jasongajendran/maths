/**
 * Audio Speech Synthesis engine with Mathematical expression pre-processing
 * Converts LaTeX and mathematical shorthand into natural conversational English speech.
 */

export function cleanMathForSpeech(text: string): string {
  if (!text) return '';

  let speech = text;

  // Replace Markdown headers and bold/italic syntax
  speech = speech.replace(/#{1,6}\s+/g, '');
  speech = speech.replace(/\*\*(.*?)\*\*/g, '$1');
  speech = speech.replace(/\*(.*?)\*/g, '$1');
  speech = speech.replace(/`([^`]+)`/g, '$1');

  // Strip LaTeX text commands: \text{something} -> something
  speech = speech.replace(/\\text\{([^}]+)\}/g, '$1');
  speech = speech.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  speech = speech.replace(/\\mathbf\{([^}]+)\}/g, '$1');

  // LaTeX Vectors & Matrices
  speech = speech.replace(
    /\\begin\{pmatrix\}\s*([^\\]+)\s*\\\\\s*([^\\]+)\s*\\end\{pmatrix\}/g,
    'vector: $1 horizontal, $2 vertical'
  );
  speech = speech.replace(/\\vec\{([^}]+)\}/g, 'vector $1');

  // Fractions: \frac{a}{b} -> a over b
  speech = speech.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');
  // Simple fractions like 3/4 or 1/2 (avoid matching dates like 2024/09)
  speech = speech.replace(/\b(\d+)\/(\d+)\b/g, '$1 over $2');

  // Square roots: \sqrt{x} or \sqrt[n]{x}
  speech = speech.replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, '$1-th root of $2');
  speech = speech.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1');
  speech = speech.replace(/√(\w+|\([^)]+\))/g, 'square root of $1');

  // Units
  speech = speech.replace(/cm\^3/g, 'cubic centimetres');
  speech = speech.replace(/m\^3/g, 'cubic metres');
  speech = speech.replace(/cm\^2/g, 'square centimetres');
  speech = speech.replace(/m\^2/g, 'square metres');

  // Powers and exponents
  speech = speech.replace(/([a-zA-Z0-9)]+)\^2\b/g, '$1 squared');
  speech = speech.replace(/([a-zA-Z0-9)]+)\^3\b/g, '$1 cubed');
  speech = speech.replace(/([a-zA-Z0-9)]+)\^\{?(-?\d+|[a-zA-Z]+)\}?/g, '$1 to the power of $2');

  // Special math operators & symbols
  speech = speech.replace(/\\implies/g, ' which gives ');
  speech = speech.replace(/\\to|\\rightarrow/g, ' maps to ');
  speech = speech.replace(/\\quad|\\qquad/g, ' ');
  speech = speech.replace(/\\cdot/g, ' times ');
  speech = speech.replace(/\\pm|±/g, ' plus or minus ');
  speech = speech.replace(/\\times|×/g, ' times ');
  speech = speech.replace(/\\div|÷/g, ' divided by ');
  speech = speech.replace(/\\neq|≠/g, ' is not equal to ');
  speech = speech.replace(/\\leq|\\le|≤/g, ' is less than or equal to ');
  speech = speech.replace(/\\geq|\\ge|≥/g, ' is greater than or equal to ');
  speech = speech.replace(/\\approx|≈/g, ' is approximately equal to ');
  speech = speech.replace(/\\pi|π/g, ' pi ');
  speech = speech.replace(/\\theta|θ/g, ' theta ');
  speech = speech.replace(/\\degree|°/g, ' degrees ');
  speech = speech.replace(/\\%/g, ' percent');
  speech = speech.replace(/%/g, ' percent');

  // Clean remaining LaTeX commands, brackets, and dollar signs
  speech = speech.replace(/\\([a-zA-Z]+)/g, '$1');
  speech = speech.replace(/[{}]/g, '');
  speech = speech.replace(/\\\\/g, ' ');
  speech = speech.replace(/\$/g, '');

  // Clean extra spaces and punctuation
  speech = speech.replace(/\s+/g, ' ').trim();

  return speech;
}

export interface AudioSpeechState {
  activeId: string | null;
  isSpeaking: boolean;
  isPaused: boolean;
  label: string | null;
  rate: number;
}

export type AudioListener = (state: AudioSpeechState) => void;

class AudioSpeechManager {
  private currentId: string | null = null;
  private currentLabel: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<AudioListener> = new Set();
  private voices: SpeechSynthesisVoice[] = [];
  private _isSpeaking: boolean = false;
  private _isPaused: boolean = false;
  private _rate: number = 0.95;
  private keepAliveTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }

      // Global keyboard shortcut: Escape halts all audio reading
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._isSpeaking) {
          this.stop();
        }
      });
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    // Send immediate state snapshot
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AudioSpeechState {
    return {
      activeId: this.currentId,
      isSpeaking: this._isSpeaking,
      isPaused: this._isPaused,
      label: this.currentLabel,
      rate: this._rate,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('AudioListener notification error:', err);
      }
    });
  }

  public isPlaying(): boolean {
    return this._isSpeaking && !this._isPaused;
  }

  public getCurrentId(): string | null {
    return this.currentId;
  }

  public getCurrentLabel(): string | null {
    return this.currentLabel;
  }

  public getRate(): number {
    return this._rate;
  }

  public setRate(rate: number) {
    this._rate = Math.max(0.5, Math.min(2.0, rate));
    this.notify();
  }

  public speak(
    id: string,
    rawText: string,
    options?: { label?: string; rate?: number; pitch?: number }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported on this browser.');
      return;
    }

    // CRITICAL: If already playing or targeting this exact ID, clicking again STOPS it immediately!
    if (this.currentId === id) {
      this.stop();
      return;
    }

    // Stop any ongoing speech first cleanly
    this.stop();

    const spokenText = cleanMathForSpeech(rawText);
    if (!spokenText.trim()) return;

    const rateToUse = options?.rate ?? this._rate;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = rateToUse;
    utterance.pitch = options?.pitch ?? 1.0;

    // Pick preferred clear English voice (e.g. UK / US educational voice)
    if (this.voices.length > 0) {
      const preferredVoice =
        this.voices.find(
          (v) => (v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) && !v.name.includes('Google')
        ) || this.voices.find((v) => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    this.currentId = id;
    this.currentLabel = options?.label || cleanMathForSpeech(rawText).slice(0, 60);
    this.currentUtterance = utterance;
    this._isSpeaking = true;
    this._isPaused = false;

    utterance.onstart = () => {
      this._isSpeaking = true;
      this._isPaused = false;
      this.startKeepAlive();
      this.notify();
    };

    utterance.onpause = () => {
      this._isPaused = true;
      this.notify();
    };

    utterance.onresume = () => {
      this._isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.clearKeepAlive();
      if (this.currentId === id) {
        this.currentId = null;
        this.currentLabel = null;
        this.currentUtterance = null;
        this._isSpeaking = false;
        this._isPaused = false;
        this.notify();
      }
    };

    utterance.onerror = (e) => {
      this.clearKeepAlive();
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('Speech synthesis error:', e);
      }
      this.currentId = null;
      this.currentLabel = null;
      this.currentUtterance = null;
      this._isSpeaking = false;
      this._isPaused = false;
      this.notify();
    };

    try {
      // In some browsers, cancel before speak helps flush old queues
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to invoke window.speechSynthesis.speak:', err);
      this.stop();
      return;
    }

    this.notify();
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this._isSpeaking) {
      window.speechSynthesis.pause();
      this._isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this._isPaused) {
      window.speechSynthesis.resume();
      this._isPaused = false;
      this.notify();
    }
  }

  public stop() {
    this.clearKeepAlive();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.currentUtterance) {
        this.currentUtterance.onstart = null;
        this.currentUtterance.onend = null;
        this.currentUtterance.onerror = null;
        this.currentUtterance.onpause = null;
        this.currentUtterance.onresume = null;
      }
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (e) {
        // Safe fallback
      }
    }
    this.currentId = null;
    this.currentLabel = null;
    this.currentUtterance = null;
    this._isSpeaking = false;
    this._isPaused = false;
    this.notify();
  }

  /**
   * Chromium browsers have a bug where long utterances pause after 15 seconds.
   * This keep-alive interval safely pulses pause/resume to prevent stalling.
   */
  private startKeepAlive() {
    this.clearKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (this._isSpeaking && !this._isPaused && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 10000);
  }

  private clearKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}

export const audioSpeech = new AudioSpeechManager();
