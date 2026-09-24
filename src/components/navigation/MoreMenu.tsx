import React, { useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Clock,
  Scale,
  User,
  Settings,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useClickOutside } from '../../hooks/useClickOutside';

export const MoreMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user } = useAuthStore();

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SAFETY_ADMIN';

  // Active state if current route is one of the "More" items
  const isMoreActive =
    ['/timer', '/rights', '/profile', '/settings', '/admin'].includes(location.pathname);

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
          isMoreActive || isOpen
            ? 'bg-indigo-50 text-indigo-700 font-bold border-b-2 border-indigo-600'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <span>More</span>
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
          className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Additional Services
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
                  isActive ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900 leading-tight">Safety Timer</span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Start a timed safety check
                </span>
              </div>
            </NavLink>

            {/* Rights & Help */}
            <NavLink
              to="/rights"
              role="menuitem"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-start gap-2.5 px-3 py-2 transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Scale className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900 leading-tight">Rights &amp; Help</span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Safety resources and assistance
                </span>
              </div>
            </NavLink>

            {/* My Profile */}
            <NavLink
              to="/profile"
              role="menuitem"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-start gap-2.5 px-3 py-2 transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <User className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900 leading-tight">My Profile</span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Emergency contacts &amp; medical data
                </span>
              </div>
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/settings"
              role="menuitem"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-start gap-2.5 px-3 py-2 transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Settings className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900 leading-tight">Settings</span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Notifications &amp; app preferences
                </span>
              </div>
            </NavLink>
          </div>

          {/* Admin Command - ONLY for authorized administrators */}
          {isAdmin && (
            <div className="pt-1 border-t border-slate-100">
              <NavLink
                to="/admin"
                role="menuitem"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-start gap-2.5 px-3 py-2 transition-colors ${
                    isActive ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-indigo-700 hover:bg-indigo-50/50'
                  }`
                }
              >
                <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 leading-tight">Admin Command</span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                      Officer
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    Dispatch authority &amp; city oversight
                  </span>
                </div>
              </NavLink>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
