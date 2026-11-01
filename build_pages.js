const fs = require('fs');
const path = require('path');

const jobDetailCode = \'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Building2, 
  Clock, 
  Users, 
  GraduationCap, 
  Banknote, 
  CheckCircle2, 
  Volume2, 
  ArrowRight,
  Send,
  Calendar,
  FileText,
  Download,
  Share2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { mockJobs, mockUserProfile } from '@/data/mockJobs';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const job = mockJobs.find((j) => j.id === jobId) || mockJobs[0];

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(job.audioSummary);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className=\"max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8\">
      
      {/* Breadcrumb & Back */}
      <div className=\"flex items-center justify-between text-xs font-semibold text-slate-500\">
        <Link href=\"/\" className=\"flex items-center gap-1 hover:text-emerald-700 transition-colors\">
          <ChevronLeft className=\"w-4 h-4\" />
          <span>সকল সার্কুলারে ফিরে যান</span>
        </Link>
        <span className=\"bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md\">
          প্রকাশের তারিখ: {job.publishedDate}
        </span>
      </div>

      {/* Main Header Card */}
      <div className=\"bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden\">
        <div className=\"flex flex-col md:flex-row md:items-start justify-between gap-6\">
          
          <div className=\"space-y-3 flex-1\">
            <div className=\"flex flex-wrap items-center gap-2\">
              <span className=\"bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full\">
                {job.categoryLabel}
              </span>
              <span className=\"bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full\">
                {job.grade}
              </span>
              <span className=\"bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1\">
                <Users className=\"w-3.5 h-3.5\" />
                {job.totalPosts} টি পদ
              </span>
              <span className=\"bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1\">
                <Clock className=\"w-3.5 h-3.5\" />
                শেষ সময়: {job.deadline} ({job.daysRemaining} দিন বাকি)
              </span>
            </div>

            <h1 className=\"text-2xl sm:text-3xl font-black text-slate-900 leading-snug\">
              {job.title}
            </h1>

            <p className=\"text-sm font-semibold text-emerald-700 flex items-center gap-2\">
              <span className=\"text-xl\">{job.logo}</span>
              <span>{job.organization}</span>
            </p>
          </div>

          {/* Quick Apply CTA Box in Header */}
          <div className=\"bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center sm:min-w-[260px] space-y-3\">
            <div className=\"text-xs text-slate-600\">
              মোট খরচ: <span className=\"text-lg font-black text-emerald-800\">৳{job.govtFee + job.serviceFee}</span>
            </div>
            <div className=\"text-[11px] text-slate-500\">
              (সরকারি ফি ৳{job.govtFee} + টিম চার্জ ৳{job.serviceFee})
            </div>
            <Link
              href={\/apply/\\}
              className=\"w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 transition-all\"
            >
              <span>আমার হয়ে আবেদন করুন</span>
              <ArrowRight className=\"w-4 h-4\" />
            </Link>
            <p className=\"text-[10px] text-emerald-700 font-medium\">
              ⚡ ১-ক্লিকেই আপনার ভল্ট থেকে আবেদন জমা হবে
            </p>
          </div>

        </div>

        {/* Audio Circular Player Bar */}
        <div className=\"mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl\">
          <div className=\"flex items-center gap-3\">
            <button
              onClick={handlePlayAudio}
              className={\w-11 h-11 rounded-xl flex items-center justify-center transition-all \\}
              title=\"অডিও সারাংশ শুনুন\"
            >
              <Volume2 className=\"w-5 h-5\" />
            </button>
            <div>
              <div className=\"text-xs font-bold text-slate-900\">
                {isPlayingAudio ? 'অডিও সারাংশ চলছে...' : 'অডিওতে সার্কুলারটি শুনুন'}
              </div>
              <div className=\"text-[11px] text-slate-500\">
                গুরুত্বপূর্ণ শর্ত, পদসংখ্যা ও তারিখ সংক্ষেপে শুনুন
              </div>
            </div>
          </div>

          <div className=\"flex items-center gap-2\">
            <button
              onClick={handleCopy}
              className=\"text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5\"
            >
              <Share2 className=\"w-3.5 h-3.5 text-slate-500\" />
              <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'শেয়ার করুন'}</span>
            </button>
            <a
              href={\https://wa.me/?text=\\}
              target=\"_blank\"
              rel=\"noopener noreferrer\"
              className=\"text-xs font-bold text-white bg-green-600 px-3 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-1.5\"
            >
              <Send className=\"w-3.5 h-3.5\" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      {/* Auto-Eligibility Matcher Card */}
      <div className=\"bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-5 flex items-start gap-4\">
        <div className=\"w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5\">
          <CheckCircle2 className=\"w-6 h-6\" />
        </div>
        <div className=\"space-y-1\">
          <h3 className=\"text-sm font-bold text-emerald-950 flex items-center gap-2\">
            <span>আপনার প্রোফাইল অনুযায়ী যোগ্যতা বিশ্লেষণ:</span>
            <span className=\"bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-black\">
              যোগ্য প্রার্থী
            </span>
          </h3>
          <p className=\"text-xs text-slate-700 leading-relaxed\">
            আপনার বয়স (২৬ বছর) এবং শিক্ষাগত যোগ্যতা (অর্থনীতিতে ৪ বছর মেয়াদী স্নাতক, সিজিপিএ ৩.৬২) এই বিজ্ঞপ্তির সকল আবশ্যকীয় শর্তের সাথে নিখুঁতভাবে মিলে গেছে। আপনি নিশ্চিতভাবে আবেদন করতে পারেন।
          </p>
        </div>
      </div>

      {/* Key Details Table */}
      <div className=\"bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden\">
        <div className=\"px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800\">
          সার্কুলারের সংক্ষিপ্ত তথ্য তালিকা
        </div>
        <div className=\"divide-y divide-slate-100 text-xs sm:text-sm\">
          
          <div className=\"grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/50\">
            <span className=\"font-bold text-slate-500\">প্রতিষ্ঠানের নাম</span>
            <span className=\"sm:col-span-2 font-semibold text-slate-900\">{job.organization}</span>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/50\">
            <span className=\"font-bold text-slate-500\">পদের নাম ও সংখ্যা</span>
            <span className=\"sm:col-span-2 font-semibold text-slate-900\">{job.title} — মোট {job.totalPosts} টি পদ</span>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/50\">
            <span className=\"font-bold text-slate-500\">বেতন স্কেল ও গ্রেড</span>
            <span className=\"sm:col-span-2 font-semibold text-emerald-700\">{job.salary} ({job.grade})</span>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/50\">
            <span className=\"font-bold text-slate-500\">শিক্ষাগত যোগ্যতা</span>
            <span className=\"sm:col-span-2 font-semibold text-slate-900\">{job.minEducation}</span>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/50\">
            <span className=\"font-bold text-slate-500\">বয়সসীমা</span>
            <span className=\"sm:col-span-2 font-semibold text-slate-900\">{job.minAge} হতে {job.maxAge} বছর (কোটাধারীদের জন্য শিথিলযোগ্য)</span>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/50\">
            <span className=\"font-bold text-slate-500\">প্রযোজ্য জেলা</span>
            <span className=\"sm:col-span-2 font-semibold text-slate-900\">{job.districts}</span>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/50\">
            <span className=\"font-bold text-slate-500\">আবেদনের শেষ সময়</span>
            <span className=\"sm:col-span-2 font-bold text-rose-600\">{job.deadline} (রাত ১১:৫৯ মিনিট পর্যন্ত)</span>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/50\">
            <span className=\"font-bold text-slate-500\">অফিসিয়াল আবেদনের ওয়েবসাইট</span>
            <span className=\"sm:col-span-2 font-semibold text-blue-600 hover:underline\">
              <a href={job.officialLink} target=\"_blank\" rel=\"noopener noreferrer\">{job.officialLink}</a>
            </span>
          </div>

        </div>
      </div>

      {/* Official Circular Notice Preview */}
      <div className=\"bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4\">
        <div className=\"flex items-center justify-between\">
          <h3 className=\"text-lg font-bold text-slate-900 flex items-center gap-2\">
            <FileText className=\"w-5 h-5 text-emerald-600\" />
            <span>মূল সার্কুলার নোটিশ (Official Notice)</span>
          </h3>
          <a
            href={job.circularImage}
            target=\"_blank\"
            rel=\"noopener noreferrer\"
            className=\"text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1\"
          >
            <Download className=\"w-4 h-4\" />
            <span>সম্পূর্ণ নোটিশ ডাউনলোড করুন</span>
          </a>
        </div>

        <div className=\"rounded-2xl overflow-hidden border border-slate-200 max-h-[500px] bg-slate-100 flex items-center justify-center relative group\">
          <img 
            src={job.circularImage} 
            alt={job.title}
            className=\"w-full h-auto object-cover max-h-[500px]\"
          />
          <div className=\"absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center\">
            <a
              href={job.circularImage}
              target=\"_blank\"
              rel=\"noopener noreferrer\"
              className=\"bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl shadow-lg\"
            >
              পূর্ণ আকারে নোটিশটি দেখুন
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
\;

fs.writeFileSync(path.join(__dirname, 'src/app/jobs/[id]/page.tsx'), jobDetailCode, 'utf8');
console.log('Successfully wrote jobs/[id]/page.tsx');
