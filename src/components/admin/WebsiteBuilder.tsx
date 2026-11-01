'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  Save, 
  Send, 
  History, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Palette, 
  Type, 
  CheckCircle2, 
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { PageRecord, PageSection, SectionType, PageRevision } from '@/lib/types';

const ADMIN_REQ_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
};

export default function WebsiteBuilder() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showNewPageModal, setShowNewPageModal] = useState<boolean>(false);
  const [newPageTitle, setNewPageTitle] = useState<string>('');
  const [newPageSlug, setNewPageSlug] = useState<string>('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pages', {
        headers: ADMIN_REQ_HEADERS
      });
      const data = await res.json();
      if (data.pages && Array.isArray(data.pages)) {
        setPages(data.pages);
        if (data.pages.length > 0 && !selectedPageId) {
          setSelectedPageId(data.pages[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pages', err);
    } finally {
      setLoading(false);
    }
  };

  const currentPage = pages.find(p => p.id === selectedPageId) || pages[0];

  const updateCurrentPage = (updater: (prev: PageRecord) => PageRecord) => {
    setPages(prev => prev.map(p => p.id === selectedPageId ? updater(p) : p));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!currentPage) return;
    const sections = [...currentPage.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;
    updateCurrentPage(p => ({ ...p, sections }));
  };

  const handleDuplicateSection = (index: number) => {
    if (!currentPage) return;
    const sections = [...currentPage.sections];
    const original = sections[index];
    const copy: PageSection = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'sec-' + Date.now(),
      title: original.title + ' (কপি)'
    };
    sections.splice(index + 1, 0, copy);
    updateCurrentPage(p => ({ ...p, sections }));
    setActiveSectionId(copy.id);
  };

  const handleDeleteSection = (index: number) => {
    if (!currentPage) return;
    if (currentPage.sections.length <= 1) {
      alert('পৃষ্ঠায় অন্তত একটি সেকশন থাকা আবশ্যক!');
      return;
    }
    const sections = currentPage.sections.filter((_, i) => i !== index);
    updateCurrentPage(p => ({ ...p, sections }));
    setActiveSectionId(null);
  };

  const handleAddSection = (type: SectionType) => {
    if (!currentPage) return;
    const newSec: PageSection = {
      id: 'sec-' + Date.now(),
      type,
      title: type === 'hero' ? 'নতুন ব্যানার শিরোনাম' :
             type === 'features' ? 'আমাদের প্রধান সেবাসমূহ' :
             type === 'cta' ? 'আজই চাকরির আবেদন সম্পন্ন করুন' :
             type === 'stats' ? 'প্ল্যাটফর্মের মাইলফলক ও পরিসংখ্যান' :
             'নতুন অনুচ্ছেদ ও বিষয়বস্তু',
      subtitle: 'এখানে আপনার পছন্দের বিবরণ লিখুন।',
      content: type === 'features' ? {
        items: [
          { title: 'ফিচার ১', desc: 'সংক্ষিপ্ত তথ্য এখানে লিখুন।' },
          { title: 'ফিচার ২', desc: 'সংক্ষিপ্ত তথ্য এখানে লিখুন।' },
          { title: 'ফিচার ৩', desc: 'সংক্ষিপ্ত তথ্য এখানে লিখুন।' }
        ]
      } : type === 'cta' ? {
        buttonLabel: 'আবেদন করুন',
        buttonUrl: '/jobs'
      } : type === 'hero' ? {
        badge: '⚡ বিশেষ বিজ্ঞপ্তি',
        ctaText: 'সার্কুলার দেখুন',
        ctaUrl: '/jobs'
      } : {},
      style: {
        backgroundColor: type === 'hero' ? '#064e3b' : type === 'cta' ? '#0f172a' : '#ffffff',
        textColor: type === 'hero' || type === 'cta' ? '#ffffff' : '#0f172a',
        paddingY: 'lg',
        textAlign: 'center',
        columns: 3
      },
      isVisible: true
    };
    updateCurrentPage(p => ({ ...p, sections: [...p.sections, newSec] }));
    setActiveSectionId(newSec.id);
  };

  const handleSavePage = async (isPublish = false) => {
    if (!currentPage) return;
    try {
      setSaveStatus(isPublish ? 'ওয়েবসাইটে প্রকাশ করা হচ্ছে...' : 'ড্রাফট সংরক্ষণ হচ্ছে...');
      const res = await fetch('/api/admin/pages/' + currentPage.id, {
        method: 'PUT',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          ...currentPage,
          action: isPublish ? 'publish' : 'save_draft'
        })
      });
      const data = await res.json();
      if (data.success && data.page) {
        setPages(prev => prev.map(p => p.id === data.page.id ? data.page : p));
        setSaveStatus(isPublish ? 'সফল! পৃষ্ঠাটি লাইভ ওয়েবসাইটে প্রকাশিত হয়েছে!' : 'ড্রাফট সফলভাবে সংরক্ষিত হয়েছে!');
        setTimeout(() => setSaveStatus(null), 3500);
      } else {
        alert(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
        setSaveStatus(null);
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
      setSaveStatus(null);
    }
  };

  const handleDeletePage = async () => {
    if (!currentPage) return;
    if (currentPage.isSystemPage) {
      alert('সিস্টেম বা জরুরি মূল পৃষ্ঠা মুছে ফেলা যাবে না!');
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${currentPage.title}" পৃষ্ঠাটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch('/api/admin/pages/' + currentPage.id, {
        method: 'DELETE',
        headers: ADMIN_REQ_HEADERS
      });
      const data = await res.json();
      if (data.success) {
        setPages(prev => prev.filter(p => p.id !== currentPage.id));
        setSelectedPageId('home');
        setActiveSectionId(null);
        alert('পৃষ্ঠাটি সফলভাবে মুছে ফেলা হয়েছে!');
      } else {
        alert(data.error || 'পৃষ্ঠা মোছা ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleRestoreRevision = (rev: PageRevision) => {
    if (!confirm('আপনি কি সংস্করণ v' + rev.version + '-এ ফিরে যেতে চান?')) return;
    updateCurrentPage(p => ({
      ...p,
      sections: JSON.parse(JSON.stringify(rev.sections))
    }));
    setShowHistoryModal(false);
    alert('সংস্করণ v' + rev.version + ' সফলভাবে রিস্টোর হয়েছে!');
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          title: newPageTitle,
          slug: newPageSlug
        })
      });
      const data = await res.json();
      if (data.success && data.page) {
        setPages(prev => [...prev, data.page]);
        setSelectedPageId(data.page.id);
        setShowNewPageModal(false);
        setNewPageTitle('');
        setNewPageSlug('');
        alert('নতুন পৃষ্ঠা সফলভাবে তৈরি হয়েছে!');
      } else {
        alert(data.error || 'তৈরি ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold animate-pulse">
        ভিজ্যুয়াল পেজ বিল্ডার লোড হচ্ছে...
      </div>
    );
  }

  const activeSection = currentPage?.sections.find(s => s.id === activeSectionId);

  return (
    <div className="space-y-6">
      
      {/* BUILDER HEADER & TOOLBAR */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Page Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">সম্পাদনার জন্য পৃষ্ঠা নির্বাচন</span>
            <select
              value={selectedPageId}
              onChange={(e) => {
                setSelectedPageId(e.target.value);
                setActiveSectionId(null);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 max-w-xs truncate"
            >
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.slug}) {p.status === 'published' ? '● লাইভ' : '○ ড্রাফট'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 mt-4">
            <button
              onClick={() => setShowNewPageModal(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন পৃষ্ঠা</span>
            </button>

            {!currentPage?.isSystemPage && (
              <button
                onClick={handleDeletePage}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                title="পৃষ্ঠাটি মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>পৃষ্ঠা মুছুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="flex items-center justify-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-center">
          <button
            onClick={() => setViewport('desktop')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
              viewport === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">ডেস্কটপ</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
              viewport === 'tablet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden sm:inline">ট্যাবলেট</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
              viewport === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">মোবাইল</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ' + (
              previewMode ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'এডিটর' : 'প্রিভিউ'}</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>সংস্করণ v{currentPage?.version || 1}</span>
          </button>

          <button
            onClick={() => handleSavePage(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ড্রাফট সেভ</span>
          </button>

          <button
            onClick={() => handleSavePage(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>পাবলিশ</span>
          </button>
        </div>

      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* CANVAS & INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CANVAS */}
        <div className={previewMode || !activeSection ? 'lg:col-span-12' : 'lg:col-span-8'}>
          <div className="bg-slate-100 rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-inner flex flex-col items-center min-h-[500px]">
            <div 
              style={{ width: viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%', transition: 'width 0.3s ease' }}
              className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden space-y-4"
            >
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className="font-mono bg-white px-3 py-0.5 rounded-md border border-slate-200 text-[10px] text-slate-600 truncate max-w-[200px]">
                  https://chakrisheba.com{currentPage?.slug}
                </div>
                <span className="font-bold text-[10px] text-emerald-700 uppercase">{viewport} ({currentPage?.status})</span>
              </div>

              <div className="divide-y divide-slate-100">
                {currentPage?.sections.map((sec, idx) => {
                  if (previewMode && sec.isVisible === false) return null;

                  return (
                    <div 
                      key={sec.id}
                      onClick={() => !previewMode && setActiveSectionId(sec.id)}
                      style={{
                        backgroundColor: sec.style.backgroundColor || '#ffffff',
                        color: sec.style.textColor || '#0f172a',
                        paddingTop: sec.style.paddingY === 'xl' ? '4rem' : sec.style.paddingY === 'lg' ? '3rem' : sec.style.paddingY === 'sm' ? '1rem' : '2rem',
                        paddingBottom: sec.style.paddingY === 'xl' ? '4rem' : sec.style.paddingY === 'lg' ? '3rem' : sec.style.paddingY === 'sm' ? '1rem' : '2rem',
                        textAlign: sec.style.textAlign || 'center',
                        opacity: sec.isVisible === false ? 0.5 : 1
                      }}
                      className={'relative group transition-all cursor-pointer ' + (
                        !previewMode && activeSectionId === sec.id ? 'ring-4 ring-emerald-500/80 ring-offset-2' : 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-emerald-400'
                      )}
                    >
                      {!previewMode && (
                        <div className="absolute top-2 right-2 bg-slate-900/90 text-white rounded-xl px-2 py-1 text-[11px] font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg">
                          <span className="text-[10px] text-slate-300 font-mono">#{idx + 1} {sec.type}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'up'); }} disabled={idx === 0} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30" title="উপরে তুলুন">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'down'); }} disabled={idx === currentPage.sections.length - 1} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30" title="নিচে নামান">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDuplicateSection(idx); }} className="p-1 hover:bg-slate-700 rounded" title="কপি করুন">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(idx); }} className="p-1 hover:bg-red-600 rounded text-red-300 hover:text-white" title="মুছে ফেলুন">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="max-w-4xl mx-auto px-6 space-y-4">
                        {sec.type === 'hero' && (
                          <div className="space-y-3">
                            {sec.content.badge && (
                              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide">
                                {sec.content.badge}
                              </span>
                            )}
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">{sec.title}</h2>
                            {sec.subtitle && <p className="text-sm sm:text-base opacity-90 max-w-2xl mx-auto">{sec.subtitle}</p>}
                            {(sec.content.ctaText || sec.content.buttonLabel) && (
                              <div className="pt-2">
                                <span className="inline-block px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm shadow-md">
                                  {sec.content.ctaText || sec.content.buttonLabel}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {sec.type === 'features' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-xl sm:text-2xl font-black">{sec.title}</h3>
                              {sec.subtitle && <p className="text-xs sm:text-sm opacity-80 mt-1">{sec.subtitle}</p>}
                            </div>
                            <div className={'grid gap-4 ' + (
                              sec.style.columns === 4 ? 'grid-cols-1 sm:grid-cols-4' :
                              sec.style.columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                              'grid-cols-1 sm:grid-cols-3'
                            )}>
                              {(sec.content.items || []).map((item: any, i: number) => (
                                <div key={i} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 text-left space-y-1">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">{item.title}</span>
                                  <span className="text-xs text-slate-600 block">{item.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {sec.type === 'cta' && (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-black">{sec.title}</h3>
                            <p className="text-xs sm:text-sm opacity-90">{sec.subtitle}</p>
                            <span className="inline-block px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md">
                              {sec.content.buttonLabel || 'আবেদন করুন'}
                            </span>
                          </div>
                        )}

                        {sec.type === 'stats' && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                            <div className="p-3 bg-white/10 rounded-xl">
                              <span className="text-2xl font-black block">৫২,০০০+</span>
                              <span className="text-[11px] opacity-80">সফল আবেদন</span>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                              <span className="text-2xl font-black block">১০০%</span>
                              <span className="text-[11px] opacity-80">টেলিটক সামঞ্জস্য</span>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                              <span className="text-2xl font-black block">৬৪ জেলা</span>
                              <span className="text-[11px] opacity-80">সারাদেশে কভারেজ</span>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                              <span className="text-2xl font-black block">২৪/৭</span>
                              <span className="text-[11px] opacity-80">সাপোর্ট হেল্পলাইন</span>
                            </div>
                          </div>
                        )}

                        {sec.type === 'text' && (
                          <div className="space-y-2" style={{ textAlign: sec.style.textAlign || 'left' }}>
                            <h3 className="text-xl font-black">{sec.title}</h3>
                            <p className="text-xs sm:text-sm opacity-85 leading-relaxed">{sec.subtitle}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!previewMode && (
                <div className="p-6 bg-slate-50 border-t border-slate-200 text-center space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">+ নতুন সেকশন যোগ করুন</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button onClick={() => handleAddSection('hero')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ ব্যানার (Hero)</button>
                    <button onClick={() => handleAddSection('features')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ ফিচার গ্রিড (Cards)</button>
                    <button onClick={() => handleAddSection('cta')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ কল টু অ্যাকশন</button>
                    <button onClick={() => handleAddSection('stats')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ পরিসংখ্যান</button>
                    <button onClick={() => handleAddSection('text')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ অনুচ্ছেদ</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INSPECTOR */}
        {!previewMode && activeSection && (
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-black text-slate-900 uppercase">সেকশন ইন্সপেক্টর</h3>
              </div>
              <button onClick={() => setActiveSectionId(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700">বন্ধ করুন</button>
            </div>

            {/* Content Fields */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-slate-500" />
                <span>টেক্সট ও কনটেন্ট</span>
              </span>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">মূল শিরোনাম</label>
                <input
                  type="text"
                  value={activeSection.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    updateCurrentPage(p => ({
                      ...p,
                      sections: p.sections.map(s => s.id === activeSection.id ? { ...s, title } : s)
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">উপশিরোনাম / বিবরণ</label>
                <textarea
                  rows={3}
                  value={activeSection.subtitle || ''}
                  onChange={(e) => {
                    const subtitle = e.target.value;
                    updateCurrentPage(p => ({
                      ...p,
                      sections: p.sections.map(s => s.id === activeSection.id ? { ...s, subtitle } : s)
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Hero Specific */}
              {activeSection.type === 'hero' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-600 block">টপ ব্যাজ (Badge)</label>
                  <input
                    type="text"
                    value={activeSection.content?.badge || ''}
                    onChange={(e) => {
                      const badge = e.target.value;
                      updateCurrentPage(p => ({
                        ...p,
                        sections: p.sections.map(s => s.id === activeSection.id ? {
                          ...s,
                          content: { ...s.content, badge }
                        } : s)
                      }));
                    }}
                    placeholder="উদা: ⚡ বিশেষ বিজ্ঞপ্তি"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন টেক্সট</label>
                      <input
                        type="text"
                        value={activeSection.content?.ctaText || activeSection.content?.buttonLabel || ''}
                        onChange={(e) => {
                          const ctaText = e.target.value;
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              content: { ...s.content, ctaText, buttonLabel: ctaText }
                            } : s)
                          }));
                        }}
                        placeholder="আবেদন করুন"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন লিংক</label>
                      <input
                        type="text"
                        value={activeSection.content?.ctaUrl || activeSection.content?.buttonUrl || ''}
                        onChange={(e) => {
                          const ctaUrl = e.target.value;
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              content: { ...s.content, ctaUrl, buttonUrl: ctaUrl }
                            } : s)
                          }));
                        }}
                        placeholder="/jobs"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Specific */}
              {activeSection.type === 'cta' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={activeSection.content?.buttonLabel || ''}
                      onChange={(e) => {
                        const buttonLabel = e.target.value;
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, buttonLabel }
                          } : s)
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন লিংক</label>
                    <input
                      type="text"
                      value={activeSection.content?.buttonUrl || ''}
                      onChange={(e) => {
                        const buttonUrl = e.target.value;
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, buttonUrl }
                          } : s)
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Features Specific */}
              {activeSection.type === 'features' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">ফিচার কার্ডসমূহ ({(activeSection.content?.items || []).length}টি)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const items = [...(activeSection.content?.items || []), { title: 'নতুন সুবিধা', desc: 'বিবরণ লিখুন।' }];
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, items }
                          } : s)
                        }));
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900"
                    >
                      + কার্ড যোগ করুন
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(activeSection.content?.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500">কার্ড #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const items = (activeSection.content?.items || []).filter((_: any, i: number) => i !== idx);
                              updateCurrentPage(p => ({
                                ...p,
                                sections: p.sections.map(s => s.id === activeSection.id ? {
                                  ...s,
                                  content: { ...s.content, items }
                                } : s)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 text-[10px]"
                          >
                            মুছুন
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const items = [...(activeSection.content?.items || [])];
                            items[idx] = { ...items[idx], title: e.target.value };
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, items }
                              } : s)
                            }));
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          placeholder="কার্ডের শিরোনাম"
                        />
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => {
                            const items = [...(activeSection.content?.items || [])];
                            items[idx] = { ...items[idx], desc: e.target.value };
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, items }
                              } : s)
                            }));
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-600"
                          placeholder="কার্ডের বিবরণ"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Styling & Layout */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span>কালার ও লেআউট স্টাইলিং</span>
              </span>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">ব্যাকগ্রাউন্ড কালার</label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Green', color: '#064e3b' },
                    { label: 'Navy', color: '#0f172a' },
                    { label: 'White', color: '#ffffff' },
                    { label: 'Light', color: '#f8fafc' },
                    { label: 'Teal', color: '#0d9488' }
                  ].map(c => (
                    <button
                      key={c.color}
                      type="button"
                      style={{ backgroundColor: c.color }}
                      onClick={() => {
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            style: {
                              ...s.style,
                              backgroundColor: c.color,
                              textColor: c.color === '#ffffff' || c.color === '#f8fafc' ? '#0f172a' : '#ffffff'
                            }
                          } : s)
                        }));
                      }}
                      className={'w-6 h-6 rounded-full border-2 transition-all ' + (
                        activeSection.style.backgroundColor === c.color ? 'border-emerald-500 scale-110 shadow' : 'border-slate-300'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">টেক্সট অ্যালাইনমেন্ট</label>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {[
                    { align: 'left', icon: AlignLeft, label: 'বাম' },
                    { align: 'center', icon: AlignCenter, label: 'মাঝ' },
                    { align: 'right', icon: AlignRight, label: 'ডান' }
                  ].map(a => (
                    <button
                      key={a.align}
                      type="button"
                      onClick={() => {
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            style: { ...s.style, textAlign: a.align as any }
                          } : s)
                        }));
                      }}
                      className={'flex-1 py-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ' + (
                        activeSection.style.textAlign === a.align ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      <a.icon className="w-3.5 h-3.5" />
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Columns for Features */}
              {activeSection.type === 'features' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">কলাম সংখ্যা</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([2, 3, 4] as const).map(cols => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => {
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              style: { ...s.style, columns: cols }
                            } : s)
                          }));
                        }}
                        className={'py-1 rounded-xl text-xs font-bold border transition-all ' + (
                          activeSection.style.columns === cols ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                        )}
                      >
                        {cols} কলাম
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Padding */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">ভার্টিক্যাল প্যাডিং</label>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { pad: 'sm', label: 'কম' },
                    { pad: 'md', label: 'মাঝারি' },
                    { pad: 'lg', label: 'বেশি' },
                    { pad: 'xl', label: 'সর্বোচ্চ' }
                  ].map(pItem => (
                    <button
                      key={pItem.pad}
                      type="button"
                      onClick={() => {
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            style: { ...s.style, paddingY: pItem.pad as any }
                          } : s)
                        }));
                      }}
                      className={'py-1 text-xs font-bold rounded-xl border transition-all ' + (
                        activeSection.style.paddingY === pItem.pad ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                      )}
                    >
                      {pItem.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* REVISION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">সংস্করণ ইতিহাস ও রিস্টোর</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(currentPage?.revisions || []).map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">সংস্করণ v{rev.version} ({rev.status})</span>
                    <span className="text-[10px] text-slate-500">{new Date(rev.savedAt).toLocaleString('bn-BD')}</span>
                  </div>
                  <button onClick={() => handleRestoreRevision(rev)} className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-lg font-bold text-[11px]">রিস্টোর</button>
                </div>
              ))}
              {(currentPage?.revisions || []).length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">কোনো পূর্ববর্তী সংস্করণ পাওয়া যায়নি।</div>
              )}
            </div>
            <button onClick={() => setShowHistoryModal(false)} className="w-full py-2.5 bg-slate-100 text-slate-800 rounded-xl font-bold text-xs">বন্ধ করুন</button>
          </div>
        </div>
      )}

      {/* NEW PAGE MODAL */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePage} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">নতুন ওয়েবসাইট পৃষ্ঠা তৈরি</h3>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">পৃষ্ঠার শিরোনাম *</label>
              <input type="text" required placeholder="উদা: নিয়োগ গাইডলাইন ২০২৬" value={newPageTitle} onChange={(e) => setNewPageTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">স্লাগ / URL পাথ *</label>
              <input type="text" required placeholder="/recruitment-guidelines" value={newPageSlug} onChange={(e) => setNewPageSlug(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowNewPageModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">বাতিল</button>
              <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow">তৈরি করুন</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
