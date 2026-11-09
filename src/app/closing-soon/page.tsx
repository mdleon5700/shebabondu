import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import JobFeedClient from '@/components/feeds/JobFeedClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'জরুরি ডেডলাইন — যে সব চাকরির আবেদনের সময় শীঘ্রই শেষ | চাকরি সেবা',
  description: 'যেসব সরকারি ও বেসরকারি চাকরির আবেদনের শেষ সময় আগামী ৩ দিনের মধ্যে। সার্ভার জ্যাম বা শেষ মুহূর্তের ঝামেলা এড়াতে দ্রুত আবেদন সম্পন্ন করুন।',
  alternates: {
    canonical: 'https://chakrisheba.com/closing-soon'
  },
  openGraph: {
    title: 'জরুরি ডেডলাইন চাকরির বিজ্ঞপ্তি | চাকরি সেবা',
    description: 'যেসব চাকরির আবেদনের সময় শীঘ্রই শেষ হচ্ছে।',
    url: 'https://chakrisheba.com/closing-soon',
    type: 'website'
  }
};

export default function ClosingSoonPage() {
  const jobs = serverDB.getPublicJobs();
  const placements = serverDB.getFeaturedPlacements();
  const categories = serverDB.getCategories().filter(c => c.is_active).map(c => ({
    id: c.id,
    name_bn: c.name_bn,
    slug: c.slug
  }));

  const initialResult = JobFeedEngine.getFeed(jobs, { feedType: 'closing_soon', limit: 9 }, placements);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'জরুরি ডেডলাইন চাকরির সার্কুলার | চাকরি সেবা',
    description: 'যেসব চাকরির আবেদনের সময় শীঘ্রই শেষ হচ্ছে।',
    url: 'https://chakrisheba.com/closing-soon',
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
        name: 'জরুরি ডেডলাইন',
        item: 'https://chakrisheba.com/closing-soon'
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

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hub Navigator Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/deadline-today"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            আজকের ডেডলাইন
          </Link>
          <Link
            href="/closing-soon"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-700 text-white shadow-xs flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>জরুরি ডেডলাইন (৪৮-৭২ ঘণ্টা)</span>
          </Link>
          <Link
            href="/deadline-approaching"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            সকল সমাগত ডেডলাইন
          </Link>
        </div>

        <JobFeedClient
          feedType="closing_soon"
          title="জরুরি ডেডলাইন — আবেদনের সময় শীঘ্রই শেষ"
          subtitle="আগামী ৩ দিনের মধ্যে যেসব সরকারি ও ব্যাংক চাকরির আবেদনের সময়সীমা শেষ হচ্ছে। শেষ সময়ের টেলিটক সার্ভার জটিলতা এড়াতে এখনই ১-ক্লিকে আবেদন করুন।"
          initialResult={initialResult}
          categories={categories}
        />
      </div>
    </div>
  );
}
