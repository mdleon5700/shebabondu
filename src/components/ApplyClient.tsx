'use client';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';

import { emptyCandidateProfile } from '@/lib/candidate-defaults';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  CreditCard,
  AlertCircle,
  Clock,
  Sparkles,
  Smartphone,
  Tag,
  Gift,
  Ticket,
  Percent,
  RefreshCw,
  X,
  Check,
  Briefcase,
  GraduationCap,
  FolderCheck,
  FileText,
  Award,
  ExternalLink
} from 'lucide-react';

import { storage } from '@/lib/store';
import { FinancialSnapshot, JobPosition, CandidateDocument, EducationRecord } from '@/lib/types';

interface ApplyClientProps {
  initialJob: any;
}

function ApplyFormContent({ initialJob }: ApplyClientProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = (params?.id as string) || initialJob?.id;
  const [job, setJob] = useState<any>(initialJob);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data && data.profile) {
          if (data.profile.name) setCandidateName(data.profile.name);
          if (data.profile.phone) setSenderPhone(data.profile.phone);
          if (data.profile.district) setCandidateDistrict(data.profile.district);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/jobs/${jobId}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.success && data.job) {
          setJob(data.job);
        }
      })
      .catch(() => {});
  }, [jobId]);

  // Positions available for this circular
  const positions: JobPosition[] = useMemo(() => {
    return job?.positions && job.positions.length > 0
      ? job.positions
      : [{
          title: job?.title || 'আবেদনের পদ',
          grade: job?.grade || '',
          posts: job?.totalPosts || 1,
          salary: job?.salary || '',
          minEducation: job?.minEducation || '',
          govtFee: job?.govtFee || 200
        }];
  }, [job]);

  // Read initial position from URL query param if present
  const initialPositionParam = searchParams.get('position');
  const initialPosition = useMemo(() => {
    if (initialPositionParam) {
      const match = positions.find(
        (p) => p.title.toLowerCase() === initialPositionParam.toLowerCase() || p.title.includes(initialPositionParam)
      );
      if (match) return match;
    }
    return positions[0];
  }, [positions, initialPositionParam]);

  const [selectedPosition, setSelectedPosition] = useState<JobPosition>(initialPosition);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Wallet'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [userProfile, setUserProfile] = useState<any>(emptyCandidateProfile);
  const [vaultDocs, setVaultDocs] = useState<CandidateDocument[]>([]);
  const [selectedEduLevels, setSelectedEduLevels] = useState<string[]>(['SSC', 'HSC', 'Honours', 'Masters', 'Diploma']);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const [senderPhone, setSenderPhone] = useState(emptyCandidateProfile.phone);
  const [candidateName, setCandidateName] = useState(emptyCandidateProfile.name);
  const [candidateDistrict, setCandidateDistrict] = useState(emptyCandidateProfile.district);
  const [useWalletSplit, setUseWalletSplit] = useState(false);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = storage.getUser();
      if (u) {
        setUserProfile(u);
        if (u.name) setCandidateName(u.name);
        if (u.phone) setSenderPhone(u.phone);
        if (u.district) setCandidateDistrict(u.district);
        if (u.education && u.education.length > 0) {
          setSelectedEduLevels(u.education.map((e: any) => e.level));
        }
      }

      fetch('/api/profile')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.user) {
            setUserProfile(d.user);
            if (d.user.name) setCandidateName(d.user.name);
            if (d.user.phone) setSenderPhone(d.user.phone);
            if (d.user.district) setCandidateDistrict(d.user.district);
            if (d.user.education && d.user.education.length > 0) {
              setSelectedEduLevels(d.user.education.map((e: any) => e.level));
            }
          }
        })
        .catch(() => {});
      const localDocs = storage.getDocuments();
      setVaultDocs(localDocs);
      if (localDocs.length > 0) {
        setSelectedDocIds(localDocs.map(d => d.id));
      }

      fetch('/api/documents')
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.documents) && d.documents.length > 0) {
            setVaultDocs(d.documents);
            setSelectedDocIds(d.documents.map((x: any) => x.id));
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleToggleEduLevel = (level: string) => {
    if (selectedEduLevels.includes(level)) {
      if (selectedEduLevels.length === 1) {
        alert('অন্তত একটি শিক্ষাগত সনদ নির্বাচন থাকতে হবে।');
        return;
      }
      setSelectedEduLevels(prev => prev.filter(l => l !== level));
    } else {
      setSelectedEduLevels(prev => [...prev, level]);
    }
  };

  const handlePaymentScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', 'payment_proof');
      formData.append('docTitle', 'পেমেন্ট সাকসেস স্ক্রিনশট');
      const res = await fetch('/api/candidate/upload-document', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setPaymentScreenshotUrl(data.fileUrl);
        alert('পেমেন্ট স্ক্রিনশট সফলভাবে সংযুক্ত হয়েছে!');
      } else {
        alert(data.error || 'আপলোড ব্যর্থ হয়েছে');
      }
    } catch {
      alert('স্ক্রিনশট আপলোডে সমস্যা হয়েছে');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };



  const handleToggleDocId = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      setSelectedDocIds(prev => prev.filter(id => id !== docId));
    } else {
      setSelectedDocIds(prev => [...prev, docId]);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isExpired = Boolean(
    (job && CentralDeadlineEngine.evaluateDeadline(job).isClosed) ||
    job?.status === 'EXPIRED' ||
    job?.status === 'CLOSED' ||
    (job?.deadline && (job.deadline.includes('সমাপ্ত') || job.deadline.includes('শেষ')))
  );
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');

  // Discount & Coupon State
  const [availableOffers, setAvailableOffers] = useState<{ coupons: any[]; raffleCampaign: any | null } | null>(null);
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [appliedSnapshot, setAppliedSnapshot] = useState<FinancialSnapshot | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Authoritative server-side values from snapshot with base fallbacks
  const baseGovtFee = selectedPosition.govtFee ?? job.govtFee ?? 200;
  const effectiveGovtFee = appliedSnapshot ? appliedSnapshot.governmentApplicationFee : baseGovtFee;
  const effectiveServiceCharge = appliedSnapshot ? appliedSnapshot.serviceCharge : job.serviceFee;
  const effectiveRaffleDiscount = appliedSnapshot ? appliedSnapshot.raffleBonusDiscount : 0;
  const effectiveCouponDiscount = appliedSnapshot ? appliedSnapshot.couponDiscount : 0;
  const effectiveFinalServiceCharge = appliedSnapshot ? appliedSnapshot.finalServiceCharge : job.serviceFee;
  const effectiveTotalPayable = appliedSnapshot ? appliedSnapshot.totalPayable : (baseGovtFee + job.serviceFee);
  const hasPrizeDrawEntry = appliedSnapshot ? Boolean(appliedSnapshot.hasPrizeDrawEntry) : false;
  const totalFee = effectiveTotalPayable;
  const splitWalletAmount = useWalletSplit ? Math.min((userProfile?.walletBalance || 0), totalFee) : 0;
  const netCashAmount = Math.max(0, totalFee - splitWalletAmount);

  const validateDiscounts = async (couponToApply: string | null, raffleId?: string, overrideGovtFee?: number) => {
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const gFee = overrideGovtFee !== undefined ? overrideGovtFee : (selectedPosition.govtFee ?? job.govtFee ?? 200);
      const campaignId = raffleId !== undefined ? raffleId : (availableOffers?.raffleCampaign?.id || undefined);
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          governmentFee: gFee,
          serviceCharge: job.serviceFee,
          couponCode: couponToApply ? couponToApply.trim().toUpperCase() : undefined,
          raffleCampaignId: campaignId
        })
      });

      const data = await res.json();
      if (res.ok && data.valid && data.snapshot) {
        setAppliedSnapshot(data.snapshot);
        if (couponToApply) {
          setAppliedCouponCode(couponToApply.trim().toUpperCase());
          setCouponSuccess(`কুপন "${couponToApply.toUpperCase()}" সফলভাবে যুক্ত হয়েছে! ৳${data.snapshot.couponDiscount} ছাড় পেয়েছেন।`);
        }
      } else {
        setCouponError(data.error || 'কুপনটি প্রযোজ্য নয় বা মেয়াদ শেষ হয়েছে।');
        if (couponToApply) {
          setAppliedCouponCode(null);
        }
      }
    } catch (err: any) {
      setCouponError('ডিসকাউন্ট যাচাই করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch('/api/discounts/available');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAvailableOffers({
              coupons: data.coupons || [],
              raffleCampaign: data.raffleCampaign || null
            });

            if (data.raffleCampaign) {
              validateDiscounts(null, data.raffleCampaign.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load available discounts:', err);
      }
    }
    fetchOffers();
  }, [job.govtFee, job.serviceFee]);

  // Position change handler
  const handleSelectPosition = (pos: JobPosition) => {
    setSelectedPosition(pos);
    const newGovtFee = pos.govtFee ?? job.govtFee ?? 200;
    validateDiscounts(appliedCouponCode, undefined, newGovtFee);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCouponCode.trim()) return;
    validateDiscounts(inputCouponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setInputCouponCode('');
    setAppliedCouponCode(null);
    setCouponSuccess(null);
    setCouponError(null);
    if (availableOffers?.raffleCampaign) {
      validateDiscounts(null, availableOffers.raffleCampaign.id);
    } else {
      setAppliedSnapshot(null);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod !== 'Wallet' && !trxId.trim()) {
      alert('দয়া করে বিকাশ বা নগদের ট্রানজ্যাকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const me = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!me.ok) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
        return;
      }
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          organization: job.organization,
          postName: `${selectedPosition.title} (${selectedPosition.grade})`,
          candidateName: candidateName || emptyCandidateProfile.name,
          candidatePhone: senderPhone || emptyCandidateProfile.phone,
          candidateDistrict: candidateDistrict || emptyCandidateProfile.district,
          totalAmount: totalFee,
          paymentMethod: paymentMethod,
          trxId: trxId || (paymentMethod === 'Wallet' ? 'WALLET-AUTO-DEBIT' : 'CASH-VERIFICATION'),
          status: 'pending_payment',
          senderPhone: senderPhone,
          paymentScreenshotUrl: paymentScreenshotUrl || undefined,
          walletDeduction: paymentMethod === 'Wallet' ? totalFee : (useWalletSplit ? splitWalletAmount : 0),
          cashPaid: paymentMethod === 'Wallet' ? 0 : (useWalletSplit ? netCashAmount : totalFee),
          governmentFee: baseGovtFee,
          serviceCharge: job.serviceFee,
          couponDiscount: effectiveCouponDiscount,
          raffleDiscount: effectiveRaffleDiscount,
          financialSnapshot: appliedSnapshot || undefined,
          submittedEducation: (userProfile.education || emptyCandidateProfile.education || []).filter((e: any) => selectedEduLevels.includes(e.level)),
          submittedEducationLevels: selectedEduLevels,
          attachedDocuments: vaultDocs
            .filter(d => selectedDocIds.includes(d.id))
            .map(d => ({
              id: d.id,
              title: d.title,
              type: d.type,
              url: d.dataUrl || d.fileUrl || (d as any).url || '',
              uploadDate: d.uploadDate,
              fileSize: d.fileSize
            }))
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.createdApp) {
        setCreatedOrderNumber(data.createdApp.id);
        try {
          storage.addApplication(data.createdApp);
          if (paymentMethod === 'Wallet' || (useWalletSplit && splitWalletAmount > 0)) {
            const user = storage.getUser();
            if (typeof data.walletBalance === 'number') {
              user.walletBalance = data.walletBalance;
            } else {
              user.walletBalance = Math.max(0, (user.walletBalance || 0) - (data.createdApp.totalAmount || 0));
            }
            storage.updateUser(user);

            const txn = data.transaction || {
              id: 'TXN-' + data.createdApp.id,
              date: new Date().toISOString(),
              amount: data.createdApp.totalAmount,
              type: 'fee_deduction',
              description: `${data.createdApp.jobTitle} - ${data.createdApp.postName}`,
              method: 'Wallet',
              trxId: 'WALLET-' + data.createdApp.id,
              status: 'completed'
            };
            storage.addTransaction(txn);

            window.dispatchEvent(new Event('cs_wallet_changed'));
            window.dispatchEvent(new Event('cs_txs_changed'));
            window.dispatchEvent(new Event('cs_user_changed'));
          }
          window.dispatchEvent(new CustomEvent('cs_application_submitted', { detail: data.createdApp }));
        } catch (storageErr) {
          console.warn('Storage sync error:', storageErr);
        }
        setOrderSuccess(true);
      } else {
        alert(data.error || 'আবেদন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch (err: any) {
      alert('নেটওয়ার্ক সমস্যা: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 font-medium text-sm">সার্কুলারের তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Back button */}
      <Link href={`/jobs/${job?.id || jobId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>সার্কুলার বিবরণে ফিরে যান</span>
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
            নির্ভুল চাকরি আবেদন সার্ভিস
          </span>
          <h1 className="text-xl sm:text-2xl font-black leading-snug">
            {job.title}
          </h1>
          <p className="text-xs text-slate-200">
            {job.organization} • {job.grade} • মোট পদ: {job.totalPosts} টি
          </p>
        </div>
      </div>

      {orderSuccess ? (
        /* Success Screen */
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              আপনার আবেদনের রিকোয়েস্ট সফলভাবে জমা হয়েছে!
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              আমাদের টিম মেম্বার অফিশিয়াল পোর্টালে আপনার আবেদন ফরম পূরণ শুরু করেছে। আবেদন সম্পন্ন হওয়ামাত্রই আপনার ড্যাশবোর্ডে <strong>&quot;Applicant Copy PDF&quot;</strong> আপলোড করে দেওয়া হবে এবং এসএমএস অ্যালার্ট যাবে।
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl max-w-md mx-auto text-xs text-slate-700 border border-slate-200 text-left space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">অর্ডার আইডি:</span>
              <span className="font-bold font-mono text-slate-900">{createdOrderNumber || 'APP-84920'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">আবেদনকৃত পদ:</span>
              <span className="font-bold text-slate-900 text-right">{selectedPosition.title} ({selectedPosition.grade})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">সরকারি আবেদন ফি:</span>
              <span className="font-bold text-slate-900 font-mono">৳{baseGovtFee}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">টিম সার্ভিস চার্জ:</span>
              <span className="font-bold text-slate-900 font-mono">৳{job.serviceFee}</span>
            </div>
            {effectiveCouponDiscount > 0 && (
              <div className="flex justify-between items-center text-pink-700 font-bold">
                <span>কুপন ছাড় ({appliedCouponCode}):</span>
                <span className="font-mono">-৳{effectiveCouponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">পরিশোধিত মাধ্যম:</span>
              <span className="font-bold text-emerald-800">{paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
              <span className="font-bold text-slate-800">সর্বমোট পরিশোধ:</span>
              <span className="font-black text-emerald-700 text-base font-mono">৳{totalFee}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-105"
            >
              <UserCheck className="w-4 h-4" />
              <span>ড্যাশবোর্ডে লাইভ স্ট্যাটাস ট্র্যাক করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : isExpired ? (
        /* Expired Notice Card - Smart No-Payment UX */
        <div className="bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl border border-amber-200/80 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>আবেদনের সময় শেষ</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              এই সার্কুলারের আবেদনের সময়সীমা শেষ হয়েছে
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              দুঃখিত, এই সার্কুলারটির নির্ধারিত আবেদনের শেষ সময়সীমা{' '}
              <strong className="text-slate-900 font-bold">({job.deadline || 'অতিক্রান্ত'})</strong>{' '}
              শেষ হয়ে গেছে। তাই বর্তমানে এই পদের জন্য নতুন কোনো আবেদন গ্রহণ করা সম্ভব হচ্ছে না।
            </p>
          </div>

          {/* Job Summary Pill */}
          <div className="bg-slate-50 p-4 rounded-2xl max-w-md mx-auto text-xs sm:text-sm text-slate-700 border border-slate-200 text-left space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">প্রতিষ্ঠান:</span>
              <span className="font-bold text-slate-900">{job.organization}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">পদবী:</span>
              <span className="font-bold text-slate-900">{job.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">শেষ তারিখ ছিল:</span>
              <span className="font-bold text-rose-600">{job.deadline}</span>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-700/25 transition-all hover:scale-[1.02]"
            >
              <Briefcase className="w-4 h-4" />
              <span>চলমান অন্যান্য চাকরি দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/jobs/${job?.id || jobId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base rounded-2xl transition-all"
            >
              <span>সার্কুলারের অফিশিয়াল নোটিশ দেখুন</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Application & Payment Form */
        <form onSubmit={handleSubmitOrder} className="space-y-8">

          {/* 1. Applied Position & Grade Selection Step */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  ১
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    আবেদনের কাঙ্ক্ষিত পদ ও গ্রেড নির্বাচন
                  </h3>
                  <p className="text-xs text-slate-500">
                    {positions.length > 1
                      ? 'এই সার্কুলারে একাধিক গ্রেডের পদ রয়েছে। যে পদে আবেদন করবেন সেটি সিলেক্ট করুন (পদ অনুযায়ী সরকারি ফি কার্যকর হবে)।'
                      : 'সার্কুলারের পদ ও নির্ধারিত সরকারি ফি নিশ্চিত করুন।'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                {positions.length > 1 ? `${positions.length}টি পদ উপলব্ধ` : 'একক পদ'}
              </span>
            </div>

            {/* Position Cards Selection */}
            <div className="grid grid-cols-1 gap-3">
              {positions.map((pos, idx) => {
                const isSelected = selectedPosition.title === pos.title;
                const pGovtFee = pos.govtFee ?? job.govtFee ?? 200;
                const pTotal = pGovtFee + job.serviceFee;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectPosition(pos)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">{pos.title}</h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[11px] rounded border border-slate-200">
                            {pos.grade}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded">
                            {pos.posts} টি পদ
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {pos.minEducation} • স্কেল: {pos.salary}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/80 shrink-0">
                      <div className="text-[11px] text-slate-500">
                        সরকারি ফি: <strong className="text-slate-800 font-mono">৳{pGovtFee}</strong> + চার্জ ৳{job.serviceFee}
                      </div>
                      <div className="text-sm font-black text-emerald-800 font-mono">
                        মোট ৳{pTotal}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Candidate Vault Pre-filled Review */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  ২
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    প্রার্থীর তথ্য যাচাই (Pre-filled from Vault)
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার সেভ করা মাস্টার ভল্ট থেকে স্বয়ংক্রিয়ভাবে ডাটা লোড হয়েছে। কোনো টাইপ করতে হবে না।
                  </p>
                </div>
              </div>

              <Link href="/dashboard" className="text-xs font-bold text-emerald-700 hover:underline">
                তথ্য পরিবর্তন করুন
              </Link>
            </div>

            {/* Photo & Signature Preview */}
            <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <img
                  src={userProfile?.photoUrl || userProfile?.documents?.find((d: any) => d.type === "photo")?.dataUrl || emptyCandidateProfile.photoUrl}
                  alt="Candidate Photo"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-300 bg-white"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">পাসপোর্ট সাইজ ছবি</div>
                  <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    ৩০০ x ৩০০ পিক্সেল (রেডি)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-0 sm:pl-6 sm:border-l border-slate-200">
                <img
                  src={userProfile?.signatureUrl || userProfile?.documents?.find((d: any) => d.type === "signature")?.dataUrl || emptyCandidateProfile.signatureUrl}
                  alt="Candidate Signature"
                  className="w-24 h-10 object-cover border border-slate-300 rounded bg-white"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">ডিজিটাল স্বাক্ষর</div>
                  <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    ৩০০ x ৮০ পিক্সেল (রেডি)
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[11px]">প্রার্থীর পূর্ণ নাম (English):</span>
                <span className="font-bold text-slate-900">{userProfile?.name || candidateName || emptyCandidateProfile.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[11px]">বাবার নাম:</span>
                <span className="font-bold text-slate-900">{userProfile?.fatherName || emptyCandidateProfile.fatherName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[11px]">মায়ের নাম:</span>
                <span className="font-bold text-slate-900">{userProfile?.motherName || emptyCandidateProfile.motherName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[11px]">মোবাইল নম্বর:</span>
                <span className="font-bold text-slate-900">{userProfile?.phone || senderPhone || emptyCandidateProfile.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[11px]">এনআইডি নম্বর:</span>
                <span className="font-bold font-mono text-slate-900">{userProfile?.nid || emptyCandidateProfile.nid}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[11px]">নিজ জেলা:</span>
                <span className="font-bold text-slate-900">{userProfile?.district || candidateDistrict || emptyCandidateProfile.district}</span>
              </div>
            </div>

            {/* Dynamic Educational Qualifications Selector */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs space-y-0 bg-white shadow-xs">
              <div className="bg-slate-100/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200">
                <div>
                  <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <span>এই আবেদনের জন্য শিক্ষাগত যোগ্যতা নির্বাচন ({selectedEduLevels.length} টি নির্বাচিত)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    যে যে সনদ এই নির্দিষ্ট চাকরির আবেদনে জমা দিতে চান সেগুলো টিক দিন (যেমন: শুধু এসএসসি বা এসএসসি+এইচএসসি)।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEduLevels((userProfile.education || emptyCandidateProfile.education).map((e: any) => e.level))}
                    className="text-[10px] font-bold text-emerald-700 hover:underline"
                  >
                    সবগুলো নির্বাচন
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {(userProfile.education || emptyCandidateProfile.education).map((edu: any, idx: number) => {
                  const isChecked = selectedEduLevels.includes(edu.level);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleEduLevel(edu.level)}
                      className={`p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-50/30' : 'bg-slate-50/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEduLevel(edu.level)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-black">{edu.level}</span>
                            <span>{edu.degree}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {edu.boardOrUni} • রোল: {edu.roll} • রেজি: {edu.reg}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-slate-400 block text-[10px]">পাসের সন</span>
                          <span className="font-semibold text-slate-700">{edu.year}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">জিপিএ / সিজিপিএ</span>
                          <span className="font-black text-emerald-700">{edu.result}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Vault Documents Attachment Selector */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs space-y-0 bg-white shadow-xs">
              <div className="bg-slate-100/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200">
                <div>
                  <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                    <FolderCheck className="w-4 h-4 text-emerald-700" />
                    <span>ভল্ট থেকে প্রমাণপত্র ও সার্টিফিকেট সংযুক্তি ({selectedDocIds.length} টি সংযুক্ত)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    আপনার মাস্টার ভল্ট থেকে যে যে আইডি ও সার্টিফিকেট এই নির্দিষ্ট আবেদনের সাথে অ্যাডমিনকে পাঠাতে চান সেগুলো নির্বাচন করুন।
                  </p>
                </div>
                <a
                  href="/dashboard/vault"
                  target="_blank"
                  className="text-[10px] font-bold text-emerald-700 hover:underline shrink-0"
                >
                  + ভল্টে নতুন ডকুমেন্ট যোগ করুন ↗
                </a>
              </div>

              {vaultDocs.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  ভল্টে কোনো সংরক্ষিত ডকুমেন্ট পাওয়া যায়নি। প্রার্থীর মূল পরিচয়পত্র ও প্রয়োজনীয় সনদ স্বয়ংক্রিয়ভাবে সংরক্ষিত প্রোফাইল থেকে গৃহীত হবে।
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {vaultDocs.map((doc: CandidateDocument) => {
                    const isChecked = selectedDocIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleToggleDocId(doc.id)}
                        className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-50/20' : 'bg-white opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleDocId(doc.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate text-xs">{doc.title}</span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {doc.fileSize || 'ফাইল'} • আপলোড: {doc.uploadDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isChecked ? '✓ সংযুক্ত' : 'বাদ'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* 3. Fee Calculation & Payment Selection */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                ৩
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ফি ও পেমেন্ট মেথড নির্বাচন
                </h3>
                <p className="text-xs text-slate-500">
                  সরকারি পরীক্ষার ফি এবং আমাদের আবেদন সহায়তা সার্ভিসের স্বচ্ছ হিসাব
                </p>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  কুপন বা ডিসকাউন্ট কোড আছে?
                </span>
                {appliedCouponCode && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> কোড মুছুন
                  </button>
                )}
              </div>

              {!appliedCouponCode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCouponCode}
                    onChange={(e) => setInputCouponCode(e.target.value)}
                    placeholder="উদা: CHAKRI20 বা EID50"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !inputCouponCode.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                  >
                    {isValidatingCoupon ? 'যাচাই হচ্ছে...' : 'প্রয়োগ করুন'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    কুপন &quot;{appliedCouponCode}&quot; কার্যকর হয়েছে
                  </span>
                  <span className="text-emerald-800 font-mono">-৳{effectiveCouponDiscount}</span>
                </div>
              )}

              {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-emerald-700 font-medium">{couponSuccess}</p>}
            </div>

            {/* Fee Breakdown Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>
                  সরকারি মূল আবেদন ফি ({selectedPosition.title} - {selectedPosition.grade}):
                </span>
                <span className="font-bold font-mono">৳{baseGovtFee}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>আমাদের টিম সার্ভিস চার্জ (ফর্ম পূরণ, ভেরিফিকেশন ও ট্র্যাকিং):</span>
                <span className="font-bold font-mono">৳{job.serviceFee}</span>
              </div>
              {effectiveCouponDiscount > 0 && (
                <div className="flex justify-between text-pink-700 font-bold">
                  <span>কুপন ডিসকাউন্ট ({appliedCouponCode}):</span>
                  <span className="font-mono">-৳{effectiveCouponDiscount}</span>
                </div>
              )}
              {effectiveRaffleDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>ক্যাম্পেইন বোনাস ছাড়:</span>
                  <span className="font-mono">-৳{effectiveRaffleDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-emerald-900 pt-2 border-t border-emerald-200">
                <span>সর্বমোট প্রদেয় টাকা:</span>
                <span className="text-xl font-mono">৳{totalFee}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                পেমেন্ট মাধ্যম বেছে নিন:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* bKash */}
                <div
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'bKash'
                      ? 'border-pink-600 bg-pink-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    বিকাশ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">bKash পেমেন্ট</div>
                    <div className="text-[11px] text-slate-500">Send Money / TrxID</div>
                  </div>
                </div>

                {/* Nagad */}
                <div
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'Nagad'
                      ? 'border-orange-600 bg-orange-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    নগদ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Nagad পেমেন্ট</div>
                    <div className="text-[11px] text-slate-500">Send Money / TrxID</div>
                  </div>
                </div>

                {/* Wallet Balance */}
                {(() => {
                  const userBal = userProfile?.walletBalance ?? 0;
                  const isInsufficient = userBal < totalFee;
                  return (
                    <div
                      onClick={() => {
                        if (isInsufficient) {
                          alert(`আপনার ওয়ালেট ব্যালেন্স (৳${userBal}) অপর্যাপ্ত। মোট আবেদন ফি ৳${totalFee}। অনুগ্রহ করে বিকাশ অথবা নগদ দিয়ে আবেদন করুন।`);
                          return;
                        }
                        setPaymentMethod('Wallet');
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        isInsufficient
                          ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : paymentMethod === 'Wallet'
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-sm cursor-pointer'
                            : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
                        isInsufficient ? 'bg-slate-400 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">ওয়ালেট ব্যালেন্স</div>
                        <div className={`text-[11px] font-bold ${isInsufficient ? 'text-red-600' : 'text-emerald-700'}`}>
                          ব্যালেন্স: ৳{userBal} {isInsufficient && '(অপর্যাপ্ত)'}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* bKash / Nagad TrxID Details */}
            {paymentMethod !== 'Wallet' ? (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <Smartphone className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">
                      {paymentMethod === 'bKash' ? 'বিকাশ পার্সোনাল নম্বর: ' : 'নগদ পার্সোনাল নম্বর: '}
                    </span>
                    <strong className="text-emerald-700 font-mono text-sm"> 01712-345678</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      উক্ত নম্বরে <strong>৳{totalFee}</strong> Send Money করে নিচের বক্সে TrxID এবং আপনার প্রেরক নম্বর দিন।
                    </p>
                  </div>
                </div>

                {/* Optional Wallet Split Checkbox if user has balance */}
                {(userProfile?.walletBalance || 0) > 0 && (
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-300 flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                      <input
                        type="checkbox"
                        checked={useWalletSplit}
                        onChange={(e) => setUseWalletSplit(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>ওয়ালেট ব্যালেন্স থেকে ৳{Math.min((userProfile?.walletBalance || 0), totalFee)} ব্যবহার করুন</span>
                    </label>
                    <span className="text-emerald-800 font-mono font-black text-xs">
                      {paymentMethod === 'bKash' ? 'বিকাশে' : 'নগদে'} প্রদেয়: ৳{netCashAmount}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      ট্রানজ্যাকশন আইডি (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদা: BK9X87M2LQ"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01XXXXXXXXX"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Screenshot Proof Upload (Optional) */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      পেমেন্ট সাকসেস স্ক্রিনশট সংযুক্ত করুন (ঐচ্ছিক):
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ ২ গুণ দ্রুত ভেরিফিকেশন নিশ্চয়তা
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    onChange={handlePaymentScreenshotUpload}
                    disabled={isUploadingScreenshot}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {paymentScreenshotUrl && (
                    <div className="mt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>স্ক্রিনশট সফলভাবে যুক্ত হয়েছে!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <div className="font-bold">ওয়ালেট থেকে স্বয়ংক্রিয়ভাবে ৳{totalFee} কেটে নেওয়া হবে।</div>
                  <div className="text-[11px] text-slate-600">অবশিষ্ট ব্যালেন্স থাকবে: ৳{(userProfile?.walletBalance ?? 0) - totalFee}</div>
                </div>
                <span className="text-emerald-700 font-bold bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm">
                  ইনস্ট্যান্ট কনফার্মেশন
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>আবেদন অর্ডার প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>{selectedPosition.title} পদের আবেদন নিশ্চিত করুন (৳{totalFee})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ১০০% নির্ভুল আবেদনের গ্যারান্টি
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                ৩-১০ মিনিটের মধ্যে কাজ সম্পন্ন
              </span>
            </div>

          </div>

        </form>
      )}

    </div>
  );
}

export default function ApplyClient({ initialJob }: ApplyClientProps) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-600">আবেদন ফরম লোড হচ্ছে...</p>
      </div>
    }>
      <ApplyFormContent initialJob={initialJob} />
    </Suspense>
  );
}
