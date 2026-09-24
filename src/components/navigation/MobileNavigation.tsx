import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  MapPin,
  FileText,
  Users,
  Shield,
  Clock,
  Scale,
  User,
  Settings,
  ShieldAlert,
  Search,
  Phone,
  PhoneCall,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useSOSStore } from "../../store/sosStore";
import { PWAInstallButton } from "../PWAInstallButton";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onTriggerFakeCall: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onTriggerFakeCall,
}) => {
  const { user, logout } = useAuthStore();
  const { activeSOS, startSOSCountdown } = useSOSStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [safetySectionOpen, setSafetySectionOpen] = useState(false);

  if (!isOpen) return null;

  const isAdmin = user?.role === "ADMIN" || user?.role === "SAFETY_ADMIN";
  const isEmergencyActive = activeSOS && activeSOS.status === "ACTIVE";

  const handleSOSClick = () => {
    onClose();
    if (!isEmergencyActive) {
      startSOSCountdown(5);
      navigate("/sos");
    } else {
      navigate("/sos");
    }
  };

  const handleSignOut = () => {
    onClose();
    logout();
    navigate("/login");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      className="fixed inset-0 z-50 md:hidden bg-slate-950/60 backdrop-blur-xs flex"
    >
      <div className="w-5/6 max-w-sm bg-white h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-700 flex items-center justify-center text-white shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                SURAKSHA INDIA
              </span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                Smart India Tech Suite
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-100/90 text-slate-600 rounded-xl border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search discussions, routes...</span>
            </div>
            <kbd className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
              Ctrl K
            </kbd>
          </button>

          {/* Primary Navigation Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              Primary Navigation
            </span>

            {/* Dashboard */}
            <NavLink
              to="/home"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Dashboard</span>
            </NavLink>

            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={handleSOSClick}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                isEmergencyActive
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>
                  {isEmergencyActive ? "SOS Emergency Active" : "Emergency SOS"}
                </span>
              </div>
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                PANIC
              </span>
            </button>

            {/* Safety Hub (Expandable) */}
            <div>
              <button
                type="button"
                onClick={() => setSafetySectionOpen(!safetySectionOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span>Safety Center</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    safetySectionOpen ? "rotate-180 text-indigo-600" : ""
                  }`}
                />
              </button>

              {safetySectionOpen && (
                <div className="pl-9 pr-2 py-1 space-y-1 text-slate-600">
                  <NavLink
                    to="/timer"
                    onClick={onClose}
                    className="flex items-center gap-2 py-1.5 text-xs hover:text-indigo-600"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Safety Timer</span>
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-2 py-1.5 text-xs hover:text-indigo-600"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Emergency Contacts</span>
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTriggerFakeCall();
                    }}
                    className="flex items-center gap-2 py-1.5 text-xs hover:text-emerald-700 text-left w-full cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Trigger Decoy Call</span>
                  </button>
                  <NavLink
                    to="/settings"
                    onClick={onClose}
                    className="flex items-center gap-2 py-1.5 text-xs hover:text-indigo-600"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Safety Preferences</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Routes */}
            <NavLink
              to="/routes"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Safe Routes</span>
            </NavLink>

            {/* Reports */}
            <NavLink
              to="/reports"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Incident Reports</span>
            </NavLink>

            {/* Community */}
            <NavLink
              to="/community"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Community Forum</span>
            </NavLink>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              Additional Services
            </span>

            {/* Safety Timer */}
            <NavLink
              to="/timer"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Safety Timer</span>
            </NavLink>

            {/* Rights & Help */}
            <NavLink
              to="/rights"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              <Scale className="w-4 h-4 text-slate-500" />
              <span>Rights &amp; Help</span>
            </NavLink>

            {/* My Profile */}
            <NavLink
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>My Profile</span>
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </NavLink>

            {/* Admin Command (ONLY for Admin) */}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-indigo-700 bg-indigo-50/60 font-semibold"
              >
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Admin Command</span>
              </NavLink>
            )}
          </div>

          {/* Quick Helpline & Decoy */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onTriggerFakeCall();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Simulate Decoy Call</span>
            </button>
            <a
              href="tel:112"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Emergency 112 Helpline</span>
            </a>
            <div className="pt-1">
              <PWAInstallButton variant="full" />
            </div>
          </div>
        </div>

        {/* Drawer Footer User Lockup */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">
                    {user.name.replace(/\s*\([^)]*\)/g, "").trim()}
                  </p>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {user.role === "ADMIN"
                      ? "Safety Administrator"
                      : "Citizen Contributor"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="w-full block py-2 bg-indigo-600 text-white text-center font-bold rounded-xl text-xs"
            >
              Sign In to Account
            </NavLink>
          )}
        </div>
      </div>

      {/* Outside click area to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
