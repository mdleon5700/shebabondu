'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, CheckCircle2, User, Mail, Phone, MapPin } from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile } from '@/lib/types';
import { useCandidateData } from '@/components/CandidateDataProvider';

export default function CvBuilderPage() {
  const { profile } = useCandidateData();
  const [template, setTemplate] = useState<'classic' | 'modern'>('modern');

  const handlePrint = () => {
    window.print();
  };

  if (!profile) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-500 bg-white rounded-3xl border border-slate-200">
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <span>সিভি তথ্য প্রস্তুত হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>স্মার্ট সিভি বিল্ডার (CV & Resume)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার ভল্ট ও প্রোফাইলের তথ্যের ওপর ভিত্তি করে স্বয়ংক্রিয় প্রফেশনাল বিডি স্ট্যান্ডার্ড সিভি।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTemplate(template === 'modern' ? 'classic' : 'modern')}
            className="px-3.5 py-2 border rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50"
          >
            টেমপ্লেট পরিবর্তন ({template === 'modern' ? 'মডার্ন' : 'ক্লাসিক'})
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>সিভি প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* CV Live Document Preview */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md max-w-3xl mx-auto space-y-6 text-slate-800 printable-cv">
        {/* CV Header */}
        <div className="flex items-start justify-between gap-6 border-b pb-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900">{profile.name}</h2>
            <div className="text-sm font-bold text-emerald-800">{profile.education?.[0]?.degree || 'প্রার্থী'}</div>
            <div className="text-xs text-slate-500 space-y-0.5 pt-1">
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> <span>{profile.phone}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> <span>{profile.email}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> <span>{profile.district}, বাংলাদেশ</span></div>
            </div>
          </div>

          {profile.photoUrl && (
            <img src={profile.photoUrl} alt="" className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm" />
          )}
        </div>

        {/* Career Objective */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1">ক্যারিয়ার উদ্দেশ্য</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {(profile as any).about || (profile as any).careerPreferences?.careerObjective || (profile as any).careerPreferences?.objective || 'একজন উদ্যমী এবং দায়িত্বশীল স্নাতক হিসেবে বাংলাদেশের সম্মানিত সরকারি/স্বায়ত্তশাসিত প্রতিষ্ঠানে নিষ্ঠা ও সততার সাথে দায়িত্ব পালন করতে আগ্রহী।'}
          </p>
        </div>

        {/* Education Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1">শিক্ষাগত যোগ্যতা</h3>
          <div className="space-y-2 text-xs">
            {profile.education && profile.education.length > 0 ? (
              profile.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900">{edu.degree} - {edu.boardOrUni}</div>
                    <div className="text-slate-500 text-[11px]">{edu.majorSubject || 'সাধারণ'} | পাস: {edu.year}</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    জিপিএ: {edu.result}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">কোনো শিক্ষাগত তথ্য যোগ করা হয়নি।</p>
            )}
          </div>
        </div>

        {/* Work Experience Section (If present) */}
        {((profile.experiences && profile.experiences.length > 0) || ((profile as any).experience && (profile as any).experience.length > 0)) && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1">কর্মঅভিজ্ঞতা</h3>
            <div className="space-y-2 text-xs">
              {((profile.experiences || (profile as any).experience) as any[]).map((exp, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900">{exp.designation || exp.title || 'কর্মকর্তা'} - {exp.company || exp.organization}</div>
                    <div className="text-slate-500 text-[11px]">{exp.duration || (exp.startDate ? `${exp.startDate} - ${exp.endDate || 'বর্তমান'}` : '')}</div>
                    {exp.description && <div className="text-slate-600 text-[11px] mt-0.5">{exp.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Certifications */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1">দক্ষতা ও ভাষা</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {((profile.skills && profile.skills.length > 0)
              ? profile.skills.map(s => typeof s === 'string' ? s : (s as any).name || (s as any).skillName || String(s))
              : ['বাংলা (মাতৃভাষা)', 'ইংরেজি (প্রফেশনাল)', 'কম্পিউটার টাইপিং (বাংলা ও ইংরেজি)', 'MS Office & Excel']
            ).map((sk, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-2 border-t pt-4 text-xs text-slate-600 grid grid-cols-2 gap-2">
          <div><span className="font-bold text-slate-700">পিতার নাম:</span> {profile.fatherName}</div>
          <div><span className="font-bold text-slate-700">মাতার নাম:</span> {profile.motherName}</div>
          <div><span className="font-bold text-slate-700">জন্ম তারিখ:</span> {profile.dob}</div>
          <div><span className="font-bold text-slate-700">জাতীয়তা:</span> {profile.nationality || 'বাংলাদেশী'}</div>
          <div><span className="font-bold text-slate-700">এনআইডি:</span> {profile.nid}</div>
          <div><span className="font-bold text-slate-700">স্থায়ী ঠিকানা:</span> {profile.permanentAddress || profile.address}</div>
        </div>
      </div>
    </div>
  );
}
