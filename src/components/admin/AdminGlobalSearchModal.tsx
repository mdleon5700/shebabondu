'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Briefcase, FileText, DollarSign, History, ChevronRight, Loader2 } from 'lucide-react';
import { AdminGlobalSearchResult } from '@/lib/governance/types';

interface AdminGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, detailId?: string) => void;
}

export default function AdminGlobalSearchModal({
  isOpen,
  onClose,
  onNavigate
}: AdminGlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminGlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Live search debounced
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '') : '';
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cs_session_token') || '') : '';
        const headers: Record<string, string> = {};
        if (pin) headers['x-admin-secret'] = pin;
        if (token) headers['authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/admin/governance/search?q=${encodeURIComponent(query.trim())}`, {
          headers
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const item = results[selectedIndex];
        onNavigate(item.targetTab, item.detailParam);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onNavigate, onClose]);

  if (!isOpen) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'candidate':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'expense':
        return <DollarSign className="w-4 h-4 text-rose-600" />;
      case 'audit_log':
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'candidate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'job':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'draft':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'expense':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'audit_log':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 p-4 animate-fadeIn"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="প্রার্থী, সার্কুলার, খসড়া, ব্যয় বা অডিট হিস্ট্রি খুঁজুন..."
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/60 rounded border border-slate-300">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
            title="সার্চ বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 flex-1 max-h-[60vh]">
          {query.trim().length >= 2 && results.length === 0 && !isLoading && (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">
              <p className="font-bold text-slate-700 text-sm mb-1">কোনো ফলাফল পাওয়া যায়নি</p>
              <p>"{query}" সম্পর্কিত কোনো প্রার্থী, সার্কুলার বা ব্যয় রেকর্ড নেই।</p>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="p-6 text-center text-slate-400 text-xs space-y-2">
              <div className="font-bold text-slate-600">দ্রুত কমান্ড প্যালেট ও সার্বজনীন সার্চ</div>
              <p className="text-[11px]">কমপক্ষে ২টি অক্ষর লিখে প্রার্থীর নাম, ফোন নম্বর, সার্কুলারের শিরোনাম বা ব্যয় রেকর্ড খুঁজুন।</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600">প্রার্থী ডিরেক্টরি</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600">চাকরি সার্কুলার</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600">খসড়া কিউ</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600">পরিচালন ব্যয়</span>
              </div>
            </div>
          )}

          {results.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={`${item.type}_${item.id}_${index}`}
                type="button"
                onClick={() => {
                  onNavigate(item.targetTab, item.detailParam);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full p-3 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected ? 'bg-emerald-50/80 text-emerald-950' : 'hover:bg-slate-50 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs shrink-0">
                    {getIconForType(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate text-slate-900">{item.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getBadgeStyle(item.type)}`}>
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                  <span className="text-[10px] font-bold hidden sm:inline-block text-slate-400">খুলুন</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>সেন্ট্রালাইজড অ্যাডমিন সার্চ • চাকরি সেবা গভর্নেন্স</span>
          </div>
          <div className="flex items-center gap-2">
            <span>নেভিগেট: <kbd className="font-mono font-bold">↑</kbd> <kbd className="font-mono font-bold">↓</kbd></span>
            <span>সিলেক্ট: <kbd className="font-mono font-bold">Enter</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}
