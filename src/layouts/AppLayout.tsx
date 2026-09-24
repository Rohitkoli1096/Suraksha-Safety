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
import { AppHeader } from '../components/navigation/AppHeader';

export const AppLayout: React.FC = () => {
  const { user } = useAuthStore();
  const {
    activeSOS,
    isSirenPlaying,
    toggleSiren,
    fetchActiveSOS,
    queuedAlertsCount,
    syncOfflineQueue,
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
            queuedAlertsCount > 0 ? 'bg-indigo-700 text-white' : 'bg-amber-500 text-slate-950'
          } px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs sticky top-0 z-50`}
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              {queuedAlertsCount > 0
                ? `${queuedAlertsCount} offline SOS alert(s) cached locally. Service Worker active.`
                : 'Offline / Unstable Network Mode: Emergency Contacts & National Helplines cached in Service Worker.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {queuedAlertsCount > 0 && (
              <button
                type="button"
                onClick={() => syncOfflineQueue()}
                className="text-[10px] uppercase font-black bg-white text-indigo-900 px-2.5 py-1 rounded-md shadow-xs hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Now</span>
              </button>
            )}
            <span className="text-[10px] uppercase font-black bg-black/20 text-white px-2 py-0.5 rounded">
              Emergency Ready
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
      <main className="flex-1 pb-16 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar for rapid one-thumb access */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around h-16 z-30 px-2 shadow-lg">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          Home
        </NavLink>

        <NavLink
          to="/routes"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          Routes
        </NavLink>

        {/* Big Center SOS Button */}
        <NavLink
          to="/emergency"
          className="flex flex-col items-center justify-center -mt-5 bg-red-600 text-white w-14 h-14 rounded-full shadow-lg shadow-red-300 border-4 border-white active:scale-95 transition-transform"
        >
          <ShieldAlert className="w-7 h-7" />
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          Report
        </NavLink>

        <NavLink
          to="/community"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Users className="w-5 h-5 mb-0.5" />
          Community
        </NavLink>
      </nav>

      {/* Global Decoy Fake Call Modal */}
      <FakeCallModal isOpen={fakeCallOpen} onClose={() => setFakeCallOpen(false)} />
    </div>
  );
};
