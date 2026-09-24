import { create } from 'zustand';
import {
  voiceSOSService,
  VoiceSOSConfig,
  VoiceSOSEvent,
} from '../utils/voiceSOSService';

interface VoiceSOSState {
  isSupported: boolean;
  isListening: boolean;
  isPocketModeActive: boolean;
  wakeLockActive: boolean;
  audioLevel: number;
  lastTranscript: string;
  matchedEvent: VoiceSOSEvent | null;
  error: string | null;
  isModalOpen: boolean;
  config: VoiceSOSConfig;
  setModalOpen: (open: boolean) => void;
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
  updateConfig: (cfg: Partial<VoiceSOSConfig>) => void;
  testTrigger: (keyword?: string) => Promise<void>;
  clearError: () => void;
}

export const useVoiceSOSStore = create<VoiceSOSState>((set, get) => {
  // Subscribe to the underlying voiceSOSService singleton
  if (typeof window !== 'undefined') {
    voiceSOSService.subscribe((status) => {
      set({
        isListening: status.isListening,
        isPocketModeActive: status.isPocketModeActive,
        wakeLockActive: status.wakeLockActive,
        lastTranscript: status.lastTranscript,
        matchedEvent: status.matchedEvent,
        audioLevel: status.audioLevel,
        error: status.error,
      });
    });
  }

  return {
    isSupported: typeof window !== 'undefined' ? voiceSOSService.isSupported() : false,
    isListening: false,
    isPocketModeActive: false,
    wakeLockActive: false,
    audioLevel: 0,
    lastTranscript: '',
    matchedEvent: null,
    error: null,
    isModalOpen: false,
    config: voiceSOSService.getConfig(),

    setModalOpen: (open: boolean) => set({ isModalOpen: open }),

    startListening: async () => {
      const ok = await voiceSOSService.startListening();
      return ok;
    },

    stopListening: () => {
      voiceSOSService.stopListening();
    },

    toggleListening: async () => {
      const state = get();
      if (state.isListening) {
        state.stopListening();
      } else {
        await state.startListening();
      }
    },

    updateConfig: (cfg: Partial<VoiceSOSConfig>) => {
      voiceSOSService.updateConfig(cfg);
      set({ config: voiceSOSService.getConfig() });
    },

    testTrigger: async (keyword?: string) => {
      await voiceSOSService.testSimulatedTrigger(keyword);
    },

    clearError: () => set({ error: null }),
  };
});
