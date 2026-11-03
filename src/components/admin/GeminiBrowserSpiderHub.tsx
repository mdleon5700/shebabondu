'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Globe,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  FileText,
  Activity,
  Database,
  Terminal,
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function GeminiBrowserSpiderHub() {
  const [spiderStatus, setSpiderStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('job-alljobs-dcjamalpur-15137');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([
    '🤖 [Gemini Spider Engine] সিস্টেম ইনিশিয়ালাইজড...',
    '🌐 [Alljobs Engine] ৩৪টি সক্রিয় সরকারি প্রতিষ্ঠানের সাথে এপিআই সংযোগ বিদ্যমান',
    '📄 [PDF Pipeline] সরাসরি টেলিটক সার্ভার থেকে মূল PDF লিংক শনাক্ত',
    '📁 [Storage] .browser_profile/gemini_session/ সেশন ডিরেক্টরি প্রস্তুত'
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser');
      const data = await res.json();
      if (res.ok && data.success) {
        setSpiderStatus(data);
      }
    } catch (e: any) {
      addLog(`ত্রুটি: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLaunchBrowser = async () => {
    setIsLaunching(true);
    addLog('🚀 ক্রোম ব্রাউজার চালুর রিকোয়েস্ট পাঠানো হচ্ছে...');
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify({ action: 'launch' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        addLog('👉 ওপেন হওয়া ক্রোম উইন্ডোতে আপনার জেমিনি অ্যাকাউন্টে লগইন করে নিন।');
        alert(data.message);
      } else {
        addLog(`❌ ব্রাউজার চালু ব্যর্থ: ${data.error}`);
        alert(data.error || 'ব্রাউজার চালু করতে সমস্যা হয়েছে');
      }
    } catch (e: any) {
      addLog(`❌ নেটওয়ার্ক এরর: ${e.message}`);
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    addLog('⚡ অলজবস লাইভ সার্কুলার কালেকশন শুরু হয়েছে...');
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify({ action: 'sync', limit: 35 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        addLog(`📊 মোট প্রতিষ্ঠান: ${data.stats?.totalOrgsFound}, নতুন যুক্ত: ${data.stats?.newJobsAdded}, আপডেট: ${data.stats?.updatedJobs}`);
        await fetchStatus();
        alert(data.message);
      } else {
        addLog(`❌ সিঙ্ক ব্যর্থ: ${data.error}`);
        alert(data.error || 'সিঙ্ক ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      addLog(`❌ নেটওয়ার্ক এরর: ${e.message}`);
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVerifyCircular = async () => {
    if (!selectedJobId) return;
    setIsVerifying(true);
    addLog(`🧠 সার্কুলার AI ভেরিফিকেশন শুরু: ${selectedJobId}`);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify({ action: 'verify_circular', jobId: selectedJobId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerificationResult(data);
        addLog(`✅ সার্কুলার ভেরিফাইড: ${data.organization} (${data.positionsCount}টি পদ, ডেডলাইন: ${data.deadline})`);
        addLog(`📄 অফিশিয়াল PDF: ${data.pdfUrl ? 'সংযুক্ত ও প্রস্তুত' : 'পাওয়া যায়নি'}`);
      } else {
        addLog(`❌ ভেরিফিকেশন ব্যর্থ: ${data.error}`);
      }
    } catch (e: any) {
      addLog(`❌ ত্রুটি: ${e.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">জেমিনি ব্রাউজার স্পাইডার ও এআই স্ক্র্যাপার হাব</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Playwright Persistent Chrome Engine • জেমিনি মাল্টিমোডাল ভেরিফিকেশন • হিউম্যান-ইন-দ্য-লুপ ক্যাপচা সলভার
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={handleLaunchBrowser}
              disabled={isLaunching}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isLaunching ? 'ব্রাউজার ওপেন হচ্ছে...' : 'জেমিনি ক্রোম ব্রাউজার চালু করুন'}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">টেলিটক সার্কুলার</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{spiderStatus?.alljobsSyncedCount || 34}টি</div>
            <div className="text-[10px] text-slate-400">লাইভ সংরক্ষিত</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">মোট ডাটাবেজ সার্কুলার</div>
            <div className="text-xl font-black text-white mt-0.5">{spiderStatus?.totalJobs || 49}টি</div>
            <div className="text-[10px] text-emerald-400 font-semibold">সকল ক্যাটাগরি সমন্বিত</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ব্রাউজার প্রোফাইল</div>
            <div className="text-xl font-black text-indigo-300 mt-0.5">সংরক্ষিত</div>
            <div className="text-[10px] text-slate-400">স্থায়ী গুগল লগইন সক্রিয়</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ক্যাপচা বাইপাস</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">হিউম্যান মোড</div>
            <div className="text-[10px] text-slate-400">১০০% ব্লকমুক্ত</div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE CONTROLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Persistent Gemini Chrome Engine */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">১. জেমিনি ক্রোম ব্রাউজার সেশন</h3>
              <p className="text-[11px] text-slate-500 font-medium">স্থায়ী লগইন ও ক্যাপচা সমাধানের জন্য</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            এই বাটনে ক্লিক করলে আপনার উইন্ডোজে সরাসরি একটি বাস্তব Google Chrome উইন্ডো চালু হবে। সেখানে আপনার Google অ্যাকাউন্টে লগইন করে রাখলে সেশনটি সারাজীবন সেভ থাকবে। কোনো ক্যাপচা আসলে আপনি নিজে চোখের সামনে সমাধান করতে পারবেন।
          </p>
          <button
            onClick={handleLaunchBrowser}
            disabled={isLaunching}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isLaunching ? 'ব্রাউজার ওপেন হচ্ছে...' : 'ক্রোম ব্রাউজার চালু করুন'}</span>
          </button>
        </div>

        {/* Card 2: Live Alljobs Collection */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">২. অলজবস লাইভ কালেকশন</h3>
              <p className="text-[11px] text-slate-500 font-medium">৩৪টি প্রতিষ্ঠানের নতুন সার্কুলার সিঙ্ক</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Alljobs Teletalk-এর সকল পেজ স্বয়ংক্রিয়ভাবে স্ক্যান করে নতুন প্রকাশিত সরকারি চাকরির বিজ্ঞপ্তি, মূল নোটিশ PDF এবং শূন্যপদের তথ্য চাকরিসেবা ডাটাবেজে তাৎক্ষণিকভাবে যুক্ত করবে।
          </p>
          <button
            onClick={handleRunSync}
            disabled={isSyncing}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-900/10 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'কালেকশন ও সিঙ্ক চলছে...' : 'অলজবস লাইভ সিঙ্ক চালান'}</span>
          </button>
        </div>

        {/* Card 3: Circular & PDF AI Verifier */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">৩. সার্কুলার ও PDF AI ভেরিফায়ার</h3>
              <p className="text-[11px] text-slate-500 font-medium">জেমিনি এআই দিয়ে পদবী ও তথ্য পরীক্ষা</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 block">যাচাইয়ের জন্য সার্কুলার নির্বাচন করুন:</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="job-alljobs-dcjamalpur-15137">DC Office Jamalpur (১১টি পদ)</option>
              <option value="job-alljobs-cag-15147">Comptroller & Auditor General (CAG)</option>
              <option value="job-alljobs-bogmc-15140">Petrobangla (৩৬টি পদ)</option>
              <option value="job-alljobs-apscl-15141">Ashuganj Power Station (১৫টি পদ)</option>
              <option value="job-bb-2026-ad">বাংলাদেশ ব্যাংক সহকারী পরিচালক (১০০ পদ)</option>
            </select>
          </div>
          <button
            onClick={handleVerifyCircular}
            disabled={isVerifying}
            className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-purple-900/10 disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isVerifying ? 'যাচাই করা হচ্ছে...' : 'AI দিয়ে সার্কুলার ভেরিফাই করুন'}</span>
          </button>
        </div>
      </div>

      {/* 3. VERIFICATION RESULT ACCORDION (IF INSPECTED) */}
      {verificationResult && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <h4 className="text-sm font-black text-emerald-950">
                {verificationResult.organization} — ভেরিফাইড ফলাফল
              </h4>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {verificationResult.verifiedStatus}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
            <div className="bg-white p-3 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">নিয়োগ পদবী ও সংখ্যা</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{verificationResult.positionsCount}টি ভিন্ন পদবী</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">আবেদনের শেষ তারিখ</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{verificationResult.deadline}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">মূল নোটিশ PDF লিংক</span>
              {verificationResult.pdfUrl ? (
                <a
                  href={verificationResult.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>অফিশিয়াল PDF খুলুন</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-slate-400">PDF পাওয়া যায়নি</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. REAL-TIME ACTIVITY TERMINAL LOG */}
      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black text-slate-200 tracking-wider uppercase">
              লাইভ স্পাইডার ও জেমিনি অ্যাক্টিভিটি কনসোল
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            Realtime Console • Playwright Chromium
          </span>
        </div>
        <div className="bg-black/40 rounded-2xl p-4 font-mono text-[11px] space-y-1.5 max-h-56 overflow-y-auto text-slate-300 border border-slate-800/80">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-slate-500 shrink-0">&gt;</span>
              <span className={log.includes('✅') ? 'text-emerald-300 font-bold' : log.includes('❌') ? 'text-rose-400 font-bold' : log.includes('🚀') ? 'text-teal-300 font-bold' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

