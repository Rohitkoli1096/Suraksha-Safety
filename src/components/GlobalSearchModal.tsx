import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ShieldAlert,
  MapPin,
  FileText,
  Users,
  Clock,
  Scale,
  Settings,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickLinkItem {
  id: string;
  title: string;
  category: 'Community' | 'Safety Action' | 'Navigation' | 'Emergency';
  description: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SEARCH_CATALOG: QuickLinkItem[] = [
  {
    id: 'comm-forum',
    title: 'Community Safety Forum',
    category: 'Community',
    description: 'Verified neighborhood safety updates, transit tips, and local alerts',
    to: '/community',
    icon: Users,
  },
  {
    id: 'comm-new',
    title: 'Start New Safety Discussion',
    category: 'Community',
    description: 'Post a localized hazard alert or security recommendation',
    to: '/community?action=new',
    icon: Users,
  },
  {
    id: 'sos-panic',
    title: 'SOS Emergency Panic Trigger',
    category: 'Emergency',
    description: 'Trigger immediate distress broadcast and sound audible siren',
    to: '/emergency',
    icon: ShieldAlert,
  },
  {
    id: 'safe-routes',
    title: 'Safe Route Navigation',
    category: 'Navigation',
    description: 'Well-lit corridors, CCTV coverage, and safe havens across Delhi NCR',
    to: '/routes',
    icon: MapPin,
  },
  {
    id: 'incident-reports',
    title: 'Citizen Incident Reports',
    category: 'Navigation',
    description: 'Report dark alleys, broken streetlights, or suspicious activity',
    to: '/reports',
    icon: FileText,
  },
  {
    id: 'safety-timer',
    title: 'Safety Journey Countdown Timer',
    category: 'Safety Action',
    description: 'Set transit check-in timer with auto-alert dispatch on expiry',
    to: '/timer',
    icon: Clock,
  },
  {
    id: 'legal-rights',
    title: 'Legal Rights & Emergency Hotlines',
    category: 'Emergency',
    description: 'Indian Penal Code protections, Zero FIR, and 24/7 toll-free helplines',
    to: '/rights',
    icon: Scale,
  },
  {
    id: 'helpline-112',
    title: 'National Emergency 112 Hotline',
    category: 'Emergency',
    description: 'Unified Indian Police, Fire, and Ambulance emergency telephone line',
    to: '/emergency',
    icon: PhoneCall,
  },
  {
    id: 'settings',
    title: 'System Preferences & Offline Cache',
    category: 'Safety Action',
    description: 'Hardware trigger sensitivity, Service Worker cache, and PWA setup',
    to: '/settings',
    icon: Settings,
  },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = SEARCH_CATALOG.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: QuickLinkItem) => {
    navigate(item.to);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Safety Search"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search safety discussions, verified routes, incidents, hotlines..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching safety resources or discussions found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-50/80 text-indigo-950' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.category === 'Emergency'
                          ? 'bg-rose-100 text-rose-700'
                          : item.category === 'Community'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">↑</kbd>
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px] ml-1">↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">↵</kbd> Select
            </span>
          </div>
          <span className="font-medium text-slate-400">Suraksha Quick Command</span>
        </div>
      </div>
    </div>
  );
};
