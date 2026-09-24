import React, { useState, useRef } from 'react';
import { Bell, CheckCheck, ShieldAlert, Users, FileText, Info } from 'lucide-react';
import { AppNotification } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

interface NotificationMenuProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
}

export const NotificationMenu: React.FC<NotificationMenuProps> = ({
  notifications,
  unreadCount,
  onMarkAllRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SOS_ALERT':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      case 'COMMUNITY_MENTION':
        return <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      case 'REPORT_STATUS_CHANGED':
        return <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
    }
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications, ${unreadCount} unread`}
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-rose-600 text-white text-[10px] font-extrabold rounded-full px-1 flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-xs sm:text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onMarkAllRead();
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                <p>No notifications yet.</p>
                <span className="text-[11px] text-slate-400">
                  Real-time alerts and community updates will appear here.
                </span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-xs transition-colors flex items-start gap-2.5 ${
                    !n.read ? 'bg-indigo-50/40 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-slate-900 truncate pr-2">{n.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-snug line-clamp-2">{n.message}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
