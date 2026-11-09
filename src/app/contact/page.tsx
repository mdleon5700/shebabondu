'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  MessageSquare, 
  Send, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Search,
  Copy,
  Check,
  Headphones,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { ContactMessageItem } from '@/lib/types';

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'track'>('form');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'general' | 'application_help' | 'payment_issue' | 'technical_bug' | 'feedback'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ ticketId: string; msg: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackedTickets, setTrackedTickets] = useState<ContactMessageItem[] | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/platform/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitSuccess(null);

    if (!name.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম প্রদান করুন।');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('অনুগ্রহ করে যোগাযোগের মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('আপনার বার্তা বা সমস্যার বিবরণ বিস্তারিত লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          category,
          subject: subject.trim() || undefined,
          message: message.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess({
          ticketId: data.ticketId,
          msg: data.message
        });
        setName('');
        setPhone('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setErrorMessage(data.error || 'বার্তা পাঠানো সম্ভব হয়নি। পুনরায় চেষ্টা করুন।');
      }
    } catch (err: any) {
      setErrorMessage('নেটওয়ার্ক ত্রুটি: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackedTickets(null);

    if (!trackQuery.trim()) {
      setTrackError('অনুগ্রহ করে টিকেট আইডি (যেমন TCK-2026-XXXX) বা মোবাইল নম্বর লিখুন।');
      return;
    }

    setIsSearching(true);
    try {
      const isTicketCode = trackQuery.trim().toUpperCase().startsWith('TCK-');
      const param = isTicketCode 
        ? `ticketId=${encodeURIComponent(trackQuery.trim())}` 
        : `phone=${encodeURIComponent(trackQuery.trim())}`;

      const res = await fetch(`/api/contact?${param}`);
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.ticket) {
          setTrackedTickets([data.ticket]);
        } else if (Array.isArray(data.messages) && data.messages.length > 0) {
          setTrackedTickets(data.messages);
        } else {
          setTrackError('প্রদত্ত তথ্য অনুযায়ী কোনো টিকেট বা বার্তা খুঁজে পাওয়া যায়নি।');
        }
      } else {
        setTrackError(data.error || 'টিকেট খুঁজে পাওয়া যায়নি।');
      }
    } catch (err: any) {
      setTrackError('অনুসন্ধানে ত্রুটি হয়েছে: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const copyTicketCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const faqs = [
    {
      q: 'আপনারা কীভাবে আমার হয়ে সরকারি বা ব্যাংক জবে আবেদন করে দেন?',
      a: 'আপনি যখন আমাদের ওয়েবসাইটে অ্যাকাউন্ট খুলে আপনার তথ্য ও ছবি একবার সেভ রাখবেন, যেকোনো বিজ্ঞপ্তিতে "আবেদন করুন" চাপলে আমাদের অভিজ্ঞ ডাটা এন্ট্রি টিম অফিশিয়াল সরকারি পোর্টালে (যেমন Teletalk) নিখুঁতভাবে ফর্ম পূরণ করে সরকারি ফি পরিশোধ করে আপনার ড্যাশবোর্ডে অফিসিয়াল Applicant Copy PDF আপলোড করে দেয়।'
    },
    {
      q: 'আমার ছবি ও স্বাক্ষরের সাইজ ভুল থাকলে কি আবেদন বাতিল হবে?',
      a: 'একদমই না! আমাদের প্ল্যাটফর্মে বিল্ট-ইন অটো-রিসাইজার রয়েছে। আপনি মোবাইল থেকে সাধারণ ছবি আপলোড করলেও সিস্টেম নিজে থেকেই টেলিটকের সঠিক ৩০০x৩০০ পিক্সেল ছবি এবং ৩০০x৮০ পিক্সেল স্বাক্ষরে কনভার্ট করে নেয়।'
    },
    {
      q: 'বিকাশ বা নগদে টাকা দেওয়ার পর আবেদনের প্রমাণ কী পাব?',
      a: 'পেমেন্ট দেওয়ার পর আপনার ড্যাশবোর্ডে উবার-স্টাইল ৫-ধাপের লাইভ ট্র্যাকিং চালু হবে। টিম মেম্বার কাজ শেষ করামাত্রই সরকারি ট্রানজ্যাকশন আইডি ও বারকোড সহ মূল "Applicant Copy PDF" ডাউনলোড লিংক পাবেন এবং আপনার ফোনে এসএমএস চলে যাবে।'
    },
    {
      q: 'আমার এনআইডি ও ব্যক্তিগত তথ্য কি নিরাপদ থাকবে?',
      a: 'হ্যাঁ, শতভাগ নিরাপদ। আমরা সর্বোচ্চ ব্যাংকিং গ্রেড এনক্রিপশন ব্যবহার করি এবং আপনার তথ্য শুধুমাত্র সংশ্লিষ্ট চাকরির ফর্ম পূরণের বাইরে অন্য কোথাও কখনো শেয়ার করা হয় না।'
    },
    {
      q: 'কোনো কারণে আবেদন ব্যর্থ হলে কি টাকা ফেরত পাব?',
      a: 'অবশ্যই। কোনো কারণে যদি অফিশিয়াল সার্ভার জটিলতায় আবেদন সম্পন্ন না হতে পারে, তবে আপনার মূল ফি এবং টিম চার্জ সম্পূর্ণ বিনা প্রশ্নে আপনার বিকাশ/নগদে অথবা ওয়ালেটে রিফান্ড করে দেওয়া হয়।'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3" /> নতুন টিকেট (পর্যালোচনায়)</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200"><RefreshCw className="w-3 h-3 animate-spin" /> সমাধান চলমান</span>;
      case 'replied':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> উত্তর প্রেরিত</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">নিষ্পত্তি সম্পন্ন</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">যোগাযোগ ও হেল্পডেস্ক</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
            <Headphones className="w-3.5 h-3.5" />
            <span>সরাসরি সহায়তা ও হেল্পডেস্ক</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            যেকোনো প্রয়োজনে আমরা আপনার পাশে আছি
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
            সরকারি ও ব্যাংক চাকরির আবেদন সংক্রান্ত জটিলতা, ফি পেমেন্ট ভেরিফিকেশন বা কোনো মতামত থাকলে আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        {/* 4 Multi-Channel Support Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Phone Helpline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs hover:border-emerald-500 transition-all text-center group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">জরুরি হেল্পলাইন</h3>
            <div className="text-base font-black text-emerald-800 font-mono">
              {settings?.general?.supportPhone || '+৮৮০ ১৭৭৪-৩৬৬৬৪৩'}
            </div>
            <p className="text-xs text-slate-500">সকাল ৯:০০টা হতে রাত ১১:০০টা (প্রতিদিন)</p>
          </div>

          {/* WhatsApp Chat */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs hover:border-green-500 transition-all text-center group">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">WhatsApp চ্যাট</h3>
            <a
              href={`https://wa.me/${settings?.general?.whatsappNumber || '8801774366643'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              সরাসরি চ্যাট করুন
            </a>
            <p className="text-xs text-slate-500">তাত্ক্ষণিক সমাধান ও সহায়তা</p>
          </div>

          {/* Telegram Channel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs hover:border-sky-500 transition-all text-center group">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">টেলিগ্রাম চ্যানেল</h3>
            <a
              href="https://t.me/chakrisheba"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              চ্যানেলে যুক্ত হোন
            </a>
            <p className="text-xs text-slate-500">রিয়েলটাইম পরীক্ষার নোটিশ পেতে</p>
          </div>

          {/* Official Email */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs hover:border-indigo-500 transition-all text-center group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">অফিসিয়াল ইমেইল</h3>
            <a 
              href="mailto:support@chakrisheba.com"
              className="text-xs font-black text-indigo-700 block hover:underline"
            >
              support@chakrisheba.com
            </a>
            <p className="text-xs text-slate-500">প্রাতিষ্ঠানিক ও লিগ্যাল যোগাযোগ</p>
          </div>

        </div>

        {/* Tab Switcher: Support Form vs Ticket Tracker */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="flex border-b border-slate-100 bg-slate-50/60 p-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'form' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Send className="w-4 h-4" />
              <span>সহায়তা অনুরোধ বা বার্তা পাঠান</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'track' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Search className="w-4 h-4" />
              <span>টিকেট ট্র্যাকিং ও উত্তর দেখুন</span>
            </button>
          </div>

          <div className="p-6 sm:p-10">
            {activeTab === 'form' ? (
              <div className="max-w-2xl mx-auto space-y-6">
                
                {submitSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-emerald-900">আপনার বার্তা সফলভাবে জমা হয়েছে!</h3>
                      <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">{submitSuccess.msg}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-emerald-200 inline-flex flex-col items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold">আপনার ট্র্যাকিং টিকেট নম্বর:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base sm:text-lg font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                          {submitSuccess.ticketId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyTicketCode(submitSuccess.ticketId)}
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                        >
                          {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedCode ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTrackQuery(submitSuccess.ticketId);
                          setActiveTab('track');
                        }}
                        className="text-xs font-bold text-emerald-800 hover:underline"
                      >
                        টিকেটের স্ট্যাটাস ও ফলোআপ দেখতে এখানে চাপুন →
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    
                    {errorMessage && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          আপনার নাম <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="যেমন: মোহাম্মদ তানভীর"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          মোবাইল নম্বর <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="০১৭XXXXXXXX"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          ইমেইল ঠিকানা (ঐচ্ছিক)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@mail.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          সমস্যার ক্যাটাগরি <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={category}
                          onChange={(e: any) => setCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="general">সাধারণ অনুসন্ধান ও তথ্য</option>
                          <option value="application_help">টেলিটক ও সরাসরি আবেদন সমস্যা</option>
                          <option value="payment_issue">বিকাশ/নগদ পেমেন্ট ও ওয়ালেট রিচার্জ</option>
                          <option value="technical_bug">ছবি রিসাইজার বা ওয়েবসাইট কারিগরি ত্রুটি</option>
                          <option value="feedback">পরামর্শ ও ফিডব্যাক</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        বিষয় / সারসংক্ষেপ
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="যেমন: টেলিটকে আবেদন করার পর কনফার্মেশন পাইনি"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        বার্তা বা সমস্যার বিস্তারিত বিবরণ <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="আপনার সমস্যাটি বিস্তারিত লিখুন, যাতে আমাদের হেল্পডেস্ক দ্রুত সমাধান প্রদান করতে পারে..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>পাঠানো হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>বার্তা ও অনুরোধ সাবমিট করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                
                <form onSubmit={handleTrackSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">আপনার টিকেটের স্ট্যাটাস ট্র্যাক করুন</h3>
                    <p className="text-xs text-slate-500">টিকেট আইডি (যেমন: TCK-2026-XXXX) বা আপনার ব্যবহৃত মোবাইল নম্বর প্রদান করুন।</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      placeholder="TCK-2026-XXXX অথবা ০১৭১২-৩৪৫৬৭৮"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5"
                    >
                      {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <span>অনুসন্ধান</span>
                    </button>
                  </div>
                </form>

                {trackError && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                    <span>{trackError}</span>
                  </div>
                )}

                {trackedTickets && trackedTickets.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      পাওয়া গেছে ({trackedTickets.length} টি রেকর্ড):
                    </h4>

                    {trackedTickets.map((t) => (
                      <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <span className="font-mono text-xs font-black bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-900">
                            {t.id}
                          </span>
                          {getStatusBadge(t.status)}
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-slate-900">{t.subject}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{t.message}</p>
                        </div>

                        {t.replyNotes ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                            <span className="font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              হেল্পডেস্ক থেকে সমাধান/উত্তর:
                            </span>
                            <p className="leading-relaxed whitespace-pre-wrap">{t.replyNotes}</p>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            টিকেটটি হেল্পডেস্ক টিম পর্যবেক্ষণ করছে। দ্রুত এখানে সমাধান প্রদান করা হবে।
                          </div>
                        )}

                        <div className="text-[11px] text-slate-400">
                          সাবমিট সময়: {new Date(t.createdAt).toLocaleString('bn-BD')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* Corporate Office Address & Map Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">প্রধান কার্যালয় ও সাপোর্ট সেন্টার</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                লেভেল ৪, সফটওয়্যার টেকনোলজি ভবন, পান্থপথ, ঢাকা-১২০৫, বাংলাদেশ।
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  সরাসরি সেবা: সকাল ৯:০০ - রাত ৯:০০ (শনিবার-বৃহস্পতিবার)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/faq"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              সচরাচর জিজ্ঞাসা (FAQ)
            </Link>
            <Link
              href="/about-us"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              আমাদের পরিচিতি
            </Link>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              চাকরি আবেদন সেবা, পেমেন্ট ও নিরাপত্তা নিয়ে সাধারণ কিছু প্রশ্নের উত্তর
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-3 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>

                {openFaq === idx && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
