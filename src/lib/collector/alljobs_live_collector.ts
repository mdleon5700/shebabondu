import https from 'https';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';
import { GeminiService } from '@/lib/gemini/gemini_service';

// Bengali numeral converter
const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba/2.0',
        'Accept': 'application/json',
        'Authorization': 'Bearer false'
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${data.substring(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function formatBnDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = toBn(d.getDate());
    const month = MONTH_NAMES_BN[d.getMonth()];
    const year = toBn(d.getFullYear());
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function calculateDays(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 15;
  }
}

function mapCategory(orgName: string, title: string): { category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health' | 'engineer'; categoryLabel: string } {
  const combined = (orgName + ' ' + title).toLowerCase();
  if (combined.includes('bank') || combined.includes('ব্যাংক')) {
    return { category: 'bank', categoryLabel: 'ব্যাংক জব' };
  }
  if (combined.includes('railway') || combined.includes('রেলওয়ে')) {
    return { category: 'railway', categoryLabel: 'বাংলাদেশ রেলওয়ে' };
  }
  if (combined.includes('police') || combined.includes('পুলিশ') || combined.includes('bgb') || combined.includes('army') || combined.includes('বাহিনী') || combined.includes('প্রতিরক্ষা')) {
    return { category: 'defense', categoryLabel: 'প্রতিরক্ষা ও পুলিশ' };
  }
  if (combined.includes('medical') || combined.includes('health') || combined.includes('চিকিৎসা') || combined.includes('স্বাস্থ্য') || combined.includes('নার্স')) {
    return { category: 'health', categoryLabel: 'স্বাস্থ্য ও চিকিৎসা' };
  }
  if (combined.includes('school') || combined.includes('college') || combined.includes('teacher') || combined.includes('শিক্ষক') || combined.includes('শিক্ষা')) {
    return { category: 'teacher', categoryLabel: 'শিক্ষক নিয়োগ' };
  }
  if (combined.includes('engineer') || combined.includes('power') || combined.includes('ইঞ্জিনিয়ারিং') || combined.includes('বিদ্যুৎ') || combined.includes('কম্পিউটার') || combined.includes('ict')) {
    return { category: 'engineer', categoryLabel: 'ইঞ্জিনিয়ারিং ও টেকনিক্যাল' };
  }
  return { category: 'govt', categoryLabel: 'সরকারি চাকরি' };
}

export interface SyncStats {
  success: boolean;
  totalOrgsFound: number;
  totalJobsSynced: number;
  newJobsAdded: number;
  updatedJobs: number;
  errors: string[];
}

/**
 * Execute automated live Alljobs Teletalk sync with rich AI content enrichment
 */
export async function runAlljobsLiveSync(maxOrgs = 15): Promise<SyncStats> {
  const stats: SyncStats = {
    success: true,
    totalOrgsFound: 0,
    totalJobsSynced: 0,
    newJobsAdded: 0,
    updatedJobs: 0,
    errors: []
  };

  try {
    const orgs: any[] = [];
    let page = 1;
    let serverTotal = 0;

    while (orgs.length < maxOrgs) {
      const listUrl = `https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=${page}&limit=20`;
      const orgListRes = await fetchJson(listUrl);
      const batch = orgListRes.govtOrgJobs || [];
      serverTotal = orgListRes.count || serverTotal;
      if (batch.length === 0) break;
      orgs.push(...batch);
      if (orgs.length >= serverTotal || page >= 10) break;
      page++;
    }

    stats.totalOrgsFound = serverTotal || orgs.length;

    const existingJobs = serverDB.getJobs();
    const existingIds = new Set(existingJobs.map(j => j.id));

    for (const org of orgs) {
      if (!org.govt_jobs || org.govt_jobs.length === 0) continue;

      try {
        const primaryJob = org.govt_jobs[0];
        const detailsRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${primaryJob.id}`);
        const d = detailsRes.details;
        if (!d) continue;

        const orgShort = (org.short_name || 'gov').toLowerCase().replace(/[^a-z0-9]/g, '');
        const jobId = `job-alljobs-${orgShort}-${d.id}`;

        const orgBn = org.name_bn || org.name;
        const { category, categoryLabel } = mapCategory(org.name, d.job_title);

        const pdfUrl = d.advertisement_file 
          ? `https://alljobs.teletalk.com.bd/media/${d.advertisement_file}` 
          : (d.application_site ? `${d.application_site}docs/advertisement.pdf` : undefined);

        const logoUrl = org.logo 
          ? `https://alljobs.teletalk.com.bd/media/${org.logo}`
          : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80';

        const mappedPositions = (org.govt_jobs || []).map((gj: any, idx: number) => ({
          title: gj.job_title_bn || gj.job_title,
          grade: gj.grade || '১০ম-১৬তম গ্রেড',
          posts: parseInt(gj.vacancy || '1', 10) || 1,
          salary: gj.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
          minEducation: gj.education || 'স্নাতক / উচ্চ মাধ্যমিক / সমমান পাস',
          govtFee: gj.fee ? parseInt(gj.fee, 10) : 200
        }));

        const totalPosts = mappedPositions.reduce((sum: number, p: any) => sum + p.posts, 0) || mappedPositions.length || 1;
        const deadlineDate = d.deadline_date || new Date(Date.now() + 15 * 86400000).toISOString();
        const deadlineBn = formatBnDate(deadlineDate);
        const daysRemaining = calculateDays(deadlineDate);
        const publishedDateBn = formatBnDate(d.advertisement_published_date || d.published_date || new Date().toISOString());

        const fullTitle = `${orgBn} নিয়োগ বিজ্ঞপ্তি ২০২৬`;

        // Synthesize 100% human-grade, unique Bengali content for this job
        const enriched = GeminiService.synthesizeRichHumanContent({
          title: fullTitle,
          organization: orgBn,
          totalPosts: totalPosts,
          positions: mappedPositions,
          grade: mappedPositions.length > 1 ? `${mappedPositions.length}টি ভিন্ন গ্রেড` : '১০ম গ্রেড',
          salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী (পদভেদে প্রযোজ্য)',
          minEducation: mappedPositions[0]?.minEducation || 'স্নাতক / সমমান',
          minAge: d.min_age || 18,
          maxAge: d.max_age || 32,
          districts: 'সকল জেলা',
          deadline: deadlineBn,
          applicationStartDate: publishedDateBn,
          govtFee: 200,
          serviceFee: 50,
          category: category,
          categoryLabel: categoryLabel,
          officialLink: d.application_site || `https://${orgShort}.teletalk.com.bd`,
          smsPrefix: orgShort.toUpperCase()
        });

        const jobRecord: JobCircular = {
          id: jobId,
          title: enriched.title,
          organization: enriched.organization,
          logo: logoUrl,
          category: category,
          categoryLabel: categoryLabel,
          grade: enriched.grade,
          totalPosts: enriched.totalPosts,
          salary: enriched.salary,
          minEducation: enriched.minEducation,
          minAge: enriched.minAge,
          maxAge: enriched.maxAge,
          ageCutOffDate: enriched.ageCutOffDate,
          districts: enriched.districts,
          deadline: enriched.deadline,
          daysRemaining: daysRemaining,
          publishedDate: publishedDateBn,
          officialLink: enriched.officialLink || '',
          circularImage: (pdfUrl && !pdfUrl.toLowerCase().endsWith('.pdf')) ? pdfUrl : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
          circularPdfUrl: pdfUrl,
          govtFee: enriched.govtFee,
          serviceFee: enriched.serviceFee,
          feeRange: enriched.feeRange,
          featured: Boolean(d.package_wise_govt_jobs && d.package_wise_govt_jobs.length > 0),
          requirements: enriched.requirements,
          documentsRequired: enriched.documentsRequired,
          applicationInstructions: enriched.applicationInstructions,
          bengaliDescription: enriched.bengaliDescription,
          faqItems: enriched.faqItems,
          audioSummary: enriched.audioSummary || `${orgBn}-এ বিভিন্ন পদে মোট ${totalPosts} জনের নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে। আবেদনের শেষ সময় ${deadlineBn}।`,
          selectionProcess: enriched.selectionProcess,
          seoTitle: enriched.seoTitle,
          seoDescription: enriched.seoDescription,
          seoKeywords: enriched.seoKeywords,
          smsPrefix: enriched.smsPrefix,
          positions: mappedPositions,
          verificationStatus: 'AI_EXTRACTED',
          verificationConfidence: 95
        };

        // Deduplicate against legacy IDs for this circular code (e.g. job-teletalk-15083-...)
        for (const ej of existingJobs) {
          if (ej.id !== jobId && (ej.id.includes(`-${d.id}`) || ej.id.includes(`-${d.id}-`))) {
            serverDB.deleteJob(ej.id, 'COLLECTOR_DEDUPE');
          }
        }

        serverDB.saveJob(jobRecord);
        stats.totalJobsSynced++;

        if (existingIds.has(jobId)) {
          stats.updatedJobs++;
        } else {
          stats.newJobsAdded++;
        }
      } catch (err: any) {
        stats.errors.push(`Org ${org.name} sync failed: ${err.message}`);
      }
    }
  } catch (globalErr: any) {
    stats.success = false;
    stats.errors.push(`Global sync error: ${globalErr.message}`);
  }

  return stats;
}
