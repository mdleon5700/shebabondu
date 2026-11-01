import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export interface OrgSuggestionItem {
  name: string;
  nameBn?: string;
  logo: string;
  orgType: string;
  category: string;
  website: string;
  activeJobsCount: number;
  slug: string;
}

// Canonical slug generator
function slugifyOrg(name: string): string {
  // Extract acronym inside parentheses if available, e.g. "CPGCBL" from "(CPGCBL)"
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1].trim().length >= 2) {
    const acronym = parenMatch[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (acronym.length >= 2) return acronym;
  }
  
  // Standard transliteration or slug
  const normalized = name
    .toLowerCase()
    .replace(/[,\(\)\.\/\\_]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
    
  return encodeURIComponent(normalized);
}

// Well-known national agencies and companies seed list
const KNOWN_NATIONAL_ORGS: Array<Omit<OrgSuggestionItem, 'activeJobsCount' | 'slug'>> = [
  {
    name: 'বাংলাদেশ ব্যাংক (Bangladesh Bank)',
    nameBn: 'বাংলাদেশ ব্যাংক',
    logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
    orgType: 'কেন্দ্রীয় ব্যাংক',
    category: 'bank',
    website: 'https://bb.org.bd'
  },
  {
    name: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    nameBn: 'বাংলাদেশ সরকারি কর্ম কমিশন',
    logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
    orgType: 'সাংবিধানিক প্রতিষ্ঠান',
    category: 'govt',
    website: 'https://bpsc.gov.bd'
  },
  {
    name: 'কোল পাওয়ার জেনারেশন কোম্পানি বাংলাদেশ লিমিটেড (CPGCBL)',
    nameBn: 'কোল পাওয়ার জেনারেশন কোম্পানি বাংলাদেশ লিমিটেড',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'সরকারি বিদ্যুৎ কোম্পানি / রাষ্ট্রায়ত্ত',
    category: 'govt',
    website: 'https://cpgcbl.gov.bd'
  },
  {
    name: 'আশুগঞ্জ পাওয়ার স্টেশন কোম্পানি লিমিটেড (APSCL)',
    nameBn: 'আশুগঞ্জ পাওয়ার স্টেশন কোম্পানি লিমিটেড',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'সরকারি বিদ্যুৎ কোম্পানি / রাষ্ট্রায়ত্ত',
    category: 'govt',
    website: 'https://apscl.gov.bd'
  },
  {
    name: 'বাংলাদেশ সশস্ত্র বাহিনী বোর্ড (BASB), প্রতিরক্ষা মন্ত্রণালয়',
    nameBn: 'বাংলাদেশ সশস্ত্র বাহিনী বোর্ড',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'প্রতিরক্ষা মন্ত্রণালয় ও সশস্ত্র বাহিনী',
    category: 'defense',
    website: 'https://basb.gov.bd'
  },
  {
    name: 'আয়কর গোয়েন্দা ও তদন্ত ইউনিট (ITIIU), জাতীয় রাজস্ব বোর্ড (NBR)',
    nameBn: 'আয়কর গোয়েন্দা ও তদন্ত ইউনিট, জাতীয় রাজস্ব বোর্ড',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'অভ্যন্তরীণ সম্পদ বিভাগ ও জাতীয় রাজস্ব বোর্ড',
    category: 'govt',
    website: 'https://nbr.gov.bd'
  },
  {
    name: 'জেলা প্রশাসকের কার্যালয়, ঝিনাইদহ',
    nameBn: 'জেলা প্রশাসকের কার্যালয়, ঝিনাইদহ',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'জেলা প্রশাসন ও জনপ্রশাসন মন্ত্রণালয়',
    category: 'govt',
    website: 'https://jhenaidah.gov.bd'
  },
  {
    name: 'সোনালী ব্যাংক পিএলসি (Sonali Bank)',
    nameBn: 'সোনালী ব্যাংক পিএলসি',
    logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
    orgType: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক',
    category: 'bank',
    website: 'https://sonalibank.com.bd'
  },
  {
    name: 'জনতা ব্যাংক পিএলসি (Janata Bank)',
    nameBn: 'জনতা ব্যাংক পিএলসি',
    logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
    orgType: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক',
    category: 'bank',
    website: 'https://jb.com.bd'
  },
  {
    name: 'অগ্রণী ব্যাংক পিএলসি (Agrani Bank)',
    nameBn: 'অগ্রণী ব্যাংক পিএলসি',
    logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
    orgType: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক',
    category: 'bank',
    website: 'https://agranibank.org'
  },
  {
    name: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (BREB)',
    nameBn: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'স্বায়ত্তশাসিত সংস্থা',
    category: 'govt',
    website: 'https://reb.gov.bd'
  },
  {
    name: 'বাংলাদেশ রেলওয়ে (Railway)',
    nameBn: 'বাংলাদেশ রেলওয়ে',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'রেলপথ মন্ত্রণালয়',
    category: 'railway',
    website: 'https://railway.gov.bd'
  },
  {
    name: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    nameBn: 'প্রাথমিক শিক্ষা অধিদপ্তর',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়',
    category: 'teacher',
    website: 'https://dpe.gov.bd'
  },
  {
    name: 'স্বাস্থ্য সেবা অধিদপ্তর (DGHS)',
    nameBn: 'স্বাস্থ্য সেবা অধিদপ্তর',
    logo: 'https://alljobs.teletalk.com.bd/media/recruiter/organization/logo/bangladesh-govt-logo-A2C7688845-seeklogo.com_QWZOOQ6.png',
    orgType: 'স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়',
    category: 'health',
    website: 'https://dghs.gov.bd'
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    // 1. Fetch current jobs and companies
    const allJobs = serverDB.getJobs();
    const companies = serverDB.getCompanies();

    // 2. Build map of organizations keyed by lowercased trimmed name
    const orgMap = new Map<string, OrgSuggestionItem>();

    // Helper to register an org
    const registerOrg = (
      name: string,
      logo?: string,
      orgType?: string,
      category?: string,
      website?: string,
      nameBn?: string
    ) => {
      if (!name || !name.trim()) return;
      const cleanName = name.trim();
      const key = cleanName.toLowerCase();

      const existing = orgMap.get(key);
      if (existing) {
        if (!existing.logo && logo) existing.logo = logo;
        if (!existing.orgType && orgType) existing.orgType = orgType;
        if (!existing.category && category) existing.category = category;
        if (!existing.website && website) existing.website = website;
        if (!existing.nameBn && nameBn) existing.nameBn = nameBn;
      } else {
        orgMap.set(key, {
          name: cleanName,
          nameBn: nameBn || cleanName,
          logo: logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
          orgType: orgType || 'সরকারি / স্বায়ত্তশাসিত',
          category: category || 'govt',
          website: website || '',
          activeJobsCount: 0,
          slug: slugifyOrg(cleanName)
        });
      }
    };

    // Seed known national orgs first
    for (const ko of KNOWN_NATIONAL_ORGS) {
      registerOrg(ko.name, ko.logo, ko.orgType, ko.category, ko.website, ko.nameBn);
    }

    // Register from companies database
    for (const comp of companies) {
      registerOrg(
        comp.name,
        comp.logo,
        comp.organizationType || comp.industry,
        comp.industry?.includes('ব্যাংক') ? 'bank' : 'govt',
        comp.website,
        comp.nameBn
      );
    }

    // Register and count from jobs database
    for (const job of allJobs) {
      if (!job.organization) continue;
      registerOrg(
        job.organization,
        job.logo,
        job.orgType,
        job.category,
        job.officialLink
      );
      const rec = orgMap.get(job.organization.trim().toLowerCase());
      if (rec) {
        rec.activeJobsCount += 1;
      }
    }

    let results = Array.from(orgMap.values());

    // Filter by query if provided
    if (query) {
      results = results.filter(org => {
        const nameMatch = org.name.toLowerCase().includes(query);
        const nameBnMatch = org.nameBn ? org.nameBn.toLowerCase().includes(query) : false;
        const orgTypeMatch = org.orgType.toLowerCase().includes(query);
        const slugMatch = org.slug.toLowerCase().includes(query);
        return nameMatch || nameBnMatch || orgTypeMatch || slugMatch;
      });
    }

    // Sort: items with active jobs first, then alphabetically
    results.sort((a, b) => {
      if (b.activeJobsCount !== a.activeJobsCount) {
        return b.activeJobsCount - a.activeJobsCount;
      }
      return a.name.localeCompare(b.name, 'bn');
    });

    return NextResponse.json({
      success: true,
      total: results.length,
      organizations: results
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load organization suggestions' },
      { status: 500 }
    );
  }
}
