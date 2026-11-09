import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  Award, 
  Sparkles, 
  Clock, 
  MapPin, 
  HeartHandshake, 
  FileCheck2, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Headphones,
  Check
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে (About Us) | চাকরি সেবা বাংলাদেশ',
  description: 'চাকরি সেবা প্ল্যাটফর্মের লক্ষ্য, উদ্দেশ্য, ৫টি মূল ভিত্তি এবং পেশাদার টিম পরিচিতি।',
};

export default function AboutUsPage() {
  const stats = [
    { label: 'যাচাইকৃত চাকরি বিজ্ঞপ্তি', value: '৫,০০০+', subtext: '১০০% সরকারি গেজেট ও দৈনিক থেকে যাচাইকৃত' },
    { label: 'নিবন্ধিত সক্রিয় চাকরিপ্রার্থী', value: '১২০,০০০+', subtext: '৬৪টি জেলা থেকে নিয়মিত সেবা গ্রহণকারী' },
    { label: 'সফল আবেদন ও ট্র্যাকিং রেট', value: '৯৯.৪%', subtext: 'কোনো ফর্ম বাতিল বা সাইজ রিজেকশন ছাড়াই' },
    { label: 'জরুরি হেল্পডেস্ক সমাধান', value: '১৫ মিনিট', subtext: 'সকাল ৯:০০টা হতে রাত ১১:০০টা লাইভ সাপোর্ট' },
  ];

  const pillars = [
    {
      title: '১. নির্ভুল সার্কুলার স্ক্রিনিং ও ভেরিফিকেশন',
      desc: 'আমাদের রিসার্চ সেল প্রতিদিন বিপিএসসি (BPSC), বাংলাদেশ ব্যাংক এবং সরকারের প্রতিটি মন্ত্রণালয় ও অধিদপ্তরের অফিশিয়াল নোটিশবোর্ড এবং মূল গেজেট থেকে সরাসরি তথ্য যাচাই করে নির্ভুল সার্কুলার প্রকাশ করে। ভুয়া বা বিভ্রান্তিকর চাকরির কোনো স্থান নেই।',
      icon: ShieldCheck,
      color: 'bg-emerald-100 text-emerald-800'
    },
    {
      title: '২. স্মার্ট ডকুমেন্ট ভল্ট ও অটো-রিসাইজার',
      desc: 'সাইবার ক্যাফেতে ঘণ্টার পর ঘণ্টা ছবি রিসাইজ করার ভোগান্তি দূর করতে আমরা নিয়ে এসেছি নিজস্ব বিল্ট-ইন অটো রিসাইজার। সরকারি টেলিটক ফরম্যাটের ৩০০×৩০০ পিক্সেল ছবি এবং ৩০০×৮০ পিক্সেল স্বাক্ষর এক ক্লিকেই তৈরি হয়ে যায়।',
      icon: Sparkles,
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      title: '৩. ৫-ধাপের স্বচ্ছ লাইভ আবেদন ট্র্যাকিং',
      desc: 'আবেদনের প্রতিটি ধাপ—ডাটা ভ্যালিডেশন, ফর্ম পূরণ, চালানের মাধ্যমে সরকারি ফি প্রদান এবং Applicant Copy PDF তৈরি—প্রার্থী তার নিজস্ব ড্যাশবোর্ডে এবং এসএমএস নোটিফিকেশনের মাধ্যমে সরাসরি দেখতে পান।',
      icon: FileCheck2,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      title: '৪. সময়মতো প্রবেশপত্র ও পরীক্ষার নোটিশ',
      desc: 'আবেদন করার পর অনেকেই পরীক্ষার তারিখ বা এডমিট কার্ডের নোটিশ ভুলে যান। চাকরি সেবা সিস্টেম প্রার্থীকে পরীক্ষার তারিখ, সিট প্ল্যান ও ফলাফল প্রকাশের সাথে সাথে সরাসরি এসএমএস ও ইমেইলে অ্যালার্ট পাঠায়।',
      icon: Clock,
      color: 'bg-sky-100 text-sky-800'
    },
    {
      title: '৫. সর্বোচ্চ ব্যাংকিং গ্রেড ডেটা নিরাপত্তা',
      desc: 'প্রার্থীর জাতীয় পরিচয়পত্র (NID), শিক্ষাগত সনদ ও ব্যক্তিগত তথ্য আধুনিক এনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে। প্রার্থীর সুস্পষ্ট অনুমতি ব্যতিরেকে কোনো তৃতীয় পক্ষের কাছে তথ্য শেয়ার করা সম্পূর্ণ নিষিদ্ধ।',
      icon: Lock,
      color: 'bg-rose-100 text-rose-800'
    }
  ];

  const departments = [
    {
      dept: 'সার্কুলার রিসার্চ ও লিগ্যাল ভেরিফিকেশন সেল',
      role: 'সরকারি গেজেট নিরীক্ষা ও ভুয়া বিজ্ঞপ্তি প্রতিরোধ',
      lead: 'মুহাম্মদ রেজাউল করিম',
      desc: 'বাংলাদেশ সিভিল সার্ভিস, জুডিশিয়াল সার্ভিস ও রাষ্ট্রায়ত্ত ব্যাংকসমূহের নিয়োগবিধিমালার পুঙ্খানুপুঙ্খ যাচাই এবং শিক্ষাগত যোগ্যতার শর্তাবলি বিশ্লেষণকারী বিশেষজ্ঞ দল।'
    },
    {
      dept: 'এআই ও সফটওয়্যার ইঞ্জিনিয়ারিং টিম',
      role: 'স্মার্ট ম্যাচিং অ্যালগরিদম ও প্ল্যাটফর্ম সিকিউরিটি',
      lead: 'তানভীর আহমেদ',
      desc: 'প্রার্থীদের সিজিপিএ, বিষয় ও বয়স অনুযায়ী স্বয়ংক্রিয় যোগ্যতা নির্ণায়ক ইঞ্জিন, ক্লাউড অটোমেশন ও ডকুমেন্ট রিসাইজিং টুলসের স্থপতি।'
    },
    {
      dept: 'অ্যাপ্লিকেশন প্রসেসিং ও টেলিটক ডাটা এন্ট্রি স্কোয়াড',
      role: 'নিখুঁত ফর্ম ফিলআপ ও অফিসিয়াল ট্র্যাকিং',
      lead: 'নাজমুন নাহার শেলী',
      desc: 'টেলিটক ও অন্যান্য সরকারি পোর্টালে প্রার্থীর তথ্য নির্ভুলভাবে ইনপুট, সরকারি ফি জমা এবং অফিসিয়াল ট্রানজেকশন রসিদ নিশ্চিতকারী পেশাদার স্কোয়াড।'
    },
    {
      dept: 'ক্যান্ডিডেট কেয়ার ও হেল্পডেস্ক সাপোর্ট',
      role: 'লাইভ চ্যাট, ফোন ও টিকেট সমাধান',
      lead: 'ফারহানা ইয়াসমিন',
      desc: 'সকাল ৯টা থেকে রাত ১১টা পর্যন্ত চাকরিপ্রার্থীদের যেকোনো ফি সংক্রান্ত জিজ্ঞাসা, আবেদন ত্রুটি ও টিকেট ট্র্যাকিংয়ে সার্বক্ষণিক সহায়তা প্রদানকারী দল।'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">আমাদের সম্পর্কে</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 2. Hero Section */}
        <div className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-14 shadow-lg relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-800/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>আমাদের লক্ষ্য ও প্রতিশ্রুতি — চাকরি সেবা ২০২৬</span>
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight">
              বাংলাদেশের প্রতিটি চাকরিপ্রার্থীর বিশ্বস্ত ক্যারিয়ার ও আবেদন প্ল্যাটফর্ম
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed max-w-2xl">
              সাইবার ক্যাফের ভোগান্তি ও ভুলের অবসান ঘটিয়ে ঘরে বসেই সরকারি ও ব্যাংকিং খাতের নিয়োগে শতভাগ নির্ভুল আবেদন, প্রস্তুতি ও রিয়েলটাইম পরীক্ষার নোটিফিকেশন নিশ্চিত করাই আমাদের প্রধান অঙ্গীকার।
            </p>

            <div className="flex flex-wrap gap-3 pt-3 text-xs font-semibold text-emerald-200">
              <span className="flex items-center gap-1.5 bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700">
                <Check className="w-4 h-4 text-emerald-400" />
                ১০০% সরকারি ওপেন ডেটা যাচাইকৃত
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700">
                <Check className="w-4 h-4 text-emerald-400" />
                ব্যাংকিং-গ্রেড ডেটা সুরক্ষা
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700">
                <Check className="w-4 h-4 text-emerald-400" />
                স্বচ্ছ ও জবাবদিহিতামূলক হেল্পডেস্ক
              </span>
            </div>
          </div>
        </div>

        {/* 3. Live Verified Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-2 shadow-xs">
              <div className="text-3xl font-black text-emerald-800 font-mono">{s.value}</div>
              <div className="text-sm font-bold text-slate-900">{s.label}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.subtext}</p>
            </div>
          ))}
        </div>

        {/* 4. Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">আমাদের লক্ষ্য (Our Mission)</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              বাংলাদেশের প্রত্যন্ত অঞ্চলসহ প্রতিটি চাকরিপ্রার্থীর কাছে সরকারি মন্ত্রণালয়, ব্যাংক, স্বায়ত্তশাসিত প্রতিষ্ঠান ও ডিফেন্সের আসল ও নির্ভুল নিয়োগ বিজ্ঞপ্তি দ্রুততম সময়ে পৌঁছে দেওয়া। এছাড়া জটিল আবেদন ফরম পূরণ ও ছবি সাইজিংয়ের কারণে যেন কোনো প্রার্থীর চাকরির স্বপ্ন বিনষ্ট না হয়, তা প্রযুক্তি ও বিশেষজ্ঞ টিমের মাধ্যমে নিশ্চিত করা।
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">আমাদের স্বপ্ন (Our Vision)</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              একটি ডিজিটাল বাংলাদেশ বিনির্মাণে সম্পূর্ণ স্বচ্ছ, জবাবদিহিতামূলক ও প্রযুক্তিবান্ধব ক্যারিয়ার ইকোসিস্টেম গড়ে তোলা। যেখানে একজন প্রার্থী সার্কুলার দেখা থেকে শুরু করে আবেদন, ফি প্রদান, প্রস্তুতি, প্রবেশপত্র ডাউনলোড এবং ফলাফল যাচাই পর্যন্ত সমস্ত সেবা একটি সমন্বিত প্ল্যাটফর্ম থেকেই অনায়াসে সম্পন্ন করতে পারবেন।
            </p>
          </div>
        </div>

        {/* 5. 5 Core Operational Pillars */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              কার্যপদ্ধতি ও বিশ্বাসযোগ্যতা
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">
              আমাদের ৫টি প্রধান সেবা স্তম্ভ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              যে ভিত্তিগুলোর উপর দাঁড়িয়ে চাকরি সেবা বাংলাদেশের হাজারো চাকরিপ্রার্থীর সবচেয়ে নির্ভরযোগ্য আস্থার প্রতীক
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-emerald-400 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Department Leadership & Team Structure */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              পেশাদার টিম ও ব্যবস্থাপনা
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">
              আমাদের বিভাগসমূহ ও বিশেষজ্ঞ টিম
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              প্রার্থীদের সর্বোচ্চ নির্ভুলতা ও গতিময় অভিজ্ঞতা প্রদানে নিরবচ্ছিন্নভাবে কাজ করে যাচ্ছেন আমাদের বিভিন্ন বিভাগের সদস্যরা
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {departments.map((d, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-6 space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                    {d.role}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">টিম লিড: {d.lead}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{d.dept}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Ethics & Governance Statement */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">নৈতিকতা ও স্বচ্ছতার অঙ্গীকার (Ethics & Transparency)</h3>
              <p className="text-xs text-amber-800">আমাদের প্ল্যাটফর্মের যেকোনো সেবায় মেধা ও আইনসম্মত প্রক্রিয়াই একমাত্র মানদণ্ড।</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            চাকরি সেবা কোনো চাকরি প্রদানকারী সংস্থা নয় এবং কোনো চাকরি পাওয়ার নিশ্চয়তা দেয় না। আমরা শুধুমাত্র সরকারি ও অফিশিয়াল নিয়োগ বিজ্ঞপ্তিসমূহ নির্ভুলভাবে প্রদর্শন এবং প্রার্থীদের নিজস্ব অনুরোধে নির্ধারিত ফি পরিশোধপূর্বক ফর্ম পূরণ ও ডিজিটাল ভল্ট সহায়তা প্রদান করি। কোনো প্রকার অনৈতিক অর্থ লেনদেন বা নিয়োগের তদবির আমাদের নীতিমালার সম্পূর্ণ পরিপন্থী।
          </p>
        </div>

        {/* 8. Call to Action Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">আপনার স্বপ্নের সরকারি বা ব্যাংক চাকরি খুঁজুন</h3>
            <p className="text-xs sm:text-sm text-slate-300">আজই আমাদের ডিজিটাল ভল্টে প্রোফাইল সংরক্ষণ করে ঝামেলামুক্ত আবেদন শুরু করুন।</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/jobs"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>চলমান চাকরিগুলো দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
            >
              হেল্পডেস্কে যোগাযোগ
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
