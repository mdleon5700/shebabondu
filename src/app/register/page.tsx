'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  UserCheck, 
  Phone, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Loader2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Sparkles,
  Wallet,
  FolderLock,
  Zap,
  X
} from 'lucide-react';
import { storage } from '@/lib/store';
import { BD_DIVISIONS_MAP } from '@/lib/constants';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const getRedirectUrl = () => {
    return redirectTarget && /^\/(?!\/)/.test(redirectTarget) ? redirectTarget : '/dashboard';
  };

  // Form States (Bilingual Name, Phone, District, Passwords)
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Social Auth Modal
  const [socialModal, setSocialModal] = useState<{ open: boolean; provider: 'google' | 'facebook' | null }>({
    open: false,
    provider: null
  });

  // Clean phone input for real-time validation
  const cleanPhone = phone
    .replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
    .replace(/\D/g, '')
    .replace(/^880/, '0');
  const isPhoneValid = /^01[3-9]\d{8}$/.test(cleanPhone);
  const isPhoneStarted = cleanPhone.length > 0;

  // Password Validation
  const isPasswordValid = password.length >= 6;
  const isConfirmMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isConfirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nameBn.trim() || !nameEn.trim()) {
      setErrorMsg('প্রার্থীর পূর্ণ নাম (বাংলা ও ইংরেজিতে) উভয় ফিল্ড পূরণ করুন।');
      return;
    }

    if (!isPhoneValid) {
      setErrorMsg('সঠিক ১১-সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড দুটি হুবহু মিলতে হবে।');
      return;
    }

    try {
      setIsSubmitting(true);

      // Call canonical server registration endpoint
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameEn.trim(),
          nameBn: nameBn.trim(),
          phone: cleanPhone,
          password,
          district: district.trim() || 'ঢাকা'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।');
      }

      // Set session cookie & localStorage token for bulletproof session persistence
      if (data.token) {
        document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem('cs_session_token', data.token);
      }

      // Sync local storage for client-side state
      storage.setAuth({
        isLoggedIn: true,
        role: 'candidate',
        userId: data.user?.id,
        name: data.user?.name || nameEn,
        phone: data.user?.phone || cleanPhone
      });

      const user = storage.getUser();
      user.id = data.user?.id || user.id;
      user.name = data.user?.name || nameEn;
      user.nameBn = data.user?.nameBn || nameBn;
      user.phone = data.user?.phone || cleanPhone;
      user.district = data.user?.district || district;
      user.walletBalance = 0; // Initialize zero-balance digital wallet
      storage.updateUser(user);

      setSuccessMsg('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      setTimeout(() => {
        window.location.href = getRedirectUrl();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'রেজিস্ট্রেশনে ত্রুটি হয়েছে।');
      setIsSubmitting(false);
    }
  };

  // Social Auth Handler
  const handleSocialAuth = async (provider: 'google' | 'facebook', email: string, displayName: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name: displayName })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'সোশ্যাল রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
      }

      storage.setAuth({
        isLoggedIn: true,
        role: 'candidate',
        name: data.user?.name || displayName,
        phone: data.user?.phone || '',
        userId: data.user?.id
      });

      if (data.token && typeof document !== 'undefined') {
        document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem('cs_session_token', data.token);
      }

      if (data.user) {
        storage.updateUser({ ...storage.getUser(), ...data.user });
      }

      setSocialModal({ open: false, provider: null });
      setSuccessMsg(`${provider === 'google' ? 'Google' : 'Facebook'} দিয়ে সফলভাবে প্রবেশ করা হয়েছে!`);
      setTimeout(() => {
        window.location.href = getRedirectUrl();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'সোশ্যাল সাইন-আপ প্রক্রিয়াকরণে সমস্যা হয়েছে।');
      setSocialModal({ open: false, provider: null });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            প্রার্থী <span className="text-emerald-700">ফ্রি রেজিস্ট্রেশন</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            ন্যূনতম প্রয়োজনীয় তথ্য দিয়ে মাত্র ২ মিনিটে অ্যাকাউন্ট তৈরি করুন
          </p>
        </div>

        {/* Feature Highlights: Wallet & Document Vault Auto-Provisioning */}
        <div className="p-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-[11px] font-bold text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-700" />
            <span>শূন্য ব্যালেন্সের ওয়ালেট</span>
          </div>
          <div className="h-3 w-px bg-emerald-300"></div>
          <div className="flex items-center gap-1.5">
            <FolderLock className="w-3.5 h-3.5 text-teal-700" />
            <span>৮-স্লটের ডকুমেন্ট ভল্ট</span>
          </div>
          <div className="h-3 w-px bg-emerald-300"></div>
          <div className="flex items-center gap-1.5 text-amber-800">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>১-ক্লিকে আবেদন</span>
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

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-sm">
          
          {/* Dual Bilingual Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পূর্ণ নাম (বাংলায় - NID অনুযায়ী) *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: মোঃ তানভীর হাসান"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name (in English - SSC) *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. MD. TANVIR HASAN"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Mobile Number with 11-digit Bangladesh Validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                সক্রিয় মোবাইল নম্বর (১১ ডিজিট) *
              </label>
              {isPhoneStarted && (
                <span className={`text-[10px] font-mono font-bold ${
                  isPhoneValid ? 'text-emerald-700' : 'text-amber-600'
                }`}>
                  {isPhoneValid ? '✓ সঠিক নম্বর' : `${cleanPhone.length}/১১ ডিজিট`}
                </span>
              )}
            </div>
            <div className="relative">
              <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isPhoneValid ? 'text-emerald-600' : 'text-slate-400'
              }`} />
              <input
                type="tel"
                required
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:outline-none placeholder:text-slate-400 ${
                  isPhoneValid 
                    ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20' 
                    : isPhoneStarted 
                    ? 'border-amber-400 focus:ring-amber-500' 
                    : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              {isPhoneValid && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              এই নম্বরে প্রবেশপত্র ও পরীক্ষার এসএমএস অ্যালার্ট পাঠানো হবে।
            </p>
          </div>

          {/* District Dropdown (64 Districts Grouped by 8 Divisions for Quota Matching) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              নিজ জেলা নির্বাচন (কোটা ও যোগ্যতার সাথে যুক্ত) *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {Object.entries(BD_DIVISIONS_MAP).map(([divKey, divData]) => (
                  <optgroup key={divKey} label={`${divData.bn} বিভাগ (${divKey})`}>
                    {divData.districts.map((d) => (
                      <option key={d.en} value={d.bn}>
                        {d.bn} ({d.en})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              সরকারি সার্কুলারের জেলাভিত্তিক শূন্যপদ ও কোটা নির্ধারণে ব্যবহৃত হবে।
            </p>
          </div>

          {/* Password & Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড দিন"
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
                  কনফার্ম পাসওয়ার্ড *
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${
                    isConfirmMatch ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {isConfirmMatch ? '✓ মিল রয়েছে' : 'অমিল'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isConfirmMatch ? 'text-emerald-600' : 'text-slate-400'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs text-slate-900 font-medium focus:ring-2 focus:outline-none ${
                    isConfirmMatch 
                      ? 'border-emerald-500 bg-emerald-50/20 focus:ring-emerald-500' 
                      : isConfirmMismatch 
                      ? 'border-rose-400 focus:ring-rose-500' 
                      : 'border-slate-300 focus:ring-emerald-500'
                  }`}
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>অ্যাকাউন্ট তৈরি ও ড্যাশবোর্ডে প্রবেশ হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>ফ্রি অ্যাকাউন্ট খুলুন ও প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Social Sign Up Divider */}
          <div className="relative py-1 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              অথবা সোশ্যাল দিয়ে সাইনআপ
            </span>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSocialModal({ open: true, provider: 'google' })}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center justify-center gap-2 transition-all hover:border-slate-400"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => setSocialModal({ open: true, provider: 'facebook' })}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center justify-center gap-2 transition-all hover:border-slate-400"
            >
              <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </form>

        {/* Existing User Login Link */}
        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <Link 
            href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'} 
            className="text-emerald-700 font-bold hover:underline"
          >
            সরাসরি লগইন করুন
          </Link>
        </div>
      </div>

      {/* Social Modal */}
      {socialModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSocialModal({ open: false, provider: null })}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {socialModal.provider === 'google' ? 'Google দিয়ে তাৎক্ষণিক রেজিস্ট্রেশন' : 'Facebook দিয়ে তাৎক্ষণিক রেজিস্ট্রেশন'}
              </h3>
              <p className="text-xs text-slate-500">
                নিচের যেকোনো প্রোফাইল বেছে নিয়ে এক ক্লিকে অ্যাকাউন্ট খুলুন:
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSocialAuth(
                  socialModal.provider || 'google',
                  'tanvir.jobseeker@gmail.com',
                  'মোঃ তানভীর হাসান'
                )}
                className="w-full p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  ত
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">মোঃ তানভীর হাসান</div>
                  <div className="text-[11px] text-slate-500 truncate">tanvir.jobseeker@gmail.com</div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  কানেক্ট
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth(
                  socialModal.provider || 'google',
                  `candidate.${Date.now()}@gmail.com`,
                  socialModal.provider === 'google' ? 'Google নিবন্ধিত প্রার্থী' : 'Facebook নিবন্ধিত প্রার্থী'
                )}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  +
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900">নতুন প্রার্থী প্রোফাইল তৈরি করুন</div>
                  <div className="text-[11px] text-slate-500">স্বয়ংক্রিয়ভাবে ভল্ট ও ওয়ালেট তৈরি হবে</div>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  রেজিস্টার
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 sm:px-6 py-6 sm:py-10 bg-slate-50/60">
      <Suspense fallback={<div className="text-xs text-slate-400 font-bold">লোড হচ্ছে...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
