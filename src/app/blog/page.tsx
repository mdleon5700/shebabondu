import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, Calendar, ArrowRight, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'চাকরি সেবা ব্লগ ও ক্যারিয়ার আর্টিকেল | চাকরি সেবা',
  description: 'চাকরি প্রস্তুতি, বিসিএস টিপস, ব্যাংকিং ক্যারিয়ার ও সাম্প্রতিক নিয়োগ বিশ্লেষণের ব্লগ।',
};

const blogs = [
  { slug: 'bcs-preli-strategy-2026', title: '৪৭তম বিসিএস প্রিলিমিনারি পরীক্ষায় প্রথমবারেই পাসের চূড়ান্ত কৌশল', date: '২৬ অক্টোবর ২০২৬', author: 'ক্যারিয়ার টিম', desc: '২০০ নম্বরের সিলেবাস বিভাজন এবং কোন বিষয়ে কতটুকু সময় দেওয়া উচিত তার বিস্তারিত আলোচনা।' },
  { slug: 'bank-job-focus-writing', title: 'ব্যাংক নিয়োগ লিখিত পরীক্ষায় ফোকাস রাইটিং ও অনুবাদে বেশি নম্বর পাওয়ার উপায়', date: '২৪ অক্টোবর ২০২৬', author: 'তানভীর আহমেদ', desc: 'সাম্প্রতিক অর্থনৈতিক ইস্যু ও ব্যাংকিং টার্ম ব্যবহার করে আকর্ষণীয় ফোকাস রাইটিং লেখার নিয়ম।' },
  { slug: 'primary-teacher-quota-rules', title: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ ২০২৬: নারী কোটা ও জেলাভিত্তিক মেধার নিয়মাবলী', date: '২০ অক্টোবর ২০২৬', author: 'ফারহানা ইয়াসমিন', desc: 'প্রাথমিক শিক্ষক নিয়োগে নারী কোটা (৬০%), পোষ্য কোটা (২০%) ও বিজ্ঞান কোটার হিসাব-নিকাশ।' },
];

export default function BlogPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ব্লগ ও ক্যারিয়ার আর্টিকেল</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          চাকরি সেবা ব্লগ ও আর্টিকেল
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          সরকারি ও ব্যাংক পরীক্ষার বিশেষজ্ঞদের টিপস, বিশ্লেষণ ও প্রস্তুতির সর্বশেষ দিকনির্দেশনা।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((b) => (
          <Link
            key={b.slug}
            href={`/blog/${b.slug}`}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{b.date}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {b.title}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {b.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-emerald-700">
              <span>সম্পূর্ণ আর্টিকেল পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
