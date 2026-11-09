'use client';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';


import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Clock, 
  Users, 
  GraduationCap, 
  Banknote, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Sparkles
} from 'lucide-react';
import { JobCircular } from '@/lib/types';
import JobLogo from './JobLogo';
import JobEligibilityLabel from './JobEligibilityLabel';

interface JobCardProps {
  job: JobCircular;
}

export default function JobCard({ job }: JobCardProps) {
  const isExpired = Boolean(
    CentralDeadlineEngine.evaluateDeadline(job).isClosed ||
    (job as any).status === 'EXPIRED' || 
    (job as any).status === 'CLOSED' ||
    (job.deadline && (job.deadline.includes('সমাপ্ত') || job.deadline.includes('শেষ')))
  );
  const isUrgent = !isExpired && job.daysRemaining <= 12;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Banner Accent */}
      {(job.featured || job.isHot) && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[13px] font-bold px-3.5 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>{job.featured ? 'ফিচার্ড সার্কুলার' : 'হট সার্কুলার'}</span>
        </div>
      )}

      <div>
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-emerald-50 text-emerald-800 text-[15px] font-bold px-2.5 py-1 rounded-md border border-emerald-200/60">
            {job.categoryLabel}
          </span>
          <span className="bg-slate-100 text-slate-700 text-[15px] font-semibold px-2.5 py-1 rounded-md">
            {job.grade}
          </span>
          <span className="bg-blue-50 text-blue-700 text-[15px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
            <Users className="w-3 h-3" />
            {job.totalPosts} টি পদ
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ml-auto ${
            isUrgent 
              ? 'bg-rose-50 text-rose-700 border border-rose-200/80 animate-pulse' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            <Clock className="w-3 h-3" />
            {job.daysRemaining} দিন বাকি
          </span>
        </div>

        {/* Organization & Title */}
        <div className="mb-3">
          <p className="text-[15px] font-semibold text-emerald-700 flex items-center gap-2 mb-1.5">
            <JobLogo logo={job.logo} organization={job.organization} size="sm" />
            <span className="truncate">{job.organization}</span>
          </p>
          <Link href={`/jobs/${job.id}`} className="group-hover:text-emerald-700 transition-colors">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {job.title}
            </h3>
          </Link>
        </div>

        {/* Key Highlights Table-style List */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 text-[15px] text-slate-700 mb-4">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">যোগ্যতা: </span>
              <span className="text-slate-600">{job.minEducation}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">বেতন: </span>
              <span className="text-slate-600">{job.salary}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[14px]">
            <span className="text-slate-500">শেষ তারিখ: <strong className="text-slate-700">{job.deadline}</strong></span>
            <span className="text-emerald-700 font-semibold">ফি: ৳{job.govtFee} + ৳{job.serviceFee}</span>
          </div>
        </div>

        {/* Smart Eligibility Matcher Badge */}
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[14px] mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <JobEligibilityLabel job={job} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <Link
          href={`/jobs/${job.id}`}
          className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-[17px] text-center transition-colors"
        >
          সার্কুলার দেখুন
        </Link>
        {isExpired ? (
          <div className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-[17px] text-center border border-slate-200 flex items-center justify-center gap-1.5 cursor-not-allowed select-none">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>সময় শেষ</span>
          </div>
        ) : (
          <Link
            href={`/apply/${job.id}`}
            className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-[17px] text-center shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-1.5"
          >
            <span>আবেদন করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

    </div>
  );
}
