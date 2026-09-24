import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, CheckCircle, AlertTriangle, Play, Square, Pause } from 'lucide-react';
import { useSOSStore } from '../store/sosStore';
import { soundEffects } from '../utils/sound';

export const SafetyTimerPage: React.FC = () => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('Walking from Sector 18 Metro to my residence');

  const { triggerImmediateSOS } = useSOSStore();
  const navigate = useNavigate();

  useEffect(() => {
    let interval: any = null;
    if (isActive && remainingSeconds !== null) {
      interval = setInterval(() => {
        if (remainingSeconds <= 1) {
          clearInterval(interval);
          setIsActive(false);
          setRemainingSeconds(null);
          // Auto trigger SOS on timer expiry!
          soundEffects.playBeep(1200, 500);
          triggerImmediateSOS('SAFETY_TIMER_EXPIRED');
          navigate('/sos');
        } else {
          setRemainingSeconds((prev) => (prev !== null ? prev - 1 : null));
          if (remainingSeconds <= 10) {
            soundEffects.playBeep(800, 100);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, remainingSeconds, triggerImmediateSOS, navigate]);

  const handleStartTimer = () => {
    setRemainingSeconds(selectedMinutes * 60);
    setIsActive(true);
    soundEffects.playBeep(880, 200);
  };

  const handleStopTimer = () => {
    setIsActive(false);
    setRemainingSeconds(null);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Walk With Me • Safety Countdown</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Journey Check-in Timer
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Traveling through an unfamiliar or deserted corridor? Set a safety duration. If you don't check in or disarm
          the timer before it reaches zero, SOS distress is automatically triggered.
        </p>
      </div>

      {/* Main Countdown or Duration Picker Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-8">
        {isActive && remainingSeconds !== null ? (
          <div className="space-y-6">
            <div className="w-56 h-56 mx-auto rounded-full bg-amber-500/10 border-8 border-amber-500 flex flex-col items-center justify-center animate-pulse shadow-xl shadow-amber-200">
              <Clock className="w-8 h-8 text-amber-600 mb-1" />
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-[10px] text-amber-700 uppercase tracking-widest font-bold mt-1">
                Active Check-in Window
              </span>
            </div>

            <div className="max-w-md mx-auto p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <p className="font-bold">Trip Note: {notes}</p>
              <p className="mt-0.5 text-amber-700">Tap "I Have Arrived Safely" when you reach your destination.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={handleStopTimer}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>I Have Arrived Safely (Disarm)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Minute Preset Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Journey Duration
              </label>
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                {[5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedMinutes(mins)}
                    className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                      selectedMinutes === mins
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Note about journey */}
            <div className="max-w-md mx-auto text-left">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Journey Description / Route Destination
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Taking cab from office to residence"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleStartTimer}
              className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-sm shadow-xl shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Play className="w-5 h-5" />
              <span>START {selectedMinutes}-MINUTE SAFETY TIMER</span>
            </button>
          </div>
        )}
      </div>

      {/* Safety Timer Advisory */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-2 text-xs">
        <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          <span>How "Walk With Me" Works</span>
        </h4>
        <p className="text-slate-300 leading-relaxed">
          1. The countdown runs in background even if your screen locks.
          <br />
          2. A warning chime sounds during the final 10 seconds.
          <br />
          3. If not stopped, an emergency SOS alert with your GPS coordinates and journey description will be dispatched
          to your guardian emergency contacts and national emergency line.
        </p>
      </div>
    </div>
  );
};
