import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MapPin, FileText, Users } from 'lucide-react';
import { SOSButton } from './SOSButton';
import { SafetyMenu } from './SafetyMenu';
import { MoreMenu } from './MoreMenu';

interface PrimaryNavigationProps {
  onTriggerFakeCall: () => void;
  className?: string;
}

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
  onTriggerFakeCall,
  className = '',
}) => {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary application navigation"
      className={`flex items-center gap-1 sm:gap-1.5 flex-wrap ${className}`}
    >
      {/* 1. Dashboard */}
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isActive
              ? 'bg-indigo-50 text-indigo-700 font-bold border-b-2 border-indigo-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`
        }
      >
        <Home className={`w-3.5 h-3.5 ${location.pathname === '/home' ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span>Dashboard</span>
      </NavLink>

      {/* 2. SOS Emergency Action */}
      <SOSButton compact />

      {/* 3. Safety ▾ Dropdown */}
      <SafetyMenu onTriggerFakeCall={onTriggerFakeCall} />

      {/* 4. Routes */}
      <NavLink
        to="/routes"
        className={({ isActive }) =>
          `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isActive
              ? 'bg-indigo-50 text-indigo-700 font-bold border-b-2 border-indigo-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`
        }
      >
        <MapPin className={`w-3.5 h-3.5 ${location.pathname === '/routes' ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span>Routes</span>
      </NavLink>

      {/* 5. Reports */}
      <NavLink
        to="/reports"
        className={({ isActive }) =>
          `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isActive
              ? 'bg-indigo-50 text-indigo-700 font-bold border-b-2 border-indigo-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`
        }
      >
        <FileText className={`w-3.5 h-3.5 ${location.pathname === '/reports' ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span>Reports</span>
      </NavLink>

      {/* 6. Community (Explicit Active State Requirement) */}
      <NavLink
        to="/community"
        className={({ isActive }) =>
          `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isActive
              ? 'bg-indigo-50 text-indigo-700 font-bold border-b-2 border-indigo-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`
        }
      >
        <Users className={`w-3.5 h-3.5 ${location.pathname === '/community' ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span>Community</span>
        {location.pathname === '/community' && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block -ml-0.5" />
        )}
      </NavLink>

      {/* 7. More ▾ Dropdown */}
      <MoreMenu />
    </nav>
  );
};
