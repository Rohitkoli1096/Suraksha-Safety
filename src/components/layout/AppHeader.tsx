import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Menu, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AppNotification } from '../../types';
import { PrimaryNavigation } from '../navigation/PrimaryNavigation';
import { GlobalSearch } from '../navigation/GlobalSearch';
import { ProfileMenu } from '../navigation/ProfileMenu';
import { NotificationMenu } from '../navigation/NotificationMenu';
import { MobileNavigation } from '../navigation/MobileNavigation';
import { SOSButton } from '../navigation/SOSButton';
import { PWAInstallButton } from '../PWAInstallButton';
import { VoiceSOSTriggerButton } from '../VoiceSOSTriggerButton';

export interface AppHeaderProps {
  notifications?: AppNotification[];
  unreadCount?: number;
  onMarkAllRead?: () => void;
  onOpenSearch?: () => void;
  onTriggerFakeCall?: () => void;
}

/**
 * Enterprise Two-Row AppHeader component for SURAKSHA INDIA: Smart India Tech Suite.
 * - Row 1 (Desktop): Brand identity, Global Search bar with Ctrl+K shortcut, notifications, and profile menu.
 * - Row 2 (Desktop): Primary navigation bar (Dashboard, SOS, Safety, Routes, Reports, Community, More) + Grid Status.
 * - Mobile Header: Single compact 56px row with drawer trigger, branding, quick search, notifications, and SOS.
 * - Drawer Menu: Responsive slide-in navigation drawer with categorized routes, emergency hotlines, and quick actions.
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  notifications = [],
  unreadCount = 0,
  onMarkAllRead = () => {},
  onOpenSearch = () => {},
  onTriggerFakeCall = () => {},
}) => {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* ============================================================ */}
      {/* DESKTOP HEADER (Two-Row Enterprise Architecture)            */}
      {/* ============================================================ */}
      <div className="hidden md:block">
        {/* ROW 1: Branding, Global Search, Notifications, Profile (58px) */}
        <div className="border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
            {/* Left: Brand Logo & Wordmark */}
            <NavLink
              to={user ? '/home' : '/'}
              className="flex items-center gap-2.5 shrink-0 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg"
              aria-label="SURAKSHA INDIA Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <span className="font-black text-base lg:text-lg tracking-tight text-slate-900 block font-heading">
                  SURAKSHA INDIA
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mt-0.5">
                  Smart India Tech Suite
                </span>
              </div>
            </NavLink>

            {/* Center: Global Search Bar */}
            <div className="flex-1 max-w-lg mx-auto flex justify-center">
              <GlobalSearch onOpenSearch={onOpenSearch} />
            </div>

            {/* Right: Actions, Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Hands-Free Voice SOS Trigger Button */}
              <VoiceSOSTriggerButton variant="badge" />

              {/* PWA Install Button */}
              <div className="hidden xl:block">
                <PWAInstallButton />
              </div>

              {/* Notification Bell Dropdown */}
              {user && (
                <NotificationMenu
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAllRead={onMarkAllRead}
                />
              )}

              {/* Profile Menu Dropdown */}
              <ProfileMenu />
            </div>
          </div>
        </div>

        {/* ROW 2: Primary Navigation Bar (48px) */}
        <div className="bg-slate-50/70 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
            {/* Primary Navigation Sub-component */}
            <PrimaryNavigation onTriggerFakeCall={onTriggerFakeCall} />

            {/* Right Status Indicator: National Safety Grid Connectivity */}
            <div className="text-[11px] font-medium text-slate-500 hidden xl:flex items-center gap-2 shrink-0 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>National Safety Grid Connected</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE HEADER (Single Compact Row 56px)                     */}
      {/* ============================================================ */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <NavLink to={user ? '/home' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-700 flex items-center justify-center text-white shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-slate-900 block leading-tight">
                SURAKSHA INDIA
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                Tech Suite
              </span>
            </div>
          </NavLink>
        </div>

        {/* Mobile Actions: Search, Notifications & Compact SOS */}
        <div className="flex items-center gap-1.5">
          <VoiceSOSTriggerButton variant="badge" />

          <GlobalSearch onOpenSearch={onOpenSearch} />

          {user && (
            <NotificationMenu
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={onMarkAllRead}
            />
          )}

          <SOSButton compact />
        </div>
      </div>

      {/* ============================================================ */}
      {/* RESPONSIVE MOBILE DRAWER MENU                                */}
      {/* ============================================================ */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={onOpenSearch}
        onTriggerFakeCall={onTriggerFakeCall}
      />
    </header>
  );
};

export default AppHeader;
