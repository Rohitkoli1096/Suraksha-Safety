import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Volume2,
  Users,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Phone,
  Wifi,
  WifiOff,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import { triggerHaptic, hapticPatterns } from '../utils/haptics';
import { FakeCallModal } from '../components/FakeCallModal';
import { EmergencyQuickShare } from '../components/EmergencyQuickShare';
import { AudioEvidenceRecorder } from '../components/AudioEvidenceRecorder';
import { VoiceSOSTriggerButton } from '../components/VoiceSOSTriggerButton';
import { useVoiceSOSStore } from '../store/voiceSOSStore';
import { offlineEmergencyCache } from '../utils/offlineEmergencyCache';

export const EmergencyPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    activeSOS,
    isTriggering,
    countdown,
    startSOSCountdown,
    cancelCountdown,
    triggerImmediateSOS,
    currentLocation,
    isOfflineMode,
    queuedAlertsCount,
    syncOfflineQueue,
  } = useSOSStore();

  const navigate = useNavigate();
  const [selectedQuickReason, setSelectedQuickReason] = useState<string>('Immediate Physical Threat / Stalking');
  const [fakeCallOpen, setFakeCallOpen] = useState(false);

  const cachedContacts = offlineEmergencyCache.getCachedEmergencyContacts();
  const totalContactsCount = (user?.emergencyContacts?.length || 0) > 0
    ? user?.emergencyContacts?.length
    : cachedContacts.length;

  const reasons = [
    'Immediate Physical Threat / Stalking',
    'Feeling Unsafe in Transit / Cab',
    'Accident / Medical Distress',
    'Stranded in Dark Deserted Area',
  ];

  const handleStartSOS = () => {
    triggerHaptic(hapticPatterns.sosTrigger);
    startSOSCountdown(5);
    navigate('/sos');
  };

  const handleInstantDispatch = async () => {
    triggerHaptic(hapticPatterns.sosTrigger);
    await triggerImmediateSOS('ONE_TOUCH_BUTTON');
    navigate('/sos');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>Suraksha Emergency Distress Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Distress SOS Trigger
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Pressing the SOS button initiates an alarm, immediately notifies your {totalContactsCount}{' '}
          guardians, and broadcasts your live GPS location.
        </p>

        {/* Service Worker SOS & Emergency Contact Caching Indicator */}
        <div className="max-w-xl mx-auto bg-slate-900 text-white p-3 sm:p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 text-left">
            <div className={`w-9 h-9 rounded-xl ${isOfflineMode ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'} flex items-center justify-center shrink-0`}>
              {isOfflineMode ? <WifiOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm">
                  {isOfflineMode ? 'Offline Resilient SOS Armed' : 'Service Worker SOS Caching Active'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                  SW Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {totalContactsCount} emergency contacts &amp; 112 hotline cached for unstable network triggering
              </p>
            </div>
          </div>
          {queuedAlertsCount > 0 && (
            <button
              type="button"
              onClick={() => syncOfflineQueue()}
              className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer shadow-xs"
            >
              Sync ({queuedAlertsCount})
            </button>
          )}
        </div>
      </div>

      {/* Main Giant Panic Button Area */}
      <div className="bg-gradient-to-b from-red-500/10 via-rose-500/5 to-white p-8 sm:p-14 rounded-3xl border border-red-200 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xl shadow-red-100">
        {/* Radar concentric rings */}
        <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-red-300/50 animate-ping pointer-events-none" />
        <div className="absolute w-52 sm:w-72 h-52 sm:h-72 rounded-full border border-red-400/40 pointer-events-none" />

        <button
          onClick={handleStartSOS}
          disabled={isTriggering}
          className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-black text-2xl sm:text-3xl shadow-2xl shadow-red-600/60 flex flex-col items-center justify-center gap-2 active:scale-90 transition-transform cursor-pointer border-8 border-white ring-8 ring-red-100"
        >
          <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 animate-pulse" />
          <span className="tracking-wider">SOS PANIC</span>
          <span className="text-[10px] sm:text-xs font-medium text-red-100 uppercase tracking-widest -mt-1">
            Tap for 5s Timer
          </span>
        </button>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <button
            onClick={handleInstantDispatch}
            className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center gap-2 cursor-pointer transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Instant Dispatch (Skip 5s Countdown)</span>
          </button>

          <button
            onClick={() => setFakeCallOpen(true)}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Discreet Decoy Escape Call</span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 relative z-10">
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>
            Current GPS telemetry verified:{' '}
            {currentLocation
              ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
              : 'Acquiring GPS...'}
          </span>
        </div>
      </div>

      {/* Emergency Distress Reason Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 mb-3">
          Optional Distress Context (Transmitted to Emergency Responders)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedQuickReason(r)}
              className={`p-3 rounded-xl text-xs font-medium text-left transition-all border ${
                selectedQuickReason === r
                  ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Hands-Free Voice SOS Trigger Card (Pocket & Screen-Lock Armed) */}
      <VoiceSOSTriggerButton variant="full" />

      {/* Native Offline & Low-Connectivity One-Tap Dispatch */}
      <EmergencyQuickShare />

      {/* Ambient Audio Evidence Capture */}
      <AudioEvidenceRecorder />

      {/* Direct Emergency Telephone Hotlines */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Official Indian Emergency Hotlines (Toll-Free 24/7)
          </h3>
          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
            Govt. Direct Integration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="tel:112"
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 text-rose-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-lg text-white">112</p>
              <p className="text-xs text-slate-300">National Emergency System</p>
            </div>
          </a>

          <a
            href="tel:1091"
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-600/30 text-pink-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-lg text-white">1091</p>
              <p className="text-xs text-slate-300">Women Helpline Toll-Free</p>
            </div>
          </a>

          <a
            href="tel:100"
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-lg text-white">100</p>
              <p className="text-xs text-slate-300">Police Patrol Dispatch</p>
            </div>
          </a>
        </div>
      </div>

      {/* Decoy Call Simulator */}
      <FakeCallModal isOpen={fakeCallOpen} onClose={() => setFakeCallOpen(false)} />
    </div>
  );
};
