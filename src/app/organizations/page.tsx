import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import OrganizationsDirectoryClient, { OrgDirectoryItem } from '@/components/OrganizationsDirectoryClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সকল নিয়োগকারী প্রতিষ্ঠান ও সংস্থা বর্ণানুক্রমিক ডিরেক্টরি | চাকরি সেবা',
  description: 'বাংলাদেশ ব্যাংক, বিপিএসসি, বিভিন্ন মন্ত্রণালয়, অধিদপ্তর ও বিদ্যুৎ কোম্পানিসমূহের সর্বশেষ নিয়োগ তথ্য, বর্ণানুক্রমিক ডিরেক্টরি ও সার্কুলার হাব।',
  openGraph: {
    title: 'সকল নিয়োগকারী প্রতিষ্ঠান ডিরেক্টরি | চাকরি সেবা',
    description: 'বাংলাদেশের সকল মন্ত্রণালয়, অধিদপ্তর, ব্যাংক ও স্বায়ত্তশাসিত সংস্থার সার্কুলার ডিরেক্টরি।',
  },
};

function slugifyOrg(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('petrobangla') || lower.includes('পেট্রোবাংলা')) return 'petrobangla';
  if (lower.includes('bpsc') || lower.includes('কর্ম কমিশন')) return 'bpsc';
  if (lower.includes('bangladesh bank') || lower.includes('বাংলাদেশ ব্যাংক')) return 'bangladesh-bank';
  if (lower.includes('cable shilpa') || lower.includes('bcsl')) return 'bcsl';
  if (lower.includes('cpgcbl') || lower.includes('coal power')) return 'cpgcbl';
  if (lower.includes('dscc') || lower.includes('dhaka south')) return 'dscc';

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

  const orgMap = new Map<string, OrgDirectoryItem>();

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

  // 2. Register from jobs
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

  return <OrganizationsDirectoryClient initialOrganizations={organizations} />;
}
