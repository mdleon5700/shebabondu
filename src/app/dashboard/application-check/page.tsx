'use client';
import { fetchPublicJobs } from '@/lib/public-jobs-client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck2, 
  ArrowRight
} from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile, JobCircular, CandidateDocument } from '@/lib/types';

export default function ApplicationCheckPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile>(storage.getUser());
  const [vaultDocs, setVaultDocs] = useState<CandidateDocument[]>(storage.getDocuments());
  const [jobs, setJobs] = useState<JobCircular[]>(storage.getJobs());
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    setProfile(storage.getUser());
    setVaultDocs(storage.getDocuments());

    // Fetch live public jobs
    fetchPublicJobs().then(jobs => { 
      setJobs(jobs); 
      if (jobs.length > 0) setSelectedJobId(jobs[0].id); 
    }).catch(() => {});

    // Sync live profile from API
    const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/profile', { headers, cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && (d.user || d.profile)) {
          setProfile(d.user || d.profile);
        }
      })
      .catch(() => {});

    // Sync live documents from API
    fetch('/api/documents', { headers, cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && Array.isArray(d.documents)) {
          setVaultDocs(d.documents);
        }
      })
      .catch(() => {});
  }, []);

  const selectedJob = useMemo(() => {
    return jobs.find(j => j.id === selectedJobId) || jobs[0];
  }, [jobs, selectedJobId]);

  // Check 7 key readiness rules
  const checks = useMemo(() => {
    const list = [];

    // 1. Photo 300x300
    const hasPhoto = Boolean(profile.photoUrl) || vaultDocs.some(d => d.type === 'photo' && Boolean(d.fileUrl));
    list.push({
      id: 'photo',
      title: 'প্রার্থীর ছবি (টেলিটক ৩০০×৩০০ পিক্সেল ও <১০০ KB)',
      passed: hasPhoto,
      status: hasPhoto ? 'OK' : 'MISSING',
      message: hasPhoto ? 'ছবি ভেরিফাইড ও প্রিসেট মাপে প্রস্তুত রয়েছে।' : 'ছবি অনুপস্থিত! ডকুমেন্ট ভল্ট থেকে ৩০০×৩০০ মাপে রিসাইজ করুন।',
      actionUrl: '/dashboard/vault'
    });

    // 2. Signature 300x80
    const hasSig = Boolean(profile.signatureUrl) || vaultDocs.some(d => d.type === 'signature' && Boolean(d.fileUrl));
    list.push({
      id: 'signature',
      title: 'ডিজিটাল স্বাক্ষর (৩০০×৮০ পিক্সেল ও <৬০ KB)',
      passed: hasSig,
      status: hasSig ? 'OK' : 'MISSING',
      message: hasSig ? 'স্বাক্ষর ভেরিফাইড ও উপযুক্ত রেজোলিউশনে প্রস্তুত।' : 'স্বাক্ষর অনুপস্থিত! ভল্ট থেকে আপলোড করুন।',
      actionUrl: '/dashboard/vault'
    });

    // 3. Name consistency
    const hasNames = Boolean(profile.name && profile.nameBn && profile.fatherName && profile.motherName);
    list.push({
      id: 'names',
      title: 'ব্যক্তিগত তথ্য ও সার্টিফিকেটের নামের সামঞ্জস্য',
      passed: hasNames,
      status: hasNames ? 'OK' : 'MISSING',
      message: hasNames ? 'প্রার্থীর নাম, পিতা ও মাতার নাম পূর্ণাঙ্গভাবে সংরক্ষিত।' : 'পিতা বা মাতার নাম অসম্পূর্ণ।',
      actionUrl: '/dashboard/profile'
    });

    // 4. Education minimum requirement
    const hasEdu = Array.isArray(profile.education) && profile.education.length > 0;
    const hasHonours = hasEdu && profile.education.some(e => 
      e.level.includes('স্নাতক') || e.level.includes('Honours') || e.level.includes('বিএসসি') || e.level.includes('Degree')
    );
    list.push({
      id: 'education',
      title: `শিক্ষাগত যোগ্যতা (${selectedJob?.minEducation || 'স্নাতক'})`,
      passed: hasHonours || hasEdu,
      status: (hasHonours || hasEdu) ? 'OK' : 'WARNING',
      message: (hasHonours || hasEdu) 
        ? 'প্রার্থীর শিক্ষাগত ডিগ্রির তথ্য রয়েছে যা বিজ্ঞপ্তির শর্ত পূরণ করে।' 
        : 'বিজ্ঞপ্তি অনুযায়ী প্রয়োজনীয় শিক্ষাগত সনদের তথ্য পাওয়া যায়নি।',
      actionUrl: '/dashboard/profile'
    });

    // 5. Age Check
    let currentAge = 26;
    const dobStr = (profile as any)?.dateOfBirth || profile.dob;
    if (dobStr) {
      const birthYear = new Date(dobStr).getFullYear();
      if (!isNaN(birthYear) && birthYear > 1950) {
        currentAge = new Date().getFullYear() - birthYear;
      }
    }
    const minAge = selectedJob?.minAge ?? 18;
    const maxAge = selectedJob?.maxAge ?? 32;
    const ageMeets = currentAge >= minAge && currentAge <= maxAge;
    list.push({
      id: 'age',
      title: `বয়সসীমা যাচাই (${minAge}-${maxAge} বছর)`,
      passed: ageMeets,
      status: ageMeets ? 'OK' : 'WARNING',
      message: `প্রার্থীর হিসাবকৃত বয়স ${currentAge} বছর যা নির্ধারিত বয়সসীমার (${minAge}-${maxAge}) মধ্যে রয়েছে।`
    });

    // 6. District quota
    const districtOk = !selectedJob?.districts || 
      selectedJob.districts.length === 0 || 
      selectedJob.districts.includes('সকল') || 
      selectedJob.districts.includes('সকল জেলা') || 
      selectedJob.districts.includes(profile.district);
    list.push({
      id: 'district',
      title: 'জেলা কোটা যাচাই',
      passed: districtOk,
      status: districtOk ? 'OK' : 'WARNING',
      message: districtOk ? `প্রার্থীর নিজ জেলা (${profile.district || 'ঢাকা'}) এই সার্কুলারে আবেদনের যোগ্য।` : 'জেলা কোটায় বিধিনিষেধ থাকতে পারে।'
    });

    // 7. National ID / Birth Reg Card
    const hasNidDoc = Boolean(profile.nid) || vaultDocs.some(d => d.type === 'nid' || d.type === 'birth_cert');
    list.push({
      id: 'nid',
      title: 'জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন সনদ',
      passed: hasNidDoc,
      status: hasNidDoc ? 'OK' : 'MISSING',
      message: hasNidDoc ? 'এনআইডি / জন্ম নিবন্ধন তথ্য বা সনদ সফলভাবে সংযুক্ত রয়েছে।' : 'এনআইডি বা জন্ম নিবন্ধন সনদ অনুপস্থিত! ভল্টে যোগ করুন।',
      actionUrl: '/dashboard/vault'
    });

    return list;
  }, [profile, selectedJob, vaultDocs]);

  const passedCount = checks.filter(c => c.passed).length;
  const isReady = passedCount === checks.length;

  if (!isMounted) {
    return (
      <div className="space-y-6 max-w-5xl animate-pulse p-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-100 rounded-2xl mb-4"></div>
        <div className="h-64 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl" data-testid="application-check-page">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>আবেদনপূর্ব ভুল শনাক্তকরণ ইঞ্জিন</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-emerald-700" />
          <span>আবেদন প্রস্তুতি ও প্রি-ফ্লাইট ভ্যালিডেশন</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          টেলিটক বা সরকারি পোর্টালে ফর্ম সাবমিট করার আগে ভুল শনাক্ত করুন, যাতে ফি পরিশোধের পর আবেদন বাতিল না হয়।
        </p>
      </div>

      {/* Target Job Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-700 block">
          যে চাকরির জন্য প্রস্তুতি ও ভ্যালিডেশন যাচাই করতে চান:
        </label>
        <select
          data-testid="job-selector"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600/30"
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} — {job.organization}
            </option>
          ))}
        </select>
      </div>

      {/* Readiness Score Card */}
      <div 
        data-testid="readiness-score-card"
        className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isReady ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'
        }`}
      >
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            সামগ্রিক আবেদন রেডিনেস স্কোর
          </div>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span data-testid="readiness-count" suppressHydrationWarning>
              {isMounted ? passedCount : checks.length} / {checks.length} টি শর্ত পূরণ হয়েছে
            </span>
            {isReady && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">১০০% প্রস্তুত</span>}
          </div>
          <p className="text-xs text-slate-600">
            {isReady ? 'আপনার প্রোফাইল এই সার্কুলারে ১-ক্লিকে নির্ভুল আবেদনের জন্য সম্পূর্ণ প্রস্তুত।' : 'কিছু তথ্য বা ডকুমেন্টে সতর্কতা রয়েছে। সংশোধনের পরামর্শ অনুসরণ করুন।'}
          </p>
        </div>

        {isReady && selectedJob && (
          <Link
            data-testid="apply-direct-btn"
            href={`/apply/${selectedJob.id}`}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span>১-ক্লিকে আবেদন সাবমিট করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Checks Checklist */}
      <div className="space-y-3">
        {checks.map((item) => (
          <div
            key={item.id}
            data-testid={`check-item-${item.id}`}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {item.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-xs sm:text-sm text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500">{item.message}</div>
              </div>
            </div>

            {item.actionUrl && !item.passed && (
              <Link
                href={item.actionUrl}
                className="text-xs font-bold text-emerald-700 hover:underline flex-shrink-0 self-end sm:self-center"
              >
                সংশোধন করুন →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
