'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Download, 
  Search, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileQuestion,
  GraduationCap,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { initialQuestionBank, initialQuestionSets } from '@/lib/preparation/data';
import { QuestionBankItem } from '@/lib/preparation/types';

export default function QuestionBankClient() {
  const [questions] = useState<QuestionBankItem[]>(initialQuestionBank);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

  // Toggle explanation expand
  const toggleExplanation = (id: string) => {
    setExpandedSolutions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchCat = selectedCategory === 'all' || q.examCategory === selectedCategory;
      const matchSub = selectedSubject === 'all' || q.subject === selectedSubject;
      const term = searchQuery.toLowerCase().trim();
      const matchSearch = !term || 
        q.question.toLowerCase().includes(term) ||
        q.examName.toLowerCase().includes(term) ||
        q.explanation.toLowerCase().includes(term);
      return matchCat && matchSub && matchSearch;
    });
  }, [questions, selectedCategory, selectedSubject, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">বিগত বছরের প্রশ্নব্যাংক ও সমাধান</span>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              <span>বিগত ১০-২০ বছরের প্রশ্নব্যাংক</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              বিগত সালের প্রশ্ন ও বিস্তারিত ব্যাখ্যাসহ নির্ভুল সমাধান
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              বিসিএস, বাংলাদেশ ব্যাংক, প্রাথমিক শিক্ষক ও সরকারি নিয়োগ পরীক্ষার বিগত ১০ থেকে ২০ বছরের প্রশ্নপত্র, বিষয়ভিত্তিক সমাধান ও ফ্রি PDF ডাউনলোড।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-emerald-400 block font-mono">
                {toBn(questions.length)}+
              </span>
              <span className="text-xs text-slate-300 font-bold">সমাধানকৃত প্রশ্ন</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-amber-300 block font-mono">
                {toBn(initialQuestionSets.length)}টি
              </span>
              <span className="text-xs text-slate-300 font-bold">পূর্ণাঙ্গ PDF সেট</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="প্রশ্ন বা পরীক্ষার নাম লিখে খুঁজুন... (যেমন: চর্যাপদ, পদ্মা সেতু, সরল সুদ, বিসিএস)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Exam Categories */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            <span className="text-slate-400 pr-1 text-[11px] shrink-0">পরীক্ষা:</span>
            {[
              { id: 'all', label: 'সকল পরীক্ষা' },
              { id: 'bcs', label: 'বিসিএস (BCS)' },
              { id: 'bank', label: 'ব্যাংক নিয়োগ (Bank)' },
              { id: 'primary', label: 'প্রাথমিক শিক্ষক (DPE)' },
              { id: 'railway', label: 'রেলওয়ে (Railway)' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            <span className="text-slate-400 pr-1 text-[11px] shrink-0">বিষয়:</span>
            {[
              { id: 'all', label: 'সকল বিষয়' },
              { id: 'বাংলা', label: 'বাংলা' },
              { id: 'ইংরেজি', label: 'ইংরেজি' },
              { id: 'গণিত', label: 'গণিত' },
              { id: 'সাধারণ জ্ঞান', label: 'সাধারণ জ্ঞান' },
              { id: 'বিজ্ঞান ও তথ্যপ্রযুক্তি', label: 'বিজ্ঞান/ICT' }
            ].map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === sub.id ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Questions Counter & List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>মোট {toBn(filteredQuestions.length)}টি প্রশ্ন পাওয়া গেছে</span>
          <span className="text-emerald-700">১-ক্লিক সলিউশন ও ব্যাখ্যা সক্রিয়</span>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = Boolean(expandedSolutions[q.id]);
            return (
              <div 
                key={q.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/80 p-5 sm:p-7 shadow-sm transition-all space-y-4"
              >
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {q.examName}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                      {q.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      সাল: {q.year}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    #{toBn(idx + 1)}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-relaxed">
                  {q.question}
                </h3>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correctIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                          isExpanded && isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400/40'
                            : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isExpanded && isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}>
                          {optionLabels[optIdx]}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isExpanded && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Toggle Button */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleExplanation(q.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer hover:underline"
                  >
                    <span>{isExpanded ? 'ব্যাখ্যা লুকান' : 'সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা দেখুন'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      সঠিক উত্তর: ({optionLabels[q.correctIndex]}) {q.options[q.correctIndex]}
                    </span>
                  )}
                </div>

                {/* Detailed Solution Box */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/40 rounded-2xl border border-emerald-200/90 text-xs space-y-2 animate-in fade-in duration-200">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>বিস্তারিত নির্ভুল সমাধান ও রেফারেন্স:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed pl-5 whitespace-pre-line text-[11px]">
                      {q.explanation}
                    </p>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">কোনো প্রশ্ন পাওয়া যায়নি।</h3>
            <p className="text-xs text-slate-500">অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন অথবা সকল বিষয় নির্বাচন করুন।</p>
          </div>
        )}
      </div>

      {/* FULL DOWNLOADABLE QUESTION SETS COLLECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-700" />
              <span>বিগত বছরের সম্পূর্ণ প্রশ্নপত্র ও সলিউশন ডাউনলোড (PDF Archive)</span>
            </h3>
            <p className="text-xs text-slate-500">
              অফলাইনে প্রিন্ট করে অনুশীলনের জন্য সম্পূর্ণ প্রশ্নব্যাংক বিনামূল্যে সংগ্রহ করুন
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            ১০০% ফ্রি ডাউনলোড
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialQuestionSets.map((qs) => (
            <div 
              key={qs.id}
              className="p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-500 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                    সাল: {qs.year}
                  </span>
                  <span className="text-slate-400 font-mono">সাইজ: {qs.fileSize}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {qs.title}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  📥 {toBn(qs.downloads.toLocaleString())} বার ডাউনলোড
                </span>
                <a
                  href={qs.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF ডাউনলোড</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

