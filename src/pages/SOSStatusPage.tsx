import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  PhoneCall,
  CheckCircle,
  MapPin,
  Clock,
  XCircle,
  AlertTriangle,
  Radio,
  ExternalLink,
  WifiOff,
  RefreshCw,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { useSOSStore } from '../store/sosStore';
import { useAuthStore } from '../store/authStore';
import { offlineEmergencyCache } from '../utils/offlineEmergencyCache';

export const SOSStatusPage: React.FC = () => {
  const {
    activeSOS,
    countdown,
    cancelCountdown,
    triggerImmediateSOS,
    resolveActiveSOS,
    isSirenPlaying,
    toggleSiren,
    fetchActiveSOS,
    syncOfflineQueue,
    queuedAlertsCount,
    isOfflineMode,
  } = useSOSStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [resolutionReason, setResolutionReason] = useState('I am safe now / False alarm resolved');
  const [resolving, setResolving] = useState(false);

  const isOfflineAlert =
    isOfflineMode ||
    (activeSOS && activeSOS.notes?.includes('[OFFLINE DISPATCH READY]')) ||
    (typeof navigator !== 'undefined' && !navigator.onLine);

  const smsData = activeSOS
    ? offlineEmergencyCache.generateOfflineSMS(activeSOS.location, user)
    : null;

  useEffect(() => {
    fetchActiveSOS();
  }, [fetchActiveSOS]);

  const handleResolve = async () => {
    setResolving(true);
    const res = await resolveActiveSOS(resolutionReason);
    setResolving(false);
    if (res.success) {
      navigate('/home');
    }
  };

  // View: In Countdown Mode
  if (countdown !== null && countdown > 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-8">
        <div className="w-48 h-48 mx-auto rounded-full bg-red-600/10 border-8 border-red-500 flex flex-col items-center justify-center animate-pulse">
          <Clock className="w-10 h-10 text-red-600 mb-1" />
          <span className="text-6xl font-black text-red-600">{countdown}</span>
          <span className="text-xs uppercase tracking-widest text-red-700 font-bold">Seconds Left</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Broadcasting Distress Alert...</h2>
          <p className="text-xs text-slate-500">
            Emergency distress coordinates will be dispatched to guardians &amp; emergency centers when countdown
            reaches 0.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={cancelCountdown}
            className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <XCircle className="w-5 h-5 text-rose-400" />
            <span>CANCEL SOS (False Alarm)</span>
          </button>

          <button
            onClick={() => triggerImmediateSOS('ONE_TOUCH_BUTTON')}
            className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Skip Countdown &amp; Dispatch Now</span>
          </button>
        </div>
      </div>
    );
  }

  // View: Active SOS Broadcast
  if (activeSOS && activeSOS.status === 'ACTIVE') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Active Emergency Card */}
        <div className="bg-red-600 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
          {/* Offline Resilient Notice if applicable */}
          {isOfflineAlert && (
            <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md font-bold">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider font-black">
                    Armed via Offline Service Worker Cache
                  </p>
                  <p className="text-[11px] font-medium text-slate-900 mt-0.5">
                    Distress alert is preserved locally and siren is sounding. Will auto-sync when internet reconnects.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {smsData && smsData.smsUri && (
                  <a
                    href={smsData.smsUri}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Send SMS Directly</span>
                  </a>
                )}
                {queuedAlertsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => syncOfflineQueue()}
                    className="px-3 py-1.5 bg-white text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-slate-100"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Now</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/60 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shrink-0">
                <Radio className="w-7 h-7 animate-ping" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold bg-red-700 px-2 py-0.5 rounded-full">
                  LIVE EMERGENCY BEACON ACTIVE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  Distress Broadcast in Progress
                </h2>
              </div>
            </div>

            {/* Siren Audio Toggle */}
            <button
              onClick={toggleSiren}
              className="px-4 py-2.5 bg-red-700 hover:bg-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-red-400 transition-colors"
            >
              {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSirenPlaying ? 'Mute Siren Audio' : 'Play Loud Siren'}</span>
            </button>
          </div>

          {/* Telemetry Coords & Live Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-red-700/60 p-4 rounded-2xl space-y-1">
              <p className="text-red-200 font-semibold uppercase tracking-wider text-[10px]">Transmitted GPS Telemetry</p>
              <p className="text-base font-black">
                {activeSOS.location.latitude.toFixed(5)}° N, {activeSOS.location.longitude.toFixed(5)}° E
              </p>
              <p className="text-red-200">{activeSOS.location.address}</p>
            </div>

            <div className="bg-red-700/60 p-4 rounded-2xl space-y-1">
              <p className="text-red-200 font-semibold uppercase tracking-wider text-[10px]">Activation Metadata</p>
              <p className="text-base font-black">
                {new Date(activeSOS.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-red-200">Trigger Source: {activeSOS.activationSource.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Contact Dispatch Log */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-red-200 mb-2">
              Guardian Notification Status
            </h4>
            <div className="space-y-2">
              {activeSOS.notifiedContacts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-700/40 border border-red-500/40 text-xs"
                >
                  <span className="font-bold">
                    {c.name} ({c.phone})
                  </span>
                  <span className="bg-red-800 text-red-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resolution Control */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">Resolve Distress Session</h3>
          <p className="text-xs text-slate-500">
            Once you have reached safety or if this distress call was triggered inadvertently, inform the network by
            resolving the alert.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resolution Note / Status
            </label>
            <input
              type="text"
              value={resolutionReason}
              onChange={(e) => setResolutionReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleResolve}
            disabled={resolving}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{resolving ? 'Disarming Alert...' : 'I AM SAFE NOW — RESOLVE SOS'}</span>
          </button>
        </div>
      </div>
    );
  }

  // View: No active SOS
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
        <CheckCircle className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">All Quiet • No Active SOS</h2>
        <p className="text-xs text-slate-500 mt-1">
          Your emergency coordinates are not broadcasting. If you need assistance, tap the emergency panic button.
        </p>
      </div>
      <button
        onClick={() => navigate('/emergency')}
        className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow transition-colors cursor-pointer"
      >
        Go to SOS Emergency Panel
      </button>
    </div>
  );
};
