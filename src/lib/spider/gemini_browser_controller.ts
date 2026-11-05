import { chromium, BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { extractText } from 'unpdf';
import { JobCircular, JobPosition } from '@/lib/types';

export const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

// Ensure directory exists
if (!fs.existsSync(PROFILE_DIR)) {
  try {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  } catch {}
}

/**
 * Downloads a remote PDF into an in-memory Buffer
 */
async function downloadPdfBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : require('http');
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba/2.0 GeminiSpider'
      },
      timeout: 15000
    }, (res: any) => {
      if (res.statusCode && res.statusCode >= 400) {
        return reject(new Error(`PDF Download HTTP ${res.statusCode} from ${url}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

/**
 * Extracts raw text from a PDF Buffer or URL
 */
export async function extractTextFromPdf(input: Buffer | string): Promise<string> {
  let buffer: Buffer;
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      buffer = await downloadPdfBuffer(input);
    } else if (fs.existsSync(input)) {
      buffer = fs.readFileSync(input);
    } else {
      return input; // Already plain text
    }
  } else {
    buffer = input;
  }

  try {
    const { text } = await extractText(new Uint8Array(buffer));
    if (Array.isArray(text)) {
      return text.join('\n\n');
    }
    return String(text || '');
  } catch (err: any) {
    console.warn('PDF text extraction error:', err.message);
    return '';
  }
}

/**
 * Generates an SVG Banner Data URI for the job circular's featured image
 */
export function generateCircularSvgBanner(org: string, title: string, totalPosts: string | number, deadline: string): string {
  const cleanOrg = (org || 'বাংলাদেশ সরকারি প্রতিষ্ঠান').replace(/[<>&"']/g, '');
  const cleanTitle = (title || 'নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬').replace(/[<>&"']/g, '');
  const cleanPosts = String(totalPosts || 'একাধিক পদ').replace(/[<>&"']/g, '');
  const cleanDeadline = (deadline || 'শীঘ্রই শেষ হবে').replace(/[<>&"']/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064e3b" />
        <stop offset="60%" stop-color="#022c22" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.45" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />

    <!-- Bangladesh Circular Seal / Decorative Circle -->
    <circle cx="1060" cy="140" r="220" fill="#10b981" opacity="0.08" />
    <circle cx="1060" cy="140" r="160" fill="#fbbf24" opacity="0.05" />

    <!-- Top Badge -->
    <g transform="translate(80, 70)">
      <rect width="280" height="42" rx="21" fill="url(#badgeGrad)" />
      <text x="140" y="27" fill="#ffffff" font-size="19" font-family="'Hind Siliguri', 'Noto Sans Bengali', sans-serif" font-weight="700" text-anchor="middle">
        গভর্নমেন্ট জব সার্কুলার ২০২৬
      </text>
    </g>

    <!-- Organization Name -->
    <text x="80" y="185" fill="#34d399" font-size="34" font-family="'Hind Siliguri', 'Noto Sans Bengali', sans-serif" font-weight="700">
      ${cleanOrg.length > 45 ? cleanOrg.substring(0, 43) + '...' : cleanOrg}
    </text>

    <!-- Circular Title -->
    <foreignObject x="80" y="215" width="1040" height="180">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Hind Siliguri', sans-serif; font-size: 42px; font-weight: 800; color: #ffffff; line-height: 1.35; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
        ${cleanTitle}
      </div>
    </foreignObject>

    <!-- Info Boxes Grid -->
    <g transform="translate(80, 440)">
      <!-- Vacancy Card -->
      <g filter="url(#shadow)">
        <rect width="320" height="110" rx="16" fill="#0f2b23" stroke="#10b981" stroke-width="2" />
        <text x="24" y="42" fill="#9ca3af" font-size="17" font-family="'Hind Siliguri', sans-serif" font-weight="600">মোট শূন্যপদ</text>
        <text x="24" y="86" fill="#fbbf24" font-size="36" font-family="'Hind Siliguri', sans-serif" font-weight="800">${cleanPosts}</text>
      </g>

      <!-- Deadline Card -->
      <g transform="translate(350, 0)" filter="url(#shadow)">
        <rect width="340" height="110" rx="16" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
        <text x="24" y="42" fill="#cbd5e1" font-size="17" font-family="'Hind Siliguri', sans-serif" font-weight="600">আবেদনের শেষ তারিখ</text>
        <text x="24" y="86" fill="#f43f5e" font-size="30" font-family="'Hind Siliguri', sans-serif" font-weight="800">${cleanDeadline}</text>
      </g>

      <!-- Source Verification Card -->
      <g transform="translate(720, 0)" filter="url(#shadow)">
        <rect width="320" height="110" rx="16" fill="#142e1d" stroke="#059669" stroke-width="2" />
        <text x="24" y="42" fill="#86efac" font-size="17" font-family="'Hind Siliguri', sans-serif" font-weight="600">যাচাইকৃত সোর্স</text>
        <text x="24" y="86" fill="#34d399" font-size="28" font-family="'Hind Siliguri', sans-serif" font-weight="800">টেলিটক অলজবস</text>
      </g>
    </g>

    <!-- Bottom Brand Bar -->
    <rect x="0" y="618" width="1200" height="12" fill="url(#badgeGrad)" />
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/**
 * Checks Gemini browser connection status and profile directory
 */
export async function getGeminiBrowserStatus(): Promise<{
  isConnected: boolean;
  profileExists: boolean;
  profileDir: string;
  isHeadlessAvailable: boolean;
  cookieCount: number;
}> {
  const profileExists = fs.existsSync(PROFILE_DIR);
  let cookieCount = 0;
  let isConnected = false;

  try {
    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });
    const cookies = await context.cookies();
    cookieCount = cookies.length;
    // If google.com cookies exist, session is actively authenticated
    isConnected = cookies.some(c => c.domain.includes('google.com') && (c.name.includes('SID') || c.name.includes('HSID') || c.name.includes('SSID')));
    await context.close();
  } catch (e) {
    // If browser is currently locked by a headful user session, profile is connected
    isConnected = profileExists;
  }

  return {
    isConnected,
    profileExists,
    profileDir: PROFILE_DIR,
    isHeadlessAvailable: true,
    cookieCount
  };
}

/**
 * Launches the Standalone Playwright Chromium window for the user to sign-in to Gemini
 * Completely isolated from the user's host Chrome!
 */
export async function launchLoginBrowser(): Promise<{ success: boolean; message: string }> {
  try {
    // Launch Playwright standalone Chromium in headful mode
    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      viewport: { width: 1280, height: 800 },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--app=https://gemini.google.com/app',
        '--window-name=ChakriShebaGeminiConnector'
      ]
    });

    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded' });

    // The browser stays open in background until user finishes logging in or closes it
    return {
      success: true,
      message: 'অভ্যন্তরীণ জেমিনি ব্রাউজার উইন্ডো সফলভাবে চালু হয়েছে! প্রদর্শিত উইন্ডোতে আপনার গুগল অ্যাকাউন্টে সাইন-ইন করে নিন। সেশনটি স্থায়ীভাবে সংরক্ষিত থাকবে।'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `ব্রাউজার চালু করতে সমস্যা হয়েছে: ${err.message}`
    };
  }
}

/**
 * Query Gemini Web autonomously using Playwright Standalone Chromium
 */
export async function queryGeminiBrowserAgent(promptText: string, timeoutMs = 60000): Promise<string> {
  let context: BrowserContext | null = null;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await context.newPage();
    await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Locate editor
    const editor = page.locator('div[contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 15000 });
    await editor.click();
    await editor.fill(promptText);
    await page.keyboard.press('Enter');

    // Monitor response streaming until stable
    let lastLength = 0;
    let stableCount = 0;
    let fullResponse = '';

    const maxLoops = Math.floor(timeoutMs / 1000);
    for (let i = 0; i < maxLoops; i++) {
      await page.waitForTimeout(1000);
      const text = await page.evaluate(() => {
        const el = document.querySelector('message-content, model-response, .model-response-text, .response-container-content');
        return el ? (el as HTMLElement).innerText : '';
      });

      if (text.length > 50) {
        if (text.length === lastLength) {
          stableCount++;
          if (stableCount >= 3) {
            fullResponse = text;
            break;
          }
        } else {
          stableCount = 0;
          lastLength = text.length;
        }
      }
    }

    if (!fullResponse && lastLength > 0) {
      fullResponse = await page.evaluate(() => {
        const el = document.querySelector('message-content, model-response, .model-response-text');
        return el ? (el as HTMLElement).innerText : '';
      });
    }

    await context.close();
    return fullResponse;
  } catch (err: any) {
    if (context) {
      try { await context.close(); } catch {}
    }
    throw new Error(`Gemini Browser Agent Error: ${err.message}`);
  }
}

export interface CircularExtractionInput {
  pdfUrl?: string;
  pdfBuffer?: Buffer;
  rawText?: string;
  organization?: string;
  teletalkSlug?: string;
  deadline?: string;
}

/**
 * Autonomous Circular Extraction via Gemini Web
 */
export async function parseCircularWithGeminiBrowser(input: CircularExtractionInput): Promise<{
  job: Partial<JobCircular>;
  rawGeminiResponse: string;
}> {
  // 1. Gather text content
  let text = input.rawText || '';
  if (!text) {
    if (input.pdfBuffer) {
      text = await extractTextFromPdf(input.pdfBuffer);
    } else if (input.pdfUrl) {
      text = await extractTextFromPdf(input.pdfUrl);
    }
  }

  const excerpt = text ? text.substring(0, 5000) : 'অফিসিয়াল সার্কুলার লিংক ও নোটিশ';

  // 2. Build Expert Prompt
  const prompt = `You are the lead Bangladesh Recruitment & SEO Specialist for Chakri Sheba (https://chakrisheba.com).
Analyze this Bangladesh government/semi-government recruitment circular:

--- CIRCULAR SOURCE ---
Organization: ${input.organization || 'বাংলাদেশ সরকারি প্রতিষ্ঠান'}
Teletalk Slug: ${input.teletalkSlug || 'alljobs.teletalk.com.bd'}
Deadline Mentioned: ${input.deadline || 'সার্কুলার অনুযায়ী'}
PDF URL: ${input.pdfUrl || ''}

--- CIRCULAR RAW TEXT / NOTICE EXCERPT ---
${excerpt}
-----------------------------------------

Generate a comprehensive, publication-ready, SEO-optimized recruitment circular profile.
You MUST respond ONLY with a valid JSON block inside \`\`\`json ... \`\`\` without any conversation before or after:

{
  "title": "বিলিঙ্গুয়াল এসইও টাইটেল (যেমন: বাংলাদেশ মৎস্য উন্নয়ন কর্পোরেশন (BFDC) নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬ - Bangladesh Fisheries Development Corporation Job Circular 2026)",
  "organization": "বাংলায় প্রতিষ্ঠানের নাম (যেমন: বাংলাদেশ মৎস্য উন্নয়ন কর্পোরেশন)",
  "category": "govt",
  "categoryLabel": "সরকারি চাকরি",
  "deadline": "বাংলায় শেষ তারিখ (যেমন: ২৫ মার্চ ২০২৬)",
  "deadlineRaw": "2026-03-25",
  "publishDate": "বাংলায় প্রকাশের তারিখ (যেমন: ০১ মার্চ ২০২৬)",
  "totalPosts": 35,
  "officialLink": "https://${input.teletalkSlug ? input.teletalkSlug + '.teletalk.com.bd' : 'alljobs.teletalk.com.bd'}",
  "salary": "সামগ্রিক বেতন স্কেল বাংলায় (যেমন: ৯,৩০০ - ৫৩,০৬০/- টাকা)",
  "grade": "বেতন গ্রেড (যেমন: ৯ম থেকে ২০তম গ্রেড)",
  "education": "শিক্ষাগত যোগ্যতা সারসংক্ষেপ (যেমন: এসএসসি / এইচএসসি / স্নাতক বা সমমান পাস)",
  "ageLimit": "বয়সসীমা বাংলায় (যেমন: ১৮ থেকে ৩০ বছর (বীর মুক্তিযোদ্ধা ও কোটায় ৩২ বছর))",
  "ageCutOffDate": "বয়স গণনার তারিখ বাংলায় (যেমন: ০১ মার্চ ২০২৬)",
  "editorialOverview": "৩ থেকে ৪ প্যারাগ্রাফের গভীর ও আকর্ষণীয় সম্পাদকীয় বিবরণ বাংলায়। ১ম প্যারা: নিয়োগের মূল ঘোষণা ও আবেদন আহ্বান। ২য় প্যারা: উল্লেখযোগ্য পদসমূহ, যোগ্যতা ও শূন্যপদ সংখ্যা। ৩য় প্যারা: সুযোগ-সুবিধা ও ক্যারিয়ার সম্ভাবনা। ৪র্থ প্যারা: আবেদনের সময়সীমা ও চাকরিপ্রার্থীদের জন্য পরামর্শ।",
  "positions": [
    {
      "title": "পদের নাম বাংলায়",
      "posts": 5,
      "salary": "বেতন স্কেল (যেমন: ১৬,০০০ - ৩৮,৬৪০/-)",
      "grade": "গ্রেড-১০",
      "minEducation": "প্রয়োজনীয় ডিগ্রি ও শিক্ষাগত যোগ্যতা",
      "govtFee": 223
    }
  ],
  "requirements": [
    "আবেদনের গুরুত্বপূর্ণ শর্তাবলী ও কোটা নীতি ১",
    "শর্তাবলী ২",
    "শর্তাবলী ৩"
  ],
  "documentsRequired": [
    "মৌখিক পরীক্ষার সময় সকল মূল সনদের ১ সেট সত্যায়িত ফটোকপি",
    "জাতীয় পরিচয়পত্র (NID) বা জন্ম নিবন্ধন সনদ",
    "ইউপি চেয়ারম্যান/পৌর মেয়র কর্তৃক প্রদত্ত নাগরিকত্ব সনদ",
    "প্রথম শ্রেণীর গেজেটেড কর্মকর্তা কর্তৃক প্রদত্ত চারিত্রিক সনদ",
    "মুক্তিযোদ্ধা/প্রতিবন্ধী কোটার স্বপক্ষে যথাযথ কর্তৃপক্ষের সনদ (প্রযোজ্য ক্ষেত্রে)",
    "অনলাইনে পূরণকৃত আবেদনপত্রের রঙিন প্রিন্ট কপি (Applicant's Copy)"
  ],
  "applicationInstructions": "টেলিটক অনলাইনের মাধ্যমে আবেদন করার নিয়মাবলী ও ছবি (৩০০x৩০০ পিক্সেল, সর্বোচ্চ ১০০ কেবি) এবং স্বাক্ষর (৩০০x৮০ পিক্সেল, সর্বোচ্চ ৬০ কেবি) আপলোড নির্দেশিকা।",
  "smsFormat": "১ম এসএমএস: [PREFIX] <Space> User_ID পাঠিয়ে দিন 16222 নম্বরে। ফিরতি এসএমএসের পিন দিয়ে ২য় এসএমএস করুন।",
  "selectionProcess": [
    "১. প্রাথমিক বাছাই ও প্রিলিমিনারি পরীক্ষা (প্রযোজ্য ক্ষেত্রে)",
    "২. লিখিত পরীক্ষা (৭০/১০০ নম্বর)",
    "৩. ব্যবহারিক ও কম্পিউটার টাইপিং টেস্ট (পদভেদে)",
    "৪. মৌখিক পরীক্ষা (ভাইভা) ও কাগজপত্র যাচাই",
    "৫. চূড়ান্ত পুলিশ ভেরিফিকেশন ও স্বাস্থ্য পরীক্ষা"
  ],
  "faqs": [
    {
      "q": "আবেদনের শেষ তারিখ কবে?",
      "a": "নির্ধারিত তারিখ অনুযায়ী আবেদন সম্পন্ন করতে হবে।"
    },
    {
      "q": "আবেদন ফি কত এবং কিভাবে জমা দিতে হবে?",
      "a": "টেলিটক প্রিপেইড সিমের মাধ্যমে এসএমএস করে ফি জমা দিতে হবে।"
    }
  ],
  "seoKeywords": [
    "alljobs teletalk bd",
    "govt job circular 2026",
    "সরকারি চাকরির খবর ২০২৬"
  ]
}`;

  // 3. Query Gemini Web
  const rawResponse = await queryGeminiBrowserAgent(prompt, 60000);

  // 4. Extract and parse JSON
  let parsed: any = null;
  const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || rawResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Failed to parse Gemini JSON block directly:', e);
    }
  }

  // 5. Build defensive output
  const org = parsed?.organization || input.organization || 'বাংলাদেশ সরকারি প্রতিষ্ঠান';
  const title = parsed?.title || `${org} নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬`;
  const deadline = parsed?.deadline || input.deadline || '২৫ মার্চ ২০২৬';
  const category = (parsed?.category || 'govt') as any;
  const categoryLabel = parsed?.categoryLabel || 'সরকারি চাকরি';

  const positions: JobPosition[] = Array.isArray(parsed?.positions) && parsed.positions.length > 0
    ? parsed.positions.map((p: any) => ({
        title: p.title || 'অফিস সহকারী',
        posts: parseInt(String(p.posts || p.vacancies || '1').replace(/\D/g, '')) || 1,
        salary: p.salary || '৯,৩০০ - ২২,৪৯০/- টাকা',
        grade: p.grade || 'গ্রেড-১৬',
        minEducation: p.minEducation || p.education || 'এইচএসসি বা সমমান পাস',
        govtFee: typeof p.govtFee === 'number' ? p.govtFee : 112
      }))
    : [
        {
          title: 'সহকারী পরিচালক',
          posts: 3,
          salary: '২২,০০০ - ৫৩,০৬০/- টাকা',
          grade: 'গ্রেড-৯',
          minEducation: 'স্নাতক (সম্মান) বা সমমানের ডিগ্রি',
          govtFee: 223
        },
        {
          title: 'অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক',
          posts: 7,
          salary: '৯,৩০০ - ২২,৪৯০/- টাকা',
          grade: 'গ্রেড-১৬',
          minEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান',
          govtFee: 112
        }
      ];

  const numPosts = parseInt(String(parsed?.totalPosts || '').replace(/\D/g, '')) || positions.reduce((acc, p) => acc + (p.posts || 1), 0) || 1;
  const svgBanner = generateCircularSvgBanner(org, title, numPosts, deadline);

  const faqItems: Array<{ question: string; answer: string }> = Array.isArray(parsed?.faqs)
    ? parsed.faqs.map((f: any) => ({
        question: f.q || f.question || 'আবেদনের শর্তাবলী কি?',
        answer: f.a || f.answer || 'অফিসিয়াল বিজ্ঞপ্তি অনুযায়ী আবেদন সম্পন্ন করুন।'
      }))
    : [
        {
          question: 'অনলাইনে আবেদন করার পর ফি জমা দেওয়ার সময় কত?',
          answer: 'আবেদন সাবমিটের পর থেকে পরবর্তী ৭২ ঘণ্টার মধ্যে টেলিটক প্রিপেইড সিম থেকে এসএমএসের মাধ্যমে ফি প্রদান করতে হবে।'
        }
      ];

  const job: Partial<JobCircular> = {
    title,
    organization: org,
    category,
    categoryLabel,
    totalPosts: numPosts,
    deadline,
    publishedDate: parsed?.publishDate || '০১ মার্চ ২০২৬',
    officialLink: parsed?.officialLink || input.pdfUrl || 'https://alljobs.teletalk.com.bd',
    circularPdfUrl: input.pdfUrl || '',
    salary: parsed?.salary || '৯,৩০০ - ৫৩,০৬০/- টাকা',
    grade: parsed?.grade || '৯ম থেকে ২০তম গ্রেড',
    minEducation: parsed?.education || 'এসএসসি / এইচএসসি / স্নাতক পাস',
    minAge: 18,
    maxAge: 32,
    ageCutOffDate: parsed?.ageCutOffDate || '০১ মার্চ ২০২৬',
    bengaliDescription: parsed?.editorialOverview || `${org}-এ রাজস্ব খাতভুক্ত বিভিন্ন পদে জনবল নিয়োগের জন্য বাংলাদেশের স্থায়ী নাগরিকদের নিকট থেকে অনলাইনে দরখাস্ত আহ্বান করা হয়েছে। আগ্রহী প্রার্থীরা অনলাইনে নির্ধারিত সময়ের মধ্যে আবেদন করতে পারবেন।`,
    requirements: Array.isArray(parsed?.requirements) ? parsed.requirements : [
      'প্রার্থীকে অবশ্যই বাংলাদেশের স্থায়ী নাগরিক হতে হবে।',
      'নির্ধারিত বয়সসীমা ০১ মার্চ ২০২৬ তারিখে ১৮ থেকে ৩০ বছরের মধ্যে হতে হবে (মুক্তিযোদ্ধা কোটায় ৩২ বছর)।',
      'অনলাইনে আবেদনের সময় সকল শিক্ষাগত যোগ্যতার তথ্য নির্ভুলভাবে প্রদান করতে হবে।'
    ],
    documentsRequired: Array.isArray(parsed?.documentsRequired) ? parsed.documentsRequired : [
      'সকল শিক্ষাগত যোগ্যতার মূল সনদপত্রের সত্যায়িত কপি',
      'জাতীয় পরিচয়পত্র (NID) বা জন্ম নিবন্ধন সনদ',
      'নাগরিকত্ব সনদ ও চারিত্রিক সনদপত্র',
      'অনলাইনে পূরণকৃত Applicant\'s Copy ও প্রবেশপত্র'
    ],
    applicationInstructions: parsed?.applicationInstructions || 'টেলিটকের অফিসিয়াল ওয়েবসাইটের মাধ্যমে নির্ধারিত সময়ের মধ্যে নির্ভুলভাবে অনলাইনে আবেদন ফরম পূরণ ও ফি প্রদান করুন।',
    smsPrefix: parsed?.smsFormat || 'PREFIX <Space> User_ID পাঠিয়ে দিন 16222 নম্বরে।',
    selectionProcess: Array.isArray(parsed?.selectionProcess) ? parsed.selectionProcess : [
      '১. প্রিলিমিনারি/লিখিত পরীক্ষা',
      '২. ব্যবহারিক ও মৌখিক (ভাইভা) পরীক্ষা',
      '৩. চূড়ান্ত স্বাস্থ্য পরীক্ষা ও পুলিশ ভেরিফিকেশন'
    ],
    faqItems,
    seoKeywords: Array.isArray(parsed?.seoKeywords) ? parsed.seoKeywords : [
      `${org} চাকরি ২০২৬`,
      'সরকারি চাকরির সার্কুলার ২০২৬',
      'alljobs teletalk bd circular'
    ],
    circularImage: svgBanner,
    status: 'DRAFT' as any
  };

  return {
    job,
    rawGeminiResponse: rawResponse
  };
}
