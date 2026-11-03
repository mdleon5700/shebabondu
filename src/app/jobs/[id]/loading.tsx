import React from 'react';

export default function JobDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Back link */}
      <div className="h-4 bg-slate-200 rounded w-32" />

      {/* Main Header Card */}
      <div className="p-8 rounded-3xl bg-slate-900 text-slate-400 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-800 rounded w-2/3" />
            <div className="h-4 bg-slate-800 rounded w-1/3" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-slate-800/60 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="h-5 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
            <div className="h-3 bg-slate-100 rounded w-4/6" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-56 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="h-5 bg-slate-200 rounded w-1/2" />
            <div className="h-12 bg-emerald-600/30 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

