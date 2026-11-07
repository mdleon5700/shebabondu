'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  PenTool,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Save,
  RotateCcw,
  History,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  FileText,
  Sliders,
  Type,
  List,
  Table,
  HelpCircle,
  Send,
  RefreshCw,
  X,
  FileCheck2,
  Link2,
  ShieldCheck,
  Check,
  BookOpen
} from 'lucide-react';
import {
  ContentStudioState,
  ContentBlock,
  ContentBlockType,
  KeywordItem,
  ContentRevision
} from '@/lib/content_studio/types';
import { createNewBlock, blocksToMarkdown } from '@/lib/content_studio/blocks_converter';

const getAdminHeaders = (): HeadersInit => {
  const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
  return {
    'Content-Type': 'application/json',
    'x-admin-secret': pin
  };
};

export default function JobContentStudio({ initialDraftId }: { initialDraftId?: string }) {
  // State
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>(initialDraftId || '');
  const [studioState, setStudioState] = useState<ContentStudioState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveStatusText, setSaveStatusText] = useState<string>('সকল পরিবর্তন সংরক্ষিত');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'blocks' | 'keywords' | 'outline' | 'seo' | 'facts' | 'revisions'>('seo');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New Post Modal State
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostOrg, setNewPostOrg] = useState<string>('');
  const [newPostCategory, setNewPostCategory] = useState<string>('govt');
  const [newPostVacancies, setNewPostVacancies] = useState<string>('১');
  const [newPostDeadline, setNewPostDeadline] = useState<string>('২০২৬-১২-৩১');
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);

  // Load queue on mount
  useEffect(() => {
    fetchQueue();
  }, []);

  // When selectedDraftId changes, load its state
  useEffect(() => {
    if (selectedDraftId) {
      loadDraftStudioState(selectedDraftId);
    }
  }, [selectedDraftId]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/content-studio', { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.queue)) {
        setQueue(data.queue);
        if (!selectedDraftId && data.queue.length > 0) {
          setSelectedDraftId(data.queue[0].draftId);
        }
      }
    } catch (err) {
      console.error('Failed to load queue', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDraftStudioState = async (draftId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/content-studio/${draftId}`, { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success && data.state) {
        setStudioState(data.state);
        if (data.state.blocks?.length > 0) {
          setSelectedBlockId(data.state.blocks[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load studio state', err);
    } finally {
      setLoading(false);
    }
  };

  // Autosave or Manual Save
  const handleSaveState = async (createRev: boolean = false, summary?: string) => {
    if (!studioState || !selectedDraftId) return;
    try {
      setSaving(true);
      setSaveStatusText('সংরক্ষণ করা হচ্ছে...');
      const res = await fetch(`/api/admin/content-studio/${selectedDraftId}`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          ...studioState,
          createRevision: createRev,
          changeSummary: summary || 'ম্যানুয়াল সম্পাদনা'
        })
      });
      const data = await res.json();
      if (data.success && data.state) {
        setStudioState(data.state);
        setSaveStatusText('সকল পরিবর্তন সংরক্ষিত');
      }
    } catch (err) {
      setSaveStatusText('সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  };

  // Create New Circular Post
  const handleCreateNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostOrg.trim()) {
      alert('পদের নাম ও প্রতিষ্ঠানের নাম আবশ্যক।');
      return;
    }

    try {
      setIsCreatingPost(true);
      const res = await fetch('/api/admin/content-studio', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          title: newPostTitle.trim(),
          organization: newPostOrg.trim(),
          category: newPostCategory,
          vacancies: Number(newPostVacancies) || 1,
          deadline: newPostDeadline
        })
      });

      const data = await res.json();
      if (data.success && data.draftId) {
        setShowNewPostModal(false);
        setNewPostTitle('');
        setNewPostOrg('');
        await fetchQueue();
        setSelectedDraftId(data.draftId);
        if (data.state) {
          setStudioState(data.state);
        }
      } else {
        alert(data.error || 'নতুন পোস্ট তৈরি ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // AI Content Generation trigger
  const handleGenerateContent = async (action: 'generate_all' | 'regenerate_section' = 'generate_all', sectionId?: string) => {
    if (!selectedDraftId) return;
    try {
      setGenerating(true);
      setSaveStatusText('AI কন্টেন্ট তৈরি হচ্ছে...');
      const res = await fetch(`/api/admin/content-studio/${selectedDraftId}/generate`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action,
          sectionToRegenerate: sectionId,
          lengthPreset: 'standard'
        })
      });
      const data = await res.json();
      if (data.success && data.state) {
        setStudioState(data.state);
        setSaveStatusText('কন্টেন্ট সফলভাবে জেনারেট হয়েছে');
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      alert('জেনারেশন ব্যর্থ হয়েছে');
    } finally {
      setGenerating(false);
    }
  };

  // Full Validation trigger
  const handleValidateContent = async () => {
    if (!selectedDraftId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/content-studio/${selectedDraftId}/validate`, {
        method: 'POST',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setStudioState(prev => prev ? {
          ...prev,
          seoAnalysis: data.seoAnalysis,
          factValidation: data.factValidation,
          bengaliQuality: data.bengaliQuality,
          uniqueness: data.uniqueness
        } : null);
        setActiveTab('facts');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Approval & Publishing trigger
  const handleApproveAndPublish = async () => {
    if (!selectedDraftId) return;
    if (!confirm('আপনি কি নিশ্চিত যে এই সার্কুলারটির কন্টেন্ট ও এসইও তথ্য অনুমোদিত করে পাবলিক সাইটে প্রকাশ করতে চান?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/content-studio/${selectedDraftId}/approve`, {
        method: 'POST',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        alert('অভিনন্দন! সার্কুলারটি সফলভাবে অনুমোদিত এবং পাবলিক সাইটে প্রকাশিত হয়েছে।');
        setStudioState(data.state);
        fetchQueue();
      } else {
        alert(data.error || 'অনুমোদন ব্যর্থ হয়েছে');
      }
    } catch (err) {
      alert('সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  // Block Manipulation Handlers
  const handleAddBlock = (type: ContentBlockType) => {
    if (!studioState) return;
    const newBlock = createNewBlock(type, type === 'heading' ? 'নতুন শিরোনাম' : 'নতুন প্যারাগ্রাফের বিবরণ...');
    const updatedBlocks = [...(studioState.blocks || []), newBlock];
    const updatedMarkdown = blocksToMarkdown(updatedBlocks);

    setStudioState({
      ...studioState,
      blocks: updatedBlocks,
      article: studioState.article ? { ...studioState.article, bengaliMarkdown: updatedMarkdown } : undefined
    });
    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlockContent = (blockId: string, newContent: any) => {
    if (!studioState) return;
    const updatedBlocks = studioState.blocks.map(b => b.id === blockId ? { ...b, content: newContent } : b);
    const updatedMarkdown = blocksToMarkdown(updatedBlocks);

    setStudioState({
      ...studioState,
      blocks: updatedBlocks,
      article: studioState.article ? { ...studioState.article, bengaliMarkdown: updatedMarkdown } : undefined
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!studioState) return;
    const updatedBlocks = studioState.blocks.filter(b => b.id !== blockId);
    const updatedMarkdown = blocksToMarkdown(updatedBlocks);

    setStudioState({
      ...studioState,
      blocks: updatedBlocks,
      article: studioState.article ? { ...studioState.article, bengaliMarkdown: updatedMarkdown } : undefined
    });
    if (selectedBlockId === blockId) {
      setSelectedBlockId(updatedBlocks[0]?.id || null);
    }
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!studioState) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= studioState.blocks.length) return;

    const copy = [...studioState.blocks];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;
    const updatedMarkdown = blocksToMarkdown(copy);

    setStudioState({
      ...studioState,
      blocks: copy,
      article: studioState.article ? { ...studioState.article, bengaliMarkdown: updatedMarkdown } : undefined
    });
  };

  const selectedBlock = useMemo(() => {
    return studioState?.blocks?.find(b => b.id === selectedBlockId) || null;
  }, [studioState, selectedBlockId]);

  const filteredQueue = useMemo(() => {
    if (!searchTerm) return queue;
    return queue.filter(q =>
      (q.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.organization || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [queue, searchTerm]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-solaiman overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      
      {/* 1. TOP STUDIO CONTROL BAR */}
      <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Left: Draft Selector & Org Display */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">কন্টেন্ট ও এসইও স্টুডিও</span>
              <span className="bg-indigo-900/80 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-700/60">
                Step 04
              </span>
              {studioState?.isPublished && (
                <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-700/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> লাইভ প্রকাশিত
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-sm">
              {studioState?.brief?.organization ? `${studioState.brief.organization} — ${studioState.brief.jobTitle}` : 'সার্কুলার সিলেক্ট করুন'}
            </p>
          </div>
        </div>

        {/* Center: Responsive Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${viewport === 'desktop' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            title="ডেস্কটপ ভিউ"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${viewport === 'tablet' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            title="ট্যাবলেট ভিউ"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${viewport === 'mobile' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            title="মোবাইল ভিউ"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions (Autosave indicator, Revisions, AI Generate, Publish) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden lg:inline flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            {saveStatusText}
          </span>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700"
            title="রিভিশন হিস্ট্রি"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">ভার্সন ({studioState?.revisions?.length || 0})</span>
          </button>

          <button
            onClick={() => handleGenerateContent('generate_all')}
            disabled={generating}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'তৈরি হচ্ছে...' : 'AI জেনারেট'}</span>
          </button>

          <button
            onClick={() => handleSaveState(true, 'ম্যানুয়াল সংরক্ষণ')}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">সেভ</span>
          </button>

          <button
            onClick={handleApproveAndPublish}
            disabled={studioState?.isPublished || loading}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{studioState?.isPublished ? 'অনুমোদিত' : 'অনুমোদন ও প্রকাশ'}</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-PANEL ELEMENTOR-STYLE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ============================================================== */}
        {/* LEFT PANEL: Circular Queue & Element Library                    */}
        {/* ============================================================== */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          
          {/* Top Tab Switcher: Queue vs Element Library */}
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>পোস্ট তালিকা</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                  {queue.length}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowNewPostModal(true)}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="নতুন চাকরির পোস্ট বা সার্কুলার লিখুন"
              >
                <Plus className="w-3 h-3" />
                <span>+ নতুন পোস্ট</span>
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
            {filteredQueue.map(item => {
              const isSelected = item.draftId === selectedDraftId;
              return (
                <button
                  key={item.draftId}
                  onClick={() => setSelectedDraftId(item.draftId)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-[11px] text-slate-900 truncate">
                      {item.organization}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold bg-slate-100 text-slate-600">
                      {item.seoScore}% SEO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mb-1.5">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.deadline}</span>
                    <span className={`px-1 rounded font-bold text-[9px] ${item.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {item.isPublished ? 'Published' : item.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom: Element Library (Quick Add Block) */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/80">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>এলিমেন্ট লাইব্রেরি (Add Block)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => handleAddBlock('heading')}
                className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">হেডিং</span>
              </button>
              <button
                onClick={() => handleAddBlock('paragraph')}
                className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">প্যারাগ্রাফ</span>
              </button>
              <button
                onClick={() => handleAddBlock('job_info_table')}
                className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Table className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">তথ্য টেবিল</span>
              </button>
              <button
                onClick={() => handleAddBlock('faq_accordion')}
                className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">FAQ অ্যাকর্ডিয়ন</span>
              </button>
              <button
                onClick={() => handleAddBlock('apply_button')}
                className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">আবেদন বাটন</span>
              </button>
              <button
                onClick={() => handleAddBlock('notice_box')}
                className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">নোটিশ বক্স</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CENTER PANEL: Live Canvas & Visual Preview                     */}
        {/* ============================================================== */}
        <div className="flex-1 bg-slate-100 flex flex-col items-center overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          
          {/* Responsive Preview Wrapper */}
          <div
            className={`bg-white rounded-2xl border border-slate-300 shadow-md min-h-full transition-all duration-300 flex flex-col ${
              viewport === 'desktop'
                ? 'w-full max-w-4xl p-6 sm:p-10'
                : viewport === 'tablet'
                ? 'w-[768px] p-6'
                : 'w-[375px] p-4'
            }`}
          >
            {/* Visual Header Badge */}
            <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                লাইভ আর্টিকেল ক্যানভাস (পাবলিক পেজ প্রিভিউ)
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                /jobs/{studioState?.seo?.slug || 'preview'}
              </span>
            </div>

            {/* Editable Content Blocks */}
            <div className="space-y-4 flex-1">
              {studioState?.blocks?.map((block, idx) => {
                const isSelected = block.id === selectedBlockId;
                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative group rounded-xl transition-all border ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/15 ring-2 ring-indigo-500/20 p-3'
                        : 'border-transparent hover:border-slate-300 p-2'
                    }`}
                  >
                    {/* Action Bar on Hover/Select */}
                    {isSelected && (
                      <div className="absolute -top-3 right-3 flex items-center gap-1 bg-slate-900 text-white rounded-lg px-2 py-0.5 text-[10px] shadow-sm z-10 font-sans">
                        <span className="font-mono uppercase text-indigo-300 mr-1">{block.type}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveBlock(idx, 'up'); }}
                          className="p-1 hover:text-indigo-400"
                          title="উপরে নিন"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveBlock(idx, 'down'); }}
                          className="p-1 hover:text-indigo-400"
                          title="নিচে নিন"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                          className="p-1 hover:text-rose-400"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Block Renderers */}
                    {block.type === 'heading' && (
                      <div>
                        {block.settings?.headingLevel === 'h1' ? (
                          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                            {block.content}
                          </h1>
                        ) : block.settings?.headingLevel === 'h3' ? (
                          <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">
                            {block.content}
                          </h3>
                        ) : (
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-100 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-emerald-600" />
                            {block.content}
                          </h2>
                        )}
                      </div>
                    )}

                    {block.type === 'paragraph' && (
                      <p className="text-[15px] sm:text-[16px] text-slate-700 leading-relaxed">
                        {block.content}
                      </p>
                    )}

                    {block.type === 'job_info_table' && Array.isArray(block.content) && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 my-3">
                        <table className="w-full text-xs sm:text-sm text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                            <tr>
                              <th className="py-2.5 px-3 font-bold">বিবরণ</th>
                              <th className="py-2.5 px-3 font-bold">নির্ধারিত তথ্য</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {block.content.map((row: any, rIdx: number) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="py-2 px-3 font-bold text-slate-800 w-1/3">{row.label}</td>
                                <td className="py-2 px-3 text-slate-700">{row.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {block.type === 'numbered_list' && Array.isArray(block.content) && (
                      <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 my-2">
                        {block.content.map((item: string, iIdx: number) => (
                          <li key={iIdx} className="leading-relaxed">{item}</li>
                        ))}
                      </ol>
                    )}

                    {block.type === 'bullet_list' && Array.isArray(block.content) && (
                      <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700 my-2">
                        {block.content.map((item: string, iIdx: number) => (
                          <li key={iIdx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    )}

                    {block.type === 'notice_box' && (
                      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed my-3 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>{block.content}</div>
                      </div>
                    )}

                    {block.type === 'apply_button' && (
                      <div className="text-center my-4">
                        <a
                          href={block.content?.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                          <span>{block.content?.label || 'অনলাইনে আবেদন করুন'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {block.type === 'faq_accordion' && Array.isArray(block.content) && (
                      <div className="space-y-2 my-3">
                        {block.content.map((faq: any, fIdx: number) => (
                          <div key={fIdx} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                            <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                              <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{faq.question}</span>
                            </div>
                            <div className="text-xs sm:text-sm text-slate-600 mt-1 pl-5">
                              {faq.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL: Tabbed Settings, SEO, Facts & Quality Controls    */}
        {/* ============================================================== */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0">
          
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 p-1.5 gap-1 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('seo')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                activeTab === 'seo' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              এসইও ও মেটা
            </button>
            <button
              onClick={() => setActiveTab('facts')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                activeTab === 'facts' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ফ্যাক্ট চেক
            </button>
            <button
              onClick={() => setActiveTab('keywords')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                activeTab === 'keywords' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              কিওয়ার্ড
            </button>
            <button
              onClick={() => setActiveTab('blocks')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                activeTab === 'blocks' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ব্লক
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            
            {/* TAB: SEO & METADATA */}
            {activeTab === 'seo' && (
              <div className="space-y-4 text-xs">
                {/* SEO Score Gauge Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">এসইও অপটিমাইজেশন স্কোর</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      {studioState?.seoAnalysis?.score || 50}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${studioState?.seoAnalysis?.score || 50}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 font-mono">
                    <div>শব্দ: {studioState?.seoAnalysis?.wordCount || 0}</div>
                    <div>কিওয়ার্ড: {studioState?.seoAnalysis?.primaryKeywordCount || 0} বার</div>
                    <div>পড়ার সময়: {studioState?.seoAnalysis?.readingTimeMinutes || 1} মি.</div>
                  </div>
                </div>

                {/* SEO Title Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">এসইও মেটা টাইটেল (Title Tag)</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(studioState?.seo?.seoTitle || '').length}/65 অক্ষর
                    </span>
                  </div>
                  <input
                    type="text"
                    value={studioState?.seo?.seoTitle || ''}
                    onChange={(e) => setStudioState(prev => prev ? {
                      ...prev,
                      seo: { ...prev.seo, seoTitle: e.target.value }
                    } : null)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                {/* Meta Description Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">মেটা ডেসক্রিপশন (Snippet)</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(studioState?.seo?.seoDescription || '').length}/160 অক্ষর
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={studioState?.seo?.seoDescription || ''}
                    onChange={(e) => setStudioState(prev => prev ? {
                      ...prev,
                      seo: { ...prev.seo, seoDescription: e.target.value }
                    } : null)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                {/* Slug Input */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL পারমালিংক (Slug)</label>
                  <input
                    type="text"
                    value={studioState?.seo?.slug || ''}
                    onChange={(e) => setStudioState(prev => prev ? {
                      ...prev,
                      seo: { ...prev.seo, slug: e.target.value }
                    } : null)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                {/* Explainable Checklist */}
                <div className="border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-800 block mb-2">এসইও অডিট চেকলিস্ট</span>
                  <div className="space-y-2">
                    {studioState?.seoAnalysis?.checklist?.map(item => (
                      <div key={item.id} className="p-2 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-2 text-[11px]">
                        {item.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className={item.passed ? 'font-medium text-slate-800' : 'font-bold text-rose-800'}>
                            {item.label}
                          </div>
                          {!item.passed && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.recommendation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FACT CHECK & QUALITY */}
            {activeTab === 'facts' && (
              <div className="space-y-4 text-xs">
                <button
                  onClick={handleValidateContent}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>পুনরায় পূর্ণাঙ্গ ফ্যাক্ট ও কোয়ালিটি চেক করুন</span>
                </button>

                {/* Factual Integrity Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">তথ্যগত সত্যতা (Fact Check)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      studioState?.factValidation?.canProceedToApproval
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {studioState?.factValidation?.status || 'VERIFIED'}
                    </span>
                  </div>

                  {studioState?.factValidation?.conflictingClaims && studioState.factValidation.conflictingClaims.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 mb-2">
                      <div className="font-bold flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>সাংঘর্ষিক তথ্য শনাক্ত:</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {studioState.factValidation.conflictingClaims.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {studioState?.factValidation?.unsupportedClaims && studioState.factValidation.unsupportedClaims.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 mb-2">
                      <div className="font-bold flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>অননুমোদিত বা মনগড়া তথ্য:</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {studioState.factValidation.unsupportedClaims.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-600 mt-2">
                    {studioState?.factValidation?.canProceedToApproval
                      ? '✓ সকল পদসংখ্যা, বেতন ও শেষ তারিখ সার্কুলারের সাথে নিখুঁতভাবে মিলেছে।'
                      : '⚠ প্রকাশনার পূর্বে সাংঘর্ষিক তথ্য সংশোধন করা আবশ্যক।'}
                  </div>
                </div>

                {/* Bengali Quality & Readability Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">বাংলা ভাষা ও পাঠযোগ্যতা</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {studioState?.bengaliQuality?.overallScore || 90}/100
                    </span>
                  </div>
                  {studioState?.bengaliQuality?.issues && studioState.bengaliQuality.issues.length > 0 ? (
                    <div className="space-y-1.5 mt-2">
                      {studioState.bengaliQuality.issues.map((iss, i) => (
                        <div key={i} className="p-2 rounded bg-white border border-slate-200 text-[11px]">
                          <span className="font-bold text-slate-800">{iss.type}:</span> {iss.suggestion}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-700 mt-1">
                      ✓ কোনো ব্যাকরণগত ত্রুটি বা অপ্রয়োজনীয় ইংরেজি কিওয়ার্ড স্টাফিং নেই।
                    </p>
                  )}
                </div>

                {/* Internal Duplicate / Uniqueness Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">অভ্যন্তরীণ সাদৃশ্য (Uniqueness)</span>
                    <span className="font-mono text-slate-700">
                      {studioState?.uniqueness?.internalSimilarityScore || 0}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    আগের চাকরি তালিকার সাথে টোকেন সাদৃশ্য তুলনা (সতর্কতা: এটি অভ্যন্তরীণ সাদৃশ্য নির্দেশক)।
                  </p>
                </div>
              </div>
            )}

            {/* TAB: KEYWORDS */}
            {activeTab === 'keywords' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">প্রাথমিক ফোকাস কিওয়ার্ড</label>
                  <input
                    type="text"
                    value={studioState?.seo?.focusKeyword || ''}
                    onChange={(e) => setStudioState(prev => prev ? {
                      ...prev,
                      seo: { ...prev.seo, focusKeyword: e.target.value }
                    } : null)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">সার্চ ইন্টেন্ট (Search Intent)</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px]">
                    <span className="font-bold text-indigo-700 uppercase font-mono">
                      {studioState?.brief?.searchIntent || 'informational'}
                    </span>
                    <p className="mt-1">{studioState?.brief?.searchIntentSummary}</p>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">দ্বিতীয় পর্যায়ের কিওয়ার্ডসমূহ</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {studioState?.seo?.secondaryKeywords?.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 text-[11px] font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BLOCK SETTINGS */}
            {activeTab === 'blocks' && (
              <div className="space-y-4 text-xs">
                {selectedBlock ? (
                  <>
                    <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-900">
                      <span className="font-bold text-[11px]">সিলেক্টেড ব্লক:</span>
                      <span className="font-mono ml-1 font-bold">{selectedBlock.type}</span>
                    </div>

                    {selectedBlock.type === 'heading' && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">হেডিং লেভেল</label>
                        <select
                          value={selectedBlock.settings?.headingLevel || 'h2'}
                          onChange={(e) => {
                            if (!studioState) return;
                            const updated = studioState.blocks.map(b => b.id === selectedBlock.id ? {
                              ...b,
                              settings: { ...b.settings, headingLevel: e.target.value as any }
                            } : b);
                            setStudioState({ ...studioState, blocks: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200"
                        >
                          <option value="h1">H1 (মূল শিরোনাম - একটাই প্রযোজ্য)</option>
                          <option value="h2">H2 (প্রধান বিভাগ)</option>
                          <option value="h3">H3 (উপ-বিভাগ)</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">ব্লক কন্টেন্ট সম্পাদনা</label>
                      <textarea
                        rows={6}
                        value={typeof selectedBlock.content === 'string' ? selectedBlock.content : JSON.stringify(selectedBlock.content, null, 2)}
                        onChange={(e) => handleUpdateBlockContent(selectedBlock.id, e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 font-sans text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteBlock(selectedBlock.id)}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ব্লকটি মুছে ফেলুন</span>
                    </button>
                  </>
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    ক্যানভাস থেকে কোনো ব্লক সিলেক্ট করুন।
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. REVISION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">রিভিশন ও ভার্সন হিস্ট্রি</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {studioState?.revisions && studioState.revisions.length > 0 ? (
                studioState.revisions.map(rev => {
                  const isCurrent = rev.id === studioState.currentRevisionId;
                  return (
                    <div key={rev.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-black text-indigo-700 font-mono">#{rev.versionNumber}</span>
                          <span className="font-bold text-slate-800">{rev.changeSummary}</span>
                          {isCurrent && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              সক্রিয় ভার্সন
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(rev.timestamp).toLocaleString('bn-BD')} • {rev.author}
                        </div>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={async () => {
                            if (!confirm(`আপনি কি ভার্সন #${rev.versionNumber}-এ ফেরত যেতে চান?`)) return;
                            try {
                              const res = await fetch(`/api/admin/content-studio/${selectedDraftId}/revisions`, {
                                method: 'POST',
                                headers: getAdminHeaders(),
                                body: JSON.stringify({ revisionId: rev.id })
                              });
                              const data = await res.json();
                              if (data.success && data.state) {
                                setStudioState(data.state);
                                setShowHistoryModal(false);
                                alert(data.message);
                              }
                            } catch (e) {
                              alert('পুনরুদ্ধার ব্যর্থ হয়েছে');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 shrink-0"
                        >
                          পুনরুদ্ধার
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-400 py-6">কোনো পূর্ববর্তী রিভিশন পাওয়া যায়নি।</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL: CREATE NEW POST (WORDPRESS / ELEMENTOR STYLE) */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-violet-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-300" />
                <h3 className="font-black text-sm">নতুন সার্কুলার পোস্ট তৈরি (এলিমেন্টর স্টুডিও)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPostModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  required
                  value={newPostOrg}
                  onChange={(e) => setNewPostOrg(e.target.value)}
                  placeholder="যেমন: বাংলাদেশ ব্যাংক অথবা শিক্ষা মন্ত্রণালয়"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পদের নাম ও বিবরণ *</label>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="যেমন: সহকারী পরিচালক (জেনারেল)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="govt">সরকারি চাকরি</option>
                    <option value="bank">ব্যাংক ও আর্থিক</option>
                    <option value="private">বেসরকারি / কোম্পানি</option>
                    <option value="ngo">এনজিও (NGO)</option>
                    <option value="education">শিক্ষক নিয়োগ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মোট শূন্যপদ</label>
                  <input
                    type="number"
                    min="1"
                    value={newPostVacancies}
                    onChange={(e) => setNewPostVacancies(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আবেদনের শেষ তারিখ</label>
                <input
                  type="text"
                  value={newPostDeadline}
                  onChange={(e) => setNewPostDeadline(e.target.value)}
                  placeholder="যেমন: ২০২৬-১২-৩১"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPost}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingPost ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>পোস্ট তৈরি ও এডিটর খুলুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
