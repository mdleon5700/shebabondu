import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
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
  ArrowRight,
  BookOpen,
  Sparkles,
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
  Landmark
} from 'lucide-react';
import { serverDB } from '@/lib/db';
import { JobTaxonomyClassifier } from '@/lib/taxonomy/classifier';

export const metadata: Metadata = {
  title: 'সকল চাকরির ক্যাটাগরি ও নিয়োগ সেক্টরসমূহ ২০২৬ | চাকরি সেবা',
  description: 'সরকারি, ব্যাংক, শিক্ষকতা, এনজিও, আইটি, ইঞ্জিনিয়ারিং, ডিফেন্স ও প্রাইভেট সকল চাকরির সম্পূর্ণ ক্যাটাগরি ডিরেক্টরি।',
  alternates: {
    canonical: 'https://chakrisheba.com/categories'
  }
};

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
  Landmark
};

export default function CategoriesDirectoryPage() {
  const categories = serverDB.getCategories().filter((c) => !c.parent_id && c.is_active);
  const eligibleJobs = serverDB.getJobs().filter((j) => {
    if (j.id?.startsWith('draft-')) return false;
    const status = ((j as any).status || '').toLowerCase();
    const pubStatus = ((j as any).publicationStatus || '').toUpperCase();
    return status !== 'unpublished' && status !== 'draft' && pubStatus !== 'UNPUBLISHED' && pubStatus !== 'DRAFT';
  });

  const counts: Record<string, number> = {};
  for (const job of eligibleJobs) {
    const cl = JobTaxonomyClassifier.classify(job);
    counts[cl.primaryCategory] = (counts[cl.primaryCategory] || 0) + 1;
  }

  // Schema: CollectionPage & BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'সকল চাকরির ক্যাটাগরি ডিরেক্টরি',
    'description': 'বাংলাদেশের সকল সরকারি ও বেসরকারি নিয়োগ ক্যাটাগরি ও কর্মক্ষেত্র।',
    'url': 'https://chakrisheba.com/categories'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">সকল ক্যাটাগরি</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <div className="max-w-3xl space-y-3">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            সেন্ট্রাল ট্যাক্সোনমি ও ডিরেক্টরি
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            সকল চাকরির ক্যাটাগরি ও কর্মক্ষেত্র ডিরেক্টরি
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            আপনার ক্যারিয়ার ক্ষেত্র, শিক্ষাগত যোগ্যতা বা পছন্দের সেক্টর অনুযায়ী হালনাগাদ যাচাইকৃত সকল সার্কুলার সহজেই খুঁজে নিন।
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Briefcase;
          const jobCount = counts[cat.id] || 0;

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/5 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.name_bn}
                  </h2>
                  <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {cat.name_en}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {cat.description_bn}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  {jobCount}টি সক্রিয় বিজ্ঞপ্তি
                </span>
                <span className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all flex items-center gap-1">
                  <span>বিজ্ঞপ্তি দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
