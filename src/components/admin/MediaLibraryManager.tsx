'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  FileText,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  X,
  RefreshCw,
  Plus,
  AlertTriangle,
  Eye,
  ShieldCheck,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { MediaItem } from '@/lib/types';

const ADMIN_REQ_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
};

export default function MediaLibraryManager() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document'>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadOriginalName, setUploadOriginalName] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadMime, setUploadMime] = useState('image/png');
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit Metadata Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Action Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media', { headers: ADMIN_REQ_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data.media || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadOriginalName.trim()) {
      setUploadError('ফাইলের নাম এবং সরাসরি ইমেজ/ফাইল লিঙ্ক উভয়ই আবশ্যক');
      return;
    }

    setIsSubmittingUpload(true);
    setUploadError(null);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          originalName: uploadOriginalName.trim(),
          filename: uploadOriginalName.trim().replace(/\s+/g, '_'),
          url: uploadUrl.trim(),
          mimeType: uploadMime,
          size: 154000,
          altText: uploadAltText.trim() || uploadOriginalName.trim(),
          caption: uploadCaption.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'আপলোড ব্যর্থ হয়েছে');
      }

      setFeedbackMsg({ type: 'success', text: 'নতুন মিডিয়া ফাইল সফলভাবে সংযুক্ত করা হয়েছে!' });
      setIsUploadModalOpen(false);
      setUploadUrl('');
      setUploadOriginalName('');
      setUploadAltText('');
      setUploadCaption('');
      fetchMedia();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSavingEdit(true);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          id: editingItem.id,
          altText: editAltText.trim(),
          caption: editCaption.trim()
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'হালনাগাদ ব্যর্থ');
      }

      setFeedbackMsg({ type: 'success', text: 'মিডিয়া মেটাডাটা ও Alt টেক্সট সফলভাবে সংরক্ষিত হয়েছে!' });
      setEditingItem(null);
      fetchMedia();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteMedia = async (item: MediaItem) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${item.originalName}" ফাইলটি মুছে ফেলতে চান? এটি সক্রিয় সার্কুলারে ব্যবহৃত হলে মোছা যাবে না।`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/media?id=${item.id}`, {
        method: 'DELETE',
        headers: ADMIN_REQ_HEADERS
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ফাইল মোছা ব্যর্থ');
      }

      setFeedbackMsg({ type: 'success', text: 'মিডিয়া ফাইল সফলভাবে মুছে ফেলা হয়েছে।' });
      if (selectedItem?.id === item.id) setSelectedItem(null);
      fetchMedia();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const filteredMedia = useMemo(() => {
    return mediaItems.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        m.originalName.toLowerCase().includes(q) ||
        (m.altText && m.altText.toLowerCase().includes(q)) ||
        (m.caption && m.caption.toLowerCase().includes(q));

      const matchesType = typeFilter === 'all' ||
        (typeFilter === 'image' && m.mimeType.startsWith('image/')) ||
        (typeFilter === 'document' && (m.mimeType.includes('pdf') || m.mimeType.includes('doc')));

      return matchesSearch && matchesType;
    });
  }, [mediaItems, searchQuery, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
              <FolderOpen className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-black text-slate-900">মিডিয়া লাইব্রেরি ও ফাইল ম্যানেজার</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                সার্কুলার ব্যানার, প্রতিষ্ঠানের লোগো, অফিসিয়াল মনোগ্রাম ও ডকুমেন্টের কেন্দ্রীয় স্টোরেজ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchMedia}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>নতুন মিডিয়া আপলোড</span>
          </button>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="ফাইলের নাম বা Alt টেক্সট খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${typeFilter === 'all' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-600'}`}
            >
              সকল ({mediaItems.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('image')}
              className={`px-3 py-1 rounded-lg transition-all ${typeFilter === 'image' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-600'}`}
            >
              ইমেজ
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('document')}
              className={`px-3 py-1 rounded-lg transition-all ${typeFilter === 'document' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-600'}`}
            >
              ডকুমেন্ট / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid Cards */}
      {loading ? (
        <div className="py-16 text-center text-xs font-bold text-slate-500 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600" />
          <p>মিডিয়া লাইব্রেরি লোড হচ্ছে...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-black text-sm text-slate-800">কোনো মিডিয়া ফাইল পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            সার্কুলারের জন্য অফিসিয়াল লোগো ও ইমেজ আপলোড করতে "নতুন মিডিয়া আপলোড" বাটনে ক্লিক করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                {item.mimeType.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.altText || item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="p-4 text-center">
                    <FileText className="w-10 h-10 text-rose-500 mx-auto" />
                    <span className="text-[10px] font-bold text-slate-500 mt-1 block uppercase">PDF DOC</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-colors"
                    title="সম্পূর্ণ ফাইল দেখুন"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      setEditAltText(item.altText || '');
                      setEditCaption(item.caption || '');
                    }}
                    className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-colors"
                    title="Alt টেক্সট ও ক্যাপশন সম্পাদনা"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(item)}
                    className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition-colors"
                    title="ফাইল মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Media Card Info */}
              <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900 truncate" title={item.originalName}>
                    {item.originalName}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate" title={item.altText}>
                    Alt: {item.altText || 'অনুল্লিখিত'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{(item.size / 1024).toFixed(0)} KB</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.url, item.id)}
                    className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                    title="URL কপি করুন"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === item.id ? 'কপি হয়েছে' : 'লিংক'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-700" />
                <span>নতুন মিডিয়া ফাইল সংযুক্তকরণ</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ফাইলের নাম ও পরিচয় *</label>
                <input
                  type="text"
                  placeholder="যেমন: বাংলাদেশ রেলওয়ে লোগো.png"
                  value={uploadOriginalName}
                  onChange={(e) => setUploadOriginalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">সরাসরি মিডিয়া / ইমেজ URL *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... বা /uploads/..."
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ফাইল টাইপ (MIME)</label>
                  <select
                    value={uploadMime}
                    onChange={(e) => setUploadMime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600"
                  >
                    <option value="image/png">PNG ইমেজ</option>
                    <option value="image/jpeg">JPEG / JPG ইমেজ</option>
                    <option value="image/webp">WEBP আধুনিক ইমেজ</option>
                    <option value="image/svg+xml">SVG ভেক্টর</option>
                    <option value="application/pdf">PDF ডকুমেন্ট</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alt টেক্সট (SEO)</label>
                  <input
                    type="text"
                    placeholder="ছবির বর্ণনা"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ক্যাপশন / ব্যবহারের ক্ষেত্র</label>
                <input
                  type="text"
                  placeholder="যেমন: রেলওয়ে সার্কুলার ব্যানার"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUpload}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingUpload ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ALT TEXT / METADATA MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-xs text-slate-900">মিডিয়া মেটাডাটা হালনাগাদ</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alt টেক্সট (অ্যাক্সেসিবিলিটি ও এসইও)</label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ক্যাপশন</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-4 py-1.5 bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1"
                >
                  {isSavingEdit ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>হালনাগাদ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
