import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

export type CommunityCategoryFilter =
  | 'ALL'
  | 'SAFETY_TIP'
  | 'UPDATE'
  | 'ALERT'
  | 'COMMUNITY_WATCH'
  | 'TRANSIT'
  | 'NEIGHBORHOOD';

export type CommunitySortOption = 'LATEST' | 'MOST_HELPFUL' | 'MOST_DISCUSSED';

interface CommunityFilterBarProps {
  currentCategory: CommunityCategoryFilter;
  onSelectCategory: (category: CommunityCategoryFilter) => void;
  currentSort: CommunitySortOption;
  onSelectSort: (sort: CommunitySortOption) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

const CATEGORY_TABS: { id: CommunityCategoryFilter; label: string }[] = [
  { id: 'ALL', label: 'All Discussions' },
  { id: 'SAFETY_TIP', label: 'Safety Tips' },
  { id: 'UPDATE', label: 'Official Updates' },
  { id: 'ALERT', label: 'Hazard Alerts' },
  { id: 'TRANSIT', label: 'Transit & Metro' },
  { id: 'COMMUNITY_WATCH', label: 'Neighborhood Patrol' },
];

export const CommunityFilterBar: React.FC<CommunityFilterBarProps> = ({
  currentCategory,
  onSelectCategory,
  currentSort,
  onSelectSort,
  searchQuery,
  onSearchChange,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 space-y-3 shadow-xs">
      {/* Search Input & Sort Selector Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search discussions by landmark, author, or keyword..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              aria-label="Clear filter search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => onSelectSort(e.target.value as CommunitySortOption)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="LATEST">Latest Published</option>
              <option value="MOST_HELPFUL">Most Helpful</option>
              <option value="MOST_DISCUSSED">Most Discussed</option>
            </select>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-500 px-2 py-1 bg-slate-100 rounded-lg shrink-0">
            {totalCount} {totalCount === 1 ? 'post' : 'posts'}
          </span>
        </div>
      </div>

      {/* Filter Category Segmented Strip */}
      <div className="overflow-x-auto no-scrollbar pt-1 -mx-1 px-1 flex items-center gap-1.5 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:inline-block pr-1 shrink-0">
          Filter:
        </span>
        {CATEGORY_TABS.map((tab) => {
          const isActive = currentCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
