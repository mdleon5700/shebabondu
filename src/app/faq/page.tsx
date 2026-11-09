'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  Bell, 
  ShieldCheck, 
  Send, 
  Phone, 
  MessageSquare,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'application' | 'payment' | 'admit_card' | 'alerts' | 'vault_security';
  categoryLabel: string;
  q: string;
  a: string;
}

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('app-1');

  const faqs: FaqItem[] = [
    // 1. Application & Eligibility
    {
      id: 'app-1',
      category: 'application',
      categoryLabel: 'আবেদন ও যোগ্যতা',
      q: 'চাকরি সেবা প্ল্যাটফর্মের মাধ্যমে কীভাবে সরকারি ও ব্যাংক জবে আবেদন করব?',
      a: 'প্রথমে আপনার পছন্দের বিজ্ঞপ্তির বিস্তারিত পাতায় গিয়ে "অনলাইন আবেদন সহকারী" বা "আবেদন করুন" বাটনে চাপুন। আপনি যদি পূর্বে ডিজিটাল ভল্টে প্রোফাইল পূরণ করে থাকেন, তবে সমস্ত তথ্য স্বয়ংক্রিয়ভাবে চলে আসবে। এরপর প্রয়োজনীয় পদ নির্বাচন করে কনফার্ম করলে আমাদের অভিজ্ঞ ডাটা এন্ট্রি টিম নির্ধারিত সরকারি সার্ভারে (যেমন Teletalk) নির্ভুলভাবে আবেদন সম্পন্ন করে আপনার ড্যাশবোর্ডে বারকোডযুক্ত Applicant Copy PDF আপলোড করে দেয়।'
    },
    {
      id: 'app-2',
      category: 'application',
      categoryLabel: 'আবেদন ও যোগ্যতা',
      q: 'টেলিটক আবেদনের জন্য ছবি ও স্বাক্ষরের সাইজ (৩০০×৩০০ এবং ৩০০×৮০) কীভাবে ঠিক করব?',
      a: 'আমাদের প্ল্যাটফর্মের /vault (ডিজিটাল ভল্ট) পেইজে বিল্ট-ইন অটো-রিসাইজার টুল রয়েছে। আপনার ফোন থেকে যেকোনো সাইজের সাধারণ ছবি বা স্বাক্ষরের স্ক্যান আপলোড করলেই টুলটি সরকারি টেলিটকের নির্ধারিত ৩০০×৩০০ পিক্সেল (সর্বোচ্চ ১০০ কেবি) এবং ৩০০×৮০ পিক্সেল (সর্বোচ্চ ৬০ কেবি) মাপে স্বয়ংক্রিয়ভাবে ক্রপ ও রিসাইজ করে দেয়।'
    },
    {
      id: 'app-3',
      category: 'application',
      categoryLabel: 'আবেদন ও যোগ্যতা',
      q: 'প্রার্থীর বয়স ও শিক্ষাগত যোগ্যতার শর্তাবলি কীভাবে স্বয়ংক্রিয়ভাবে যাচাই হয়?',
      a: 'প্রতিটি চাকরির বিস্তারিত পাতায় আমাদের "এআই যোগ্যতা মূল্যায়নকারী (Eligibility Evaluator)" রয়েছে। বিজ্ঞপ্তিতে উল্লিখিত নির্ধারিত তারিখে আপনার জন্মতারিখ এবং অর্জিত শিক্ষাগত ডিগ্রির সিজিপিএ ইনপুট দিলে সিস্টেম এক ক্লিকেই জানিয়ে দেবে আপনি আবেদন করতে পারবেন কিনা এবং বয়সে কোনো ছাড় আছে কিনা।'
    },
    {
      id: 'app-4',
      category: 'application',
      categoryLabel: 'আবেদন ও যোগ্যতা',
      q: 'একবার তথ্য সেভ রাখলে কি বারবার একই ফর্ম পূরণ করতে হবে?',
      a: 'একদমই না। আপনার ডিজিটাল ভল্টে নাম, ঠিকানা, শিক্ষাগত যোগ্যতা, এনআইডি এবং ছবি-স্বাক্ষর একবার সেভ করে রাখলে পরবর্তীতে যেকোনো সরকারি বা ব্যাংক চাকরিতে মাত্র এক ক্লিকেই স্বয়ংক্রিয়ভাবে তথ্য পূরণ হয়ে যাবে।'
    },

    // 2. Fee & Wallet Payment
    {
      id: 'pay-1',
      category: 'payment',
      categoryLabel: 'ফি ও ওয়ালেট পেমেন্ট',
      q: 'সরকারি আবেদন ফি এবং সার্ভিস চার্জ কীভাবে পরিশোধ করতে হয়?',
      a: 'আপনি সরাসরি বিকাশ, নগদ, রকেট অথবা চাকরি সেবা "ডিজিটাল ওয়ালেট" এর মাধ্যমে আবেদন ফি পরিশোধ করতে পারেন। আমরা প্রতিটি বিজ্ঞপ্তির অফিশিয়াল সরকারি ট্রেজারি চালান বা টেলিটক ফি অনুযায়ী নিখুঁত হিসাব প্রদর্শন করি, কোনো লুকায়িত চার্জ নেওয়া হয় না।'
    },
    {
      id: 'pay-2',
      category: 'payment',
      categoryLabel: 'ফি ও ওয়ালেট পেমেন্ট',
      q: 'বিকাশ বা নগদ দিয়ে ওয়ালেটে টাকা রিচার্জ করার উপায় কী?',
      a: '/wallet পেইজে গিয়ে "টাকা রিচার্জ করুন" অপশনে চাপুন। আমাদের অফিশিয়াল বিকাশ/নগদ মার্চেন্ট নম্বরে পেমেন্ট করে TrxID ও মোবাইল নম্বর ইনপুট দিলে কয়েক সেকেন্ডের মধ্যে আপনার ওয়ালেট ব্যালেন্স যোগ হয়ে যাবে।'
    },
    {
      id: 'pay-3',
      category: 'payment',
      categoryLabel: 'ফি ও ওয়ালেট পেমেন্ট',
      q: 'সরকারি পোর্টালে সার্ভার সমস্যার কারণে আবেদন ব্যর্থ হলে ফি কি ফেরত পাব?',
      a: 'অবশ্যই। কোনো কারণে যদি অফিশিয়াল সরকারি সার্ভার ক্র্যাশ বা ডাউন থাকার কারণে আবেদন সময়মতো দাখিল করা সম্ভব না হয়, তবে আপনার সম্পূর্ণ ফি ও চার্জ তাৎক্ষণিকভাবে আপনার ওয়ালেটে অথবা বিকাশ/নগদে ১০০% রিফান্ড করা হয়।'
    },
    {
      id: 'pay-4',
      category: 'payment',
      categoryLabel: 'ফি ও ওয়ালেট পেমেন্ট',
      q: 'ট্রানজেকশন সফল হওয়ার পর আবেদনের অফিশিয়াল রশিদ বা Applicant Copy কখন পাব?',
      a: 'পেমেন্ট অনুমোদনের পর আমাদের টিম সরকারি পোর্টালে আবেদন সম্পন্ন করা মাত্রই আপনার ড্যাশবোর্ডে মূল ট্রানজেকশন কোড সহ ডাউনলোডযোগ্য অফিসিয়াল Applicant Copy PDF যুক্ত হয়ে যায় এবং আপনার মোবাইলে এসএমএস কনফার্মেশন চলে যায়।'
    },

    // 3. Admit Cards, Exams & Results
    {
      id: 'adm-1',
      category: 'admit_card',
      categoryLabel: 'প্রবেশপত্র ও পরীক্ষা',
      q: 'প্রবেশপত্র (Admit Card) প্রকাশের নোটিশ আমি কীভাবে জানতে পারব?',
      a: 'যেসব চাকরিতে আপনি আবেদন করেছেন অথবা নোটিফিকেশন অন রেখেছেন, সংশ্লিষ্ট মন্ত্রণালয় বা ব্যাংক প্রবেশপত্র ইস্যু করামাত্র আমাদের সিস্টেম থেকে আপনার ফোনে এসএমএস ও ইমেইল পাঠানো হয়। এছাড়া /admit-cards পেইজে গিয়ে সরাসরি ডাউনলোড লিংক ও ইউজার আইডি রিকভারির সুযোগ রয়েছে।'
    },
    {
      id: 'adm-2',
      category: 'admit_card',
      categoryLabel: 'প্রবেশপত্র ও পরীক্ষা',
      q: 'টেলিটক ইউজার আইডি বা পাসওয়ার্ড হারিয়ে গেলে কীভাবে পুনরুদ্ধার করব?',
      a: 'আমাদের /admit-cards পোর্টালে টেলিটক ইউজার আইডি ও পাসওয়ার্ড রিকভারি নির্দেশিকা রয়েছে। আপনার নাম, পিতার নাম ও আবেদনকৃত পদের নাম লিখে নির্দিষ্ট টেলিটক এসএমএস ফরম্যাটে ১৬২২২ নম্বরে এসএমএস পাঠালে তাত্ক্ষণিক নতুন পাসওয়ার্ড পেয়ে যাবেন।'
    },
    {
      id: 'adm-3',
      category: 'admit_card',
      categoryLabel: 'প্রবেশপত্র ও পরীক্ষা',
      q: 'প্রিলিমিনারি, লিখিত ও ভাইভা পরীক্ষার তারিখ ও সিট প্ল্যান কোথায় দেখতে পাব?',
      a: 'আমাদের /exam-notices এবং /viva-notices পোর্টাল সার্বক্ষণিক আপডেট থাকে। সেখানে মন্ত্রণালয়ভিত্তিক পরীক্ষার রুটিন, রোল নম্বরভিত্তিক আসনবিন্যাস ও কেন্দ্র তালিকা সরাসরি পিডিএফসহ দেখতে পাবেন।'
    },

    // 4. Job Alerts & Notifications
    {
      id: 'alt-1',
      category: 'alerts',
      categoryLabel: 'নোটিফিকেশন ও অ্যালার্ট',
      q: 'নতুন চাকরির ইনস্ট্যান্ট এসএমএস ও হোয়াটসঅ্যাপ অ্যালার্ট কীভাবে চালু করব?',
      a: '/job-alerts পেইজে গিয়ে আপনার সচল মোবাইল নম্বর দিন এবং আপনার পছন্দের চ্যানেল (যেমন: এসএমএস, হোয়াটসঅ্যাপ, ইমেইল) নির্বাচন করুন। এরপর কোন কোন ক্যাটাগরির চাকরি চান তা সিলেক্ট করে "সাবস্ক্রাইব করুন" চাপলেই অ্যালার্ট সক্রিয় হবে।'
    },
    {
      id: 'alt-2',
      category: 'alerts',
      categoryLabel: 'নোটিফিকেশন ও অ্যালার্ট',
      q: 'আমি কি নির্দিষ্ট জেলা বা ক্যাটাগরি (যেমন ব্যাংক, ইঞ্জিনিয়ারিং) অনুযায়ী অ্যালার্ট পেতে পারি?',
      a: 'হ্যাঁ! /job-alerts পেজে ফিল্টার অপশন রয়েছে। আপনি আপনার নিজস্ব বিভাগ (যেমন: ঢাকা, চট্টগ্রাম, রাজশাহী) এবং নির্দিষ্ট চাকরির ধরণ (যেমন: বিসিএস, সমন্বিত ৯ ব্যাংক, আইটি চাকরি) বেছে নিয়ে শুধুমাত্র আপনার পছন্দের নোটিফিকেশন পেতে পারেন।'
    },
    {
      id: 'alt-3',
      category: 'alerts',
      categoryLabel: 'নোটিফিকেশন ও অ্যালার্ট',
      q: 'এসএমএস নোটিফিকেশন সার্ভিসের জন্য কি কোনো অতিরিক্ত ফি নেওয়া হয়?',
      a: 'না। আমাদের মৌলিক নোটিফিকেশন সেবা সকল চাকরিপ্রার্থীর জন্য সম্পূর্ণ উন্মুক্ত ও বিনামূল্যে প্রদান করা হয়।'
    },

    // 5. Vault & Data Privacy
    {
      id: 'vlt-1',
      category: 'vault_security',
      categoryLabel: 'ভল্ট ও ডেটা নিরাপত্তা',
      q: 'আমার জাতীয় পরিচয়পত্র (NID) ও শিক্ষাগত সনদের তথ্য কি নিরাপদ থাকবে?',
      a: 'শতভাগ নিরাপদ। আপনার সকল আপলোডকৃত ফাইল ও ব্যক্তিগত তথ্য ইন্ডাস্ট্রি স্ট্যান্ডার্ড ২৫৬-বিট এন্টারপ্রাইজ এনক্রিপশন দ্বারা সুরক্ষিত। প্রার্থীর সুস্পষ্ট অনুমতি ছাড়া অন্য কোনো উদ্দেশ্যে তথ্য ব্যবহার সম্পূর্ণ নিষিদ্ধ।'
    },
    {
      id: 'vlt-2',
      category: 'vault_security',
      categoryLabel: 'ভল্ট ও ডেটা নিরাপত্তা',
      q: 'আমার সংরক্ষিত কোনো তথ্য কি অন্য কোনো তৃতীয় পক্ষ বা বিজ্ঞাপনী সংস্থাকে দেওয়া হয়?',
      a: 'না, কখনো না। চাকরি সেবা প্রার্থীদের গোপনীয়তা সুরক্ষায় সর্বোচ্চ প্রতিশ্রুতিবদ্ধ। আমরা কোনো থার্ড পার্টি মার্কেটিং বা বিজ্ঞাপনী এজেন্সির সাথে ডেটা বিক্রয় বা বিনিময় করি না।'
    },
    {
      id: 'vlt-3',
      category: 'vault_security',
      categoryLabel: 'ভল্ট ও ডেটা নিরাপত্তা',
      q: 'অ্যাকাউন্ট ডিলিট বা ডকুমেন্ট স্থায়ীভাবে মুছে ফেলতে চাইলে কী করব?',
      a: 'আপনার প্রোফাইল অথবা ভল্ট থেকে যেকোনো নথি আপনি যেকোনো সময় মুছে ফেলতে পারবেন। সম্পূর্ণ একাউন্ট অপসারণের জন্য আমাদের /contact পেইজ থেকে হেল্পডেস্কে অনুরোধ পাঠালে ২৪ ঘণ্টার মধ্যে স্থায়ীভাবে তথ্য মুছে দেওয়া হয়।'
    }
  ];

  const categories = [
    { id: 'all', label: 'সকল প্রশ্ন', icon: HelpCircle },
    { id: 'application', label: 'আবেদন ও যোগ্যতা', icon: FileText },
    { id: 'payment', label: 'ফি ও ওয়ালেট পেমেন্ট', icon: CreditCard },
    { id: 'admit_card', label: 'প্রবেশপত্র ও পরীক্ষা', icon: CheckCircle2 },
    { id: 'alerts', label: 'নোটিফিকেশন ও অ্যালার্ট', icon: Bell },
    { id: 'vault_security', label: 'ভল্ট ও ডেটা নিরাপত্তা', icon: ShieldCheck },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => {
      const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.categoryLabel.toLowerCase().includes(q);
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">সাধারণ জিজ্ঞাসা (FAQ)</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 2. Header & Search Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center space-y-5">
          <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সচরাচর জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ)</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
            আপনার যেকোনো জিজ্ঞাসার দ্রুত সমাধান
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            সরকারি চাকরির আবেদন, ফি পরিশোধ, এডমিট কার্ড ডাউনলোড ও এসএমএস নোটিফিকেশন সম্পর্কিত প্রয়োজনীয় প্রশ্ন ও উত্তর।
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative pt-2">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কী জানতে চান? যেমন: ফি ফেরত, ছবি রিসাইজ, এডমিট কার্ড..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${isSelected ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Filtered FAQ Accordion List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              প্রশ্নের তালিকা ({filteredFaqs.length} টি পাওয়া গেছে)
            </h2>
            {searchQuery && (
              <span className="text-xs text-slate-500">
                অনুসন্ধান: <strong className="text-emerald-700">"{searchQuery}"</strong>
              </span>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">কোনো প্রশ্নের উত্তর মেলেনি</p>
              <p className="text-xs text-slate-400">অন্য শব্দ দিয়ে অনুসন্ধান করুন অথবা সরাসরি হেল্পডেস্কে মেসেজ পাঠান।</p>
              <Link
                href="/contact"
                className="inline-block mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                হেল্পডেস্কে প্রশ্ন পাঠান →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span>{faq.q}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/60 pt-3 space-y-3">
                        <p>{faq.a}</p>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                            ক্যাটাগরি: {faq.categoryLabel}
                          </span>
                          <span>তথ্যটি কি সহায়ক ছিল?</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. "Need More Help?" Support CTA */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">আপনার প্রশ্নের উত্তর খুঁজে পাননি?</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              আমাদের ডেডিকেটেড সাপোর্ট টিম প্রতিদিন সকাল ৯:০০ টা থেকে রাত ১১:০০ টা পর্যন্ত লাইভ সহায়তা দিয়ে থাকে।
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>হেল্পডেস্কে টিকিট খুলুন</span>
            </Link>
            <a
              href="https://wa.me/8801774366643"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span>হোয়াটসঅ্যাপ চ্যাট</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
