import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Briefcase, 
  ArrowRight, 
  Layers, 
  Filter, 
  Calendar, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { serverDB } from '@/lib/db';
import { SearchEngine } from '@/lib/search/engine';
import CategoryJobsClient from './CategoryJobsClient';

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = serverDB.getCategoryBySlug(params.slug);
  if (!category) {
    return { title: 'ক্যাটাগরি পাওয়া যায়নি | চাকরি সেবা' };
  }

  return {
    title: category.seo_title || `${category.name_bn} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`,
    description: category.seo_description || category.description_bn,
    alternates: {
      canonical: category.canonical_url || `https://chakrisheba.com/categories/${category.slug}`
    },
    openGraph: {
      title: category.seo_title || `${category.name_bn} নিয়োগ বিজ্ঞপ্তি ২০২৬`,
      description: category.seo_description || category.description_bn,
      url: `https://chakrisheba.com/categories/${category.slug}`,
      siteName: 'চাকরি সেবা (Chakri Sheba)',
      locale: 'bn_BD',
      type: 'website'
    }
  };
}

export default async function CategoryLandingPage({ params, searchParams }: Props) {
  const slug = params.slug.toLowerCase().trim();
  const category = serverDB.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const allCategories = serverDB.getCategories().filter((c) => c.is_active);
  const subcategories = allCategories.filter((c) => c.parent_id === category.id);
  const relatedCategories = allCategories
    .filter((c) => !c.parent_id && c.id !== category.id)
    .slice(0, 4);

  const allJobs = serverDB.getJobs();

  // Initial server-side search evaluation for this category
  const initialResult = SearchEngine.search(allJobs, allCategories, {
    category: category.slug,
    limit: 20
  });

  // Breadcrumbs schema
  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'হোম',
        'item': 'https://chakrisheba.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'ক্যাটাগরি',
        'item': 'https://chakrisheba.com/categories'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': category.name_bn,
        'item': `https://chakrisheba.com/categories/${category.slug}`
      }
    ]
  };

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': category.name_bn,
    'description': category.description_bn,
    'url': `https://chakrisheba.com/categories/${category.slug}`
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Structured Data (Breadcrumbs & CollectionPage only - strictly NO JobPosting schema) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/categories" className="hover:text-emerald-700 transition-colors">ক্যাটাগরি</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">{category.name_bn}</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {category.name_en}
            </span>
            <span className="text-xs text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
              {initialResult.total}টি সক্রিয় সার্কুলার
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            {category.name_bn} সার্কুলার ২০২৬
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {category.description_bn}
          </p>
        </div>

        {/* Subcategories Pills if any */}
        {subcategories.length > 0 && (
          <div className="mt-6 pt-5 border-t border-emerald-900/40">
            <div className="text-xs font-bold text-emerald-400 mb-2.5">উপ-ক্যাটাগরিসমূহ:</div>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <span
                  key={sub.id}
                  className="bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  {sub.name_bn}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Job List with Search & Multi-Filters */}
      <CategoryJobsClient
        categorySlug={category.slug}
        initialResult={initialResult}
      />

      {/* Related Categories Navigation */}
      {relatedCategories.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900">অন্যান্য জনপ্রিয় ক্যাটাগরি</h2>
            <Link href="/categories" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>সকল ক্যাটাগরি দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedCategories.map((rc) => (
              <Link
                key={rc.id}
                href={`/categories/${rc.slug}`}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all group"
              >
                <div className="font-bold text-slate-900 group-hover:text-emerald-700 text-sm">
                  {rc.name_bn}
                </div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {rc.description_bn}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
