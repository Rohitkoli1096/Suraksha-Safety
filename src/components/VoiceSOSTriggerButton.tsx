import React from 'react';
import { Mic, MicOff, Smartphone, Radio, Settings2, ShieldCheck } from 'lucide-react';
import { useVoiceSOSStore } from '../store/voiceSOSStore';

interface VoiceSOSTriggerButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'badge';
  onOpenModal?: () => void;
}

export const VoiceSOSTriggerButton: React.FC<VoiceSOSTriggerButtonProps> = ({
  className = '',
  variant = 'compact',
  onOpenModal,
}) => {
  const { isListening, isPocketModeActive, config, setModalOpen } = useVoiceSOSStore();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenModal) {
      onOpenModal();
    } else {
      setModalOpen(true);
    }
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          isListening
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/80'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
        } ${className}`}
        title={`Hands-Free Voice SOS: ${isListening ? 'Armed (Keyword: "' + config.keyword + '")' : 'Configure keyword'}`}
      >
        {isListening ? (
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        ) : (
          <Mic className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span className="hidden sm:inline">
          {isListening ? `Voice SOS: "${config.keyword}"` : 'Voice SOS'}
        </span>
        <span className="sm:hidden font-medium">
          {isListening ? 'Voice SOS ON' : 'Voice SOS'}
        </span>
        {isListening && isPocketModeActive && (
          <span title="Pocket Detection Armed" className="inline-flex items-center text-slate-400">
            <Smartphone className="w-3 h-3 text-indigo-600" />
          </span>
        )}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div
        onClick={handleClick}
        className={`w-full p-4 sm:p-5 rounded-2xl border transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-slate-900 text-white border-slate-800 hover:border-slate-700 shadow-md ${className}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isListening ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isListening ? (
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">
                Hands-Free Voice SOS Guardian
              </h4>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isListening
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isListening ? 'MONITORING ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Keyword: <strong className="text-emerald-400 font-semibold font-mono">"{config.keyword}"</strong></span>
              <span className="text-slate-600">•</span>
              <span>Pocket Mode: <strong className="text-slate-200">{isPocketModeActive ? 'Armed' : 'Off'}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Web Speech Engine</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure</span>
          </button>
        </div>
      </div>
    );
  }

  // compact default
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
        isListening
          ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
      } ${className}`}
      title="Hands-free Voice SOS trigger settings"
    >
      {isListening ? <Radio className="w-3.5 h-3.5 animate-pulse" /> : <Mic className="w-3.5 h-3.5 text-slate-500" />}
      <span className="hidden lg:inline">
        {isListening ? `Voice SOS ("${config.keyword}")` : 'Voice SOS'}
      </span>
      <span className="lg:hidden">Voice SOS</span>
    </button>
  );
};
