'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Download, 
  Search, 
  FileText, 
  Award, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface QuestionItem {
  id: string;
  title: string;
  category: string;
  year: string;
  fileSize: string;
  downloads: number;
}

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const questionList: QuestionItem[] = [
    {
      id: 'bcs-46-preli',
      title: '৪৬তম বিসিএস প্রিলিমিনারি পরীক্ষার প্রশ্ন ও নির্ভুল সমাধান',
      category: 'bcs',
      year: '২০২৪',
      fileSize: '৩.৪ MB',
      downloads: 14200
    },
    {
      id: 'bb-ad-2023',
      title: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (জেনারেল) নিয়োগ পরীক্ষার প্রশ্নব্যাংক',
      category: 'bank',
      year: '২০২৩',
      fileSize: '৪.২ MB',
      downloads: 9800
    },
    {
      id: 'dpe-teacher-prev',
      title: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ বিগত ৫ বছরের প্রশ্ন ও সমাধান',
      category: 'teacher',
      year: '২০২২-২০২৪',
      fileSize: '৬.১ MB',
      downloads: 28500
    },
    {
      id: 'railway-asm-2023',
      title: 'বাংলাদেশ রেলওয়ে সহকারী স্টেশন মাস্টার ও গার্ড পদের প্রশ্নব্যাংক',
      category: 'railway',
      year: '২০২৩',
      fileSize: '২.৮ MB',
      downloads: 6500
    },
    {
      id: 'combined-10-bank',
      title: 'সমন্বিত ১০ ব্যাংক সিনিয়র অফিসার ও অফিসার পদে বিগত ৩ বছরের প্রশ্ন',
      category: 'bank',
      year: '২০২৪',
      fileSize: '৫.৬ MB',
      downloads: 18300
    },
    {
      id: 'bcs-45-written',
      title: '৪৫তম বিসিএস লিখিত পরীক্ষার সম্পূর্ণ প্রশ্নপত্র সংকলন',
      category: 'bcs',
      year: '২০২৩',
      fileSize: '৪.৮ MB',
      downloads: 7400
    }
  ];

  const filtered = questionList.filter(item => {
    const matchCat = selectedCat === 'all' || item.category === selectedCat;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          ফ্রি স্টাডি ম্যাটেরিয়াল
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          বিগত সালের প্রশ্ন ও ব্যাখ্যাসহ সমাধান
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          বিসিএস, বিভিন্ন ব্যাংক এবং প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার বিগত ১০ বছরের প্রশ্নপত্র ও সমাধান PDF সম্পূর্ণ বিনামূল্যে ডাউনলোড করুন।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পরীক্ষার নাম বা সাল লিখে খুঁজুন... (উদা: বিসিএস, ব্যাংক)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'সকল প্রশ্ন' },
              { id: 'bcs', label: 'বিসিএস' },
              { id: 'bank', label: 'ব্যাংক জব' },
              { id: 'teacher', label: 'শিক্ষক নিয়োগ' },
              { id: 'railway', label: 'রেলওয়ে' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCat === cat.id ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div 
            key={item.id} 
            className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  বছর: {item.year}
                </span>
                <span className="text-slate-400">সাইজ: {item.fileSize}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {item.title}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 text-[11px]">
                📥 {item.downloads.toLocaleString()} বার ডাউনলোড হয়েছে
              </span>
              <button 
                onClick={() => alert(`'${item.title}' পিডিএফ ফাইলটি ডাউনলোড হচ্ছে...`)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF ডাউনলোড</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
