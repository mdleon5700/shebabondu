'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  Briefcase, 
  Users, 
  ArrowRight, 
  Landmark, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  HelpCircle,
  Layers,
  ChevronRight
} from 'lucide-react';
import JobLogo from '@/components/JobLogo';

export interface OrgDirectoryItem {
  name: string;
  logo: string;
  category: string;
  orgType: string;
  website: string;
  activeJobsCount: number;
  totalVacancies: number;
  slug: string;
}

interface OrganizationsDirectoryClientProps {
  initialOrganizations: OrgDirectoryItem[];
}

export default function OrganizationsDirectoryClient({
  initialOrganizations
}: OrganizationsDirectoryClientProps) {
  const [organizations] = useState<OrgDirectoryItem[]>(initialOrganizations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  // Alphabet letters list (Bengali & English)
  const alphabetLetters = [
    'all',
    'অ', 'আ', 'ই', 'উ', 'ক', 'খ', 'গ', 'ঘ', 'চ', 'ছ', 'জ', 
    'ট', 'ড', 'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 
    'ম', 'য', 'র', 'ল', 'শ', 'স', 'হ',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'M', 'P', 'R', 'S', 'T'
  ];

  // Filtering Logic
  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      // 1. Search Query
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch = !term ||
        org.name.toLowerCase().includes(term) ||
        org.orgType.toLowerCase().includes(term) ||
        org.category.toLowerCase().includes(term) ||
        org.slug.toLowerCase().includes(term);

      // 2. Organization Type Filter
      let matchesType = true;
      if (selectedType === 'ministry') {
        matchesType = org.name.includes('মন্ত্রণালয়') || org.orgType.toLowerCase().includes('ministry');
      } else if (selectedType === 'directorate') {
        matchesType = org.name.includes('অধিদপ্তর') || org.name.includes('পরিদপ্তর') || org.name.includes('ইনস্টিটিউট') || org.name.includes('কর্তৃপক্ষ') || org.orgType.toLowerCase().includes('directorate');
      } else if (selectedType === 'bank') {
        matchesType = org.name.includes('ব্যাংক') || org.orgType.toLowerCase().includes('bank') || org.category.includes('ব্যাংক');
      } else if (selectedType === 'power') {
        matchesType = org.name.includes('পাওয়ার') || org.name.includes('বিদ্যুৎ') || org.name.includes('Power') || org.name.includes('কোম্পানি') || org.name.includes('Limited') || org.name.includes('ক্যাবল') || org.name.includes('পেট্রোবাংলা');
      } else if (selectedType === 'dc') {
        matchesType = org.name.includes('জেলা প্রশাসক') || org.name.includes('DC OFFICE') || org.name.includes('আদালত') || org.name.includes('Supreme Court');
      }

      // 3. Alphabetical Letter Filter
      let matchesLetter = true;
      if (selectedLetter !== 'all') {
        const firstChar = org.name.trim().charAt(0).toUpperCase();
        matchesLetter = firstChar === selectedLetter.toUpperCase();
      }

      return matchesSearch && matchesType && matchesLetter;
    });
  }, [organizations, searchQuery, selectedType, selectedLetter]);

  // Total metrics
  const totalActiveCirculars = organizations.reduce((acc, o) => acc + o.activeJobsCount, 0);
  const totalVacanciesAcrossAll = organizations.reduce((acc, o) => acc + o.totalVacancies, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">নিয়োগকারী প্রতিষ্ঠান ও সংস্থা ডিরেক্টরি</span>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
              <span>প্রতিষ্ঠান ডিরেক্টরি ২০২৬</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              সকল নিয়োগকারী সংস্থা ও প্রতিষ্ঠান ডিরেক্টরি
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              বাংলাদেশে সরকারি মন্ত্রণালয়, অধিদপ্তর, স্বায়ত্তশাসিত সংস্থা, ব্যাংক ও বিদ্যুৎ কোম্পানিসমূহের বর্ণানুক্রমিক ডিরেক্টরি। যেকোনো প্রতিষ্ঠানে ক্লিক করে চলমান ও পূর্বের নিয়োগ বিজ্ঞপ্তি দেখুন।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-emerald-400 block font-mono">
                {toBn(organizations.length)}টি
              </span>
              <span className="text-xs text-slate-300 font-bold">নিবন্ধিত সংস্থা</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-amber-300 block font-mono">
                {toBn(totalActiveCirculars)}টি
              </span>
              <span className="text-xs text-slate-300 font-bold">চলমান সার্কুলার</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRE-BUILT GOVERNMENT HUBS SPOTLIGHT CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>প্রি-বিল্ট সরকারি রিক্রুটমেন্ট হাবসমূহ:</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold">একক ক্লিকে সরাসরি বিভাগীয় ফিড</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            href="/organizations/bangladesh-bank"
            className="p-5 bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl border border-emerald-200/80 hover:border-emerald-500 hover:shadow-lg transition-all group cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              🏦
            </div>
            <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
              বাংলাদেশ ব্যাংক ও BSCS
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              কেন্দ্রীয় ব্যাংক ও সমন্বিত ৯ ব্যাংকের সহকারী পরিচালক, অফিসার ও ক্যাশ নিয়োগ।
            </p>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 pt-1">
              <span>সার্কুলার দেখুন</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/organizations/bpsc"
            className="p-5 bg-gradient-to-br from-white to-blue-50/50 rounded-2xl border border-blue-200/80 hover:border-blue-500 hover:shadow-lg transition-all group cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              🏛️
            </div>
            <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">
              বিপিএসসি (BPSC)
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              বাংলাদেশ সরকারি কর্ম কমিশনের বিসিএস ও নন-ক্যাডার ১ম ও ২য় শ্রেণির নিয়োগ হাব।
            </p>
            <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1 pt-1">
              <span>সার্কুলার দেখুন</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/organizations/government-ministries"
            className="p-5 bg-gradient-to-br from-white to-amber-50/50 rounded-2xl border border-amber-200/80 hover:border-amber-500 hover:shadow-lg transition-all group cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              🏢
            </div>
            <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors">
              সকল মন্ত্রণালয়সমূহ
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              অর্থ, স্বরাষ্ট্র, জনপ্রশাসনসহ সচিবালয় ও মন্ত্রণালয়ের সকল শূন্যপদের ফিড।
            </p>
            <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 pt-1">
              <span>সার্কুলার দেখুন</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/organizations/government-directorates"
            className="p-5 bg-gradient-to-br from-white to-purple-50/50 rounded-2xl border border-purple-200/80 hover:border-purple-500 hover:shadow-lg transition-all group cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              📑
            </div>
            <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              সকল অধিদপ্তরসমূহ
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              প্রাথমিক শিক্ষা, স্বাস্থ্য, কর অঞ্চল ও সমাজসেবা অধিদপ্তরের মাঠপর্যায়ের পদ।
            </p>
            <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1 pt-1">
              <span>সার্কুলার দেখুন</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

        </div>
      </div>

      {/* FILTER, SEARCH & ALPHABET BAR CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        
        {/* Search & Sector Type Tabs */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text"
              placeholder="প্রতিষ্ঠানের নাম বা অ্যাক্রোনিম দিয়ে খুঁজুন... (উদা: পেট্রোবাংলা, বিসিএসএল, ডিসি অফিস)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full lg:w-auto text-xs font-bold">
            {[
              { id: 'all', label: 'সকল প্রতিষ্ঠান' },
              { id: 'ministry', label: 'মন্ত্রণালয়' },
              { id: 'directorate', label: 'অধিদপ্তর/ইনস্টিটিউট' },
              { id: 'bank', label: 'ব্যাংক ও আর্থিক' },
              { id: 'power', label: 'বিদ্যুৎ ও কোম্পানি' },
              { id: 'dc', label: 'জেলা প্রশাসন/কোর্ট' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedType(cat.id)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ALPHABETICAL FILTER BAR (বর্ণানুক্রমিক ডিরেক্টরি) */}
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              বর্ণানুক্রমিক অনুসন্ধান (Alphabetical Jump):
            </span>
            {selectedLetter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedLetter('all')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                সকল বর্ণ দেখুন (রিসেট)
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1 items-center">
            {alphabetLetters.map((letter) => {
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-sm scale-105'
                      : 'bg-slate-50 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  {letter === 'all' ? 'সব' : letter}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Organizations Grid Counter & Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>মোট {toBn(filteredOrganizations.length)}টি প্রতিষ্ঠান পাওয়া গেছে</span>
          <span>সরাসরি পদের বিবরণ দেখতে কার্ডে ক্লিক করুন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org, idx) => (
            <Link
              key={idx}
              href={`/organizations/${org.slug}`}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 hover:border-emerald-500 hover:shadow-xl transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-2xs">
                    <JobLogo logo={org.logo} organization={org.name} size="md" className="w-full h-full object-contain" />
                  </div>

                  {org.activeJobsCount > 0 ? (
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <Briefcase className="w-3 h-3 text-emerald-700" />
                      <span>{toBn(org.activeJobsCount)}টি চলমান</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      ভেরিফাইড
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    {org.orgType}
                  </span>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {org.name}
                  </h3>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-emerald-700">
                <span className="text-slate-500 flex items-center gap-1">
                  {org.totalVacancies > 0 ? (
                    <>
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>মোট {toBn(org.totalVacancies)}টি শূন্যপদ</span>
                    </>
                  ) : (
                    <span>আর্কাইভ ও প্রোফাইল</span>
                  )}
                </span>
                <div className="flex items-center gap-1 text-emerald-700 font-bold group-hover:translate-x-1 transition-transform">
                  <span>সকল পদ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredOrganizations.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">কোনো নিয়োগকারী প্রতিষ্ঠান পাওয়া যায়নি।</h3>
            <p className="text-xs text-slate-500">অন্য কোনো বর্ণ বা কি-ওয়ার্ড দিয়ে অনুসন্ধান করুন।</p>
          </div>
        )}
      </div>

    </div>
  );
}

