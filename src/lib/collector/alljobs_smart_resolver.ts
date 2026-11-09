import https from 'https';
import http from 'http';
import { extractTextFromPdf } from '@/lib/spider/gemini_browser_controller';
import { serverDB } from '@/lib/db';
import { scrapeTeletalkPortal } from '@/lib/spider/teletalk_portal_spider';

if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined
});

export interface ResolvedCircularData {
  jobId?: string;
  title: string;
  organization: string;
  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health' | 'engineer';
  categoryLabel: string;
  totalPosts: number;
  deadline: string;
  applicationStartDate?: string;
  publishedDate: string;
  officialLink: string;
  circularPdfUrl: string;
  rawText: string;
  minAge: number;
  maxAge: number;
  salary: string;
  grade: string;
  smsPrefix?: string;
  smsFormat?: string;
  govtFee?: number;
  serviceFee?: number;
  feeRange?: string;
  districts?: string;
  positions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }>;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

export function formatBnDate(dateStr: string): string {
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

function fetchJson(url: string, redirectHops = 0): Promise<any> {
  if (redirectHops > 5) {
    throw new Error(`Too many redirects fetching JSON: ${url}`);
  }

  const isHttps = url.startsWith('https://');
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(url, {
      agent: isHttps ? insecureHttpsAgent : undefined,
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba/2.0 SmartResolver',
        'Accept': 'application/json'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        return resolve(fetchJson(redirectUrl, redirectHops + 1));
      }

      if (res.statusCode && res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data.substring(0, 100)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`JSON fetch timed out from ${url}`));
    });
  });
}

export const KNOWN_TELETALK_ORGS: Record<string, {
  name: string;
  nameEn: string;
  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health' | 'engineer';
  categoryLabel: string;
  website: string;
  smsPrefix: string;
  defaultPosition: string;
  defaultPosts: number;
  defaultSalary: string;
  defaultGrade: string;
  defaultEducation: string;
}> = {
  breb: {
    name: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (BREB)',
    nameEn: 'Bangladesh Rural Electrification Board',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি খাত',
    website: 'http://www.reb.gov.bd',
    smsPrefix: 'BREB',
    defaultPosition: 'সহকারী লাইনম্যান / লাইনক্রু (লেভেল-১)',
    defaultPosts: 1450,
    defaultSalary: '১৪,৭০০ - ৩৫,৩৫০/- টাকা',
    defaultGrade: '১৭তম গ্রেড',
    defaultEducation: 'এসএসসি বা সমমান পরীক্ষায় উত্তীর্ণ'
  },
  brebhr: {
    name: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (BREB)',
    nameEn: 'Bangladesh Rural Electrification Board',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি খাত',
    website: 'http://www.reb.gov.bd',
    smsPrefix: 'BREBHR',
    defaultPosition: 'সহকারী লাইনম্যান / লাইনক্রু (লেভেল-১)',
    defaultPosts: 1450,
    defaultSalary: '১৪,৭০০ - ৩৫,৩৫০/- টাকা',
    defaultGrade: '১৭তম গ্রেড',
    defaultEducation: 'এসএসসি বা সমমান পরীক্ষায় উত্তীর্ণ'
  },
  dgms: {
    name: 'সামরিক চিকিৎসা সার্ভিস মহাপরিদপ্তর (DGMS)',
    nameEn: 'Directorate General of Medical Services',
    category: 'defense',
    categoryLabel: 'প্রতিরক্ষা ও চিকিৎসা',
    website: 'http://dgms.teletalk.com.bd',
    smsPrefix: 'DGMS',
    defaultPosition: 'কম্পিউটার মুদ্রাক্ষরিক / অফিস সহকারী',
    defaultPosts: 30,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান'
  },
  bpsc: {
    name: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    nameEn: 'Bangladesh Public Service Commission',
    category: 'govt',
    categoryLabel: 'বিসিএস ও নন-ক্যাডার',
    website: 'http://www.bpsc.gov.bd',
    smsPrefix: 'BPSC',
    defaultPosition: 'নন-ক্যাডার বিভিন্ন কর্মকর্তা',
    defaultPosts: 10,
    defaultSalary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
    defaultGrade: '৯ম - ১০ম গ্রেড',
    defaultEducation: 'স্নাতক (সম্মান) বা স্নাতকোত্তর'
  },
  dghs: {
    name: 'স্বাস্থ্য অধিদপ্তর (DGHS)',
    nameEn: 'Directorate General of Health Services',
    category: 'health',
    categoryLabel: 'স্বাস্থ্য ও চিকিৎসা',
    website: 'http://www.dghs.gov.bd',
    smsPrefix: 'DGHS',
    defaultPosition: 'স্বাস্থ্য সহকারী / মেডিকেল টেকনোলজিস্ট',
    defaultPosts: 50,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'এইচএসসি (বিজ্ঞান) বা ডিপ্লোমা'
  },
  dgfp: {
    name: 'পরিবার পরিকল্পনা অধিদপ্তর (DGFP)',
    nameEn: 'Directorate General of Family Planning',
    category: 'health',
    categoryLabel: 'পরিবার পরিকল্পনা ও স্বাস্থ্য',
    website: 'http://www.dgfp.gov.bd',
    smsPrefix: 'DGFP',
    defaultPosition: 'পরিবার কল্যাণ পরিদর্শিকা / সহকারী',
    defaultPosts: 25,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'এসএসসি / এইচএসসি পাস'
  },
  dshe: {
    name: 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (DSHE)',
    nameEn: 'Directorate of Secondary and Higher Education',
    category: 'teacher',
    categoryLabel: 'শিক্ষক নিয়োগ',
    website: 'http://www.dshe.gov.bd',
    smsPrefix: 'DSHE',
    defaultPosition: 'সহকারী শিক্ষক / প্রদর্শক',
    defaultPosts: 40,
    defaultSalary: '১৬,০০০ - ৩৮,৬৪০/- টাকা',
    defaultGrade: '১০ম গ্রেড',
    defaultEducation: 'স্নাতক (সম্মান) বা সমমান ডিগ্রি'
  },
  dpe: {
    name: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    nameEn: 'Directorate of Primary Education',
    category: 'teacher',
    categoryLabel: 'প্রাথমিক শিক্ষক নিয়োগ',
    website: 'http://www.dpe.gov.bd',
    smsPrefix: 'DPE',
    defaultPosition: 'সহকারী শিক্ষক (সরকারি প্রাথমিক বিদ্যালয়)',
    defaultPosts: 100,
    defaultSalary: '১১,০০০ - ২৬,৫৯০/- টাকা',
    defaultGrade: '১৩তম গ্রেড',
    defaultEducation: 'স্নাতক বা সমমান ডিগ্রি'
  },
  br: {
    name: 'বাংলাদেশ রেলওয়ে (Bangladesh Railway)',
    nameEn: 'Bangladesh Railway',
    category: 'railway',
    categoryLabel: 'বাংলাদেশ রেলওয়ে',
    website: 'http://www.railway.gov.bd',
    smsPrefix: 'BR',
    defaultPosition: 'সহকারী স্টেশন মাস্টার / পয়েন্টসম্যান / খালাসী',
    defaultPosts: 50,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম - ১৯তম গ্রেড',
    defaultEducation: 'এইচএসসি বা এসএসসি পাস'
  },
  bpdb: {
    name: 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড (BPDB)',
    nameEn: 'Bangladesh Power Development Board',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি',
    website: 'http://www.bpdb.gov.bd',
    smsPrefix: 'BPDB',
    defaultPosition: 'সহকারী প্রকৌশলী / উপ-সহকারী প্রকৌশলী',
    defaultPosts: 20,
    defaultSalary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    defaultGrade: '৯ম - ১০ম গ্রেড',
    defaultEducation: 'বিএসসি ইঞ্জিনিয়ারিং / ডিপ্লোমা ইন ইঞ্জিনিয়ারিং'
  },
  cpgcbl: {
    name: 'কোল পাওয়ার জেনারেশন কোম্পানি বাংলাদেশ লিমিটেড (CPGCBL)',
    nameEn: 'Coal Power Generation Company Bangladesh Limited',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি খাত',
    website: 'http://cpgcbl.gov.bd',
    smsPrefix: 'CPGCBL',
    defaultPosition: 'সহকারী প্রকৌশলী (মেকানিক্যাল / ইলেকট্রিক্যাল)',
    defaultPosts: 4,
    defaultSalary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
    defaultGrade: '৯ম - ১০ম গ্রেড',
    defaultEducation: 'বিএসসি ইঞ্জিনিয়ারিং (মেকানিক্যাল / ইলেকট্রিক্যাল)'
  },
  pgcb: {
    name: 'পাওয়ার গ্রিড কোম্পানি অব বাংলাদেশ (PGCB)',
    nameEn: 'Power Grid Company of Bangladesh',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি',
    website: 'http://www.pgcb.gov.bd',
    smsPrefix: 'PGCB',
    defaultPosition: 'সহকারী প্রকৌশলী / জুনিয়র টেকনিশিয়ান',
    defaultPosts: 15,
    defaultSalary: '২৩,০০০ - ৫০,০০০/- টাকা',
    defaultGrade: '১০ম গ্রেড',
    defaultEducation: 'ডিপ্লোমা / বিএসসি ইঞ্জিনিয়ারিং'
  },
  desco: {
    name: 'ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড (DESCO)',
    nameEn: 'Dhaka Electric Supply Company Limited',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি',
    website: 'http://www.desco.org.bd',
    smsPrefix: 'DESCO',
    defaultPosition: 'সহকারী প্রকৌশলী / সহকারী লাইনম্যান',
    defaultPosts: 20,
    defaultSalary: '২৪,০০০ - ৫৫,০০০/- টাকা',
    defaultGrade: '১০ম গ্রেড',
    defaultEducation: 'ডিপ্লোমা বা সমমান'
  },
  dpdc: {
    name: 'ঢাকা পাওয়ার ডিস্ট্রিবিউশন কোম্পানি লিমিটেড (DPDC)',
    nameEn: 'Dhaka Power Distribution Company Limited',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি',
    website: 'http://www.dpdc.org.bd',
    smsPrefix: 'DPDC',
    defaultPosition: 'সহকারী প্রকৌশলী / উপ-সহকারী প্রকৌশলী',
    defaultPosts: 25,
    defaultSalary: '২৪,০০০ - ৫৫,০০০/- টাকা',
    defaultGrade: '৯ম - ১০ম গ্রেড',
    defaultEducation: 'বিএসসি বা ডিপ্লোমা ইঞ্জিনিয়ারিং'
  },
  dscc: {
    name: 'ঢাকা দক্ষিণ সিটি কর্পোরেশন (DSCC)',
    nameEn: 'Dhaka South City Corporation',
    category: 'govt',
    categoryLabel: 'সিটি কর্পোরেশন',
    website: 'http://www.dscc.gov.bd',
    smsPrefix: 'DSCC',
    defaultPosition: 'সহকারী স্বাস্থ্য কর্মকর্তা / অফিস সহকারী',
    defaultPosts: 15,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'এইচএসসি / স্নাতক সমমান'
  },
  dncc: {
    name: 'ঢাকা উত্তর সিটি কর্পোরেশন (DNCC)',
    nameEn: 'Dhaka North City Corporation',
    category: 'govt',
    categoryLabel: 'সিটি কর্পোরেশন',
    website: 'http://www.dncc.gov.bd',
    smsPrefix: 'DNCC',
    defaultPosition: 'অফিস সহকারী কাম কম্পিউটার অপারেটর',
    defaultPosts: 15,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'এইচএসসি বা সমমান'
  },
  cag: {
    name: 'বাংলাদেশের মহাহিসাব নিরীক্ষক ও নিয়ন্ত্রকের কার্যালয় (CAG)',
    nameEn: 'Office of the Comptroller and Auditor General',
    category: 'govt',
    categoryLabel: 'অর্থ ও হিসাব নিরীক্ষা',
    website: 'http://www.cag.org.bd',
    smsPrefix: 'CAG',
    defaultPosition: 'অডিটর / জুনিয়র অডিটর',
    defaultPosts: 30,
    defaultSalary: '১২,৫০০ - ৩০,২৩০/- টাকা',
    defaultGrade: '১১তম - ১৪তম গ্রেড',
    defaultEducation: 'স্নাতক বা সমমান ডিগ্রি'
  },
  fscd: {
    name: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স অধিদপ্তর',
    nameEn: 'Fire Service and Civil Defence',
    category: 'defense',
    categoryLabel: 'প্রতিরক্ষা ও সিভিল ডিফেন্স',
    website: 'http://www.fireservice.gov.bd',
    smsPrefix: 'FSCD',
    defaultPosition: 'ফায়ার ফাইটার / ড্রাইভার',
    defaultPosts: 80,
    defaultSalary: '৯,০০০ - ২১,৮০০/- টাকা',
    defaultGrade: '১৭তম - ১৮তম গ্রেড',
    defaultEducation: 'এসএসসি বা সমমান পাস (ন্যূনতম ৫ ফুট ৬ ইঞ্চি উচ্চতা)'
  },
  police: {
    name: 'বাংলাদেশ পুলিশ (Bangladesh Police)',
    nameEn: 'Bangladesh Police',
    category: 'defense',
    categoryLabel: 'পুলিশ ও আইনশৃঙ্খলা',
    website: 'http://www.police.gov.bd',
    smsPrefix: 'POLICE',
    defaultPosition: 'ট্রেইনি রিক্রুট কনস্টেবল (TRC)',
    defaultPosts: 500,
    defaultSalary: '৯,০০০ - ২১,৮০০/- টাকা',
    defaultGrade: '১৭তম গ্রেড',
    defaultEducation: 'এসএসসি বা সমমানের পরীক্ষায় ন্যূনতম জিপিএ ২.৫'
  },
  ansar: {
    name: 'বাংলাদেশ আনসার ও গ্রাম প্রতিরক্ষা বাহিনী',
    nameEn: 'Bangladesh Ansar and VDP',
    category: 'defense',
    categoryLabel: 'প্রতিরক্ষা ও নিরাপত্তা',
    website: 'http://www.ansarvdp.gov.bd',
    smsPrefix: 'ANSAR',
    defaultPosition: 'সাধারণ আনসার / ব্যাটালিয়ন আনসার',
    defaultPosts: 200,
    defaultSalary: 'সরকারি নিয়ম অনুযায়ী ভাতা ও রেশন',
    defaultGrade: '১৮তম গ্রেড',
    defaultEducation: 'ন্যূনতম জেএসসি বা এসএসসি পাস'
  },
  bgb: {
    name: 'বর্ডার গার্ড বাংলাদেশ (BGB)',
    nameEn: 'Border Guard Bangladesh',
    category: 'defense',
    categoryLabel: 'সীমান্ত প্রতিরক্ষা',
    website: 'http://www.bgb.gov.bd',
    smsPrefix: 'BGB',
    defaultPosition: 'সিপাহী (জিডি / টেকনিক্যাল)',
    defaultPosts: 300,
    defaultSalary: '৯,০০০ - ২১,৮০০/- টাকা',
    defaultGrade: '১৭তম গ্রেড',
    defaultEducation: 'এসএসসি বা সমমান পাস'
  },
  dnc: {
    name: 'মাদকদ্রব্য নিয়ন্ত্রণ অধিদপ্তর (DNC)',
    nameEn: 'Department of Narcotics Control',
    category: 'govt',
    categoryLabel: 'স্বরাষ্ট্র মন্ত্রণালয়',
    website: 'http://www.dnc.gov.bd',
    smsPrefix: 'DNC',
    defaultPosition: 'সিপাহী / ওয়ারলেস অপারেটর',
    defaultPosts: 40,
    defaultSalary: '৯,০০০ - ২১,৮০০/- টাকা',
    defaultGrade: '১৭তম গ্রেড',
    defaultEducation: 'এসএসসি বা সমমান পাস'
  },
  nbr: {
    name: 'জাতীয় রাজস্ব বোর্ড (NBR)',
    nameEn: 'National Board of Revenue',
    category: 'govt',
    categoryLabel: 'রাজস্ব ও কাস্টমস',
    website: 'http://www.nbr.gov.bd',
    smsPrefix: 'NBR',
    defaultPosition: 'সহকারী রাজস্ব কর্মকর্তা / কর পরিদর্শক',
    defaultPosts: 50,
    defaultSalary: '১৬,০০০ - ৩৮,৬৪০/- টাকা',
    defaultGrade: '১০ম গ্রেড',
    defaultEducation: 'স্নাতক (সম্মান) বা সমমান ডিগ্রি'
  },
  post: {
    name: 'বাংলাদেশ ডাক অধিদপ্তর (Bangladesh Post)',
    nameEn: 'Directorate of Posts',
    category: 'govt',
    categoryLabel: 'ডাক ও টেলিযোগাযোগ',
    website: 'http://www.bdpost.gov.bd',
    smsPrefix: 'POST',
    defaultPosition: 'পোস্টম্যান / মেইল গার্ড / ড্রাফটসম্যান',
    defaultPosts: 60,
    defaultSalary: '৯,০০০ - ২১,৮০০/- টাকা',
    defaultGrade: '১৭তম - ১৯তম গ্রেড',
    defaultEducation: 'মাধ্যমিক (এসএসসি) পাস'
  },
  prisons: {
    name: 'কারা অধিদপ্তর (বাংলাদেশ জেল)',
    nameEn: 'Prisons Directorate',
    category: 'govt',
    categoryLabel: 'স্বরাষ্ট্র মন্ত্রণালয়',
    website: 'http://www.prison.gov.bd',
    smsPrefix: 'PRISONS',
    defaultPosition: 'কারারক্ষী / মহিলা কারারক্ষী',
    defaultPosts: 120,
    defaultSalary: '৯,০০০ - ২১,৮০০/- টাকা',
    defaultGrade: '১৭তম গ্রেড',
    defaultEducation: 'এসএসসি বা সমমান পাস'
  },
  forest: {
    name: 'বন অধিদপ্তর (Department of Forests)',
    nameEn: 'Department of Forests',
    category: 'govt',
    categoryLabel: 'পরিবেশ ও বন',
    website: 'http://www.bforest.gov.bd',
    smsPrefix: 'FOREST',
    defaultPosition: 'ফরেস্ট গার্ড / ফরেস্টার',
    defaultPosts: 45,
    defaultSalary: '৯,০০০ - ২১,৮০০/- টাকা',
    defaultGrade: '১৭তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা এসএসসি পাস'
  },
  bforest: {
    name: 'বন অধিদপ্তর (Department of Forests)',
    nameEn: 'Department of Forests',
    category: 'govt',
    categoryLabel: 'পরিবেশ ও বন',
    website: 'http://www.bforest.gov.bd',
    smsPrefix: 'FOREST',
    defaultPosition: 'ফরেস্ট গার্ড / ফরেস্টার',
    defaultPosts: 45,
    defaultSalary: '৯,০০০ - ২১,৮০০/- টাকা',
    defaultGrade: '১৭তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা এসএসসি পাস'
  },
  bwdb: {
    name: 'বাংলাদেশ পানি উন্নয়ন বোর্ড (BWDB)',
    nameEn: 'Bangladesh Water Development Board',
    category: 'engineer',
    categoryLabel: 'পানি সম্পদ ও প্রকৌশল',
    website: 'http://www.bwdb.gov.bd',
    smsPrefix: 'BWDB',
    defaultPosition: 'সহকারী প্রকৌশলী / উপ-সহকারী প্রকৌশলী',
    defaultPosts: 30,
    defaultSalary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    defaultGrade: '৯ম - ১০ম গ্রেড',
    defaultEducation: 'বিএসসি / ডিপ্লোমা ইন ইঞ্জিনিয়ারিং'
  },
  bbs: {
    name: 'বাংলাদেশ পরিসংখ্যান ব্যুরো (BBS)',
    nameEn: 'Bangladesh Bureau of Statistics',
    category: 'govt',
    categoryLabel: 'পরিকল্পনা মন্ত্রণালয়',
    website: 'http://www.bbs.gov.bd',
    smsPrefix: 'BBS',
    defaultPosition: 'পরিসংখ্যান সহকারী / ইনভেস্টিগেটর',
    defaultPosts: 20,
    defaultSalary: '১১,০০০ - ২৬,৫৯০/- টাকা',
    defaultGrade: '১৩তম গ্রেড',
    defaultEducation: 'পরিসংখ্যান/অর্থনীতিতে স্নাতক ডিগ্রি'
  },
  bb: {
    name: 'বাংলাদেশ ব্যাংক (Bangladesh Bank)',
    nameEn: 'Bangladesh Bank',
    category: 'bank',
    categoryLabel: 'কেন্দ্রীয় ব্যাংক',
    website: 'http://www.bb.org.bd',
    smsPrefix: 'BB',
    defaultPosition: 'সহকারী পরিচালক (সাধারণ/প্রকৌশল)',
    defaultPosts: 100,
    defaultSalary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    defaultGrade: '৯ম গ্রেড',
    defaultEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে ৪ বছর মেয়াদি স্নাতক'
  },
  bogmc: {
    name: 'বাংলাদেশ তৈল, গ্যাস ও খনিজ সম্পদ করপোরেশন (পেট্রোবাংলা) / BOGMC',
    nameEn: 'Bangladesh Oil, Gas & Mineral Corporation (Petrobangla) BOGMC',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি খাত',
    website: 'http://bogmc.teletalk.com.bd',
    smsPrefix: 'BOGMC',
    defaultPosition: 'সহকারী ব্যবস্থাপক (আইন / সাধারণ)',
    defaultPosts: 6,
    defaultSalary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    defaultGrade: '৯ম গ্রেড',
    defaultEducation: 'আইন বা সংশ্লিষ্ট বিষয়ে প্রথম শ্রেণী বা সমমানের সিজিপিএসহ স্নাতক (সম্মান) বা স্নাতকোত্তর'
  },
  petrobangla: {
    name: 'বাংলাদেশ তৈল, গ্যাস ও খনিজ সম্পদ করপোরেশন (পেট্রোবাংলা) / BOGMC',
    nameEn: 'Bangladesh Oil, Gas & Mineral Corporation (Petrobangla) BOGMC',
    category: 'engineer',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি খাত',
    website: 'http://bogmc.teletalk.com.bd',
    smsPrefix: 'BOGMC',
    defaultPosition: 'সহকারী ব্যবস্থাপক (আইন / সাধারণ)',
    defaultPosts: 6,
    defaultSalary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    defaultGrade: '৯ম গ্রেড',
    defaultEducation: 'আইন বা সংশ্লিষ্ট বিষয়ে প্রথম শ্রেণী বা সমমানের সিজিপিএসহ স্নাতক (সম্মান) বা স্নাতকোত্তর'
  },
  railway: {
    name: 'বাংলাদেশ রেলওয়ে (Bangladesh Railway)',
    nameEn: 'Bangladesh Railway',
    category: 'railway',
    categoryLabel: 'বাংলাদেশ রেলওয়ে',
    website: 'http://www.railway.gov.bd',
    smsPrefix: 'BR',
    defaultPosition: 'সহকারী স্টেশন মাস্টার / পয়েন্টসম্যান / খালাসী',
    defaultPosts: 50,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম - ১৯তম গ্রেড',
    defaultEducation: 'এইচএসসি বা এসএসসি পাস'
  },
  hcd: {
    name: 'বাংলাদেশ সুপ্রিম কোর্ট (হাইকোর্ট বিভাগ)',
    nameEn: 'Supreme Court of Bangladesh (HCD)',
    category: 'govt',
    categoryLabel: 'সরকারি ও বিচার বিভাগ',
    website: 'https://supremecourt.teletalk.com.bd/hcd_2026/',
    smsPrefix: 'HCD',
    defaultPosition: 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক',
    defaultPosts: 3,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ'
  },
  supremecourt: {
    name: 'বাংলাদেশ সুপ্রিম কোর্ট (হাইকোর্ট বিভাগ)',
    nameEn: 'Supreme Court of Bangladesh (HCD)',
    category: 'govt',
    categoryLabel: 'সরকারি ও বিচার বিভাগ',
    website: 'https://supremecourt.teletalk.com.bd/hcd_2026/',
    smsPrefix: 'HCD',
    defaultPosition: 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক',
    defaultPosts: 3,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ'
  },
  bcsl: {
    name: 'বাংলাদেশ কেবল শিল্প লিমিটেড (BCSL)',
    nameEn: 'Bangladesh Cable Shilpa Limited (BCSL)',
    category: 'engineer',
    categoryLabel: 'শিল্প ও প্রকৌশল খাত',
    website: 'http://www.bcsl.gov.bd/',
    smsPrefix: 'BCSL',
    defaultPosition: 'সহকারী ব্যবস্থাপক / উপসহকারী প্রকৌশলী / কর্মকর্তা',
    defaultPosts: 16,
    defaultSalary: '১৬,০০০ - ৫৩,০৬০/- টাকা',
    defaultGrade: '৯ম - ১৬তম গ্রেড',
    defaultEducation: 'স্নাতক / ডিপ্লোমা ইন ইঞ্জিনিয়ারিং / এইচএসসি'
  },
  dcbagerhat: {
    name: 'জেলা প্রশাসকের কার্যালয়, বাগেরহাট',
    nameEn: 'Office of the Deputy Commissioner, Bagerhat',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.bagerhat.gov.bd/',
    smsPrefix: 'DCBAGERHAT',
    defaultPosition: 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক / নাজির',
    defaultPosts: 8,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস'
  },
  bhtpa: {
    name: 'বাংলাদেশ হাই-টেক পার্ক কর্তৃপক্ষ (BHTPA)',
    nameEn: 'Bangladesh Hi-Tech Park Authority (BHTPA)',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.bhtpa.gov.bd/',
    smsPrefix: 'BHTPA',
    defaultPosition: 'সহকারী পরিচালক / টেকনিক্যাল অফিসার',
    defaultPosts: 3,
    defaultSalary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    defaultGrade: '৯ম - ১০ম গ্রেড',
    defaultEducation: 'স্নাতক (সম্মান) বা সমমানের ডিগ্রি'
  },
  dcjamalpur: {
    name: 'জেলা প্রশাসকের কার্যালয়, জামালপুর',
    nameEn: 'DC Office Jamalpur',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.jamalpur.gov.bd/',
    smsPrefix: 'DCJAMALPUR',
    defaultPosition: 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক',
    defaultPosts: 11,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস'
  },
  dcrajbari: {
    name: 'জেলা প্রশাসকের কার্যালয়, রাজবাড়ী',
    nameEn: 'DC Office Rajbari',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.rajbari.gov.bd/',
    smsPrefix: 'DCRAJBARI',
    defaultPosition: 'অফিস সহায়ক / সমমান পদ',
    defaultPosts: 1,
    defaultSalary: '৮,২৫০ - ২০,০১০/- টাকা',
    defaultGrade: '২০তম গ্রেড',
    defaultEducation: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান'
  },
  dcjhenaidah: {
    name: 'জেলা প্রশাসকের কার্যালয়, ঝিনাইদহ',
    nameEn: 'DC Office Jhenaidah',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.jhenaidah.gov.bd/',
    smsPrefix: 'DCJHENAIDAH',
    defaultPosition: 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক',
    defaultPosts: 2,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস'
  },
  apscl: {
    name: 'আশুগঞ্জ পাওয়ার স্টেশন কোম্পানি লিমিটেড (APSCL)',
    nameEn: 'Ashuganj Power Station Company Ltd. (APSCL)',
    category: 'engineer',
    categoryLabel: 'শিল্প ও প্রকৌশল খাত',
    website: 'http://www.apscl.gov.bd/',
    smsPrefix: 'APSCL',
    defaultPosition: 'সহকারী ব্যবস্থাপক / প্রকৌশলী / টেকনিশিয়ান',
    defaultPosts: 15,
    defaultSalary: '২৩,০০০ - ৫৫,০০০/- টাকা',
    defaultGrade: '১০ম গ্রেড',
    defaultEducation: 'বিএসসি ইঞ্জিনিয়ারিং / ডিপ্লোমা / স্নাতক'
  },
  basb: {
    name: 'বাংলাদেশ সশস্ত্র বাহিনী বোর্ড (BASB)',
    nameEn: 'Bangladesh Armed Services Board (BASB)',
    category: 'defense',
    categoryLabel: 'প্রতিরক্ষা ও শৃঙ্খলা বাহিনী',
    website: 'https://basb.teletalk.com.bd/',
    smsPrefix: 'BASB',
    defaultPosition: 'অফিস সহকারী কাম-কম্পিউটার অপারেটর',
    defaultPosts: 1,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান'
  },
  itiiu: {
    name: 'কর গোয়েন্দা ও তদন্ত ইউনিট (ITIIU)',
    nameEn: 'Income Tax Intelligence and Investigation Unit (ITIIU)',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.incometax.gov.bd/',
    smsPrefix: 'ITIIU',
    defaultPosition: 'উচ্চমান সহকারী / সাঁট-মুদ্রাক্ষরিক',
    defaultPosts: 3,
    defaultSalary: '১০,২০০ - ২৪,৬৮০/- টাকা',
    defaultGrade: '১৪তম - ১৬তম গ্রেড',
    defaultEducation: 'স্নাতক বা সমমানের ডিগ্রি'
  },
  tax19: {
    name: 'কর অঞ্চল-১৯, ঢাকা',
    nameEn: 'Taxes Zone-19, Dhaka',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.tax19.gov.bd/',
    smsPrefix: 'TAX19',
    defaultPosition: 'কম্পিউটার অপারেটর / অফিস সহকারী',
    defaultPosts: 7,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস'
  },
  dcnarail: {
    name: 'জেলা প্রশাসকের কার্যালয়, নড়াইল',
    nameEn: 'DC Office Narail',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.narail.gov.bd/',
    smsPrefix: 'DCNARAIL',
    defaultPosition: 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক',
    defaultPosts: 7,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস'
  },
  nsd: {
    name: 'জাতীয় সঞ্চয় অধিদপ্তর (NSD)',
    nameEn: 'Department of National Savings (NSD)',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.nationalsavings.gov.bd/',
    smsPrefix: 'NSD',
    defaultPosition: 'সহকারী পরিচালক / অডিটর / অফিস সহকারী',
    defaultPosts: 8,
    defaultSalary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    defaultGrade: '৯ম গ্রেড',
    defaultEducation: 'স্নাতক (সম্মান) বা স্নাতকোত্তর ডিগ্রি'
  },
  taxnar: {
    name: 'কর অঞ্চল, নারায়ণগঞ্জ',
    nameEn: 'Taxes Zone-Narayanganj',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.taxnarayanganj.gov.bd/',
    smsPrefix: 'TAXNAR',
    defaultPosition: 'উচ্চমান সহকারী / অফিস সহকারী',
    defaultPosts: 6,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক বা স্নাতক সমমান'
  },
  dcchuadanga: {
    name: 'জেলা প্রশাসকের কার্যালয়, চুয়াডাঙ্গা',
    nameEn: 'DC Office Chuadanga',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি ও প্রশাসন',
    website: 'http://www.chuadanga.gov.bd/',
    smsPrefix: 'DCCHUADANGA',
    defaultPosition: 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক',
    defaultPosts: 7,
    defaultSalary: '৯,৩০০ - ২২,৪৯০/- টাকা',
    defaultGrade: '১৬তম গ্রেড',
    defaultEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস'
  },
  sposherpur: {
    name: 'পুলিশ সুপারের কার্যালয়, শেরপুর',
    nameEn: 'Office of the Superintendent of Police, Sherpur',
    category: 'defense',
    categoryLabel: 'প্রতিরক্ষা ও শৃঙ্খলা বাহিনী',
    website: 'http://www.sherpur.police.gov.bd/',
    smsPrefix: 'SPOSHERPUR',
    defaultPosition: 'কম্পিউটার অপারেটর / সাঁট-মুদ্রাক্ষরিক',
    defaultPosts: 3,
    defaultSalary: '১০,২০০ - ২৪,৬৮০/- টাকা',
    defaultGrade: '১৪তম গ্রেড',
    defaultEducation: 'স্নাতক বা উচ্চ মাধ্যমিক (এইচএসসি) সমমান'
  },
  spsherpur: {
    name: 'পুলিশ সুপারের কার্যালয়, শেরপুর',
    nameEn: 'Office of the Superintendent of Police, Sherpur',
    category: 'defense',
    categoryLabel: 'প্রতিরক্ষা ও শৃঙ্খলা বাহিনী',
    website: 'http://www.sherpur.police.gov.bd/',
    smsPrefix: 'SPOSHERPUR',
    defaultPosition: 'কম্পিউটার অপারেটর / সাঁট-মুদ্রাক্ষরিক',
    defaultPosts: 3,
    defaultSalary: '১০,২০০ - ২৪,৬৮০/- টাকা',
    defaultGrade: '১৪তম গ্রেড',
    defaultEducation: 'স্নাতক বা উচ্চ মাধ্যমিক (এইচএসসি) সমমান'
  }
};

export function normalizeBanglaOrgName(rawName: string, subdomain = ''): string {
  const sub = (subdomain || '').toLowerCase().trim();
  if (KNOWN_TELETALK_ORGS[sub]) {
    return KNOWN_TELETALK_ORGS[sub].name;
  }
  const s = (rawName || '').trim();
  if (s.includes('Supreme Court') || s.includes('HCD') || s.includes('সুপ্রিম কোর্ট') || s.includes('হাইকোর্ট')) {
    return 'বাংলাদেশ সুপ্রিম কোর্ট (হাইকোর্ট বিভাগ)';
  }
  if (s.includes('Cable Shilpa') || s.includes('BCSL') || s.includes('কেবল শিল্প')) {
    return 'বাংলাদেশ কেবল শিল্প লিমিটেড (BCSL)';
  }
  if (s.includes('Bagerhat') || s.includes('বাগেরহাট') || s.includes('DCBAGERHAT')) {
    return 'জেলা প্রশাসকের কার্যালয়, বাগেরহাট';
  }
  if (s.includes('Hi-Tech Park') || s.includes('BHTPA') || s.includes('হাই-টেক পার্ক')) {
    return 'বাংলাদেশ হাই-টেক পার্ক কর্তৃপক্ষ (BHTPA)';
  }
  if (s.includes('Jamalpur') || s.includes('জামালপুর') || s.includes('DCJAMALPUR')) {
    return 'জেলা প্রশাসকের কার্যালয়, জামালপুর';
  }
  if (s.includes('Medical Service') || s.includes('DGMS') || s.includes('সামরিক চিকিৎসা')) {
    return 'সামরিক চিকিৎসা সার্ভিস মহাপরিদপ্তর (DGMS)';
  }
  if (s.includes('Auditor General') || s.includes('CAG') || s.includes('মহাহিসাব নিরীক্ষক')) {
    return 'বাংলাদেশের মহাহিসাব নিরীক্ষক ও নিয়ন্ত্রকের কার্যালয় (CAG)';
  }
  if (s.includes('Rajbari') || s.includes('রাজবাড়ী') || s.includes('রাজবাড়ী') || s.includes('DCRAJBARI')) {
    return 'জেলা প্রশাসকের কার্যালয়, রাজবাড়ী';
  }
  if (s.includes('Dhaka South') || s.includes('DSCC') || s.includes('ঢাকা দক্ষিণ')) {
    return 'ঢাকা দক্ষিণ সিটি কর্পোরেশন (DSCC)';
  }
  if (s.includes('Coal Power Generation Company') || s.includes('CPGCBL') || s.includes('কোল পাওয়ার')) {
    return 'কোল পাওয়ার জেনারেশন কোম্পানি বাংলাদেশ লিমিটেড (CPGCBL)';
  }
  if (s.includes('Jhenaidah') || s.includes('ঝিনাইদহ') || s.includes('DCJHENAIDAH')) {
    return 'জেলা প্রশাসকের কার্যালয়, ঝিনাইদহ';
  }
  if (s.includes('Ashuganj') || s.includes('APSCL') || s.includes('আশুগঞ্জ পাওয়ার')) {
    return 'আশুগঞ্জ পাওয়ার স্টেশন কোম্পানি লিমিটেড (APSCL)';
  }
  if (s.includes('Armed Services') || s.includes('BASB') || s.includes('সশস্ত্র বাহিনী')) {
    return 'বাংলাদেশ সশস্ত্র বাহিনী বোর্ড (BASB)';
  }
  if (s.includes('Income Tax Intelligence') || s.includes('ITIIU') || s.includes('কর গোয়েন্দা')) {
    return 'কর গোয়েন্দা ও তদন্ত ইউনিট (ITIIU)';
  }
  if (s.includes('Taxes Zone-19') || s.includes('TAX19') || s.includes('কর অঞ্চল-১৯')) {
    return 'কর অঞ্চল-১৯, ঢাকা';
  }
  if (s.includes('Narail') || s.includes('নড়াইল') || s.includes('নড়াইল') || s.includes('DCNARAIL')) {
    return 'জেলা প্রশাসকের কার্যালয়, নড়াইল';
  }
  if (s.includes('National Savings') || s.includes('NSD') || s.includes('জাতীয় সঞ্চয়') || s.includes('সঞ্চয়')) {
    return 'জাতীয় সঞ্চয় অধিদপ্তর (NSD)';
  }
  if (s.includes('Taxes Zone-Narayanganj') || s.includes('TAXNAR') || s.includes('কর অঞ্চল, নারায়ণগঞ্জ')) {
    return 'কর অঞ্চল, নারায়ণগঞ্জ';
  }
  if (s.includes('Chuadanga') || s.includes('চুয়াডাঙ্গা') || s.includes('DCCHUADANGA')) {
    return 'জেলা প্রশাসকের কার্যালয়, চুয়াডাঙ্গা';
  }
  if (s.includes('Sherpur') || s.includes('শেরপুর') || s.includes('SPOSHERPUR') || s.includes('SPSHERPUR')) {
    return 'পুলিশ সুপারের কার্যালয়, শেরপুর';
  }
  if (s.includes('Petrobangla') || s.includes('Bangladesh Oil, Gas & Mineral') || s.includes('BOGMC') || s.includes('পেট্রোবাংলা')) {
    return 'বাংলাদেশ তৈল, গ্যাস ও খনিজ সম্পদ করপোরেশন (পেট্রোবাংলা) / BOGMC';
  }
  if (s.includes('Rural Electrification Board') || s.includes('BREB') || s.includes('পল্লী বিদ্যুতায়ন')) {
    return 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (BREB)';
  }
  if (s.includes('Public Service Commission') || s.includes('BPSC') || s.includes('কর্ম কমিশন')) {
    return 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)';
  }
  if (s.includes('Health Services') || s.includes('DGHS') || s.includes('স্বাস্থ্য অধিদপ্তর')) {
    return 'স্বাস্থ্য অধিদপ্তর (DGHS)';
  }
  if (s.includes('Family Planning') || s.includes('DGFP') || s.includes('পরিবার পরিকল্পনা')) {
    return 'পরিবার পরিকল্পনা অধিদপ্তর (DGFP)';
  }
  if (s.includes('Secondary and Higher Education') || s.includes('DSHE') || s.includes('মাধ্যমিক ও উচ্চশিক্ষা')) {
    return 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (DSHE)';
  }
  if (s.includes('Primary Education') || s.includes('DPE') || s.includes('প্রাথমিক শিক্ষা')) {
    return 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)';
  }
  if (s.includes('Power Development Board') || s.includes('BPDB') || s.includes('বিদ্যুৎ উন্নয়ন বোর্ড')) {
    return 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড (BPDB)';
  }
  if (s.includes('Water Development Board') || s.includes('BWDB') || s.includes('পানি উন্নয়ন বোর্ড')) {
    return 'বাংলাদেশ পানি উন্নয়ন বোর্ড (BWDB)';
  }
  if (s.includes('Forest') || s.includes('বনায়ন') || s.includes('বন অধিদপ্তর')) {
    return 'বন অধিদপ্তর (Forest Department)';
  }
  if (s.includes('Bureau of Statistics') || s.includes('BBS') || s.includes('পরিসংখ্যান ব্যুরো')) {
    return 'বাংলাদেশ পরিসংখ্যান ব্যুরো (BBS)';
  }
  if (s.includes('Bangladesh Bank') || s.includes('বাংলাদেশ ব্যাংক')) {
    return 'বাংলাদেশ ব্যাংক (Bangladesh Bank)';
  }
  if (s.includes('Railway') || s.includes('রেলওয়ে') || s.includes('Bangladesh Railway')) {
    return 'বাংলাদেশ রেলওয়ে (Bangladesh Railway)';
  }
  return s || 'বাংলাদেশ সরকারি প্রতিষ্ঠান';
}

export interface PortalMetadata {
  portalUrl: string;
  pageTitle: string;
  orgName?: string;
  deadline?: string;
  startDate?: string;
  refNo?: string;
  website?: string;
  smsPrefix?: string;
}

/**
 * Fetches portal metadata directly from the Teletalk recruitment portal
 * Extracts page title, application start date, deadline, circular reference, and official portal URLs
 */
export async function fetchPortalMetadata(inputUrl: string): Promise<PortalMetadata | null> {
  try {
    const urlObj = new URL(inputUrl);
    const host = urlObj.hostname;
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const basePath = pathParts.length > 1 ? '/' + pathParts[0] + '/' : '/';
    const portalUrl = `${urlObj.protocol}//${host}${basePath}`;

    return new Promise((resolve) => {
      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.get(portalUrl, {
        agent: urlObj.protocol === 'https:' ? insecureHttpsAgent : undefined,
        rejectUnauthorized: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba/2.0 PortalInspector',
          'Accept': 'text/html,application/xhtml+xml,*/*'
        },
        timeout: 10000
      }, (res) => {
        let html = '';
        res.on('data', c => html += c);
        res.on('end', () => {
          const titleM = html.match(/<title>([^<]+)<\/title>/i);
          const deadlineM = html.match(/Application\s*Deadline:\s*([^\n<]+)/i) || html.match(/আবেদনের\s*শেষ\s*তারিখ[:\s]*([^\n<]+)/i);
          const startM = html.match(/Application\s*Start:\s*([^\n<]+)/i) || html.match(/আবেদনের\s*শুরুর\s*তারিখ[:\s]*([^\n<]+)/i);
          const refM = html.match(/Circular\s*Ref:\s*([^\n<]+)/i) || html.match(/স্মারক\s*নং[:\s]*([^\n<]+)/i);
          const webM = html.match(/href=[\x22\x27](http:\/\/[^\x22\x27]+\.gov\.bd)[\x22\x27]/i);
          const smsM = html.match(/([A-Z]{3,10})<SPACE>/i);

          let deadlineBn = '';
          if (deadlineM) {
            const raw = deadlineM[1].trim();
            const dateMatch = raw.match(/([০-৯\d]{1,2})[\/\-\.]([০-৯\d]{1,2})[\/\-\.]([০-৯\d]{4})/);
            if (dateMatch) {
              const day = dateMatch[1];
              const month = parseInt(dateMatch[2].replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]), 10);
              const year = dateMatch[3];
              const monthName = MONTH_NAMES_BN[month - 1] || 'জুলাই';
              deadlineBn = `${toBn(day)} ${monthName} ${toBn(year)}`;
            } else {
              deadlineBn = raw;
            }
          }

          resolve({
            portalUrl,
            pageTitle: titleM ? titleM[1].replace(/\|\s*Powered By Teletalk/i, '').trim() : '',
            deadline: deadlineBn,
            startDate: startM ? startM[1].trim() : '',
            refNo: refM ? refM[1].trim() : '',
            website: webM ? webM[1] : '',
            smsPrefix: smsM ? smsM[1] : ''
          });
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    });
  } catch {
    return null;
  }
}

export function mapCategory(name: string, shortName = ''): { category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health' | 'engineer'; categoryLabel: string } {
  const combined = (name + ' ' + shortName).toLowerCase();

  // 1. Defense & Law Enforcement
  if (
    combined.includes('dgms') ||
    combined.includes('armed services') ||
    combined.includes('basb') ||
    combined.includes('police') ||
    combined.includes('পুলিশ') ||
    combined.includes('sposherpur') ||
    combined.includes('spsherpur') ||
    combined.includes('প্রতিরক্ষা') ||
    combined.includes('সেনাবাহিনী') ||
    combined.includes('ansar') ||
    combined.includes('bgb') ||
    combined.includes('fire service') ||
    combined.includes('fscd')
  ) {
    return { category: 'defense', categoryLabel: 'প্রতিরক্ষা ও শৃঙ্খলা বাহিনী' };
  }

  // 2. Engineering, Power, Industrial
  if (
    combined.includes('cable') ||
    combined.includes('bcsl') ||
    combined.includes('shilpa') ||
    combined.includes('cpgcbl') ||
    combined.includes('apscl') ||
    combined.includes('power') ||
    combined.includes('বিদ্যুৎ') ||
    combined.includes('ইঞ্জিনিয়ারিং') ||
    combined.includes('engineer') ||
    combined.includes('bpdb') ||
    combined.includes('breb') ||
    combined.includes('reb') ||
    combined.includes('desco') ||
    combined.includes('dpdc') ||
    combined.includes('pgcb') ||
    combined.includes('nwpgcl') ||
    combined.includes('petrobangla') ||
    combined.includes('bogmc')
  ) {
    return { category: 'engineer', categoryLabel: 'শিল্প ও প্রকৌশল খাত' };
  }

  // 3. Railway
  if (combined.includes('railway') || combined.includes('রেলওয়ে')) {
    return { category: 'railway', categoryLabel: 'বাংলাদেশ রেলওয়ে' };
  }

  // 4. Health
  if (
    (combined.includes('medical') && !combined.includes('dgms')) ||
    combined.includes('health') ||
    combined.includes('চিকিৎসা') ||
    combined.includes('হাসপাতাল') ||
    combined.includes('dghs') ||
    combined.includes('dgfp')
  ) {
    return { category: 'health', categoryLabel: 'স্বাস্থ্য ও পরিবার কল্যাণ' };
  }

  // 5. Teacher / Education
  if (
    combined.includes('teacher') ||
    combined.includes('শিক্ষক') ||
    combined.includes('শিক্ষা') ||
    combined.includes('school') ||
    combined.includes('college') ||
    combined.includes('university') ||
    combined.includes('dshe') ||
    combined.includes('dpe')
  ) {
    return { category: 'teacher', categoryLabel: 'শিক্ষা ও শিক্ষক নিয়োগ' };
  }

  // 6. Bank (Word boundary check to avoid "river bank")
  if (/\b(bank|banking)\b/i.test(combined) || combined.includes('ব্যাংক')) {
    return { category: 'bank', categoryLabel: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান' };
  }

  // 7. General Government & Judiciary
  if (
    combined.includes('supreme court') ||
    combined.includes('hcd') ||
    combined.includes('হাইকোর্ট') ||
    combined.includes('আদালত') ||
    combined.includes('বিচার')
  ) {
    return { category: 'govt', categoryLabel: 'সরকারি ও বিচার বিভাগ' };
  }

  return { category: 'govt', categoryLabel: 'সরকারি চাকরি ও প্রশাসন' };
}

/**
 * Repairs Teletalk / Government Sutonny & distorted font glyphs into clean standard Unicode Bengali
 */
export function repairTeletalkBengaliEncoding(rawText: string): string {
  if (!rawText) return '';
  let txt = rawText;

  const glyphMap: [RegExp, string][] = [
    [/সামিরক\s*িচিকৎসা\s*সািভȟস\s*মহাপিরদ˖র/g, 'সামরিক চিকিৎসা সার্ভিস মহাপরিদপ্তর'],
    [/ɓাফটসΖান/g, 'ড্রাফটসম্যান'],
    [/ɓাফট̤ɇ\s*ানশীপ/g, 'ড্রাফটসম্যানশীপ'],
    [/কি˫উটার\s*ӑɘাɻিরক/g, 'কম্পিউটার মুদ্রাক্ষরিক'],
    [/কি˫উটার/g, 'কম্পিউটার'],
    [/ӑɘাɻিরক/g, 'মুদ্রাক্ষরিক'],
    [/এফ\s*ডিˣউ\s*এ[\s\S]*?এɇািসসেট˂\)?/g, 'এফডিডব্লিউএ (ফ্যামিলি ওয়েলফেয়ার অ্যাসিস্ট্যান্ট)'],
    [/ডিˣউ/g, 'ডিডব্লিউ'],
    [/ফɇািমিল\s*ওেয়লেফয়ার\s*এɇািসসেট˂/g, 'ফ্যামিলি ওয়েলফেয়ার অ্যাসিস্ট্যান্ট'],
    [/অিʁিনব\s*ȟাপক/g, 'অগ্নিনির্বাপক (ফায়ার ফাইটার)'],
    [/অিফস\s*সহায়ক/g, 'অফিস সহায়ক'],
    [/বা[Ӌb]িচ\s*[ȟh]/g, 'বাবুর্চি'],
    [/সহকারী\s*বা[Ӌb]িচ\s*[ȟh]/g, 'সহকারী বাবুর্চি'],
    [/ǯমসওেয়টার/g, 'মেসওয়েটার'],
    [/পিরʑˑতাকম̭/g, 'পরিচ্ছন্নতাকর্মী'],
    [/আয়া/g, 'আয়া'],
    [/মালী/g, 'মালী'],
    [/ǯɊড[-–—\s]*([০-৯\d]+)/g, 'গ্রেড-$1'],
    [/মাΒিমক/g, 'মাধ্যমিক'],
    [/উʎ\s*মাΒিমক/g, 'উচ্চ মাধ্যমিক'],
    [/নেভͯ\s*র/g, 'নভেম্বর'],
    [/সািভȟস/g, 'সার্ভিস'],
    [/মহাপিরদ˖র/g, 'মহাপরিদপ্তর'],
    [/ɛিতরɻা/g, 'প্রতিরক্ষা'],
    [/মˈণালয়/g, 'মন্ত্রণালয়'],
    [/ǯসনািনবাস/g, 'সেনানিবাস'],
    [/িনেয়াগ/g, 'নিয়োগ'],
    [/িবʗি˖/g, 'বিজ্ঞপ্তি'],
    [/সাɪ\s*ȟিফেকট/g, 'সার্টিফিকেট'],
    [/উʯীণ\s*ȟ/g, 'উত্তীর্ণ'],
    [/ǯবতন\s*ǯ̖\s*ল/g, 'বেতন স্কেল'],
    [/ǯ̖\s*ল/g, 'স্কেল'],
    [/পেদর\s*সং΋া/g, 'পদের সংখ্যা'],
    [/সং΋া/g, 'সংখ্যা'],
    [/Ɉিমক/g, 'ক্রমিক'],
    [/ǯযাΌতা/g, 'যোগ্যতা'],
    [/অিভʗতা/g, 'অভিজ্ঞতা'],
    [/আেবদনপɖ/g, 'আবেদনপত্র'],
    [/আেবদন/g, 'আবেদন'],
    [/পরীɻা/g, 'পরীক্ষা'],
    [/পরীɻার/g, 'পরীক্ষার'],
    [/িফ/g, 'ফি'],
    [/ǯশষ\s*তািরখ/g, 'শেষ তারিখ'],
    [/তািরখ/g, 'তারিখ'],
    [/ʹͰর/g, 'শুরুর'],
    [/ǯমাট/g, 'মোট'],
    [/শতȟাবলী/g, 'শর্তাবলী'],
    [/ɛাথ̭/g, 'প্রার্থী'],
    [/ǯজলা/g, 'জেলা'],
    [/বয়স/g, 'বয়স']
  ];

  for (const [pattern, replacement] of glyphMap) {
    txt = txt.replace(pattern, replacement);
  }

  return txt;
}

/**
 * Smart Heuristic Parser for Bangladesh Government Circulars
 * Extracts real positions, vacancies, grades, pay scales, and deadlines directly from PDF text
 */
export function parseDetailsFromPdfText(rawText: string, sourceUrl = ''): {
  org: string;
  title: string;
  totalPosts: number;
  deadline: string;
  officialLink: string;
  positions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }>;
} {
  const text = repairTeletalkBengaliEncoding(rawText || '');

  // 1. Organization Extraction
  const urlMatch = (sourceUrl || '').match(/https?:\/\/([a-zA-Z0-9\-_]+)\.teletalk\.com\.bd/i);
  const subdomain = urlMatch ? urlMatch[1].toLowerCase() : null;
  const knownOrg = subdomain ? KNOWN_TELETALK_ORGS[subdomain] : null;

  let org = knownOrg ? knownOrg.name : 'বাংলাদেশ সরকারি প্রতিষ্ঠান';
  const orgMatch = text.match(/([^\n]+(মন্ত্রণালয়|মহাপরিদপ্তর|অধিদপ্তর|কর্পোরেশন|বোর্ড|কমিশন|কর্তৃপক্ষ|ইনস্টিটিউট|ব্যাংক))/i) ||
                   text.match(/গণপ্রজাতন্ত্রী\s*বাংলাদেশ\s*সরকার[\s\S]{0,120}?(মন্ত্রণালয়|অধিদপ্তর|মহাপরিদপ্তর|পরিদপ্তর|কমিশন|বোর্ড|কর্তৃপক্ষ|ইনস্টিটিউট|একাডেমি)/i);
  if (orgMatch) {
    const rawMatched = orgMatch[1] ? orgMatch[1].trim().replace(/\n/g, ' ') : orgMatch[0].trim().replace(/\n/g, ' ');
    if (rawMatched.length < 60 && !rawMatched.includes('নম্বর') && !rawMatched.includes('স্মারক')) {
      org = normalizeBanglaOrgName(rawMatched, subdomain || '');
    }
  } else if (subdomain) {
    org = normalizeBanglaOrgName(org, subdomain);
  }

  // 2. Official Portal Link
  const linkMatch = text.match(/(https?:\/\/[a-zA-Z0-9\-\.]+\.teletalk\.com\.bd)/i) ||
                    text.match(/(https?:\/\/[a-zA-Z0-9\-\.]+\.gov\.bd)/i);
  const officialLink = linkMatch ? linkMatch[0] : (knownOrg?.website || (subdomain ? `https://${subdomain}.teletalk.com.bd` : (sourceUrl || 'https://alljobs.teletalk.com.bd')));

  // 3. Deadline Extraction
  let deadline = '২১ নভেম্বর ২০২৬';
  const deadlineMatch = text.match(/জমাদানের\s*শেষ\s*তারিখঃ?\s*([০-৯\d]{1,2}\s*[^\n\d]{1,15}\s*[০-৯\d]{4})/i) ||
                        text.match(/আবেদনের\s*শেষ\s*তারিখ(?:\s*ও\s*সময়)?[\s\S]{0,40}?([০-৯\d]{1,2}\s*(?:জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর)\s*[০-৯\d]{4})/i) ||
                        text.match(/([০-৯\d]{1,2}[\/\-\.][০-৯\d]{1,2}[\/\-\.][০-৯\d]{4})/i);
  if (deadlineMatch) {
    deadline = deadlineMatch[1].trim();
  }

  // 4. Multi-Position Table Parser (Extracts all positions ১ to ৫০ without arbitrary limits)
  const serialRegex = /(?:^|\n)\s*([১-৯]|[১-৪][০-৯]|৫০)\s*[।\.]\s*([^\n]+)([\s\S]*?)(?=(?:\n\s*(?:[১-৯]|[১-৪][০-৯]|৫০)\s*[।\.])|$)/g;
  const extractedPositions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }> = [];

  let match;

  while ((match = serialRegex.exec(text)) !== null) {
    const serial = match[1];
    const rawTitle = match[2].trim();
    const body = match[3];

    // Filter out preambles, notes, rules, and condition headings
    if (
      rawTitle.length > 55 ||
      rawTitle.includes('আহবান') ||
      rawTitle.includes('দরখাস্ত') ||
      rawTitle.includes('বয়স') ||
      rawTitle.includes('শর্তাবলী') ||
      rawTitle.includes('মহাপরিচালক') ||
      rawTitle.includes('মহাপরিদর্শক') ||
      rawTitle.includes('মহাপরিদপ্তর') ||
      rawTitle.includes('মন্ত্রণালয়') ||
      rawTitle.includes('সংরক্ষণ') ||
      rawTitle.includes('হ্রাস') ||
      rawTitle.includes('বাতিল') ||
      rawTitle.includes('অধিকার') ||
      rawTitle.includes('আবেদনকারী') ||
      rawTitle.includes('পরীক্ষায়') ||
      rawTitle.includes('অনলাইনে')
    ) {
      continue;
    }

    // Must contain evidence of a legitimate post (Grade, Salary, or Vacancies count)
    const hasGrade = /গ্রেড|Grade|[০-৯\d]{1,2}তম/i.test(body) || /গ্রেড|Grade|[০-৯\d]{1,2}তম/i.test(rawTitle);
    const hasSalary = /[০-৯\d]{1,2},[০-৯\d]{3}/.test(body);
    const hasPosts = /(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s+/m.test(body);

    if (hasGrade || hasSalary || hasPosts) {
      let cleanTitle = rawTitle
        .replace(/গ্রেড.*$/, '')
        .replace(/[–—\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract Grade
      const gradeMatch = body.match(/গ্রেড[-–—\s]*([০-৯\d]+)/i) || rawTitle.match(/গ্রেড[-–—\s]*([০-৯\d]+)/i);
      const gradeNum = gradeMatch ? gradeMatch[1] : '';
      const grade = gradeNum ? `${gradeNum}তম গ্রেড` : '২০তম গ্রেড';

      // Extract Posts (Vacancies)
      const postsMatch = body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s+[০-৯\d,]{4,}/m) ||
                         body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s*টি/m) ||
                         body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s+/m);
      const rawPosts = postsMatch ? postsMatch[1] : '০১';
      const posts = parseInt(rawPosts.replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]), 10) || 1;

      // Extract Salary
      const salMatch = body.match(/([০-৯\d]{1,2},[০-৯\d]{3}\s*[-–—]\s*[০-৯\d]{1,2},?[০-৯\d]{3}\/?[-–—\/]*)/);
      const salary = salMatch ? salMatch[1].trim() + ' টাকা' : 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী';

      // Minimum Education
      let minEducation = 'অষ্টম শ্রেণি / জেএসসি পাস';
      if (body.includes('স্নাতক') || body.includes('ডিগ্রি')) {
        minEducation = 'স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক বা সমমানের ডিগ্রি';
      } else if (body.includes('উচ্চ মাধ্যমিক') || body.includes('এইচএসসি') || cleanTitle.includes('মুদ্রাক্ষরিক')) {
        minEducation = 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ';
      } else if (body.includes('মাধ্যমিক') || body.includes('এসএসসি') || cleanTitle.includes('সহায়ক') || cleanTitle.includes('অফিস সহায়ক')) {
        minEducation = 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পাস';
      } else if (body.includes('ডিপ্লোমা') || cleanTitle.includes('ড্রাফটসম্যান')) {
        minEducation = 'এইচএসসি বা ডিপ্লোমা সমমান ডিগ্রি';
      }

      // Examination Fee
      let govtFee = 112;
      const parsedGradeNum = parseInt(gradeNum, 10);
      if (parsedGradeNum && parsedGradeNum <= 16) {
        govtFee = 112;
      } else if (parsedGradeNum && parsedGradeNum > 16) {
        govtFee = 56;
      }

      extractedPositions.push({
        title: cleanTitle,
        posts,
        grade,
        salary,
        minEducation,
        govtFee
      });
    }
  }

  // 5. Dictionary Fallback if serial extraction found nothing
  if (extractedPositions.length === 0) {
    const knownPositions = [
      'ড্রাফটসম্যান', 'কম্পিউটার মুদ্রাক্ষরিক', 'এফডিডব্লিউএ', 'অগ্নিনির্বাপক', 'অফিস সহায়ক',
      'আয়া', 'বাবুর্চি', 'মালী', 'সহকারী বাবুর্চি', 'মেসওয়েটার', 'পরিচ্ছন্নতাকর্মী',
      'সহকারী পরিচালক', 'উপসহকারী প্রকৌশলী', 'সহকারী প্রকৌশলী', 'প্রোগ্রামার', 'সহকারী প্রোগ্রামার',
      'হিসাবরক্ষণ কর্মকর্তা', 'হিসাবরক্ষক', 'অডিট অফিসার', 'কমিউনিকেশন অফিসার', 'মেডিকেল টেকনোলজিস্ট',
      'কম্পিউটার অপারেটর', 'ডাটা এন্ট্রি অপারেটর', 'অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক',
      'ড্রাইভার', 'গাড়ি চালক', 'স্টোরকিপার', 'ক্যাশিয়ার', 'ল্যাবরেটরি সহকারী',
      'নিরাপত্তা প্রহরী'
    ];

    for (const posTitle of knownPositions) {
      if (text.includes(posTitle)) {
        extractedPositions.push({
          title: posTitle,
          posts: 1,
          salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
          grade: '১৬তম গ্রেড',
          minEducation: 'এইচএসসি বা সমমানের ডিগ্রি',
          govtFee: 112
        });
      }
    }
  }

  if (extractedPositions.length === 0) {
    if (knownOrg) {
      extractedPositions.push({
        title: knownOrg.defaultPosition,
        posts: knownOrg.defaultPosts || 1,
        salary: knownOrg.defaultSalary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
        grade: knownOrg.defaultGrade || '১৬তম গ্রেড',
        minEducation: knownOrg.defaultEducation || 'এইচএসসি বা স্নাতক পাস',
        govtFee: 112
      });
    } else {
      extractedPositions.push({
        title: 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক',
        posts: 1,
        salary: '৯,৩০০ - ২২,৪৯০/- টাকা',
        grade: '১৬তম গ্রেড',
        minEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ',
        govtFee: 112
      });
    }
  }

  const totalPosts = extractedPositions.reduce((sum, p) => sum + p.posts, 0);
  const primaryTitle = extractedPositions.length > 1
    ? `${org} বিভিন্ন পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬`
    : `${org} - ${extractedPositions[0].title} নিয়োগ বিজ্ঞপ্তি ২০২৬`;

  return {
    org,
    title: primaryTitle,
    totalPosts,
    deadline,
    officialLink,
    positions: extractedPositions
  };
}

import { inferPositionGradeAndSalary } from '@/lib/shared/pay_scale';
export { inferPositionGradeAndSalary };

let cachedOrgList: { data: any[]; timestamp: number } | null = null;

export async function getTeletalkOrgList(): Promise<any[]> {
  const now = Date.now();
  if (cachedOrgList && (now - cachedOrgList.timestamp) < 15 * 60 * 1000) {
    return cachedOrgList.data;
  }
  try {
    const allOrgs: any[] = [];
    let page = 1;
    while (page <= 5) {
      const res = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=${page}&limit=50`);
      if (res && Array.isArray(res.govtOrgJobs) && res.govtOrgJobs.length > 0) {
        allOrgs.push(...res.govtOrgJobs);
        if (res.govtOrgJobs.length < 20) break; // Last page reached
        page++;
      } else {
        break;
      }
    }
    if (allOrgs.length > 0) {
      cachedOrgList = { data: allOrgs, timestamp: now };
      return allOrgs;
    }
  } catch (err: any) {
    console.warn('Failed to fetch Teletalk org-list:', err.message);
  }
  return cachedOrgList?.data || [];
}

export function normalizeBnDigits(str: string): string {
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return (str || '').replace(/[০-৯]/g, d => bnToEn[d] || d);
}

/**
 * Universal Circular Resolver:
 * Accepts any Alljobs job page URL, Alljobs public API URL, PDF URL, or raw text.
 */
export async function resolveCircularInput(input: string): Promise<ResolvedCircularData> {
  // Preprocessing: Convert Bengali numerals to English numerals
  let trimmed = normalizeBnDigits((input || '').trim());

  // Future-Proofing 1: Shortened URL Resolution (bit.ly, tinyurl, t.co, rb.gy)
  if (trimmed.match(/https?:\/\/(?:bit\.ly|tinyurl\.com|t\.co|rb\.gy|goo\.gl)\/[a-zA-Z0-9_\-]+/i)) {
    try {
      const headRes = await fetch(trimmed, { method: 'HEAD', redirect: 'follow' });
      if (headRes.url && headRes.url !== trimmed) {
        trimmed = headRes.url;
      }
    } catch {}
  }

  // Future-Proofing 2: Extract embedded HTTP/HTTPS URL from any mixed social post or paragraph
  const embeddedUrlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  if (embeddedUrlMatch && (trimmed.includes('alljobs.teletalk.com.bd') || trimmed.includes('.teletalk.com.bd') || trimmed.includes('.gov.bd'))) {
    trimmed = embeddedUrlMatch[0];
  }

  // Future-Proofing 3: Strip social tracking garbage (?fbclid=..., &utm_source=...)
  if (trimmed.includes('?')) {
    trimmed = trimmed.replace(/([?&])(?:fbclid|utm_[^&=]+|source|ref|igshid)=[^&]*/gi, '$1')
                     .replace(/[?&]+$/, '')
                     .replace(/\?&/, '?');
  }

  // 0. Database Check (Only for internal exact IDs, NEVER hijack external scan URLs)
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    try {
      const allJobs = serverDB.getJobs();
      const matchedJob = allJobs.find(j => j && (j.id === trimmed || j.title === trimmed));

      if (matchedJob && Array.isArray(matchedJob.positions) && matchedJob.positions.length > 0) {
        return {
          jobId: matchedJob.id,
          title: matchedJob.title,
          organization: matchedJob.organization,
          category: matchedJob.category as any,
          categoryLabel: matchedJob.categoryLabel,
          totalPosts: matchedJob.totalPosts || matchedJob.positions.length,
          deadline: matchedJob.deadline,
          publishedDate: matchedJob.publishedDate,
          officialLink: matchedJob.officialLink,
          circularPdfUrl: matchedJob.circularPdfUrl || trimmed,
          rawText: matchedJob.bengaliDescription || '',
          minAge: matchedJob.minAge || 18,
          maxAge: matchedJob.maxAge || 32,
          salary: matchedJob.salary,
          grade: matchedJob.grade,
          positions: matchedJob.positions.map(p => ({
            title: p.title,
            posts: Number((p as any).posts || (p as any).vacancies) || 1,
            salary: p.salary,
            grade: p.grade,
            minEducation: p.minEducation || 'উচ্চ মাধ্যমিক (এইচএসসি) বা স্নাতক পাস',
            govtFee: p.govtFee ?? matchedJob.govtFee ?? 200
          }))
        };
      }
    } catch (dbErr) {
      console.warn('DB cache match notice:', dbErr);
    }
  }

  // 1. Alljobs URL, Job ID, Org ID, or Subdomain Check (Instant Official JSON API)
  let alljobsId: string | null = null;
  let alljobsOrgId: string | null = null;
  let matchedSubdomain = '';

  // 1.1 Organization URL/Param Check
  const orgQueryMatch = trimmed.match(/[?&](?:orgId|org_id)=(\d{4,7})\b/i);
  const orgPathMatch = trimmed.match(/alljobs\.teletalk\.com\.bd\/(?:[a-z]{2}\/)?jobs\/organization\/(\d{4,7})/i);
  if (orgQueryMatch) {
    alljobsOrgId = orgQueryMatch[1];
  } else if (orgPathMatch) {
    alljobsOrgId = orgPathMatch[1];
  }

  // 1.2 Job ID Check (Query param, Path segment, or Direct Number/Text)
  if (!alljobsOrgId) {
    const queryParamMatch = trimmed.match(/[?&](?:jobId|id|job_id)=(\d{4,6})\b/i);
    const pathMatch = trimmed.match(/alljobs\.teletalk\.com\.bd\/(?:[a-z]{2}\/)?jobs\/(?:government|all|details?|view|circular)\/(\d{4,6})/i);
    
    if (queryParamMatch) {
      alljobsId = queryParamMatch[1];
    } else if (pathMatch) {
      alljobsId = pathMatch[1];
    } else if (trimmed.includes('alljobs.teletalk.com.bd') && trimmed.match(/\/(\d{4,6})\/?(?:[?#]|$)/)) {
      const slashMatch = trimmed.match(/\/(\d{4,6})\/?(?:[?#]|$)/);
      if (slashMatch) alljobsId = slashMatch[1];
    } else if (trimmed.match(/alljobs\.teletalk\.com\.bd\/media\/[^\s]*?(\d{4,6})[^\s]*\.pdf/i)) {
      const pdfIdMatch = trimmed.match(/alljobs\.teletalk\.com\.bd\/media\/[^\s]*?(\d{4,6})[^\s]*\.pdf/i);
      if (pdfIdMatch) alljobsId = pdfIdMatch[1];
    } else if (/^\s*(?:job\s*id\s*[:\-\s]*)?\d{4,6}\s*$/i.test(trimmed)) {
      const m = trimmed.match(/\d{4,6}/);
      if (m) alljobsId = m[0];
    }
  }

  // 1.3 Teletalk Subdomain Check (with or without http/https)
  const subdomainMatch = trimmed.match(/(?:https?:\/\/)?([a-zA-Z0-9\-_]+)\.teletalk\.com\.bd/i);
  if (subdomainMatch && subdomainMatch[1].toLowerCase() !== 'alljobs' && subdomainMatch[1].toLowerCase() !== 'www') {
    matchedSubdomain = subdomainMatch[1].toLowerCase();
  }

  // 1.4 Future-Proofing: Fuzzy Organization Name Match if user just typed the Org name (e.g. "পেট্রোবাংলা", "BCIC", "DGMS")
  if (!alljobsId && !alljobsOrgId && !matchedSubdomain && !trimmed.startsWith('http') && trimmed.length >= 3) {
    try {
      const orgList = await getTeletalkOrgList();
      const cleanQuery = trimmed.toLowerCase();
      const matched = orgList.find(o => {
        const sName = (o.short_name || '').toLowerCase();
        const enName = (o.name || '').toLowerCase();
        const bnName = (o.name_bn || o.name || '').toLowerCase();
        return sName === cleanQuery ||
               enName.includes(cleanQuery) ||
               bnName.includes(cleanQuery) ||
               (cleanQuery === 'পেট্রোবাংলা' && (sName === 'bogmc' || enName.includes('petrobangla'))) ||
               (cleanQuery.length >= 4 && (enName.split(/\s+/).some((w: string) => w.length >= 4 && cleanQuery.includes(w)) ||
                                           bnName.split(/\s+/).some((w: string) => w.length >= 4 && cleanQuery.includes(w))));
      });
      if (matched) {
        alljobsOrgId = String(matched.id);
        matchedSubdomain = (matched.short_name || '').toLowerCase();
      }
    } catch {}
  }

  if (alljobsId || alljobsOrgId || matchedSubdomain) {
    try {
      const orgList = await getTeletalkOrgList();
      let d: any = null;
      let matchedOrg: any = null;

      if (alljobsId) {
        try {
          const apiRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${alljobsId}`);
          d = apiRes?.details;
        } catch (e: any) {
          console.warn('Alljobs details fetch notice:', e.message);
        }

        const targetOrgId = d?.job_utilities_govtorganization?.id;
        const orgNameFromDetail = d?.job_utilities_govtorganization?.name || '';
        matchedOrg = orgList.find(o => 
          (targetOrgId && o.id === targetOrgId) ||
          (o.govt_jobs && o.govt_jobs.some((j: any) => String(j.id) === String(alljobsId))) ||
          (matchedSubdomain && o.short_name && o.short_name.toLowerCase() === matchedSubdomain) ||
          (o.name && orgNameFromDetail && o.name.toLowerCase().includes(orgNameFromDetail.toLowerCase()))
        );
      } else if (alljobsOrgId) {
        matchedOrg = orgList.find(o => String(o.id) === String(alljobsOrgId));
        if (matchedOrg && Array.isArray(matchedOrg.govt_jobs) && matchedOrg.govt_jobs.length > 0) {
          try {
            const apiRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${matchedOrg.govt_jobs[0].id}`);
            d = apiRes?.details;
          } catch {}
        }
      } else if (matchedSubdomain) {
        matchedOrg = orgList.find(o => 
          (o.short_name && o.short_name.toLowerCase() === matchedSubdomain) ||
          matchedSubdomain.includes(o.short_name?.toLowerCase())
        );
        if (matchedOrg && Array.isArray(matchedOrg.govt_jobs) && matchedOrg.govt_jobs.length > 0) {
          try {
            const apiRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${matchedOrg.govt_jobs[0].id}`);
            d = apiRes?.details;
          } catch {}
        }
      }

      if (matchedOrg || d) {
        const orgInfo = d?.job_utilities_govtorganization || {};
        const urlMatch = (d?.application_site || '').match(/https?:\/\/([a-zA-Z0-9\-_]+)\.teletalk\.com\.bd/i);
        const sub = urlMatch ? urlMatch[1].toLowerCase() : (matchedSubdomain || matchedOrg?.short_name?.toLowerCase() || '');
        const orgShortName = matchedOrg?.short_name || orgInfo?.short_name || sub.toUpperCase() || 'TELETALK';
        const rawOrgName = matchedOrg?.name || orgInfo?.name_bn || orgInfo?.name || 'বাংলাদেশ সরকারি প্রতিষ্ঠান';
        const orgName = normalizeBanglaOrgName(rawOrgName, sub);
        const { category, categoryLabel } = mapCategory(orgName, orgShortName);

        const deadlineDate = d?.deadline_date || new Date(Date.now() + 18 * 86400000).toISOString();
        const deadlineBn = formatBnDate(deadlineDate);
        const publishedDateBn = formatBnDate(d?.advertisement_published_date || d?.published_date || new Date().toISOString());

        let pdfUrl = '';
        if (d?.advertisement_file) {
          pdfUrl = d.advertisement_file.startsWith('http')
            ? d.advertisement_file
            : `https://alljobs.teletalk.com.bd/media/${d.advertisement_file.replace(/^media\//, '')}`;
        } else if (d?.application_site) {
          pdfUrl = `${d.application_site.replace(/\/$/, '')}/docs/advertisement.pdf`;
        }

        const officialLink = d?.application_site || matchedOrg?.website || (sub ? `https://${sub}.teletalk.com.bd` : 'https://alljobs.teletalk.com.bd');

        // Extract all positions from matched organization record
        let positions: Array<{
          title: string;
          posts: number;
          salary: string;
          grade: string;
          minEducation: string;
          govtFee: number;
        }> = [];

        if (matchedOrg?.govt_jobs && matchedOrg.govt_jobs.length > 0) {
          positions = await Promise.all(
            matchedOrg.govt_jobs.map(async (j: any) => {
              const posTitle = j.job_title_bn || j.job_title;
              const inferred = inferPositionGradeAndSalary(posTitle);
              const isTargetJob = alljobsId && String(j.id) === String(alljobsId);
              let postCount = 1;
              if (isTargetJob && d?.vacancy) {
                postCount = parseInt(String(d.vacancy).replace(/\D/g, ''), 10) || 1;
              } else {
                try {
                  const subRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${j.id}`);
                  if (subRes?.details?.vacancy) {
                    postCount = parseInt(String(subRes.details.vacancy).replace(/\D/g, ''), 10) || 1;
                  }
                } catch {
                  postCount = 1;
                }
              }
              return {
                title: posTitle,
                posts: postCount,
                salary: inferred.salary,
                grade: inferred.grade,
                minEducation: inferred.minEducation,
                govtFee: inferred.govtFee
              };
            })
          );
        } else {
          const singleTitle = d?.job_title_bn || d?.job_title || 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক';
          const singleInferred = inferPositionGradeAndSalary(singleTitle);
          const singleVacancies = parseInt(String(d?.vacancy || '1').replace(/\D/g, ''), 10) || 1;
          positions = [
            {
              title: singleTitle,
              posts: singleVacancies,
              salary: singleInferred.salary,
              grade: singleInferred.grade,
              minEducation: singleInferred.minEducation,
              govtFee: singleInferred.govtFee
            }
          ];
        }

        const effectiveTotalPosts = positions.reduce((sum, p) => sum + (p.posts || 1), 0);
        const allFees = positions.map(p => p.govtFee || 200);
        const minFee = Math.min(...allFees);
        const maxFee = Math.max(...allFees);
        const feeRange = minFee === maxFee ? `৳${minFee}` : `৳${minFee} - ৳${maxFee}`;
        const govtFee = minFee;
        const smsPrefix = orgShortName.toUpperCase();
        const smsFormat = `১ম এসএমএস: ${smsPrefix} <Space> User_ID পাঠিয়ে দিন 16222 নম্বরে।`;
        const districts = 'সকল জেলার যোগ্য প্রার্থীগণ আবেদন করতে পারবেন';

        const fullTitle = positions.length > 1
          ? `${orgName} বিভিন্ন পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬`
          : `${orgName} - ${positions[0].title} নিয়োগ বিজ্ঞপ্তি ২০২৬`;

        const positionSummaries = positions.slice(0, 10).map((p, idx) => 
          `${idx + 1}. ${p.title} (${p.posts}টি পদ) - গ্রেড: ${p.grade}, বেতন: ${p.salary}`
        ).join('\n');

        const rawText = `${orgName}
নিয়োগ বিজ্ঞপ্তি ২০২৬
মোট পদসংখ্যা: ${effectiveTotalPosts}টি (${positions.length}টি ভিন্ন পদবি)
আবেদনের শেষ তারিখ: ${deadlineBn}
আবেদন ফি: ${feeRange}
আবেদনের মাধ্যম: ${officialLink}

পদসমূহের বিবরণ:
${positionSummaries}

শর্তাবলী ও যোগ্যতা:
- প্রার্থীকে অবশ্যই বাংলাদেশের নাগরিক হতে হবে।
- সাধারণ প্রার্থীদের বয়সসীমা ১৮ থেকে ৩২ বছর।
- ${districts}।
- আবেদন এসএমএস কোড: ${smsPrefix}`;

        const gradeList = Array.from(new Set(positions.map(p => p.grade).filter(Boolean)));
        const overallGrade = positions.length === 1
          ? positions[0].grade
          : (gradeList.length > 1 ? `${gradeList[gradeList.length - 1]} হতে ${gradeList[0]}` : gradeList[0] || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী');

        const overallSalary = positions.length === 1
          ? positions[0].salary
          : 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী (পদভেদে নির্ধারিত স্কেল)';

        return {
          jobId: `job-alljobs-${alljobsId || matchedOrg?.id || sub}`,
          title: fullTitle,
          organization: orgName,
          category,
          categoryLabel,
          totalPosts: effectiveTotalPosts,
          deadline: deadlineBn,
          publishedDate: publishedDateBn,
          officialLink,
          circularPdfUrl: pdfUrl,
          rawText,
          minAge: d?.min_age || 18,
          maxAge: d?.max_age || 32,
          salary: overallSalary,
          grade: overallGrade,
          smsPrefix,
          smsFormat,
          govtFee,
          serviceFee: 50,
          feeRange,
          districts,
          positions
        };
      }
    } catch (apiErr: any) {
      console.warn('Alljobs API error:', apiErr.message);
    }
  }

  // 2. Direct Teletalk Portal Deep Crawl (Exclusively for Teletalk application engine subdomains)
  if (trimmed.includes('.teletalk.com.bd') && !trimmed.includes('alljobs.teletalk.com.bd') && !trimmed.endsWith('.pdf')) {
    try {
      const urlMatch = trimmed.match(/https?:\/\/([a-zA-Z0-9\-_]+)\.teletalk\.com\.bd/i);
      const subdomain = urlMatch ? urlMatch[1].toLowerCase() : '';
      const portalData = await scrapeTeletalkPortal(trimmed);
      if (portalData && portalData.positions.length > 0) {
        const org = normalizeBanglaOrgName(portalData.organizationBn || portalData.organizationEn || '', subdomain);
        const { category, categoryLabel } = mapCategory(org);
        const mappedPositions = portalData.positions.map(pos => {
          const inferred = inferPositionGradeAndSalary(pos.bengaliTitle + ' ' + pos.englishTitle);
          return {
            title: pos.bengaliTitle,
            posts: 1,
            salary: inferred.salary,
            grade: inferred.grade,
            minEducation: inferred.minEducation,
            govtFee: inferred.govtFee
          };
        });

        return {
          title: `${org} বিভিন্ন পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬`,
          organization: org,
          category,
          categoryLabel,
          totalPosts: mappedPositions.length,
          deadline: '২৫ নভেম্বর ২০২৬',
          publishedDate: formatBnDate(new Date().toISOString()),
          officialLink: portalData.portalUrl,
          circularPdfUrl: portalData.pdfUrl || trimmed,
          rawText: `${org}\nনিয়োগ বিজ্ঞপ্তি\nমোট পদ: ${mappedPositions.length}\n${portalData.circularRef}`,
          minAge: 18,
          maxAge: 32,
          salary: mappedPositions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
          grade: mappedPositions[0]?.grade || '১০ম - ১৬তম গ্রেড',
          positions: mappedPositions
        };
      }
    } catch (e: any) {
      console.warn('Portal scrape fallback notice:', e.message);
    }
  }

  // 2. Direct PDF URL or Teletalk Portal URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let portalMeta: PortalMetadata | null = null;
    if (trimmed.includes('teletalk.com.bd') || trimmed.includes('.gov.bd')) {
      try {
        portalMeta = await fetchPortalMetadata(trimmed);
      } catch {}
    }

    let pdfText = '';
    try {
      pdfText = await extractTextFromPdf(trimmed);
    } catch {}

    const parsed = parseDetailsFromPdfText(pdfText, trimmed);
    const effectiveOrg = (parsed.org && parsed.org !== 'বাংলাদেশ সরকারি প্রতিষ্ঠান')
      ? parsed.org
      : (portalMeta?.pageTitle || parsed.org);
    const { category, categoryLabel } = mapCategory(effectiveOrg);
    const effectiveDeadline = portalMeta?.deadline || parsed.deadline;
    const effectiveOfficialLink = portalMeta?.website || parsed.officialLink;

    return {
      title: parsed.title,
      organization: effectiveOrg,
      category,
      categoryLabel,
      totalPosts: parsed.totalPosts,
      deadline: effectiveDeadline,
      publishedDate: formatBnDate(new Date().toISOString()),
      officialLink: effectiveOfficialLink,
      circularPdfUrl: trimmed,
      rawText: pdfText,
      minAge: 18,
      maxAge: 32,
      salary: parsed.positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
      grade: parsed.positions[0]?.grade || '১০ম - ১৬তম গ্রেড',
      positions: parsed.positions
    };
  }

  // 3. Raw Text fallback
  const parsedFromText = parseDetailsFromPdfText(trimmed);
  const { category: catText, categoryLabel: catLabelText } = mapCategory(parsedFromText.org);

  return {
    title: parsedFromText.title,
    organization: parsedFromText.org,
    category: catText,
    categoryLabel: catLabelText,
    totalPosts: parsedFromText.totalPosts,
    deadline: parsedFromText.deadline,
    publishedDate: formatBnDate(new Date().toISOString()),
    officialLink: parsedFromText.officialLink,
    circularPdfUrl: '',
    rawText: trimmed,
    minAge: 18,
    maxAge: 32,
    salary: parsedFromText.positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
    grade: parsedFromText.positions[0]?.grade || '১০ম গ্রেড',
    positions: parsedFromText.positions
  };
}
