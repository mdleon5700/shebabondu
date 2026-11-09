'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Phone, 
  Mail,
  User,
  ArrowRight, 
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { storage } from '@/lib/store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>((searchParams.get('tab') === 'admin') ? 'admin' : (defaultTab as any));
  const [adminPinInput, setAdminPinInput] = useState('1234');
  
  // Login Form States (Empty by default for real visitors)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Helper for safe deep-link redirecting
  const getRedirectTarget = () => {
    const target = searchParams.get('redirect');
    return target && /^\/(?!\/)/.test(target) ? target : '/dashboard';
  };

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDistrict, setRegDistrict] = useState('ঢাকা');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);


  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotId, setForgotId] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotTestOtp, setForgotTestOtp] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Social Login Picker Modal
  const [socialModal, setSocialModal] = useState<{ open: boolean; provider: 'google' | 'facebook' | null }>({
    open: false,
    provider: null
  });

  // 1-Click Fast Admin Console Login
  const handleAdminDirectLogin = async (overridePin?: string) => {
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    const pin = (overridePin || adminPinInput || '1234').trim();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', adminPin: pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        storage.setAuth({
          isLoggedIn: true,
          role: 'admin',
          name: 'Super Admin',
          phone: 'ADMIN-SUPER',
          userId: 'ADMIN-SUPER'
        });
        localStorage.setItem('cs_admin_auth', 'verified');
        localStorage.setItem('cs_admin_pin', pin);
        if (data.token && typeof document !== 'undefined') {
          document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=2592000; SameSite=Lax`;
          localStorage.setItem('cs_session_token', data.token);
        }
        setSuccessMsg('অ্যাডমিন কনসোলে সফলভাবে প্রবেশ করা হয়েছে!');
        setTimeout(() => router.push('/admin'), 400);
      } else {
        setError(data.error || 'ভুল অ্যাডমিন পিন!');
        setIsSubmitting(false);
      }
    } catch {
      setError('সার্ভার সংযোগে সমস্যা হয়েছে।');
      setIsSubmitting(false);
    }
  };

  // Handle Multi-Identifier Login (Mobile, Email, or Username)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setError('মোবাইল নম্বর, ইমেইল অথবা ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: loginIdentifier.trim(), 
          password: loginPassword, 
          role: 'candidate' 
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।');
        setIsSubmitting(false);
        return;
      }

      storage.setAuth({
        isLoggedIn: true,
        role: 'candidate',
        name: data.user?.name || data.user?.nameBn || 'চাকরিপ্রার্থী',
        phone: data.user?.phone || loginIdentifier,
        userId: data.user?.id || ''
      });

      if (data.token && typeof document !== 'undefined') {
        const maxAge = rememberMe ? 2592000 : 86400;
        document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
        localStorage.setItem('cs_session_token', data.token);
      }

      if (data.user) {
        const u = storage.getUser();
        storage.updateUser({ ...u, ...data.user });
      }

      setSuccessMsg('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      setTimeout(() => {
        router.push(getRedirectTarget());
      }, 700);
    } catch {
      setError('সার্ভার সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  // 1-Click Fast Demo Login for Testers / Reviewers
  const handleQuickDemoLogin = async () => {
    setError('');
    setIsSubmitting(true);
    setLoginIdentifier('01712-345678');
    setLoginPassword('123456');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: '01712-345678', 
          password: '123456', 
          role: 'candidate' 
        })
      });
      const data = await res.json();
      if (res.ok) {
        storage.setAuth({
          isLoggedIn: true,
          role: 'candidate',
          name: data.user?.name || data.user?.nameBn || 'চাকরিপ্রার্থী',
          phone: data.user?.phone || '01712-345678',
          userId: data.user?.id || ''
        });
        if (data.token && typeof document !== 'undefined') {
          document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=2592000; SameSite=Lax`;
          localStorage.setItem('cs_session_token', data.token);
        }
        if (data.user) {
          const u = storage.getUser();
          storage.updateUser({ ...u, ...data.user });
        }
        setSuccessMsg('ডেমো অ্যাকাউন্টে সফলভাবে প্রবেশ করা হয়েছে!');
        setTimeout(() => router.push(getRedirectTarget()), 600);
      } else {
        setError(data.error || 'ডেমো লগইন ব্যর্থ হয়েছে');
        setIsSubmitting(false);
      }
    } catch {
      setError('সার্ভারে সংযোগ ব্যর্থ হয়েছে।');
      setIsSubmitting(false);
    }
  };

  // Handle New Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName.trim() || !regPhone.trim() || !regPassword) {
      setError('পূর্ণ নাম, মোবাইল নম্বর এবং পাসওয়ার্ড পূরণ করুন।');
      return;
    }

    if (regPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim(),
          district: regDistrict,
          password: regPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
        setIsSubmitting(false);
        return;
      }

      storage.setAuth({
        isLoggedIn: true,
        role: 'candidate',
        name: data.user?.name || regName,
        phone: data.user?.phone || regPhone,
        userId: data.user?.id
      });

      if (data.token && typeof document !== 'undefined') {
        document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem('cs_session_token', data.token);
      }

      if (data.user) {
        storage.updateUser({ ...storage.getUser(), ...data.user });
      }

      setSuccessMsg('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম...');
      setTimeout(() => router.push(getRedirectTarget()), 800);
    } catch {
      setError('সার্ভার সংযোগে সমস্যা হয়েছে।');
      setIsSubmitting(false);
    }
  };

  // Handle Social Login / Signup Execution
  const handleSocialAuth = async (provider: 'google' | 'facebook', email: string, name: string) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'সোশ্যাল লগইন ব্যর্থ হয়েছে।');
        setIsSubmitting(false);
        setSocialModal({ open: false, provider: null });
        return;
      }

      storage.setAuth({
        isLoggedIn: true,
        role: 'candidate',
        name: data.user?.name || name,
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
      setTimeout(() => router.push(getRedirectTarget()), 700);
    } catch {
      setError('সোশ্যাল লগইন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
      setIsSubmitting(false);
      setSocialModal({ open: false, provider: null });
    }
  };

  // Forgot Password Step 1: Request OTP
  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    if (!forgotId.trim()) {
      setForgotError('অনুগ্রহ করে মোবাইল নম্বর অথবা ইমেইল লিখুন।');
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp', identifier: forgotId.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'রিকোয়েস্ট ব্যর্থ হয়েছে।');
        setIsForgotLoading(false);
        return;
      }
      setForgotMessage(data.message);
      setForgotTestOtp(data.testOtp || '');
      setForgotStep(2);
      setIsForgotLoading(false);
    } catch {
      setForgotError('সার্ভারে যোগাযোগ করা যায়নি।');
      setIsForgotLoading(false);
    }
  };

  // Forgot Password Step 2: Verify OTP
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotOtp.trim()) {
      setForgotError('৬-ডিজিটের ভেরিফিকেশন কোড লিখুন।');
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'verify_otp', 
          identifier: forgotId.trim(), 
          otp: forgotOtp.trim() 
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'ভুল ওটিপি কোড।');
        setIsForgotLoading(false);
        return;
      }
      setForgotMessage('কোড সঠিক হয়েছে! এবার নতুন পাসওয়ার্ড সেট করুন।');
      setForgotStep(3);
      setIsForgotLoading(false);
    } catch {
      setForgotError('যাচাইকরণে সমস্যা হয়েছে।');
      setIsForgotLoading(false);
    }
  };

  // Forgot Password Step 3: Reset Password
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('উভয় পাসওয়ার্ড একই হতে হবে।');
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reset_password', 
          identifier: forgotId.trim(), 
          otp: forgotOtp.trim(),
          newPassword: forgotNewPass
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
        setIsForgotLoading(false);
        return;
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

      setForgotMessage('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      setTimeout(() => {
        setShowForgotModal(false);
        router.push(getRedirectTarget());
      }, 900);
    } catch {
      setForgotError('পাসওয়ার্ড পরিবর্তনের সময় সমস্যা হয়েছে।');
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-slate-800">
      
      {/* Top Header & Logo */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-md">
          <Briefcase className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          চাকরি<span className="text-emerald-700">সেবা</span> অ্যাকাউন্টে প্রবেশ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {activeTab === 'login' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'মাত্র ১ মিনিটে ফ্রি অ্যাকাউন্ট তৈরি করুন'}
        </p>
      </div>

      {/* Mode Switcher Tabs (Login, Register & Admin PIN) */}
      <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-black ${
            activeTab === 'login' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>লগইন</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-black ${
            activeTab === 'register' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>নিবন্ধন</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('admin'); setError(''); setSuccessMsg(''); }}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-black ${
            activeTab === 'admin' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
          <span>অ্যাডমিন</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{successMsg}</span>
        </div>
      )}

      {/* 1. CANDIDATE LOGIN FORM */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Multi-Identifier Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              মোবাইল নম্বর, ইমেইল অথবা ইউজারনেম
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="যেমন: 017XXXXXXXX, tanvir@gmail.com বা tanvir2026"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password Input with Show/Hide */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••"
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

          {/* Remember Me & Forgot Password Controls */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-semibold text-[11px]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 accent-emerald-700 cursor-pointer"
              />
              <span>আমাকে মনে রাখুন (৩০ দিন)</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotStep(1);
                setForgotId(loginIdentifier || '');
                setForgotError('');
                setForgotMessage('');
              }}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>{isSubmitting ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Social Login Divider */}
          <div className="relative py-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              অথবা সোশ্যাল দিয়ে প্রবেশ
            </span>
          </div>

          {/* Social Login Buttons (Google & Facebook) */}
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

          {/* Quick Demo Test Chip */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-full text-[11px] font-bold transition-all shadow-2xs"
            >
              <span>⚡ ১-ক্লিক ডেমো অ্যাকাউন্ট দিয়ে সরাসরি টেস্ট করুন</span>
            </button>
          </div>

          {/* Bottom Switch Link */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
            চাকরি সেবায় নতুন প্রার্থী?{' '}
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
              className="text-emerald-700 font-bold hover:underline"
            >
              ১ মিনিটে ফ্রি অ্যাকাউন্ট তৈরি করুন
            </button>
          </div>
        </form>
      )}

      {/* 2. CANDIDATE REGISTRATION FORM */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">পূর্ণ নাম (বাংলা বা ইংরেজি) *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="যেমন: মোঃ তানভীর হাসান"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ইমেইল (ঐচ্ছিক)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">নিজ জেলা</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  placeholder="যেমন: ঢাকা, রাজশাহী"
                  className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">পাসওয়ার্ড নির্ধারণ করুন (কমপক্ষে ৬ অক্ষর) *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showRegPassword ? 'text' : 'password'}
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড দিন"
                className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>{isSubmitting ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'ফ্রি অ্যাকাউন্ট তৈরি করুন'}</span>
            <ArrowRight className="w-4 h-4" />
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

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSocialModal({ open: true, provider: 'google' })}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center justify-center gap-2"
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
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
            আগে থেকেই অ্যাকাউন্ট আছে?{' '}
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
              className="text-emerald-700 font-bold hover:underline"
            >
              সরাসরি লগইন করুন
            </button>
          </div>
        </form>
      )}

      {/* 3. ADMIN PANEL DIRECT LOGIN FORM */}
      {activeTab === 'admin' && (
        <form onSubmit={(e) => { e.preventDefault(); handleAdminDirectLogin(); }} className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-center">
            <span className="text-xs text-emerald-800 font-bold block mb-0.5">অ্যাডমিন ও টিম কন্ট্রোল প্যানেল</span>
            <span className="text-[11px] text-emerald-600">ডিফল্ট মাস্টার পিন: <strong>1234</strong> অথবা <strong>admin</strong></span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">অ্যাডমিন সিক্রেট পিন / মাস্টার পাসওয়ার্ড *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="পিন প্রদান করুন (যেমন: 1234)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono tracking-wider text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>{isSubmitting ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন কনসোলে প্রবেশ করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => handleAdminDirectLogin('1234')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-full text-xs font-black transition-all shadow-sm"
            >
              <span>⚡ ১-ক্লিকে অ্যাডমিন প্রবেশ (PIN: 1234)</span>
            </button>
          </div>
        </form>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <HelpCircle className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-lg font-black text-slate-900">পাসওয়ার্ড রিকভারি</h3>
              <p className="text-xs text-slate-500">
                {forgotStep === 1 && 'মোবাইল বা ইমেইল দিয়ে ওটিপি পাঠান'}
                {forgotStep === 2 && 'প্রাপ্ত ৬-ডিজিটের কোড দিন'}
                {forgotStep === 3 && 'নতুন পাসওয়ার্ড নির্ধারণ করুন'}
              </p>
            </div>

            {forgotError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            {/* STEP 1: Enter Identifier */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotRequestOtp} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    নিবন্ধিত মোবাইল নম্বর অথবা ইমেইল
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotId}
                    onChange={(e) => setForgotId(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX বা user@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isForgotLoading ? 'পাঠানো হচ্ছে...' : 'ওটিপি কোড পাঠান'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* STEP 2: Enter OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotVerifyOtp} className="space-y-3">
                {forgotTestOtp && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                    <span>টেস্টিং ওটিপি কোড:</span>
                    <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-950">
                      {forgotTestOtp}
                    </strong>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ৬-ডিজিটের ভেরিফিকেশন কোড (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="১২৩৪৫৬"
                    className="w-full text-center tracking-widest font-mono text-base px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isForgotLoading ? 'যাচাই হচ্ছে...' : 'কোড যাচাই করুন'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotResetPassword} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input
                    type="password"
                    required
                    value={forgotConfirmPass}
                    onChange={(e) => setForgotConfirmPass(e.target.value)}
                    placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isForgotLoading ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন ও লগইন'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SOCIAL LOGIN SELECTOR MODAL */}
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
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                {socialModal.provider === 'google' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
              </div>
              <h3 className="text-base font-black text-slate-900">
                {socialModal.provider === 'google' ? 'Google দিয়ে এক ক্লিকে প্রবেশ' : 'Facebook দিয়ে এক ক্লিকে প্রবেশ'}
              </h3>
              <p className="text-xs text-slate-500">
                নিচের যেকোনো প্রোফাইল বেছে নিয়ে সরাসরি লগইন বা সাইনআপ করুন:
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
                  <div className="font-bold text-xs text-slate-900 truncate">মোঃ তানভীর হাসান (বিদ্যমান প্রার্থী)</div>
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
                  <div className="font-bold text-xs text-slate-900">নতুন গেস্ট প্রোফাইল হিসেবে প্রবেশ</div>
                  <div className="text-[11px] text-slate-500">নতুন অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে তৈরি হবে</div>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  সাইনআপ
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 sm:px-6 py-8 sm:py-12 bg-slate-50/60">
      <Suspense fallback={<div className="text-xs text-slate-400 font-bold">লোড হচ্ছে...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
