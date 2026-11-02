import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { serverDB } from '@/lib/db';
import ApplyClient from '@/components/ApplyClient';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = serverDB.getPublicJobById(params.id);
  if (!job || job.id.startsWith('draft-') || (job as any).status === 'UNPUBLISHED') {
    return {
      title: 'আবেদন | চাকরি সেবা',
      description: 'সরকারি ও ব্যাংক চাকরির নির্ভুল অনলাইন আবেদন সেবা।',
    };
  }

  const isExpired = Boolean(
    CentralDeadlineEngine.evaluateDeadline(job).isClosed ||
    (job as any).status === 'EXPIRED' || 
    (job as any).status === 'CLOSED' ||
    (job.deadline && (job.deadline.includes('সমাপ্ত') || job.deadline.includes('শেষ')))
  );

  return {
    title: isExpired 
      ? `আবেদনের সময় শেষ - ${job.title} | চাকরি সেবা`
      : `অনলাইন আবেদন - ${job.title} | চাকরি সেবা`,
    description: `${job.title} - ${job.organization}। ${isExpired ? 'এই সার্কুলারের আবেদনের সময় শেষ হয়েছে।' : '১০০% নির্ভুল অনলাইন আবেদন করুন চাকরি সেবার মাধ্যমে।'}`,
  };
}

export default function ApplyPage({ params }: Props) {
  const job = serverDB.getPublicJobById(params.id);

  if (!job || job.id.startsWith('draft-') || (job as any).status === 'UNPUBLISHED') {
    redirect(`/jobs?search=${encodeURIComponent(params.id)}`);
  }

  return <ApplyClient initialJob={job} />;
}
