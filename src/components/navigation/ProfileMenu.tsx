import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useClickOutside } from '../../hooks/useClickOutside';

export const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  if (!user) {
    return (
      <NavLink
        to="/login"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
      >
        Sign In
      </NavLink>
    );
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'SAFETY_ADMIN';

  // Format clean name: e.g. "Dr. Anita Sharma (Safety Administrator)" -> "Dr. Anita Sharma"
  const cleanDisplayName = user.name.replace(/\s*\([^)]*\)/g, '').trim();

  const handleSignOut = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
        className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs overflow-hidden shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={cleanDisplayName} className="w-full h-full object-cover" />
          ) : (
            cleanDisplayName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Shortened Name + Chevron */}
        <div className="hidden sm:flex items-center gap-1.5 text-left text-xs leading-none">
          <span className="font-semibold text-slate-800 truncate max-w-[130px]">
            {cleanDisplayName}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Info Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100">
            <p className="font-bold text-slate-900 truncate">{cleanDisplayName}</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email || user.phone}</p>
            <div className="mt-1.5">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                  isAdmin
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200/80'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{isAdmin ? 'Safety Administrator' : 'Citizen Contributor'}</span>
              </span>
            </div>
          </div>

          <div className="py-1">
            {/* My Profile */}
            <NavLink
              to="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>My Profile</span>
            </NavLink>

            {/* Account Settings */}
            <NavLink
              to="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Account Settings</span>
            </NavLink>

            {/* Security Preferences */}
            <NavLink
              to="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Security</span>
            </NavLink>

            {/* Admin Command - ONLY for authorized users */}
            {isAdmin && (
              <NavLink
                to="/admin"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-indigo-700 hover:bg-indigo-50/60 font-semibold transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin Command</span>
              </NavLink>
            )}
          </div>

          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
