import React from 'react';

export const CommunitySkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4 animate-pulse"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-1.5">
                <div className="w-32 h-3.5 bg-slate-200 rounded" />
                <div className="w-24 h-2.5 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="w-16 h-4 bg-slate-100 rounded" />
          </div>

          {/* Title & Body Skeleton */}
          <div className="space-y-2">
            <div className="w-3/4 h-5 bg-slate-200 rounded" />
            <div className="w-full h-3.5 bg-slate-100 rounded" />
            <div className="w-5/6 h-3.5 bg-slate-100 rounded" />
          </div>

          {/* Action Bar Skeleton */}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
            <div className="w-20 h-7 bg-slate-100 rounded-lg" />
            <div className="w-24 h-7 bg-slate-100 rounded-lg" />
            <div className="w-16 h-7 bg-slate-100 rounded-lg ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
};
