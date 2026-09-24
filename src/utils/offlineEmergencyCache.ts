import { EmergencyContact, UserProfile, GeoLocationPoint, SOSAlert } from '../types';
import { api } from '../api/client';
import { triggerHaptic, hapticPatterns } from './haptics';

export interface QueuedSOSAlert {
  localId: string;
  timestamp: number;
  activationSource: string;
  location: GeoLocationPoint;
  notes?: string;
  synced: boolean;
  serverId?: string;
}

const STORAGE_KEYS = {
  CONTACTS: 'suraksha_cached_emergency_contacts',
  USER: 'suraksha_cached_user_profile',
  SOS_QUEUE: 'suraksha_offline_sos_queue',
  ACTIVE_OFFLINE_SOS: 'suraksha_active_offline_sos',
  LAST_LOCATION: 'suraksha_last_known_location',
};

// Default fallback national emergency contacts
export const DEFAULT_NATIONAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'nat-112',
    name: 'National Emergency Response (112)',
    phone: '112',
    relationship: 'Unified Police / Fire / Medical',
    notifyOnSOS: true,
  },
  {
    id: 'nat-1091',
    name: 'Women in Distress Helpline',
    phone: '1091',
    relationship: 'Police Special Cell',
    notifyOnSOS: true,
  },
  {
    id: 'nat-1930',
    name: 'Cyber Crime Emergency Desk',
    phone: '1930',
    relationship: 'Cyber Investigation Bureau',
    notifyOnSOS: false,
  },
  {
    id: 'nat-139',
    name: 'Railway Protection Force (RPF)',
    phone: '139',
    relationship: 'Transit & Train Security',
    notifyOnSOS: false,
  },
];

class OfflineEmergencyCache {
  // Save contacts both to localStorage and Service Worker CacheStorage
  saveEmergencyContacts(contacts: EmergencyContact[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
      // Also cache in CacheStorage if available
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.open('suraksha-emergency-contacts-cache').then((cache) => {
          const fakeResponse = new Response(
            JSON.stringify({ success: true, data: contacts }),
            { headers: { 'Content-Type': 'application/json' } }
          );
          cache.put('/api/user/emergency-contacts', fakeResponse);
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to save emergency contacts to offline cache:', e);
    }
  }

  // Retrieve cached contacts with default national fallbacks
  getCachedEmergencyContacts(): EmergencyContact[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read cached emergency contacts:', e);
    }
    return DEFAULT_NATIONAL_CONTACTS;
  }

  // Alias for caching contacts
  cacheEmergencyContacts(contacts: EmergencyContact[]) {
    this.saveEmergencyContacts(contacts);
  }

  // Ensure default national emergency contacts are saved if empty
  ensureDefaultsCached(): EmergencyContact[] {
    const existing = this.getCachedEmergencyContacts();
    if (!existing || existing.length === 0) {
      this.saveEmergencyContacts(DEFAULT_NATIONAL_CONTACTS);
      return DEFAULT_NATIONAL_CONTACTS;
    }
    this.saveEmergencyContacts(existing);
    return existing;
  }

  // Cache user profile
  saveUserProfile(user: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (user.emergencyContacts && user.emergencyContacts.length > 0) {
        this.saveEmergencyContacts(user.emergencyContacts);
      }
    } catch (e) {
      console.warn('Failed to cache user profile:', e);
    }
  }

  getCachedUserProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read cached user profile:', e);
    }
    return null;
  }

  // Cache last known location
  saveLastLocation(loc: GeoLocationPoint) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(loc));
    } catch (e) {}
  }

  getLastLocation(): GeoLocationPoint {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      latitude: 28.6139,
      longitude: 77.209,
      address: 'New Delhi Safe Haven District (Cached Offline Telemetry)',
    };
  }

  // Queue SOS alert when offline or network drops
  queueOfflineSOSAlert(alert: {
    location: GeoLocationPoint;
    activationSource: string;
    notes?: string;
  }): QueuedSOSAlert {
    const queue = this.getQueuedAlerts();
    const newAlert: QueuedSOSAlert = {
      localId: `offline_sos_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      activationSource: alert.activationSource,
      location: alert.location,
      notes: alert.notes || 'Emergency assistance requested via Citizen Safety App (Offline Mode).',
      synced: false,
    };

    queue.push(newAlert);
    localStorage.setItem(STORAGE_KEYS.SOS_QUEUE, JSON.stringify(queue));

    // Save as active offline alert
    const contacts = this.getCachedEmergencyContacts();
    const activeOffline: SOSAlert = {
      id: newAlert.localId,
      userId: this.getCachedUserProfile()?.id || 'offline-citizen',
      userName: this.getCachedUserProfile()?.name || 'Protected Citizen',
      userPhone: this.getCachedUserProfile()?.phone || '112',
      status: 'ACTIVE',
      location: newAlert.location,
      countdownSeconds: 0,
      activationSource: newAlert.activationSource as any,
      notifiedContacts: contacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        status: 'SENT' as const,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '[OFFLINE DISPATCH READY] Alert cached in Service Worker/Local Storage. Auto-syncs to central control room once connected.',
    };
    localStorage.setItem(STORAGE_KEYS.ACTIVE_OFFLINE_SOS, JSON.stringify(activeOffline));

    return newAlert;
  }

  getQueuedAlerts(): QueuedSOSAlert[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SOS_QUEUE);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }

  getActiveOfflineSOS(): SOSAlert | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_OFFLINE_SOS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }

  clearActiveOfflineSOS() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_OFFLINE_SOS);
    } catch (e) {}
  }

  // Auto-synchronize pending offline alerts to server when internet returns
  async syncQueuedAlerts(): Promise<{ syncedCount: number; errors: number }> {
    const queue = this.getQueuedAlerts();
    const unsynced = queue.filter((a) => !a.synced);
    if (unsynced.length === 0) return { syncedCount: 0, errors: 0 };

    let syncedCount = 0;
    let errors = 0;

    for (const item of unsynced) {
      try {
        const res = await api.post<SOSAlert>('/sos/trigger', {
          location: item.location,
          activationSource: item.activationSource,
          notes: `[SYNCED FROM OFFLINE DISPATCH] ${item.notes || ''} (Triggered offline at ${new Date(
            item.timestamp
          ).toLocaleTimeString()})`,
        });

        if (res.success && res.data) {
          item.synced = true;
          item.serverId = res.data.id;
          syncedCount++;
        } else {
          errors++;
        }
      } catch (err) {
        errors++;
      }
    }

    // Update stored queue
    localStorage.setItem(STORAGE_KEYS.SOS_QUEUE, JSON.stringify(queue));

    if (syncedCount > 0) {
      triggerHaptic(hapticPatterns.success);
      this.clearActiveOfflineSOS();
    }

    return { syncedCount, errors };
  }

  // Generate Native SMS SOS message that works with 0% data/wifi
  generateOfflineSMS(
    location: GeoLocationPoint,
    user?: UserProfile | null
  ): { message: string; smsUri: string; numbers: string[] } {
    const contacts = this.getCachedEmergencyContacts();
    const numbers = contacts
      .map((c) => c.phone.replace(/[^0-9+]/g, ''))
      .filter((p) => p.length >= 3);

    const userName = user?.name || 'Citizen';
    const mapsLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const message = `🚨 URGENT DISTRESS SOS: This is ${userName}. I need immediate help! My GPS coordinates are: ${mapsLink} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}). Please call police / 112 immediately!`;

    // iOS and Android multi-number SMS URI format
    const numbersStr = numbers.join(navigator.userAgent.match(/iPhone|iPad|iPod/i) ? '&addresses=' : ',');
    const smsUri = `sms:${numbersStr}?body=${encodeURIComponent(message)}`;

    return { message, smsUri, numbers };
  }
}

export const offlineEmergencyCache = new OfflineEmergencyCache();
