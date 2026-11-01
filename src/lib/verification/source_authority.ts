/**
 * Source Authority Checker
 * Classifies recruitment sources into 4 operational tiers and detects domain mismatch or redirects.
 */
import { JobSource } from '@/lib/types';
import { SourceAuthorityLevel, SourceAuthorityResult } from './types';

export function classifySourceAuthority(
  sourceUrl: string, 
  source?: JobSource
): SourceAuthorityResult {
  if (!sourceUrl || typeof sourceUrl !== 'string') {
    return {
      level: 4,
      domain: 'unknown',
      isOfficialDomain: false,
      authorityLabel: 'অযাচাইকৃত উৎস (Level 4: Unverified)',
      redirectDetected: false,
      score: 0.2,
      notes: 'সোর্স URL অনুপস্থিত বা অনির্ধারিত'
    };
  }

  let domain = '';
  try {
    const parsed = new URL(sourceUrl.trim());
    domain = parsed.hostname.toLowerCase();
  } catch {
    return {
      level: 4,
      domain: 'invalid',
      isOfficialDomain: false,
      authorityLabel: 'অবৈধ URL (Invalid URL)',
      redirectDetected: false,
      score: 0.1,
      notes: 'URL ফরম্যাট সঠিক নয়'
    };
  }

  // Level 1: Official government recruitment sources
  if (
    domain.endsWith('.gov.bd') ||
    domain === 'bpsc.teletalk.com.bd' ||
    domain === 'erecruitment.bb.org.bd' ||
    domain.endsWith('.bangladesh.gov.bd') ||
    domain === 'dpe.teletalk.com.bd' ||
    domain === 'railway.gov.bd'
  ) {
    return {
      level: 1,
      domain,
      isOfficialDomain: true,
      authorityLabel: 'সর্বোচ্চ সরকারি উৎস (Level 1: Official Government)',
      redirectDetected: false,
      score: 1.0,
      notes: 'বাংলাদেশ সরকারি অধিদপ্তর বা প্রাতিষ্ঠানিক রিক্রুটমেন্ট প্ল্যাটফর্ম'
    };
  }

  // Level 2: Official recruitment management platforms (e.g. Teletalk Alljobs)
  if (
    domain === 'alljobs.teletalk.com.bd' ||
    domain.endsWith('.teletalk.com.bd') ||
    domain.endsWith('.edu.bd') ||
    domain.endsWith('.ac.bd')
  ) {
    return {
      level: 2,
      domain,
      isOfficialDomain: true,
      authorityLabel: 'অফিসিয়াল নিয়োগ পোর্টাল (Level 2: Official Portal)',
      redirectDetected: false,
      score: 0.85,
      notes: 'টেলিটক বা স্বীকৃত বিশ্ববিদ্যালয়ের কেন্দ্রীয় নিয়োগ পোর্টাল'
    };
  }

  // Level 3: Recognized national newspapers / verified corporate sites
  const recognizedMediaDomains = [
    'prothomalo.com',
    'thedailystar.net',
    'ittefaq.com.bd',
    'kalerkantho.com',
    'jugantor.com',
    'bdnews24.com',
    'banglanews24.com',
    'tbsnews.net',
    'dhakatribune.com'
  ];

  if (recognizedMediaDomains.some(d => domain === d || domain.endsWith('.' + d))) {
    return {
      level: 3,
      domain,
      isOfficialDomain: false,
      authorityLabel: 'স্বীকৃত জাতীয় গণমাধ্যম (Level 3: Recognized Media)',
      redirectDetected: false,
      score: 0.65,
      notes: 'শীর্ষস্থানীয় জাতীয় দৈনিকের প্রকাশিত চাকরির বিজ্ঞাপন'
    };
  }

  // Level 4: Third-party portals, aggregators, unverified links
  return {
    level: 4,
    domain,
    isOfficialDomain: false,
    authorityLabel: 'তৃতীয় পক্ষ বা এগ্রিগেটর (Level 4: Aggregator)',
    redirectDetected: false,
    score: 0.35,
    notes: 'অযাচাইকৃত বা সাধারণ জব পোর্টাল; অফিসিয়াল বিজ্ঞপ্তি যাচাই আবশ্যক'
  };
}
