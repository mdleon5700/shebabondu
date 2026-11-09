import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { JobTaxonomyClassifier } from '@/lib/taxonomy/classifier';
import CategoriesDirectoryClient, { CategoryItem } from '@/components/categories/CategoriesDirectoryClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সকল চাকরির ক্যাটাগরি ও নিয়োগ সেক্টরসমূহ ২০২৬ | চাকরি সেবা',
  description: 'সরকারি, ব্যাংক, শিক্ষকতা, এনজিও, আইটি, ইঞ্জিনিয়ারিং, ডিফেন্স ও প্রাইভেট সকল চাকরির সম্পূর্ণ ক্যাটাগরি ডিরেক্টরি। ২০টি মূল ক্যাটাগরি ও ৭টি সাব-ক্যাটাগরি।',
  alternates: {
    canonical: 'https://chakrisheba.com/categories'
  },
  openGraph: {
    title: 'সকল চাকরির ক্যাটাগরি ও নিয়োগ সেক্টরসমূহ ২০২৬ | চাকরি সেবা',
    description: '২০টি মূল ক্যাটাগরি ও ৭টি বিশেষায়িত সাব-ক্যাটাগরির সচিত্র ডিরেক্টরি।',
    url: 'https://chakrisheba.com/categories',
    type: 'website'
  }
};

export default function CategoriesDirectoryPage() {
  const allCategories = serverDB.getCategories().filter((c) => c.is_active);
  const eligibleJobs = serverDB.getPublicJobs().filter((j) => {
    if (j.id?.startsWith('draft-')) return false;
    const pubStatus = ((j as any).publicationStatus || '').toUpperCase();
    return pubStatus !== 'UNPUBLISHED' && pubStatus !== 'DRAFT';
  });

  // Calculate live counts for both root and subcategories
  const counts: Record<string, number> = {};
  for (const cat of allCategories) {
    counts[cat.id] = 0;
  }

  for (const job of eligibleJobs) {
    const cl = JobTaxonomyClassifier.classify(job);
    const catSlug = (job.category || '').toLowerCase();

    for (const cat of allCategories) {
      let matched = false;
      if (cat.parent_id) {
        if (
          cl.subcategories.includes(cat.id) ||
          cl.subcategories.includes(cat.slug) ||
          cl.subcategories.includes(cat.id.replace('cat-', ''))
        ) {
          matched = true;
        }
      } else {
        if (
          cl.primaryCategory === cat.id ||
          cl.categorySlug === cat.slug ||
          catSlug === cat.slug ||
          catSlug === cat.id.replace('cat-', '') ||
          cl.subcategories.includes(cat.id)
        ) {
          matched = true;
        }
      }
      if (matched) counts[cat.id] = (counts[cat.id] || 0) + 1;
    }
  }

  const rootCategories: CategoryItem[] = allCategories
    .filter(c => !c.parent_id)
    .sort((a, b) => (a.display_order || 99) - (b.display_order || 99))
    .map(c => ({
      id: c.id,
      name_bn: c.name_bn,
      name_en: c.name_en,
      slug: c.slug,
      description_bn: c.description_bn,
      parent_id: c.parent_id,
      icon: c.icon,
      count: counts[c.id] || 0
    }));

  const subCategories: CategoryItem[] = allCategories
    .filter(c => c.parent_id)
    .sort((a, b) => (a.display_order || 99) - (b.display_order || 99))
    .map(c => ({
      id: c.id,
      name_bn: c.name_bn,
      name_en: c.name_en,
      slug: c.slug,
      description_bn: c.description_bn,
      parent_id: c.parent_id,
      icon: c.icon,
      count: counts[c.id] || 0
    }));

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'সকল চাকরির ক্যাটাগরি ও নিয়োগ সেক্টরসমূহ ২০২৬ | চাকরি সেবা',
    description: '২০টি মূল ক্যাটাগরি ও ৭টি বিশেষায়িত সাব-ক্যাটাগরির সচিত্র ডিরেক্টরি।',
    url: 'https://chakrisheba.com/categories',
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
        name: 'সকল ক্যাটাগরি',
        item: 'https://chakrisheba.com/categories'
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">সকল ক্যাটাগরি ডিরেক্টরি</span>
      </div>

      <CategoriesDirectoryClient
        rootCategories={rootCategories}
        subCategories={subCategories}
        totalJobs={eligibleJobs.length}
        baseRoute="/categories"
      />
    </div>
  );
}
