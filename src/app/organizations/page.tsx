import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  Building2, 
  ExternalLink, 
  ArrowRight, 
  Landmark, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { mockJobs } from '@/data/mockJobs';

export const metadata: Metadata = {
  title: 'সকল নিয়োগকারী প্রতিষ্ঠানসমূহ | চাকরি সেবা',
  description: 'বাংলাদেশ ব্যাংক, বিপিএসসি, বিভিন্ন মন্ত্রণালয়, অধিদপ্তর ও ব্যাংকের পরিচিতি ও চলমান সার্কুলার।',
};

const topOrgs = [
  { name: 'বাংলাদেশ ব্যাংক (Bangladesh Bank)', slug: 'bangladesh-bank', category: 'সেন্ট্রাল ব্যাংক', web: 'bb.org.bd', link: '/organizations/bangladesh-bank' },
  { name: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)', slug: 'bpsc', category: 'সাংবিধানিক প্রতিষ্ঠান', web: 'bpsc.gov.bd', link: '/organizations/bpsc' },
  { name: 'সরকারি বিভিন্ন মন্ত্রণালয় (Ministries)', slug: 'government-ministries', category: 'মন্ত্রণালয় ও সচিবালয়', web: 'bangladesh.gov.bd', link: '/organizations/government-ministries' },
  { name: 'সরকারি অধিদপ্তরসমূহ (Directorates)', slug: 'government-directorates', category: 'অধিদপ্তর ও সংস্থা', web: 'bangladesh.gov.bd', link: '/organizations/government-directorates' },
  { name: 'সোনালী ব্যাংক পিএলসি', slug: 'sonali-bank', category: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক', web: 'sonalibank.com.bd', link: '/bank-jobs' },
  { name: 'বাংলাদেশ রেলওয়ে (Railway)', slug: 'bangladesh-railway', category: 'সরকারি যোগাযোগ খাত', web: 'railway.gov.bd', link: '/government-jobs' },
  { name: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)', slug: 'dpe', category: 'সরকারি শিক্ষা খাত', web: 'dpe.gov.bd', link: '/teacher-jobs' },
  { name: 'স্বাস্থ্য সেবা অধিদপ্তর (DGHS)', slug: 'dghs', category: 'সরকারি স্বাস্থ্য খাত', web: 'dghs.gov.bd', link: '/medical-jobs' },
];

export default function OrganizationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">প্রতিষ্ঠান ডিরেক্টরি</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <div className="max-w-3xl space-y-3">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            প্রতিষ্ঠান ডিরেক্টরি
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            সকল নিয়োগকারী প্রতিষ্ঠান ও সংস্থা
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            বাংলাদেশের শীর্ষস্থানীয় সরকারি প্রতিষ্ঠান, মন্ত্রণালয়, ব্যাংক ও স্বায়ত্তশাসিত সংস্থাসমূহের সর্বশেষ নিয়োগ তথ্য ও অফিশিয়াল লিংক।
          </p>
        </div>
      </div>

      {/* Org Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topOrgs.map((org, idx) => (
          <Link
            key={idx}
            href={org.link}
            className="bg-white rounded-3xl border border-slate-200/90 p-5 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/5 transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                🏛️
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  {org.category}
                </span>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {org.name}
                </h2>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-emerald-700">
              <span className="text-slate-500">{org.web}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
