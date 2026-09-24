import React from 'react';
import { Mic, MicOff, Smartphone, Radio } from 'lucide-react';
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
          isListening
            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-300 shadow-2xs hover:bg-emerald-500/20'
            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
        } ${className}`}
        title={`Voice SOS: ${isListening ? 'Active (Keyword: ' + config.keyword + ')' : 'Tap to configure & enable'}`}
      >
        {isListening ? (
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        ) : (
          <Mic className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span className="hidden sm:inline">
          {isListening ? `Voice SOS: "${config.keyword}"` : 'Voice SOS'}
        </span>
        <span className="sm:hidden">
          {isListening ? 'Voice SOS ON' : 'Voice SOS'}
        </span>
        {isListening && isPocketModeActive && (
          <span title="Pocket Mode Active" className="inline-flex items-center">
            <Smartphone className="w-3 h-3 text-indigo-600" />
          </span>
        )}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between shadow-xs cursor-pointer ${
          isListening
            ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/80'
            : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
        } ${className}`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isListening ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isListening ? (
              <Mic className="w-5 h-5 animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                Voice SOS Trigger (Web Speech)
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isListening
                    ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isListening ? 'Active' : 'Configure'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isListening
                ? `Say "${config.keyword}" anytime (Pocket Mode: ${isPocketModeActive ? 'Armed' : 'Off'})`
                : 'Hands-free emergency activation via custom spoken keyword'}
            </p>
          </div>
        </div>
        <div className="text-right pl-3 shrink-0">
          <span className="text-xs font-bold text-indigo-600">Open Controls &rarr;</span>
        </div>
      </button>
    );
  }

  // compact default
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
        isListening
          ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 animate-pulse'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
      } ${className}`}
      title="Hands-free Voice SOS trigger settings"
    >
      {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4 text-slate-500" />}
      <span className="hidden lg:inline">
        {isListening ? `Voice SOS ("${config.keyword}")` : 'Voice SOS'}
      </span>
      <span className="lg:hidden">Voice SOS</span>
    </button>
  );
};
