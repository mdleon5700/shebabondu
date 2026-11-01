import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Calendar, User, ArrowRight, Share2, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ব্লগ আর্টিকেল | চাকরি সেবা',
  description: 'সরকারি ও ব্যাংক নিয়োগ পরীক্ষার প্রস্তুতি ও ক্যারিয়ার বিশ্লেষণ।',
};

export default function SingleBlogPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-emerald-700 transition-colors">ব্লগ</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{params.slug}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
          ক্যারিয়ার বিশ্লেষণ ও গাইড
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          সরকারি ও ব্যাংক নিয়োগ পরীক্ষার প্রস্তুতি কৌশল ও চূড়ান্ত দিকনির্দেশনা
        </h1>
        <div className="flex items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
          <span>প্রকাশ: ২৮ অক্টোবর ২০২৬</span>
          <span>•</span>
          <span>লেখক: চাকরি সেবা রিসার্চ টিম</span>
        </div>

        <div className="space-y-4 text-base text-slate-700 leading-relaxed">
          <p>
            বাংলাদেশে সরকারি চাকরির পরীক্ষাগুলোতে প্রতিদিন লক্ষ লক্ষ প্রার্থী অংশ নেন। তবে সঠিক পরিকল্পনা ও সময় ব্যবস্থাপনার অভাবে অনেকেই তাঁদের কাঙ্ক্ষিত ফলাফল অর্জন করতে পারেন না।
          </p>
          <p>
            প্রথমেই বিসিএস ও ব্যাংক নিয়োগের বিগত ১০ বছরের প্রশ্ন বিশদভাবে বিশ্লেষণ করা উচিত। এর মাধ্যমে কোন কোন অধ্যায় থেকে নিয়মিত প্রশ্ন আসে তা পরিষ্কার বোঝা যায়।
          </p>
          <p>
            প্রতিদিন অন্তত ১ ঘণ্টা গণিত ও ইংরেজি গ্রামার নিয়মিত অনুশীলন করুন এবং বাংলা সাহিত্যের ক্ষেত্রে প্রাচীন, মধ্য ও আধুনিক যুগের গুরুত্বপূর্ণ লেখকদের সাহিত্যকর্ম বারবার রিভিশন দিন।
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <Link href="/career-guides" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline">
            <span>সকল ক্যারিয়ার গাইড দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
