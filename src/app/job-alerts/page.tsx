'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import { storage } from '@/lib/store';

const CATEGORIES = [
  { id: 'বিসিএস ও সরকারি চাকরি', label: 'বিসিএস ও মন্ত্রণালয়', icon: '🏛️' },
  { id: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান', label: 'বাংলাদেশ ব্যাংক ও সরকারি ব্যাংক', icon: '🏦' },
  { id: 'বেসরকারি ব্যাংক', label: 'বেসরকারি বাণিজ্যিক ব্যাংক', icon: '💳' },
  { id: 'প্রাথমিক ও শিক্ষক নিয়োগ', label: 'প্রাথমিক ও শিক্ষক নিবন্ধন (NTRCA)', icon: '📚' },
  { id: 'বাংলাদেশ রেলওয়ে', label: 'বাংলাদেশ রেলওয়ে নিয়োগ', icon: '🚆' },
  { id: 'প্রতিরক্ষা ও পুলিশ', label: 'সেনা, নৌ, বিমান ও পুলিশ বাহিনী', icon: '🎖️' },
  { id: 'ইঞ্জিনিয়ারিং ও আইটি', label: 'আইটি ও প্রকৌশল পদ', icon: '💻' },
  { id: 'এনজিও ও উন্নয়ন সংস্থা', label: 'এনজিও (NGO) ও আন্তর্জাতিক সংস্থা', icon: '🤝' },
  { id: 'স্বাস্থ্য ও নার্সিং', label: 'মেডিকেল অফিসার ও নার্সিং', icon: '🏥' },
  { id: 'ফ্রেশারদের চাকরি', label: 'নতুনদের জন্য ফ্রেশার নিয়োগ', icon: '🎓' }
];

const BD_DIVISIONS = [
  'সারা বাংলাদেশ (সকল জেলা)',
  'ঢাকা বিভাগ',
  'চট্টগ্রাম বিভাগ',
  'রাজশাহী বিভাগ',
  'খুলনা বিভাগ',
  'বরিশাল বিভাগ',
  'সিলেট বিভাগ',
  'রংপুর বিভাগ',
  'ময়মনসিংহ বিভাগ'
];

export default function JobAlertsPage() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([
    'বিসিএস ও সরকারি চাকরি',
    'ব্যাংক ও আর্থিক প্রতিষ্ঠান'
  ]);
  const [selectedDivision, setSelectedDivision] = useState('সারা বাংলাদেশ (সকল জেলা)');
  const [channels, setChannels] = useState<string[]>(['whatsapp', 'sms']);
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [subscribedData, setSubscribedData] = useState<{ id: string; message: string } | null>(null);
  const [stats, setStats] = useState<{ totalSubscribers: number; activeSubscribers: number }>({
    totalSubscribers: 12850,
    activeSubscribers: 12600
  });

  useEffect(() => {
    // 1. Pre-fill from current user if logged in
    const user = storage.getUser();
    if (user) {
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
      if (user.district) setSelectedDivision(user.district);
    }

    // 2. Fetch public subscriber stats
    fetch('/api/job-alerts')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCats(prev => 
      prev.includes(cat) 
        ? (prev.length > 1 ? prev.filter(c => c !== cat) : prev) 
        : [...prev, cat]
    );
  };

  const toggleChannel = (ch: string) => {
    setChannels(prev => 
      prev.includes(ch)
        ? (prev.length > 1 ? prev.filter(c => c !== ch) : prev)
        : [...prev, ch]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার সক্রিয় মোবাইল অথবা হোয়াটসঅ্যাপ নম্বর লিখুন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/job-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          email: email.trim() || undefined,
          channels,
          categories: selectedCats,
          divisions: [selectedDivision],
          frequency
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'সাবস্ক্রিপশন ব্যর্থ হয়েছে।');
      }

      setSubscribedData({
        id: data.subscription.id,
        message: data.message
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ফ্রি এসএমএস ও হোয়াটসঅ্যাপ জব অ্যালার্ট</span>
      </div>

      {/* Hero Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
            <Bell className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>সবার আগে ১০০% ভেরিফায়েড সার্কুলার অ্যালার্ট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ফ্রি জব অ্যালার্ট সাবস্ক্রিপশন
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            সরকারি মন্ত্রণালয়, বিসিএস, বাংলাদেশ ব্যাংক কিংবা পছন্দের যেকোনো পদের সার্কুলার আসামাত্রই এসএমএস ও হোয়াটসঅ্যাপে তাৎক্ষণিক নোটিফিকেশন পান।
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center shrink-0 space-y-1">
          <span className="text-[11px] font-bold text-slate-300 block uppercase">লাইভ সাবস্ক্রাইবার</span>
          <span className="text-2xl font-black text-emerald-400">
            {stats.activeSubscribers.toLocaleString('bn-BD')}+
          </span>
          <span className="text-[10px] text-slate-400 block">প্রার্থী নিয়মিত অ্যালার্ট পাচ্ছেন</span>
        </div>
      </div>

      {subscribedData ? (
        /* Confirmation Screen */
        <div data-testid="public-alert-confirmation" className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-lg text-center space-y-5 animate-scaleUp">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">অভিনন্দন! আপনার ফ্রি জব অ্যালার্ট চালু হয়েছে।</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              আপনার দেওয়া নম্বরে (<strong>{phone}</strong>) পছন্দের ক্যাটাগরির নতুন কোনো সার্কুলার প্রকাশিত হওয়ামাত্রই সতর্কবার্তা পৌঁছে যাবে।
            </p>
          </div>

          <div className="inline-block bg-emerald-50 border border-emerald-300 px-6 py-3 rounded-2xl">
            <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">সাবস্ক্রিপশন আইডি</span>
            <span className="text-lg font-mono font-black text-emerald-800">{subscribedData.id}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl max-w-md mx-auto border border-slate-200 text-left text-xs space-y-1.5">
            <div className="font-bold text-slate-700">নির্বাচিত ক্যাটাগরি:</div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedCats.map(c => (
                <span key={c} className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-[11px] font-semibold text-slate-800">
                  {c}
                </span>
              ))}
            </div>
            <div className="pt-2 text-[11px] text-slate-500">
              ডেলিভারি মাধ্যম: <strong>{channels.map(ch => ch === 'whatsapp' ? 'হোয়াটসঅ্যাপ' : ch === 'sms' ? 'এসএমএস' : 'ইমেইল').join(', ')}</strong> • ফ্রিকোয়েন্সি: <strong>{frequency === 'instant' ? 'তাৎক্ষণিক' : frequency === 'daily' ? 'দৈনিক' : 'সাপ্তাহিক'}</strong>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/jobs"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              চলমান চাকরি দেখুন
            </Link>
            <button
              type="button"
              onClick={() => setSubscribedData(null)}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              পছন্দসমূহ পরিবর্তন করুন
            </button>
          </div>
        </div>
      ) : (
        /* Form with Interactive Mobile Preview */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form (8 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              
              {/* Category Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ১. কোন কোন সেক্টরের চাকরির অ্যালার্ট চান? (একাধিক নির্বাচন করুন)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {CATEGORIES.map(c => {
                    const isSelected = selectedCats.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCategory(c.id)}
                        className={`p-3 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <span>{c.icon}</span>
                          <span className="truncate">{c.label}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Division Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ২. বিভাগ বা অঞ্চলের পছন্দ
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {BD_DIVISIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ৩. নোটিফিকেশন পাওয়ার মাধ্যম নির্বাচন করুন
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: 'হোয়াটসঅ্যাপ', icon: MessageSquare, color: 'text-emerald-600' },
                    { id: 'sms', label: 'মোবাইল এসএমএস', icon: Smartphone, color: 'text-blue-600' },
                    { id: 'email', label: 'ইমেইল ডাইজেস্ট', icon: Mail, color: 'text-violet-600' }
                  ].map(ch => {
                    const isChecked = channels.includes(ch.id);
                    const Icon = ch.icon;
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isChecked 
                            ? 'bg-emerald-50 border-emerald-600 shadow-2xs' 
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${isChecked ? 'text-emerald-950' : 'text-slate-600'}`}>
                          {ch.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ৪. সতর্কবার্তার ফ্রিকোয়েন্সি (কখন পাঠাবো?)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'instant', title: 'তাৎক্ষণিক', sub: 'বিজ্ঞপ্তি প্রকাশের সাথে সাথে' },
                    { id: 'daily', title: 'প্রতিদিন সন্ধ্যায়', sub: 'দৈনিক সকল সার্কুলার ডাইজেস্ট' },
                    { id: 'weekly', title: 'প্রতি শুক্রবার', sub: 'সপ্তাহের সেরা চাকরির তালিকা' }
                  ].map(f => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setFrequency(f.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        frequency === f.id
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-xs block font-bold">{f.title}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{f.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    হোয়াটসঅ্যাপ / মোবাইল নম্বর <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    data-testid="public-alert-phone-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    data-testid="public-alert-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                data-testid="public-alert-submit-btn"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>অ্যালার্ট সক্রিয় করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>১০০% ফ্রি জব অ্যালার্ট চালু করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>কোনো স্প্যাম পাঠানো হবে না। যেকোনো সময় সাবস্ক্রিপশন বন্ধ করা যাবে।</span>
              </div>
            </form>
          </div>

          {/* Realistic SMS / WhatsApp Live Preview Phone (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400">লাইভ অ্যালার্ট প্রিভিউ</span>
                </div>
                <span className="text-[10px] text-slate-400">হোয়াটসঅ্যাপ / এসএমএস ফরম্যাট</span>
              </div>

              {/* Chat Bubble Simulator */}
              <div className="bg-slate-800/80 rounded-2xl p-4 space-y-3 border border-slate-700/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span>চাকরি সেবা (Chakri Sheba)</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                  <span>এখনই</span>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed font-sans space-y-1.5">
                  <p className="font-bold text-white">
                    📢 নতুন সার্কুলার অ্যালার্ট: {selectedCats[0] || 'সরকারি চাকরি'}
                  </p>
                  <p className="text-slate-300">
                    প্রতিষ্ঠান: <strong>বাংলাদেশ ব্যাংক / সমন্বিত ব্যাংক</strong>
                  </p>
                  <p className="text-slate-300">
                    পদ: <strong>সহকারী পরিচালক (সাধারণ)</strong> — ১০০ শূন্যপদ
                  </p>
                  <p className="text-slate-300">
                    আবেদনের শেষ সময়: <strong>২৮ ফেব্রুয়ারি ২০২৬</strong>
                  </p>
                  <div className="pt-1.5 text-emerald-400 font-mono text-[11px] underline">
                    https://chakrisheba.com/jobs/job-bb-ad-2026
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-700/60 flex items-center justify-between">
                  <span>ফ্রিকোয়েন্সি: {frequency === 'instant' ? 'তাৎক্ষণিক পুশ' : 'দৈনিক ডাইজেস্ট'}</span>
                  <span>ফ্রি সেবা</span>
                </div>
              </div>

              {/* Key Features List */}
              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>আবেদনের ডেডলাইন শেষ হওয়ার ৩ দিন পূর্বে রিমাইন্ডার</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>প্রবেশপত্র বা অ্যাডমিট কার্ড ইস্যু হওয়ামাত্রই নোটিশ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>পরীক্ষার ফলাফল ও ভাইভা তারিখের সরাসরি এসএমএস</span>
                </div>
              </div>
            </div>

            {/* Quick Link Card */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <span className="font-bold block">ইতিমধ্যে প্ল্যাটফর্মে অ্যাকাউন্ট আছে?</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                আপনার ড্যাশবোর্ডে লগইন করে নির্দিষ্ট গ্রেড ও জেলার জন্য আরও সূক্ষ্ম অ্যালার্ট ফিল্টার সেট করতে পারেন।
              </p>
              <Link
                href="/login?redirect=/dashboard/alerts"
                className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 hover:underline pt-1"
              >
                <span>ড্যাশবোর্ড অ্যালার্ট সেটিংসে যান →</span>
              </Link>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
