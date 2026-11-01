import https from 'https';
import fs from 'fs';
import path from 'path';
import { CircularDraft } from '@/lib/types';

export interface GeneratedJobContent {
  success: boolean;
  bengaliDescription: string;
  seoTitle: string;
  seoDescription: string;
  targetKeywords: string[];
  faqItems: Array<{ question: string; answer: string }>;
  isAiGenerated: boolean;
  modelUsed?: string;
  error?: string;
}

function getGeminiApiKey(): string | null {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const text = fs.readFileSync(envPath, 'utf8');
      const match = text.match(/GEMINI_API_KEY=(.+)/);
      if (match && match[1].trim().length > 10) {
        return match[1].trim();
      }
    }
  } catch {}
  return null;
}

/**
 * Deterministic Bengali template generator fallback
 * Guarantees 100% pure Bengali content with natural keywords even if API is offline.
 */
export function generateDeterministicBengaliContent(draft: CircularDraft): GeneratedJobContent {
  const org = draft.extractedOrg || 'সরকারি প্রতিষ্ঠান';
  const title = draft.extractedTitle || 'বিভিন্ন পদ';
  const vacancies = draft.vacancies > 0 ? `${draft.vacancies}টি` : 'নির্দিষ্ট সংখ্যক';
  const deadline = draft.deadline || 'বিজ্ঞপ্তি অনুযায়ী';
  const fee = draft.govtFee > 0 ? `${draft.govtFee} টাকা` : 'বিজ্ঞপ্তি অনুযায়ী';
  const salary = draft.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী';
  const education = draft.minEducation || 'বিজ্ঞপ্তি অনুযায়ী নির্ধারিত শিক্ষাগত যোগ্যতা';

  const desc = `### ${org}-এ ${title} পদে নিয়োগ বিজ্ঞপ্তি প্রকাশ

**${org}** এর সম্প্রতি প্রকাশিত অফিসিয়াল নিয়োগ বিজ্ঞপ্তি অনুযায়ী **${title}** পদে যোগ্য ও আগ্রহী প্রার্থীদের নিকট হতে অনলাইনে দরখাস্ত আহ্বান করা হচ্ছে।

---

#### 📌 পদের সংক্ষিপ্ত বিবরণী:
- **প্রতিষ্ঠানের নাম:** ${org}
- **পদের নাম:** ${title}
- **শূন্যপদের সংখ্যা:** ${vacancies}
- **শিক্ষাগত যোগ্যতা:** ${education}
- **বেতন স্কেল:** ${salary} (গ্রেড: ${draft.grade || 'বিজ্ঞপ্তি অনুযায়ী'})
- **আবেদনের শেষ তারিখ:** ${deadline}
- **সরকারি আবেদন ফি:** ${fee}

---

#### 📝 আবেদনের নিয়মাবলী ও টেলিটক অনলাইন প্রসেস:
১. আগ্রহী প্রার্থীদের টেলিটক অফিশিয়াল রিক্রুটমেন্ট পোর্টাল [${draft.sourceUrl}](${draft.sourceUrl}) এর মাধ্যমে নির্ধারিত আবেদন ফরম পূরণ করতে হবে।
২. আবেদনপত্র সঠিকভাবে সাবমিট করার পর প্রাপ্ত **User ID** ব্যবহার করে টেলিটক প্রিপেইড মোবাইল সিমের মাধ্যমে পরবর্তী ৭২ ঘণ্টার মধ্যে এসএমএস (SMS)-এর মাধ্যমে পরীক্ষার ফি প্রদান করতে হবে।
৩. ছবির সাইজ ৩০০x৩০০ পিক্সেল (সর্বোচ্চ ১০০ KB) এবং স্বাক্ষরের সাইজ ৩০০x৮০ পিক্সেল (সর্বোচ্চ ৬০ KB) স্ক্যান করে আপলোড করতে হবে।

---

#### ⚠️ বিশেষ সতর্কবার্তা ও তথ্যের সত্যতা:
আবেদন করার পূর্বে অবশ্যই মূল বিজ্ঞপ্তি ও নিয়মাবলী ভালোভাবে পড়ে নেবেন। চাকরি সেবা একটি স্বাধীন তথ্য ও অ্যাসিস্ট্যান্স প্ল্যাটফর্ম। কোনো অসঙ্গতি বা সংশোধনের জন্য মূল গেজেট অনুসরণযোগ্য।`;

  const cleanTitle = `${title} নিয়োগ বিজ্ঞপ্তি ২০২৬ - ${org} | চাকরি সেবা`;
  const cleanDesc = `${org}-এ ${title} পদে নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশ হয়েছে। মোট পদসংখ্যা: ${vacancies}, আবেদনের শেষ সময়: ${deadline}। বিস্তারিত যোগ্যতা ও টেলিটক আবেদন নিয়মাবলী জানুন।`;

  return {
    success: true,
    bengaliDescription: desc,
    seoTitle: cleanTitle.slice(0, 70),
    seoDescription: cleanDesc.slice(0, 160),
    targetKeywords: [
      `${title} job circular`,
      `${org} নিয়োগ বিজ্ঞপ্তি`,
      'সরকারি চাকরির খবর',
      'alljobs teletalk job circular',
      'চাকরির খবর ২০২৬',
      'bd govt job application'
    ],
    faqItems: [
      {
        question: `${org}-এ ${title} পদে আবেদনের শেষ তারিখ কবে?`,
        answer: `বিজ্ঞপ্তি অনুযায়ী আবেদনের সর্বশেষ তারিখ ও সময় হলো ${deadline}।`
      },
      {
        question: `এই পদের সরকারি পরীক্ষার ফি কত এবং কিভাবে জমা দিতে হবে?`,
        answer: `সরকারি আবেদন ফি ${fee}। আবেদন সাবমিটের পর টেলিটক প্রিপেইড সিমের মাধ্যমে এসএমএস করে ফি জমা দিতে হবে।`
      },
      {
        question: `আবেদন ফরম কোথায় পাওয়া যাবে?`,
        answer: `টেলিটকের অফিসিয়াল রিক্রুটমেন্ট পোর্টাল (${draft.sourceUrl}) এ গিয়ে সরাসরি আবেদন করা যাবে।`
      }
    ],
    isAiGenerated: false
  };
}

/**
 * Generate enriched Bengali Job Description & SEO metadata via Gemini AI
 * Strictly enforces Bengali output, natural bilingual keywords, and evidence verification.
 */
export async function generateBengaliJobContentWithGemini(draft: CircularDraft): Promise<GeneratedJobContent> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return generateDeterministicBengaliContent(draft);
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const evidence = [
    `প্রতিষ্ঠানের নাম: ${draft.extractedOrg}`,
    `পদের নাম: ${draft.extractedTitle}`,
    `স্মারক নং: ${draft.refNo || 'অনুল্লিখিত'}`,
    `শূন্যপদ: ${draft.vacancies} টি`,
    `শিক্ষাগত যোগ্যতা: ${draft.minEducation}`,
    `বেতন স্কেল/গ্রেড: ${draft.salary} (গ্রেড: ${draft.grade || 'অনির্ধারিত'})`,
    `আবেদনের শেষ সময়: ${draft.deadline}`,
    `সরকারি ফি: ${draft.govtFee} টাকা`,
    `অফিসিয়াল সোর্স লিঙ্ক: ${draft.sourceUrl}`,
    `মূল সার্কুলার টেক্সট এভিডেন্স: ${draft.rawEvidenceText || 'উপলব্ধ নয়'}`
  ].join('\n');

  const systemInstruction = `You are an elite, highly professional Bengali recruitment journalist and technical SEO editor for Bangladesh's leading employment portal "Chakri Sheba" (চাকরি সেবা).

STRICT RULES & CONSTRAINTS:
1. COMPLETE CONTENT IN BENGALI: All narrative text, titles, descriptions, and FAQs must be composed in professional, fluent, and standard Bengali (প্রমিত বাংলা).
2. NATURAL BILINGUAL KEYWORD PLACEMENT: Naturally incorporate relevant English technical designations and keywords in parentheses or running text where appropriate (e.g., 'কম্পিউটার অপারেটর (Computer Operator)', 'সহকারী পরিচালক (Assistant Director)', 'টেলিটক আবেদন (Teletalk Apply Online)').
3. ZERO HALLUCINATION & FACTUAL ACCURACY: Strictly rely ONLY on the provided circular evidence. NEVER invent fake vacancy numbers, salaries, or unsupported dates. If a requirement is not mentioned, state 'অফিসিয়াল বিজ্ঞপ্তি অনুযায়ী প্রযোজ্য' or omit.
4. NO SEPARATE ENGLISH ARTICLES: Do not output separate English versions. The article itself is strictly in Bengali.
5. STRUCTURED JSON OUTPUT: Return ONLY a valid JSON object matching the requested schema. No code fences or Markdown outside JSON.`;

  const userPrompt = `নিম্নোক্ত সরকারি/অফিসিয়াল সার্কুলার এভিডেন্সের ভিত্তিতে একটি আকর্ষণীয়, তথ্যবহুল ও ১০০% নির্ভুল বাংলা জব আর্টিকেল এবং এসইও মেটাডাটা প্রস্তুত করুন।

[সার্কুলার এভিডেন্স]:
${evidence}

JSON আউটপুট কাঠামো (JSON Object Format):
{
  "bengaliDescription": "মার্কডাউন ফরম্যাটে পূর্ণাঙ্গ বাংলা আর্টিকেল (ভূমিকা, পদের বিবরণ, যোগ্যতা, টেলিটক এসএমএস ও অনলাইন আবেদন নিয়মাবলী, গুরুত্বপূর্ণ তারিখ)",
  "seoTitle": "এসইও উপযোগী আকর্ষণীয় বাংলা টাইটেল (সর্বোচ্চ ৬৫ অক্ষর)",
  "seoDescription": "সার্চ ইঞ্জিন মেটা ডেসক্রিপশন (১৪০-১৬০ অক্ষর)",
  "targetKeywords": ["৫ থেকে ৭টি স্বাভাবিক বাংলা ও ইংরেজি কিওয়ার্ডের অ্যারে"],
  "faqItems": [
    { "question": "প্রশ্ন ১", "answer": "উত্তর ১" },
    { "question": "প্রশ্ন ২", "answer": "উত্তর ২" },
    { "question": "প্রশ্ন ৩", "answer": "উত্তর ৩" }
  ]
}`;

  return new Promise<GeneratedJobContent>((resolve) => {
    const postData = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2500,
        responseMimeType: 'application/json'
      }
    });

    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 25000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            console.warn(`Gemini API returned status ${res.statusCode}. Falling back to deterministic content.`);
            return resolve(generateDeterministicBengaliContent(draft));
          }

          const responseJson = JSON.parse(body);
          const rawText = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) {
            return resolve(generateDeterministicBengaliContent(draft));
          }

          const parsed = JSON.parse(rawText);
          resolve({
            success: true,
            bengaliDescription: parsed.bengaliDescription || draft.extractedTitle,
            seoTitle: parsed.seoTitle || `${draft.extractedTitle} - ${draft.extractedOrg}`,
            seoDescription: parsed.seoDescription || `${draft.extractedOrg}-এ ${draft.extractedTitle} পদে নিয়োগ।`,
            targetKeywords: Array.isArray(parsed.targetKeywords) ? parsed.targetKeywords : [],
            faqItems: Array.isArray(parsed.faqItems) ? parsed.faqItems : [],
            isAiGenerated: true,
            modelUsed: model
          });
        } catch (e: any) {
          console.warn('Failed to parse Gemini response as JSON. Falling back to deterministic content:', e.message);
          resolve(generateDeterministicBengaliContent(draft));
        }
      });
    });

    req.on('error', (err) => {
      console.warn('Gemini HTTPS request error:', err.message);
      resolve(generateDeterministicBengaliContent(draft));
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn('Gemini HTTPS request timed out');
      resolve(generateDeterministicBengaliContent(draft));
    });

    req.write(postData);
    req.end();
  });
}
