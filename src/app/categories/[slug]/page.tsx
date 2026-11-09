import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Briefcase, 
  ArrowRight, 
  Layers, 
  Filter, 
  Calendar, 
  Sparkles,
  ChevronRight,
  Banknote,
  GraduationCap,
  Train,
  ShieldCheck,
  Stethoscope,
  Wrench,
  HeartHandshake,
  Cpu,
  BookOpen,
  Coins,
  Scissors,
  PhoneCall,
  Wheat,
  Globe2,
  Plane,
  Microscope,
  TrendingUp,
  School,
  Landmark,
  Award,
  Building
} from 'lucide-react';
import { serverDB } from '@/lib/db';
import { SearchEngine } from '@/lib/search/engine';
import CategoryJobsClient from './CategoryJobsClient';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ICON_MAP: Record<string, any> = {
  Building2,
  Banknote,
  GraduationCap,
  Train,
  ShieldCheck,
  Stethoscope,
  Wrench,
  HeartHandshake,
  Briefcase,
  Cpu,
  BookOpen,
  Layers,
  Coins,
  Scissors,
  PhoneCall,
  Wheat,
  Globe2,
  Plane,
  Microscope,
  TrendingUp,
  School,
  Landmark,
  Award,
  Building
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const slug = (params?.slug || '').toLowerCase().trim();
  const category = slug ? serverDB.getCategoryBySlug(slug) : null;
  if (!category) {
    return { title: 'ক্যাটাগরি পাওয়া যায়নি | চাকরি সেবা' };
  }

  return {
    title: category.seo_title || `${category.name_bn} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`,
    description: category.seo_description || category.description_bn,
    alternates: {
      canonical: `https://chakrisheba.com/categories/${category.slug}`
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

export default async function CategoryLandingPage(props: Props) {
  const params = await props.params;
  const slug = (params?.slug || '').toLowerCase().trim();
  const category = slug ? serverDB.getCategoryBySlug(slug) : null;

  if (!category) {
    redirect(`/jobs?search=${encodeURIComponent(slug)}`);
  }

  // Canonical redirect if requested by an alias
  if (category.slug.toLowerCase() !== slug) {
    redirect(`/categories/${category.slug}`);
  }

  const allCategories = serverDB.getCategories().filter((c) => c.is_active);
  const parentCategory = category.parent_id ? serverDB.getCategoryById(category.parent_id) : null;
  const subcategories = allCategories.filter((c) => c.parent_id === category.id);
  const siblingCategories = category.parent_id
    ? allCategories.filter((c) => c.parent_id === category.parent_id)
    : [];

  const relatedCategories = allCategories
    .filter((c) => !c.parent_id && c.id !== category.id && c.id !== category.parent_id)
    .slice(0, 4);

  const allJobs = serverDB.getPublicJobs();

  // Initial server-side search evaluation for this category (matching client limit of 12)
  const initialResult = SearchEngine.search(allJobs, allCategories, {
    category: category.slug,
    limit: 12
  });

  // Breadcrumbs schema with hierarchical parent-child support
  const itemListElement = [
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
    }
  ];

  if (parentCategory) {
    itemListElement.push({
      '@type': 'ListItem',
      'position': 3,
      'name': parentCategory.name_bn,
      'item': `https://chakrisheba.com/categories/${parentCategory.slug}`
    });
    itemListElement.push({
      '@type': 'ListItem',
      'position': 4,
      'name': category.name_bn,
      'item': `https://chakrisheba.com/categories/${category.slug}`
    });
  } else {
    itemListElement.push({
      '@type': 'ListItem',
      'position': 3,
      'name': category.name_bn,
      'item': `https://chakrisheba.com/categories/${category.slug}`
    });
  }

  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  };

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': category.name_bn,
    'description': category.description_bn,
    'url': `https://chakrisheba.com/categories/${category.slug}`
  };

  const IconComponent = (category.icon && ICON_MAP[category.icon]) || Briefcase;

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
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link href="/categories" className="hover:text-emerald-700 transition-colors">ক্যাটাগরি</Link>
        {parentCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href={`/categories/${parentCategory.slug}`} className="hover:text-emerald-700 transition-colors">
              {parentCategory.name_bn}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold">{category.name_bn}</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0 shadow-inner">
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="max-w-3xl space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {category.name_en}
              </span>
              {parentCategory && (
                <Link
                  href={`/categories/${parentCategory.slug}`}
                  className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-800/60 transition-colors flex items-center gap-1"
                >
                  <span>মূল: {parentCategory.name_bn}</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
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
        </div>

        {/* Subcategories or Sibling Navigation */}
        {subcategories.length > 0 ? (
          <div className="mt-6 pt-5 border-t border-emerald-900/40">
            <div className="text-xs font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>উপ-ক্যাটাগরিসমূহ ({subcategories.length}টি বিশেষ শাখা):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  className="bg-emerald-900/60 hover:bg-emerald-700/80 border border-emerald-600/50 hover:border-emerald-400 text-emerald-200 hover:text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 group"
                >
                  <span>{sub.name_bn}</span>
                  <ChevronRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        ) : parentCategory && siblingCategories.length > 0 ? (
          <div className="mt-6 pt-5 border-t border-emerald-900/40 space-y-2.5">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{parentCategory.name_bn} এর অন্তর্ভুক্ত অন্যান্য শাখা:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {siblingCategories.map((sib) => {
                const isCurrent = sib.id === category.id;
                return isCurrent ? (
                  <span
                    key={sib.id}
                    className="bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-sm border border-emerald-400"
                  >
                    {sib.name_bn} (বর্তমান)
                  </span>
                ) : (
                  <Link
                    key={sib.id}
                    href={`/categories/${sib.slug}`}
                    className="bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-700/50 text-emerald-200 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
                  >
                    {sib.name_bn}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
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
