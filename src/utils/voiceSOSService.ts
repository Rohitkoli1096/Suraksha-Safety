/**
 * SURAKSHA INDIA - Voice SOS Web Speech Recognition & Pocket/Lock-Screen Engine
 *
 * Implements hands-free continuous speech recognition using the Web Speech API.
 * Provides resilient background persistence via:
 * 1. Web Audio silent keep-alive oscillator
 * 2. Navigator MediaSession active playback registration
 * 3. Screen Wake Lock API management
 * 4. Auto-recovering continuous speech loop
 * 5. Multi-lingual emergency phrase & custom keyword fuzzy matching
 * 6. Tactile haptics & synthesized voice confirmation for in-pocket awareness
 */

import { triggerHaptic, hapticPatterns } from './haptics';
import { soundEffects } from './sound';
import { useSOSStore } from '../store/sosStore';

export interface VoiceSOSConfig {
  keyword: string;
  sensitivity: 'HIGH' | 'BALANCED' | 'LOW';
  pocketMode: boolean;
  language: string;
}

export interface VoiceSOSEvent {
  phrase: string;
  matchedKeyword: string;
  confidence: number;
  timestamp: number;
  isPocketMode: boolean;
}

type VoiceStatusListener = (status: {
  isListening: boolean;
  isPocketModeActive: boolean;
  wakeLockActive: boolean;
  lastTranscript: string;
  matchedEvent: VoiceSOSEvent | null;
  audioLevel: number;
  error: string | null;
}) => void;

// Built-in Indian & International emergency distress triggers
const BUILT_IN_EMERGENCY_WORDS = [
  'bachao',
  'bachaoo',
  'bacao',
  'bachav',
  'help',
  'help me',
  'emergency',
  'suraksha',
  'khatra',
  'save me',
  'madad',
  'police',
  'danger',
  'attack',
  'chodo',
];

class VoiceSOSManager {
  private recognition: any = null;
  private isListening = false;
  private isPocketModeActive = false;
  private wakeLock: any = null;
  private keepAliveCtx: AudioContext | null = null;
  private keepAliveOsc: OscillatorNode | null = null;
  private keepAliveGain: GainNode | null = null;
  private audioStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private audioLevel = 0;
  private lastTriggerTime = 0;
  private lastTranscript = '';
  private matchedEvent: VoiceSOSEvent | null = null;
  private listeners: Set<VoiceStatusListener> = new Set();
  private error: string | null = null;

  private config: VoiceSOSConfig = {
    keyword: 'bachao',
    sensitivity: 'BALANCED',
    pocketMode: true,
    language: 'en-IN',
  };

  constructor() {
    this.loadPersistedConfig();
    this.setupVisibilityListener();
  }

  /**
   * Check if browser environment supports Web Speech Recognition
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public getConfig(): VoiceSOSConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<VoiceSOSConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.persistConfig();

    // If language changed while listening, restart recognition with new language
    if (newConfig.language && this.isListening && this.recognition) {
      try {
        this.recognition.lang = newConfig.language;
      } catch (e) {
        this.restartRecognition();
      }
    }

    // If pocket mode changed, update keep-alive
    if (newConfig.pocketMode !== undefined && this.isListening) {
      if (newConfig.pocketMode) {
        this.startAudioKeepAlive();
        this.requestWakeLock();
      } else {
        this.stopAudioKeepAlive();
        this.releaseWakeLock();
      }
    }

    this.notifyListeners();
  }

  private loadPersistedConfig() {
    try {
      const saved = localStorage.getItem('suraksha_voice_sos_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
      }
    } catch {
      // Fallback to defaults
    }
  }

  private persistConfig() {
    try {
      localStorage.setItem('suraksha_voice_sos_config', JSON.stringify(this.config));
    } catch {
      // Ignore storage errors
    }
  }

  public subscribe(listener: VoiceStatusListener): () => void {
    this.listeners.add(listener);
    this.notifyListener(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => this.notifyListener(l));
  }

  private notifyListener(listener: VoiceStatusListener) {
    listener({
      isListening: this.isListening,
      isPocketModeActive: this.isPocketModeActive,
      wakeLockActive: !!this.wakeLock,
      lastTranscript: this.lastTranscript,
      matchedEvent: this.matchedEvent,
      audioLevel: this.audioLevel,
      error: this.error,
    });
  }

  /**
   * Listen for screen visibility changes (e.g. phone taken out of pocket or locked/unlocked)
   */
  private setupVisibilityListener() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', async () => {
      if (this.isListening) {
        if (document.visibilityState === 'visible') {
          // Re-acquire wake lock if it was released when display slept
          if (this.config.pocketMode) {
            await this.requestWakeLock();
          }
          // Verify speech recognition is still active
          if (!this.recognition) {
            this.initSpeechRecognition();
          }
        }
      }
    });
  }

  /**
   * Starts hands-free continuous speech recognition
   */
  public async startListening(): Promise<boolean> {
    if (!this.isSupported()) {
      this.error = 'Web Speech Recognition API is not supported in this browser.';
      this.notifyListeners();
      return false;
    }

    this.error = null;
    this.isListening = true;

    // 1. Request microphone access for audio visualizer & permission priming
    await this.setupAudioLevelMonitor();

    // 2. Initialize Web Speech Recognition
    this.initSpeechRecognition();

    // 3. If pocket mode is enabled, engage lock-screen persistence
    if (this.config.pocketMode) {
      await this.engagePocketMode();
    }

    // 4. Request notification permission if not yet granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch {}
      }
    }

    triggerHaptic(hapticPatterns.tap);
    this.notifyListeners();
    return true;
  }

  /**
   * Stops hands-free listening and frees hardware resources
   */
  public stopListening() {
    this.isListening = false;
    this.isPocketModeActive = false;
    this.lastTranscript = '';

    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }

    this.disengagePocketMode();
    this.stopAudioLevelMonitor();
    this.notifyListeners();
  }

  /**
   * Initializes or re-initializes continuous Web Speech recognition
   */
  private initSpeechRecognition() {
    if (!this.isSupported() || !this.isListening) return;

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.lang = this.config.language || 'en-IN';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res && res[0]) {
            transcript += res[0].transcript + ' ';
          }
        }

        const trimmed = transcript.trim().toLowerCase();
        if (trimmed) {
          this.lastTranscript = trimmed;
          this.evaluateTranscript(trimmed);
          this.notifyListeners();
        }
      };

      rec.onerror = (event: any) => {
        // 'no-speech' is expected during silent intervals
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'audio-capture' || event.error === 'not-allowed') {
          this.error = `Microphone access error (${event.error}). Please allow microphone access.`;
          this.notifyListeners();
          return;
        }
        // For transient errors ('network', 'aborted'), quietly recover
        if (this.isListening) {
          setTimeout(() => {
            if (this.isListening) {
              this.restartRecognition();
            }
          }, 300);
        }
      };

      rec.onend = () => {
        // Continuous speech recognition will auto-end on pauses; auto-restart seamlessly
        if (this.isListening) {
          setTimeout(() => {
            if (this.isListening) {
              try {
                this.recognition?.start();
              } catch {
                this.restartRecognition();
              }
            }
          }, 150);
        }
      };

      this.recognition = rec;
      this.recognition.start();
    } catch (err: any) {
      console.warn('Failed to start SpeechRecognition:', err);
      this.error = 'Speech Recognition error: ' + (err?.message || 'Failed to start');
      this.notifyListeners();
    }
  }

  private restartRecognition() {
    if (!this.isListening) return;
    try {
      if (this.recognition) {
        try {
          this.recognition.onend = null;
          this.recognition.onerror = null;
          this.recognition.stop();
        } catch {}
      }
      this.initSpeechRecognition();
    } catch {}
  }

  /**
   * Levenshtein Distance for fuzzy keyword matching in noisy environments
   */
  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Evaluates spoken text against custom keyword and emergency phrases
   */
  private evaluateTranscript(transcript: string) {
    const now = Date.now();
    // Cooldown check (prevent repeated triggering within 10 seconds)
    if (now - this.lastTriggerTime < 10000) {
      return;
    }

    const cleanInput = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleanInput.split(/\s+/).filter(Boolean);
    const customKey = this.config.keyword.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');

    let isMatch = false;
    let matchedWord = '';
    let confidence = 0.85;

    // 1. Direct custom keyword containment
    if (customKey && cleanInput.includes(customKey)) {
      isMatch = true;
      matchedWord = customKey;
      confidence = 0.98;
    }

    // 2. Token-level matching & Levenshtein distance for slight misspellings / accents
    if (!isMatch && customKey) {
      for (const token of tokens) {
        if (token === customKey) {
          isMatch = true;
          matchedWord = customKey;
          confidence = 0.95;
          break;
        }
        if (customKey.length >= 4 && this.levenshtein(token, customKey) <= 1) {
          isMatch = true;
          matchedWord = customKey;
          confidence = 0.88;
          break;
        }
      }
    }

    // 3. Built-in emergency keywords check based on sensitivity setting
    if (!isMatch && this.config.sensitivity !== 'LOW') {
      const emergencyList =
        this.config.sensitivity === 'HIGH'
          ? BUILT_IN_EMERGENCY_WORDS
          : ['bachao', 'help', 'emergency', 'suraksha', 'khatra', 'save me'];

      for (const ew of emergencyList) {
        if (cleanInput.includes(ew)) {
          isMatch = true;
          matchedWord = ew;
          confidence = 0.92;
          break;
        }
        for (const token of tokens) {
          if (token === ew || (ew.length >= 4 && this.levenshtein(token, ew) <= 1)) {
            isMatch = true;
            matchedWord = ew;
            confidence = 0.85;
            break;
          }
        }
        if (isMatch) break;
      }
    }

    if (isMatch) {
      this.lastTriggerTime = now;
      this.onKeywordDetected(matchedWord, confidence, transcript);
    }
  }

  /**
   * Executes emergency activation pipeline upon keyword match
   */
  private async onKeywordDetected(matchedWord: string, confidence: number, phrase: string) {
    const event: VoiceSOSEvent = {
      phrase,
      matchedKeyword: matchedWord,
      confidence,
      timestamp: Date.now(),
      isPocketMode: this.isPocketModeActive,
    };
    this.matchedEvent = event;
    this.notifyListeners();

    // 1. Aggressive Tactile Feedback (Haptic pulses for pocket / eyes-free awareness)
    triggerHaptic(hapticPatterns.sosTrigger);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([400, 150, 400, 150, 700]);
      } catch {}
    }

    // 2. Audible chime / siren chirp
    soundEffects.playBeep(980, 200);

    // 3. Speech Synthesis Audio Confirmation (Speaks clearly so user in pocket hears it)
    this.speakVoiceConfirmation(`Emergency keyword ${matchedWord} recognized. Sending Voice SOS alert.`);

    // 4. Lock-Screen System Notification (Visible if screen is locked or in pocket)
    this.dispatchLockScreenNotification(matchedWord);

    // 5. Trigger SOS in Suraksha SOS Store with 'VOICE_TRIGGER'
    try {
      await useSOSStore.getState().triggerImmediateSOS('VOICE_TRIGGER');
    } catch (err) {
      console.error('Failed to trigger immediate SOS from voice:', err);
    }
  }

  /**
   * Speak confirmation using SpeechSynthesis
   */
  private speakVoiceConfirmation(message: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        utterance.lang = this.config.language || 'en-IN';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }
  }

  /**
   * Dispatches lock-screen system notification
   */
  private dispatchLockScreenNotification(keyword: string) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('🚨 SURAKSHA VOICE SOS TRIGGERED', {
            body: `Emergency trigger "${keyword}" detected while locked/in pocket. Live coordinates broadcasted to emergency contacts!`,
            icon: '/icon-192.png',
            tag: 'voice-sos-active',
            requireInteraction: true,
          });
        } catch (e) {}
      }
    }
  }

  /**
   * Engages Lock-Screen & Pocket Mode Persistence
   * Uses Screen WakeLock, inaudible AudioContext loop, and MediaSession metadata
   */
  private async engagePocketMode() {
    this.isPocketModeActive = true;
    await this.requestWakeLock();
    this.startAudioKeepAlive();
    this.setupMediaSession();
  }

  private disengagePocketMode() {
    this.isPocketModeActive = false;
    this.releaseWakeLock();
    this.stopAudioKeepAlive();
  }

  /**
   * Screen WakeLock API
   */
  private async requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
          this.notifyListeners();
        });
      } catch (e) {
        // WakeLock may be rejected on low battery or if screen is already off
      }
    }
  }

  private releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
      } catch {}
      this.wakeLock = null;
    }
  }

  /**
   * Silent Web Audio Keep-Alive Loop:
   * Keeps audio hardware and processing thread active when screen turns off or device is pocketed
   */
  private startAudioKeepAlive() {
    try {
      if (this.keepAliveCtx) return;
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.keepAliveCtx = new AudioCtxClass();

      // Create an inaudible oscillator at 15Hz with near-zero gain
      const osc = this.keepAliveCtx.createOscillator();
      const gain = this.keepAliveCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(15, this.keepAliveCtx.currentTime);
      gain.gain.setValueAtTime(0.00001, this.keepAliveCtx.currentTime);

      osc.connect(gain);
      gain.connect(this.keepAliveCtx.destination);
      osc.start();

      this.keepAliveOsc = osc;
      this.keepAliveGain = gain;
    } catch (e) {
      console.warn('Audio keepalive initialization failed:', e);
    }
  }

  private stopAudioKeepAlive() {
    try {
      if (this.keepAliveOsc) {
        this.keepAliveOsc.stop();
        this.keepAliveOsc.disconnect();
        this.keepAliveOsc = null;
      }
      if (this.keepAliveGain) {
        this.keepAliveGain.disconnect();
        this.keepAliveGain = null;
      }
      if (this.keepAliveCtx) {
        this.keepAliveCtx.close();
        this.keepAliveCtx = null;
      }
    } catch {}
  }

  /**
   * Navigator MediaSession API:
   * Tells the operating system that an active foreground media task is in progress,
   * preventing the browser process from being frozen when the screen locks.
   */
  private setupMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new (window as any).MediaMetadata({
          title: 'Suraksha Voice SOS Guardian',
          artist: `Active Pocket Guard (Keyword: "${this.config.keyword}")`,
          album: 'Smart India Tech Suite',
          artwork: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        });

        // Dummy handlers to satisfy media controls and prevent background teardown
        const noop = () => {};
        ['play', 'pause', 'stop'].forEach((act) => {
          try {
            navigator.mediaSession.setActionHandler(act as any, noop);
          } catch {}
        });
      } catch (e) {}
    }
  }

  /**
   * Real-time Microphone Audio Level Monitor for visual feedback
   */
  private async setupAudioLevelMonitor() {
    try {
      if (this.audioStream) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.audioStream = stream;

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      this.analyser = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!this.analyser || !this.isListening) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        this.audioLevel = Math.min(100, Math.round((avg / 128) * 100));
        this.notifyListeners();
        this.animationFrameId = requestAnimationFrame(updateLevel);
      };

      this.animationFrameId = requestAnimationFrame(updateLevel);
    } catch (e) {
      // Audio level monitor is non-critical; speech recognition can still work
    }
  }

  private stopAudioLevelMonitor() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }
    this.analyser = null;
    this.audioLevel = 0;
  }

  /**
   * Simulates a Voice SOS detection trigger for safe user testing
   */
  public async testSimulatedTrigger(simulatedKeyword = this.config.keyword) {
    await this.onKeywordDetected(
      simulatedKeyword,
      0.99,
      `[SIMULATED TEST]: User spoke "${simulatedKeyword}"`
    );
  }
}

// Global Singleton Export
export const voiceSOSService = new VoiceSOSManager();
