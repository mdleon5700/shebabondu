import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Clock, ArrowRight, Building2, Calendar, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import UpdatedCircularsClient, { UpdatedJobItem } from '@/components/updated/UpdatedCircularsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সংশোধিত ও সময় বর্ধিত চাকরির সার্কুলার ২০২৬ | চাকরি সেবা',
  description: 'যেসব সরকারি ও ব্যাংক চাকরির আবেদনের সময় বৃদ্ধি, পদসংখ্যা পরিবর্তন বা সংশোধনী গেজেট (Corrigendum) এসেছে। অফিসিয়াল বিজ্ঞপ্তি ও বর্ধিত সময়সীমা দেখুন।',
  alternates: {
    canonical: 'https://chakrisheba.com/updated-circulars'
  },
  openGraph: {
    title: 'সংশোধিত ও সময় বর্ধিত চাকরির সার্কুলার ২০২৬ | চাকরি সেবা',
    description: 'আবেদনের সময় বাড়ানো হয়েছে বা সংশোধনী গেজেট এসেছে যেসব সরকারি ও ব্যাংক চাকরির।',
    url: 'https://chakrisheba.com/updated-circulars',
    type: 'website'
  }
};

export default function UpdatedCircularsPage() {
  const allJobs = serverDB.getPublicJobs();
  const approvedProposals = serverDB.getCircularChangeProposals('APPROVED');
  const updatedList: UpdatedJobItem[] = [];

  for (const job of allJobs) {
    if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
      continue;
    }

    const revisions = serverDB.getDeadlineRevisions(job.id);
    const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
    const jobProposals = approvedProposals.filter(p => p.jobId === job.id);

    const isExtended = 
      evalResult.status === 'EXTENDED' || 
      revisions.length > 0 || 
      Boolean(job.deadline && (job.deadline.includes('বৃদ্ধি') || job.deadline.includes('বর্ধিত') || job.deadline.toLowerCase().includes('extended'))) ||
      Boolean((job as any).isExtended) ||
      jobProposals.some(p => p.changeType === 'DEADLINE_EXTENDED');

    const hasCorrigendum = 
      Boolean((job as any).hasCorrigendum) ||
      Boolean((job as any).corrigendumText) ||
      Boolean((job as any).corrigendumPdfUrl) ||
      Boolean(job.title?.includes('সংশোধিত') || job.title?.includes('সংশোধনী')) ||
      Boolean(job.bengaliDescription?.includes('সংশোধিত') || job.bengaliDescription?.includes('সংশোধনী')) ||
      jobProposals.some(p => p.changeType === 'REVISED_CIRCULAR');

    const hasVacancyChanged =
      Boolean((job as any).vacanciesChanged) ||
      Boolean(job.revisionHistory?.some(r => r.summary?.includes('পদসংখ্যা') || r.changedFields?.includes('totalPosts'))) ||
      Boolean(job.title?.includes('পদ বৃদ্ধি') || job.bengaliDescription?.includes('পদসংখ্যা বৃদ্ধি')) ||
      jobProposals.some(p => p.changeType === 'VACANCY_CHANGED');

    if (isExtended || hasCorrigendum || hasVacancyChanged) {
      const updateTypes: ('DEADLINE_EXTENDED' | 'CORRIGENDUM' | 'VACANCY_CHANGED')[] = [];
      if (isExtended) updateTypes.push('DEADLINE_EXTENDED');
      if (hasCorrigendum) updateTypes.push('CORRIGENDUM');
      if (hasVacancyChanged) updateTypes.push('VACANCY_CHANGED');

      updatedList.push({
        ...job,
        updateTypes,
        revisions,
        corrigendumText: (job as any).corrigendumText || (hasCorrigendum ? 'উক্ত নিয়োগ বিজ্ঞপ্তির শর্তাবলী সংশোধিত হয়েছে। অফিশিয়াল নোটিশ বা মূল সার্কুলার দেখুন।' : undefined),
        corrigendumPdfUrl: (job as any).corrigendumPdfUrl || (job as any).circularPdfUrl || undefined,
        corrigendumDate: (job as any).corrigendumDate || undefined
      });
    }
  }

  // Sort: most recently revised or updated first
  updatedList.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'সংশোধিত ও সময় বর্ধিত চাকরির সার্কুলার ২০২৬ | চাকরি সেবা',
    description: 'আবেদনের সময়সীমা বর্ধিত বা সংশোধনী গেজেট প্রকাশিত সার্কুলারসমূহ।',
    url: 'https://chakrisheba.com/updated-circulars',
    isPartOf: {
      '@type': 'WebSite',
      name: 'চাকরি সেবা (Chakri Sheba)',
      url: 'https://chakrisheba.com'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম',
        item: 'https://chakrisheba.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'সংশোধিত সার্কুলার',
        item: 'https://chakrisheba.com/updated-circulars'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-purple-800/40 relative overflow-hidden">
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>রিয়েল-টাইম সংশোধিত ও আপডেট নোটিশ হাব</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              সংশোধিত ও সময় বর্ধিত সার্কুলার ({CentralDeadlineEngine.toBn(updatedList.length)}টি বিজ্ঞপ্তি)
            </h1>
            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
              সংশ্লিষ্ট প্রতিষ্ঠান কর্তৃক যেসকল নিয়োগ বিজ্ঞপ্তির আবেদনের সময়সীমা বর্ধিত করা হয়েছে, পদসংখ্যা পরিবর্তন হয়েছে কিংবা অফিশিয়াল সংশোধনী গেজেট (Corrigendum) প্রকাশিত হয়েছে।
            </p>
          </div>
        </div>

        {/* Client Interactive Section with Tabs, Search, and Grid */}
        <UpdatedCircularsClient initialJobs={updatedList} />
      </div>
    </div>
  );
}
