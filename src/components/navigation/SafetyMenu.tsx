import React, { useState, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  ChevronDown,
  Clock,
  Users,
  Phone,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface SafetyMenuProps {
  onTriggerFakeCall: () => void;
}

export const SafetyMenu: React.FC<SafetyMenuProps> = ({ onTriggerFakeCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  // Active state if on timer
  const isSafetyActive = location.pathname === '/timer';

  const handleFakeCall = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onTriggerFakeCall();
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
          isSafetyActive || isOpen
            ? 'bg-indigo-50 text-indigo-700 font-bold border-b-2 border-indigo-600'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <Shield className={`w-3.5 h-3.5 ${isSafetyActive || isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span>Safety</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Safety Center
            </span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
              Ready
            </span>
          </div>

          <div className="py-1">
            {/* Safety Timer */}
            <NavLink
              to="/timer"
              role="menuitem"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-start gap-2.5 px-3 py-2 transition-colors ${
                  isActive ? 'bg-indigo-50/80 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900 leading-tight">Safety Timer</span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Timed check-in with auto-alert dispatch
                </span>
              </div>
            </NavLink>

            {/* Emergency Contacts */}
            <NavLink
              to="/profile"
              role="menuitem"
              onClick={handleNavClick}
              className="flex items-start gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900 leading-tight">Emergency Contacts</span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Trusted circle linked to SOS broadcast
                </span>
              </div>
            </NavLink>

            {/* Decoy Call */}
            <button
              type="button"
              role="menuitem"
              onClick={handleFakeCall}
              className="w-full text-left flex items-start gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 leading-tight">Decoy Call</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">Quick</span>
                </div>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Discreet incoming call to excuse yourself
                </span>
              </div>
            </button>

            {/* Safety Preferences */}
            <NavLink
              to="/settings"
              role="menuitem"
              onClick={handleNavClick}
              className="flex items-start gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900 leading-tight">Safety Preferences</span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Hardware trigger &amp; siren sensitivity
                </span>
              </div>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
};
