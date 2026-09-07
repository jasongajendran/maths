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
  speech = speech.replace(/(\w+)\/(\w+)/g, '$1 over $2');

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

export type AudioListener = (activeId: string | null, isSpeaking: boolean) => void;

class AudioSpeechManager {
  private currentId: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<AudioListener> = new Set();
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    // Send immediate state
    listener(this.currentId, this.isPlaying());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const isSpeaking = this.isPlaying();
    this.listeners.forEach((listener) => listener(this.currentId, isSpeaking));
  }

  public isPlaying(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  }

  public getCurrentId(): string | null {
    return this.currentId;
  }

  public speak(id: string, rawText: string, options?: { rate?: number; pitch?: number }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported on this browser.');
      return;
    }

    // If already speaking this ID, toggle/stop it
    if (this.currentId === id && this.isPlaying()) {
      this.stop();
      return;
    }

    // Stop any ongoing speech first
    this.stop();

    const spokenText = cleanMathForSpeech(rawText);
    if (!spokenText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = options?.rate ?? 0.95; // slightly slower for mathematical clarity
    utterance.pitch = options?.pitch ?? 1.0;

    // Pick best English voice if available (e.g. UK / US natural voice)
    if (this.voices.length > 0) {
      const preferredVoice = this.voices.find(
        (v) => (v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) && !v.name.includes('Google')
      ) || this.voices.find((v) => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    this.currentId = id;
    this.currentUtterance = utterance;

    utterance.onstart = () => {
      this.notify();
    };

    utterance.onend = () => {
      if (this.currentId === id) {
        this.currentId = null;
        this.currentUtterance = null;
        this.notify();
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('Speech synthesis error:', e);
      }
      this.currentId = null;
      this.currentUtterance = null;
      this.notify();
    };

    window.speechSynthesis.speak(utterance);
    this.notify();
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentId = null;
      this.currentUtterance = null;
      this.notify();
    }
  }
}

export const audioSpeech = new AudioSpeechManager();
