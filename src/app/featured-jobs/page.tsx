import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import JobFeedClient from '@/components/feeds/JobFeedClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'বিশেষ ও গুরুত্বপূর্ণ চাকরির সার্কুলার ২০২৬ — Featured Jobs | চাকরি সেবা',
  description: 'শীর্ষস্থানীয় সরকারি মন্ত্রণালয়, রাষ্ট্রায়ত্ত ও বেসরকারি ব্যাংক এবং স্বনামধন্য বহুজাতিক কোম্পানির বিশেষ নিয়োগ বিজ্ঞপ্তি। অগ্রাধিকারপ্রাপ্ত সার্কুলার দেখুন।',
  alternates: {
    canonical: 'https://chakrisheba.com/featured-jobs'
  },
  openGraph: {
    title: 'বিশেষ ও গুরুত্বপূর্ণ চাকরির সার্কুলার ২০২৬ | চাকরি সেবা',
    description: 'শীর্ষস্থানীয় সরকারি ও ব্যাংক নিয়োগ বিজ্ঞপ্তি।',
    url: 'https://chakrisheba.com/featured-jobs',
    type: 'website'
  }
};

export default function FeaturedJobsPage() {
  const jobs = serverDB.getJobs();
  const placements = serverDB.getFeaturedPlacements();
  const categories = serverDB.getCategories().filter(c => c.is_active).map(c => ({
    id: c.id,
    name_bn: c.name_bn,
    slug: c.slug
  }));

  const initialResult = JobFeedEngine.getFeed(jobs, { feedType: 'featured', limit: 9 }, placements);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'বিশেষ ও গুরুত্বপূর্ণ চাকরির সার্কুলার ২০২৬ | চাকরি সেবা',
    description: 'শীর্ষস্থানীয় সরকারি ও ব্যাংক নিয়োগ বিজ্ঞপ্তি।',
    url: 'https://chakrisheba.com/featured-jobs',
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
        name: 'ফিচার্ড চাকরি',
        item: 'https://chakrisheba.com/featured-jobs'
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
          feedType="featured"
          title="বিশেষ ও গুরুত্বপূর্ণ চাকরির বিজ্ঞপ্তি ২০২৬"
          subtitle="বাংলাদেশের সবচেয়ে আকর্ষণীয় পদ ও শীর্ষ প্রতিষ্ঠানের বাছাইকৃত সার্কুলার। উচ্চ অগ্রাধিকারপ্রাপ্ত এই সার্কুলারগুলোতে সময়মতো আবেদন সম্পন্ন করুন।"
          initialResult={initialResult}
          categories={categories}
        />
      </div>
    </div>
  );
}
