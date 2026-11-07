'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Maximize2,
  Palette,
  Eye,
  Code,
  Check,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  HelpCircle,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';
import { PageSection } from '@/lib/types';

interface BuilderRightInspectorProps {
  activeSection: PageSection | null;
  onUpdateSection: (updated: PageSection) => void;
  onClose: () => void;
  onDeleteSection?: () => void;
  onDuplicateSection?: () => void;
}

export default function BuilderRightInspector({
  activeSection,
  onUpdateSection,
  onClose,
  onDeleteSection,
  onDuplicateSection
}: BuilderRightInspectorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'typography' | 'layout' | 'background' | 'responsive' | 'advanced'>('content');

  if (!activeSection) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center text-slate-400 font-solaiman h-full flex-shrink-0">
        <Sliders className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-xs font-bold text-slate-600">কোনো সেকশন নির্বাচিত নেই</p>
        <p className="text-[11px] text-slate-400 mt-1">
          ক্যানভাস থেকে যেকোনো সেকশনে ক্লিক করুন এর স্টাইল ও টেক্সট পরিবর্তন করতে।
        </p>
      </div>
    );
  }

  const content = activeSection.content || {};
  const style = activeSection.style || {};

  const updateContent = (key: string, value: any) => {
    onUpdateSection({
      ...activeSection,
      content: { ...content, [key]: value }
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdateSection({
      ...activeSection,
      style: { ...style, [key]: value }
    });
  };

  const PRESET_BG_COLORS = [
    { label: 'হোয়াইট', hex: '#ffffff', class: 'bg-white border-slate-300' },
    { label: 'হালকা স্লেট', hex: '#f8fafc', class: 'bg-slate-50 border-slate-300' },
    { label: 'হালকা সবুজ', hex: '#ecfdf5', class: 'bg-emerald-50 border-emerald-300' },
    { label: 'বিডি গ্রিন', hex: '#006a4e', class: 'bg-[#006a4e] text-white' },
    { label: 'গাঢ় সবুজ', hex: '#064e3b', class: 'bg-emerald-900 text-white' },
    { label: 'ডার্ক স্লেট', hex: '#0f172a', class: 'bg-slate-900 text-white' },
    { label: 'ইনডিগো ডার্ক', hex: '#1e1b4b', class: 'bg-indigo-950 text-white' }
  ];

  const PRESET_TEXT_COLORS = [
    { label: 'কালো', hex: '#0f172a' },
    { label: 'সাদা', hex: '#ffffff' },
    { label: 'ধূসর', hex: '#475569' },
    { label: 'সবুজ', hex: '#065f46' },
    { label: 'ইনডিগো', hex: '#4338ca' }
  ];

  return (
    <div className="w-84 bg-white border-l border-slate-200/90 flex flex-col h-full font-solaiman flex-shrink-0 shadow-xs">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2 min-w-0">
          <Sliders className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate">
              {activeSection.title || activeSection.type}
            </span>
            <span className="text-[10px] text-slate-500 font-mono uppercase">
              {activeSection.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onDuplicateSection && (
            <button
              type="button"
              onClick={onDuplicateSection}
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
              title="ডুপ্লিকেট করুন"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteSection && (
            <button
              type="button"
              onClick={onDeleteSection}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 font-bold text-xs"
            title="বন্ধ করুন"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 6 Inspector Tabs */}
      <div className="grid grid-cols-6 border-b border-slate-200 bg-white p-1 text-center text-[10px] font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'content' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          কনটেন্ট
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('typography')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'typography' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          টাইপো
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'layout' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          লেআউট
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('background')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'background' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          রং
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('responsive')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'responsive' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ভিউ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'advanced' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          CSS
        </button>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: CONTENT */}
        {activeTab === 'content' && (
          <div className="space-y-3.5">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                প্রধান শিরোনাম (Title)
              </label>
              <input
                type="text"
                value={activeSection.title || ''}
                onChange={(e) => onUpdateSection({ ...activeSection, title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                উপ-শিরোনাম / বিবরণ (Subtitle)
              </label>
              <textarea
                rows={2}
                value={activeSection.subtitle || ''}
                onChange={(e) => onUpdateSection({ ...activeSection, subtitle: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Badge (Optional) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                টপ ব্যাজ টেক্সট (Badge)
              </label>
              <input
                type="text"
                value={content.badge || ''}
                onChange={(e) => updateContent('badge', e.target.value)}
                placeholder="যেমন: ⚡ নতুন সার্কুলার"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* CTA Buttons for Hero / CTA */}
            {(activeSection.type === 'hero' || activeSection.type === 'cta') && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">কল টু অ্যাকশন বাটন</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">বাটন টেক্সট</span>
                    <input
                      type="text"
                      value={content.ctaText || content.buttonLabel || ''}
                      onChange={(e) => {
                        updateContent('ctaText', e.target.value);
                        updateContent('buttonLabel', e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">বাটন লিংক URL</span>
                    <input
                      type="text"
                      value={content.ctaUrl || content.buttonUrl || ''}
                      onChange={(e) => {
                        updateContent('ctaUrl', e.target.value);
                        updateContent('buttonUrl', e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Specific Content */}
            {activeSection.type === 'jobs' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">সার্কুলার ফিল্টার</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">ক্যাটাগরি</span>
                    <select
                      value={content.category || 'all'}
                      onChange={(e) => updateContent('category', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                    >
                      <option value="all">সকল ক্যাটাগরি</option>
                      <option value="government">সরকারি চাকরি</option>
                      <option value="bank">ব্যাংক ও আর্থিক</option>
                      <option value="defense">প্রতিরক্ষা ও পুলিশ</option>
                      <option value="railway">রেলওয়ে</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">সর্বোচ্চ সংখ্যা</span>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={content.limit || 6}
                      onChange={(e) => updateContent('limit', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Body Text for Text Block */}
            {activeSection.type === 'text' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  বিস্তারিত টেক্সট (Paragraph)
                </label>
                <textarea
                  rows={5}
                  value={content.text || ''}
                  onChange={(e) => updateContent('text', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-3.5">
            {/* Font Family Note */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <span className="font-bold block">ফন্ট ফ্যামিলি: SolaimanLipi</span>
              <span className="text-[11px] text-slate-500">ওয়েবসাইটের অফিশিয়াল বাংলা ফন্ট অপরিবর্তিত রাখা হয়েছে।</span>
            </div>

            {/* Title Font Size */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                শিরোনাম ফন্ট সাইজ
              </label>
              <select
                value={style.titleFontSize || '3xl'}
                onChange={(e) => updateStyle('titleFontSize', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
              >
                <option value="xl">XL (ছোট)</option>
                <option value="2xl">2XL (মাঝারি)</option>
                <option value="3xl">3XL (স্ট্যান্ডার্ড)</option>
                <option value="4xl">4XL (বড়)</option>
                <option value="5xl">5xl (খুব বড়)</option>
              </select>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                টেক্সট অ্যালাইনমেন্ট
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => updateStyle('textAlign', 'left')}
                  className={`py-1.5 rounded-lg flex items-center justify-center ${
                    style.textAlign === 'left' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateStyle('textAlign', 'center')}
                  className={`py-1.5 rounded-lg flex items-center justify-center ${
                    (!style.textAlign || style.textAlign === 'center') ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateStyle('textAlign', 'right')}
                  className={`py-1.5 rounded-lg flex items-center justify-center ${
                    style.textAlign === 'right' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Color Swatches */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                টেক্সটের রঙ
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_TEXT_COLORS.map((tc) => (
                  <button
                    key={tc.hex}
                    type="button"
                    onClick={() => updateStyle('textColor', tc.hex)}
                    style={{ backgroundColor: tc.hex }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      style.textColor === tc.hex ? 'border-indigo-600 ring-2 ring-indigo-400' : 'border-slate-300'
                    }`}
                    title={tc.label}
                  >
                    {style.textColor === tc.hex && (
                      <Check className={`w-3.5 h-3.5 ${tc.hex === '#ffffff' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LAYOUT & SPACING */}
        {activeTab === 'layout' && (
          <div className="space-y-3.5">
            {/* Columns */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                গ্রিড কলাম সংখ্যা
              </label>
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-center text-xs font-bold">
                {[1, 2, 3, 4].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => updateStyle('columns', col)}
                    className={`py-1.5 rounded-lg ${
                      style.columns === col ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500'
                    }`}
                  >
                    {col} কলাম
                  </button>
                ))}
              </div>
            </div>

            {/* Padding Y */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                সেকশন প্যাডিং (উচ্চতা)
              </label>
              <select
                value={style.paddingY || 'lg'}
                onChange={(e) => updateStyle('paddingY', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              >
                <option value="sm">কম (Small - 1rem)</option>
                <option value="md">মাঝারি (Medium - 2rem)</option>
                <option value="lg">স্ট্যান্ডার্ড (Large - 3rem)</option>
                <option value="xl">অতিরিক্ত (Extra Large - 4rem)</option>
              </select>
            </div>

            {/* Max Width */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                কন্টেইনার প্রস্থ (Max Width)
              </label>
              <select
                value={style.maxWidth || 'lg'}
                onChange={(e) => updateStyle('maxWidth', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              >
                <option value="sm">সংকীর্ণ (Small)</option>
                <option value="md">মাঝারি (Medium - 3xl)</option>
                <option value="lg">প্রশস্ত (Large - 7xl)</option>
                <option value="full">সম্পূর্ণ স্ক্রিন (Full Width)</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 4: BACKGROUND & BORDERS */}
        {activeTab === 'background' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                ব্যাকগ্রাউন্ডের রঙ (Presets)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BG_COLORS.map((bg) => (
                  <button
                    key={bg.hex}
                    type="button"
                    onClick={() => updateStyle('backgroundColor', bg.hex)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${bg.class} ${
                      style.backgroundColor === bg.hex ? 'ring-2 ring-indigo-500 shadow-sm' : ''
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400" style={{ backgroundColor: bg.hex }} />
                    <span className="truncate">{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hex */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                কাস্টম হেক্স কোড (Hex Color)
              </label>
              <input
                type="text"
                value={style.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            {/* Border Radius */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                বর্ডার ব্যাসার্ধ (Border Radius)
              </label>
              <select
                value={style.borderRadius || 'none'}
                onChange={(e) => updateStyle('borderRadius', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              >
                <option value="none">ধারহীন (None)</option>
                <option value="md">হালকা গোল (Rounded MD)</option>
                <option value="xl">মাঝারি গোল (Rounded XL)</option>
                <option value="2xl">বেশি গোল (Rounded 2XL)</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 5: RESPONSIVE */}
        {activeTab === 'responsive' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">ডিভাইস ভেদে প্রদর্শন নিয়ন্ত্রণ</span>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Monitor className="w-4 h-4" />
                  <span>ডেস্কটপ ভিউ</span>
                </span>
                <span className="text-emerald-700 font-bold">সক্রিয়</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Tablet className="w-4 h-4" />
                  <span>ট্যাবলেট ভিউ</span>
                </span>
                <span className="text-emerald-700 font-bold">সক্রিয়</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Smartphone className="w-4 h-4" />
                  <span>মোবাইল ভিউ</span>
                </span>
                <span className="text-emerald-700 font-bold">সক্রিয়</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ADVANCED */}
        {activeTab === 'advanced' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                কাস্টম CSS ক্লাস (Tailwind / Custom)
              </label>
              <input
                type="text"
                placeholder="যেমন: shadow-xl border-t"
                value={content.customClass || ''}
                onChange={(e) => updateContent('customClass', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                HTML সেকশন আইডি (Anchor Jump)
              </label>
              <input
                type="text"
                placeholder="যেমন: faq-section"
                value={activeSection.id}
                readOnly
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
