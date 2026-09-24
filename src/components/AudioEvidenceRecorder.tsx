import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  Trash2,
  Send,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic, hapticPatterns } from '../utils/haptics';

interface AudioEvidenceRecorderProps {
  onAudioSaved?: (blobUrl: string, durationSec: number) => void;
  compact?: boolean;
}

export const AudioEvidenceRecorder: React.FC<AudioEvidenceRecorderProps> = ({
  onAudioSaved,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Start recording
  const startRecording = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onAudioSaved) {
          onAudioSaved(url, recordDuration);
        }
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordDuration(0);
      triggerHaptic(hapticPatterns.sosCountdown);

      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Audio recording failed:', err);
      setPermissionError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      triggerHaptic(hapticPatterns.tap);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Toggle playback
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isRecording
          ? 'bg-red-50/90 border-red-300 ring-2 ring-red-200 shadow-md'
          : 'bg-white border-slate-200 shadow-xs'
      } ${compact ? 'p-3' : 'p-5'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
              {isRecording ? 'Recording Discreet Audio Evidence' : 'Discreet Ambient Audio Recorder'}
            </h4>
            <p className="text-[11px] text-slate-500">
              {isRecording
                ? 'Capturing real-time ambient noise, voices, and telemetry'
                : 'Tap to discreetly capture legal evidence without alerting anyone'}
            </p>
          </div>
        </div>

        {/* Control Button */}
        <div>
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-red-200 cursor-pointer transition-transform active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Record</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-transform active:scale-95"
            >
              <Square className="w-4 h-4 fill-white text-white" />
              <span>Stop ({formatSecs(recordDuration)})</span>
            </button>
          )}
        </div>
      </div>

      {permissionError && (
        <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Live recording waveform simulation */}
      {isRecording && (
        <div className="mt-3 flex items-center justify-between gap-1 h-8 bg-red-100/60 rounded-xl px-3 overflow-hidden">
          <span className="text-[10px] font-mono font-bold text-red-700 animate-pulse">
            REC {formatSecs(recordDuration)}
          </span>
          <div className="flex items-center gap-1">
            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.max(6, Math.sin(Date.now() / 150 + i) * 16 + 12)}px`,
                  animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] text-red-600 font-semibold">128kbps Secure</span>
        </div>
      )}

      {/* Review / Export Recorded Audio */}
      {audioUrl && !isRecording && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setPlaybackTime(Math.floor(e.currentTarget.currentTime))}
                className="hidden"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Evidence Audio Clip ({formatSecs(playbackTime)} / {formatSecs(recordDuration)})
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Encoded in .webm format</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <a
                href={audioUrl}
                download={`suraksha_evidence_${Date.now()}.webm`}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center gap-1"
                title="Download Audio File"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setAudioUrl(null);
                  setRecordDuration(0);
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400"
                title="Discard"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/reports', {
                    state: {
                      initialDescription: `[AUDIO EVIDENCE ATTACHED - Duration: ${formatSecs(
                        recordDuration
                      )}]\nIncident recorded via Suraksha Ambient Audio.`,
                    },
                  });
                }}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Attach to Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
