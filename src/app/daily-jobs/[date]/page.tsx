import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { BangladeshDateHelper } from '@/lib/feeds/timezone';
import JobFeedClient from '@/components/feeds/JobFeedClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: { date: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsedIso = BangladeshDateHelper.parseToIsoDate(params.date);
  if (!parsedIso) {
    return { title: 'তারিখ পাওয়া যায়নি | চাকরি সেবা' };
  }
  const dateBn = BangladeshDateHelper.formatBengaliFullDate(parsedIso);

  return {
    title: `${dateBn} এর চাকরির সার্কুলার | Daily Jobs Archive | চাকরি সেবা`,
    description: `${dateBn} তারিখে প্রকাশিত সকল সরকারি ও বেসরকারি চাকরির নিয়োগ বিজ্ঞপ্তি। বিস্তারিত তথ্য ও আবেদনের নিয়মাবলী দেখুন।`,
    alternates: {
      canonical: `https://chakrisheba.com/daily-jobs/${parsedIso}`
    },
    openGraph: {
      title: `${dateBn} এর চাকরির সার্কুলার | চাকরি সেবা`,
      description: `${dateBn} তারিখে প্রকাশিত সকল সরকারি ও ব্যাংক চাকরির সার্কুলার।`,
      url: `https://chakrisheba.com/daily-jobs/${parsedIso}`,
      type: 'website'
    }
  };
}

export default function DailyJobDatePage({ params }: Props) {
  const rawDate = (params.date || '').toLowerCase().trim();
  if (rawDate === 'today') {
    const today = new Date().toISOString().split('T')[0];
    redirect(`/daily-jobs/${today}`);
  }
  if (rawDate === 'yesterday') {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    redirect(`/daily-jobs/${yesterday}`);
  }
  if (/^\d{4}-\d{2}$/.test(rawDate)) {
    redirect('/daily-jobs');
  }

  const parsedIso = BangladeshDateHelper.parseToIsoDate(params.date);
  if (!parsedIso) {
    redirect('/daily-jobs');
  }

  const jobs = serverDB.getPublicJobs();
  const placements = serverDB.getFeaturedPlacements();
  const dateBn = BangladeshDateHelper.formatBengaliFullDate(parsedIso);
  const categories = serverDB.getCategories().filter(c => c.is_active).map(c => ({
    id: c.id,
    name_bn: c.name_bn,
    slug: c.slug
  }));

  const initialResult = JobFeedEngine.getFeed(jobs, { feedType: 'daily', date: parsedIso, limit: 9 }, placements);

  // Calculate previous and next date for calendar navigation
  const currDate = new Date(`${parsedIso}T00:00:00Z`);
  const prevDateIso = new Date(currDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextDateIso = new Date(currDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${dateBn} এর চাকরির সার্কুলার | চাকরি সেবা`,
    description: `${dateBn} তারিখে প্রকাশিত সকল চাকরির বিজ্ঞপ্তি।`,
    url: `https://chakrisheba.com/daily-jobs/${parsedIso}`,
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
        name: 'দৈনিক আর্কাইভ',
        item: 'https://chakrisheba.com/daily-jobs'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: dateBn,
        item: `https://chakrisheba.com/daily-jobs/${parsedIso}`
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

      <div className="max-w-7xl mx-auto">
        <JobFeedClient
          feedType="daily"
          title={`${dateBn} এর চাকরির সার্কুলার`}
          subtitle={`উক্ত তারিখে বাংলাদেশ সময় অনুযায়ী প্রকাশিত সকল সরকারি গেজেট ও বেসরকারি চাকরির বিজ্ঞপ্তি।`}
          date={parsedIso}
          dateBn={dateBn}
          initialResult={initialResult}
          categories={categories}
          navigation={{
            prevDate: prevDateIso,
            prevDateBn: BangladeshDateHelper.formatBengaliFullDate(prevDateIso),
            nextDate: nextDateIso,
            nextDateBn: BangladeshDateHelper.formatBengaliFullDate(nextDateIso)
          }}
        />
      </div>
    </div>
  );
}
