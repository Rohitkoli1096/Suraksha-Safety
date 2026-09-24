import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useSOSStore } from '../../store/sosStore';

interface SOSButtonProps {
  className?: string;
  compact?: boolean;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ className = '', compact = false }) => {
  const navigate = useNavigate();
  const { activeSOS, startSOSCountdown } = useSOSStore();

  const isEmergencyActive = activeSOS && activeSOS.status === 'ACTIVE';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isEmergencyActive) {
      startSOSCountdown(5);
      navigate('/sos');
    } else {
      navigate('/sos');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Emergency SOS"
      aria-label={isEmergencyActive ? 'Emergency SOS Active - View Beacon' : 'Emergency SOS - Trigger distress broadcast'}
      className={`inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-150 cursor-pointer shadow-xs select-none active:scale-95 ${
        isEmergencyActive
          ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400 ring-offset-1 animate-pulse'
          : 'bg-red-600 hover:bg-red-700 text-white border border-red-700'
      } ${compact ? 'px-2.5 py-1 text-xs rounded-lg' : 'px-3 py-1.5 text-xs rounded-lg'} ${className}`}
    >
      <ShieldAlert className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isEmergencyActive ? 'animate-bounce' : ''}`} />
      <span className="tracking-wide">
        {isEmergencyActive ? 'SOS ACTIVE' : 'SOS'}
      </span>
    </button>
  );
};
