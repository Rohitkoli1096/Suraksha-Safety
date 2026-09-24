import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Grid,
  UserCheck,
  Shield,
  Clock,
  Car,
  Heart,
  X,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic, hapticPatterns } from '../utils/haptics';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CallerType = 'MOM' | 'POLICE' | 'CAB' | 'BROTHER';

interface Preset {
  id: CallerType;
  name: string;
  number: string;
  role: string;
  avatar: string;
  script: string;
}

const PRESETS: Record<CallerType, Preset> = {
  MOM: {
    id: 'MOM',
    name: 'Mom ❤️',
    number: '+91 98111 44556',
    role: 'Family Emergency Contact',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    script: 'Hello beta, where are you right now? Dad and I have just reached outside on the main road. The car is right by the streetlight. Are you coming down right now? We are waiting for you!',
  },
  POLICE: {
    id: 'POLICE',
    name: 'Insp. Sharma (Delhi Police)',
    number: '112 / PCR Beat 4',
    role: 'Central Municipal Dispatch',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    script: 'Suraksha Control Room desk. Madam, your local beat patrol cruiser is stationed 200 meters ahead with flashing beacons. Please walk straight toward the patrol vehicle.',
  },
  CAB: {
    id: 'CAB',
    name: 'Suresh (Verified Cab Driver)',
    number: '+91 97112 88990',
    role: 'Sedan • DL 1Y 4821',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    script: 'Hello ma’am, I have reached your pickup spot. I have turned on the hazard blinkers right in front of the convenience store. Please hurry, I am waiting.',
  },
  BROTHER: {
    id: 'BROTHER',
    name: 'Aman (Brother)',
    number: '+91 98991 12345',
    role: 'Family Guardian',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
    script: 'Hey! I am literally 2 minutes away from your location on my bike. Stay right where you are, do not go anywhere alone. I can see your GPS dot!',
  },
};

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ isOpen, onClose }) => {
  const [selectedCaller, setSelectedCaller] = useState<CallerType>('MOM');
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [pendingTimer, setPendingTimer] = useState<number | null>(null);
  const [callState, setCallState] = useState<'IDLE' | 'WAITING_TIMER' | 'RINGING' | 'CONNECTED'>('IDLE');
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);

  // Play synthetic telephone ring tone using Web Audio API
  const playPhoneRing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      // Classic Indian/UK dual tone 400Hz + 450Hz
      osc1.frequency.setValueAtTime(400, ctx.currentTime);
      osc2.frequency.setValueAtTime(450, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.6);
      osc2.stop(ctx.currentTime + 1.6);
    } catch {
      // AudioContext not allowed before user interaction
    }
  };

  // Start ringing
  const startRinging = () => {
    setCallState('RINGING');
    triggerHaptic(hapticPatterns.incomingCall);
    playPhoneRing();

    ringIntervalRef.current = window.setInterval(() => {
      playPhoneRing();
      triggerHaptic(hapticPatterns.incomingCall);
    }, 2800);
  };

  const stopRinging = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  };

  // Trigger delayed or immediate call
  const handleLaunchCall = () => {
    if (delaySeconds === 0) {
      startRinging();
    } else {
      setCallState('WAITING_TIMER');
      setPendingTimer(delaySeconds);
    }
  };

  // Handle countdown if user picked 15s or 30s
  useEffect(() => {
    if (callState === 'WAITING_TIMER' && pendingTimer !== null) {
      if (pendingTimer <= 0) {
        setPendingTimer(null);
        startRinging();
        return;
      }
      const t = setTimeout(() => {
        setPendingTimer(pendingTimer - 1);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [callState, pendingTimer]);

  // Answer call
  const handleAnswerCall = () => {
    stopRinging();
    setCallState('CONNECTED');
    setCallSeconds(0);
    triggerHaptic(hapticPatterns.tap);

    // Speak synthetic voice script through browser speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(PRESETS[selectedCaller].script);
      utterance.rate = 0.95;
      utterance.pitch = selectedCaller === 'MOM' ? 1.2 : 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Call duration counter
  useEffect(() => {
    let interval: number;
    if (callState === 'CONNECTED') {
      interval = window.setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // End or dismiss call
  const handleHangup = () => {
    stopRinging();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('IDLE');
    setCallSeconds(0);
    onClose();
  };

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const currentPreset = PRESETS[selectedCaller];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-all">
      {/* 1. Setup / Trigger Screen */}
      {callState === 'IDLE' && (
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Decoy Fake Call Simulator</h3>
                <p className="text-[11px] text-slate-500">Trigger a discreet decoy call to exit unsafe scenarios</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Caller Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Select Discreet Caller
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(PRESETS) as CallerType[]).map((type) => {
                const p = PRESETS[type];
                const isSelected = selectedCaller === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedCaller(type)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{p.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timing Delays */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Trigger Delay
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Instant', seconds: 0 },
                { label: 'In 15 Sec', seconds: 15 },
                { label: 'In 30 Sec', seconds: 30 },
              ].map((d) => (
                <button
                  key={d.seconds}
                  type="button"
                  onClick={() => setDelaySeconds(d.seconds)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    delaySeconds === d.seconds
                      ? 'bg-slate-900 text-white border-slate-900 shadow'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Script Preview */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 block">
              Spoken Audio Script When Answered:
            </span>
            <p className="italic text-slate-700">"{currentPreset.script}"</p>
          </div>

          {/* Action Trigger */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLaunchCall}
              className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Phone className="w-4 h-4 animate-bounce" />
              <span>{delaySeconds === 0 ? 'Trigger Call Now' : `Schedule Call (${delaySeconds}s)`}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Scheduled Countdown Waiting State */}
      {callState === 'WAITING_TIMER' && (
        <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-4 border border-slate-800">
          <Clock className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
          <h4 className="text-xl font-black">Decoy Call Armed</h4>
          <p className="text-xs text-slate-300">
            Keep your phone visible. <span className="font-bold text-white">{currentPreset.name}</span> will ring in:
          </p>
          <div className="text-5xl font-black text-emerald-400 font-mono tracking-wider">
            {pendingTimer}s
          </div>
          <button
            onClick={handleHangup}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
          >
            Cancel Decoy Call
          </button>
        </div>
      )}

      {/* 3. Realistic Native Incoming Call Screen */}
      {callState === 'RINGING' && (
        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white rounded-[40px] max-w-xs sm:max-w-sm w-full h-[620px] p-6 shadow-2xl flex flex-col justify-between items-center border border-slate-800 relative overflow-hidden animate-in fade-in zoom-in-95">
          {/* Top Status */}
          <div className="text-center pt-8 space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">Incoming Call</span>
            <h3 className="text-2xl font-black tracking-tight">{currentPreset.name}</h3>
            <p className="text-xs text-slate-300 font-medium">{currentPreset.number}</p>
            <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {currentPreset.role}
            </span>
          </div>

          {/* Avatar with pulse ring */}
          <div className="relative my-auto">
            <div className="w-32 h-32 rounded-full border-4 border-indigo-500/50 p-1 animate-pulse">
              <img
                src={currentPreset.avatar}
                alt={currentPreset.name}
                className="w-full h-full rounded-full object-cover shadow-2xl"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
              <Phone className="w-4 h-4" />
            </div>
          </div>

          {/* Bottom Accept / Decline Actions */}
          <div className="w-full pb-8 flex items-center justify-around">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleHangup}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-900/50 cursor-pointer active:scale-95 transition-transform"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs text-slate-400 font-semibold">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleAnswerCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 cursor-pointer active:scale-95 transition-transform animate-bounce"
              >
                <Phone className="w-7 h-7" />
              </button>
              <span className="text-xs text-emerald-400 font-bold">Answer</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Realistic Connected Call Screen */}
      {callState === 'CONNECTED' && (
        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white rounded-[40px] max-w-xs sm:max-w-sm w-full h-[620px] p-6 shadow-2xl flex flex-col justify-between items-center border border-slate-800 relative animate-in fade-in">
          {/* Header & Call Duration */}
          <div className="text-center pt-8 space-y-1">
            <h3 className="text-2xl font-black tracking-tight">{currentPreset.name}</h3>
            <p className="text-xs text-emerald-400 font-mono tracking-widest">{formatCallTime(callSeconds)}</p>
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-medium">
              Call Connected • Audio Active
            </span>
          </div>

          {/* Caller Photo */}
          <div className="my-auto">
            <div className="w-24 h-24 rounded-full border-2 border-slate-700 overflow-hidden shadow-xl mx-auto">
              <img src={currentPreset.avatar} alt={currentPreset.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-3 max-w-[220px] mx-auto italic">
              Hold phone to ear and respond naturally to excuse yourself.
            </p>
          </div>

          {/* Grid of in-call buttons */}
          <div className="w-full space-y-6 pb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl ${
                  isMuted ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-[10px] mt-1 font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 text-white"
              >
                <Grid className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">Keypad</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl ${
                  isSpeaker ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">Speaker</span>
              </button>
            </div>

            {/* End Call Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleHangup}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-900/50 cursor-pointer active:scale-95 transition-transform"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
