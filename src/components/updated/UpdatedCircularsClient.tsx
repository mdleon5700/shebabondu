'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Building2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Search, 
  Filter, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { JobCircular } from '@/lib/types';
import DeadlineCountdown from '@/components/deadlines/DeadlineCountdown';

const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

export interface UpdatedJobItem extends JobCircular {
  updateTypes: ('DEADLINE_EXTENDED' | 'CORRIGENDUM' | 'VACANCY_CHANGED')[];
  revisions?: any[];
  corrigendumText?: string;
  corrigendumPdfUrl?: string;
  corrigendumDate?: string;
  previousPosts?: number;
  newPosts?: number;
}

interface Props {
  initialJobs: UpdatedJobItem[];
}

export default function UpdatedCircularsClient({ initialJobs }: Props) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'DEADLINE_EXTENDED' | 'CORRIGENDUM' | 'VACANCY_CHANGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Counts for tabs
  const extendedCount = useMemo(() => 
    initialJobs.filter(j => j.updateTypes.includes('DEADLINE_EXTENDED')).length, 
    [initialJobs]
  );
  const corrigendumCount = useMemo(() => 
    initialJobs.filter(j => j.updateTypes.includes('CORRIGENDUM')).length, 
    [initialJobs]
  );
  const vacancyCount = useMemo(() => 
    initialJobs.filter(j => j.updateTypes.includes('VACANCY_CHANGED')).length, 
    [initialJobs]
  );

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return initialJobs.filter(job => {
      // Tab filter
      if (activeTab !== 'ALL' && !job.updateTypes.includes(activeTab)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && job.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchOrg = job.organization.toLowerCase().includes(q);
        const matchDesc = (job.bengaliDescription || '').toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchDesc) return false;
      }
      return true;
    });
  }, [initialJobs, activeTab, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Tabs & Search Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* Update Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>সকল আপডেট</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'ALL' ? 'bg-purple-900/60 text-purple-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {toBn(initialJobs.length)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('DEADLINE_EXTENDED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DEADLINE_EXTENDED'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>সময় বৃদ্ধি</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'DEADLINE_EXTENDED' ? 'bg-purple-900/60 text-purple-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {toBn(extendedCount)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CORRIGENDUM')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CORRIGENDUM'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>সংশোধনী গেজেট</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'CORRIGENDUM' ? 'bg-amber-800/60 text-amber-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {toBn(corrigendumCount)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('VACANCY_CHANGED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'VACANCY_CHANGED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>পদসংখ্যা পরিবর্তন</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'VACANCY_CHANGED' ? 'bg-blue-800/60 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {toBn(vacancyCount)}
            </span>
          </button>
        </div>

        {/* Search & Category Inputs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পদ বা প্রতিষ্ঠান দিয়ে ফিল্টার করুন..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-slate-50/50"
            />
          </div>

          <div className="sm:w-56 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-slate-50/50 cursor-pointer"
            >
              <option value="ALL">সকল ক্যাটাগরি</option>
              <option value="govt">সরকারি চাকরি</option>
              <option value="company">কোম্পানি ও স্বায়ত্তশাসিত</option>
              <option value="bank">ব্যাংক ও আর্থিক প্রতিষ্ঠান</option>
              <option value="defense">প্রতিরক্ষা ও নিরাপত্তা</option>
              <option value="health">স্বাস্থ্য ও চিকিৎসা</option>
            </select>
          </div>

          {(searchQuery || selectedCategory !== 'ALL' || activeTab !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setActiveTab('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-2 flex items-center justify-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          )}
        </div>
      </div>

      {/* Circulars Grid or Empty State */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map(job => (
            <div 
              key={job.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-3">
                {/* Badges Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {job.updateTypes.includes('CORRIGENDUM') && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-600" />
                      <span>সংশোধনী গেজেট</span>
                    </span>
                  )}
                  {job.updateTypes.includes('DEADLINE_EXTENDED') && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" />
                      <span>সময় বর্ধিত</span>
                    </span>
                  )}
                  {job.updateTypes.includes('VACANCY_CHANGED') && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span>পদসংখ্যা পরিবর্তিত</span>
                    </span>
                  )}

                  <div className="ml-auto">
                    <DeadlineCountdown
                      jobId={job.id}
                      deadlineText={job.deadline}
                      initialDaysRemaining={job.daysRemaining}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Job Title & Organization */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 hover:text-purple-700 transition-colors leading-snug">
                    <Link href={`/jobs/${job.slug || job.id}`}>{job.title}</Link>
                  </h3>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{job.organization}</span>
                  </div>
                </div>

                {/* Corrigendum & Update Callout Box */}
                {job.revisions && job.revisions.length > 0 ? (
                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                      <span>সংশোধিত ডেডলাইন: {job.revisions[0].newDeadline}</span>
                    </div>
                    {job.revisions[0].previousDeadline && (
                      <div className="text-[11px] text-purple-700">
                        পূর্ববর্তী ডেডলাইন: {job.revisions[0].previousDeadline}
                      </div>
                    )}
                    {job.revisions[0].changeReason && (
                      <div className="text-[11px] text-purple-800 pt-0.5">
                        কারন: {job.revisions[0].changeReason}
                      </div>
                    )}
                  </div>
                ) : job.corrigendumText ? (
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-amber-800">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>অফিসিয়াল সংশোধনী নোটিশ:</span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      {job.corrigendumText}
                    </p>
                    {job.corrigendumPdfUrl && (
                      <a
                        href={job.corrigendumPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline pt-0.5"
                      >
                        <span>সংশোধনী নোটিশ পিডিএফ দেখুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  href={`/jobs/${job.slug || job.id}`}
                  className="text-xs font-bold text-slate-700 hover:text-purple-600 transition-colors"
                >
                  বিস্তারিত সার্কুলার
                </Link>

                <Link
                  href={`/apply/${job.id}`}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>১-ক্লিক আবেদন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-800">
              {searchQuery || selectedCategory !== 'ALL' || activeTab !== 'ALL'
                ? 'আপনার নির্বাচিত ফিল্টারে কোনো সংশোধিত সার্কুলার পাওয়া যায়নি'
                : 'সম্প্রতি কোনো সংশোধিত বা সময় বর্ধিত সার্কুলার আসেনি'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              সরকারি গেজেট বা সংশ্লিষ্ট প্রতিষ্ঠান থেকে কোনো নিয়োগের আবেদনের সময়সীমা বৃদ্ধি, পদসংখ্যা পরিবর্তন বা সংশোধনী নোটিশ প্রকাশ পেলে তাৎক্ষণিকভাবে এই তালিকায় সংযুক্ত হবে।
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/latest-jobs"
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>সর্বশেষ প্রকাশিত সার্কুলার দেখুন</span>
            </Link>
            <Link
              href="/jobs"
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span>সকল চাকরির আর্কাইভ</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
