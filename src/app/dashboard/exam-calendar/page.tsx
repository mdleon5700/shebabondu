'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Briefcase, 
  ChevronRight, 
  Filter, 
  Award, 
  AlertTriangle,
  Building
} from 'lucide-react';
import { storage } from '@/lib/store';
import { ApplicationRequest, JobCircular } from '@/lib/types';

interface CalendarEvent {
  id: string;
  type: 'exam' | 'deadline';
  dateString: string;
  dateObj: Date;
  dayBn: string;
  time: string;
  title: string;
  postName: string;
  organization: string;
  center?: string;
  jobId: string;
  statusText: string;
  isApplied: boolean;
}

export default function ExamCalendarPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'exam' | 'deadline'>('all');
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Days of week mapping to Bengali
  const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  useEffect(() => {
    let isMounted = true;

    // Load initial local applications
    const localApps = storage.getApplications();
    if (localApps && localApps.length > 0) {
      setApplications(localApps);
    }

    const loadData = async () => {
      try {
        const [appRes, jobRes] = await Promise.allSettled([
          fetch('/api/applications'),
          fetch('/api/jobs?limit=50')
        ]);

        if (appRes.status === 'fulfilled' && appRes.value.ok) {
          const appData = await appRes.value.json();
          if (appData.success && Array.isArray(appData.applications) && isMounted) {
            setApplications(appData.applications);
          }
        }

        if (jobRes.status === 'fulfilled' && jobRes.value.ok) {
          const jobData = await jobRes.value.json();
          if (jobData.jobs && Array.isArray(jobData.jobs) && isMounted) {
            setJobs(jobData.jobs);
          }
        }
      } catch (err) {
        console.warn('Calendar sync warning', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Compute Calendar Events
  const events: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];

    // 1. Applications (Exams)
    applications.forEach((app, idx) => {
      // Create a deterministic future exam schedule based on application or deadline
      const baseDate = new Date(app.submittedAt || app.date || Date.now());
      // Exam roughly 3-4 weeks after submission
      const examDate = new Date(baseDate.getTime() + (21 + (idx % 7)) * 24 * 60 * 60 * 1000);
      const dayName = banglaDays[examDate.getDay()];
      const dayNum = examDate.getDate();
      const monthName = banglaMonths[examDate.getMonth()];
      const year = examDate.getFullYear();

      list.push({
        id: `exam-${app.id}`,
        type: 'exam',
        dateString: `${dayNum} ${monthName} ${year}`,
        dateObj: examDate,
        dayBn: dayName,
        time: idx % 2 === 0 ? 'সকাল ১০:০০ - ১১:০০' : 'বিকাল ০৩:০০ - ০৪:৩০',
        title: app.jobTitle,
        postName: app.postName,
        organization: app.jobTitle.split(' ')[0] || 'সরকারি প্রতিষ্ঠান',
        center: `${app.candidateDistrict || 'ঢাকা'} মহানগরীর কেন্দ্রসমূহ`,
        jobId: app.jobId,
        statusText: app.status === 'completed' ? 'প্রবেশপত্র শীঘ্রই ইস্যু' : 'আবেদন ভেরিফাইড',
        isApplied: true
      });
    });

    // 2. Deadlines for top circulars or saved jobs
    const activeJobs = jobs.slice(0, 8);
    activeJobs.forEach(job => {
      if (!job.deadline) return;
      const d = new Date(job.deadline);
      const isDateValid = !isNaN(d.getTime());
      const deadlineDate = isDateValid ? d : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const dayName = banglaDays[deadlineDate.getDay()];
      const dayNum = deadlineDate.getDate();
      const monthName = banglaMonths[deadlineDate.getMonth()];
      const year = deadlineDate.getFullYear();

      const hasApplied = applications.some(a => a.jobId === job.id);

      list.push({
        id: `deadline-${job.id}`,
        type: 'deadline',
        dateString: `${dayNum} ${monthName} ${year}`,
        dateObj: deadlineDate,
        dayBn: dayName,
        time: 'রাত ১১:৫৯ মিনিট',
        title: job.title,
        postName: (job.positions && job.positions[0]?.title) || 'নির্দিষ্ট পদসমূহ',
        organization: job.organization || 'নিয়োগকারী কর্তৃপক্ষ',
        center: 'অনলাইন আবেদন পোর্টাল',
        jobId: job.id,
        statusText: hasApplied ? 'আবেদন সম্পন্ন' : 'আবেদনের শেষ তারিখ',
        isApplied: hasApplied
      });
    });

    // Sort by date ascending
    list.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    return list;
  }, [applications, jobs]);

  // Check for date conflicts
  const conflicts = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.type === 'exam') {
        const key = e.dateObj.toISOString().split('T')[0];
        dateCounts[key] = (dateCounts[key] || 0) + 1;
      }
    });
    return Object.values(dateCounts).some(count => count > 1);
  }, [events]);

  const filteredEvents = events.filter(e => {
    if (activeTab === 'exam') return e.type === 'exam';
    if (activeTab === 'deadline') return e.type === 'deadline';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-700" />
            <span>ব্যক্তিগত পরীক্ষার ক্যালেন্ডার ও সময়সূচি</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার দাখিলকৃত আবেদনগুলোর আসন্ন পরীক্ষার সম্ভাব্য সময়সূচি এবং চলমান সার্কুলারের ডেডলাইন ট্র্যাকার।
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            সকল ইভেন্ট ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exam')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exam' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            পরীক্ষা ({events.filter(e => e.type === 'exam').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deadline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'deadline' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ডেডলাইন ({events.filter(e => e.type === 'deadline').length})
          </button>
        </div>
      </div>

      {/* Conflict Notice if 2 exams collide */}
      {conflicts && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="font-bold">সতর্কবার্তা:</strong> আপনার আবেদনকৃত চাকরির একাধিক পরীক্ষার সম্ভাব্য সময়সূচি একই দিনে পড়তে পারে। নিয়মিত নোটিফিকেশন চেক করুন।
          </div>
        </div>
      )}

      {/* Calendar List */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-500">কোনো নির্ধারিত সময়সূচি পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((ev) => {
              const isExam = ev.type === 'exam';
              const parts = ev.dateString.split(' ');
              const dateNumber = parts[0];
              const monthName = parts[1];

              return (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 hover:border-slate-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center min-w-[75px] shadow-2xs shrink-0">
                      <span className="block text-[11px] font-bold text-emerald-700">{ev.dayBn}</span>
                      <span className="block text-lg font-black text-slate-900 leading-tight">{dateNumber}</span>
                      <span className="block text-[10px] font-bold text-slate-400">{monthName}</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isExam 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isExam ? 'পরীক্ষার সম্ভাব্য শিডিউল' : 'আবেদনের ডেডলাইন'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">{ev.organization}</span>
                      </div>

                      <h3 className="font-black text-sm text-slate-900 leading-snug">
                        {ev.title}
                      </h3>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{ev.time}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.center}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <Link
                      href={`/jobs/${ev.jobId}`}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>বিস্তারিত দেখুন</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}