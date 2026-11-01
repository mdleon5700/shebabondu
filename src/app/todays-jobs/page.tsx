import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { BangladeshDateHelper } from '@/lib/feeds/timezone';
import JobFeedClient from '@/components/feeds/JobFeedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();
  return {
    title: `আজকের চাকরির খবর — ${todayInfo.dateBn} | Today's Job Circulars | চাকরি সেবা`,
    description: `আজকে (${todayInfo.dateBn}) প্রকাশিত সকল নতুন সরকারি, ব্যাংক ও বেসরকারি চাকরির নিয়োগ বিজ্ঞপ্তি। প্রতিদিনের তাজা চাকরির খবর সবার আগে দেখুন।`,
    alternates: {
      canonical: 'https://chakrisheba.com/todays-jobs'
    },
    openGraph: {
      title: `আজকের চাকরির খবর — ${todayInfo.dateBn} | চাকরি সেবা`,
      description: `আজকে (${todayInfo.dateBn}) প্রকাশিত সকল নতুন সরকারি ও ব্যাংক চাকরির সার্কুলার।`,
      url: 'https://chakrisheba.com/todays-jobs',
      type: 'website'
    }
  };
}

export default function TodaysJobsPage() {
  const jobs = serverDB.getJobs();
  const placements = serverDB.getFeaturedPlacements();
  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();
  const categories = serverDB.getCategories().filter(c => c.is_active).map(c => ({
    id: c.id,
    name_bn: c.name_bn,
    slug: c.slug
  }));

  const initialResult = JobFeedEngine.getFeed(jobs, { feedType: 'today', limit: 9 }, placements);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `আজকের চাকরির খবর — ${todayInfo.dateBn} | চাকরি সেবা`,
    description: `আজকে (${todayInfo.dateBn}) প্রকাশিত সকল নতুন সরকারি ও ব্যাংক চাকরির সার্কুলার।`,
    url: 'https://chakrisheba.com/todays-jobs',
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
        name: 'আজকের চাকরি',
        item: 'https://chakrisheba.com/todays-jobs'
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
          feedType="today"
          title={`আজকের চাকরির খবর — ${todayInfo.dateBn}`}
          subtitle={`আজ (${todayInfo.dayBn}) প্রকাশিত সকল অফিসিয়াল সার্কুলার। বাংলাদেশ সময় অনুযায়ী নির্ধারিত ক্যালেন্ডার ডে-তে রিয়েল-টাইমে আপডেট করা হয়েছে।`}
          date={todayInfo.isoDate}
          dateBn={todayInfo.dateBn}
          initialResult={initialResult}
          categories={categories}
        />
      </div>
    </div>
  );
}
