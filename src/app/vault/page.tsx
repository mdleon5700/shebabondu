'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  FileBox, 
  Upload, 
  Download, 
  CheckCircle2, 
  Camera, 
  PenTool, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Sparkles,
  FileText,
  User,
  ExternalLink,
  Award,
  Layers,
  Clock
} from 'lucide-react';
import { storage } from '@/lib/store';

export default function VaultPublicPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Resizer state
  const [activeResizerTab, setActiveResizerTab] = useState<'photo' | 'signature'>('photo');
  const [targetWidth, setTargetWidth] = useState(300);
  const [targetHeight, setTargetHeight] = useState(300);
  const [maxAllowedKb, setMaxAllowedKb] = useState(100);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resizedDataUrl, setResizedDataUrl] = useState<string | null>(null);
  const [resizedFileSizeKb, setResizedFileSizeKb] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const auth = storage.getAuth();
    if (auth.isLoggedIn && auth.role === 'candidate') {
      setIsLoggedIn(true);
      setUser(storage.getUser());
    }
  }, []);

  const handleSelectPreset = (preset: 'photo' | 'signature') => {
    setActiveResizerTab(preset);
    if (preset === 'photo') {
      setTargetWidth(300);
      setTargetHeight(300);
      setMaxAllowedKb(100);
    } else {
      setTargetWidth(300);
      setTargetHeight(80);
      setMaxAllowedKb(60);
    }
    if (imagePreview) {
      processImage(imagePreview, preset === 'photo' ? 300 : 300, preset === 'photo' ? 300 : 80);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র JPEG বা PNG ফরম্যাটের ছবি নির্বাচন করুন।');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImagePreview(src);
      processImage(src, targetWidth, targetHeight);
    };
    reader.readAsDataURL(file);
  };

  const processImage = (src: string, width: number, height: number) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.92;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      let base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
      let sizeInBytes = 4 * Math.ceil(base64Length / 3) * 0.5624896334383812;
      let sizeKb = Math.round(sizeInBytes / 1024);

      while (sizeKb > maxAllowedKb && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        sizeInBytes = 4 * Math.ceil(base64Length / 3) * 0.5624896334383812;
        sizeKb = Math.round(sizeInBytes / 1024);
      }

      setResizedDataUrl(dataUrl);
      setResizedFileSizeKb(sizeKb);
    };
  };

  const handleDownload = () => {
    if (!resizedDataUrl) return;
    const a = document.createElement('a');
    a.href = resizedDataUrl;
    a.download = activeResizerTab === 'photo' ? 'candidate-photo-300x300.jpg' : 'candidate-signature-300x80.jpg';
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ডিজিটাল ভল্ট ও ফটো রিসাইজার</span>
      </div>

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>১০০% এনক্রিপ্টেড ব্যক্তিগত সনদ ও তথ্য ভল্ট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            স্মার্ট ডকুমেন্ট ভল্ট ও টেলিটক ইমেজ রিসাইজার
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            সরকারি ও ব্যাংকের সকল পদের জন্য নির্ধারিত মাপে (ছবি: ৩০০×৩০০ ও স্বাক্ষর: ৩০০×৮০) তাত্ক্ষণিক রূপান্তর করুন এবং আপনার সার্টিফিকেট নিরাপদে সংরক্ষণ করুন।
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {isMounted && isLoggedIn ? (
            <Link
              href="/dashboard/vault"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FileBox className="w-4 h-4" />
              <span>আমার সংরক্ষিত ভল্টে প্রবেশ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/login?redirect=/dashboard/vault"
              className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>লগইন করে ভল্ট অ্যাক্সেস করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* 1. FREE ONLINE RESIZER TOOL (100% Client-side functional for anyone) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-700" />
              <span>টেলিটক অফিসিয়াল ফটো ও সিগনেচার রিসাইজার (Official Teletalk Resizer)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              কোনো সাইবার ক্যাফেতে না গিয়ে সরাসরি নিজের ডিভাইস থেকে সরকারি চাকরির আবেদনের সঠিক মাপ তৈরি করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectPreset('photo')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeResizerTab === 'photo'
                  ? 'bg-emerald-700 text-white shadow-sm font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>ছবি (300 × 300)</span>
            </button>
            <button
              onClick={() => handleSelectPreset('signature')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeResizerTab === 'signature'
                  ? 'bg-emerald-700 text-white shadow-sm font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>স্বাক্ষর (300 × 80)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Upload Area */}
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/20 space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto text-emerald-700">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-900">
                  {activeResizerTab === 'photo' ? 'পাসপোর্ট সাইজ ছবি আপলোড করুন' : 'স্বাক্ষরের ছবি আপলোড করুন'}
                </div>
                <div className="text-xs text-slate-500">
                  JPG, JPEG বা PNG ফাইল টেনে এনে ছাড়ুন অথবা ক্লিক করুন
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                লক্ষ্যমাত্রা: {targetWidth} × {targetHeight} পিক্সেল (&lt;{maxAllowedKb} KB)
              </div>
            </div>

            {selectedFile && (
              <div className="text-xs text-slate-500 flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                <span>মূল ফাইল: <strong>{selectedFile.name}</strong></span>
                <span>সাইজ: {Math.round(selectedFile.size / 1024)} KB</span>
              </div>
            )}
          </div>

          {/* Processed Output & Preview */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>লাইভ প্রসেসড প্রিভিউ</span>
            </h3>

            {resizedDataUrl ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border flex items-center justify-center shadow-inner overflow-hidden min-h-[140px]">
                  <img
                    src={resizedDataUrl}
                    alt="Resized output"
                    style={{
                      width: activeResizerTab === 'photo' ? '150px' : '200px',
                      height: activeResizerTab === 'photo' ? '150px' : '53px'
                    }}
                    className="border border-slate-300 shadow-sm object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border">
                    <span className="text-slate-400 block text-[10px]">আউটপুট রেজোলিউশন</span>
                    <strong className="text-emerald-700 font-bold">{targetWidth} × {targetHeight} pixels</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border">
                    <span className="text-slate-400 block text-[10px]">আউটপুট ফাইল সাইজ</span>
                    <strong className={`${(resizedFileSizeKb || 0) <= maxAllowedKb ? 'text-emerald-700' : 'text-rose-600'} font-bold`}>
                      {resizedFileSizeKb} KB ({resizedFileSizeKb! <= maxAllowedKb ? 'বৈধ' : 'বড়'})
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>ডাউনলোড করুন</span>
                  </button>

                  <Link
                    href={isLoggedIn ? '/dashboard/vault' : '/login?redirect=/dashboard/vault'}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ভল্টে সেভ করুন</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400 space-y-2">
                <FileBox className="w-8 h-8 mx-auto text-slate-300" />
                <p>ছবি বা স্বাক্ষর আপলোড করলে এখানে রিয়েল-টাইম কনভার্টেড প্রিভিউ দেখতে পাবেন।</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. THE 8 CORE OFFICIAL DOCUMENTS SUPPORTED BY VAULT */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>ভল্টে সংরক্ষিত মূল ৮টি অফিসিয়াল জাতীয় ও শিক্ষাগত প্রমাণপত্র</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              একবার আপলোড করুন, প্ল্যাটফর্মের মাধ্যমে যেকোনো সরকারি বা ব্যাংক জবে আবেদনের সময় স্বয়ংক্রিয়ভাবে সংযুক্ত হবে।
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold w-fit">
            জিরো ডাটা লিক গ্যারান্টি
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'প্রার্থীর NID / স্মার্ট কার্ড', desc: 'সামনে ও পেছনের ডিজিটাল স্ক্যান', icon: '🪪' },
            { title: 'পিতার জাতীয় পরিচয়পত্র', desc: 'টেলিটক ও পুলিশ ভেরিফিকেশনে আবশ্যক', icon: '👨‍🦳' },
            { title: 'মাতার জাতীয় পরিচয়পত্র', desc: 'মন্ত্রণালয় ও সরকারি ব্যাংকে আবশ্যক', icon: '👵' },
            { title: 'চেয়ারম্যান / নাগরিক সনদ', desc: 'ইউনিয়ন পরিষদ বা ওয়ার্ড কাউন্সিলর সনদ', icon: '🏛️' },
            { title: 'অনলাইন জন্ম নিবন্ধন', desc: '১৬/১৭ ডিজিটের ডিজিটাল বার্থ সনদ', icon: '📜' },
            { title: 'চারিত্রিক সনদপত্র', desc: '১ম শ্রেণির গেজেটেড অফিসার প্রত্যয়ন', icon: '🎖️' },
            { title: 'কোটা / বিশেষ সুবিধা সনদ', desc: 'মুক্তিযোদ্ধা, ক্ষুদ্র নৃগোষ্ঠী বা শারীরিক প্রতিবন্ধী', icon: '🌟' },
            { title: 'পেশাগত ও প্রশিক্ষণ সনদ', desc: 'কম্পিউটার, ড্রাইভিং লাইসেন্স বা ভাষা সনদ', icon: '💻' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2 hover:border-emerald-300 transition-all">
              <div className="text-2xl">{item.icon}</div>
              <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <Link
            href={isLoggedIn ? '/dashboard/vault' : '/login?redirect=/dashboard/vault'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <span>{isLoggedIn ? 'আমার ভল্টে ডকুমেন্টস ম্যানেজ করুন' : 'লগইন করে ভল্ট শুরু করুন'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
