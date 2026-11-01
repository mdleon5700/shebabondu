import crypto from 'crypto';
import { RawDiscoveredNotice, NormalizedCircularCandidate } from './types';
import { JobSource, JobCircular, CircularDraft } from '@/lib/types';
import { validateSafeUrl } from './security';

export interface DuplicateMatchResult {
  isMatch: boolean;
  matchType?: 'exact_ref' | 'exact_url' | 'org_title_exact' | 'uncertain';
  matchedId?: string;
  matchedTarget?: 'job' | 'draft';
  isMaterialUpdate: boolean;
  reason?: string;
  confidence: number;
}

// Convert Bengali numerals to ASCII numerals
export function convertBnToEnDigits(str: string): string {
  if (!str) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, d => String(bnDigits.indexOf(d)));
}

// Clean string whitespace and HTML tags
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '') // strip HTML
    .replace(/\s+/g, ' ')   // normalize multiple spaces
    .trim();
}

// Canonical URL (strips tracking query params and trailing slash)
export function getCanonicalUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.hash = '';
    // Strip common tracking params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'ref'];
    for (const p of trackingParams) {
      parsed.searchParams.delete(p);
    }
    let res = parsed.toString().toLowerCase();
    if (res.endsWith('/')) res = res.slice(0, -1);
    return res;
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}

// Infer category from title/organization keywords
export function inferJobCategory(title: string, org: string): 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health' {
  const combined = (title + ' ' + org).toLowerCase();
  if (combined.includes('ব্যাংক') || combined.includes('bank')) return 'bank';
  if (combined.includes('রেলওয়ে') || combined.includes('railway')) return 'railway';
  if (combined.includes('সেনাবাহিনী') || combined.includes('নৌবাহিনী') || combined.includes('বিমানবাহিনী') || combined.includes('বিজিবি') || combined.includes('পুলিশ') || combined.includes('defense') || combined.includes('police')) return 'defense';
  if (combined.includes('শিক্ষক') || combined.includes('বিদ্যালয়') || combined.includes('কলেজ') || combined.includes('বিশ্ববিদ্যালয়') || combined.includes('teacher') || combined.includes('school') || combined.includes('university')) return 'teacher';
  if (combined.includes('হাসপাতাল') || combined.includes('নার্স') || combined.includes('মেডিকেল') || combined.includes('ডাক্তার') || combined.includes('health') || combined.includes('hospital')) return 'health';
  if (combined.includes('এনজিও') || combined.includes('ngo') || combined.includes('ব্র্যাক') || combined.includes('আশা') || combined.includes('কারিতাস')) return 'ngo';
  if (combined.includes('লিমিটেড') || combined.includes('প্রাইভেট') || combined.includes('কোম্পানি') || combined.includes('ltd') || combined.includes('private')) return 'private';
  return 'govt';
}

// Compute deterministic content hash to detect material circular changes
export function computeContentHash(data: {
  title: string;
  organization: string;
  vacancies: number;
  deadline: string;
  govtFee: number;
  salary: string;
  refNo?: string;
}): string {
  const canonicalString = [
    sanitizeText(data.title),
    sanitizeText(data.organization),
    String(data.vacancies),
    sanitizeText(data.deadline),
    String(data.govtFee),
    sanitizeText(data.salary),
    sanitizeText(data.refNo || '')
  ].join('|');

  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex').slice(0, 32);
}

// Normalize raw notice
export function normalizeCircularNotice(
  raw: RawDiscoveredNotice,
  source: JobSource
): { valid: boolean; candidate?: NormalizedCircularCandidate; errors: string[] } {
  const errors: string[] = [];

  const title = sanitizeText(raw.title);
  if (!title || title.length < 3) {
    errors.push('Title is required and must be at least 3 characters.');
  }

  const organization = sanitizeText(raw.organization);
  if (!organization || organization.length < 2) {
    errors.push('Organization name is required and must be at least 2 characters.');
  }

  const sourceUrl = (raw.sourceUrl || source.sourceUrl || '').trim();
  const urlSecurity = validateSafeUrl(sourceUrl);
  if (!urlSecurity.safe) {
    errors.push(`Invalid sourceUrl: ${urlSecurity.reason}`);
  }

  let evidenceUrl: string | undefined = undefined;
  if (raw.evidenceUrl) {
    const evidenceSecurity = validateSafeUrl(raw.evidenceUrl);
    if (!evidenceSecurity.safe) {
      errors.push(`Invalid evidenceUrl: ${evidenceSecurity.reason}`);
    } else {
      evidenceUrl = raw.evidenceUrl.trim();
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const extractionWarnings: string[] = [...(raw.extractionWarnings || [])];

  // Parse vacancies strictly from evidence without inventing defaults
  let vacancies = 0;
  if (raw.vacancies !== undefined && raw.vacancies !== null && String(raw.vacancies).trim() !== '') {
    const asciiVac = convertBnToEnDigits(String(raw.vacancies)).replace(/[^0-9]/g, '');
    const num = parseInt(asciiVac, 10);
    if (!isNaN(num) && num > 0) {
      vacancies = num;
    } else {
      extractionWarnings.push('পদসংখ্যা অস্পষ্ট');
    }
  } else {
    extractionWarnings.push('পদসংখ্যা অনুল্লিখিত');
  }

  // Parse govt fee strictly from evidence without inventing defaults
  let govtFee = 0;
  if (raw.govtFee !== undefined && raw.govtFee !== null && String(raw.govtFee).trim() !== '') {
    const asciiFee = convertBnToEnDigits(String(raw.govtFee)).replace(/[^0-9]/g, '');
    const num = parseInt(asciiFee, 10);
    if (!isNaN(num) && num >= 0) {
      govtFee = num;
    } else {
      extractionWarnings.push('আবেদন ফি অস্পষ্ট');
    }
  } else {
    extractionWarnings.push('আবেদন ফি অনুল্লিখিত (বিজ্ঞপ্তি অনুযায়ী প্রযোজ্য)');
  }

  // Deadline: preserve raw evidence without inventing dates
  let deadline = '';
  if (raw.deadline && raw.deadline.trim()) {
    deadline = sanitizeText(raw.deadline);
    if (deadline.includes('অপেক্ষমাণ') || deadline.includes('শীঘ্রই')) {
      extractionWarnings.push('আবেদনের শেষ তারিখ এখনও ঘোষিত হয়নি');
    }
  } else {
    deadline = 'অপেক্ষমাণ (পর্যালোচনা আবশ্যক)';
    extractionWarnings.push('আবেদনের শেষ তারিখ অনুপস্থিত');
  }

  const category = (raw.category && ['govt', 'bank', 'railway', 'defense', 'teacher', 'ngo', 'private', 'health'].includes(raw.category))
    ? (raw.category as any)
    : inferJobCategory(title, organization);

  // Grade & Salary: Treat as extracted facts, not inferred defaults
  const grade = raw.grade && raw.grade.trim() ? sanitizeText(raw.grade) : 'অনির্ধারিত';
  if (!raw.grade || !raw.grade.trim()) {
    extractionWarnings.push('গ্রেড অনুল্লিখিত');
  }

  const salary = raw.salary && raw.salary.trim() ? sanitizeText(raw.salary) : 'বিজ্ঞপ্তি অনুযায়ী';
  const minEducation = raw.minEducation && raw.minEducation.trim() ? sanitizeText(raw.minEducation) : 'বিজ্ঞপ্তি অনুযায়ী';

  // Evidence snapshot & hash
  const rawEvidenceText = raw.rawEvidenceText ? sanitizeText(raw.rawEvidenceText).slice(0, 500) : undefined;
  const evidenceHash = rawEvidenceText 
    ? crypto.createHash('sha256').update(rawEvidenceText, 'utf8').digest('hex').slice(0, 16) 
    : undefined;

  let needsReview = raw.needsReview || false;
  let reviewReason = raw.reviewReason;
  if (!needsReview && extractionWarnings.some(w => w.includes('অনুপস্থিত') || w.includes('অপেক্ষমাণ') || w.includes('অনুল্লিখিত'))) {
    needsReview = true;
    reviewReason = extractionWarnings.join('; ');
  }

  const isCancellation = Boolean(
    (raw as any).isCancelledNotice ||
    title.includes('স্থগিত') ||
    title.includes('বাতিল') ||
    (raw.rawEvidenceText && (raw.rawEvidenceText.includes('স্থগিতকরণ') || raw.rawEvidenceText.includes('নিয়োগ স্থগিত') || raw.rawEvidenceText.includes('বিজ্ঞপ্তি বাতিল')))
  );

  if (isCancellation) {
    needsReview = true;
    reviewReason = reviewReason ? `${reviewReason}; নিয়োগ বিজ্ঞপ্তি স্থগিত বা বাতিল সংক্রান্ত নোটিশ` : 'নিয়োগ বিজ্ঞপ্তি স্থগিত বা বাতিল সংক্রান্ত নোটিশ';
    extractionWarnings.push('সার্কুলার স্থগিত/বাতিল নোটিশ');
  }

  const contentHash = computeContentHash({
    title,
    organization,
    vacancies,
    deadline,
    govtFee,
    salary,
    refNo: raw.refNo
  });

  const refSlug = raw.refNo 
    ? raw.refNo.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)
    : crypto.createHash('md5').update(title + '|' + organization).digest('hex').slice(0, 12);

  const candidateId = `draft-${source.id}-${refSlug}`;

  const candidate: NormalizedCircularCandidate = {
    id: candidateId,
    refNo: raw.refNo ? sanitizeText(raw.refNo) : undefined,
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl,
    evidenceUrl,
    title,
    organization,
    category,
    grade,
    vacancies,
    minEducation,
    salary,
    deadline,
    govtFee,
    confidenceScore: needsReview ? 0.85 : 0.98,
    contentHash,
    extractedAt: new Date().toISOString(),
    rawEvidenceText,
    evidenceHash,
    needsReview,
    reviewReason,
    extractionWarnings: extractionWarnings.length > 0 ? extractionWarnings : undefined,
    rawMetadata: { ...(raw.rawMetadata || {}), isCancellationNotice: isCancellation }
  };

  return { valid: true, candidate, errors: [] };
}

// Deduplication matching engine
export function calculateDuplicateMatch(
  candidate: NormalizedCircularCandidate,
  existingJobs: JobCircular[],
  existingDrafts: CircularDraft[]
): DuplicateMatchResult {
  const candCanonicalUrl = getCanonicalUrl(candidate.sourceUrl);
  const candTitleNorm = sanitizeText(candidate.title).toLowerCase();
  const candOrgNorm = sanitizeText(candidate.organization).toLowerCase();

  // Helper to extract significant keywords from title (to avoid false positive matches on distinct notices)
  const extractKeywords = (str: string): string[] => {
    return str.split(/[^a-zA-Z0-9\u0980-\u09FF]+/).filter(w => w.length > 2);
  };

  // 1. Check against existing published jobs
  for (const job of existingJobs) {
    const jobCanonicalUrl = getCanonicalUrl(job.officialLink || (job as any).sourceUrl);
    const jobTitleNorm = sanitizeText(job.title).toLowerCase();
    const jobOrgNorm = sanitizeText(job.organization).toLowerCase();

    // Priority 1: Official reference number match
    if (candidate.refNo && (job as any).refNo && candidate.refNo.toLowerCase() === (job as any).refNo.toLowerCase()) {
      const isMaterialUpdate = job.deadline !== candidate.deadline || job.totalPosts !== candidate.vacancies;
      return {
        isMatch: true,
        matchType: 'exact_ref',
        matchedId: job.id,
        matchedTarget: 'job',
        isMaterialUpdate,
        reason: `Matched published job by official reference number: "${candidate.refNo}"`,
        confidence: 1.0
      };
    }

    // Priority 2: Exact Portal Locus Match (Same canonical URL and matching org)
    if (candCanonicalUrl && jobCanonicalUrl && candCanonicalUrl === jobCanonicalUrl && candOrgNorm === jobOrgNorm) {
      // Verify title similarity
      if (candTitleNorm === jobTitleNorm) {
        const isMaterialUpdate = job.deadline !== candidate.deadline || job.totalPosts !== candidate.vacancies;
        return {
          isMatch: true,
          matchType: 'exact_url',
          matchedId: job.id,
          matchedTarget: 'job',
          isMaterialUpdate,
          reason: `Matched published job by canonical URL and organization`,
          confidence: 0.98
        };
      }
    }

    // Priority 3: Exact Organization and Exact Title
    if (candOrgNorm === jobOrgNorm && candTitleNorm === jobTitleNorm) {
      const isMaterialUpdate = job.deadline !== candidate.deadline || job.totalPosts !== candidate.vacancies;
      return {
        isMatch: true,
        matchType: 'org_title_exact',
        matchedId: job.id,
        matchedTarget: 'job',
        isMaterialUpdate,
        reason: `Matched published job by exact organization and exact title`,
        confidence: 0.95
      };
    }

    // Guard: Check similar titles under same org. Do NOT merge distinct notices!
    if (candOrgNorm === jobOrgNorm) {
      const candWords = new Set(extractKeywords(candTitleNorm));
      const jobWords = new Set(extractKeywords(jobTitleNorm));
      // Count differences
      const diff1 = Array.from(candWords).filter(w => !jobWords.has(w));
      const diff2 = Array.from(jobWords).filter(w => !candWords.has(w));
      // If there are distinguishing role words (e.g. 'সাধারণ', 'আইটি', 'সহকারী', 'উপ'), treat as distinct!
      if (diff1.length > 0 || diff2.length > 0) {
        // Distinct notices: do not match!
        continue;
      }
    }
  }

  // 2. Check against existing circular drafts
  for (const draft of existingDrafts) {
    const draftCanonicalUrl = getCanonicalUrl(draft.sourceUrl);
    const draftTitleNorm = sanitizeText(draft.extractedTitle).toLowerCase();
    const draftOrgNorm = sanitizeText(draft.extractedOrg).toLowerCase();

    // Priority 1: Match draft by ID or refNo
    if (draft.id === candidate.id) {
      const isMaterialUpdate = draft.deadline !== candidate.deadline || draft.vacancies !== candidate.vacancies;
      return {
        isMatch: true,
        matchType: 'exact_ref',
        matchedId: draft.id,
        matchedTarget: 'draft',
        isMaterialUpdate,
        reason: `Matched existing draft by ID`,
        confidence: 1.0
      };
    }

    // Priority 2: Exact Portal Locus Match
    if (candCanonicalUrl && draftCanonicalUrl && candCanonicalUrl === draftCanonicalUrl && candOrgNorm === draftOrgNorm) {
      if (candTitleNorm === draftTitleNorm) {
        const isMaterialUpdate = draft.deadline !== candidate.deadline || draft.vacancies !== candidate.vacancies;
        return {
          isMatch: true,
          matchType: 'exact_url',
          matchedId: draft.id,
          matchedTarget: 'draft',
          isMaterialUpdate,
          reason: `Matched existing draft by canonical URL and organization`,
          confidence: 0.98
        };
      }
    }

    // Priority 3: Exact Organization and Exact Title
    if (candOrgNorm === draftOrgNorm && candTitleNorm === draftTitleNorm) {
      const isMaterialUpdate = draft.deadline !== candidate.deadline || draft.vacancies !== candidate.vacancies;
      return {
        isMatch: true,
        matchType: 'org_title_exact',
        matchedId: draft.id,
        matchedTarget: 'draft',
        isMaterialUpdate,
        reason: `Matched existing draft by exact organization and exact title`,
        confidence: 0.95
      };
    }
  }

  // No match found -> Completely new circular!
  return {
    isMatch: false,
    isMaterialUpdate: false,
    confidence: 0
  };
}
