'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Briefcase,
  AlertCircle,
  RefreshCw, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Clock, 
  BookOpen,
  ArrowRight,
  Flame,
  Layers,
  GraduationCap,
  Award,
  SlidersHorizontal,
  RotateCcw,
  Banknote,
  MapPin
} from 'lucide-react';
import { JobCircular } from '@/lib/types';
import { storage } from '@/lib/store';
import JobCard from './JobCard';
import { matchJobQuery, matchGradeComprehensive, parseSalaryRange, toBn } from '@/lib/search-helper';
import { fetchPublicJobs } from '@/lib/public-jobs-client';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';

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

function JobListingViewContent({
  title,
  subtitle,
  badge = 'চলমান নিয়োগ',
  breadcrumbs,
  filterType = 'all',
  seoDescription,
  seoTextContent,
  canonicalUrl
}: JobListingViewProps) {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get('q') || searchParams?.get('search') || '';
  const initialCat = searchParams?.get('category') || 'all';
  const initialGrade = searchParams?.get('grade') || 'all';
  const initialDistrict = searchParams?.get('district') || 'all';
  const initialSalary = searchParams?.get('salary') || 'all';

  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedSalary, setSelectedSalary] = useState(initialSalary);
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

  // Filter jobs based on filterType and active interactive selectors
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Initial Page-level FilterType (e.g. ssc, hsc, bachelor, etc.)
      switch (filterType) {
        case 'latest': {
          const isRecent = !job.publishedDate || job.publishedDate.includes('নভেম্বর') || job.publishedDate.includes('অক্টোবর') || (job.daysRemaining && job.daysRemaining > 0);
          if (!(job.featured || isRecent || (job.daysRemaining && job.daysRemaining > 15))) return false;
          break;
        }
        case 'deadline': {
          const evalRes = CentralDeadlineEngine.evaluateDeadline(job);
          if (evalRes.isClosed) return false;
          if (evalRes.daysRemaining > 5 || evalRes.daysRemaining < 0) return false;
          break;
        }
        case 'govt':
          if (!['govt', 'railway', 'defense', 'teacher'].includes(job.category)) return false;
          break;
        case 'private':
          if (!['private', 'ngo', 'company'].includes(job.category)) return false;
          break;
        case 'bank':
          if (job.category !== 'bank') return false;
          break;
        case 'teacher':
          if (
            job.category !== 'teacher' && 
            !job.title.includes('শিক্ষক') && 
            !job.title.includes('প্রভাষক') &&
            !(job.positions && job.positions.some(p => p.title?.includes('শিক্ষক') || p.title?.includes('প্রভাষক')))
          ) return false;
          break;
        case 'ngo':
          if (job.category !== 'ngo') return false;
          break;
        case 'it':
          if (
            job.category !== 'engineer' && 
            !job.title.includes('কম্পিউটার') && 
            !job.title.includes('আইটি') && 
            !job.title.includes('ডাটা') && 
            !job.title.includes('Data') && 
            !job.title.includes('প্রোগ্রামার') &&
            !(job.positions && job.positions.some(p => p.title?.includes('কম্পিউটার') || p.title?.includes('আইটি') || p.title?.includes('ডাটা') || p.title?.includes('প্রোগ্রামার')))
          ) return false;
          break;
        case 'medical':
          if (
            job.category !== 'health' && 
            !job.title.includes('নার্স') && 
            !job.title.includes('মেডিকেল') && 
            !job.title.includes('স্বাস্থ্য') &&
            !job.title.includes('ডাক্তার') &&
            !(job.positions && job.positions.some(p => p.title?.includes('নার্স') || p.title?.includes('মেডিকেল') || p.title?.includes('স্বাস্থ্য')))
          ) return false;
          break;
        case 'tutoring':
          if (
            job.category !== 'teacher' && 
            !job.title.includes('শিক্ষক') && 
            !job.title.includes('প্রভাষক')
          ) return false;
          break;
        case 'jsc': {
          const texts = [job.minEducation || '', job.title || '', job.eligibility || ''];
          if (job.positions) job.positions.forEach(p => { texts.push(p.minEducation || '', p.title || ''); });
          const str = texts.join(' ').toLowerCase();
          const matchesJsc = (
            str.includes('জেএসসি') || 
            str.includes('jsc') || 
            str.includes('অষ্টম') || 
            str.includes('৮ম') || 
            str.includes('জুনিয়র স্কুল') ||
            job.grade.includes('২০তম') || 
            job.grade.includes('১৯তম') ||
            job.title.includes('অফিস সহায়ক') ||
            job.title.includes('নিরাপত্তা প্রহরী') ||
            job.title.includes('পরিচ্ছন্নতাকর্মী') ||
            job.title.includes('মালি')
          );
          if (!matchesJsc) return false;
          break;
        }
        case 'ssc': {
          const texts = [job.minEducation || '', job.title || '', job.eligibility || ''];
          if (job.positions) job.positions.forEach(p => { texts.push(p.minEducation || '', p.title || ''); });
          const str = texts.join(' ').toLowerCase();
          const matchesSsc = (
            str.includes('এসএসসি') || 
            str.includes('ssc') || 
            str.includes('দাখিল') || 
            str.includes('মাধ্যমিক') || 
            str.includes('ভোকেশনাল') ||
            job.grade.includes('১৬তম') ||
            job.grade.includes('১৭তম') ||
            job.grade.includes('১৮তম')
          );
          if (!matchesSsc) return false;
          break;
        }
        case 'hsc': {
          const texts = [job.minEducation || '', job.title || '', job.eligibility || ''];
          if (job.positions) job.positions.forEach(p => { texts.push(p.minEducation || '', p.title || ''); });
          const str = texts.join(' ').toLowerCase();
          const matchesHsc = (
            str.includes('এইচএসসি') || 
            str.includes('hsc') || 
            str.includes('উচ্চ মাধ্যমিক') || 
            str.includes('উচ্চমাধ্যমিক') || 
            str.includes('আলিম') ||
            job.grade.includes('১১তম') ||
            job.grade.includes('১২তম') ||
            job.grade.includes('১৩তম') ||
            job.grade.includes('১৪তম') ||
            job.grade.includes('১৫তম')
          );
          if (!matchesHsc) return false;
          break;
        }
        case 'diploma': {
          const texts = [job.minEducation || '', job.title || '', job.eligibility || ''];
          if (job.positions) job.positions.forEach(p => { texts.push(p.minEducation || '', p.title || ''); });
          const str = texts.join(' ').toLowerCase();
          const matchesDiploma = (
            str.includes('ডিপ্লোমা') || 
            str.includes('diploma') || 
            str.includes('পলিটেকনিক') ||
            str.includes('উপ-সহকারী প্রকৌশলী') ||
            job.title.includes('উপ-সহকারী প্রকৌশলী') ||
            job.title.includes('সার্ভেয়ার') ||
            job.title.includes('ড্রাফটসম্যান')
          );
          if (!matchesDiploma) return false;
          break;
        }
        case 'bachelor': {
          const texts = [job.minEducation || '', job.title || '', job.eligibility || ''];
          if (job.positions) job.positions.forEach(p => { texts.push(p.minEducation || '', p.title || ''); });
          const str = texts.join(' ').toLowerCase();
          const matchesBachelor = (
            str.includes('স্নাতক') || 
            str.includes('ডিগ্রি') || 
            str.includes('অনার্স') || 
            str.includes('bachelor') || 
            str.includes('ফাজিল') || 
            str.includes('বিএসসি') || 
            str.includes('b.sc') || 
            str.includes('bba') || 
            str.includes('বাণিজ্য/বিজ্ঞান/মানবিক') ||
            job.grade.includes('৯ম') ||
            job.grade.includes('১০ম')
          );
          if (!matchesBachelor) return false;
          break;
        }
        case 'masters': {
          const texts = [job.minEducation || '', job.title || '', job.eligibility || ''];
          if (job.positions) job.positions.forEach(p => { texts.push(p.minEducation || '', p.title || ''); });
          const str = texts.join(' ').toLowerCase();
          const matchesMasters = (
            str.includes('স্নাতকোত্তর') || 
            str.includes('মাস্টার্স') || 
            str.includes('masters') || 
            str.includes('কামিল') || 
            str.includes('এমবিএ') || 
            str.includes('mba') || 
            str.includes('m.sc') ||
            job.title.includes('প্রভাষক') ||
            job.title.includes('সহকারী পরিচালক')
          );
          if (!matchesMasters) return false;
          break;
        }
        case 'fresher':
        case 'no-experience': {
          const texts = [job.minEducation || '', job.title || '', job.eligibility || ''];
          if (job.requirements) texts.push(job.requirements.join(' '));
          const str = texts.join(' ').toLowerCase();

          // Exclude senior executive posts requiring extensive multi-year experience
          const isSenior = (
            str.includes('১০ বছরের বাস্তব অভিজ্ঞতা') ||
            str.includes('১২ বছরের বাস্তব অভিজ্ঞতা') ||
            str.includes('৮ বছরের বাস্তব অভিজ্ঞতা') ||
            str.includes('৭ বছরের বাস্তব অভিজ্ঞতা') ||
            str.includes('৫ বছরের বাস্তব অভিজ্ঞতা') ||
            str.includes('মহাব্যবস্থাপক') ||
            str.includes('প্রধান প্রকৌশলী') ||
            str.includes('নির্বাহী প্রকৌশলী') ||
            str.includes('উপ-মহাব্যবস্থাপক') ||
            str.includes('প্রকল্প পরিচালক') ||
            job.grade.includes('১ম গ্রেড') ||
            job.grade.includes('২য় গ্রেড') ||
            job.grade.includes('৩য় গ্রেড') ||
            job.grade.includes('৪র্থ গ্রেড') ||
            job.grade.includes('৫ম গ্রেড')
          );

          if (isSenior) return false;
          break;
        }
        case 'internship': {
          const texts = [job.title || '', job.bengaliDescription || '', job.categoryLabel || ''];
          const str = texts.join(' ').toLowerCase();
          const isInternship = (
            (job as any).employmentType === 'internship' ||
            str.includes('ইন্টার্ন') ||
            str.includes('intern')
          );
          if (!isInternship) return false;
          break;
        }
        case 'part-time': {
          const texts = [job.title || '', job.bengaliDescription || '', job.categoryLabel || ''];
          const str = texts.join(' ').toLowerCase();
          const isPartTime = (
            (job as any).employmentType === 'part_time' ||
            str.includes('পার্ট-টাইম') ||
            str.includes('খণ্ডকালীন') ||
            str.includes('part-time')
          );
          if (!isPartTime) return false;
          break;
        }
        case 'marketing':
          if (job.category !== 'private' && job.category !== 'bank') return false;
          break;
        case 'engineering':
          if (
            job.category !== 'engineer' && 
            !job.title.includes('প্রকৌশলী') && 
            !job.title.includes('ইঞ্জিনিয়ার') &&
            !(job.positions && job.positions.some(p => p.title?.includes('প্রকৌশলী') || p.title?.includes('ইঞ্জিনিয়ার')))
          ) return false;
          break;
        case 'accounting-finance':
          if (
            job.category !== 'bank' && 
            !job.title.includes('অফিসার') && 
            !job.title.includes('ক্যাশ') && 
            !job.title.includes('হিসাব') && 
            !job.title.includes('অডিট') && 
            !job.organization.includes('কর') && 
            !job.organization.includes('ট্যাক্স') &&
            !(job.positions && job.positions.some(p => p.title?.includes('হিসাব') || p.title?.includes('অডিট') || p.title?.includes('ক্যাশ')))
          ) return false;
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

      // 2. Interactive Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'govt' && !(job.category === 'govt' || job.category === 'railway' || job.categoryLabel?.includes('সরকারি') || job.categoryLabel?.includes('বিসিএস'))) return false;
        if (selectedCategory === 'company' && !(job.category === 'company' || job.category === 'private' || job.categoryLabel?.includes('কোম্পানি') || job.categoryLabel?.includes('স্বায়ত্তশাসিত'))) return false;
        if (selectedCategory === 'bank' && !(job.category === 'bank' || job.categoryLabel?.includes('ব্যাংক'))) return false;
        if (selectedCategory === 'defense' && !(job.category === 'defense' || job.categoryLabel?.includes('প্রতিরক্ষা') || job.categoryLabel?.includes('নিরাপত্তা') || job.categoryLabel?.includes('পুলিশ'))) return false;
        if (selectedCategory === 'health' && !(job.category === 'health' || job.categoryLabel?.includes('স্বাস্থ্য') || job.title.includes('নার্স') || job.title.includes('মেডিকেল'))) return false;
        if (selectedCategory === 'railway' && !(job.category === 'railway' || job.categoryLabel?.includes('রেলওয়ে') || job.organization.includes('রেলওয়ে'))) return false;
        if (selectedCategory === 'teacher' && !(job.category === 'teacher' || job.categoryLabel?.includes('শিক্ষক') || job.title.includes('শিক্ষক'))) return false;
        if (selectedCategory === 'engineer' && !(job.category === 'engineer' || job.title.includes('প্রকৌশলী') || job.title.includes('ইঞ্জিনিয়ার'))) return false;
        if (selectedCategory === 'ngo' && !(job.category === 'ngo' || job.categoryLabel?.includes('এনজিও'))) return false;
      }

      // 3. Interactive Grade Filter
      if (selectedGrade !== 'all' && !matchGradeComprehensive(job.grade, selectedGrade)) return false;

      // 4. Interactive District Filter
      if (selectedDistrict !== 'all') {
        const d = job.districts || '';
        const org = job.organization || '';
        if (!d.includes('সকল জেলা') && !d.includes(selectedDistrict) && !org.includes(selectedDistrict)) return false;
      }

      // 5. Interactive Salary Range Filter
      if (selectedSalary !== 'all') {
        const { min, max } = parseSalaryRange(job.salary);
        if (selectedSalary === 'under_25k' && (min === 0 || min > 25000)) return false;
        if (selectedSalary === '25k_50k' && (max < 25000 || min > 50000)) return false;
        if (selectedSalary === 'above_35k' && max < 35000) return false;
      }

      // 6. Interactive Search Query (Bilingual, Unicode & Position matching)
      if (searchQuery.trim()) {
        if (!matchJobQuery(job, searchQuery)) return false;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize active/open jobs over closed/expired jobs
      const aEval = CentralDeadlineEngine.evaluateDeadline(a);
      const bEval = CentralDeadlineEngine.evaluateDeadline(b);
      const aClosed = aEval.isClosed;
      const bClosed = bEval.isClosed;
      if (aClosed && !bClosed) return 1;
      if (!aClosed && bClosed) return -1;

      if (sortBy === 'deadline') {
        const aDays = aEval.daysRemaining ?? a.daysRemaining ?? 999;
        const bDays = bEval.daysRemaining ?? b.daysRemaining ?? 999;
        return aDays - bDays;
      }
      if (sortBy === 'posts') return b.totalPosts - a.totalPosts;
      return (b.id > a.id ? 1 : -1);
    });
  }, [jobs, filterType, selectedCategory, selectedGrade, selectedDistrict, selectedSalary, searchQuery, sortBy]);

  // Reset pagination on any filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedGrade, selectedDistrict, selectedSalary, sortBy]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedGrade !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedSalary !== 'all'
  );

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGrade('all');
    setSelectedDistrict('all');
    setSelectedSalary('all');
    setCurrentPage(1);
  };

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

      {/* Deadline Hub Navigator if on deadline view */}
      {filterType === 'deadline' && (
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/deadline-today"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            আজকের ডেডলাইন
          </Link>
          <Link
            href="/closing-soon"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            জরুরি ডেডলাইন (৪৮-৭২ ঘণ্টা)
          </Link>
          <Link
            href="/deadline-approaching"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-700 text-white shadow-xs flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>সকল সমাগত ডেডলাইন</span>
          </Link>
        </div>
      )}

      {/* Education & Experience Hub Navigator if on education/experience view */}
      {['jsc', 'ssc', 'hsc', 'diploma', 'bachelor', 'masters', 'no-experience', 'fresher', 'internship', 'part-time'].includes(filterType) && (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>শিক্ষাগত যোগ্যতা ও অভিজ্ঞতাকেন্দ্রিক হাব</span>
            </span>
            <span className="text-slate-400 font-normal hidden sm:inline">আপনার যোগ্যতা অনুযায়ী দ্রুত ফিল্টার করুন</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'jsc', label: 'জেএসসি / ৮ম শ্রেণি', href: '/jobs/jsc-pass' },
              { id: 'ssc', label: 'এসএসসি পাস', href: '/jobs/ssc-pass' },
              { id: 'hsc', label: 'এইচএসসি পাস', href: '/jobs/hsc-pass' },
              { id: 'diploma', label: 'ডিপ্লোমা প্রকৌশলী', href: '/jobs/diploma-pass' },
              { id: 'bachelor', label: 'স্নাতক পাস', href: '/jobs/bachelor-degree' },
              { id: 'masters', label: 'স্নাতকোত্তর পাস', href: '/jobs/masters-degree' },
              { id: 'no-experience', label: 'অভিজ্ঞতা ছাড়া', href: '/jobs/no-experience' },
              { id: 'fresher', label: 'ফ্রেশার চাকরি', href: '/fresher-jobs' },
              { id: 'internship', label: 'ইন্টার্নশিপ', href: '/internships' },
              { id: 'part-time', label: 'পার্ট-টাইম', href: '/part-time-jobs' }
            ].map((tab) => {
              const isActive = filterType === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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

      {/* 3. Search & Multi-Level Filter Panel */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Top Row: Search Input + Sorting */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Real-time Bilingual Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="পদ, প্রতিষ্ঠান, জেলা বা শিক্ষাগত যোগ্যতা দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                title="সার্চ মুছুন"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">সর্টিং:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 cursor-pointer"
            >
              <option value="deadline">আবেদনের শেষ সময় (নিকটবর্তী)</option>
              <option value="recent">সর্বশেষ প্রকাশিত</option>
              <option value="posts">সর্বোচ্চ পদসংখ্যা</option>
            </select>
          </div>
        </div>

        {/* Multi-Level Filter Controls (Category, Grade, District, Salary) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          {/* 1. Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-emerald-600" />
              <span>ক্যাটাগরি</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 cursor-pointer text-xs"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              <option value="govt">সরকারি চাকরি</option>
              <option value="company">কোম্পানি ও স্বায়ত্তশাসিত</option>
              <option value="defense">প্রতিরক্ষা ও পুলিশ</option>
              <option value="bank">ব্যাংক ও আর্থিক</option>
              <option value="health">স্বাস্থ্য ও চিকিৎসা</option>
              <option value="engineer">প্রকৌশল ও টেকনিক্যাল</option>
              <option value="teacher">শিক্ষক নিয়োগ</option>
              <option value="railway">বাংলাদেশ রেলওয়ে</option>
            </select>
          </div>

          {/* 2. Grade */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-600" />
              <span>বেতন স্কেল গ্রেড</span>
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 cursor-pointer text-xs"
            >
              <option value="all">সকল গ্রেড</option>
              <option value="৯ম গ্রেড">৯ম গ্রেড (১ম শ্রেণি)</option>
              <option value="১০ম গ্রেড">১০ম গ্রেড (২য় শ্রেণি)</option>
              <option value="১১তম - ১৬তম">১১তম - ১৬তম গ্রেড</option>
              <option value="১৭তম - ২০তম">১৭তম - ২০তম গ্রেড</option>
            </select>
          </div>

          {/* 3. District */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>কর্মস্থল / জেলা</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 cursor-pointer text-xs"
            >
              <option value="all">সকল জেলা</option>
              <option value="ঢাকা">ঢাকা</option>
              <option value="চট্টগ্রাম">চট্টগ্রাম</option>
              <option value="রাজশাহী">রাজশাহী</option>
              <option value="খুলনা">খুলনা</option>
              <option value="বরিশাল">বরিশাল</option>
              <option value="সিলেট">সিলেট</option>
              <option value="রংপুর">রংপুর</option>
              <option value="ময়মনসিংহ">ময়মনসিংহ</option>
              <option value="কুমিল্লা">কুমিল্লা</option>
              <option value="বগুড়া">বগুড়া</option>
              <option value="নোয়াখালী">নোয়াখালী</option>
              <option value="বাগেরহাট">বাগেরহাট</option>
              <option value="জামালপুর">জামালপুর</option>
              <option value="ঝিনাইদহ">ঝিনাইদহ</option>
              <option value="চুয়াডাঙ্গা">চুয়াডাঙ্গা</option>
              <option value="শেরপুর">শেরপুর</option>
              <option value="দিনাজপুর">দিনাজপুর</option>
            </select>
          </div>

          {/* 4. Salary */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Banknote className="w-3 h-3 text-emerald-600" />
              <span>বেতন পরিসীমা</span>
            </label>
            <select
              value={selectedSalary}
              onChange={(e) => setSelectedSalary(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 cursor-pointer text-xs"
            >
              <option value="all">সকল বেতন স্কেল</option>
              <option value="under_25k">২৫,০০০ টাকার নিচে</option>
              <option value="25k_50k">২৫,০০০ - ৫০,০০০ টাকা</option>
              <option value="above_35k">৩৫,০০০ টাকার উপরে</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar & One-Click Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
              <span className="font-bold text-slate-700">সক্রিয় ফিল্টার:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-[11px]">
                  ক্যাটাগরি: {
                    selectedCategory === 'govt' ? 'সরকারি চাকরি' :
                    selectedCategory === 'company' ? 'কোম্পানি ও স্বায়ত্তশাসিত' :
                    selectedCategory === 'defense' ? 'প্রতিরক্ষা ও পুলিশ' :
                    selectedCategory === 'bank' ? 'ব্যাংক ও আর্থিক' :
                    selectedCategory === 'health' ? 'স্বাস্থ্য ও চিকিৎসা' :
                    selectedCategory === 'engineer' ? 'প্রকৌশল' :
                    selectedCategory === 'teacher' ? 'শিক্ষক নিয়োগ' :
                    selectedCategory === 'railway' ? 'বাংলাদেশ রেলওয়ে' :
                    selectedCategory === 'ngo' ? 'এনজিও' : selectedCategory
                  }
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {selectedGrade !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-[11px]">
                  {selectedGrade}
                  <button onClick={() => setSelectedGrade('all')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {selectedDistrict !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-[11px]">
                  জেলা: {selectedDistrict}
                  <button onClick={() => setSelectedDistrict('all')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {selectedSalary !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-[11px]">
                  বেতন: {selectedSalary === 'under_25k' ? '<২৫k' : selectedSalary === '25k_50k' ? '২৫k-৫০k' : '>৩৫k'}
                  <button onClick={() => setSelectedSalary('all')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-[11px]">
                  অনুসন্ধান: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold transition-colors inline-flex items-center gap-1 cursor-pointer text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>সকল ফিল্টার রিসেট</span>
            </button>
          </div>
        )}
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
      ) : filterType === 'internship' ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-slate-900">বর্তমানে কোনো সক্রিয় পেইড ইন্টার্নশিপ নোটিশ নেই</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              বাংলাদেশ ব্যাংক, বাণিজ্যিক ব্যাংক, জাতিসংঘ ও বহুজাতিক কর্পোরেট প্রতিষ্ঠানগুলো সাধারণত বিশ্ববিদ্যালয় সেমিস্টার শেষে (জানুয়ারি-মার্চ এবং জুলাই-সেপ্টেম্বর) ইন্টার্নশিপ আহ্বান করে থাকে। নতুন সার্কুলার আসা মাত্রই এখানে হালনাগাদ করা হবে।
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/fresher-jobs"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              ফ্রেশার চাকরি দেখুন
            </Link>
            <Link
              href="/jobs/bachelor-degree"
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              স্নাতক পাসের সার্কুলার
            </Link>
          </div>
        </div>
      ) : filterType === 'part-time' ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-slate-900">বর্তমানে কোনো খণ্ডকালীন সার্কুলার সক্রিয় নেই</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              সরকারি ও স্বায়ত্তশাসিত সকল নিয়োগ মূলত স্থায়ী ও পূর্ণকালীন (Full-time) স্কেলের হয়ে থাকে। শিক্ষার্থীদের সুবিধাজনক শিফটের পার্ট-টাইম বা খণ্ডকালীন চাকরি আসা মাত্রই এখানে দেখতে পাবেন।
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/jobs/ssc-pass"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              এসএসসি পাস চাকরি
            </Link>
            <Link
              href="/jobs/hsc-pass"
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              এইচএসসি পাস চাকরি
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">কোনো চাকরি পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              আপনার নির্বাচিত ফিল্টার বা সার্চ কোয়েরির সাথে কোনো বিজ্ঞপ্তির মিল পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
            {index > 0 && pageNumber - pages[index - 1] > 1 && <span aria-hidden="true" className="text-slate-400">…</span>}
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

export default function JobListingView(props: JobListingViewProps) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-xs font-medium">চাকরির তালিকা প্রস্তুত হচ্ছে...</p>
      </div>
    }>
      <JobListingViewContent {...props} />
    </Suspense>
  );
}
