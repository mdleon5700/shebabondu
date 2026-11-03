import React from 'react';

export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-10 bg-slate-200/80 rounded-2xl w-3/4 max-w-md mx-auto" />
      
      {/* Search Bar Skeleton */}
      <div className="h-14 bg-slate-200/70 rounded-2xl max-w-2xl mx-auto" />

      {/* Grid of Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200/70 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-20" />
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

