import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, Briefcase, Search, ArrowRight, ShieldCheck, Compass, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8 text-slate-800">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
        <FileQuestion className="w-10 h-10 text-emerald-600" />
      </div>

      <div className="space-y-3">
        <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
          ৪০৪ পেজ গাইড
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          আপনি যে লিংকটি খুঁজছেন তা হয়তো সরানো হয়েছে, ডেডলাইন শেষ হয়ে গেছে অথবা ইউআরএলটি টাইপ করতে ভুল হয়েছে। নিচের জনপ্রিয় বিভাগগুলো থেকে আপনার কাঙ্ক্ষিত চাকরি খুঁজে নিন।
        </p>
      </div>

      {/* Quick Search Redirect Box */}
      <form action="/jobs" method="GET" className="max-w-md mx-auto flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
        <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
        <input 
          type="text" 
          name="search" 
          placeholder="পদবী, বিভাগ বা প্রতিষ্ঠানের নাম লিখুন..." 
          className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-sm"
        >
          খুঁজুন
        </button>
      </form>

      {/* Popular Categories Grid */}
      <div className="pt-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          জনপ্রিয় চাকরির ক্যাটাগরি
        </h2>
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {[
            { name: '🏛️ সরকারি চাকরি', href: '/government-jobs' },
            { name: '🏦 ব্যাংক জবস', href: '/bank-jobs' },
            { name: '🎯 বিসিএস প্রস্তুতি', href: '/categories/bcs' },
            { name: '🛡️ ডিফেন্স ও প্রতিরক্ষা', href: '/categories/defense-jobs' },
            { name: '🚆 বাংলাদেশ রেলওয়ে', href: '/categories/railway-jobs' },
            { name: '💻 আইটি ও সফটওয়্যার', href: '/it-jobs' },
            { name: '🏥 মেডিকেল ও নার্সিং', href: '/medical-jobs' },
            { name: '🎓 শিক্ষক নিয়োগ', href: '/teacher-jobs' },
            { name: '🌍 এনজিও ও আন্তর্জাতিক', href: '/ngo-jobs' },
            { name: '🏢 বেসরকারি প্রতিষ্ঠান', href: '/private-jobs' }
          ].map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
        <Link
          href="/"
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>হোম পেজে ফিরে যান</span>
        </Link>
        <Link
          href="/jobs"
          className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <Briefcase className="w-4 h-4 text-emerald-700" />
          <span>সকল চলমান চাকরি ({'২০২৬'})</span>
        </Link>
      </div>
    </div>
  );
}
