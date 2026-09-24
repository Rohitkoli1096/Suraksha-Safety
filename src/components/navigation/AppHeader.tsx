import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AppNotification } from '../../types';
import { PrimaryNavigation } from './PrimaryNavigation';
import { GlobalSearch } from './GlobalSearch';
import { NotificationMenu } from './NotificationMenu';
import { ProfileMenu } from './ProfileMenu';
import { MobileNavigation } from './MobileNavigation';
import { SOSButton } from './SOSButton';
import { PWAInstallButton } from '../PWAInstallButton';

interface AppHeaderProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onOpenSearch: () => void;
  onTriggerFakeCall: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  notifications,
  unreadCount,
  onMarkAllRead,
  onOpenSearch,
  onTriggerFakeCall,
}) => {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* ============================================================ */}
      {/* DESKTOP HEADER (Two-Row Architecture)                        */}
      {/* ============================================================ */}
      <div className="hidden md:block">
        {/* ROW 1: Branding, Global Search, Notifications, Profile (56-64px) */}
        <div className="border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
            {/* Left: Brand Logo & Wordmark */}
            <NavLink to={user ? '/home' : '/'} className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xs group-hover:scale-102 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <span className="font-black text-base lg:text-lg tracking-tight text-slate-900 block">
                  SURAKSHA INDIA
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block mt-0.5">
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

        {/* ROW 2: Primary Navigation Bar (48-52px) */}
        <div className="bg-slate-50/60 border-t border-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
            <PrimaryNavigation onTriggerFakeCall={onTriggerFakeCall} />

            <div className="text-[11px] font-medium text-slate-400 hidden xl:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>National Safety Grid Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE HEADER (Single Compact Row 56-64px)                   */}
      {/* ============================================================ */}
      <div className="md:hidden flex items-center justify-between px-4 h-15 bg-white">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <NavLink to={user ? '/home' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-700 flex items-center justify-center text-white shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                SURAKSHA INDIA
              </span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                Tech Suite
              </span>
            </div>
          </NavLink>
        </div>

        {/* Mobile Search & SOS Actions */}
        <div className="flex items-center gap-1.5">
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

      {/* Mobile Drawer Menu */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={onOpenSearch}
        onTriggerFakeCall={onTriggerFakeCall}
      />
    </header>
  );
};
