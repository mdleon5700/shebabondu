import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Download, ExternalLink, ShieldCheck, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'প্রবেশপত্র ডাউনলোড ও অ্যাডমিট কার্ড পোর্টাল ২০২৬ | চাকরি সেবা',
  description: 'টেলিটক ও বাংলাদেশ ব্যাংক নিয়োগ পরীক্ষার প্রবেশপত্র ডাউনলোড লিংক ও ইউজার আইডি রিকভারি নির্দেশিকা।',
};

const admits = [
  { id: 1, exam: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (জেনারেল) নিয়োগ পরীক্ষা', portal: 'erecruitment.bb.org.bd', status: 'ডাউনলোড চলছে', deadline: '১২ নভেম্বর পর্যন্ত' },
  { id: 2, title: '৪৬তম বিসিএস লিখিত পরীক্ষা প্রবেশপত্র', exam: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)', portal: 'bpsc.teletalk.com.bd', status: 'ডাউনলোড চলছে', deadline: '০৮ নভেম্বর পর্যন্ত' },
  { id: 3, exam: 'সোনালী ব্যাংক সিনিয়র অফিসার প্রবেশপত্র', portal: 'erecruitment.bb.org.bd', status: 'শীঘ্রই প্রকাশ পাবে', deadline: '১৫ নভেম্বর থেকে' },
  { id: 4, exam: 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ ৩য় ধাপ', portal: 'dpe.teletalk.com.bd', status: 'ডাউনলোড চলছে', deadline: '২০ নভেম্বর পর্যন্ত' },
];

export default function AdmitCardsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">প্রবেশপত্র</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <div className="max-w-2xl space-y-3">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            অ্যাডমিট কার্ড
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            সকল নিয়োগ পরীক্ষার প্রবেশপত্র ডাউনলোড লিংক
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            টেলিটক এবং সংশ্লিষ্ট অফিশিয়াল সার্ভার থেকে আপনার User ID ও Password দিয়ে সরাসরি এডমিট কার্ড ডাউনলোড করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {admits.map((a) => (
          <div key={a.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-md inline-block">
                {a.status}
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {a.exam}
              </h2>
              <div className="text-xs text-slate-500">
                অফিশিয়াল পোর্টাল: <strong className="text-slate-700">{a.portal}</strong>
              </div>
              <div className="text-xs text-rose-600 font-bold">
                শেষ সময়: {a.deadline}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/dashboard"
                className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>ড্যাশবোর্ড ভল্টে খুঁজুন</span>
              </Link>
              <a
                href={`https://${a.portal}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড পোর্টাল</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
