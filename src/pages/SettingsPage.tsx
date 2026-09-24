import React, { useEffect, useState } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  MapPin,
  Smartphone,
  Shield,
  Moon,
  CheckCircle,
  Save,
  Download,
  WifiOff,
  RefreshCw,
  Trash2,
  Database,
} from 'lucide-react';
import { api } from '../api/client';
import { UserSettings } from '../types';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import { offlineEmergencyCache } from '../utils/offlineEmergencyCache';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { queuedAlertsCount, syncOfflineQueue } = useSOSStore();
  const { isInstallable, isInstalled } = usePWAInstall();

  const [cachedContacts, setCachedContacts] = useState(() =>
    offlineEmergencyCache.getCachedEmergencyContacts()
  );
  const [offlineSyncMessage, setOfflineSyncMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings>({
    userId: '',
    sosCountdownDurationSeconds: 5,
    sirenAudioEnabled: true,
    autoShareLocationOnSOS: true,
    smsAlertsEnabled: true,
    pushNotificationsEnabled: true,
    shakeToSOSGestureEnabled: true,
    highContrastTheme: false,
    theme: 'system',
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const res = await api.get<UserSettings>('/user/settings');
      if (res.success && res.data) {
        setSettings(res.data);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.put('/user/settings', settings);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          System Preferences &amp; Safety Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configure hardware trigger sensitivities, emergency audible siren, and notification dispatch behaviors.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Safety settings saved to database.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Emergency SOS Controls */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Emergency SOS Parameters</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Countdown Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">SOS Countdown Duration</span>
                <span className="font-black text-rose-600 text-sm">
                  {settings.sosCountdownDurationSeconds} seconds
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                step={1}
                value={settings.sosCountdownDurationSeconds}
                onChange={(e) =>
                  setSettings({ ...settings, sosCountdownDurationSeconds: Number(e.target.value) })
                }
                className="w-full accent-rose-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Grace period to cancel accidental button presses before alarm and emergency SMS dispatch.
              </p>
            </div>

            {/* Siren Audio Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Loud Panic Siren Audio</p>
                <p className="text-[11px] text-slate-500">
                  Plays a high-decibel warbling alarm through phone speaker to disorient attackers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.sirenAudioEnabled}
                onChange={(e) => setSettings({ ...settings, sirenAudioEnabled: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded"
              />
            </div>

            {/* Auto GPS Sharing */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Automatic Continuous GPS Sharing</p>
                <p className="text-[11px] text-slate-500">
                  Continues updating live coordinates in background during active distress.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoShareLocationOnSOS}
                onChange={(e) => setSettings({ ...settings, autoShareLocationOnSOS: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded"
              />
            </div>

            {/* Shake Gesture */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Shake to SOS (Hardware Sensor)</p>
                <p className="text-[11px] text-slate-500">
                  Rapidly shaking your smartphone 3 times triggers distress countdown silently.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.shakeToSOSGestureEnabled}
                onChange={(e) => setSettings({ ...settings, shakeToSOSGestureEnabled: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Notification & Dispatch Channels */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Notification &amp; Dispatch Channels</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">SMS Alert to Guardians</p>
                <p className="text-[11px] text-slate-500">
                  Sends verified location link to emergency contacts via SMS gateway.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsAlertsEnabled}
                onChange={(e) => setSettings({ ...settings, smsAlertsEnabled: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Browser &amp; Push Notifications</p>
                <p className="text-[11px] text-slate-500">
                  Receive status changes on your hazard reports and neighborhood warnings.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotificationsEnabled}
                onChange={(e) => setSettings({ ...settings, pushNotificationsEnabled: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Service Worker & Offline Emergency Cache */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Service Worker &amp; Offline SOS Resilience</span>
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              PWA Active
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Critical emergency contacts and SOS dispatch capabilities are cached locally via modern Service Worker
            and encrypted local state. When internet connectivity is unstable or completely dropped, your SOS alarms,
            audible sirens, and native SMS fallbacks remain fully functional.
          </p>

          {offlineSyncMessage && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs rounded-xl font-medium">
              {offlineSyncMessage}
            </div>
          )}

          {/* Cached Contacts Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Locally Cached Contacts for Offline SOS:</span>
              <span className="font-extrabold text-indigo-600">{cachedContacts.length} Contacts Cached</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {cachedContacts.map((c, i) => (
                <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-[11px] text-slate-500">{c.relationship || 'Guardian'}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {c.phone}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (user?.emergencyContacts && user.emergencyContacts.length > 0) {
                    offlineEmergencyCache.cacheEmergencyContacts(user.emergencyContacts);
                    setCachedContacts(offlineEmergencyCache.getCachedEmergencyContacts());
                    setOfflineSyncMessage('Emergency contacts freshly synced to Service Worker cache.');
                  } else {
                    offlineEmergencyCache.ensureDefaultsCached();
                    setCachedContacts(offlineEmergencyCache.getCachedEmergencyContacts());
                    setOfflineSyncMessage('Default national emergency hotlines (112, 1091) cached.');
                  }
                  setTimeout(() => setOfflineSyncMessage(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Cache Contacts</span>
              </button>

              {queuedAlertsCount > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    const count = await syncOfflineQueue();
                    setOfflineSyncMessage(`Synced ${count} queued alert(s) to central server.`);
                    setTimeout(() => setOfflineSyncMessage(null), 3000);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Queued Alerts ({queuedAlertsCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* App Installation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-indigo-50 to-rose-50 rounded-2xl border border-indigo-100">
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900">
                {isInstalled ? 'Suraksha PWA is Installed' : 'Install Suraksha as Native App'}
              </p>
              <p className="text-[11px] text-slate-600">
                Install to home screen for instant one-touch panic access, offline caching, and faster load times.
              </p>
            </div>
            {!isInstalled && (
              <div className="shrink-0">
                <PWAInstallButton />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
