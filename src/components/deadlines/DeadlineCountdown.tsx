'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';

interface Props {
  jobId: string;
  deadlineText: string;
  initialDaysRemaining?: number;
  compact?: boolean;
  showReminderButton?: boolean;
  className?: string;
}

function toBn(n: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, d => bnDigits[Number(d)]);
}

export default function DeadlineCountdown({
  jobId,
  deadlineText,
  initialDaysRemaining,
  compact = false,
  showReminderButton = true,
  className = ''
}: Props) {
  const [days, setDays] = useState<number>(initialDaysRemaining ?? 0);
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('OPEN');
  const [labelBn, setLabelBn] = useState<string>('');
  const [badgeColor, setBadgeColor] = useState<string>('bg-emerald-50 text-emerald-800 border-emerald-200');
  const [hasExactTime, setHasExactTime] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isTogglingReminder, setIsTogglingReminder] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch authoritative deadline status from API
    fetch(`/api/jobs/${jobId}/deadline-status`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted || !data.success) return;
        const ev = data.evaluation;
        setDays(ev.daysRemaining);
        setHours(ev.hoursRemaining ?? null);
        setMinutes(ev.minutesRemaining ?? null);
        setStatus(ev.status);
        setLabelBn(ev.labelBn);
        setBadgeColor(ev.badgeColor);
        setHasExactTime(ev.hasExactTime);
        if (data.subscription) {
          setIsSubscribed(data.subscription.isSubscribed);
        }
      })
      .catch(() => {
        // Fallback to local evaluation
        if (!isMounted) return;
        if (initialDaysRemaining !== undefined) {
          setDays(initialDaysRemaining);
          if (initialDaysRemaining <= 0) {
            setStatus('CLOSED');
            setLabelBn('আবেদন শেষ হয়েছে');
            setBadgeColor('bg-slate-100 text-slate-600 border-slate-300');
          } else if (initialDaysRemaining <= 3) {
            setStatus('CLOSING_SOON');
            setLabelBn(`আবেদনের সময় বাকি ${toBn(initialDaysRemaining)} দিন`);
            setBadgeColor('bg-amber-100 text-amber-800 border-amber-300');
          } else {
            setStatus('OPEN');
            setLabelBn(`আবেদনের সময় বাকি ${toBn(initialDaysRemaining)} দিন`);
            setBadgeColor('bg-emerald-50 text-emerald-800 border-emerald-200');
          }
        }
      });

    return () => { isMounted = false; };
  }, [jobId, deadlineText, initialDaysRemaining]);

  const handleToggleReminder = async () => {
    setIsTogglingReminder(true);
    try {
      if (isSubscribed) {
        const res = await fetch(`/api/candidate/job-reminders?jobId=${jobId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setIsSubscribed(false);
          alert('ডেডলাইন রিমাইন্ডার বন্ধ করা হয়েছে।');
        }
      } else {
        const res = await fetch('/api/candidate/job-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            leadDays: [3, 1, 0],
            channels: ['in_app']
          })
        });
        if (res.status === 401) {
          alert('রিমাইন্ডার সক্রিয় করতে দয়া করে লগইন করুন।');
        } else if (res.ok) {
          setIsSubscribed(true);
          alert('ডেডলাইন রিমাইন্ডার সফলভাবে সক্রিয় করা হয়েছে! শেষ সময়ের ৩ দিন, ১ দিন এবং শেষ দিনে নোটিফিকেশন পাবেন।');
        }
      }
    } catch {
      alert('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsTogglingReminder(false);
    }
  };

  // Compact Pill Badge for Job Cards
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeColor} ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>{labelBn || deadlineText}</span>
      </div>
    );
  }

  // Full Rich Countdown Box for Job Detail Pages
  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700/80 shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-100">আবেদনের সময়সীমা ও ডেডলাইন</h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
          {labelBn || 'চলমান সার্কুলার'}
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Countdown Digits */}
        {status !== 'CANCELLED' && status !== 'SUSPENDED' && status !== 'CLOSED' && status !== 'UNKNOWN' ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Days Box */}
            <div className="bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-xl text-center min-w-[58px]">
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {toBn(days)}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">দিন বাকি</div>
            </div>

            {hasExactTime && hours !== null && (
              <>
                <span className="text-slate-500 font-bold text-xl">:</span>
                {/* Hours Box */}
                <div className="bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-xl text-center min-w-[58px]">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {toBn(hours)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">ঘণ্টা</div>
                </div>

                <span className="text-slate-500 font-bold text-xl">:</span>
                {/* Minutes Box */}
                <div className="bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-xl text-center min-w-[58px]">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {toBn(minutes ?? 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">মিনিট</div>
                </div>
              </>
            )}

            {!hasExactTime && (
              <div className="text-xs text-slate-300 ml-1">
                <div className="font-semibold text-slate-100">শেষ তারিখ: {deadlineText}</div>
                <div className="text-[11px] text-slate-400">অফিসিয়াল গেজেট অনুযায়ী নির্ধারিত</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-1">
            {status === 'CANCELLED' ? (
              <div className="flex items-center gap-2 text-rose-300 text-xs sm:text-sm font-semibold">
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>এই সার্কুলারের নিয়োগ কার্যক্রম আনুষ্ঠানিকভাবে বাতিল করা হয়েছে।</span>
              </div>
            ) : status === 'SUSPENDED' ? (
              <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-semibold">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>নিয়োগ কার্যক্রম সাময়িক স্থগিত রাখা হয়েছে। পরবর্তী নির্দেশনা না দেওয়া পর্যন্ত অপেক্ষা করুন।</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-semibold">
                <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <span>এই সার্কুলারের আবেদনের সময়সীমা শেষ হয়েছে।</span>
              </div>
            )}
          </div>
        )}

        {/* Reminder Action Button */}
        {showReminderButton && status !== 'CANCELLED' && status !== 'CLOSED' && (
          <button
            type="button"
            onClick={handleToggleReminder}
            disabled={isTogglingReminder}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isSubscribed
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-rose-900/40 hover:text-rose-300 hover:border-rose-500/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
            }`}
          >
            {isSubscribed ? (
              <>
                <BellOff className="w-4 h-4" />
                <span>{isTogglingReminder ? 'প্রক্রিয়াধীন...' : 'অ্যালার্ট চালু আছে (বন্ধ করুন)'}</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>{isTogglingReminder ? 'প্রক্রিয়াধীন...' : 'ডেডলাইন অ্যালার্ট অন করুন'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
