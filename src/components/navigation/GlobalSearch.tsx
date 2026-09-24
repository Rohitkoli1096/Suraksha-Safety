import React from 'react';
import { Search } from 'lucide-react';

interface GlobalSearchProps {
  onOpenSearch: () => void;
  className?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onOpenSearch, className = '' }) => {
  return (
    <>
      {/* Desktop Search Field Trigger */}
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search discussions, routes, reports"
        className={`hidden md:flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl text-xs border border-slate-200 transition-colors cursor-pointer w-64 lg:w-80 shadow-2xs group ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
          <span className="truncate text-slate-400 group-hover:text-slate-600">
            Search discussions, routes, reports...
          </span>
        </div>
        <kbd className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shrink-0 shadow-2xs">
          Ctrl K
        </kbd>
      </button>

      {/* Compact Mobile/Tablet Search Button */}
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Open search dialog"
        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Search className="w-4 h-4" />
      </button>
    </>
  );
};
