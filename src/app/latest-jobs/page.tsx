import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import JobFeedClient from '@/components/feeds/JobFeedClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সর্বশেষ চাকরির বিজ্ঞপ্তি ২০২৬ — Latest Job Circulars in Bangladesh | চাকরি সেবা',
  description: 'বাংলাদেশের সকল নতুন সরকারি চাকরি, ব্যাংক জব, বেসরকারি ও আন্তর্জাতিক চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি। প্রতিদিনের নতুন চাকরি সার্কুলার অনলাইনে দেখুন।',
  alternates: {
    canonical: 'https://chakrisheba.com/latest-jobs'
  },
  openGraph: {
    title: 'সর্বশেষ চাকরির বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা',
    description: 'বাংলাদেশের সকল নতুন সরকারি ও ব্যাংক চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি।',
    url: 'https://chakrisheba.com/latest-jobs',
    type: 'website'
  }
};

export default function LatestJobsPage() {
  const jobs = serverDB.getJobs();
  const placements = serverDB.getFeaturedPlacements();
  const categories = serverDB.getCategories().filter(c => c.is_active).map(c => ({
    id: c.id,
    name_bn: c.name_bn,
    slug: c.slug
  }));

  const initialResult = JobFeedEngine.getFeed(jobs, { feedType: 'latest', limit: 9 }, placements);

  // CollectionPage & BreadcrumbList structured schemas (Strictly NO JobPosting on feed pages)
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'সর্বশেষ চাকরির বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা',
    description: 'বাংলাদেশের সকল নতুন সরকারি ও ব্যাংক চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি।',
    url: 'https://chakrisheba.com/latest-jobs',
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
        name: 'সর্বশেষ চাকরি',
        item: 'https://chakrisheba.com/latest-jobs'
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
          feedType="latest"
          title="সর্বশেষ চাকরির বিজ্ঞপ্তি ২০২৬"
          subtitle="বাংলাদেশ সরকারের বিভিন্ন মন্ত্রণালয়, ব্যাংক, স্বায়ত্তশাসিত প্রতিষ্ঠান ও শীর্ষ কর্পোরেটের সদ্য প্রকাশিত সকল চলমান চাকরির সার্কুলার এক প্ল্যাটফর্মে।"
          initialResult={initialResult}
          categories={categories}
        />
      </div>
    </div>
  );
}
