import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  MessageSquare,
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  Battery,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { triggerHaptic, hapticPatterns } from '../utils/haptics';
import { offlineEmergencyCache } from '../utils/offlineEmergencyCache';

interface EmergencyQuickShareProps {
  compact?: boolean;
}

export const EmergencyQuickShare: React.FC<EmergencyQuickShareProps> = ({ compact = false }) => {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    const lastLoc = offlineEmergencyCache.getLastLocation();
    return { lat: lastLoc.latitude, lng: lastLoc.longitude };
  });

  // Fetch actual live location if available
  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
          };
          setCoords(newCoords);
          offlineEmergencyCache.saveLastLocation({
            latitude: newCoords.lat,
            longitude: newCoords.lng,
          });
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const cachedContacts = offlineEmergencyCache.getCachedEmergencyContacts();
  const contactPhones = (user?.emergencyContacts && user.emergencyContacts.length > 0
    ? user.emergencyContacts
    : cachedContacts
  )
    .map((c) => c.phone.replace(/[^0-9+]/g, ''))
    .filter((p) => p.length >= 3);

  const mapsLink = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
  const emergencyMessage = `🚨 URGENT DISTRESS ALERT: This is ${
    user?.name || 'Citizen'
  }. I need urgent assistance or feel unsafe! My live GPS coordinates are: ${mapsLink} (${coords.lat}, ${
    coords.lng
  }). Please check on me or dispatch emergency assistance immediately!`;

  const encodedMsg = encodeURIComponent(emergencyMessage);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
  
  // Format numbers for iOS and Android
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const targetNumbers = contactPhones.length > 0 ? contactPhones.join(isIOS ? '&addresses=' : ',') : '';
  const smsUrl = targetNumbers ? `sms:${targetNumbers}?body=${encodedMsg}` : `sms:?body=${encodedMsg}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emergencyMessage);
    setCopied(true);
    triggerHaptic(hapticPatterns.tap);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs ${
        compact ? 'p-4' : 'p-6'
      } space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
              Offline &amp; Low-Connectivity Quick Share
            </h4>
            <p className="text-[11px] text-slate-500">
              One-tap dispatch via native SMS &amp; WhatsApp even if mobile data drops
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
          <MapPin className="w-3 h-3" />
          <span>GPS Locked</span>
        </div>
      </div>

      {/* Message Preview Box */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
        <p className="line-clamp-2 italic text-slate-700 font-medium">"{emergencyMessage}"</p>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Alert</span>
        </a>

        {/* SMS Deep Link */}
        <a
          href={smsUrl}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Native Offline SMS</span>
        </a>

        {/* Copy Coordinates & Text */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy GPS Text'}</span>
        </button>
      </div>
    </div>
  );
};
