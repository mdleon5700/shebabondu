'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ArrowRight,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileQuestion,
  ChevronRight,
  Check,
  X,
  BookOpen,
  Trophy,
  BarChart3
} from 'lucide-react';
import { initialModelTests } from '@/lib/preparation/data';
import { ModelTestItem } from '@/lib/preparation/types';

export default function ModelTestsClient() {
  const [modelTests] = useState<ModelTestItem[]>(initialModelTests);
  const [activeTest, setActiveTest] = useState<ModelTestItem | null>(null);
  const [mode, setMode] = useState<'list' | 'testing' | 'result'>('list');

  // Candidate answers: { questionIndex: chosenOptionIndex }
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  // Countdown timer in seconds
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

  // Start a test
  const handleStartTest = (test: ModelTestItem) => {
    setActiveTest(test);
    setUserAnswers({});
    setTimeLeft(test.durationMinutes * 60);
    setMode('testing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Timer countdown effect
  useEffect(() => {
    if (mode === 'testing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, timeLeft]);

  // Submit test
  const handleSubmitTest = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake current test
  const handleRetakeTest = () => {
    if (!activeTest) return;
    setUserAnswers({});
    setTimeLeft(activeTest.durationMinutes * 60);
    setMode('testing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Score computation
  const resultsSummary = React.useMemo(() => {
    if (!activeTest) return { correct: 0, wrong: 0, unattempted: 0, rawScore: 0, netScore: 0, accuracy: 0 };

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    activeTest.questions.forEach((q, idx) => {
      const chosen = userAnswers[idx];
      if (chosen === undefined) {
        unattempted++;
      } else if (chosen === q.ans) {
        correct++;
      } else {
        wrong++;
      }
    });

    const penalty = wrong * activeTest.negativeMarking;
    const netScore = Math.max(0, Number((correct - penalty).toFixed(2)));
    const totalAttempted = correct + wrong;
    const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

    return {
      correct,
      wrong,
      unattempted,
      penalty,
      netScore,
      accuracy
    };
  }, [activeTest, userAnswers]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        {mode !== 'list' && (
          <>
            <button 
              type="button"
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                setMode('list');
              }}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              অনলাইন মডেল টেস্ট
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-bold">
          {mode === 'list' ? 'অনলাইন মডেল টেস্ট' : activeTest?.title}
        </span>
      </div>

      {/* ========================================================
          MODE 1: MODEL TESTS DIRECTORY LIST
          ======================================================== */}
      {mode === 'list' && (
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
            <div className="max-w-2xl space-y-3">
              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                <Trophy className="w-3.5 h-3.5" />
                <span>লাইভ প্র্যাকটিস টেস্ট ২০২৬</span>
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                অনলাইন লাইভ মডেল টেস্ট ও স্বয়ংক্রিয় মেরিট লিস্ট
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                বিসিএস, প্রাথমিক সহকারী শিক্ষক ও বাংলাদেশ ব্যাংকের সিলেবাস অনুযায়ী টাইমারভিত্তিক রিয়েল-টাইম মডেল টেস্ট দিন। নেগেটিভ মার্কিংসহ তাৎক্ষণিক স্কোর ও ব্যাখ্যা দেখুন।
              </p>
            </div>
          </div>

          {/* Test Cards List */}
          <div className="space-y-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>উপলব্ধ সকল স্পেশাল মডেল টেস্ট:</span>
            </h2>

            <div className="grid grid-cols-1 gap-5">
              {modelTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-md">
                        {test.categoryLabel}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>সময়: {toBn(test.durationMinutes)} মিনিট</span>
                      </span>
                      <span className="bg-rose-50 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-rose-200">
                        ভুল উত্তরে -{toBn(test.negativeMarking)} কাটা
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {test.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {test.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-1">
                      <span>মোট প্রশ্ন: <strong className="text-emerald-800 font-mono">{toBn(test.questionsCount)}টি</strong></span>
                      <span>মোট নম্বর: <strong className="text-emerald-800 font-mono">{toBn(test.totalMarks)}</strong></span>
                      <span>পাস মার্কস: <strong className="text-slate-900 font-mono">{toBn(test.passingScore)}</strong></span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => handleStartTest(test)}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
                    >
                      <span>টেস্ট শুরু করুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: ACTIVE LIVE TEST IN PROGRESS
          ======================================================== */}
      {mode === 'testing' && activeTest && (
        <div className="space-y-6">
          
          {/* Sticky Countdown Header Bar */}
          <div className="sticky top-4 z-40 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-700 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">
                চলমান মডেল টেস্ট:
              </span>
              <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md">
                {activeTest.title}
              </h2>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {/* Progress Count */}
              <div className="hidden sm:block text-right">
                <span className="text-[11px] text-slate-400 font-bold block">উত্তর দিয়েছেন:</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {toBn(Object.keys(userAnswers).length)} / {toBn(activeTest.questions.length)}টি
                </span>
              </div>

              {/* Countdown Timer */}
              <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-black text-base sm:text-lg ${
                timeLeft < 60
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : timeLeft < 180
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{toBn(formatTime(timeLeft))}</span>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {activeTest.questions.map((q, idx) => {
              const chosen = userAnswers[idx];
              return (
                <div 
                  key={q.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      প্রশ্ন নং {toBn(idx + 1)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      বিষয়: {q.subject}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    {q.q}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = chosen === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            setUserAnswers(prev => ({
                              ...prev,
                              [idx]: oIdx
                            }));
                          }}
                          className={`p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/40 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                          }`}>
                            {optionLabels[oIdx]}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              আপনি <strong className="text-slate-900 font-mono font-bold">{toBn(Object.keys(userAnswers).length)}</strong>টি প্রশ্নের উত্তর দিয়েছেন (অবশিষ্ট: <strong className="text-rose-600 font-mono font-bold">{toBn(activeTest.questions.length - Object.keys(userAnswers).length)}</strong>টি)।
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (confirm('আপনি কি সত্যিই পরীক্ষা বাতিল করে ফিরে যেতে চান?')) {
                    if (timerRef.current) clearTimeout(timerRef.current);
                    setMode('list');
                  }
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={handleSubmitTest}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
              >
                <span>টেস্ট সাবমিট করুন ও ফলাফল দেখুন</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 3: POST-TEST RESULTS ANALYTICS & ANSWER SHEET REVIEW
          ======================================================== */}
      {mode === 'result' && activeTest && (
        <div className="space-y-8">
          
          {/* Result Score Card */}
          <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/50 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>টেস্ট সম্পন্ন হয়েছে</span>
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white mt-2">
                  {activeTest.title}
                </h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-300 block">আপনার মোট অর্জিত নম্বর:</span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                  {toBn(resultsSummary.netScore)} <span className="text-lg text-slate-300 font-sans">/ {toBn(activeTest.totalMarks)}</span>
                </div>
              </div>
            </div>

            {/* Performance Verdict Pill */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-center gap-3 ${
              resultsSummary.netScore >= activeTest.passingScore
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
            }`}>
              <Trophy className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>
                {resultsSummary.netScore >= activeTest.passingScore
                  ? `🎉 অভিনন্দন! আপনি সফলভাবে পাস করেছেন (পাস মার্কস ছিল ${toBn(activeTest.passingScore)})। আপনার প্রস্তুতি সঠিক ট্র্যাকে রয়েছে।`
                  : `⚠️ পাস করতে আরও কিছু নম্বর প্রয়োজন ছিল (পাস মার্কস ছিল ${toBn(activeTest.passingScore)})। দুর্বল অধ্যায়গুলোতে বেশি নজর দিন এবং রিভিশন দিন।`}
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-xs text-emerald-300 block font-bold">সঠিক উত্তর</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">
                  {toBn(resultsSummary.correct)}টি
                </span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-xs text-rose-300 block font-bold">ভুল উত্তর (-{toBn(resultsSummary.penalty)})</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">
                  {toBn(resultsSummary.wrong)}টি
                </span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300 block font-bold">উত্তর দেননি</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">
                  {toBn(resultsSummary.unattempted)}টি
                </span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-xs text-amber-300 block font-bold">নির্ভুলতার হার</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">
                  {toBn(resultsSummary.accuracy)}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetakeTest}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>পুনরায় পরীক্ষা দিন</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                অন্যান্য মডেল টেস্ট দেখুন
              </button>
            </div>
          </div>

          {/* QUESTION BY QUESTION SOLUTION REVIEW */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <span>সম্পূর্ণ উত্তরপত্র ও ভুল ত্রুটি সংশোধন (Answer Sheet Review):</span>
            </h3>

            <div className="space-y-4">
              {activeTest.questions.map((q, idx) => {
                const userChoice = userAnswers[idx];
                const isCorrect = userChoice === q.ans;
                const isSkipped = userChoice === undefined;

                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-sm space-y-3 transition-all ${
                      isCorrect 
                        ? 'border-emerald-300' 
                        : isSkipped 
                        ? 'border-slate-200' 
                        : 'border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          প্রশ্ন নং {toBn(idx + 1)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {q.subject}
                        </span>
                      </div>

                      <div>
                        {isCorrect ? (
                          <span className="bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>সঠিক (+১)</span>
                          </span>
                        ) : isSkipped ? (
                          <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded">
                            উত্তর দেননি (০)
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-900 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <X className="w-3 h-3 text-rose-700" />
                            <span>ভুল (-{toBn(activeTest.negativeMarking)})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                      {q.q}
                    </h4>

                    {/* Options Review */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isThisCorrect = q.ans === oIdx;
                        const isThisUserChoice = userChoice === oIdx;

                        let style = 'bg-slate-50 border-slate-200 text-slate-600';
                        if (isThisCorrect) {
                          style = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-300';
                        } else if (isThisUserChoice && !isThisCorrect) {
                          style = 'bg-rose-50 border-rose-300 text-rose-950 font-bold line-through';
                        }

                        return (
                          <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">({optionLabels[oIdx]})</span>
                              <span>{opt}</span>
                            </div>
                            {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>ব্যাখ্যা ও সঠিক তথ্য:</span>
                      </span>
                      <p className="text-[11px] text-slate-600 pl-4 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
