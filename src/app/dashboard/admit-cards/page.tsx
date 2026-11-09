'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Download, 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  Printer,
  KeyRound,
  HelpCircle,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from 'lucide-react';
import { storage } from '@/lib/store';
import { ApplicationRequest } from '@/lib/types';

export default function AdmitCardsPage() {
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRecoveryGuide, setShowRecoveryGuide] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Initial local applications
    const localApps = storage.getApplications();
    if (localApps && localApps.length > 0) {
      setApplications(localApps);
    }

    const fetchApps = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/applications', { headers, cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.applications) && isMounted) {
            setApplications(data.applications);
          }
        }
      } catch (err) {
        console.warn('Could not fetch applications from API', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApps();
    return () => { isMounted = false; };
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validApplications = applications.filter(
    app => app.status === 'completed' || app.status === 'fee_paid' || app.status === 'processing' || app.status === 'submitted' || app.status === 'admit_issued'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16" data-testid="admit-cards-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>স্টেপ ১১ — প্রবেশপত্র ও টেলিটক ট্র্যাকিং হাব</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>অ্যাডমিট কার্ড ও আবেদন ট্র্যাকার</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার আবেদনকৃত সরকারি ও ব্যাংক পরীক্ষার প্রবেশপত্র, রোল নম্বর, ইউজার আইডি ও পাসওয়ার্ড রিকভারি।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            data-testid="recovery-guide-toggle"
            type="button"
            onClick={() => setShowRecoveryGuide(!showRecoveryGuide)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>আইডি/পাসওয়ার্ড উদ্ধার নির্দেশিকা</span>
            {showRecoveryGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Link
            href="/jobs"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Briefcase className="w-4 h-4" />
            <span>নতুন চাকরির সার্কুলার</span>
          </Link>
        </div>
      </div>

      {/* Collapsible Recovery Guide */}
      {showRecoveryGuide && (
        <div data-testid="recovery-guide-box" className="p-6 bg-amber-50/80 border border-amber-300 rounded-3xl space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-amber-900 border-b border-amber-200 pb-3">
            <KeyRound className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-sm">টেলিটক ইউজার আইডি ও পাসওয়ার্ড হারানোর ক্ষেত্রে রিকভারি গাইডলাইন</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-amber-950">
            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 space-y-2">
              <h4 className="font-black text-amber-900 flex items-center gap-1.5">
                <span>১. ইউজার আইডি (User ID) পুনরুদ্ধারের নিয়ম:</span>
              </h4>
              <p className="text-slate-700 leading-relaxed">
                টেলিটক সিমের মেসেজ অপশনে গিয়ে লিখুন:<br />
                <code className="px-2 py-1 bg-amber-100 font-mono font-bold text-slate-900 rounded block my-1">
                  [প্রতিষ্ঠান কোড] &lt;space&gt; HELP &lt;space&gt; PIN &lt;space&gt; [পিন নম্বর]
                </code>
                এবং পাঠিয়ে দিন <strong className="text-amber-900 font-bold">16222</strong> নম্বরে।
              </p>
            </div>

            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 space-y-2">
              <h4 className="font-black text-amber-900 flex items-center gap-1.5">
                <span>২. পাসওয়ার্ড (Password) পুনরুদ্ধারের নিয়ম:</span>
              </h4>
              <p className="text-slate-700 leading-relaxed">
                টেলিটক প্রিপেইড মোবাইল থেকে মেসেজে লিখুন:<br />
                <code className="px-2 py-1 bg-amber-100 font-mono font-bold text-slate-900 rounded block my-1">
                  [প্রতিষ্ঠান কোড] &lt;space&gt; HELP &lt;space&gt; USER &lt;space&gt; [ইউজার আইডি]
                </code>
                এবং পাঠিয়ে দিন <strong className="text-amber-900 font-bold">16222</strong> নম্বরে।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
            <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
            <span>জরুরি প্রয়োজনে টেলিটক হেল্পলাইন <strong>121</strong> অথবা চাকরি সেবা হটলাইনে যোগাযোগ করুন।</span>
          </div>
        </div>
      )}

      {/* Main List */}
      {validApplications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-800">এখনো কোনো চাকরির আবেদন সম্পন্ন হয়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              আপনি কোনো সরকারি বা ব্যাংক সার্কুলারে আবেদন করলে তার অ্যাপ্লিকেশন কপি ও অ্যাডমিট কার্ড এখানে স্বয়ংক্রিয়ভাবে ট্র্যাকিংয়ের জন্য যুক্ত হবে।
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <span>বর্তমান চাকরির সার্কুলার দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {validApplications.map((item) => {
            const isCompleted = item.status === 'completed' || item.status === 'admit_issued' || item.status === 'fee_paid';
            const userId = item.teleTalkUserId || item.teleTalkTrackingId || item.id;
            const password = item.teleTalkPassword || 'SMS-এ প্রেরিত';
            const pdfUrl = item.applicantCopyPdfUrl || `/api/download?type=application&id=${item.id}`;
            const admitCardUrl = item.admitCardUrl || item.applicantCopyPdfUrl || pdfUrl;

            return (
              <div
                key={item.id}
                data-testid="admit-card-card"
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-emerald-200"
              >
                <div className="space-y-3 max-w-2xl flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                      isCompleted 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {isCompleted ? '✓ আবেদন সম্পন্ন ও ভেরিফাইড' : '⏳ আবেদন প্রক্রিয়াধীন (Processing)'}
                    </span>

                    <span className="text-[11px] text-slate-500">
                      তারিখ: {new Date(item.submittedAt || item.date || Date.now()).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-900 leading-snug">
                      {item.jobTitle}
                    </h3>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">
                      পদ: {item.postName}
                    </p>
                  </div>

                  {/* Teletalk Credentials Block with 1-Click Copy */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {/* User ID Box */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono">
                      <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">ইউজার আইডি:</span>
                      <strong className="text-slate-800 font-bold">{userId}</strong>
                      <button
                        data-testid="copy-user-id-btn"
                        type="button"
                        onClick={() => handleCopy(userId, `uid-${item.id}`)}
                        className="text-slate-400 hover:text-emerald-700 transition-colors p-1 rounded-md hover:bg-slate-200/60"
                        title="ইউজার আইডি কপি করুন"
                      >
                        {copiedField === `uid-${item.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Password Box */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono">
                      <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">পাসওয়ার্ড:</span>
                      <strong className="text-slate-800 font-bold">{password}</strong>
                      {password !== 'SMS-এ প্রেরিত' && (
                        <button
                          data-testid="copy-password-btn"
                          type="button"
                          onClick={() => handleCopy(password, `pwd-${item.id}`)}
                          className="text-slate-400 hover:text-emerald-700 transition-colors p-1 rounded-md hover:bg-slate-200/60"
                          title="পাসওয়ার্ড কপি করুন"
                        >
                          {copiedField === `pwd-${item.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4 pt-0.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>পরীক্ষার তারিখ: {isCompleted ? 'এসএমএসে জানানো হবে (আসন্ন)' : 'আবেদন যাচাই চলছে'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>কেন্দ্র: {item.candidateDistrict || 'ঢাকা'} মহানগরী</span>
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <a
                    data-testid="btn-applicant-copy"
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    title="আবেদনকারীর কপি ও ফি রশিদ ডাউনলোড করুন"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>অ্যাপ্লিক্যান্ট কপি</span>
                  </a>

                  {isCompleted ? (
                    <a
                      data-testid="btn-download-admit"
                      href={admitCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>প্রবেশপত্র ডাউনলোড</span>
                    </a>
                  ) : (
                    <span className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed text-center">
                      <Clock className="w-4 h-4" />
                      <span>প্রবেশপত্র অপেক্ষমান</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}