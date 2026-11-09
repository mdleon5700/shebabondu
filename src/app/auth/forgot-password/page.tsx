'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  KeyRound, 
  Phone, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { storage } from '@/lib/store';

function ForgotPasswordWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const getRedirectUrl = () => {
    return redirectTarget && /^\/(?!\/)/.test(redirectTarget) ? redirectTarget : '/dashboard';
  };

  // Step 1: Identifier, Step 2: OTP & Timer, Step 3: New Password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [maskedTarget, setMaskedTarget] = useState<string>('');
  const [testOtp, setTestOtp] = useState<string>('');

  // 60-Second Countdown Timer for Step 2
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMsg('অনুগ্রহ করে আপনার নিবন্ধিত মোবাইল নম্বর বা ইমেইল প্রদান করুন।');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp', identifier: cleanId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ওটিপি পাঠাতে ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।');
      }

      setMaskedTarget(data.maskedTarget || cleanId);
      setTestOtp(data.testOtp || '');
      setSuccessMsg(data.message || 'আপনার ঠিকানায় ৬-ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।');
      setStep(2);
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'সার্ভারে সংযোগ ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg('সঠিক ৬-ডিজিটের ভেরিফিকেশন কোড (OTP) প্রদান করুন।');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          identifier: identifier.trim(),
          otp: cleanOtp
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক কোড দিন।');
      }

      setSuccessMsg('ওটিপি সফলভাবে যাচাই হয়েছে! এবার আপনার নতুন পাসওয়ার্ড নির্ধারণ করুন।');
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'যাচাইকরণে ত্রুটি হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password & Auto-Login
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('উভয় পাসওয়ার্ড হুবহু একই হতে হবে।');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      }

      // Synchronize session cookie & storage token
      if (data.token && typeof document !== 'undefined') {
        document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem('cs_session_token', data.token);
      }

      if (data.user) {
        storage.setAuth({
          isLoggedIn: true,
          role: 'candidate',
          name: data.user.name,
          phone: data.user.phone,
          userId: data.user.id
        });
        storage.updateUser({ ...storage.getUser(), ...data.user });
      }

      setSuccessMsg('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      setTimeout(() => {
        window.location.href = getRedirectUrl();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'পাসওয়ার্ড পরিবর্তনে ত্রুটি হয়েছে।');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 relative">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            পাসওয়ার্ড <span className="text-amber-600">রিকভারি ও রিসেট</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            ৩টি সহজ ধাপে নিরাপদ ওটিপি যাচাইয়ের মাধ্যমে পাসওয়ার্ড উদ্ধার করুন
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
          <div className={`p-2 rounded-xl transition-all ${
            step === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-400'
          }`}>
            <span>১. তথ্য দিন</span>
          </div>
          <div className={`p-2 rounded-xl transition-all ${
            step === 2 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-400'
          }`}>
            <span>২. ওটিপি যাচাই</span>
          </div>
          <div className={`p-2 rounded-xl transition-all ${
            step === 3 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-400'
          }`}>
            <span>৩. নতুন পাসওয়ার্ড</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Identifier */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                নিবন্ধিত মোবাইল নম্বর বা ইমেইল *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="যেমন: 017XXXXXXXX বা candidate@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                আপনার অ্যাকাউন্টে নিবন্ধিত নম্বরে একটি ৬-ডিজিটের ওটিপি পাঠানো হবে।
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ওটিপি পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>ওটিপি কোড পাঠান</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & Countdown */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-1">
              <span className="text-[11px] text-amber-800 font-semibold block">
                ভেরিফিকেশন কোড পাঠানো হয়েছে:
              </span>
              <strong className="text-xs font-mono font-bold text-slate-900">
                {maskedTarget || identifier}
              </strong>
            </div>

            {testOtp && (
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600">টেস্টিং ওটিপি কোড:</span>
                <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-slate-300 text-emerald-800 tracking-wider">
                  {testOtp}
                </strong>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ৬-ডিজিটের ভেরিফিকেশন কোড (OTP) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="১২৩৪৫৬"
                className="w-full text-center tracking-widest font-mono text-lg py-2.5 rounded-xl border border-slate-300 text-slate-900 font-black focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Countdown Timer & Resend Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => { setStep(1); setErrorMsg(null); }}
                className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>নম্বর পরিবর্তন</span>
              </button>

              <div>
                {canResend ? (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRequestOtp()}
                    className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>পুনরায় ওটিপি পাঠান</span>
                  </button>
                ) : (
                  <span className="text-slate-400 font-mono text-[11px]">
                    পুনরায় পাঠান ({Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')})
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>যাচাই হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>কোড যাচাই ও পরবর্তী ধাপ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Set New Password & Confirm */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড দিন"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  পাসওয়ার্ড নিশ্চিত করুন *
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${
                    newPassword === confirmPassword ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {newPassword === confirmPassword ? '✓ মিল রয়েছে' : 'অমিল'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  newPassword && confirmPassword && newPassword === confirmPassword 
                    ? 'text-emerald-600' 
                    : 'text-slate-400'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ ও প্রবেশ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>পাসওয়ার্ড পরিবর্তন ও লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          মনে পড়েছে?{' '}
          <Link
            href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'}
            className="text-emerald-700 font-bold hover:underline"
          >
            সরাসরি লগইন পেজে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 sm:px-6 py-6 sm:py-10 bg-slate-50/60">
      <Suspense fallback={<div className="text-xs text-slate-400 font-bold">লোড হচ্ছে...</div>}>
        <ForgotPasswordWizard />
      </Suspense>
    </div>
  );
}
