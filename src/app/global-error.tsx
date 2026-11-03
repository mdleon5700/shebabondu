'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">সিস্টেম রিকভারি মোড</h1>
            <p className="text-sm text-slate-600">
              অ্যাপ্লিকেশনের মূল কাঠামোতে সমস্যা হয়েছে। অনুগ্রহ করে রিফ্রেশ করুন।
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      </body>
    </html>
  );
}
