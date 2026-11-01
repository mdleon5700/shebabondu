'use client';

import Link from 'next/link';
import type { JobCircular } from '@/lib/types';
import { storage } from '@/lib/store';
import { useCandidateData } from './CandidateDataProvider';

export default function JobEligibilityLabel({ job }: { job: JobCircular }) {
  const { profile, documents, loading } = useCandidateData();
  if (loading) return <span>যোগ্যতা যাচাই হচ্ছে...</span>;
  if (!profile) return <Link href={'/login?redirect=' + encodeURIComponent('/jobs/' + job.id)}>যোগ্যতা যাচাই করতে লগইন করুন</Link>;
  const result = storage.checkEligibility(profile, job, documents);
  return <span title={result.reasons.join('\n')} className={result.status === 'eligible' ? 'text-emerald-800' : 'text-slate-700'}>
    {result.status === 'eligible' ? 'প্রোফাইল অনুযায়ী সম্ভাব্য যোগ্য' : result.statusLabel}
  </span>;
}
