'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, Clock, RotateCcw, ArrowRight } from 'lucide-react';

const questions = [
  {
    id: 1,
    q: 'বাংলাদেশের কেন্দ্রীয় ব্যাংকের নাম কী?',
    options: ['সোনালী ব্যাংক', 'বাংলাদেশ ব্যাংক', 'জনতা ব্যাংক', 'অগ্রণী ব্যাংক'],
    ans: 1
  },
  {
    id: 2,
    q: 'বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?',
    options: ['পদ্মাবতী', 'মেঘনাদবধ কাব্য', 'অন্নদামঙ্গল', 'সধবার একাদশী'],
    ans: 1
  },
  {
    id: 3,
    q: 'একটি পণ্যের দাম ২০% বৃদ্ধি পাওয়ার পর আবার ২০% হ্রাস পেলে মূল দামের কী পরিবর্তন হবে?',
    options: ['কোনো পরিবর্তন হবে না', '৪% হ্রাস পাবে', '২% বৃদ্ধি পাবে', '৪% বৃদ্ধি পাবে'],
    ans: 1
  },
  {
    id: 4,
    q: 'জাতিসংঘের বর্তমান মহাসচিব কোন দেশের নাগরিক?',
    options: ['দক্ষিণ কোরিয়া', 'পর্তুগাল', 'ঘানা', 'মিশর'],
    ans: 1
  },
  {
    id: 5,
    q: 'Which one is the correct spelling?',
    options: ['Lieutenant', 'Leftenant', 'Lieutennant', 'Leftenent'],
    ans: 0
  }
];

export default function ModelTestsPage() {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = Object.keys(selected).reduce((acc, qId) => {
    const qIndex = parseInt(qId, 10);
    return selected[qIndex] === questions[qIndex].ans ? acc + 1 : acc;
  }, 0);

  const resetTest = () => {
    setSelected({});
    setSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">অনলাইন মডেল টেস্ট</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          লাইভ প্র্যাকটিস কুইজ
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
          সরকারি ও ব্যাংক জব মডেল টেস্ট ২০২৬
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          সঠিক উত্তরের মাধ্যমে প্রস্তুতি যাচাই করুন এবং তাৎক্ষণিক ফলাফল দেখুন।
        </p>
      </div>

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 sm:p-8 text-center space-y-3">
          <Award className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">
            আপনার টেস্ট স্কোর: {score} / {questions.length}
          </h2>
          <p className="text-sm text-slate-600">
            {score >= 4 ? 'দারুণ প্রস্তুতি! আপনি সফলতার সঠিক ট্র্যাকে আছেন।' : 'আরও প্রস্তুতি প্রয়োজন। বিগত বছরের প্রশ্নব্যাংক অনুশীলন করুন।'}
          </p>
          <button
            onClick={resetTest}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>পুনরায় টেস্ট দিন</span>
          </button>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
              {idx + 1}. {q.q}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, oIdx) => {
                const isChosen = selected[idx] === oIdx;
                const isCorrect = q.ans === oIdx;

                let optClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                if (isChosen) {
                  optClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                }
                if (submitted) {
                  if (isCorrect) optClass = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold';
                  else if (isChosen && !isCorrect) optClass = 'bg-rose-100 border-rose-600 text-rose-950 font-bold';
                }

                return (
                  <button
                    key={oIdx}
                    disabled={submitted}
                    onClick={() => setSelected(prev => ({ ...prev, [idx]: oIdx }))}
                    className={`p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${optClass}`}
                  >
                    <span>{opt}</span>
                    {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!submitted && (
          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-2xl shadow-md transition-colors"
          >
            সাবমিট করুন ও ফলাফল দেখুন
          </button>
        )}
      </div>
    </div>
  );
}
