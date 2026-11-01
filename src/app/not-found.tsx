import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowRight, Home, Search, Briefcase } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6 text-slate-800">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
        <FileQuestion className="w-10 h-10 text-emerald-600" />
      </div>

      <div className="space-y-2">
        <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">ত্রুটি ৪০৪ (Page Not Found)</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          আপনি যে লিংকটি খুঁজছেন তা হয়তো সরানো হয়েছে, ডেডলাইন শেষ হয়ে গেছে অথবা ইউআরএলটি সঠিকভাবে টাইপ করা হয়নি।
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link
          href="/"
          className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>হোম পেজে যান</span>
        </Link>
        <Link
          href="/jobs"
          className="px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4 text-emerald-700" />
          <span>সকল চলমান চাকরি</span>
        </Link>
      </div>
    </div>
  );
}
