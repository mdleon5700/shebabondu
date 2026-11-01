import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  Building2, 
  ExternalLink, 
  ArrowRight, 
  Landmark, 
  ShieldCheck, 
  CheckCircle2,
  Briefcase,
  Users
} from 'lucide-react';
import { serverDB } from '@/lib/db';
import JobLogo from '@/components/JobLogo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সকল নিয়োগকারী প্রতিষ্ঠান ও সংস্থা ডিরেক্টরি | চাকরি সেবা',
  description: 'বাংলাদেশ ব্যাংক, বিপিএসসি, বিভিন্ন মন্ত্রণালয়, অধিদপ্তর ও বিদ্যুৎ কোম্পানিসমূহের সর্বশেষ নিয়োগ তথ্য ও একক ডিরেক্টরি।',
};

// Bengali numeral helper
const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

function slugifyOrg(name: string): string {
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1].trim().length >= 2) {
    const acronym = parenMatch[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (acronym.length >= 2) return acronym;
  }
  return encodeURIComponent(name.toLowerCase().replace(/[,\(\)\.\/\\_]/g, ' ').trim().replace(/\s+/g, '-'));
}

export default function OrganizationsPage() {
  const allJobs = serverDB.getJobs();
  const allCompanies = serverDB.getCompanies();

  // Aggregate organizations from both jobs and companies
  interface OrgCardItem {
    name: string;
    logo: string;
    category: string;
    orgType: string;
    website: string;
    activeJobsCount: number;
    totalVacancies: number;
    slug: string;
  }

  const orgMap = new Map<string, OrgCardItem>();

  // Helper to register
  const register = (
    name: string,
    logo?: string,
    category?: string,
    orgType?: string,
    website?: string
  ) => {
    if (!name || !name.trim()) return;
    const clean = name.trim();
    const key = clean.toLowerCase();
    const existing = orgMap.get(key);
    if (!existing) {
      orgMap.set(key, {
        name: clean,
        logo: logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
        category: category || 'সরকারি চাকরি',
        orgType: orgType || 'সরকারি / স্বায়ত্তশাসিত',
        website: website || '',
        activeJobsCount: 0,
        totalVacancies: 0,
        slug: slugifyOrg(clean)
      });
    }
  };

  // 1. Register from companies
  for (const c of allCompanies) {
    register(c.name, c.logo, c.industry, c.organizationType, c.website);
  }

  // 2. Register and calculate from live circulars
  for (const j of allJobs) {
    if (!j.organization) continue;
    register(j.organization, j.logo, j.categoryLabel || j.category, j.orgType, j.officialLink);
    const item = orgMap.get(j.organization.trim().toLowerCase());
    if (item) {
      item.activeJobsCount += 1;
      item.totalVacancies += Number(j.totalPosts) || 1;
    }
  }

  const organizations = Array.from(orgMap.values()).sort((a, b) => {
    if (b.activeJobsCount !== a.activeJobsCount) {
      return b.activeJobsCount - a.activeJobsCount;
    }
    return a.name.localeCompare(b.name, 'bn');
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">প্রতিষ্ঠান ডিরেক্টরি</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>প্রতিষ্ঠান ডিরেক্টরি ২০২৬</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            সকল নিয়োগকারী প্রতিষ্ঠান ও সংস্থা
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            বাংলাদেশের শীর্ষস্থানীয় সরকারি প্রতিষ্ঠান, মন্ত্রণালয়, ব্যাংক, বিদ্যুৎ কোম্পানি ও স্বায়ত্তশাসিত সংস্থাসমূহের একক তালিকা। যেকোনো প্রতিষ্ঠানে ক্লিক করে তাদের সকল চলমান সার্কুলার দেখুন।
          </p>
        </div>
      </div>

      {/* Org Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org, idx) => (
          <Link
            key={idx}
            href={`/organizations/${org.slug}`}
            className="bg-white rounded-3xl border border-slate-200/90 p-5 hover:border-emerald-500 hover:shadow-xl transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-2xs">
                  <JobLogo logo={org.logo} organization={org.name} size="md" className="w-full h-full object-contain" />
                </div>

                {org.activeJobsCount > 0 ? (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <Briefcase className="w-3 h-3 text-emerald-700" />
                    <span>{toBn(org.activeJobsCount)} টি চলমান</span>
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    ভেরিফাইড
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  {org.orgType}
                </span>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {org.name}
                </h2>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-emerald-700">
              <span className="text-slate-500 flex items-center gap-1">
                {org.totalVacancies > 0 ? (
                  <>
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>মোট {toBn(org.totalVacancies)} টি শূন্যপদ</span>
                  </>
                ) : (
                  <span>সার্কুলার দেখুন</span>
                )}
              </span>
              <div className="flex items-center gap-1 text-emerald-700 font-bold group-hover:translate-x-1 transition-transform">
                <span>সকল পদ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
