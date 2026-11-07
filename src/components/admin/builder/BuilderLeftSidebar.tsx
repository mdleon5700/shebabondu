'use client';

import React, { useState } from 'react';
import {
  Layers,
  LayoutGrid,
  FileText,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Briefcase,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
  Award,
  Users,
  Megaphone,
  Upload,
  RefreshCw
} from 'lucide-react';
import { PageRecord, PageSection, SectionType } from '@/lib/types';
import { PRESET_PAGE_TEMPLATES } from './templates/presetTemplates';
import { BlockItem } from './BuilderTypes';

interface BuilderLeftSidebarProps {
  currentPage: PageRecord;
  activeSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onAddSection: (type: SectionType, customData?: Partial<PageSection>) => void;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onDuplicateSection: (index: number) => void;
  onDeleteSection: (index: number) => void;
  onToggleSectionVisibility: (id: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onOpenChromeSettings: () => void;
  onSelectMediaImage?: (url: string) => void;
}

export default function BuilderLeftSidebar({
  currentPage,
  activeSectionId,
  onSelectSection,
  onAddSection,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onToggleSectionVisibility,
  onApplyTemplate,
  onOpenChromeSettings,
  onSelectMediaImage
}: BuilderLeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<'elements' | 'sections' | 'templates' | 'layers' | 'globals' | 'media'>('elements');
  const [templateConfirmId, setTemplateConfirmId] = useState<string | null>(null);
  const [globalWarningDismissed, setGlobalWarningDismissed] = useState(false);
  const [mediaItems, setMediaItems] = useState<{ id: string; url: string; title: string; altText?: string }[]>([
    { id: 'm1', url: '/images/hero-govt-job.jpg', title: 'সরকারি চাকরির ব্যানার' },
    { id: 'm2', url: '/images/petrobangla-logo.png', title: 'পেট্রোবাংলা লোগো' },
    { id: 'm3', url: '/images/bpsc-logo.png', title: 'বিপিএসসি লোগো' },
    { id: 'm4', url: '/images/bank-jobs.jpg', title: 'ব্যাংক জব ব্যানার' }
  ]);
  const [mediaSearch, setMediaSearch] = useState('');

  // 1. Basic & Layout Elements Catalog
  const BASIC_BLOCKS: BlockItem[] = [
    {
      id: 'blk-hero',
      name: 'হিরো ব্যানার (Hero)',
      category: 'basic',
      icon: Megaphone,
      type: 'hero',
      description: 'প্রধান আকর্ষণীয় হেডিং, সাবটাইটেল ও বাটন',
      defaultData: () => ({
        title: 'নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬',
        subtitle: 'সরকারি ও ব্যাংক চাকরির নির্ভরযোগ্য আবেদন সহায়তা',
        content: { badge: 'নতুন নোটিশ', ctaText: 'আবেদন করুন', ctaUrl: '/jobs' }
      })
    },
    {
      id: 'blk-jobs',
      name: 'চাকরি সার্কুলার ফিড (Jobs)',
      category: 'dynamic',
      icon: Briefcase,
      type: 'jobs',
      description: 'ডাটাবেস থেকে স্বয়ংক্রিয় লাইভ সার্কুলার গ্রিড',
      defaultData: () => ({
        title: 'চলমান গুরুত্বপূর্ণ সরকারি চাকরি',
        subtitle: 'আবেদনের শেষ তারিখ অনুযায়ী বাছাইকৃত সার্কুলার',
        content: { limit: 6, category: 'all' }
      })
    },
    {
      id: 'blk-features',
      name: 'ফিচার গ্রিড (Features)',
      category: 'layout',
      icon: LayoutGrid,
      type: 'features',
      description: 'সুবিধাসমূহ ৩ বা ৪ কলামের কার্ড আকারে প্রদর্শন',
      defaultData: () => ({
        title: 'আমাদের বিশেষ সুবিধাসমূহ',
        content: {
          items: [
            { title: '১০০% নির্ভুল তথ্য', desc: 'অফিশিয়াল গেজেট থেকে সরাসরি সংগৃহীত' },
            { title: 'দ্রুত প্রসেসিং', desc: 'টেলিটক এসএমএস ও প্রবেশপত্র সেবা' },
            { title: 'নিরাপদ ডকুমেন্ট', desc: 'এনক্রিপ্টেড ডিজিটাল ডকুমেন্ট ভল্ট' }
          ]
        }
      })
    },
    {
      id: 'blk-how-it-works',
      name: 'কাজের ধাপ (Workflow)',
      category: 'layout',
      icon: Award,
      type: 'how-it-works',
      description: '১, ২, ৩ ধাপে কাজের নির্দেশনা',
      defaultData: () => ({
        title: 'কীভাবে নির্ভুল আবেদন করবেন?',
        content: {
          items: [
            { step: '০১', title: 'সার্কুলার পছন্দ করুন', desc: 'যোগ্যতা অনুযায়ী পদ বাছুন' },
            { step: '০২', title: 'তথ্য দিন', desc: 'সঠিক নিয়মে ফর্ম পূরণ করুন' },
            { step: '০৩', title: 'কপি সংগ্রহ করুন', desc: 'কনফার্মেশন ও ট্র্যাকিং পান' }
          ]
        }
      })
    },
    {
      id: 'blk-stats',
      name: 'পরিসংখ্যান কাউন্টার (Stats)',
      category: 'layout',
      icon: Sparkles,
      type: 'stats',
      description: 'মোট চাকরি, প্রার্থী সংখ্যা ও সাফল্যের কাউন্টার',
      defaultData: () => ({
        title: 'প্ল্যাটফর্ম পরিসংখ্যান',
        content: {
          items: [
            { value: '৭৫+', label: 'চলমান সার্কুলার' },
            { value: '৪৮,৯০০+', label: 'সফল আবেদনকারী' },
            { value: '১০০%', label: 'সঠিকতার নিশ্চয়তা' }
          ]
        }
      })
    },
    {
      id: 'blk-faq',
      name: 'সাধারণ জিজ্ঞাসা (FAQ)',
      category: 'basic',
      icon: HelpCircle,
      type: 'faq',
      description: 'প্রশ্ন ও উত্তরের একর্ডিয়ন',
      defaultData: () => ({
        title: 'সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)',
        content: {
          items: [
            { question: 'আবেদন করতে কী কী ডকুমেন্ট লাগবে?', answer: 'ছবি, স্বাক্ষর, জাতীয় পরিচয়পত্র ও শিক্ষাগত যোগ্যতার সনদ।' },
            { question: 'টেলিটক ফি কীভাবে দেব?', answer: 'বিকাশ, নগদ বা সরাসরি টেলিটক প্রিপেইড সিম দিয়ে।' }
          ]
        }
      })
    },
    {
      id: 'blk-cta',
      name: 'কল টু অ্যাকশন (CTA)',
      category: 'basic',
      icon: Megaphone,
      type: 'cta',
      description: 'আবেদন বা রেজিস্ট্রেশনের জন্য বড় বাটন সেকশন',
      defaultData: () => ({
        title: 'আজই আপনার পছন্দের চাকরিতে আবেদন করুন',
        subtitle: 'আর কোনো সার্কুলারের ডেডলাইন মিস করবেন না',
        content: { buttonLabel: 'এখনই শুরু করুন', buttonUrl: '/jobs' }
      })
    },
    {
      id: 'blk-text',
      name: 'বডি প্যারাগ্রাফ (Text)',
      category: 'basic',
      icon: FileText,
      type: 'text',
      description: 'সাধারণ বিস্তারিত টেক্সট বা সম্পাদকীয় কলাম',
      defaultData: () => ({
        title: 'বিজ্ঞপ্তি সংক্রান্ত নির্দেশনা',
        content: { text: 'এখানে আপনার প্রয়োজনীয় পূর্ণাঙ্গ নির্দেশনা ও বিস্তারিত তথ্য লিখুন...' }
      })
    },
    {
      id: 'blk-banner-image',
      name: 'ব্যানার ইমেজ ও মিডিয়া',
      category: 'basic',
      icon: ImageIcon,
      type: 'banner-image',
      description: 'ফুল উইথ ইমেজ ব্যানার বা এডভার্টাইজমেন্ট স্লট',
      defaultData: () => ({
        title: 'বিশেষ নোটিশ ব্যানার',
        content: { imageUrl: '/images/hero-govt-job.jpg', altText: 'চাকরি সার্কুলার ব্যানার' }
      })
    }
  ];

  return (
    <div className="w-80 bg-white border-r border-slate-200/90 flex flex-col h-full font-solaiman flex-shrink-0 shadow-xs">
      {/* Top 6 Mode Navigation Tabs */}
      <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50/70 p-1 text-center text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('elements')}
          className={`py-2 px-1 rounded-lg transition-colors flex flex-col items-center gap-1 ${
            activeTab === 'elements' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="এলিমেন্টস ও ব্লক"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="truncate scale-90">উপাদান</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`py-2 px-1 rounded-lg transition-colors flex flex-col items-center gap-1 ${
            activeTab === 'sections' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="তৈরি সেকশনসমূহ"
        >
          <Sliders className="w-4 h-4" />
          <span className="truncate scale-90">সেকশন</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`py-2 px-1 rounded-lg transition-colors flex flex-col items-center gap-1 ${
            activeTab === 'templates' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="ফুল পেজ টেমপ্লেট"
        >
          <FileText className="w-4 h-4" />
          <span className="truncate scale-90">টেমপ্লেট</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`py-2 px-1 rounded-lg transition-colors flex flex-col items-center gap-1 ${
            activeTab === 'layers' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="পেজ লেয়ার্স ও অর্ডার"
        >
          <Layers className="w-4 h-4" />
          <span className="truncate scale-90">লেয়ার্স</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('globals')}
          className={`py-2 px-1 rounded-lg transition-colors flex flex-col items-center gap-1 ${
            activeTab === 'globals' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="গ্লোবাল উপাদান"
        >
          <Shield className="w-4 h-4" />
          <span className="truncate scale-90">গ্লোবাল</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`py-2 px-1 rounded-lg transition-colors flex flex-col items-center gap-1 ${
            activeTab === 'media' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="মিডিয়া লাইব্রেরি"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="truncate scale-90">মিডিয়া</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* TAB 1: ELEMENTS */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">ক্লিক করে সেকশন যোগ করুন</span>
              <span className="text-[10px] text-slate-400 font-semibold">{BASIC_BLOCKS.length}টি ব্লক</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {BASIC_BLOCKS.map((blk) => {
                const Icon = blk.icon;
                return (
                  <button
                    key={blk.id}
                    type="button"
                    onClick={() => onAddSection(blk.type, blk.defaultData())}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                        {blk.name}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {blk.description}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 flex-shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PRE-BUILT SECTIONS */}
        {activeTab === 'sections' && (
          <div className="space-y-3">
            <div className="pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">প্রস্তুত সেকশন ক্যাটাগরি</span>
              <p className="text-[11px] text-slate-500">এক ক্লিকে আপনার পেজে সুন্দর সেকশন যুক্ত করুন</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onAddSection('hero', {
                  title: 'বিসিএস ও সরকারি নিয়োগ স্পেশাল ব্যানার',
                  subtitle: 'পরীক্ষার প্রস্তুতি, সিলেবাস ও সরাসরি আবেদন নির্দেশনা',
                  content: { badge: 'স্পেশাল আপডেট', ctaText: 'বিস্তারিত দেখুন', ctaUrl: '/jobs' }
                })}
                className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl text-left transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>সরকারি স্পেশাল হিরো ব্যানার</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">সবুজ ব্যাকগ্রাউন্ড, কল-টু-অ্যাকশন ও নোটিশ</p>
              </button>

              <button
                type="button"
                onClick={() => onAddSection('jobs', {
                  title: 'শীর্ষ ব্যাংক ও আর্থিক প্রতিষ্ঠান নিয়োগ',
                  subtitle: 'বাংলাদেশ ব্যাংক ও বাণিজ্যিক ব্যাংকের সার্কুলার',
                  content: { limit: 4, category: 'bank' }
                })}
                className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 rounded-xl text-left transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ব্যাংক জব ফিল্টার্ড ফিড</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">ব্যাংক ক্যাটাগরির লাইভ চাকরি তালিকা</p>
              </button>

              <button
                type="button"
                onClick={() => onAddSection('faq', {
                  title: 'আবেদন সংক্রান্ত নিয়মনীতি ও ফি',
                  content: {
                    items: [
                      { question: 'টেলিটক চার্জ কত?', answer: 'সরকারি গেজেট অনুযায়ী প্রযোজ্য ফি ও ভ্যাট।' },
                      { question: 'ছবি ও স্বাক্ষরের মাপ কী?', answer: 'ছবি ৩০০x৩০০ পিক্সেল (১০০ KB) এবং স্বাক্ষর ৩০০x৮০ পিক্সেল (৬০ KB)।' }
                    ]
                  }
                })}
                className="w-full p-2.5 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 rounded-xl text-left transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>আবেদন নিয়মের FAQ সেকশন</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">ছবি ও ফি সংক্রান্ত সচরাচর প্রশ্ন</p>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: FULL PAGE TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <div className="pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">রেডিমেড পেজ টেমপ্লেট</span>
              <p className="text-[11px] text-slate-500">সম্পূর্ণ পৃষ্ঠা এক ক্লিকে সেটআপ করুন</p>
            </div>

            <div className="space-y-2.5">
              {PRESET_PAGE_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-400 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">{tpl.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded">
                      {tpl.sections.length} সেকশন
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {tpl.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTemplateConfirmId(tpl.id)}
                    className="w-full py-1.5 px-3 bg-white hover:bg-indigo-600 hover:text-white border border-slate-300 hover:border-indigo-600 text-slate-700 rounded-lg text-xs font-bold transition-all"
                  >
                    টেমপ্লেট প্রয়োগ করুন
                  </button>
                </div>
              ))}
            </div>

            {/* Template Confirmation Dialog */}
            {templateConfirmId && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 animate-in fade-in duration-100">
                <div className="flex items-start gap-2 text-amber-900 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>সতর্কতা: এটি প্রয়োগ করলে বর্তমান পৃষ্ঠার সেকশনগুলো প্রতিস্থাপিত হবে!</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyTemplate(templateConfirmId);
                      setTemplateConfirmId(null);
                    }}
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                  >
                    হ্যাঁ, প্রয়োগ করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateConfirmId(null)}
                    className="flex-1 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LAYERS (PAGE STRUCTURE TREE) */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">পৃষ্ঠার সেকশন লেয়ার্স ({currentPage.sections.length})</span>
            </div>

            {currentPage.sections.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                কোনো সেকশন যোগ করা হয়নি। বামপাশের উপাদান থেকে সেকশন যোগ করুন।
              </div>
            ) : (
              <div className="space-y-1.5">
                {currentPage.sections.map((sec, idx) => {
                  const isSelected = activeSectionId === sec.id;
                  const isVisible = sec.isVisible !== false;

                  return (
                    <div
                      key={sec.id}
                      onClick={() => onSelectSection(sec.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 shadow-xs'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {sec.title || sec.type}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            {sec.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => onToggleSectionVisibility(sec.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title={isVisible ? 'হাইড করুন' : 'দৃশ্যমান করুন'}
                        >
                          {isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onMoveSection(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="উপরে নিন"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={idx === currentPage.sections.length - 1}
                          onClick={() => onMoveSection(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="নিচে নিন"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => onDuplicateSection(idx)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="ডুপ্লিকেট করুন"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteSection(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: GLOBAL COMPONENTS */}
        {activeTab === 'globals' && (
          <div className="space-y-3">
            <div className="pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">গ্লোবাল ওয়েবসাইট উপাদান</span>
              <p className="text-[11px] text-slate-500">যেসব উপাদান পুরো ওয়েবসাইটের সব পৃষ্ঠায় প্রযোজ্য</p>
            </div>

            {/* Warning Box */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>সতর্কতা: গ্লোবাল পরিবর্তন</span>
              </div>
              <p className="text-[11px]">
                এখানে কোনো পরিবর্তন করলে তা ওয়েবসাইটের প্রতিটি পাতায় তাৎক্ষণিকভাবে প্রতিফলিত হবে।
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onOpenChromeSettings}
                className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left flex items-center justify-between transition-colors shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">হেডার ও মেনু নেভিগেশন</span>
                  <span className="text-[11px] text-slate-500">লোগো, ড্রপডাউন মেনু ও নোটিশ বার</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={onOpenChromeSettings}
                className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left flex items-center justify-between transition-colors shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">ফুটার ও ডিসক্লেমার</span>
                  <span className="text-[11px] text-slate-500">কপিরাইট, সোশ্যাল লিংক ও কলাম সমূহ</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={onOpenChromeSettings}
                className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left flex items-center justify-between transition-colors shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">সার্ভিস গ্যারান্টি ও ট্র্যাকিং বার</span>
                  <span className="text-[11px] text-slate-500">হোয়াটসঅ্যাপ চ্যাট ও ট্র্যাকিং বাটন</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            <div className="pb-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">মিডিয়া গ্যালারি</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ছবি খুঁজুন..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mediaItems.filter(m => !mediaSearch || m.title.toLowerCase().includes(mediaSearch.toLowerCase())).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectMediaImage) onSelectMediaImage(item.url);
                  }}
                  className="p-1.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer bg-slate-50 text-center space-y-1 group"
                >
                  <div className="w-full h-16 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 block truncate">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
