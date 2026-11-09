'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileBox, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  PenTool, 
  FileText, 
  Trash2, 
  Sparkles, 
  ShieldCheck,
  Maximize2,
  Plus,
  FolderPlus,
  ExternalLink,
  Award,
  Briefcase,
  GraduationCap,
  X,
  Eye,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateDocument } from '@/lib/types';
import { useCandidateData } from '@/components/CandidateDataProvider';

export default function DocumentVaultPage() {
  const candidateData = useCandidateData();
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [activeResizerTab, setActiveResizerTab] = useState<'photo' | 'signature'>('photo');
  const [userProfile, setUserProfile] = useState<any>(storage.getUser());
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [docUploadToast, setDocUploadToast] = useState<string | null>(null);

  // Preview Modal State
  const [previewModalDoc, setPreviewModalDoc] = useState<{ title: string; url: string; mimeType?: string } | null>(null);

  // Custom Document Upload State
  const [showCustomDocModal, setShowCustomDocModal] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [customDocCategory, setCustomDocCategory] = useState('training');
  const [customDocFile, setCustomDocFile] = useState<File | null>(null);
  const [isUploadingCustomDoc, setIsUploadingCustomDoc] = useState(false);

  // Resizer state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resizedDataUrl, setResizedDataUrl] = useState<string | null>(null);
  const [resizedFileSizeKb, setResizedFileSizeKb] = useState<number | null>(null);
  const [targetWidth, setTargetWidth] = useState(300);
  const [targetHeight, setTargetHeight] = useState(300);
  const [maxAllowedKb, setMaxAllowedKb] = useState(100);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resizerSectionRef = useRef<HTMLDivElement | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setDocuments(candidateData.documents);
    if (candidateData.profile) setUserProfile(candidateData.profile);
  }, [candidateData.documents, candidateData.profile]);

  // Filter custom documents from full list
  const customDocumentsList = documents.filter(d => 
    d.type === 'custom' || 
    (!['photo', 'signature', 'nid_front', 'nid_back', 'father_nid', 'mother_nid', 'nagorik_certificate', 'birth_certificate', 'character_certificate', 'quota_certificate'].includes(d.type))
  );

  const handleUploadCustomDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDocFile) {
      alert('দয়া করে একটি ফাইল (PDF বা ছবি) নির্বাচন করুন।');
      return;
    }
    if (!customDocTitle.trim()) {
      alert('দয়া করে ডকুমেন্টের নাম বা শিরোনাম লিখুন।');
      return;
    }

    setIsUploadingCustomDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', customDocFile);
      formData.append('docType', 'custom');
      formData.append('docTitle', customDocTitle.trim());
      formData.append('category', customDocCategory);

      const res = await fetch('/api/candidate/upload-document', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      const data = await res.json();

      if (data.success && data.fileUrl) {
        await candidateData.refresh();

        setDocUploadToast('✓ "' + customDocTitle.trim() + '" সফলভাবে ভল্টে সংরক্ষিত হয়েছে!');
        setTimeout(() => setDocUploadToast(null), 4000);
        setShowCustomDocModal(false);
        setCustomDocTitle('');
        setCustomDocFile(null);
      } else {
        alert(data.error || 'আপলোড ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('আপলোড ত্রুটি: ' + (err.message || 'নেটওয়ার্ক সমস্যা'));
    } finally {
      setIsUploadingCustomDoc(false);
    }
  };

  const handleDeleteCustomDoc = async (id: string, title: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে "' + title + '" ভল্ট থেকে মুছে ফেলতে চান?')) return;
    await deleteDocument(id);
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch('/api/documents?id=' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'ডকুমেন্ট মুছে ফেলা যায়নি');
      await candidateData.refresh();
      setDocUploadToast('ডকুমেন্ট সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setDocUploadToast(null), 4000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'ডকুমেন্ট মুছে ফেলা যায়নি');
    }
  };

  const handleUploadOfficialDoc = async (e: React.ChangeEvent<HTMLInputElement>, docType: string, docTitle: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocType(docType);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      formData.append('docTitle', docTitle);
      const existing = documents.find(document => document.type === docType);
      if (existing) formData.append('replaceDocId', existing.id);

      const res = await fetch('/api/candidate/upload-document', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      const data = await res.json();

      if (data.success && data.fileUrl) {
        await candidateData.refresh();

        setDocUploadToast(docTitle + ' সফলভাবে আপলোড হয়েছে; অ্যাডমিন যাচাইয়ের অপেক্ষায় রয়েছে।');
        setTimeout(() => setDocUploadToast(null), 4000);
      } else {
        alert(data.error || 'আপলোড ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('আপলোড ত্রুটি: ' + (err.message || 'নেটওয়ার্ক সমস্যা'));
    } finally {
      setUploadingDocType(null);
      e.target.value = '';
    }
  };

  const handleDeleteOfficialDoc = async (docType: string, docTitle: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${docTitle}" ভল্ট থেকে মুছে ফেলতে চান?`)) return;
    const existing = documents.find(d => d.type === docType);
    if (existing) {
      await deleteDocument(existing.id);
    } else {
      const fieldMap: Record<string, string> = {
        photo: 'photoUrl',
        signature: 'signatureUrl',
        nid_front: 'nidFrontUrl',
        nid_back: 'nidBackUrl',
        father_nid: 'fatherNidUrl',
        mother_nid: 'motherNidUrl',
        nagorik_certificate: 'nagorikCertificateUrl',
        birth_certificate: 'birthCertificateUrl',
        character_certificate: 'characterCertificateUrl',
        quota_certificate: 'quotaCertificateUrl',
      };
      const key = fieldMap[docType];
      if (key) {
        try {
          const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            body: JSON.stringify({ [key]: '' })
          });
          if (res.ok) {
            await candidateData.refresh();
            setDocUploadToast(`✓ ${docTitle} সফলভাবে মুছে ফেলা হয়েছে।`);
            setTimeout(() => setDocUploadToast(null), 4000);
          }
        } catch {
          alert('মুছে ফেলা ব্যর্থ হয়েছে');
        }
      }
    }
  };

  // Set preset dimensions
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
    // Re-process if image loaded
    if (imagePreview) {
      processImage(imagePreview, 300, preset === 'photo' ? 300 : 80);
    }
  };

  const scrollToResizer = (preset: 'photo' | 'signature') => {
    handleSelectPreset(preset);
    if (resizerSectionRef.current) {
      resizerSectionRef.current.scrollIntoView({ behavior: 'smooth' });
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

  // Canvas processing & resizing
  const processImage = (src: string, width: number, height: number) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw with high quality smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG with quality adjustment
      let quality = 0.92;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      // Estimate size in KB
      let base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
      let sizeInBytes = 4 * Math.ceil(base64Length / 3) * 0.5624896334383812;
      let sizeKb = Math.round(sizeInBytes / 1024);

      // Compress if larger than max
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

  const handleSaveToVault = async () => {
    if (!resizedDataUrl || uploadingDocType) return;
    setUploadingDocType(activeResizerTab);
    try {
      const blob = await fetch(resizedDataUrl).then(response => response.blob());
      const formData = new FormData();
      formData.append('file', blob, activeResizerTab + '.jpg');
      formData.append('docType', activeResizerTab);
      formData.append('docTitle', activeResizerTab === 'photo' ? 'প্রার্থীর ছবি' : 'প্রার্থীর স্বাক্ষর');
      const existing = documents.find(document => document.type === activeResizerTab);
      if (existing) formData.append('replaceDocId', existing.id);
      const response = await fetch('/api/candidate/upload-document', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'ডকুমেন্ট সংরক্ষণ ব্যর্থ হয়েছে');
      await candidateData.refresh();
      setDocUploadToast('✓ ' + (activeResizerTab === 'photo' ? 'ছবি' : 'স্বাক্ষর') + ' সার্ভার ভল্টে সংরক্ষিত হয়েছে; অ্যাডমিন যাচাইয়ের অপেক্ষায় রয়েছে।');
      setTimeout(() => setDocUploadToast(null), 4000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'ডকুমেন্ট সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    await deleteDocument(id);
  };

  if (!isMounted) {
    return (
      <div className="space-y-8 max-w-6xl animate-pulse p-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-100 rounded-2xl mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Official 10-slot standard configuration
  const officialDocumentSlots = [
    {
      type: 'photo',
      title: 'প্রার্থীর ছবি (টেলিটক স্ট্যান্ডার্ড - ৩০০×৩০০)',
      desc: 'পাসপোর্ট সাইজ রঙিন ছবি, ১০০ KB এর কম',
      url: userProfile?.photoUrl,
      icon: '📷',
      isImagePreset: true
    },
    {
      type: 'signature',
      title: 'প্রার্থীর স্বাক্ষর (টেলিটক স্ট্যান্ডার্ড - ৩০০×৮০)',
      desc: 'স্বাক্ষরের ছবি, ৬০ KB এর কম',
      url: userProfile?.signatureUrl,
      icon: '✍️',
      isImagePreset: true
    },
    {
      type: 'nid_front',
      title: 'প্রার্থীর NID (সামনের অংশ)',
      desc: 'জাতীয় পরিচয়পত্রের সামনের ছবি বা স্ক্যান কপি',
      url: userProfile?.nidFrontUrl,
      icon: '🪪'
    },
    {
      type: 'nid_back',
      title: 'প্রার্থীর NID (পেছনের অংশ)',
      desc: 'জাতীয় পরিচয়পত্রের পেছনের ঠিকানা অংশের ছবি',
      url: userProfile?.nidBackUrl,
      icon: '🪪'
    },
    {
      type: 'father_nid',
      title: 'পিতার জাতীয় পরিচয়পত্র (Father NID)',
      desc: 'বাবার NID কার্ড বা স্মার্ট কার্ডের ছবি',
      url: userProfile?.fatherNidUrl || (userProfile?.fatherNid?.startsWith('http') || userProfile?.fatherNid?.startsWith('/api') ? userProfile?.fatherNid : null),
      icon: '👨‍🦳'
    },
    {
      type: 'mother_nid',
      title: 'মাতার জাতীয় পরিচয়পত্র (Mother NID)',
      desc: 'মায়ের NID কার্ড বা স্মার্ট কার্ডের ছবি',
      url: userProfile?.motherNidUrl || (userProfile?.motherNid?.startsWith('http') || userProfile?.motherNid?.startsWith('/api') ? userProfile?.motherNid : null),
      icon: '👵'
    },
    {
      type: 'nagorik_certificate',
      title: 'নাগরিক সনদপত্র (চেয়ারম্যান সার্টিফিকেট)',
      desc: 'ইউনিয়ন পরিষদ চেয়ারম্যান বা ওয়ার্ড কাউন্সিলর সনদ',
      url: userProfile?.nagorikCertificateUrl,
      icon: '🏛️'
    },
    {
      type: 'birth_certificate',
      title: 'অনলাইন জন্ম নিবন্ধন সনদ (ঐচ্ছিক)',
      desc: '১৭ ডিজিটের ডিজিটাল বার্থ সার্টিফিকেট',
      url: userProfile?.birthCertificateUrl,
      icon: '📜'
    },
    {
      type: 'character_certificate',
      title: 'চারিত্রিক সনদপত্র (Character Certificate)',
      desc: 'সর্বশেষ শিক্ষা প্রতিষ্ঠান বা ১ম শ্রেণির গেজেটেড অফিসার',
      url: userProfile?.characterCertificateUrl,
      icon: '🎖️'
    },
    {
      type: 'quota_certificate',
      title: 'কোটা / বিশেষ সুবিধা সনদ (যদি থাকে)',
      desc: 'মুক্তিযোদ্ধা, ক্ষুদ্র নৃ-গোষ্ঠী বা প্রতিবন্ধী সনদ',
      url: userProfile?.quotaCertificateUrl,
      icon: '🌟'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>১০০% এনক্রিপ্টেড ব্যক্তিগত ভল্ট (AES-256)</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileBox className="w-6 h-6 text-emerald-700" />
          <span>স্মার্ট ডকুমেন্ট ভল্ট ও ইমেজ রিসাইজার</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          সরকারি বা ব্যাংক চাকরির জন্য নির্ধারিত মাপে (ছবি: ৩০০×৩০০ এবং স্বাক্ষর: ৩০০×৮০) ছবি রিসাইজ করুন এবং সার্টিফিকেট নিরাপদে সংরক্ষণ করুন।
        </p>
      </div>

      {/* Toast Alert */}
      {docUploadToast && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold animate-bounce shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{docUploadToast}</span>
        </div>
      )}

      {/* 1. Official Identity & Verification Documents Vault (10 Standard Slots) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>মূল জাতীয় পরিচয়পত্র ও প্রমাণপত্র ভল্ট (১০টি অফিসিয়াল স্লট)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রার্থীর NID, ছবি, স্বাক্ষর, পিতা-মাতার আইডি কার্ড, চেয়ারম্যান সার্টিফিকেট ও অন্যান্য ডকুমেন্টস আপলোড করুন। অ্যাডমিন প্যানেলে এগুলো সরাসরি ভেরিফাই করা হবে।
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl w-fit">
            এনক্রিপ্টেড ও সুরক্ষিত
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {officialDocumentSlots.map((item) => {
            const matchedDoc = documents.find(d => d.type === item.type);
            const resolvedUrl = item.url || matchedDoc?.fileUrl || matchedDoc?.dataUrl;
            const isVerified = matchedDoc?.isVerified;
            const isRejected = matchedDoc?.verificationStatus === 'REJECTED';
            const isCorrection = matchedDoc?.verificationStatus === 'NEEDS_CORRECTION';

            return (
              <div
                key={item.type}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  resolvedUrl
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {resolvedUrl ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVerified
                            ? 'text-emerald-800 bg-emerald-200 border border-emerald-300'
                            : isRejected
                            ? 'text-rose-700 bg-rose-100 border border-rose-200'
                            : isCorrection
                            ? 'text-amber-700 bg-amber-100 border border-amber-200'
                            : 'text-emerald-700 bg-emerald-100'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {isVerified ? 'যাচাইকৃত' : isRejected ? 'বাতিল' : isCorrection ? 'সংশোধন' : 'সংরক্ষিত'}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border">
                          বাকি
                        </span>
                      )}

                      {resolvedUrl && (
                        <button
                          type="button"
                          onClick={() => handleDeleteOfficialDoc(item.type, item.title)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {resolvedUrl && (
                    <div className="mt-3 p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPreviewModalDoc({ title: item.title, url: resolvedUrl, mimeType: matchedDoc?.mimeType })}
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer truncate"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>প্রিভিউ দেখুন</span>
                      </button>
                      <a
                        href={resolvedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-500 hover:text-emerald-800 flex items-center gap-0.5"
                      >
                        <span>ডাউনলোড</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  {item.isImagePreset && (
                    <button
                      type="button"
                      onClick={() => scrollToResizer(item.type as 'photo' | 'signature')}
                      className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3 h-3 text-emerald-700" />
                      <span>টেলিটক রিসাইজারে মাপ ঠিক করুন</span>
                    </button>
                  )}

                  <label className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm ${
                    resolvedUrl
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}>
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingDocType === item.type
                        ? 'আপলোড হচ্ছে...'
                        : resolvedUrl
                        ? 'নতুন ফাইল পরিবর্তন করুন'
                        : 'ফাইল আপলোড করুন'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                      disabled={uploadingDocType === item.type}
                      onChange={(e) => handleUploadOfficialDoc(e, item.type, item.title)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Custom & Additional Certificates Vault (User-Defined Custom Documents) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-emerald-700" />
              <span>কাস্টম ও পেশাগত প্রমাণপত্র ভল্ট (Custom & Professional Documents)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              কম্পিউটার প্রশিক্ষণ, ড্রাইভিং লাইসেন্স, অভিজ্ঞতা সনদ, আইইএলটিএস বা যেকোনো কাস্টম সার্টিফিকেট আপনার পছন্দমতো নামে আপলোড করুন। চাকরির আবেদনের সময় এগুলো ইচ্ছামতো যুক্ত করতে পারবেন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomDocModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন কাস্টম ডকুমেন্ট যোগ করুন</span>
          </button>
        </div>

        {customDocumentsList.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-900">কোনো কাস্টম ডকুমেন্ট যোগ করা হয়নি</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                আপনার কোনো কম্পিউটার প্রশিক্ষণ, অভিজ্ঞতা সনদ বা অন্যান্য প্রয়োজনীয় সার্টিফিকেট থাকলে এখনই আপনার কাস্টম ভল্টে সেভ করে রাখুন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCustomDocModal(true)}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>প্রথম কাস্টম ডকুমেন্ট যোগ করুন</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customDocumentsList.map((doc) => {
              const fileLink = doc.dataUrl || doc.fileUrl || (doc as any).url;
              return (
                <div
                  key={doc.id}
                  data-testid="custom-doc-card"
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        {doc.category === 'training' ? (
                          <Award className="w-5 h-5" />
                        ) : doc.category === 'experience' ? (
                          <Briefcase className="w-5 h-5" />
                        ) : doc.category === 'certificate' ? (
                          <GraduationCap className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate" title={doc.title}>
                          {doc.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                            {doc.category === 'training' ? 'প্রশিক্ষণ' : doc.category === 'experience' ? 'অভিজ্ঞতা' : doc.category === 'license' ? 'লাইসেন্স' : doc.category === 'language' ? 'ভাষা' : 'সার্টিফিকেট'}
                          </span>
                          <span className="text-[10px] text-slate-400">{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      data-testid="delete-custom-doc-btn"
                      onClick={() => handleDeleteCustomDoc(doc.id, doc.title)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>সাইজ: <strong>{doc.fileSize || 'PDF/Image'}</strong></span>
                    <span className="text-emerald-700 font-bold text-[10px]">✓ সংরক্ষিত</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {fileLink && (
                      <button
                        type="button"
                        onClick={() => setPreviewModalDoc({ title: doc.title, url: fileLink, mimeType: doc.mimeType })}
                        className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>প্রিভিউ</span>
                      </button>
                    )}

                    {fileLink && (
                      <a
                        href={fileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>ডাউনলোড</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Client-side Interactive Canvas Image Resizer (Teletalk Engine) */}
      <div ref={resizerSectionRef} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>টেলিটক অফিসিয়াল ফটো ও সিগনেচার রিসাইজার</span>
            </h2>
            <p className="text-xs text-slate-500">কোনো সাইবার ক্যাফেতে যাওয়ার প্রয়োজন নেই, ঘরে বসেই নিখুঁত মাপ তৈরি করুন।</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectPreset('photo')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeResizerTab === 'photo'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>ছবি (300 × 300)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('signature')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeResizerTab === 'signature'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>স্বাক্ষর (300 × 80)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Upload Area */}
          <div className="space-y-4">
            <input
              type="file"
              data-testid="resizer-file-input"
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
                লক্ষ্যমাত্রা: {targetWidth} × {targetHeight} px (&lt;{maxAllowedKb} KB)
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
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>ডাউনলোড করুন</span>
                  </button>
                  <button
                    type="button"
                    data-testid="resizer-save-btn"
                    onClick={handleSaveToVault}
                    disabled={uploadingDocType === activeResizerTab}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{uploadingDocType === activeResizerTab ? 'সেভ হচ্ছে...' : 'ভল্টে সেভ করুন'}</span>
                  </button>
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

      {/* 4. Stored Document Vault Cards (Repository) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>সংরক্ষিত ডকুমেন্টস ({documents.length} টি)</span>
          </h2>
          <span className="text-xs text-slate-500">শুধুমাত্র আপনি এই ফাইলগুলো দেখতে পারেন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const fileLink = doc.dataUrl || doc.fileUrl || (doc as any).url;
            return (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        {doc.type === 'photo' ? (
                          <Camera className="w-5 h-5" />
                        ) : doc.type === 'signature' ? (
                          <PenTool className="w-5 h-5" />
                        ) : doc.category === 'training' ? (
                          <Award className="w-5 h-5" />
                        ) : doc.category === 'experience' ? (
                          <Briefcase className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate" title={doc.title}>
                          {doc.title}
                        </h4>
                        <span className="text-[11px] text-slate-400">{doc.uploadDate}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>সাইজ: <strong>{doc.fileSize}</strong></span>
                    {doc.dimensions && <span>মাপ: {doc.dimensions}</span>}
                    <span className={`font-semibold ${doc.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {doc.isVerified ? '✓ যাচাইকৃত' : doc.verificationStatus === 'REJECTED' ? 'বাতিল' : doc.verificationStatus === 'NEEDS_CORRECTION' ? 'সংশোধন' : 'অপেক্ষমাণ'}
                    </span>
                  </div>

                  {fileLink && (doc.mimeType?.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(doc.fileName || fileLink)) && (
                    <div className="mt-3 h-20 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border">
                      <img src={fileLink} alt="" className="max-h-full object-contain" />
                    </div>
                  )}
                </div>

                {fileLink && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalDoc({ title: doc.title, url: fileLink, mimeType: doc.mimeType })}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>প্রিভিউ</span>
                    </button>
                    <a
                      href={fileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ডাউনলোড</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewModalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm text-slate-900 truncate">{previewModalDoc.title}</h3>
                  <p className="text-[11px] text-slate-500">সুরক্ষিত ক্লাউড ভল্ট ফাইল প্রিভিউ</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewModalDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors"
                  title="নতুন ট্যাবে খুলুন"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-auto border border-slate-200">
              {previewModalDoc.url.match(/\.(png|jpe?g|webp)$/i) || previewModalDoc.url.startsWith('data:image/') || previewModalDoc.mimeType?.startsWith('image/') ? (
                <img
                  src={previewModalDoc.url}
                  alt={previewModalDoc.title}
                  className="max-h-[50vh] max-w-full object-contain rounded-xl shadow-xs"
                />
              ) : previewModalDoc.url.endsWith('.pdf') || previewModalDoc.mimeType === 'application/pdf' ? (
                <iframe
                  src={previewModalDoc.url}
                  title={previewModalDoc.title}
                  className="w-full h-[50vh] rounded-xl border border-slate-200"
                />
              ) : (
                <div className="text-center py-10 space-y-3">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">এই ফাইলটি সরাসরি প্রিভিউ করার জন্য উপযুক্ত নয়।</p>
                  <a
                    href={previewModalDoc.url}
                    download
                    className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>ডাউনলোড করে দেখুন</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                নিরাপত্তা: AES-256 বিট এনক্রিপশনে সংরক্ষিত
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalDoc.url}
                  download
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM DOCUMENT MODAL */}
      {showCustomDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-5">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">নতুন কাস্টম ডকুমেন্ট আপলোড</h3>
                  <p className="text-[11px] text-slate-500">আপনার পছন্দের শিরোনাম দিয়ে যেকোনো সার্টিফিকেট ভল্টে যুক্ত করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomDocModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadCustomDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ডকুমেন্টের নাম বা শিরোনাম <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  placeholder="যেমন: কম্পিউটার প্রশিক্ষণ সনদ (৬ মাস), ড্রাইভিং লাইসেন্স, ইত্যাদি"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ডকুমেন্টের ক্যাটাগরি / ধরন
                </label>
                <select
                  value={customDocCategory}
                  onChange={(e) => setCustomDocCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 text-xs text-slate-900 font-medium bg-white"
                >
                  <option value="training">💻 কম্পিউটার ও প্রযুক্তিগত প্রশিক্ষণ (Training)</option>
                  <option value="certificate">📜 শিক্ষাগত মূল বা সাময়িক সনদ (Academic Certificate)</option>
                  <option value="experience">💼 কর্ম অভিজ্ঞতা ও প্রশংসাপত্র (Work Experience)</option>
                  <option value="license">🚗 ড্রাইভিং বা পেশাদার লাইসেন্স (Driving License)</option>
                  <option value="language">🌐 ভাষা দক্ষতা / IELTS স্কোরকার্ড (Language Test)</option>
                  <option value="other">📁 অন্যান্য প্রয়োজনীয় সরকারি/বেসরকারি প্রমাণপত্র</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ফাইল নির্বাচন করুন (PDF, JPG, PNG - সর্বোচ্চ 10MB) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="file"
                  data-testid="custom-doc-file-input"
                  required
                  accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => setCustomDocFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                />
                {customDocFile && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    নির্বাচিত: {customDocFile.name} ({Math.round(customDocFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCustomDocModal(false)}
                  disabled={isUploadingCustomDoc}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isUploadingCustomDoc}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isUploadingCustomDoc ? 'আপলোড হচ্ছে...' : '✓ ভল্টে সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
