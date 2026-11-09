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
  Building,
  LayoutList,
  CalendarDays,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { storage } from '@/lib/store';
import { ApplicationRequest, JobCircular } from '@/lib/types';
import { fetchPublicJobs } from '@/lib/public-jobs-client';

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Bengali Days and Months
  const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const banglaDaysShort = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
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
        const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [appRes, jobRes] = await Promise.allSettled([
          fetch('/api/applications', { headers, cache: 'no-store' }),
          fetchPublicJobs()
        ]);

        if (appRes.status === 'fulfilled' && appRes.value.ok) {
          const appData = await appRes.value.json();
          if (appData.success && Array.isArray(appData.applications) && isMounted) {
            setApplications(appData.applications);
          }
        }

        if (jobRes.status === 'fulfilled' && isMounted) {
          setJobs(jobRes.value);
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

  const safeDate = (input: any, fallbackDays = 21): Date => {
    if (input instanceof Date && !isNaN(input.getTime())) return input;
    if (typeof input === 'string' || typeof input === 'number') {
      const d = new Date(input);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(Date.now() + fallbackDays * 24 * 60 * 60 * 1000);
  };

  const safeDateKey = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  // Compute Calendar Events
  const events: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];

    // 1. Applications (Exams)
    applications.forEach((app, idx) => {
      const baseDate = safeDate(app.submittedAt || app.date, 0);
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
        statusText: app.status === 'completed' ? 'প্রবেশপত্র শীঘ্রই ইস্যু' : 'আবেদন গৃহীত',
        isApplied: true
      });
    });

    // 2. Deadlines for circulars
    const activeJobs = jobs.slice(0, 10);
    activeJobs.forEach(job => {
      const deadlineDate = safeDate(job.deadline, 7);

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
    const dateCounts: Record<string, CalendarEvent[]> = {};
    events.forEach(e => {
      if (e.type === 'exam') {
        const key = safeDateKey(e.dateObj);
        if (!dateCounts[key]) dateCounts[key] = [];
        dateCounts[key].push(e);
      }
    });

    const conflictingDates = Object.entries(dateCounts).filter(([_, items]) => items.length > 1);
    return conflictingDates;
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (activeTab === 'exam') result = result.filter(e => e.type === 'exam');
    if (activeTab === 'deadline') result = result.filter(e => e.type === 'deadline');

    if (selectedCalendarDate) {
      result = result.filter(e => safeDateKey(e.dateObj) === selectedCalendarDate);
    }
    return result;
  }, [events, activeTab, selectedCalendarDate]);

  // Calendar Month Grid Generator
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthGridDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ dayNumber: null, dateKey: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dateKey = safeDateKey(d);
      const dayEvents = events.filter(e => safeDateKey(e.dateObj) === dateKey);
      days.push({ dayNumber: day, dateKey, dayEvents });
    }
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfWeek, events]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16" data-testid="exam-calendar-page">
      {/* Page Header & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>স্টেপ ১০ — ব্যক্তিগত পরীক্ষার দিনপঞ্জি ও ডেডলাইন</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>ব্যক্তিগত পরীক্ষার ক্যালেন্ডার ও সময়সূচি</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার দাখিলকৃত আবেদনগুলোর আসন্ন পরীক্ষার সম্ভাব্য সময়সূচি এবং চলমান সার্কুলারের ডেডলাইন ট্র্যাকার।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              data-testid="view-toggle-list"
              type="button"
              onClick={() => { setViewMode('list'); setSelectedCalendarDate(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>তালিকা ভিউ</span>
            </button>
            <button
              data-testid="view-toggle-grid"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>ক্যালেন্ডার গ্রিড</span>
            </button>
          </div>

          <Link
            href="/dashboard/admit-cards"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Award className="w-4 h-4" />
            <span>প্রবেশপত্র ডাউনলোড হাব</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">মোট শিডিউলড ইভেন্ট</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{events.length} টি</p>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-800">আসন্ন পরীক্ষা (Exam)</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">{events.filter(e => e.type === 'exam').length} টি</p>
        </div>
        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <p className="text-xs font-semibold text-rose-800">জরুরি ডেডলাইন (Deadlines)</p>
          <p className="text-xl sm:text-2xl font-black text-rose-800 mt-1">{events.filter(e => e.type === 'deadline').length} টি</p>
        </div>
      </div>

      {/* Tab Filter Buttons */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            data-testid="tab-all"
            type="button"
            onClick={() => { setActiveTab('all'); setSelectedCalendarDate(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' && !selectedCalendarDate ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            সকল ইভেন্ট ({events.length})
          </button>
          <button
            data-testid="tab-exam"
            type="button"
            onClick={() => { setActiveTab('exam'); setSelectedCalendarDate(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exam' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            পরীক্ষা ({events.filter(e => e.type === 'exam').length})
          </button>
          <button
            data-testid="tab-deadline"
            type="button"
            onClick={() => { setActiveTab('deadline'); setSelectedCalendarDate(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'deadline' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ডেডলাইন ({events.filter(e => e.type === 'deadline').length})
          </button>
        </div>

        {selectedCalendarDate && (
          <button
            onClick={() => setSelectedCalendarDate(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
          >
            ফিল্টার রিসেট
          </button>
        )}
      </div>

      {/* Conflict Notice if 2 exams collide */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-sm text-amber-950 block">⚠️ সম্ভাব্য পরীক্ষা সংঘর্ষ সতর্কতা (Date Conflict Detected):</strong>
            <p>আপনার আবেদনকৃত চাকরির একাধিক পরীক্ষার সম্ভাব্য সময়সূচি একই দিনে পড়ার সম্ভাবনা রয়েছে। কেন্দ্র ও সময়সূচি নিবিড়ভাবে পর্যবেক্ষণ করুন।</p>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 1: MONTH CALENDAR GRID VIEW
         ===================================================================== */}
      {viewMode === 'grid' && (
        <div data-testid="month-calendar-grid" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="font-black text-base text-slate-900">
              {banglaMonths[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> পরীক্ষা (Exam)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> ডেডলাইন (Deadline)</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs">
            {banglaDaysShort.map((day, idx) => (
              <div key={idx} className="p-2 font-bold text-slate-500 uppercase tracking-wider bg-slate-50 rounded-xl">
                {day}
              </div>
            ))}

            {monthGridDays.map((item, idx) => {
              if (!item.dayNumber) {
                return <div key={idx} className="p-2 sm:p-3 min-h-[60px] bg-slate-50/30 rounded-xl" />;
              }

              const isSelected = selectedCalendarDate === item.dateKey;
              const hasEvents = item.dayEvents && item.dayEvents.length > 0;
              const hasExam = item.dayEvents?.some(e => e.type === 'exam');
              const hasDeadline = item.dayEvents?.some(e => e.type === 'deadline');

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCalendarDate(item.dateKey || null)}
                  className={`p-2 min-h-[70px] rounded-xl border transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                      : hasEvents
                      ? 'border-slate-300 bg-white hover:border-emerald-300'
                      : 'border-slate-100 bg-white/60 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xs font-bold leading-none ${isSelected ? 'text-emerald-800' : 'text-slate-800'}`}>
                    {item.dayNumber}
                  </span>

                  {hasEvents && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hasExam && (
                        <span className="w-full text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 truncate" title="পরীক্ষা">
                          পরীক্ষা
                        </span>
                      )}
                      {hasDeadline && (
                        <span className="w-full text-[9px] font-bold px-1 py-0.5 rounded bg-rose-100 text-rose-800 truncate" title="ডেডলাইন">
                          শেষ দিন
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: EVENT LIST VIEW
         ===================================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-800">
            {selectedCalendarDate ? `তারিখ: ${selectedCalendarDate}-এর শিডিউল` : 'আসন্ন তারিখসমূহের তালিকা'}
          </h3>
          <span className="text-xs font-bold text-slate-500">মোট {filteredEvents.length} টি</span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">কোনো নির্ধারিত সময়সূচি পাওয়া যায়নি।</p>
            {selectedCalendarDate && (
              <button
                onClick={() => setSelectedCalendarDate(null)}
                className="text-xs font-bold text-emerald-700 underline"
              >
                সব ইভেন্ট দেখুন
              </button>
            )}
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
                  data-testid="calendar-event-card"
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-emerald-300 hover:shadow-xs group"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className={`p-3 rounded-2xl border text-center min-w-[80px] shrink-0 shadow-2xs ${
                      isExam ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <span className="block text-[11px] font-bold opacity-80">{ev.dayBn}</span>
                      <span className="block text-2xl font-black leading-tight">{dateNumber}</span>
                      <span className="block text-[11px] font-bold opacity-80">{monthName}</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          isExam 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {isExam ? 'পরীক্ষার সম্ভাব্য শিডিউল' : 'আবেদনের শেষ তারিখ'}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{ev.organization}</span>
                      </div>

                      <h3 className="font-black text-sm sm:text-base text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                        {ev.title}
                      </h3>

                      <p className="text-xs font-bold text-slate-600">
                        পদ: {ev.postName}
                      </p>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-1">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{ev.time}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.center}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <Link
                      href={`/jobs/${ev.jobId}`}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>সার্কুলার</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    {isExam && (
                      <Link
                        href="/dashboard/admit-cards"
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>প্রবেশপত্র</span>
                      </Link>
                    )}
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