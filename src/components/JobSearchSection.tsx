'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  GraduationCap, 
  Flame, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Building2, 
  Banknote, 
  Award,
  MapPin,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface JobSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedJobType: string;
  setSelectedJobType: (type: string) => void;
  selectedEducation: string;
  setSelectedEducation: (edu: string) => void;
  selectedOrg: string;
  setSelectedOrg: (org: string) => void;
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedSalary: string;
  setSelectedSalary: (salary: string) => void;
  selectedDistrict?: string;
  setSelectedDistrict?: (district: string) => void;
  districtsList?: string[];
  onSearch: () => void;
  onReset: () => void;
  onCategoryReset?: () => void;
  activeFilterCount: number;
}

export default function JobSearchSection({
  searchQuery,
  setSearchQuery,
  selectedJobType,
  setSelectedJobType,
  selectedEducation,
  setSelectedEducation,
  selectedOrg,
  setSelectedOrg,
  selectedGrade,
  setSelectedGrade,
  selectedSalary,
  setSelectedSalary,
  selectedDistrict = 'all',
  setSelectedDistrict,
  districtsList = ['সকল জেলা', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ', 'কুমিল্লা', 'বগুড়া', 'নোয়াখালী'],
  onSearch,
  onReset,
  onCategoryReset,
  activeFilterCount
}: JobSearchSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (chipsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = chipsScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(checkScroll, 200);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipsScrollRef.current) {
      const scrollAmount = 240;
      chipsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 320);
    }
  };

  const popularSearches = [
    { label: 'সরকারি চাকরি', type: 'govt', keyword: '' },
    { label: 'ব্যাংক চাকরি', type: 'bank', keyword: '' },
    { label: 'শিক্ষক নিয়োগ', type: 'teacher', keyword: '' },
    { label: 'রেলওয়ে চাকরি', type: 'railway', keyword: '' },
    { label: 'এনজিও চাকরি', type: 'ngo', keyword: '' },
    { label: 'বেসরকারি চাকরি', type: 'private', keyword: '' },
    { label: 'সহকারী পরিচালক', type: 'all', keyword: 'সহকারী পরিচালক' },
    { label: 'অফিস সহকারী', type: 'all', keyword: 'অফিস সহকারী' },
    { label: 'ইঞ্জিনিয়ার', type: 'all', keyword: 'ইঞ্জিনিয়ার' },
    { label: 'কম্পিউটার অপারেটর', type: 'all', keyword: 'কম্পিউটার' },
  ];

  const handleChipClick = (chip: { label: string; type: string; keyword: string }) => {
    if (onCategoryReset) {
      onCategoryReset();
    }
    if (chip.type !== 'all') {
      setSelectedJobType(chip.type);
      setSearchQuery('');
    } else if (chip.keyword) {
      setSearchQuery(chip.keyword);
      setSelectedJobType('all');
    } else {
      setSearchQuery(chip.label);
    }
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const hasAnyFilterActive = activeFilterCount > 0 || 
                             selectedJobType !== 'all' || 
                             selectedEducation !== 'all' || 
                             searchQuery.trim() !== '' ||
                             (selectedDistrict && selectedDistrict !== 'all');

  return (
    <section className="bg-[#f4fbf7] border-b border-emerald-900/10 py-3.5 sm:py-6 lg:py-8 px-3.5 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xl shadow-slate-900/5 p-4 sm:p-6 lg:p-7 space-y-4">
          
          {/* First Row: Search Inputs & Action Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            
            {/* 1. Job title / Keyword input */}
            <div className="md:col-span-5">
              <label htmlFor="search-keyword" className="block text-[15px] sm:text-[16px] font-bold text-slate-700 mb-1.5 font-hind">
                পদের নাম বা কীওয়ার্ড
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="search-keyword"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="পদের নাম, প্রতিষ্ঠানের নাম বা কীওয়ার্ড লিখুন..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[15px] sm:text-[16px] font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50/50 hover:bg-white"
                />
              </div>
            </div>

            {/* 2. Job Type dropdown */}
            <div className="md:col-span-3">
              <label htmlFor="job-type-select" className="block text-[15px] sm:text-[16px] font-bold text-slate-700 mb-1.5 font-hind">
                চাকরির ধরন
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
                <select
                  id="job-type-select"
                  value={selectedJobType}
                  onChange={(e) => {
                    setSelectedJobType(e.target.value);
                    if (onCategoryReset) onCategoryReset();
                  }}
                  className="w-full pl-10 pr-9 py-3 rounded-xl border border-slate-200 text-[15px] sm:text-[16px] font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50/50 hover:bg-white appearance-none cursor-pointer"
                >
                  <option value="all">সব ধরনের চাকরি</option>
                  <option value="govt">🏛️ সরকারি চাকরি</option>
                  <option value="bank">💼 ব্যাংক চাকরি</option>
                  <option value="teacher">🎒 শিক্ষক নিয়োগ</option>
                  <option value="railway">🚆 রেলওয়ে চাকরি</option>
                  <option value="ngo">🤝 এনজিও চাকরি</option>
                  <option value="private">🏢 বেসরকারি চাকরি</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 3. Education Qualification dropdown */}
            <div className="md:col-span-2">
              <label htmlFor="education-select" className="block text-[15px] sm:text-[16px] font-bold text-slate-700 mb-1.5 font-hind">
                শিক্ষাগত যোগ্যতা
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
                <select
                  id="education-select"
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full pl-10 pr-9 py-3 rounded-xl border border-slate-200 text-[15px] sm:text-[16px] font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50/50 hover:bg-white appearance-none cursor-pointer"
                >
                  <option value="all">সব যোগ্যতা</option>
                  <option value="hsc">এইচএসসি (HSC)</option>
                  <option value="graduate">স্নাতক (ডিগ্রি/অনার্স)</option>
                  <option value="postgraduate">মাস্টার্স (স্নাতকোত্তর)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 4. Primary Search Button */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={onSearch}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] text-white font-bold text-[16px] sm:text-[17px] shadow-md shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all font-hind cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>চাকরি খুঁজুন</span>
              </button>
            </div>

          </div>

          {/* Toggle for Advanced Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3.5 py-1.5 rounded-xl text-[14px] font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  showAdvanced || activeFilterCount > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>উন্নত ফিল্টার</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {hasAnyFilterActive && (
                <button
                  type="button"
                  onClick={onReset}
                  className="px-3 py-1.5 rounded-xl text-[13px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>রিসেট করুন</span>
                </button>
              )}
            </div>

            <span className="text-[12px] sm:text-[13px] text-slate-400 font-medium">
              প্রতিষ্ঠান, গ্রেড, বেতন ও জেলা ভিত্তিক সুনির্দিষ্ট অনুসন্ধান
            </span>
          </div>

          {/* Collapsible Advanced Filters Drawer */}
          {showAdvanced && (
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
              
              {/* 1. Organization Dropdown */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>প্রতিষ্ঠান / সংস্থা</span>
                </label>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">সকল প্রতিষ্ঠান</option>
                  <option value="বাংলাদেশ ব্যাংক">বাংলাদেশ ব্যাংক</option>
                  <option value="বিসিএস">বিসিএস / পিএসসি</option>
                  <option value="রেলওয়ে">বাংলাদেশ রেলওয়ে</option>
                  <option value="পেট্রোবাংলা">পেট্রোবাংলা</option>
                  <option value="বিদ্যুৎ">বিদ্যুৎ উন্নয়ন বোর্ড</option>
                  <option value="শিক্ষা">শিক্ষা মন্ত্রণালয় / অধিদপ্তর</option>
                  <option value="পুলিশ">পুলিশ ও স্বরাষ্ট্র</option>
                  <option value="আশুগঞ্জ">আশুগঞ্জ পাওয়ার</option>
                </select>
              </div>

              {/* 2. Grade Dropdown */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>জাতীয় বেতন স্কেল গ্রেড</span>
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">সকল গ্রেড</option>
                  <option value="৯ম গ্রেড">৯ম গ্রেড (১ম শ্রেণি)</option>
                  <option value="১০ম গ্রেড">১০ম গ্রেড (২য় শ্রেণি)</option>
                  <option value="১১তম - ১৬তম">১১তম - ১৬তম গ্রেড</option>
                  <option value="১৭তম - ২০তম">১৭তম - ২০তম গ্রেড</option>
                </select>
              </div>

              {/* 3. Salary Range Dropdown */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>বেতন স্কেল পরিসীমা</span>
                </label>
                <select
                  value={selectedSalary}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">সকল বেতন স্কেল</option>
                  <option value="under_25k">শুরুর মূল বেতন ২৫,০০০ এর নিচে</option>
                  <option value="25k_50k">স্কেল ২৫,০০০ থেকে ৫০,০০০ টাকা</option>
                  <option value="above_35k">সর্বোচ্চ স্কেল ৩৫,০০০ টাকার বেশি</option>
                </select>
              </div>

              {/* 4. District Dropdown */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>জেলা ভিত্তিক যোগ্যতা</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict?.(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {districtsList.map((dist) => (
                    <option key={dist} value={dist === 'সকল জেলা' ? 'all' : dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          )}

          {/* Third Row: Popular Searches (Single Line, Never Wraps, With Arrows) */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            
            <div className="inline-flex items-center gap-1.5 text-[15px] sm:text-[16px] font-bold text-slate-700 flex-shrink-0 font-hind">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">জনপ্রিয় অনুসন্ধান:</span>
              <span className="sm:hidden">জনপ্রিয়:</span>
            </div>

            {/* Scroll Container with Left/Right Arrow Buttons */}
            <div className="relative flex items-center min-w-0 flex-1 overflow-hidden">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollChips('left')}
                  aria-label="পূর্ববর্তী চিপস দেখুন"
                  className="absolute left-0 z-10 w-7 h-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Chips Track */}
              <div 
                ref={chipsScrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap scroll-smooth px-1 py-1"
              >
                {popularSearches.map((chip, idx) => {
                  const isActive = (chip.type !== 'all' && selectedJobType === chip.type) || 
                                   (chip.keyword && searchQuery === chip.keyword);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[14px] sm:text-[15px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/80'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollChips('right')}
                  aria-label="পরবর্তী চিপস দেখুন"
                  className="absolute right-0 z-10 w-7 h-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
