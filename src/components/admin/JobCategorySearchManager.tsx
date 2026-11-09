'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Tag,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Filter
} from 'lucide-react';
import { CategoryRecord } from '@/lib/taxonomy/types';
import { SearchAnalyticsSummary } from '@/lib/search/types';
import { ADMIN_REQ_HEADERS } from '@/lib/adminAuthClient';

export default function JobCategorySearchManager() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'job-mapping' | 'analytics' | 'diagnostics'>('dashboard');

  // Categories State
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Category Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryRecord> | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Category Deletion Modal State
  const [deletingCategory, setDeletingCategory] = useState<CategoryRecord | null>(null);
  const [reassignmentTarget, setReassignmentTarget] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Job Classification State
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [selectedJobCategory, setSelectedJobCategory] = useState('all');
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [bulkTargetCategory, setBulkTargetCategory] = useState('');
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // Search Analytics State
  const [analytics, setAnalytics] = useState<SearchAnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Diagnostics State
  const [testQuery, setTestQuery] = useState('সহকারী পরিচালক');
  const [testResults, setTestResults] = useState<any | null>(null);
  const [isTestingSearch, setIsTestingSearch] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    setCategoryError(null);
    try {
      const res = await fetch('/api/admin/categories', {
        headers: ADMIN_REQ_HEADERS
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } else {
        setCategoryError('ক্যাটাগরি লোড করা যায়নি');
      }
    } catch (err: any) {
      setCategoryError(err.message || 'সার্ভার সংযোগ সমস্যা');
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Fetch Jobs for Mapping
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs?limit=200');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setJobs(data.jobs || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  }, []);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/search/analytics', {
        headers: ADMIN_REQ_HEADERS
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.analytics);
        }
      }
    } catch (err) {
      console.error('Failed to fetch search analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchJobs();
    fetchAnalytics();
  }, [fetchCategories, fetchJobs, fetchAnalytics]);

  // Handle Save / Create Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsSavingCategory(true);
    setFormError(null);
    try {
      const isUpdate = !!editingCategory.id && categories.some((c) => c.id === editingCategory.id);
      const url = isUpdate
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify(editingCategory)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'অপ্রত্যাশিত ত্রুটি');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const sp = new URLSearchParams();
      if (reassignmentTarget) {
        sp.set('reassignTo', reassignmentTarget);
      }

      const res = await fetch(`/api/admin/categories/${deletingCategory.id}?${sp.toString()}`, {
        method: 'DELETE',
        headers: ADMIN_REQ_HEADERS
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'ক্যাটাগরি ডিলিট ব্যর্থ হয়েছে');
        return;
      }

      setDeletingCategory(null);
      setReassignmentTarget('');
      fetchCategories();
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'ডিলিট করতে সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Assign Jobs
  const handleBulkAssign = async () => {
    if (selectedJobIds.length === 0 || !bulkTargetCategory) return;
    setIsBulkAssigning(true);
    try {
      const res = await fetch('/api/admin/categories/bulk-assign', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          jobIds: selectedJobIds,
          targetCategoryId: bulkTargetCategory
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'বাল্ক অ্যাসাইন ব্যর্থ হয়েছে');
        return;
      }

      setSelectedJobIds([]);
      setBulkTargetCategory('');
      fetchJobs();
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'অ্যাসাইন করতে সমস্যা হয়েছে');
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // Test Search in Diagnostics
  const handleTestSearch = async () => {
    if (!testQuery.trim()) return;
    setIsTestingSearch(true);
    try {
      const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(testQuery)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setTestResults(data);
      }
    } catch (err) {
      console.error('Test search failed:', err);
    } finally {
      setIsTestingSearch(false);
    }
  };

  // Category KPIs
  const totalCategories = categories.length;
  const rootCategories = categories.filter((c) => !c.parent_id);
  const subcategories = categories.filter((c) => !!c.parent_id);
  const activeCategoriesCount = categories.filter((c) => c.is_active).length;
  const emptyCategories = categories.filter((c) => (c.job_count || 0) === 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Step 06: Taxonomy & Search
              </span>
              <span className="text-xs text-purple-300 font-bold bg-purple-900/60 px-2.5 py-1 rounded-full border border-purple-700/50">
                {totalCategories}টি ক্যাটাগরি কনফিগারড
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              চাকরির ক্যাটাগরি, ট্যাক্সোনমি ও স্মার্ট সার্চ কন্ট্রোল সেন্টার
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
              সেন্ট্রাল ট্যাক্সোনমি কনফিগারেশন, বহু-মাত্রিক জব ক্লাসিফিকেশন, সার্বজনীন বাংলা-ইংরেজি সার্চ ইঞ্জিন ও লাইভ অ্যানালিটিক্স ম্যানেজমেন্ট।
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditingCategory({
                  name_bn: '',
                  name_en: '',
                  slug: '',
                  description_bn: '',
                  description_en: '',
                  parent_id: null,
                  icon: 'Briefcase',
                  display_order: 10,
                  is_featured: false,
                  is_active: true
                });
                setIsModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন ক্যাটাগরি যোগ করুন</span>
            </button>
            <button
              onClick={fetchCategories}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingCategories ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-purple-800/40 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-900/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ড ও পরিসংখ্যান</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-900/50'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>ক্যাটাগরি ট্রি ও CRUD ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('job-mapping')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'job-mapping'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-900/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>জব ক্লাসিফিকেশন ও ম্যাপিং ({jobs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-900/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>সার্চ অ্যানালিটিক্স</span>
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-900/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>সার্চ ইঞ্জিন ডায়াগনস্টিকস</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">মোট ক্যাটাগরি (Taxonomy)</span>
              <div className="text-2xl font-black text-slate-900">{totalCategories}টি</div>
              <span className="text-xs text-purple-700 font-semibold">{rootCategories.length}টি প্রাইমারি, {subcategories.length}টি সাবক্যাটাগরি</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">সক্রিয় ক্যাটাগরি</span>
              <div className="text-2xl font-black text-emerald-600">{activeCategoriesCount}টি</div>
              <span className="text-xs text-slate-500 font-medium">পাবলিক পোর্টালে দৃশ্যমান</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">বিজ্ঞপ্তিযুক্ত ক্যাটাগরি</span>
              <div className="text-2xl font-black text-indigo-600">{categories.filter(c => (c.job_count || 0) > 0).length}টি</div>
              <span className="text-xs text-slate-500 font-medium">অন্তত ১টি সার্কুলার বিদ্যমান</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">শূন্য ক্যাটাগরি</span>
              <div className="text-2xl font-black text-amber-600">{emptyCategories.length}টি</div>
              <span className="text-xs text-amber-700 font-semibold">বিজ্ঞপ্তি বিহীন ক্যাটাগরি</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">শীর্ষ ক্যাটাগরিসমূহে বিজ্ঞপ্তির বিস্তৃতি</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rootCategories.slice(0, 9).map((cat) => (
                <div key={cat.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{cat.name_bn}</div>
                    <div className="text-[10px] text-slate-500">{cat.name_en}</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                    {cat.job_count || 0}টি
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY TREE & CRUD */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">ক্যাটাগরি ও সাবক্যাটাগরি ম্যানেজমেন্ট</h2>
              <p className="text-xs text-slate-500">ক্যাটাগরি ক্রিয়েট, এডিট, রিঅর্ডার ও নিরাপদ ডিলিট কন্ট্রোল।</p>
            </div>
            <button
              onClick={() => {
                setEditingCategory({
                  name_bn: '',
                  name_en: '',
                  slug: '',
                  description_bn: '',
                  description_en: '',
                  parent_id: null,
                  icon: 'Briefcase',
                  display_order: 10,
                  is_featured: false,
                  is_active: true
                });
                setIsModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন ক্যাটাগরি</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">নাম ও স্লাগ</th>
                  <th className="py-3 px-3">লেভেল</th>
                  <th className="py-3 px-3">বিজ্ঞপ্তি সংখ্যা</th>
                  <th className="py-3 px-3">স্ট্যাটাস</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => {
                  const isSub = !!cat.parent_id;
                  const parentCat = isSub ? categories.find((c) => c.id === cat.parent_id) : null;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {isSub && <span className="text-purple-400 font-bold ml-3">↳</span>}
                          <div>
                            <div className="font-bold text-slate-900">{cat.name_bn}</div>
                            <div className="text-[10px] text-slate-400 font-mono">/{cat.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isSub ? (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/50">
                            সাবক্যাটাগরি ({parentCat?.name_bn || 'Root'})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200/50">
                            প্রাইমারি
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{cat.job_count || 0}টি চাকরি</span>
                      </td>
                      <td className="py-3 px-3">
                        {cat.is_active ? (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            সক্রিয়
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            নিষ্ক্রিয়
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/categories/${cat.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                            title="পাবলিক ভিউ"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="এডিট"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: JOB CLASSIFICATION & MAPPING */}
      {activeTab === 'job-mapping' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">বিজ্ঞপ্তি ক্লাসিফিকেশন ও রি-অ্যাসাইনমেন্ট</h2>
              <p className="text-xs text-slate-500">চাকরিগুলোকে সঠিক ক্যাটাগরিতে অন্তর্ভুক্ত করুন বা বাল্ক ট্রান্সফার করুন।</p>
            </div>

            {selectedJobIds.length > 0 && (
              <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-xl border border-purple-200">
                <span className="text-xs font-bold text-purple-900">{selectedJobIds.length}টি নির্বাচিত</span>
                <select
                  value={bulkTargetCategory}
                  onChange={(e) => setBulkTargetCategory(e.target.value)}
                  className="text-xs bg-white border border-purple-300 rounded-lg px-2 py-1"
                >
                  <option value="">লক্ষ্য ক্যাটাগরি বেছে নিন...</option>
                  {rootCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_bn}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={!bulkTargetCategory || isBulkAssigning}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {isBulkAssigning ? 'স্থানান্তর হচ্ছে...' : 'স্থানান্তর করুন'}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <input
              type="text"
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              placeholder="শিরোনাম বা প্রতিষ্ঠান অনুসন্ধান..."
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-72"
            />
            <select
              value={selectedJobCategory}
              onChange={(e) => setSelectedJobCategory(e.target.value)}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-auto"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {rootCategories.map((c) => (
                <option key={c.id} value={c.id.replace('cat-', '')}>
                  {c.name_bn}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedJobIds.length === jobs.length && jobs.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedJobIds(jobs.map((j) => j.id));
                        else setSelectedJobIds([]);
                      }}
                    />
                  </th>
                  <th className="py-2.5 px-3">শিরোনাম ও প্রতিষ্ঠান</th>
                  <th className="py-2.5 px-3">বর্তমান ক্যাটাগরি</th>
                  <th className="py-2.5 px-3">শিক্ষাগত যোগ্যতা</th>
                  <th className="py-2.5 px-3">লোকেশন</th>
                  <th className="py-2.5 px-3 text-right">ভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs
                  .filter((j) => {
                    if (selectedJobCategory !== 'all' && (j.category || '').toLowerCase() !== selectedJobCategory.toLowerCase()) {
                      return false;
                    }
                    if (jobSearch.trim()) {
                      const q = jobSearch.toLowerCase();
                      return (j.title || '').toLowerCase().includes(q) || (j.organization || '').toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .slice(0, 50)
                  .map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={selectedJobIds.includes(job.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedJobIds([...selectedJobIds, job.id]);
                            else setSelectedJobIds(selectedJobIds.filter((id) => id !== job.id));
                          }}
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 line-clamp-1">{job.title}</div>
                        <div className="text-[10px] text-slate-500">{job.organization}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                          {job.categoryLabel || job.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-[11px] text-slate-600 line-clamp-1 max-w-xs">{job.minEducation || 'উল্লেখ নেই'}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-[11px] text-slate-600">{job.districts || 'সকল জেলা'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/jobs/${job.slug || job.id}`}
                          target="_blank"
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          দেখুন
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SEARCH ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">মোট অনুসন্ধান ইভেন্ট</span>
              <div className="text-2xl font-black text-slate-900">{analytics?.totalSearches || 0}টি</div>
              <span className="text-xs text-slate-500 font-medium">ব্যবহারকারীদের লাইভ কোয়েরি লগ</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">জনপ্রিয় সার্চ কোয়েরি</span>
              <div className="text-2xl font-black text-purple-600">{analytics?.popularQueries?.length || 0}টি</div>
              <span className="text-xs text-slate-500 font-medium">সর্বোচ্চ ফ্রিকোয়েন্সির শব্দাবলী</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">ফলাফলবিহীন সার্চ (Zero Result)</span>
              <div className="text-2xl font-black text-amber-600">{analytics?.zeroResultQueries?.length || 0}টি</div>
              <span className="text-xs text-amber-700 font-semibold">নতুন কি-ওয়ার্ড অ্যাড করার সুযোগ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>জনপ্রিয় সার্চ টার্মসমূহ</span>
              </h2>
              {analytics?.popularQueries && analytics.popularQueries.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {analytics.popularQueries.map((pq, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{pq.query}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                        {pq.count} বার
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center">এখনও কোনো সার্চ ইভেন্ট লগ হয়নি</div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>শূন্য ফলাফল পাওয়া কোয়েরিসমূহ</span>
              </h2>
              {analytics?.zeroResultQueries && analytics.zeroResultQueries.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {analytics.zeroResultQueries.map((zq, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{zq.query}</span>
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                        {zq.count} বার মিসিং
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center">কোনো শূন্য ফলাফল লগ নেই</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SEARCH DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">সার্চ ইঞ্জিন লাইভ টেস্ট ও রেলেভ্যান্স সিমুলেটর</h2>
          <p className="text-xs text-slate-500">
            যেকোনো বাংলা বা ইংরেজি কোয়েরি টাইপ করে অ্যালগরিদম কীভাবে ম্যাচিং ও রেলেভ্যান্স স্কোর নির্ধারণ করে তা সরাসরি পরীক্ষা করুন।
          </p>

          <div className="flex items-center gap-2 max-w-lg">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="টেস্ট সার্চ কোয়েরি..."
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full"
            />
            <button
              onClick={handleTestSearch}
              disabled={isTestingSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl whitespace-nowrap cursor-pointer"
            >
              {isTestingSearch ? 'অনুসন্ধান...' : 'টেস্ট করুন'}
            </button>
          </div>

          {testResults && (
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>মোট ফলাফল: {testResults.total}টি</span>
                <span>নর্মালাইজড কোয়েরি: "{testResults.queryNormalized}"</span>
              </div>

              <div className="space-y-2">
                {testResults.jobs?.map((j: any) => (
                  <div key={j.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{j.title}</div>
                    <div className="text-[10px] text-slate-500">{j.organization} • {j.categoryLabel || j.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT CATEGORY */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingCategory.id ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name_bn || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name_bn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ইংরেজি নাম *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name_en || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">স্লাগ (URL Slug) *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">প্যারেন্ট ক্যাটাগরি</label>
                  <select
                    value={editingCategory.parent_id || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, parent_id: e.target.value || null })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">কোনো প্যারেন্ট নেই (Root Category)</option>
                    {rootCategories
                      .filter((c) => c.id !== editingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_bn} ({c.name_en})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">বাংলা বিবরণ</label>
                <textarea
                  rows={2}
                  value={editingCategory.description_bn || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description_bn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ডিসপ্লে অর্ডার</label>
                  <input
                    type="number"
                    value={editingCategory.display_order ?? 0}
                    onChange={(e) => setEditingCategory({ ...editingCategory, display_order: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editingCategory.is_active ?? true}
                      onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                    />
                    <span>সক্রিয় (Active)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editingCategory.is_featured ?? false}
                      onChange={(e) => setEditingCategory({ ...editingCategory, is_featured: e.target.checked })}
                    />
                    <span>ফিচার্ড</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCategory ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SAFE DELETE CATEGORY */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-base font-bold text-slate-900">
                "{deletingCategory.name_bn}" মুছে ফেলতে চান?
              </h2>
              <p className="text-xs text-slate-500">
                এই ক্যাটাগরিতে বর্তমানে <strong>{deletingCategory.job_count || 0}টি</strong> চাকরি রয়েছে। মুছে ফেলার পূর্বে চাকরিগুলো অন্য ক্যাটাগরিতে স্থানান্তর আবশ্যক।
              </p>
            </div>

            {(deletingCategory.job_count || 0) > 0 && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">স্থানান্তরের লক্ষ্য ক্যাটাগরি *</label>
                <select
                  value={reassignmentTarget}
                  onChange={(e) => setReassignmentTarget(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">ক্যাটাগরি নির্বাচন করুন...</option>
                  {rootCategories
                    .filter((c) => c.id !== deletingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_bn}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={isDeleting || ((deletingCategory.job_count || 0) > 0 && !reassignmentTarget)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'ডিলিট হচ্ছে...' : 'নিশ্চিত ডিলিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
