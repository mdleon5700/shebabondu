'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Lock, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  KeyRound, 
  Shield, 
  User, 
  Phone, 
  Mail, 
  Check 
} from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Load user profile
  useEffect(() => {
    // 1. Initial local profile
    const localUser = storage.getUser();
    if (localUser) {
      setProfile(localUser);
    }

    // 2. Try fetching from auth me
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setProfile(data.user);
          }
        }
      } catch (err) {
        console.warn('Auth fetch skipped', err);
      }
    };
    fetchMe();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('বর্তমান পাসওয়ার্ড প্রদান করা আবশ্যক।');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/candidate/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess(data.message || 'পাসওয়ার্ড সফলভাবে হালনাগাদ করা হয়েছে!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 5000);
      } else {
        setPasswordError(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      platform: 'Chakri Sheba (চাকরি সেবা)',
      profile: profile || storage.getUser(),
      documents: storage.getDocuments(),
      applications: storage.getApplications(),
      savedJobs: storage.getSavedJobIds()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chakrisheba-my-data-${profile?.phone || 'profile'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-700" />
          <span>অ্যাকাউন্ট সেটিংস ও নিরাপত্তা</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          পাসওয়ার্ড পরিবর্তন, অ্যাকাউন্ট ভেরিফিকেশন স্ট্যাটাস এবং ব্যক্তিগত ডেটা ব্যাকআপ ও প্রাইভেসি কন্ট্রোল।
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-700" />
          <span>অ্যাকাউন্ট প্রোফাইল ও নিরাপত্তা অবস্থা</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 font-bold block text-[10px]">অ্যাকাউন্ট স্ট্যাটাস:</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span className="font-black text-slate-900 text-xs">সক্রিয় (Active)</span>
            </div>
            <span className="text-[10px] text-slate-500">সকল আবেদন সুবিধা উন্মুক্ত</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 font-bold block text-[10px]">এনআইডি ও পরিচয়পত্র যাচাই:</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              {profile?.isVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-black text-emerald-700 text-xs">যাচাইকৃত (Verified)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="font-black text-blue-800 text-xs">যাচাই সম্পন্ন</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-slate-500">ভল্ট ডকুমেন্ট সুরক্ষিত</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 font-bold block text-[10px]">নিবন্ধিত মোবাইল:</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-black font-mono text-slate-900 text-xs">{profile?.phone || '01700000000'}</span>
            </div>
            <span className="text-[10px] text-slate-500">ইউজার আইডি: {profile?.id || 'USR-AUTO'}</span>
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <form onSubmit={handlePasswordSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>পাসওয়ার্ড পরিবর্তন</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            অ্যাকাউন্টের সুরক্ষার জন্য নিয়মিত শক্তিশালী পাসওয়ার্ড ব্যবহার করুন (ন্যূনতম ৬ অক্ষর)।
          </p>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-2 text-xs text-rose-800 font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">বর্তমান পাসওয়ার্ড:</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="বর্তমান পাসওয়ার্ড লিখুন" 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white transition-all text-xs" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">নতুন পাসওয়ার্ড:</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="কমপক্ষে ৬ অক্ষর" 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white transition-all text-xs" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">নতুন পাসওয়ার্ড নিশ্চিত করুন:</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন" 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white transition-all text-xs" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            {isChangingPassword ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>হালনাগাদ করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>পাসওয়ার্ড আপডেট করুন</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Data Export & Privacy */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>ব্যক্তিগত ডেটা ব্যাকআপ ও অধিকার (GDPR Compliance)</span>
        </h3>
        <p className="text-slate-500 leading-relaxed">
          চাকরি সেবার প্রাইভেসি নীতি অনুযায়ী আপনি যেকোনো সময় আপনার অ্যাকাউন্টে সংরক্ষিত বায়োডাটা, শিক্ষাগত সনদ তথ্য, টেলিটক আবেদনের হিস্ট্রি এবং ওয়ালেট ট্রানজেকশন ডেটা এক ক্লিকে সম্পূর্ণ ব্যাকআপ হিসেবে ডাউনলোড করে নিতে পারবেন।
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-800 rounded-xl font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>আমার সমস্ত ডেটা ডাউনলোড করুন (JSON Format)</span>
          </button>
        </div>
      </div>
    </div>
  );
}