import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Shield,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Volume2,
  X,
  Radio,
  Sliders,
  Sparkles,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useVoiceSOSStore } from '../store/voiceSOSStore';
import { triggerHaptic, hapticPatterns } from '../utils/haptics';

interface VoiceSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KEYWORD_PRESETS = [
  { label: 'Bachao (Hindi)', value: 'bachao' },
  { label: 'Help Me (English)', value: 'help me' },
  { label: 'Emergency 112', value: 'emergency' },
  { label: 'Red Alert', value: 'red alert' },
  { label: 'Suraksha', value: 'suraksha' },
];

export const VoiceSOSModal: React.FC<VoiceSOSModalProps> = ({ isOpen, onClose }) => {
  const {
    isSupported,
    isListening,
    isPocketModeActive,
    wakeLockActive,
    audioLevel,
    lastTranscript,
    matchedEvent,
    error,
    config,
    startListening,
    stopListening,
    toggleListening,
    updateConfig,
    testTrigger,
    clearError,
  } = useVoiceSOSStore();

  const [keywordInput, setKeywordInput] = useState(config.keyword);
  const [testTriggerFired, setTestTriggerFired] = useState(false);

  if (!isOpen) return null;

  const handleSaveKeyword = (newKeyword: string) => {
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed) return;
    setKeywordInput(trimmed);
    updateConfig({ keyword: trimmed });
    triggerHaptic(hapticPatterns.tap);
  };

  const handleToggleListening = async () => {
    triggerHaptic(hapticPatterns.tap);
    await toggleListening();
  };

  const handleTestSimulated = async () => {
    triggerHaptic(hapticPatterns.sosTrigger);
    setTestTriggerFired(true);
    await testTrigger(config.keyword);
    setTimeout(() => setTestTriggerFired(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>Web Speech API • Pocket &amp; Locked Protection</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Voice SOS Emergency Trigger</span>
            </h2>
            <p className="text-xs text-slate-300">
              Trigger instant SOS alerts hands-free by speaking your safety keyword, even with phone in pocket or screen locked.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Browser Support Check */}
          {!isSupported && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Web Speech API Notice</p>
                <p className="text-slate-600 mt-0.5">
                  Your browser does not natively support continuous Web Speech Recognition. Chrome on Android or desktop browsers offer full support. You can still test simulated triggers and calibrate settings.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-[11px] font-bold underline hover:text-rose-950 ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Master Trigger Banner */}
          <div
            className={`p-5 rounded-3xl border transition-all ${
              isListening
                ? 'bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border-emerald-400 shadow-sm'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                    isListening
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isListening ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base">
                      {isListening ? 'Voice SOS Armed & Listening' : 'Voice SOS Guardian Inactive'}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isListening
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isListening ? 'Live' : 'Standby'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isListening
                      ? `Listening for keyword: "${config.keyword}" (or "bachao" / "help")`
                      : 'Activate to enable hands-free voice-triggered emergency alerts'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleListening}
                className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Start Voice SOS</span>
                  </>
                )}
              </button>
            </div>

            {/* Audio Waveform Level Indicator when listening */}
            {isListening && (
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Mic Audio Level</span>
                  </span>
                  <span className="text-slate-700">{audioLevel}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-75"
                    style={{ width: `${Math.max(4, audioLevel)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pocket & Locked Screen Persistence Controls */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Pocket &amp; Screen-Lock Mode
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Runs silent Web Audio loop &amp; MediaSession to prevent mobile browser suspension when screen is off.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.pocketMode}
                onChange={(e) => updateConfig({ pocketMode: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mt-1"
              />
            </div>

            {config.pocketMode && (
              <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-600 border-t border-slate-200">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>MediaSession Active</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WakeLock {wakeLockActive ? 'Held' : 'Auto'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Keyword Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Custom Emergency Keyword</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Say this phrase to trigger SOS</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="e.g. bachao, help, red alert"
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden font-semibold"
              />
              <button
                type="button"
                onClick={() => handleSaveKeyword(keywordInput)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Set Keyword
              </button>
            </div>

            {/* Keyword Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Presets:
              </span>
              {KEYWORD_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleSaveKeyword(preset.value)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    config.keyword.toLowerCase() === preset.value.toLowerCase()
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sensitivity & Language Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sensitivity */}
            <div>
              <label className="block font-bold text-xs text-slate-700 mb-1">
                Recognition Sensitivity
              </label>
              <select
                value={config.sensitivity}
                onChange={(e) => updateConfig({ sensitivity: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-medium"
              >
                <option value="HIGH">High (Fuzzy Match + Any Emergency Word)</option>
                <option value="BALANCED">Balanced (Custom Keyword + Core Distress Words)</option>
                <option value="LOW">Strict (Exact Custom Keyword Only)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Balanced allows minor pronunciation variations and Hindi &amp; English distress words.
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="block font-bold text-xs text-slate-700 mb-1">
                Speech Accent / Language
              </label>
              <select
                value={config.language}
                onChange={(e) => updateConfig({ language: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-medium"
              >
                <option value="en-IN">English (India) - en-IN</option>
                <option value="hi-IN">Hindi (India) - hi-IN</option>
                <option value="en-US">English (US) - en-US</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Optimizes phonetics for regional accents and multilingual speech.
              </p>
            </div>
          </div>

          {/* Live Transcript Box & Match Feedback */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Speech Transcript:</span>
              </span>
              {matchedEvent && (
                <span className="text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase font-black">
                  Match: &quot;{matchedEvent.matchedKeyword}&quot;
                </span>
              )}
            </div>
            <p className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl min-h-[44px] text-slate-300 border border-slate-800/80 break-words">
              {lastTranscript ? (
                <span>&ldquo;{lastTranscript}&rdquo;</span>
              ) : (
                <span className="text-slate-500 italic">
                  {isListening
                    ? 'Speak clearly into your microphone to test keyword recognition...'
                    : 'Start Voice SOS listening to see real-time speech transcription.'}
                </span>
              )}
            </p>
          </div>

          {/* Pocket Mode Technical Explanation Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>How Pocket &amp; Locked-Screen Protection Works</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              <li>
                <strong>Background MediaSession:</strong> Mobile browsers keep audio and speech processing active while media session runs.
              </li>
              <li>
                <strong>Tactile Haptics:</strong> Strong pulsed vibration pattern confirms the SOS triggered without looking at your screen.
              </li>
              <li>
                <strong>Voice Confirmation:</strong> Announces dispatch confirmation aloud through phone speaker or connected earphones.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestSimulated}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{testTriggerFired ? 'Trigger Fired! Checking Alert...' : 'Test Simulated SOS Trigger'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Done &amp; Keep Listening
          </button>
        </div>
      </div>
    </div>
  );
};
