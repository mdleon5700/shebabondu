import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ) | চাকরি সেবা',
  description: 'চাকরি সেবার সার্ভিস, পেমেন্ট, আবেদন ও নিরাপত্তা সম্পর্কিত সকল সাধারণ প্রশ্নের উত্তর।',
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ)</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-block">
            অফিশিয়াল ডকুমেন্ট ও নীতিমালা
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (Frequently Asked Questions)
          </h1>
          <p className="text-xs text-slate-500">সর্বশেষ সংস্করণ: অক্টোবর ২০২৬ • চাকরি সেবা কমপ্লায়েন্স টিম</p>
        </div>

        <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            আপনারা কীভাবে আমার হয়ে আবেদন করেন?
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            আপনি যখন কোনো সার্কুলারে 'আবেদন করুন' চাপেন, আমাদের অভিজ্ঞ ডাটা এন্ট্রি টিম অফিশিয়াল সরকারি পোর্টালে (যেমন: Teletalk) সঠিক নিয়মে আপনার তথ্য দিয়ে ফর্ম পূরণ করে সরকারি ফি পরিশোধ করে আপনার ড্যাশবোর্ডে অফিশিয়াল Applicant Copy PDF আপলোড করে দেয়।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            ছবি ও স্বাক্ষরের সাইজ নিয়ে কি চিন্তা করতে হবে?
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            একদমই না! আমাদের প্ল্যাটফর্মে রয়েছে বিল্ট-ইন অটো-রিসাইজার। সাধারণ ছবি আপলোড করলেই তা সরকারি নির্ধারিত ৩০০×৩০০ এবং স্বাক্ষরের ক্ষেত্রে ৩০০×৮০ পিক্সেলে অটোমেটিক কনভার্ট হয়ে যায়।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            আবেদনের প্রমাণ কী পাব?
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            আবেদন সম্পন্ন হওয়ার সাথে সাথেই আপনার অ্যাকাউন্টে অফিসিয়াল User ID, পাসওয়ার্ড ও সরকারি বারকোডযুক্ত মূল 'Applicant Copy' পিডিএফ ফাইল পাওয়া যাবে এবং মোবাইল এসএমএসের মাধ্যমে কনফার্মেশন পাবেন।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            কোনো কারণে আবেদন ব্যর্থ হলে রিফান্ড পাওয়া যাবে?
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            হ্যাঁ, শতভাগ। সরকারি সার্ভার জটিলতায় কোনো আবেদন নির্ধারিত সময়ের মধ্যে সম্পন্ন না করা গেলে সরকারি ফি ও টিম চার্জ কোনো প্রশ্ন ছাড়াই সম্পূর্ণ রিফান্ড করে দেওয়া হয়।
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
