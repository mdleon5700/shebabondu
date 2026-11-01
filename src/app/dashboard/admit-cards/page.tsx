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
  Printer
} from 'lucide-react';
import { storage } from '@/lib/store';
import { ApplicationRequest } from '@/lib/types';

export default function AdmitCardsPage() {
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync applications from storage and API
  useEffect(() => {
    let isMounted = true;
    
    // 1. Initial fast local state
    const localApps = storage.getApplications();
    if (localApps && localApps.length > 0) {
      setApplications(localApps);
    }

    // 2. Fetch authenticated backend applications
    const fetchApps = async () => {
      try {
        const res = await fetch('/api/applications');
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Completed or Fee Paid/Processing applications
  const validApplications = applications.filter(
    app => app.status === 'completed' || app.status === 'fee_paid' || app.status === 'processing' || app.status === 'submitted' || app.status === 'admit_issued'
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-700" />
            <span>অ্যাডমিট কার্ড ও আবেদন ট্র্যাকার</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার আবেদনকৃত চাকরির পরীক্ষার প্রবেশপত্র, রোল নম্বর ও অ্যাপ্লিক্যান্ট কপি সরাসরি ডাউনলোড করুন।
          </p>
        </div>

        <Link
          href="/jobs"
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start shadow-2xs"
        >
          <Briefcase className="w-4 h-4" />
          <span>নতুন চাকরির সার্কুলার দেখুন</span>
        </Link>
      </div>

      {validApplications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-800">এখনো কোনো চাকরির আবেদন সম্পন্ন হয়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              আপনি কোনো সরকারি বা ব্যাংক সার্কুলারে আবেদন করলে তার অ্যাপ্লিকেশন কপি ও অ্যাডমিট কার্ড এখানে স্বয়ংক্রিয়ভাবে যুক্ত হবে।
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
        <div className="space-y-3">
          {validApplications.map((item) => {
            const isCompleted = item.status === 'completed' || item.status === 'admit_issued' || item.status === 'fee_paid';
            const rollOrId = item.teleTalkTrackingId || item.id;
            const pdfUrl = item.applicantCopyPdfUrl || `/api/download?type=application&id=${item.id}`;

            return (
              <div
                key={item.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
              >
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isCompleted 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {isCompleted ? 'আবেদন সম্পন্ন ও নিশ্চিত' : 'প্রক্রিয়াধীন (Processing)'}
                    </span>

                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg text-xs font-mono text-slate-700">
                      <span className="text-[10px] text-slate-400 font-sans">ট্র্যাকিং/ইউজার আইডি:</span>
                      <strong className="font-bold">{rollOrId}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(rollOrId, item.id)}
                        className="text-slate-400 hover:text-emerald-700 transition-colors ml-0.5"
                        title="আইডি কপি করুন"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      তারিখ: {new Date(item.submittedAt || item.date || Date.now()).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 leading-snug">
                      {item.jobTitle}
                    </h3>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">
                      পদ: {item.postName}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>পরীক্ষার তারিখ: {isCompleted ? 'এসএমএসে জানানো হবে (শীঘ্রই)' : 'আবেদন যাচাই চলছে'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>কেন্দ্র: {item.candidateDistrict || 'ঢাকা'} ও সংশ্লিষ্ট বিভাগ</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  {/* Download Applicant Copy */}
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    title="আবেদনকারীর কপি ও ফি রশিদ ডাউনলোড করুন"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>অ্যাপ্লিক্যান্ট কপি</span>
                  </a>

                  {/* Admit Card Download or Waiting */}
                  {isCompleted ? (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>প্রবেশপত্র ডাউনলোড</span>
                    </a>
                  ) : (
                    <span className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-not-allowed text-center">
                      <Clock className="w-3.5 h-3.5" />
                      <span>অপেক্ষমান</span>
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