import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ব্যবহারের শর্তাবলি (Terms & Conditions) | চাকরি সেবা',
  description: 'চাকরি সেবা ওয়েবসাইট ব্যবহারের নিয়মকানুন ও আইনগত শর্তাবলী।',
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ব্যবহারের শর্তাবলি (Terms & Conditions)</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-block">
            অফিশিয়াল ডকুমেন্ট ও নীতিমালা
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            চাকরি সেবা ব্যবহারের শর্তাবলি ও নিয়মাবলী
          </h1>
          <p className="text-xs text-slate-500">সর্বশেষ সংস্করণ: অক্টোবর ২০২৬ • চাকরি সেবা কমপ্লায়েন্স টিম</p>
        </div>

        <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            সেবার পরিধি
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            চাকরি সেবা একটি সহায়ক আবেদন ও তথ্য প্ল্যাটফর্ম। আমরা কোনো সরকারি নিয়োগকারী কর্তৃপক্ষ নই। প্রার্থীর যোগ্যতার ভিত্তিতে ফর্ম পূরণ ও সরকারি ফি জমা দেওয়াই আমাদের কাজের মূল অংশ।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            ব্যবহারকারীর দায়িত্ব
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            প্রার্থীকে তাঁর সকল শিক্ষাগত তথ্য ও ব্যক্তিগত ডাটার সঠিকতা নিশ্চিত করতে হবে। ভুল তথ্যের জন্য নিয়োগ বাতিল হলে চাকরি সেবা দায়ী থাকবে না।
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
