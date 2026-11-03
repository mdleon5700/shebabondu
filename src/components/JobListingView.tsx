'use client';
import { matchJobQuery } from '@/lib/search-helper';
import { fetchPublicJobs } from '@/lib/public-jobs-client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase,
  AlertCircle,
  RefreshCw, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Users, 
  Clock, 
  BookOpen,
  ArrowRight,
  Flame,
  Layers,
  GraduationCap
} from 'lucide-react';
import { JobCircular } from '@/lib/types';
import { storage } from '@/lib/store';
import JobCard from './JobCard';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface JobListingViewProps {
  title: string;
  subtitle: string;
  badge?: string;
  breadcrumbs: BreadcrumbItem[];
  filterType?: string;
  seoDescription?: string;
  seoTextContent?: {
    heading: string;
    paragraphs: string[];
    tips?: string[];
  };
  canonicalUrl?: string;
}

const JOBS_PER_PAGE = 9;

// Bengali numeral helper
const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

export default function JobListingView({
  title,
  subtitle,
  badge = 'চলমান নিয়োগ',
  breadcrumbs,
  filterType = 'all',
  seoDescription,
  seoTextContent,
  canonicalUrl
}: JobListingViewProps) {
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'recent' | 'posts'>('deadline');
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCanonicalJobs = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = { success: true, jobs: await fetchPublicJobs() };
      if (data && data.success && Array.isArray(data.jobs)) {
        // Enforce published canonical jobs only (zero mock jobs, zero drafts)
        const validCanonicalJobs: JobCircular[] = data.jobs.filter((j: any) => 
          !j.id?.startsWith('draft-') && 
          j.status !== 'UNPUBLISHED' && 
          j.status !== 'DRAFT'
        );
        setJobs(validCanonicalJobs);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cs_jobs_data', JSON.stringify(validCanonicalJobs));
          } catch {}
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch canonical jobs:', err);
      setFetchError(err.message || 'বিজ্ঞপ্তি লোড করতে সমস্যা হয়েছে');
      const cached = storage.getJobs();
      if (cached && cached.length > 0) {
        setJobs(cached.filter((j: any) => !j.id?.startsWith('draft-')));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCanonicalJobs();
    const handleJobsChanged = () => fetchCanonicalJobs();
    window.addEventListener('cs_jobs_changed', handleJobsChanged);
    return () => window.removeEventListener('cs_jobs_changed', handleJobsChanged);
  }, []);

  // Filter jobs based on filterType
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Custom filter based on type string
      switch (filterType) {
        case 'latest':
          const isRecent = !job.publishedDate || job.publishedDate.includes('নভেম্বর') || job.publishedDate.includes('অক্টোবর') || (job.daysRemaining && job.daysRemaining > 0); if (!(job.featured || isRecent || (job.daysRemaining && job.daysRemaining > 15))) return false;
          break;
        case 'deadline':
          if (job.daysRemaining > 5) return false;
          break;
        case 'govt':
          if (!['govt', 'railway', 'defense', 'teacher'].includes(job.category)) return false;
          break;
        case 'private':
          if (!['private', 'ngo'].includes(job.category)) return false;
          break;
        case 'bank':
          if (job.category !== 'bank') return false;
          break;
        case 'teacher':
          if (job.category !== 'teacher' && !job.title.includes('শিক্ষক')) return false;
          break;
        case 'ngo':
          if (job.category !== 'ngo') return false;
          break;
        case 'it':
          if (job.category !== 'engineer' && !job.title.includes('কম্পিউটার') && !job.title.includes('আইটি')) return false;
          break;
        case 'medical':
          if (job.category !== 'health') return false;
          break;
        case 'tutoring':
          if (job.category !== 'teacher' && !job.title.includes('শিক্ষক')) return false;
          break;
        case 'part-time':
          if (job.category !== 'private' && job.totalPosts <= 50) return false;
          break;
        case 'internship':
          if (job.category !== 'bank' && job.category !== 'private') return false;
          break;
        case 'fresher':
        case 'no-experience':
          if (job.minAge > 21) return false;
          break;
        case 'marketing':
          if (job.category !== 'private' && job.category !== 'bank') return false;
          break;
        case 'engineering':
          if (job.category !== 'engineer') return false;
          break;
        case 'accounting-finance':
          if (job.category !== 'bank' && !job.title.includes('অফিসার') && !job.title.includes('ক্যাশ')) return false;
          break;
        case 'ssc':
          if (!job.minEducation.includes('এসএসসি') && !job.minEducation.includes('HSC') && !job.grade.includes('১৬') && !job.grade.includes('২০')) return false;
          break;
        case 'hsc':
          if (!job.minEducation.includes('HSC') && !job.minEducation.includes('উচ্চ মাধ্যমিক') && !job.minEducation.includes('এইচএসসি')) return false;
          break;
        case 'diploma':
          if (job.category !== 'engineer' && !job.grade.includes('১০ম')) return false;
          break;
        case 'bachelor':
          if (!job.minEducation.includes('স্নাতক') && !job.minEducation.includes('ডিগ্রি')) return false;
          break;
        case 'masters':
          if (!job.minEducation.includes('স্নাতকোত্তর') && !job.minEducation.includes('মাস্টার্স') && !job.grade.includes('৯ম')) return false;
          break;
        case 'org-bb':
          if (!job.organization.includes('বাংলাদেশ ব্যাংক')) return false;
          break;
        case 'org-bpsc':
          if (!job.organization.includes('বিসিএস') && !job.organization.includes('কর্ম কমিশন') && job.category !== 'govt') return false;
          break;
        case 'org-ministries':
          if (!job.organization.includes('মন্ত্রণালয়') && job.category !== 'govt') return false;
          break;
        case 'org-directorates':
          if (!job.organization.includes('অধিদপ্তর') && job.category !== 'govt') return false;
          break;
        case 'all':
        default:
          break;
      }

      // Grade filter
      if (selectedGrade !== 'all' && job.grade !== selectedGrade) return false;

      // Search query (smart bilingual & position-level matching)
      if (searchQuery.trim()) {
        if (!matchJobQuery(job, searchQuery)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') return a.daysRemaining - b.daysRemaining;
      if (sortBy === 'posts') return b.totalPosts - a.totalPosts;
      return (b.id > a.id ? 1 : -1);
    });
  }, [jobs, filterType, selectedGrade, searchQuery, sortBy]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGrade, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(start, start + JOBS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  // JSON-LD Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": b.label,
      "item": b.href ? `https://chakriseba.com${b.href}` : undefined
    }))
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        {breadcrumbs.map((b, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-300">/</span>}
            {b.href && idx < breadcrumbs.length - 1 ? (
              <Link href={b.href} className="hover:text-emerald-700 transition-colors">
                {b.label}
              </Link>
            ) : (
              <span className="text-slate-800 font-bold">{b.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* 2. Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>১০০% অফিসিয়াল গ্যাজেট ও যাচাইকৃত বিজ্ঞপ্তি</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>প্রতিদিন নিয়মিত আপডেট</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="পদ, প্রতিষ্ঠান বা শিক্ষাগত যোগ্যতা দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Grade & Sort Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          >
            <option value="all">সকল গ্রেড</option>
            <option value="৯ম গ্রেড">৯ম গ্রেড</option>
            <option value="১০ম গ্রেড">১০ম গ্রেড</option>
            <option value="১১তম - ১৬তম">১১তম - ১৬তম গ্রেড</option>
            <option value="১৭তম - ২০তম">১৭তম - ২০তম গ্রেড</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          >
            <option value="deadline">আবেদনের শেষ সময় (নিকটবর্তী)</option>
            <option value="recent">সর্বশেষ প্রকাশিত</option>
            <option value="posts">সর্বোচ্চ পদসংখ্যা</option>
          </select>
        </div>
      </div>

      {/* 4. Active Results Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
        <span>
          মোট <strong className="text-emerald-700">{toBn(filteredJobs.length)}</strong> টি বিজ্ঞপ্তি পাওয়া গেছে
        </span>
        {filteredJobs.length > 0 && (
          <span>
            পৃষ্ঠা {toBn(currentPage)} / {toBn(totalPages || 1)}
          </span>
        )}
      </div>

      {/* 5. Job Cards Grid */}
      {isLoading && jobs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-24 bg-slate-200 rounded-md" />
                <div className="h-6 w-16 bg-slate-200 rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-6 w-full bg-slate-200 rounded" />
              </div>
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="flex gap-2 pt-2">
                <div className="h-10 flex-1 bg-slate-200 rounded-xl" />
                <div className="h-10 flex-1 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : fetchError && jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">বিজ্ঞপ্তি লোড করা সম্ভব হয়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{fetchError}</p>
          </div>
          <button
            onClick={() => fetchCanonicalJobs()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় চেষ্টা করুন</span>
          </button>
        </div>
      ) : paginatedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">কোনো চাকরি পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              আপনার সার্চ কোয়েরির সাথে মিল পাওয়া যায়নি। বানান পরীক্ষা করুন অথবা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
            </p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setSelectedGrade('all'); }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      )}

      {/* 6. Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, index) => index + 1).filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1).map((pageNumber, index, pages) => (
            <React.Fragment key={pageNumber}>
            {index > 0 && pageNumber - pages[index - 1] > 1 && <span aria-hidden="true">…</span>}
            <button
              onClick={() => setCurrentPage(pageNumber)}
              aria-label={'পৃষ্ঠা ' + toBn(pageNumber)}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                currentPage === pageNumber
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-800/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {toBn(pageNumber)}
            </button>
            </React.Fragment>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 7. SEO Educational Content & Preparation Tips */}
      {seoTextContent && (
        <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/90 space-y-5 text-slate-700">
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>{seoTextContent.heading}</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {seoTextContent.paragraphs.map((para, idx) => (
                <p key={idx}>{para.replace(/^"|"$/g, '')}</p>
              ))}
            </div>
          </div>

          {seoTextContent.tips && seoTextContent.tips.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2.5">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>সফল আবেদনের গুরুত্বপূর্ণ টিপস</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {seoTextContent.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
