'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  CreditCard, 
  ShieldCheck,
  Check,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useCandidateData } from '@/components/CandidateDataProvider';

export default function CvBuilderPage() {
  const { profile, documents, loading, refresh } = useCandidateData();
  const [template, setTemplate] = useState<'modern' | 'classic'>('modern');
  const [copied, setCopied] = useState(false);

  const photoUrl = profile?.photoUrl || documents.find(d => d.type === 'photo')?.fileUrl;
  const signatureUrl = profile?.signatureUrl || documents.find(d => d.type === 'signature')?.fileUrl;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!profile) return;
    const lines = [
      `জীবনবৃত্তান্ত (CURRICULUM VITAE)`,
      `---------------------------------`,
      `নাম: ${profile.name} (${profile.nameBn || ''})`,
      `পিতার নাম: ${profile.fatherName || ''}`,
      `মাতার নাম: ${profile.motherName || ''}`,
      `ফোন: ${profile.phone || ''}`,
      `ইমেইল: ${profile.email || ''}`,
      `নিজ জেলা: ${profile.district || ''}`,
      `জন্ম তারিখ: ${(profile as any).dateOfBirth || profile.dob || ''}`,
      `জাতীয় পরিচয়পত্র: ${profile.nid || ''}`,
      `বর্তমান ও স্থায়ী ঠিকানা: ${profile.permanentAddress || profile.address || ''}`,
      ``,
      `শিক্ষাগত যোগ্যতা:`,
      ...(profile.education || []).map((e, i) => `${i + 1}. ${e.degree} - ${e.boardOrUni} (${e.year}) | ফল: ${e.result} | বিষয়: ${e.majorSubject || 'সাধারণ'}`),
      ``,
      `কর্মঅভিজ্ঞতা:`,
      ...(profile.experiences || []).map((exp, i) => `${i + 1}. ${exp.designation || 'কর্মকর্তা'} - ${exp.company || exp.organization || 'প্রতিষ্ঠান'} (${exp.duration || (exp.startDate ? `${exp.startDate} - ${exp.endDate || 'বর্তমান'}` : 'অভিজ্ঞতা')})`),
      ``,
      `দক্ষতাসমূহ:`,
      (profile.skills || []).map(s => typeof s === 'string' ? s : (s as any).name || '').join(', ')
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading && !profile) {
    return (
      <div className="p-16 text-center text-xs font-bold text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-slate-700">সিভি তথ্য স্বয়ংক্রিয়ভাবে প্রস্তুত হচ্ছে...</p>
        <p className="text-slate-400">ভল্ট এবং প্রোফাইল থেকে তথ্যাদি সিঙ্ক করা হচ্ছে</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-xl mx-auto">
        <FileText className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">প্রোফাইল তথ্য পাওয়া যায়নি</h3>
        <p className="text-xs text-slate-500">সিভি তৈরির পূর্বে অনুগ্রহ করে প্রোফাইল হালনাগাদ করুন।</p>
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <span>প্রোফাইল তৈরি করুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const dobStr = (profile as any)?.dateOfBirth || profile.dob || '০১-০১-১৯৯৮';
  const calculateAge = () => {
    if (!dobStr) return '২৬ বছর';
    const birthYear = new Date(dobStr).getFullYear();
    if (!isNaN(birthYear) && birthYear > 1950) {
      return `${new Date().getFullYear() - birthYear} বছর`;
    }
    return '২৬ বছর';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16" data-testid="cv-builder-page">
      {/* Top Header & Actions Toolbar (Hidden on Print) */}
      <div className="no-print bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>বাংলাদেশ স্ট্যান্ডার্ড স্মার্ট সিভি জেনারেটর</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>স্মার্ট সিভি বিল্ডার (CV & Resume)</span>
          </h1>
          <p className="text-xs text-slate-500">
            আপনার ভল্ট ও প্রোফাইলের তথ্যের ওপর ভিত্তি করে সরকারি ও কর্পোরেট স্ট্যান্ডার্ড প্রফেশনাল জীবনবৃত্তান্ত।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Template Switcher */}
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              data-testid="template-btn-modern"
              onClick={() => setTemplate('modern')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                template === 'modern'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✨ মডার্ন প্রফেশনাল
            </button>
            <button
              data-testid="template-btn-classic"
              onClick={() => setTemplate('classic')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                template === 'classic'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏛️ ক্লাসিক বিডি সরকারি
            </button>
          </div>

          <button
            data-testid="copy-cv-btn"
            onClick={handleCopyText}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-xs"
            title="সিভির টেক্সট কপি করুন"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'কপি হয়েছে' : 'টেক্সট কপি'}</span>
          </button>

          <button
            data-testid="print-cv-btn"
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / PDF সংরক্ষণ</span>
          </button>
        </div>
      </div>

      {/* CV Live Document Preview Canvas */}
      <div className="printable-cv bg-white rounded-3xl border border-slate-200 shadow-lg max-w-4xl mx-auto overflow-hidden text-slate-800">
        {/* =========================================================
            TEMPLATE 1: MODERN PROFESSIONAL CORPORATE (মডার্ন)
           ========================================================= */}
        {template === 'modern' && (
          <div data-testid="cv-preview-modern" className="p-8 sm:p-12 space-y-8">
            {/* Modern Header Banner */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-emerald-600/20">
              <div className="space-y-2 flex-1">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-block">
                  CURRICULUM VITAE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {profile.name}
                </h2>
                {profile.nameBn && (
                  <p className="text-base font-bold text-slate-600">
                    {profile.nameBn}
                  </p>
                )}
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {profile.education?.[0]?.degree || 'প্রার্থী'} — {profile.district}, বাংলাদেশ
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>{profile.phone}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {profile.district}, বাংলাদেশ
                  </span>
                </div>
              </div>

              {photoUrl ? (
                <div className="shrink-0 w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-600/30 p-1 bg-white shadow-md">
                  <img src={photoUrl} alt={profile.name} className="w-full h-full object-cover rounded-xl" />
                </div>
              ) : (
                <div className="shrink-0 w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-center p-2">
                  <User className="w-8 h-8 text-slate-300 mb-1" />
                  <span className="text-[10px] font-semibold">ছবি আপলোড নেই</span>
                </div>
              )}
            </div>

            {/* 2-Column Modern Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column (Personal info & skills) */}
              <div className="space-y-6 md:border-r md:pr-6 border-slate-100 text-xs">
                {/* Personal Information */}
                <div className="space-y-2.5">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider border-b pb-1 text-[11px] flex items-center gap-1.5 text-emerald-800">
                    <User className="w-3.5 h-3.5" />
                    <span>ব্যক্তিগত বিবরণ</span>
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">পিতার নাম</span>
                      <span className="font-semibold">{profile.fatherName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">মাতার নাম</span>
                      <span className="font-semibold">{profile.motherName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">জন্ম তারিখ ও বয়স</span>
                      <span className="font-semibold">{dobStr} ({calculateAge()})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">জাতীয় পরিচয়পত্র (NID)</span>
                      <span className="font-mono font-semibold">{profile.nid || 'প্রযোজ্য নয়'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">স্থায়ী ঠিকানা</span>
                      <span className="font-semibold">{profile.permanentAddress || profile.address || `${profile.district}, বাংলাদেশ`}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">ধর্ম ও জাতীয়তা</span>
                      <span className="font-semibold">{profile.religion || 'ইসলাম'} | {profile.nationality || 'বাংলাদেশী'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">বৈবাহিক অবস্থা</span>
                      <span className="font-semibold">{profile.maritalStatus || 'অবিবাহিত'}</span>
                    </div>
                  </div>
                </div>

                {/* Skills & Competencies */}
                <div className="space-y-2.5">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider border-b pb-1 text-[11px] flex items-center gap-1.5 text-emerald-800">
                    <Award className="w-3.5 h-3.5" />
                    <span>দক্ষতা ও প্রযুক্তিগত জ্ঞান</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {((profile.skills && profile.skills.length > 0)
                      ? profile.skills.map(s => typeof s === 'string' ? s : (s as any).name || (s as any).skillName || String(s))
                      : ['বাংলা (মাতৃভাষা)', 'ইংরেজি (প্রফেশনাল)', 'কম্পিউটার টাইপিং', 'MS Office & Excel', 'ইন্টারনেট ব্রাউজিং']
                    ).map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold text-[11px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2.5">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider border-b pb-1 text-[11px] flex items-center gap-1.5 text-emerald-800">
                    <span>ভাষাগত দক্ষতা</span>
                  </h3>
                  <ul className="space-y-1.5 text-slate-700">
                    <li className="flex justify-between items-center">
                      <span>বাংলা (Bangla)</span>
                      <span className="font-bold text-emerald-700">মাতৃভাষা (সাবলীল)</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>ইংরেজি (English)</span>
                      <span className="font-bold text-slate-600">পেশাদার দক্ষতা</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column (Career Objective, Education, Experience) */}
              <div className="md:col-span-2 space-y-6">
                {/* Career Objective */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b pb-1 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-700" />
                    <span>ক্যারিয়ার উদ্দেশ্য (Career Objective)</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                    {(profile as any).about || (profile as any).careerPreferences?.careerObjective || (profile as any).careerPreferences?.objective || 'একজন উদ্যমী এবং দায়িত্বশীল স্নাতক হিসেবে বাংলাদেশের সম্মানিত সরকারি/স্বায়ত্তশাসিত বা স্বনামধন্য প্রতিষ্ঠানে সততা ও নিষ্ঠার সাথে দায়িত্ব পালন করে দেশ ও প্রতিষ্ঠানের সার্বিক অগ্রগতিতে অবদান রাখতে আগ্রহী।'}
                  </p>
                </div>

                {/* Education Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b pb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <span>শিক্ষাগত যোগ্যতা (Educational Qualifications)</span>
                  </h3>
                  <div className="space-y-3">
                    {profile.education && profile.education.length > 0 ? (
                      profile.education.map((edu, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-white shadow-2xs space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-black text-slate-900">{edu.degree}</span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              জিপিএ/সিজিপিএ: {edu.result}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600">
                            {edu.boardOrUni}
                          </p>
                          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                            <span>বিষয়/বিভাগ: {edu.majorSubject || 'সাধারণ'}</span>
                            <span>•</span>
                            <span>পাসের সন: {edu.year}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">কোনো শিক্ষাগত তথ্য প্রোফাইলে যুক্ত নেই।</p>
                    )}
                  </div>
                </div>

                {/* Experience Section (If present) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b pb-1 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-700" />
                    <span>কর্মঅভিজ্ঞতা ও ইন্টার্নশিপ (Professional Experience)</span>
                  </h3>
                  {((profile.experiences && profile.experiences.length > 0) || ((profile as any).experience && (profile as any).experience.length > 0)) ? (
                    <div className="space-y-3">
                      {((profile.experiences || (profile as any).experience) as any[]).map((exp, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-white space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{exp.designation || exp.title || 'কর্মকর্তা'}</span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {exp.duration || (exp.startDate ? `${exp.startDate} - ${exp.endDate || 'বর্তমান'}` : '')}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-700 font-semibold">{exp.company || exp.organization}</p>
                          {exp.description && <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                      কোনো পূর্ব অভিজ্ঞতা যুক্ত করা হয়নি (ফ্রেশার প্রার্থী হিসেবে প্রযোজ্য)।
                    </p>
                  )}
                </div>

                {/* Declaration & Signature */}
                <div className="pt-4 border-t border-slate-100 flex items-end justify-between gap-4">
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p>তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
                    <p>স্থান: {profile.district || 'ঢাকা'}, বাংলাদেশ</p>
                  </div>

                  <div className="text-center space-y-1">
                    {signatureUrl ? (
                      <div className="w-32 h-10 mx-auto">
                        <img src={signatureUrl} alt="Signature" className="h-full object-contain mx-auto" />
                      </div>
                    ) : (
                      <div className="h-8 border-b border-dashed border-slate-400 w-32 mx-auto"></div>
                    )}
                    <span className="text-xs font-bold text-slate-900 block">({profile.name})</span>
                    <span className="text-[10px] text-slate-400 block">আবেদনকারীর ডিজিটাল স্বাক্ষর</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TEMPLATE 2: CLASSIC BANGLADESH GOVT STANDARD (ক্লাসিক)
           ========================================================= */}
        {template === 'classic' && (
          <div data-testid="cv-preview-classic" className="p-8 sm:p-12 space-y-6 font-serif">
            {/* Government Classic Header */}
            <div className="relative text-center border-b-2 border-slate-900 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide uppercase">
                জীবনবৃত্তান্ত
              </h2>
              <p className="text-sm font-bold text-slate-700 tracking-widest uppercase">
                (CURRICULUM VITAE)
              </p>

              {/* Photo Box Top-Right */}
              <div className="absolute right-0 top-0 w-24 h-28 border-2 border-slate-800 p-0.5 bg-white text-center flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-sans">পাসপোর্ট সাইজ ছবি</span>
                )}
              </div>
            </div>

            {/* Official Numbered Information Points */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-900 leading-relaxed pt-2">
              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">১. প্রার্থীর পুরো নাম (Name):</span>
                <span className="col-span-8 font-semibold">{profile.name} {profile.nameBn ? `(${profile.nameBn})` : ''}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">২. পিতার নাম (Father's Name):</span>
                <span className="col-span-8">{profile.fatherName}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">৩. মাতার নাম (Mother's Name):</span>
                <span className="col-span-8">{profile.motherName}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">৪. বর্তমান ঠিকানা (Present Address):</span>
                <span className="col-span-8">{profile.address || profile.permanentAddress || `${profile.district}, বাংলাদেশ`}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">৫. স্থায়ী ঠিকানা (Permanent Address):</span>
                <span className="col-span-8">{profile.permanentAddress || profile.address || `${profile.district}, বাংলাদেশ`}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">৬. নিজ জেলা (Home District):</span>
                <span className="col-span-8 font-bold">{profile.district || 'ঢাকা'}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">৭. জন্ম তারিখ ও বয়স (DOB & Age):</span>
                <span className="col-span-8">{dobStr} (হিসাবকৃত বয়স: {calculateAge()})</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">৮. জাতীয়তা ও ধর্ম (Nationality & Religion):</span>
                <span className="col-span-8">{profile.nationality || 'বাংলাদেশী'} | {profile.religion || 'ইসলাম'}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">৯. বৈবাহিক অবস্থা (Marital Status):</span>
                <span className="col-span-8">{profile.maritalStatus || 'অবিবাহিত'}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">১০. জাতীয় পরিচয়পত্র নং (NID No.):</span>
                <span className="col-span-8 font-mono font-bold">{profile.nid || 'প্রযোজ্য নয়'}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 py-0.5">
                <span className="col-span-4 font-bold">১১. মোবাইল ও ইমেইল (Contact):</span>
                <span className="col-span-8">{profile.phone} | {profile.email}</span>
              </div>
            </div>

            {/* Official Education Table */}
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase">
                ১২. শিক্ষাগত যোগ্যতা (Educational Qualifications):
              </h3>
              <div className="overflow-x-auto border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-800 text-slate-900 font-bold">
                      <th className="p-2 border-r border-slate-800 w-12 text-center">ক্রমিক</th>
                      <th className="p-2 border-r border-slate-800">পরীক্ষার নাম</th>
                      <th className="p-2 border-r border-slate-800">বিভাগ/বিষয়</th>
                      <th className="p-2 border-r border-slate-800">বোর্ড / বিশ্ববিদ্যালয়</th>
                      <th className="p-2 border-r border-slate-800 w-20 text-center">পাসের সন</th>
                      <th className="p-2 w-28 text-center">প্রাপ্ত বিভাগ/জিপিএ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.education && profile.education.length > 0 ? (
                      profile.education.map((edu, idx) => (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="p-2 border-r border-slate-800 text-center font-bold">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-800 font-semibold">{edu.degree}</td>
                          <td className="p-2 border-r border-slate-800">{edu.majorSubject || 'সাধারণ'}</td>
                          <td className="p-2 border-r border-slate-800">{edu.boardOrUni}</td>
                          <td className="p-2 border-r border-slate-800 text-center font-mono">{edu.year}</td>
                          <td className="p-2 text-center font-mono font-bold">{edu.result}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-3 text-center text-slate-400 italic">কোনো শিক্ষাগত তথ্য যোগ করা হয়নি।</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-1.5 pt-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase">
                ১৩. কর্মঅভিজ্ঞতা (Employment Experience):
              </h3>
              <div className="text-xs text-slate-800 pl-4 space-y-1">
                {((profile.experiences && profile.experiences.length > 0) || ((profile as any).experience && (profile as any).experience.length > 0)) ? (
                  ((profile.experiences || (profile as any).experience) as any[]).map((exp, idx) => (
                    <div key={idx}>
                      • <strong>{exp.designation || 'কর্মকর্তা'}</strong>, {exp.company || exp.organization} ({exp.duration || 'চলমান'})
                    </div>
                  ))
                ) : (
                  <p className="italic text-slate-500">প্রযোজ্য নয় (ফ্রেশার)।</p>
                )}
              </div>
            </div>

            {/* Extra Skills */}
            <div className="space-y-1.5 pt-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase">
                ১৪. কম্পিউটার ও ভাষাগত দক্ষতা (Computer & Language Skills):
              </h3>
              <p className="text-xs text-slate-800 pl-4 leading-relaxed">
                {((profile.skills && profile.skills.length > 0)
                  ? profile.skills.map(s => typeof s === 'string' ? s : (s as any).name || '').join(', ')
                  : 'কম্পিউটার টাইপিং (বাংলা ও ইংরেজি), MS Word, MS Excel, ইন্টারনেট ও ইমেইল যোগাযোগ।'
                )}
              </p>
            </div>

            {/* Official Declaration */}
            <div className="pt-6 space-y-6">
              <p className="text-xs text-slate-800 leading-relaxed text-justify">
                <strong>শপথ ও প্রত্যয়ন:</strong> আমি এই মর্মে ঘোষণা করছি যে, উপরে বর্ণিত সমস্ত তথ্য আমার জ্ঞান ও বিশ্বাসমতে সত্য এবং সঠিক। কোনো তথ্য অসত্য বা ভুল প্রমাণিত হলে আমার বিরুদ্ধে আইনানুগ ব্যবস্থা গ্রহণ করা যাবে।
              </p>

              <div className="flex items-end justify-between pt-4">
                <div className="text-xs text-slate-700 space-y-1">
                  <p>তারিখ: ....................................</p>
                  <p>স্থান: {profile.district || 'ঢাকা'}</p>
                </div>

                <div className="text-center space-y-1">
                  {signatureUrl ? (
                    <div className="w-32 h-10 mx-auto">
                      <img src={signatureUrl} alt="Signature" className="h-full object-contain mx-auto" />
                    </div>
                  ) : (
                    <div className="h-8 border-b border-dotted border-slate-600 w-32 mx-auto"></div>
                  )}
                  <span className="text-xs font-bold text-slate-900 block">({profile.name})</span>
                  <span className="text-[10px] text-slate-600 block">আবেদনকারীর স্বাক্ষর</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}