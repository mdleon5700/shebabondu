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
  Loader2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Sparkles,
  X
} from 'lucide-react';
import { storage } from '@/lib/store';
import { getAllDistrictsList } from '@/lib/constants';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const getRedirectUrl = () => {
    return redirectTarget && /^\/(?!\/)/.test(redirectTarget) ? redirectTarget : '/dashboard';
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [district, setDistrict] = useState('ঢাকা');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Social Auth Modal
  const [socialModal, setSocialModal] = useState<{ open: boolean; provider: 'google' | 'facebook' | null }>({
    open: false,
    provider: null
  });

  const allDistricts = getAllDistrictsList 
    ? getAllDistrictsList().map(d => (typeof d === 'string' ? d : d.bn))
    : [
        'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ',
        'কুমিল্লা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'বগুড়া', 'যশোর', 'দিনাজপুর', 'টাঙ্গাইল', 'পাবনা'
      ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password) {
      setErrorMsg('সকল প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Call canonical server registration endpoint
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
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
        name: data.user?.name || name,
        phone: data.user?.phone || phone
      });

      const user = storage.getUser();
      user.id = data.user?.id || user.id;
      user.name = data.user?.name || name;
      user.phone = data.user?.phone || phone;
      user.district = data.user?.district || district;
      storage.updateUser(user);

      router.push(getRedirectUrl());
    } catch (err: any) {
      setErrorMsg(err.message || 'রেজিস্ট্রেশনে ত্রুটি হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Social Auth Handler
  const handleSocialAuth = async (provider: 'google' | 'facebook', email: string, displayName: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
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
      router.push(getRedirectUrl());
    } catch (err: any) {
      setErrorMsg(err.message || 'সোশ্যাল সাইন-আপ প্রক্রিয়াকরণে সমস্যা হয়েছে।');
      setSocialModal({ open: false, provider: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            প্রার্থী <span className="text-emerald-700">ফ্রি রেজিস্ট্রেশন</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            ১ বার তথ্য সেভ করুন, সকল সরকারি ও ব্যাংক জবে ১-ক্লিকে আবেদন করুন
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণ নাম (বাংলা বা ইংরেজি) *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: মোঃ তানভীর হাসান"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">নিজ জেলা *</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                list="district-options"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="জেলা নির্বাচন বা লিখুন"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
              />
              <datalist id="district-options">
                {allDistricts.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড নির্ধারণ করুন (কমপক্ষে ৬ অক্ষর) *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড দিন"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>ফ্রি অ্যাকাউন্ট খুলুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Social Sign Up Divider */}
          <div className="relative py-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              অথবা সোশ্যাল দিয়ে সাইনআপ
            </span>
          </div>

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

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
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
                  `guest.${Date.now()}@gmail.com`,
                  socialModal.provider === 'google' ? 'Google গেস্ট ইউজার' : 'Facebook গেস্ট ইউজার'
                )}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  +
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900">নতুন প্রোফাইল তৈরি করুন</div>
                  <div className="text-[11px] text-slate-500">স্বয়ংক্রিয়ভাবে তথ্য সিঙ্ক হবে</div>
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
    <div className="min-h-[85vh] flex items-center justify-center px-3 sm:px-6 py-8 sm:py-12 bg-slate-50/60">
      <Suspense fallback={<div className="text-xs text-slate-400 font-bold">লোড হচ্ছে...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
