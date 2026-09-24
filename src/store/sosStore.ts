import { create } from 'zustand';
import { SOSAlert, GeoLocationPoint } from '../types';
import { api } from '../api/client';
import { soundEffects } from '../utils/sound';
import { triggerHaptic, hapticPatterns } from '../utils/haptics';
import { offlineEmergencyCache } from '../utils/offlineEmergencyCache';

interface SOSState {
  activeSOS: SOSAlert | null;
  isTriggering: boolean;
  countdown: number | null; // null if not in countdown mode
  currentLocation: GeoLocationPoint | null;
  locationError: string | null;
  isSirenPlaying: boolean;
  history: SOSAlert[];
  isOfflineMode: boolean;
  queuedAlertsCount: number;
  fetchActiveSOS: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  requestLocation: () => Promise<GeoLocationPoint>;
  startSOSCountdown: (seconds?: number) => void;
  cancelCountdown: () => void;
  triggerImmediateSOS: (source?: 'ONE_TOUCH_BUTTON' | 'SAFETY_TIMER_EXPIRED' | 'VOICE_TRIGGER' | 'SHAKE_GESTURE') => Promise<{ success: boolean; message?: string; offline?: boolean }>;
  resolveActiveSOS: (reason?: string) => Promise<{ success: boolean; message?: string }>;
  toggleSiren: () => void;
  syncOfflineQueue: () => Promise<void>;
}

let countdownTimer: any = null;

export const useSOSStore = create<SOSState>((set, get) => {
  // Set up online sync listener
  if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
      set({ isOfflineMode: false });
      await get().syncOfflineQueue();
    });

    window.addEventListener('offline', () => {
      set({ isOfflineMode: true });
    });
  }

  return {
    activeSOS: offlineEmergencyCache.getActiveOfflineSOS(),
    isTriggering: false,
    countdown: null,
    currentLocation: null,
    locationError: null,
    isSirenPlaying: false,
    history: [],
    isOfflineMode: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    queuedAlertsCount: offlineEmergencyCache.getQueuedAlerts().filter((a) => !a.synced).length,

    fetchActiveSOS: async () => {
      try {
        const res = await api.get<SOSAlert | null>('/sos/active');
        if (res.success) {
          if (res.data && res.data.status === 'ACTIVE') {
            set({ activeSOS: res.data });
            soundEffects.startEmergencySiren();
            set({ isSirenPlaying: true });
          } else {
            // Check if there is an active offline alert
            const activeOffline = offlineEmergencyCache.getActiveOfflineSOS();
            if (activeOffline) {
              set({ activeSOS: activeOffline });
            } else {
              set({ activeSOS: null });
            }
          }
        }
      } catch {
        // Unstable network or offline: rely on offline emergency cache
        const activeOffline = offlineEmergencyCache.getActiveOfflineSOS();
        if (activeOffline) {
          set({ activeSOS: activeOffline });
          set({ isOfflineMode: true });
        }
      }
    },

    fetchHistory: async () => {
      try {
        const res = await api.get<SOSAlert[]>('/sos/history');
        if (res.success && res.data) {
          set({ history: res.data });
        }
      } catch {
        // Offline
      }
    },

    requestLocation: async (): Promise<GeoLocationPoint> => {
      return new Promise((resolve) => {
        if (!('geolocation' in navigator)) {
          const fallback = offlineEmergencyCache.getLastLocation();
          set({ currentLocation: fallback, locationError: 'Geolocation API not supported by browser' });
          resolve(fallback);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc: GeoLocationPoint = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              address: `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)} (Verified via GPS)`,
            };
            offlineEmergencyCache.saveLastLocation(loc);
            set({ currentLocation: loc, locationError: null });
            resolve(loc);
          },
          (error) => {
            console.warn('Geolocation error:', error.message);
            const fallback = offlineEmergencyCache.getLastLocation();
            set({ currentLocation: fallback, locationError: error.message });
            resolve(fallback);
          },
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 15000 }
        );
      });
    },

    startSOSCountdown: (seconds = 5) => {
      if (countdownTimer) clearInterval(countdownTimer);
      set({ countdown: seconds });
      soundEffects.playBeep(900, 200);

      countdownTimer = setInterval(() => {
        const current = get().countdown;
        if (current === null) {
          clearInterval(countdownTimer);
          return;
        }
        if (current <= 1) {
          clearInterval(countdownTimer);
          set({ countdown: null });
          get().triggerImmediateSOS('ONE_TOUCH_BUTTON');
        } else {
          set({ countdown: current - 1 });
          soundEffects.playBeep(900 + (5 - current) * 100, 150);
        }
      }, 1000);
    },

    cancelCountdown: () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      set({ countdown: null });
    },

    triggerImmediateSOS: async (source = 'ONE_TOUCH_BUTTON') => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      set({ isTriggering: true, countdown: null });
      triggerHaptic(hapticPatterns.emergencyAlarm);

      const loc = await get().requestLocation();

      // Check if network is offline or unstable
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      if (!isOnline) {
        // Immediate offline SOS trigger
        offlineEmergencyCache.queueOfflineSOSAlert({
          location: loc,
          activationSource: source,
          notes: 'Offline emergency SOS triggered via Citizen Safety App.',
        });
        const activeOffline = offlineEmergencyCache.getActiveOfflineSOS();
        soundEffects.startEmergencySiren();
        set({
          activeSOS: activeOffline,
          isTriggering: false,
          isSirenPlaying: true,
          isOfflineMode: true,
          queuedAlertsCount: offlineEmergencyCache.getQueuedAlerts().filter((a) => !a.synced).length,
        });
        return {
          success: true,
          offline: true,
          message: 'SOS triggered in Offline Mode! Queued for auto-dispatch and SMS ready.',
        };
      }

      try {
        const res = await api.post<SOSAlert>('/sos/trigger', {
          location: loc,
          activationSource: source,
          notes: 'Emergency assistance requested via Citizen Safety App.',
        });

        if (res.success && res.data) {
          soundEffects.startEmergencySiren();
          set({ activeSOS: res.data, isTriggering: false, isSirenPlaying: true });
          return { success: true, message: res.message };
        } else {
          // Fallback to offline queue if server error
          offlineEmergencyCache.queueOfflineSOSAlert({
            location: loc,
            activationSource: source,
            notes: 'Emergency assistance requested (Server fallback queue).',
          });
          const activeOffline = offlineEmergencyCache.getActiveOfflineSOS();
          soundEffects.startEmergencySiren();
          set({
            activeSOS: activeOffline,
            isTriggering: false,
            isSirenPlaying: true,
            queuedAlertsCount: offlineEmergencyCache.getQueuedAlerts().filter((a) => !a.synced).length,
          });
          return {
            success: true,
            offline: true,
            message: 'Network unstable: Alert queued locally & SMS dispatch ready.',
          };
        }
      } catch (err: any) {
        // Network timeout / connection refused -> seamlessly fallback to offline SOS mode
        offlineEmergencyCache.queueOfflineSOSAlert({
          location: loc,
          activationSource: source,
          notes: 'Emergency assistance requested (Network disconnected).',
        });
        const activeOffline = offlineEmergencyCache.getActiveOfflineSOS();
        soundEffects.startEmergencySiren();
        set({
          activeSOS: activeOffline,
          isTriggering: false,
          isSirenPlaying: true,
          isOfflineMode: true,
          queuedAlertsCount: offlineEmergencyCache.getQueuedAlerts().filter((a) => !a.synced).length,
        });
        return {
          success: true,
          offline: true,
          message: 'Network disconnected: Offline SOS armed and cached for auto-dispatch!',
        };
      }
    },

    resolveActiveSOS: async (reason = 'I am safe now / Incident Resolved') => {
      const active = get().activeSOS;
      if (!active) return { success: false, message: 'No active SOS found' };

      // Clear local offline alert state
      offlineEmergencyCache.clearActiveOfflineSOS();
      soundEffects.stopEmergencySiren();
      set({ activeSOS: null, isSirenPlaying: false });

      try {
        const res = await api.post<SOSAlert>(`/sos/${active.id}/resolve`, { resolutionReason: reason });
        if (res.success && res.data) {
          get().fetchHistory();
          return { success: true, message: 'SOS resolved successfully' };
        }
      } catch {
        // If offline, local state was already cleared
      }

      return { success: true, message: 'SOS resolved locally' };
    },

    toggleSiren: () => {
      const isPlaying = get().isSirenPlaying;
      if (isPlaying) {
        soundEffects.stopEmergencySiren();
        set({ isSirenPlaying: false });
      } else {
        soundEffects.startEmergencySiren();
        set({ isSirenPlaying: true });
      }
    },

    syncOfflineQueue: async () => {
      const result = await offlineEmergencyCache.syncQueuedAlerts();
      set({
        queuedAlertsCount: offlineEmergencyCache.getQueuedAlerts().filter((a) => !a.synced).length,
      });
      if (result.syncedCount > 0) {
        get().fetchActiveSOS();
        get().fetchHistory();
      }
    },
  };
});

