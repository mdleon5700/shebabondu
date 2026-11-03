'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Runtime Error:', error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-8 text-slate-800">
      <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
        <AlertTriangle className="w-10 h-10 text-amber-600" />
      </div>

      <div className="space-y-3">
        <span className="text-amber-800 font-bold text-xs uppercase tracking-wider bg-amber-100/70 px-3 py-1 rounded-full border border-amber-300">
          সিস্টেম সতর্কতা
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          তথ্য লোড করার সময় সাময়িক কারিগরি ত্রুটি হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা পুনরায় চেষ্টা করুন।
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>পুনরায় চেষ্টা করুন</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl border border-slate-300 transition-colors"
        >
          <Home className="w-4 h-4 text-slate-600" />
          <span>হোমপেজে ফিরে যান</span>
        </Link>
        <Link
          href="/contact-us"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-300 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>সহায়তা কেন্দ্রে জানান</span>
        </Link>
      </div>

      {process.env.NODE_ENV !== 'production' && error?.message && (
        <div className="mt-8 text-left max-w-xl mx-auto p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto">
          <p className="font-bold text-red-400 mb-1">Debug Error Information:</p>
          <p>{error.message}</p>
          {error.digest && <p className="text-slate-500 text-[10px] mt-1">Digest: {error.digest}</p>}
        </div>
      )}
    </div>
  );
}
