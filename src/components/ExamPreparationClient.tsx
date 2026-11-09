'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Calculator,
  Languages,
  BookText,
  Landmark,
  Globe,
  Cpu,
  Check,
  RotateCcw,
  BookMarked,
  FileQuestion,
  GraduationCap
} from 'lucide-react';
import { examSyllabusData } from '@/lib/preparation/data';

export default function ExamPreparationClient() {
  const [selectedExamType, setSelectedExamType] = useState<'bcs' | 'primary' | 'bank'>('bcs');
  const [activeSubjectId, setActiveSubjectId] = useState<string>('bangla');
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});

  const activeSubject = useMemo(() => {
    return examSyllabusData.find(s => s.id === activeSubjectId) || examSyllabusData[0];
  }, [activeSubjectId]);

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  // Toggle completed topic
  const toggleTopic = (topicKey: string) => {
    setCompletedTopics(prev => ({
      ...prev,
      [topicKey]: !prev[topicKey]
    }));
  };

  // Calculate subject progress
  const subjectTopicsCount = activeSubject.topics.length;
  const subjectCompletedCount = activeSubject.topics.filter((_, idx) => 
    Boolean(completedTopics[`${activeSubject.id}-${idx}`])
  ).length;
  const progressPercent = Math.round((subjectCompletedCount / (subjectTopicsCount || 1)) * 100);

  // Get marks based on selected exam type
  const getSubjectMarks = (subject: typeof examSyllabusData[0]) => {
    if (selectedExamType === 'bcs') return subject.bcsMarks;
    if (selectedExamType === 'primary') return subject.primaryMarks;
    return subject.bankMarks;
  };

  const totalExamMarks = selectedExamType === 'bcs' ? 200 : (selectedExamType === 'primary' ? 80 : 100);

  // Icon mapping
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookText': return <BookText className="w-4 h-4" />;
      case 'Languages': return <Languages className="w-4 h-4" />;
      case 'Calculator': return <Calculator className="w-4 h-4" />;
      case 'Landmark': return <Landmark className="w-4 h-4" />;
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">নিয়োগ পরীক্ষার প্রস্তুতি ও সিলেবাস</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্মার্ট স্টাডি প্ল্যান ও মানবন্টন ২০২৬</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              চাকরির পরীক্ষার বিষয়ভিত্তিক পূর্ণাঙ্গ সিলেবাস ও স্টাডি গাইড
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              বিসিএস, প্রাথমিক সহকারী শিক্ষক ও সরকারি ব্যাংকের প্রিলিমিনারি পরীক্ষার বিষয়ভিত্তিক সিলেবাস, টপিক চেকলিস্ট ও সেরা বুক রেফারেন্স।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <Link
              href="/previous-year-questions"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <FileQuestion className="w-4 h-4 text-emerald-400" />
              <span>বিগত বছরের প্রশ্নব্যাংক</span>
            </Link>
            <Link
              href="/model-tests"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>অনলাইন লাইভ মডেল টেস্ট</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Exam Pattern & Marks Selector */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <span>পরীক্ষার ধরন ও মানবন্টন নির্বাচন করুন:</span>
            </h3>
            <p className="text-xs text-slate-500">
              পরীক্ষা নির্বাচন করলে সংশ্লিষ্ট সিলেবাস অনুযায়ী নম্বর বিভাজন স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'bcs', label: 'বিসিএস প্রিলিমিনারি (২০০ নম্বর)' },
              { id: 'primary', label: 'প্রাথমিক শিক্ষক (৮০ নম্বর)' },
              { id: 'bank', label: 'ব্যাংক জব (১০০ নম্বর)' }
            ].map((exam) => (
              <button
                key={exam.id}
                type="button"
                onClick={() => setSelectedExamType(exam.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExamType === exam.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {exam.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Marks Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center">
          {examSyllabusData.map((s) => (
            <div 
              key={s.id} 
              onClick={() => setActiveSubjectId(s.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                activeSubjectId === s.id
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-600 block truncate">
                {s.subjectName.split(' ')[0]}
              </span>
              <span className="text-base font-black text-emerald-800 font-mono">
                {toBn(getSubjectMarks(s))} নম্বর
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Two-Column Subject Syllabus & Checklist Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Subject Selector Tabs */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2 pb-1">
              বিষয় তালিকা
            </span>
            {examSyllabusData.map((s) => {
              const isSelected = activeSubjectId === s.id;
              const marks = getSubjectMarks(s);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSubjectId(s.id)}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isSelected ? 'text-white' : 'text-emerald-700'}>
                      {getIcon(s.iconName)}
                    </span>
                    <span className="text-xs truncate">{s.subjectName}</span>
                  </div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}>
                    {toBn(marks)} নম্বর
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subject Strategy Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl border border-amber-200 p-5 space-y-2.5">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>বিষয়ভিত্তিক প্রস্তুতির কৌশল:</span>
            </span>
            <p className="text-xs text-amber-950 leading-relaxed">
              {activeSubject.preparationStrategy}
            </p>
          </div>
        </div>

        {/* Right Side: Active Subject Details & Interactive Topic Checklist */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header with Progress Bar */}
            <div className="border-b border-slate-100 pb-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-md">
                      {toBn(getSubjectMarks(activeSubject))} নম্বর বরাদ্দ
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      মোট {toBn(totalExamMarks)} নম্বরের পরীক্ষায়
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {activeSubject.subjectName}
                  </h2>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-500 block">
                    স্টাডি অগ্রগতি: <strong className="text-emerald-700 font-mono text-sm">{toBn(progressPercent)}%</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({toBn(subjectCompletedCount)}/{toBn(subjectTopicsCount)}টি টপিক সম্পন্ন)
                  </span>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Interactive Topics Checklist */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
                <span>সিলেবাসের গুরুত্বপূর্ণ অধ্যায়সমূহ (পড়া শেষ হলে টিক দিন):</span>
                {subjectCompletedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...completedTopics };
                      activeSubject.topics.forEach((_, idx) => {
                        delete updated[`${activeSubject.id}-${idx}`];
                      });
                      setCompletedTopics(updated);
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>রিসেট করুন</span>
                  </button>
                )}
              </h3>

              <div className="space-y-3">
                {activeSubject.topics.map((topic, idx) => {
                  const topicKey = `${activeSubject.id}-${idx}`;
                  const isChecked = Boolean(completedTopics[topicKey]);
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleTopic(topicKey)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/40' 
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold leading-snug ${
                              isChecked ? 'line-through text-emerald-950 font-semibold' : 'text-slate-900'
                            }`}>
                              {topic.title}
                            </span>
                            {topic.marks && (
                              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
                                ~{toBn(topic.marks)} নম্বর
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {topic.subtopics.map((st, sIdx) => (
                              <span 
                                key={sIdx}
                                className="text-[10px] bg-white/80 border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Reference Books */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-emerald-700" />
                <span>প্রস্তুতির জন্য সেরা সহায়ক বইসমূহ (Recommended Books):</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeSubject.recommendedBooks.map((book, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{book}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

