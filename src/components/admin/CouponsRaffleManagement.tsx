'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tag, 
  Gift, 
  Ticket, 
  Plus, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Pause, 
  Play, 
  Sparkles, 
  Lock, 
  ArrowRight
} from 'lucide-react';
import { Coupon, RaffleCampaign } from '@/lib/types';
import { getAdminHeaders } from '@/lib/adminAuthClient';

interface CouponsRaffleManagementProps {
  initialTab?: 'coupons' | 'raffles';
}

export default function CouponsRaffleManagement({ initialTab = 'coupons' }: CouponsRaffleManagementProps = {}) {
  const [couponsSubTab, setCouponsSubTab] = useState<'coupons' | 'raffles'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setCouponsSubTab(initialTab);
    }
  }, [initialTab]);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'unauthorized' | 'forbidden'>('checking');
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [couponFetchError, setCouponFetchError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);
  const [couponFormError, setCouponFormError] = useState<string | null>(null);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);
  const [couponSearch, setCouponSearch] = useState('');
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);

  // Create Coupon Form State
  const [cCode, setCCode] = useState('');
  const [cTitle, setCTitle] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cDiscountType, setCDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [cDiscountValue, setCDiscountValue] = useState('15');
  const [cMinServiceCharge, setCMinServiceCharge] = useState('50');
  const [cMaxDiscountCap, setCMaxDiscountCap] = useState('');
  const [cStartDate, setCStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [cExpiryDate, setCExpiryDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16));
  const [cGlobalUsageLimit, setCGlobalUsageLimit] = useState('');
  const [cPerCandidateLimit, setCPerCandidateLimit] = useState('1');
  const [cAllowCombineWithRaffle, setCAllowCombineWithRaffle] = useState(true);
  const [cNewCandidateOnly, setCNewCandidateOnly] = useState(false);
  const [cTotalBudget, setCTotalBudget] = useState('');

  // Raffles State
  const [campaigns, setCampaigns] = useState<RaffleCampaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [raffleFetchError, setRaffleFetchError] = useState<string | null>(null);
  const [raffleSuccessMsg, setRaffleSuccessMsg] = useState<string | null>(null);
  const [raffleFormError, setRaffleFormError] = useState<string | null>(null);
  const [isSubmittingRaffle, setIsSubmittingRaffle] = useState(false);
  const [raffleSearch, setRaffleSearch] = useState('');
  const [showCreateRaffleModal, setShowCreateRaffleModal] = useState(false);

  // Create Raffle Form State
  const [rTitle, setRTitle] = useState('');
  const [rDescription, setRDescription] = useState('');
  const [rHasServiceDiscount, setRHasServiceDiscount] = useState(true);
  const [rHasPrizeDraw, setRHasPrizeDraw] = useState(false);
  const [rBonusType, setRBonusType] = useState<'fixed' | 'percentage'>('fixed');
  const [rBonusValue, setRBonusValue] = useState('20');
  const [rMaxBonusPerOrder, setRMaxBonusPerOrder] = useState('20');
  const [rMinServiceCharge, setRMinServiceCharge] = useState('50');
  const [rTotalBudget, setRTotalBudget] = useState('5000');
  const [rStartDate, setRStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [rEndDate, setREndDate] = useState(new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 16));
  const [rAllowCombineWithCoupon, setRAllowCombineWithCoupon] = useState(true);
  useEffect(() => {
    loadCoupons();
    loadRaffles();
  }, []);

  const loadCoupons = async () => {
    setIsLoadingCoupons(true);
    setCouponFetchError(null);
    try {
      const res = await fetch('/api/admin/coupons', { headers: getAdminHeaders() });
      if (res.status === 401) {
        setAuthStatus('unauthorized');
        setAuthErrorMsg('অ্যাডমিন সেশন পাওয়া যায়নি। অনুগ্রহ করে লগইন করুন।');
        return;
      }
      if (res.status === 403) {
        setAuthStatus('forbidden');
        setAuthErrorMsg('অ্যাক্সেস অস্বীকৃত: অ্যাডমিন পারমিশন আবশ্যক (HTTP 403 Forbidden)।');
        return;
      }
      setAuthStatus('authorized');
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      } else {
        setCouponFetchError(data.error || 'কুপন লোড ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setCouponFetchError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const loadRaffles = async () => {
    setIsLoadingCampaigns(true);
    setRaffleFetchError(null);
    try {
      const res = await fetch('/api/admin/raffles', { headers: getAdminHeaders() });
      if (res.status === 401) {
        setAuthStatus('unauthorized');
        return;
      }
      if (res.status === 403) {
        setAuthStatus('forbidden');
        return;
      }
      setAuthStatus('authorized');
      const data = await res.json();
      if (data.success && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
      } else {
        setRaffleFetchError(data.error || 'ক্যাম্পেইন লোড ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setRaffleFetchError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFormError(null);
    setCouponSuccessMsg(null);
    setIsSubmittingCoupon(true);

    try {
      const payload: any = {
        code: cCode.trim().toUpperCase(),
        title: cTitle.trim(),
        description: cDescription.trim() || undefined,
        discountType: cDiscountType,
        discountValue: Number(cDiscountValue),
        minServiceCharge: Number(cMinServiceCharge) || 0,
        startDate: new Date(cStartDate).toISOString(),
        expiryDate: new Date(cExpiryDate).toISOString(),
        perCandidateLimit: Number(cPerCandidateLimit) || 1,
        allowCombineWithRaffle: cAllowCombineWithRaffle,
        newCandidateOnly: cNewCandidateOnly
      };

      if (cMaxDiscountCap && Number(cMaxDiscountCap) > 0) {
        payload.maxDiscountCap = Number(cMaxDiscountCap);
      }
      if (cGlobalUsageLimit && Number(cGlobalUsageLimit) > 0) {
        payload.globalUsageLimit = Number(cGlobalUsageLimit);
      }
      if (cTotalBudget && Number(cTotalBudget) > 0) {
        payload.totalBudget = Number(cTotalBudget);
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.status === 201 && data.coupon) {
        setCouponSuccessMsg(`কুপন "${data.coupon.code}" সফলভাবে তৈরি হয়েছে!`);
        setShowCreateCouponModal(false);
        setCCode('');
        setCTitle('');
        setCDescription('');
        setCDiscountValue('15');
        setCMaxDiscountCap('');
        setCGlobalUsageLimit('');
        setCTotalBudget('');
        loadCoupons();
      } else {
        setCouponFormError(data.error || 'কুপন তৈরি ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setCouponFormError(`কুপন তৈরিতে ত্রুটি: ${err.message}`);
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  const handleToggleCouponStatus = async (couponId: string, newStatus: 'active' | 'paused') => {
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.coupon) {
        setCoupons(prev => prev.map(c => c.id === couponId ? data.coupon : c));
        setCouponSuccessMsg(`কুপন "${data.coupon.code}" এর স্ট্যাটাস ${newStatus === 'active' ? 'সক্রিয়' : 'পজড'} করা হয়েছে।`);
      } else {
        alert(data.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(`স্ট্যাটাস আপডেট ব্যর্থ: ${err.message}`);
    }
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    setRaffleFormError(null);
    setRaffleSuccessMsg(null);
    setIsSubmittingRaffle(true);

    try {
      if (!rHasServiceDiscount && !rHasPrizeDraw) {
        setRaffleFormError('সার্ভিস ডিসকাউন্ট অথবা প্রাইজ ড্র এর মধ্যে অন্তত একটি নির্বাচন করুন।');
        setIsSubmittingRaffle(false);
        return;
      }

      const payload: any = {
        title: rTitle.trim(),
        description: rDescription.trim(),
        hasServiceDiscount: rHasServiceDiscount,
        hasPrizeDraw: rHasPrizeDraw,
        bonusType: rBonusType,
        bonusValue: rHasServiceDiscount ? Number(rBonusValue) : 0,
        maxBonusPerOrder: rHasServiceDiscount ? Number(rMaxBonusPerOrder) : 0,
        minServiceCharge: Number(rMinServiceCharge) || 0,
        startDate: new Date(rStartDate).toISOString(),
        endDate: new Date(rEndDate).toISOString(),
        allowCombineWithCoupon: rAllowCombineWithCoupon
      };

      if (rTotalBudget && Number(rTotalBudget) > 0) {
        payload.totalBudget = Number(rTotalBudget);
      }

      const res = await fetch('/api/admin/raffles', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.status === 201 && data.campaign) {
        setRaffleSuccessMsg(`র‍্যাফেল ক্যাম্পেইন "${data.campaign.title}" সফলভাবে তৈরি হয়েছে!`);
        setShowCreateRaffleModal(false);
        setRTitle('');
        setRDescription('');
        setRBonusValue('20');
        setRTotalBudget('5000');
        loadRaffles();
      } else {
        setRaffleFormError(data.error || 'ক্যাম্পেইন তৈরি ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setRaffleFormError(`ক্যাম্পেইন তৈরি করতে ত্রুটি: ${err.message}`);
    } finally {
      setIsSubmittingRaffle(false);
    }
  };

  const handleToggleRaffleStatus = async (campaignId: string, newStatus: 'active' | 'paused' | 'ended') => {
    try {
      const res = await fetch(`/api/admin/raffles/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.campaign) {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? data.campaign : c));
        setRaffleSuccessMsg(`ক্যাম্পেইন "${data.campaign.title}" এর স্ট্যাটাস ${newStatus} করা হয়েছে।`);
      } else {
        alert(data.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(`ক্যাম্পেইন আপডেট ব্যর্থ: ${err.message}`);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(couponSearch.toLowerCase()) || 
    c.title.toLowerCase().includes(couponSearch.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(raffleSearch.toLowerCase()) || 
    c.description.toLowerCase().includes(raffleSearch.toLowerCase())
  );
  return (
    <div className="space-y-6 font-sans">
      
      {/* Security & Access Denied Banner */}
      {authStatus === 'unauthorized' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">অ্যাডমিন একাউন্টে সাইন-ইন আবশ্যক</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              কুপন ডিসকাউন্ট ও র‍্যাফেল ক্যাম্পেইন পরিচালনার জন্য সার্ভার-সাইড অ্যাডমিন একাউন্ট অথেনটিকেশন বাধ্যতামূলক।
            </p>
          </div>
          <div>
            <Link
              href="/login?role=admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              <span>অ্যাডমিন লগইন পেজে যান</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {authStatus === 'forbidden' && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-red-950">অ্যাক্সেস অস্বীকৃত (HTTP 403 Forbidden)</h3>
            <p className="text-xs sm:text-sm text-red-700 max-w-md mx-auto">
              আপনার বর্তমান সেশনটি একজন প্রার্থীর (Candidate)। কুপন বা ক্যাম্পেইন ম্যানেজমেন্ট পরিচালনা করার জন্য অ্যাডমিন পারমিশন প্রয়োজন।
            </p>
          </div>
        </div>
      )}

      {authStatus === 'authorized' && (
        <div className="space-y-6">
          
          {/* Subtabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCouponsSubTab('coupons')}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
                  couponsSubTab === 'coupons'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>প্রোমো কুপন ({coupons.length})</span>
              </button>

              <button
                onClick={() => setCouponsSubTab('raffles')}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
                  couponsSubTab === 'raffles'
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>র‍্যাফেল ও বোনাস ক্যাম্পেইন ({campaigns.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (couponsSubTab === 'coupons') loadCoupons();
                  else loadRaffles();
                }}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingCoupons || isLoadingCampaigns ? 'animate-spin' : ''}`} />
              </button>

              {couponsSubTab === 'coupons' ? (
                <button
                  onClick={() => setShowCreateCouponModal(!showCreateCouponModal)}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showCreateCouponModal ? 'ফর্ম বন্ধ করুন' : 'নতুন কুপন তৈরি'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateRaffleModal(!showCreateRaffleModal)}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showCreateRaffleModal ? 'ফর্ম বন্ধ করুন' : 'নতুন ক্যাম্পেইন তৈরি'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Notification Banner */}
          {(couponSuccessMsg || raffleSuccessMsg) && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{couponSuccessMsg || raffleSuccessMsg}</span>
              </div>
              <button 
                onClick={() => { setCouponSuccessMsg(null); setRaffleSuccessMsg(null); }}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* SUBSECTION 1: COUPONS MANAGEMENT                     */}
          {/* ==================================================== */}
          {couponsSubTab === 'coupons' && (
            <div className="space-y-6">
              
              {/* Create Coupon Expandable Form */}
              {showCreateCouponModal && (
                <div className="bg-white rounded-3xl border border-indigo-200 p-6 sm:p-8 space-y-6 shadow-md shadow-indigo-50">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">নতুন ডিসকাউন্ট কুপন তৈরি করুন</h3>
                        <p className="text-xs text-slate-500">সার্ভিস চার্জে ছাড়ের জন্য নিয়ম ও শর্ত নির্ধারণ করুন</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowCreateCouponModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {couponFormError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{couponFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateCoupon} className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">কুপন কোড (Auto Uppercase) *</label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: EID2026 বা FLAT15"
                          value={cCode}
                          onChange={(e) => setCCode(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">৩-৩০ অক্ষর, সংখ্যা ও হাইফেন</span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-700 block mb-1">কুপনের শিরোনাম / অফারের নাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: পবিত্র ঈদুল ফিতর উপলক্ষে ২৫% বিশেষ ছাড়"
                          value={cTitle}
                          onChange={(e) => setCTitle(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        placeholder="উদা: সকল সরকারি ও ব্যাংক চাকরির আবেদন সার্ভিসে প্রযোজ্য"
                        value={cDescription}
                        onChange={(e) => setCDescription(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">ডিসকাউন্টের ধরণ *</label>
                        <select
                          value={cDiscountType}
                          onChange={(e: any) => setCDiscountType(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                        >
                          <option value="fixed">ফিক্সড টাকা (৳ BDT)</option>
                          <option value="percentage">শতকরা হার (% Percentage)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          ডিসকাউন্ট মান ({cDiscountType === 'percentage' ? '%' : '৳'}) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={cDiscountType === 'percentage' ? 100 : 1000}
                          value={cDiscountValue}
                          onChange={(e) => setCDiscountValue(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">ন্যূনতম সার্ভিস চার্জ (৳)</label>
                        <input
                          type="number"
                          min="0"
                          value={cMinServiceCharge}
                          onChange={(e) => setCMinServiceCharge(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">সর্বোচ্চ ডিসকাউন্ট ক্যাপ (৳)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="ঐচ্ছিক (ক্যাপ না থাকলে খালি রাখুন)"
                          value={cMaxDiscountCap}
                          onChange={(e) => setCMaxDiscountCap(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">শুরুর তারিখ *</label>
                        <input
                          type="datetime-local"
                          required
                          value={cStartDate}
                          onChange={(e) => setCStartDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">মেয়াদোত্তীর্ণের তারিখ *</label>
                        <input
                          type="datetime-local"
                          required
                          value={cExpiryDate}
                          onChange={(e) => setCExpiryDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">মোট ব্যবহারের সীমা (Global)</label>
                        <input
                          type="number"
                          placeholder="খালি রাখলে সীমাহীন"
                          value={cGlobalUsageLimit}
                          onChange={(e) => setCGlobalUsageLimit(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">প্রার্থী প্রতি সীমা (Per User)</label>
                        <input
                          type="number"
                          min="1"
                          value={cPerCandidateLimit}
                          onChange={(e) => setCPerCandidateLimit(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Stacking & Candidate Eligibility Toggles */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cAllowCombineWithRaffle}
                          onChange={(e) => setCAllowCombineWithRaffle(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">র‍্যাফেল ক্যাম্পেইনের সাথে কম্বাইন করা যাবে</span>
                          <span className="text-[11px] text-slate-500">চেক না থাকলে এটি অন্য অফারের সাথে স্ট্যাক হবে না</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cNewCandidateOnly}
                          onChange={(e) => setCNewCandidateOnly(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">কেবল নতুন আবেদনকারীদের জন্য প্রযোজ্য</span>
                          <span className="text-[11px] text-slate-500">প্রথমবার আবেদনকারী ছাড়া অন্যরা ব্যবহার করতে পারবে না</span>
                        </div>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateCouponModal(false)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingCoupon}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingCoupon ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>কুপন তৈরি হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>কুপন সেভ করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Coupon Search & List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">বিদ্যমান কুপনসমূহ</h3>
                    <p className="text-xs text-slate-500">সক্রিয়, পজড এবং পূর্ববর্তী কুপনসমূহের লাইভ তালিকা</p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="কোড বা নাম দিয়ে খুঁজুন..."
                      value={couponSearch}
                      onChange={(e) => setCouponSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {isLoadingCoupons ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                    <p className="text-xs font-bold">কুপন তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : filteredCoupons.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Tag className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm font-bold text-slate-600">কোনো কুপন পাওয়া যায়নি।</p>
                    <p className="text-xs text-slate-400">নতুন কুপন তৈরি করতে উপরের &quot;নতুন কুপন তৈরি&quot; বাটনে ক্লিক করুন।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCoupons.map((c) => (
                      <div 
                        key={c.id} 
                        className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-black text-xs rounded-lg shadow-sm">
                                {c.code}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : c.status === 'paused' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {c.status === 'active' ? 'সক্রিয়' : c.status === 'paused' ? 'সাময়িক পজড' : 'মেয়াদোত্তীর্ণ'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                            {c.description && <p className="text-[11px] text-slate-500">{c.description}</p>}
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-black text-indigo-700">
                              {c.discountType === 'percentage' ? `${c.discountValue}% ছাড়` : `৳${c.discountValue} ফ্ল্যাট`}
                            </div>
                            {c.maxDiscountCap && (
                              <span className="text-[10px] text-slate-500 font-medium">ক্যাপ: ৳{c.maxDiscountCap}</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <div>
                            <span className="text-slate-400 block text-[10px]">ব্যবহার কাউন্ট:</span>
                            <span className="font-bold font-mono text-slate-800">
                              {c.usedCount} / {c.globalUsageLimit ? `${c.globalUsageLimit} বার` : 'সীমাহীন'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">মেয়াদকাল:</span>
                            <span className="font-medium text-slate-700">
                              {new Date(c.expiryDate).toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[10px] text-slate-500">
                            {c.allowCombineWithRaffle ? '⚡ র‍্যাফেলের সাথে স্ট্যাকযোগ্য' : '🔒 একক কুপন (স্ট্যাকিং নিষেধ)'}
                          </span>

                          <div className="flex items-center gap-2">
                            {c.status === 'active' ? (
                              <button
                                onClick={() => handleToggleCouponStatus(c.id, 'paused')}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 flex items-center gap-1 text-[11px] transition-all"
                              >
                                <Pause className="w-3 h-3" />
                                <span>পজ করুন</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleCouponStatus(c.id, 'active')}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 flex items-center gap-1 text-[11px] transition-all"
                              >
                                <Play className="w-3 h-3" />
                                <span>সক্রিয় করুন</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ==================================================== */}
          {/* SUBSECTION 2: RAFFLE CAMPAIGNS                       */}
          {/* ==================================================== */}
          {couponsSubTab === 'raffles' && (
            <div className="space-y-6">
              
              {/* Create Campaign Expandable Form */}
              {showCreateRaffleModal && (
                <div className="bg-white rounded-3xl border border-teal-200 p-6 sm:p-8 space-y-6 shadow-md shadow-teal-50">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">নতুন র‍্যাফেল / বোনাস ক্যাম্পেইন তৈরি করুন</h3>
                        <p className="text-xs text-slate-500">সার্ভিস ডিসকাউন্ট বা প্রাইজ ড্র টিকিটের অফার যুক্ত করুন</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowCreateRaffleModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {raffleFormError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{raffleFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateRaffle} className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">ক্যাম্পেইনের শিরোনাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: বৈশাখী বিশেষ আবেদন ধামাকা ২০২৬"
                          value={rTitle}
                          onChange={(e) => setRTitle(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">বিস্তারিত বিবরণ *</label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: সার্ভিস চার্জে ২০ টাকা সরাসরি ছাড় ও ১টি মেগা ড্র টিকিট"
                          value={rDescription}
                          onChange={(e) => setRDescription(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Distinction Banner: Service Discount vs Prize Draw */}
                    <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-3">
                      <div className="font-bold text-teal-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-teal-700" />
                        <span>ক্যাম্পেইন সুবিধা নির্বাচন (সার্ভিস ডিসকাউন্ট বনাম প্রাইজ ড্র আলাদা রাখুন):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <label className="flex items-center gap-2 bg-white p-3 rounded-xl border border-teal-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rHasServiceDiscount}
                            onChange={(e) => setRHasServiceDiscount(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">সার্ভিস চার্জে সরাসরি ক্যাশ ছাড়</span>
                            <span className="text-[10px] text-slate-500">ক্যান্ডিডেটের প্রদেয় সার্ভিস চার্জ কমিয়ে দেয়</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 bg-white p-3 rounded-xl border border-teal-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rHasPrizeDraw}
                            onChange={(e) => setRHasPrizeDraw(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">লটারি / প্রাইজ ড্র এন্ট্রি টিকিট</span>
                            <span className="text-[10px] text-slate-500">আর্থিক কোনো ছাড় নয়, পৃথক ড্র টিকিট এন্ট্রি</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Financial Discount Settings if active */}
                    {rHasServiceDiscount && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">বোনাস ধরণ *</label>
                          <select
                            value={rBonusType}
                            onChange={(e: any) => setRBonusType(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                          >
                            <option value="fixed">ফিক্সড টাকা (৳ BDT)</option>
                            <option value="percentage">শতকরা হার (% Percentage)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            বোনাস ছাড়ের মান ({rBonusType === 'percentage' ? '%' : '৳'}) *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={rBonusValue}
                            onChange={(e) => setRBonusValue(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">অর্ডার প্রতি সর্বোচ্চ বোনাস (৳)</label>
                          <input
                            type="number"
                            min="0"
                            value={rMaxBonusPerOrder}
                            onChange={(e) => setRMaxBonusPerOrder(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">ন্যূনতম সার্ভিস চার্জ (৳)</label>
                        <input
                          type="number"
                          min="0"
                          value={rMinServiceCharge}
                          onChange={(e) => setRMinServiceCharge(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">মোট বরাদ্দকৃত বাজেট (৳)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="উদা: 5000"
                          value={rTotalBudget}
                          onChange={(e) => setRTotalBudget(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">শুরুর তারিখ *</label>
                        <input
                          type="datetime-local"
                          required
                          value={rStartDate}
                          onChange={(e) => setRStartDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">সমাপ্তির তারিখ *</label>
                        <input
                          type="datetime-local"
                          required
                          value={rEndDate}
                          onChange={(e) => setREndDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rAllowCombineWithCoupon}
                          onChange={(e) => setRAllowCombineWithCoupon(e.target.checked)}
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                        <span className="font-bold text-slate-800">কুপন ডিসকাউন্টের সাথে কম্বাইন অনুমোদন করুন (Stackable)</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateRaffleModal(false)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingRaffle}
                        className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingRaffle ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>ক্যাম্পেইন তৈরি হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>ক্যাম্পেইন সেভ করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Raffle Campaigns List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">বিদ্যমান র‍্যাফেল ও বোনাস ক্যাম্পেইনসমূহ</h3>
                    <p className="text-xs text-slate-500">চলমান ও পূর্ববর্তী ক্যাম্পেইনসমূহের রুলস ও বাজেট অগ্রগতি</p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="ক্যাম্পেইন নাম দিয়ে খুঁজুন..."
                      value={raffleSearch}
                      onChange={(e) => setRaffleSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {isLoadingCampaigns ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                    <p className="text-xs font-bold">ক্যাম্পেইন তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Gift className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm font-bold text-slate-600">কোনো ক্যাম্পেইন পাওয়া যায়নি।</p>
                    <p className="text-xs text-slate-400">নতুন ক্যাম্পেইন তৈরি করতে &quot;নতুন ক্যাম্পেইন তৈরি&quot; বাটনে ক্লিক করুন।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCampaigns.map((camp) => (
                      <div 
                        key={camp.id} 
                        className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900">{camp.title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                camp.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : camp.status === 'paused' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {camp.status === 'active' ? 'সক্রিয়' : camp.status === 'paused' ? 'পজড' : 'সমাপ্ত'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{camp.description}</p>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {camp.hasServiceDiscount && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                                ৳{camp.bonusValue} ছাড়
                              </span>
                            )}
                            {camp.hasPrizeDraw && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-md flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                <span>ড্র টিকিট</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Budget Progress Bar */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">বাজেট ব্যয়:</span>
                            <span className="font-bold font-mono text-slate-800">
                              ৳{camp.usedBudget || 0} / {camp.totalBudget ? `৳${camp.totalBudget}` : 'সীমাহীন'}
                            </span>
                          </div>
                          {camp.totalBudget && (
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-teal-600 h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.round(((camp.usedBudget || 0) / camp.totalBudget) * 100))}%` }}
                              />
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 pt-0.5 flex justify-between">
                            <span>মেয়াদ: {new Date(camp.endDate).toLocaleDateString('bn-BD')} পর্যন্ত</span>
                            <span>{camp.allowCombineWithCoupon ? 'কুপন কম্বাইনেবল' : 'একক ক্যাম্পেইন'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          {camp.status === 'active' ? (
                            <button
                              onClick={() => handleToggleRaffleStatus(camp.id, 'paused')}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 flex items-center gap-1 text-[11px] transition-all"
                            >
                              <Pause className="w-3 h-3" />
                              <span>পজ করুন</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleRaffleStatus(camp.id, 'active')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 flex items-center gap-1 text-[11px] transition-all"
                            >
                              <Play className="w-3 h-3" />
                              <span>সক্রিয় করুন</span>
                            </button>
                          )}

                          {camp.status !== 'ended' && (
                            <button
                              onClick={() => handleToggleRaffleStatus(camp.id, 'ended')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[11px] transition-all"
                            >
                              সমাপ্ত করুন
                            </button>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
