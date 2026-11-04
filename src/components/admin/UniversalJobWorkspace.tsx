'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  Layers,
  GraduationCap,
  MapPin,
  ExternalLink,
  Eye,
  FileText,
  DollarSign,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { JobCircular, JobPosition } from '@/lib/types';
import JobLogo from '@/components/JobLogo';

export interface UniversalJobWorkspaceProps {
  job: JobCircular | null;
  isOpen: boolean;
  isNew?: boolean;
  onClose: () => void;
  onSaveSuccess: (savedJob: JobCircular) => void;
  onDelete?: (jobId: string, title: string) => void;
  onOpenContentStudio?: (jobId: string) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'govt', label: 'সরকারি চাকরি' },
  { value: 'bank', label: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান' },
  { value: 'railway', label: 'বাংলাদেশ রেলওয়ে' },
  { value: 'defense', label: 'প্রতিরক্ষা ও সেনাবাহিনী' },
  { value: 'teacher', label: 'শিক্ষক নিয়োগ ও প্রাথমিক' },
  { value: 'ngo', label: 'এনজিও ও উন্নয়ন সংস্থা' },
  { value: 'health', label: 'স্বাস্থ্য ও পরিবার পরিকল্পনা' },
  { value: 'engineer', label: 'ইঞ্জিনিয়ারিং ও টেকনিক্যাল' },
  { value: 'private', label: 'বেসরকারি প্রতিষ্ঠান' },
];

const GRADE_OPTIONS = [
  '১ম গ্রেড', '২য় গ্রেড', '৩য় গ্রেড', '৪র্থ গ্রেড', '৫ম গ্রেড',
  '৬ষ্ঠ গ্রেড', '৭ম গ্রেড', '৮ম গ্রেড', '৯ম গ্রেড', '১০ম গ্রেড',
  '১১তম গ্রেড', '১২তম গ্রেড', '১৩তম গ্রেড', '১৪তম গ্রেড', '১৫তম গ্রেড',
  '১৬তম গ্রেড', '১৭তম গ্রেড', '১৮তম গ্রেড', '১৯তম গ্রেড', '২০তম গ্রেড'
];

export default function UniversalJobWorkspace({
  job,
  isOpen,
  isNew = false,
  onClose,
  onSaveSuccess,
  onDelete
}: UniversalJobWorkspaceProps) {
  // Form State
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState('govt');
  const [grade, setGrade] = useState('১০ম গ্রেড');
  const [salary, setSalary] = useState('জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী');
  const [minEducation, setMinEducation] = useState('স্নাতক বা সমমানের ডিগ্রি');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(32);
  const [districts, setDistricts] = useState('সকল জেলার প্রার্থীরা আবেদন করতে পারবেন');
  const [deadline, setDeadline] = useState('');
  const [govtFee, setGovtFee] = useState(200);
  const [serviceFee, setServiceFee] = useState(50);
  const [officialLink, setOfficialLink] = useState('');
  const [circularPdfUrl, setCircularPdfUrl] = useState('');
  const [bengaliDescription, setBengaliDescription] = useState('');
  const [positions, setPositions] = useState<JobPosition[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or Reset form on job change or modal open
  useEffect(() => {
    if (isOpen) {
      if (job && !isNew) {
        setTitle(job.title || '');
        setOrganization(job.organization || '');
        setCategory(job.category || 'govt');
        setGrade(job.grade || '১০ম গ্রেড');
        setSalary(job.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী');
        setMinEducation(job.minEducation || 'স্নাতক বা সমমানের ডিগ্রি');
        setMinAge(job.minAge || 18);
        setMaxAge(job.maxAge || 32);
        setDistricts(job.districts || 'সকল জেলার প্রার্থীরা আবেদন করতে পারবেন');
        setDeadline(job.deadline || '');
        setGovtFee(job.govtFee ?? 200);
        setServiceFee(job.serviceFee ?? 50);
        setOfficialLink(job.officialLink || '');
        setCircularPdfUrl(job.circularPdfUrl || job.pdfUrl || '');
        setBengaliDescription(job.bengaliDescription || '');
        setPositions(Array.isArray(job.positions) && job.positions.length > 0 ? job.positions : [
          {
            title: job.title || 'প্রধান পদবি',
            grade: job.grade || '১০ম গ্রেড',
            posts: Number(job.totalPosts) || 1,
            salary: job.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
            minEducation: job.minEducation || 'স্নাতক বা সমমানের ডিগ্রি'
          }
        ]);
      } else {
        // Blank New Job
        setTitle('');
        setOrganization('');
        setCategory('govt');
        setGrade('১০ম গ্রেড');
        setSalary('জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী');
        setMinEducation('স্নাতক বা সমমানের ডিগ্রি');
        setMinAge(18);
        setMaxAge(32);
        setDistricts('সকল জেলার প্রার্থীরা আবেদন করতে পারবেন');
        setDeadline(new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setGovtFee(200);
        setServiceFee(50);
        setOfficialLink('');
        setCircularPdfUrl('');
        setBengaliDescription('');
        setPositions([
          {
            title: '',
            grade: '১০ম গ্রেড',
            posts: 1,
            salary: '১৬,০০০ - ৩৮,৬৪০ টাকা',
            minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক ডিগ্রি'
          }
        ]);
      }
      setFormError(null);
    }
  }, [isOpen, job, isNew]);

  // Calculate total posts automatically from positions list
  const totalPostsCount = useMemo(() => {
    if (positions.length === 0) return 1;
    return positions.reduce((sum, p) => sum + (Number(p.posts) || 0), 0) || 1;
  }, [positions]);

  // Add position handler
  const handleAddPosition = () => {
    setPositions(prev => [
      ...prev,
      {
        title: '',
        grade: '১১তম গ্রেড',
        posts: 1,
        salary: '১২,৫০০ - ৩০,২৩০ টাকা',
        minEducation: 'স্নাতক বা সমমান'
      }
    ]);
  };

  // Remove position handler
  const handleRemovePosition = (index: number) => {
    if (positions.length <= 1) {
      alert('কমপক্ষে একটি পদের বিবরণ থাকা আবশ্যক।');
      return;
    }
    setPositions(prev => prev.filter((_, i) => i !== index));
  };

  // Update specific position field
  const handleUpdatePosition = (index: number, field: keyof JobPosition, value: any) => {
    setPositions(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  // Save handler (Draft or Live Publish)
  const handleSave = async (publishImmediately: boolean) => {
    setFormError(null);

    // Basic Validation
    if (!title.trim()) {
      setFormError('সার্কুলারের শিরোনাম লিখুন।');
      return;
    }
    if (!organization.trim()) {
      setFormError('প্রতিষ্ঠানের নাম লিখুন।');
      return;
    }
    if (!deadline.trim()) {
      setFormError('আবেদনের শেষ তারিখ নির্ধারণ করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategoryObj = CATEGORY_OPTIONS.find(c => c.value === category);
      const categoryLabel = selectedCategoryObj?.label || 'সরকারি চাকরি';

      const payload: Partial<JobCircular> = {
        title: title.trim(),
        organization: organization.trim(),
        category: category as any,
        categoryLabel,
        grade: grade.trim() || '১০ম গ্রেড',
        totalPosts: totalPostsCount,
        salary: salary.trim() || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
        minEducation: minEducation.trim() || 'বিজ্ঞপ্তি অনুযায়ী',
        minAge: Number(minAge) || 18,
        maxAge: Number(maxAge) || 32,
        districts: districts.trim() || 'সকল জেলার প্রার্থীরা আবেদন করতে পারবেন',
        deadline: deadline.trim(),
        govtFee: Number(govtFee) || 200,
        serviceFee: Number(serviceFee) || 50,
        officialLink: officialLink.trim(),
        circularPdfUrl: circularPdfUrl.trim(),
        bengaliDescription: bengaliDescription.trim() || `${organization} নিয়োগ বিজ্ঞপ্তি ২০২৬।`,
        status: publishImmediately ? ('OPEN' as any) : ('DRAFT' as any),
        positions: positions.filter(p => p.title.trim().length > 0),
        daysRemaining: 20,
        featured: true,
        isHot: false,
        circularImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
        audioSummary: `${title} - ${organization}-এ নতুন নিয়োগ বিজ্ঞপ্তি।`
      };

      const url = (!isNew && job?.id) ? `/api/admin/jobs/${job.id}` : '/api/admin/jobs';
      const method = (!isNew && job?.id) ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && (data.success || data.job)) {
        const saved = data.job || { ...payload, id: job?.id || 'job-new' };
        onSaveSuccess(saved);
        onClose();
      } else {
        setFormError(data.error || 'সার্কুলার সংরক্ষণ করতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      setFormError(`সংরক্ষণ ব্যর্থ: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* 1. TOP HEADER BAR */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {isNew ? 'নতুন চাকরির সার্কুলার যোগ করুন' : 'সার্কুলার সম্পাদনা (Edit Job)'}
              </h2>
              <p className="text-xs text-slate-400">
                প্রয়োজনীয় তথ্য লিখুন এবং ডানপাশে লাইভ প্রিভিউ দেখে সরাসরি প্রকাশ করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              খসড়া (Draft) সেভ
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'সেভ হচ্ছে...' : (isNew ? 'সরাসরি লাইভ প্রকাশ' : 'আপডেট ও প্রকাশ')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1 cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 2. MAIN 2-COLUMN SPLIT: FORM (LEFT) & LIVE PREVIEW (RIGHT) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-slate-50">
          
          {/* LEFT COLUMN: THE CLEAN FORM (7 COLS) */}
          <div className="lg:col-span-7 p-6 space-y-6 bg-white overflow-y-auto">
            
            {/* SECTION 1: PRIMARY IDENTITY */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>১. প্রাথমিক পরিচিতি</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">সার্কুলারের শিরোনাম *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: বাংলাদেশ রেলওয়ে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 focus:bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">প্রতিষ্ঠানের নাম *</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="যেমন: বাংলাদেশ রেলওয়ে (BR)"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 focus:bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">চাকরির ক্যাটাগরি *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 focus:bg-white font-semibold text-slate-700"
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: POSITIONS & VACANCIES */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>২. পদ ও শূন্যপদের বিবরণ ({positions.length}টি পদবি, মোট {totalPostsCount}টি পদ)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddPosition}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ পদ যোগ করুন</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {positions.map((pos, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5 relative group">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-[11px] font-black text-slate-600">পদ #{idx + 1}</span>
                      {positions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePosition(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                          title="এই পদটি মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">পদের নাম *</label>
                        <input
                          type="text"
                          value={pos.title}
                          onChange={(e) => handleUpdatePosition(idx, 'title', e.target.value)}
                          placeholder="যেমন: সহকারী পরিচালক / অফিস সহকারী"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">শূন্যপদ সংখ্যা *</label>
                        <input
                          type="number"
                          min={1}
                          value={pos.posts || 1}
                          onChange={(e) => handleUpdatePosition(idx, 'posts', Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">গ্রেড</label>
                        <select
                          value={pos.grade || '১০ম গ্রেড'}
                          onChange={(e) => handleUpdatePosition(idx, 'grade', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-700"
                        >
                          {GRADE_OPTIONS.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">বেতন স্কেল</label>
                        <input
                          type="text"
                          value={pos.salary || ''}
                          onChange={(e) => handleUpdatePosition(idx, 'salary', e.target.value)}
                          placeholder="১৬,০০০ - ৩৮,৬৪০ টাকা"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">শিক্ষাগত যোগ্যতা</label>
                        <input
                          type="text"
                          value={pos.minEducation || ''}
                          onChange={(e) => handleUpdatePosition(idx, 'minEducation', e.target.value)}
                          placeholder="স্নাতক / এইচএসসি / সমমান"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: DEADLINE & FEES */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>৩. সময়সীমা ও ফি</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">আবেদনের শেষ তারিখ *</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="যেমন: ২৫ নভেম্বর ২০২৬ বা 2026-11-25"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 focus:bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">সরকারি ফি (টাকা) *</label>
                  <input
                    type="number"
                    min={0}
                    value={govtFee}
                    onChange={(e) => setGovtFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 focus:bg-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">সার্ভিস ফি (টাকা)</label>
                  <input
                    type="number"
                    min={0}
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 focus:bg-white font-bold text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: ELIGIBILITY & DISTRICTS */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>৪. বয়স ও জেলা শর্ত</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">বয়সসীমা (বছর)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(Number(e.target.value))}
                      placeholder="১৮"
                      className="w-20 px-3 py-2 text-xs rounded-xl border border-slate-300 text-center font-bold"
                    />
                    <span className="text-xs text-slate-500 font-bold">থেকে</span>
                    <input
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      placeholder="৩২"
                      className="w-20 px-3 py-2 text-xs rounded-xl border border-slate-300 text-center font-bold"
                    />
                    <span className="text-xs text-slate-500">বছর</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">প্রযোজ্য জেলা</label>
                  <input
                    type="text"
                    value={districts}
                    onChange={(e) => setDistricts(e.target.value)}
                    placeholder="সকল জেলার প্রার্থীরা আবেদন করতে পারবেন"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 focus:bg-white font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: OFFICIAL LINKS */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-emerald-700" />
                <span>৫. মূল নোটিশ ও আবেদন লিঙ্ক</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">মূল সার্কুলার PDF লিংক</label>
                  <input
                    type="text"
                    value={circularPdfUrl}
                    onChange={(e) => setCircularPdfUrl(e.target.value)}
                    placeholder="https://alljobs.teletalk.com.bd/...pdf"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">অনলাইন আবেদন ওয়েবসাইট লিংক</label>
                  <input
                    type="text"
                    value={officialLink}
                    onChange={(e) => setOfficialLink(e.target.value)}
                    placeholder="http://breb.teletalk.com.bd"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SMART LIVE PREVIEW (5 COLS) */}
          <div className="lg:col-span-5 p-6 bg-slate-100 flex flex-col justify-start space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>লাইভ প্রিভিউ কার্ড (চাকরিপ্রার্থীরা যেমন দেখবে)</span>
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                LIVE 2026
              </span>
            </div>

            {/* The Live Interactive Job Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-lg space-y-4 hover:shadow-xl transition-shadow">
              
              {/* Card Header */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 shadow-xs">
                  <Building2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {CATEGORY_OPTIONS.find(c => c.value === category)?.label || 'সরকারি চাকরি'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {positions[0]?.grade || grade || '১০ম গ্রেড'}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 mt-1 line-clamp-2">
                    {title.trim() || 'সার্কুলারের শিরোনাম এখানে প্রদর্শিত হবে'}
                  </h4>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {organization.trim() || 'প্রতিষ্ঠানের নাম'}
                  </p>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">মোট শূন্যপদ</span>
                  <span className="font-black text-indigo-700 text-sm">{totalPostsCount} টি পদ</span>
                  {positions.length > 1 && (
                    <span className="text-[10px] text-slate-500 block">+{positions.length}টি উপ-পদবি</span>
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">আবেদনের শেষ তারিখ</span>
                  <span className="font-black text-rose-600 text-xs truncate block">{deadline || 'নির্ধারিত হয়নি'}</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">সময় বাকি রয়েছে</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">পরীক্ষার ফি</span>
                  <span className="font-black text-slate-800 text-xs">৳{govtFee} + ৳{serviceFee}</span>
                  <span className="text-[9px] text-slate-400 block">সরকারি + চার্জ</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">বয়সসীমা</span>
                  <span className="font-black text-slate-800 text-xs">{minAge} - {maxAge} বছর</span>
                  <span className="text-[9px] text-slate-400 block">কাট-অফ তারিখ অনুযায়ী</span>
                </div>
              </div>

              {/* Sub-positions Preview Box */}
              {positions.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="font-bold text-[11px] text-slate-700 flex items-center justify-between">
                    <span>পদের বিবরণী ({positions.length}টি):</span>
                    <span className="text-[10px] text-emerald-700 font-bold">জাতীয় বেতন স্কেল ২০১৫</span>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {positions.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">
                          {p.title || `পদ #${i + 1}`}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                          <span className="bg-slate-100 px-1 rounded">{p.grade}</span>
                          <span className="font-bold text-indigo-700">{p.posts}টি</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Districts Preview */}
              <div className="text-[11px] text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900">জেলা শর্ত: </span>
                <span>{districts || 'সকল জেলার প্রার্থীরা আবেদন করতে পারবেন'}</span>
              </div>

              {/* Action Buttons in Card */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold text-center shadow-sm pointer-events-none"
                >
                  আবেদন করুন
                </button>
                {circularPdfUrl && (
                  <span className="py-2.5 px-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold text-center border border-slate-200 pointer-events-none flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </span>
                )}
              </div>
            </div>

            {/* Helper Tips */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">💡 পরামর্শ:</span>
              <p className="text-[11px] leading-relaxed">
                বামে তথ্য এডিট করার সাথে সাথে ডানের এই প্রিভিউটি অটো আপডেট হয়। চাকরিপ্রার্থীরা সাইটে এই ফরম্যাটেই আপনার সার্কুলারটি দেখতে পাবে।
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
