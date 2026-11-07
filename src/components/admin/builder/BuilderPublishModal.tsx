'use client';

import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Send,
  X,
  Sparkles
} from 'lucide-react';
import { PageRecord } from '@/lib/types';
import { BuilderPublishValidation, ValidationIssue } from './BuilderTypes';

interface BuilderPublishModalProps {
  isOpen: boolean;
  page: PageRecord;
  onClose: () => void;
  onConfirmPublish: () => void;
  isPublishing: boolean;
}

export function validatePageForPublish(page: PageRecord): BuilderPublishValidation {
  const issues: ValidationIssue[] = [];

  // 1. Title validation
  if (!page.title || !page.title.trim()) {
    issues.push({ type: 'error', message: 'পৃষ্ঠার শিরোনাম (Title) খালি রাখা যাবে না।' });
  }

  // 2. Slug validation
  if (!page.slug || !page.slug.trim()) {
    issues.push({ type: 'error', message: 'পৃষ্ঠার URL পাথ (Slug) প্রদান করা হয়নি।' });
  } else if (!page.slug.startsWith('/')) {
    issues.push({ type: 'warning', message: 'URL পাথের শুরুতে স্ল্যাশ (/) থাকা উচিত।' });
  }

  // 3. Sections validation
  const visibleSections = (page.sections || []).filter(s => s.isVisible !== false);
  if (visibleSections.length === 0) {
    issues.push({ type: 'error', message: 'পৃষ্ঠায় অন্তত একটি দৃশ্যমান সেকশন থাকতে হবে।' });
  }

  // 4. SEO validation
  if (!page.metaTitle || page.metaTitle.trim().length < 10) {
    issues.push({ type: 'warning', message: 'এসইও মেটা টাইটেল খুব সংক্ষিপ্ত। অন্তত ৩০-৬০ অক্ষর রাখা শ্রেয়।' });
  }

  if (!page.metaDescription || page.metaDescription.trim().length < 30) {
    issues.push({ type: 'warning', message: 'এসইও মেটা ডেসক্রিপশন খালি বা খুব ছোট (প্রস্তাবিত ১২০-১৬০ অক্ষর)।' });
  }

  const hasErrors = issues.some(i => i.type === 'error');
  return {
    canPublish: !hasErrors,
    issues
  };
}

export default function BuilderPublishModal({
  isOpen,
  page,
  onClose,
  onConfirmPublish,
  isPublishing
}: BuilderPublishModalProps) {
  if (!isOpen) return null;

  const validation = validatePageForPublish(page);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-solaiman animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <Send className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                পৃষ্ঠা পাবলিশ ও লাইভ ভ্যালিডেশন
              </h3>
              <p className="text-[11px] text-slate-500">
                {page.title} ({page.slug})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Checklist Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">
              প্রি-পাবলিশিং কোয়ালিটি অডিট চেকলিস্ট:
            </span>

            {/* Checklist items */}
            <div className="space-y-2 text-xs">
              {validation.issues.length === 0 ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>চমৎকার! সমস্ত এসইও ও কন্টেন্ট ভ্যালিডেশন সফল হয়েছে।</span>
                </div>
              ) : (
                validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      issue.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : issue.type === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                    {issue.type === 'error' ? (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium">{issue.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-2xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">পাবলিশিং তথ্যাদি:</span>
            <p>• ভার্সন: <strong>v{page.version || 1}</strong></p>
            <p>• মোট সেকশন সংখ্যা: <strong>{page.sections.length}টি</strong></p>
            <p>• দৃশ্যমান সেকশন: <strong>{page.sections.filter(s => s.isVisible !== false).length}টি</strong></p>
            <p>• লাইভ URL: <span className="font-mono text-emerald-700">https://chakrisheba.com{page.slug}</span></p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            ফিরে যান
          </button>

          <button
            type="button"
            onClick={onConfirmPublish}
            disabled={!validation.canPublish || isPublishing}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <span>পাবলিশ হচ্ছে...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>নিশ্চিত ও সরাসরি লাইভ পাবলিশ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

