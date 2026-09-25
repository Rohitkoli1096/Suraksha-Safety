import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Home,
  MapPin,
  FileText,
  Users,
  Volume2,
  VolumeX,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import { api } from '../api/client';
import { AppNotification } from '../types';
import { FakeCallModal } from '../components/FakeCallModal';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { VoiceSOSModal } from '../components/VoiceSOSModal';
import { useVoiceSOSStore } from '../store/voiceSOSStore';
import { AppHeader } from '../components/layout/AppHeader';

export const AppLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { isModalOpen, setModalOpen } = useVoiceSOSStore();
  const {
    activeSOS,
    isSirenPlaying,
    toggleSiren,
    fetchActiveSOS,
    queuedAlertsCount,
    syncOfflineQueue,
    startSOSCountdown,
  } = useSOSStore();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fakeCallOpen, setFakeCallOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchActiveSOS();
  }, [fetchActiveSOS]);

  const loadNotifications = async () => {
    if (!user) return;
    const res = await api.get<{ notifications: AppNotification[]; unreadCount: number }>('/notifications');
    if (res.success && res.data) {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    await api.post('/notifications/read-all');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Offline Alert Strip & Caching Status */}
      {(!isOnline || queuedAlertsCount > 0) && (
        <div
          className={`${
            queuedAlertsCount > 0
              ? 'bg-indigo-900 text-indigo-100 border-b border-indigo-700/60'
              : 'bg-slate-900 text-slate-200 border-b border-slate-800'
          } px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs sticky top-0 z-50`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`inline-flex rounded-full h-2 w-2 ${queuedAlertsCount > 0 ? 'bg-indigo-400 animate-ping' : 'bg-amber-400'}`} />
            </span>
            <WifiOff className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">
              {queuedAlertsCount > 0
                ? `${queuedAlertsCount} offline SOS alert(s) cached locally. Service Worker active.`
                : 'Offline / Unstable Network Mode: Emergency Contacts & National Helplines cached in Service Worker.'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {queuedAlertsCount > 0 && (
              <button
                type="button"
                onClick={() => syncOfflineQueue()}
                className="text-[10px] uppercase font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync</span>
              </button>
            )}
            <span className="text-[10px] font-mono font-medium text-slate-400 hidden sm:inline">
              SW Ready
            </span>
          </div>
        </div>
      )}

      {/* Active Emergency Banner */}
      {activeSOS && activeSOS.status === 'ACTIVE' && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-md flex items-center justify-between sticky top-0 z-50 animate-pulse">
          <div className="flex items-center gap-2 max-w-2xl">
            <ShieldAlert className="w-6 h-6 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold text-sm sm:text-base leading-tight">
                CRITICAL DISTRESS ACTIVE — Coordinates Shared with Guardians
              </p>
              <p className="text-xs text-red-100 hidden sm:block">
                GPS Location: {activeSOS.location.latitude.toFixed(4)}, {activeSOS.location.longitude.toFixed(4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSiren}
              className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 rounded-lg text-xs font-semibold flex items-center gap-1 border border-red-400"
              title="Toggle Siren Audio"
            >
              {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSirenPlaying ? 'Mute Siren' : 'Play Siren'}</span>
            </button>
            <button
              onClick={() => navigate('/sos')}
              className="px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold shadow"
            >
              View SOS Beacon
            </button>
          </div>
        </div>
      )}

      {/* Redesigned Two-Row Enterprise Public Safety Header */}
      <AppHeader
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
        onOpenSearch={() => setIsSearchOpen(true)}
        onTriggerFakeCall={() => setFakeCallOpen(true)}
      />

      {/* Global Search Command Palette Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Main Page Body */}
      <main className="flex-1 pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around py-2 px-3 md:hidden shadow-lg">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/routes"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <MapPin className="w-5 h-5" />
          <span>Routes</span>
        </NavLink>
        <button
          onClick={() => {
            if (!activeSOS || activeSOS.status !== 'ACTIVE') {
              startSOSCountdown(5);
            }
            navigate('/sos');
          }}
          className="relative -top-4 w-14 h-14 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-lg hover:bg-red-700 active:scale-95 transition-all focus:outline-none"
          title="Emergency SOS"
          aria-label="Activate Emergency SOS"
        >
          <ShieldAlert className="w-6 h-6 animate-pulse" />
          <span className="text-[10px] font-bold">SOS</span>
        </button>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <FileText className="w-5 h-5" />
          <span>Hazards</span>
        </NavLink>
        <NavLink
          to="/community"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Community</span>
        </NavLink>
      </nav>

      {/* Global Decoy Fake Call Modal */}
      <FakeCallModal isOpen={fakeCallOpen} onClose={() => setFakeCallOpen(false)} />

      {/* Global Voice SOS Guardian Modal */}
      <VoiceSOSModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
