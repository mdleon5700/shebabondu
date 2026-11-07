/**
 * CHAKRI SHEBA (চাকরি সেবা)
 * Free Local AI Client for Government Job Circular Extraction (Ollama Engine)
 * 
 * Supports:
 * - qwen2.5:1.5b (Fast 1.0 GB primary workhorse)
 * - qwen2.5:3b (High precision 2.0 GB alternative)
 * - Zero external API billing or token limits
 * - Quota-exhaustion safe with regex heuristic fallback
 */

export interface OllamaExtractionOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

export interface ExtractedCircularFields {
  title: string;
  organization: string;
  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health';
  grade: string;
  vacancies: number;
  deadline: string;
  salary: string;
  govtFee: number;
  minEducation: string;
  applicationUrl?: string;
  confidenceScore: number;
  sourceUsed: 'ollama' | 'regex_fallback';
  modelName?: string;
  extractedAt: string;
}

const DEFAULT_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';

/**
 * Checks if Ollama service is reachable on the local machine
 */
export async function isOllamaOnline(baseUrl = DEFAULT_BASE_URL): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Lists locally installed Ollama models
 */
export async function listOllamaModels(baseUrl = DEFAULT_BASE_URL): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.models) ? data.models.map((m: any) => m.name || m.model) : [];
  } catch {
    return [];
  }
}

/**
 * Extracts structured circular fields using local Ollama (qwen2.5:1.5b/3b)
 * Falls back to deterministic regex normalizer if Ollama is offline.
 */
export async function extractCircularWithLocalAi(
  rawText: string,
  options: OllamaExtractionOptions = {}
): Promise<ExtractedCircularFields> {
  const baseUrl = options.baseUrl || DEFAULT_BASE_URL;
  const model = options.model || DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs || 45000;

  const online = await isOllamaOnline(baseUrl);
  if (online) {
    try {
      const prompt = `You are an expert Bangladeshi government job circular data extraction engine.
Analyze the following official circular text and extract key metadata in strictly valid JSON format.

Official Circular Text:
"""
${rawText.slice(0, 6000)}
"""

Output JSON matching this exact structure:
{
  "title": "প্রধান পদের নাম (যেমন: ইন্সট্রাক্টর / অফিস সহকারী)",
  "organization": "সরকারি প্রতিষ্ঠানের নাম (যেমন: কারিগরি শিক্ষা অধিদপ্তর)",
  "category": "govt",
  "grade": "গ্রেড (যেমন: ১০ম গ্রেড)",
  "vacancies": 1,
  "deadline": "YYYY-MM-DD",
  "salary": "বেতন স্কেল (যেমন: ১৬,০০০-৩৮,৬৪০ টাকা)",
  "govtFee": 200,
  "minEducation": "শিক্ষাগত যোগ্যতা (যেমন: স্নাতক বা সমমান)",
  "applicationUrl": "অনলাইন আবেদনের ওয়েবসাইট লিঙ্ক (যেমন: http://dte.teletalk.com.bd)"
}

Rules:
1. category must be one of: 'govt', 'bank', 'railway', 'defense', 'teacher', 'health'
2. vacancies must be an integer (e.g. 15)
3. deadline must be YYYY-MM-DD
4. govtFee must be an integer in BDT (e.g. 200)
5. Output valid JSON only, without any markdown ticks, surrounding code blocks, or explanations.`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.1,
            num_predict: 512
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const responseText = String(data.response || '').trim();
        const parsed = parseJsonSafely(responseText);
        if (parsed && (parsed.title || parsed.organization)) {
          return {
            title: String(parsed.title || 'সরকারি চাকরির নিয়োগ বিজ্ঞপ্তি').trim(),
            organization: String(parsed.organization || 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার').trim(),
            category: sanitizeCategory(parsed.category),
            grade: String(parsed.grade || 'গ্রেড উল্লেখ নেই').trim(),
            vacancies: parseNumberSafely(parsed.vacancies, 1),
            deadline: parseDeadlineSafely(parsed.deadline),
            salary: String(parsed.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী').trim(),
            govtFee: parseNumberSafely(parsed.govtFee, 0),
            minEducation: String(parsed.minEducation || 'বিজ্ঞপ্তি দেখুন').trim(),
            applicationUrl: parsed.applicationUrl ? String(parsed.applicationUrl).trim() : undefined,
            confidenceScore: 0.95,
            sourceUsed: 'ollama',
            modelName: model,
            extractedAt: new Date().toISOString()
          };
        }
      }
    } catch (err: any) {
      console.warn(`[OllamaClient] Local AI extraction warning: ${err.message}. Engaging heuristic fallback.`);
    }
  }

  // Fallback: Deterministic Regex & Keyword Extraction
  return extractViaHeuristics(rawText);
}

function parseJsonSafely(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function parseNumberSafely(val: any, fallback = 0): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  const digits = String(val || '')
    .replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)])
    .replace(/[^\d]/g, '');
  const parsed = parseInt(digits, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function parseDeadlineSafely(val: any): string {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val;
  }
  // Fallback to default 15 days in future
  const d = new Date(Date.now() + 15 * 86400000);
  return d.toISOString().split('T')[0];
}

function sanitizeCategory(cat?: string): ExtractedCircularFields['category'] {
  const allowed = ['govt', 'bank', 'railway', 'defense', 'teacher', 'ngo', 'private', 'health'];
  if (cat && allowed.includes(cat.toLowerCase())) {
    return cat.toLowerCase() as ExtractedCircularFields['category'];
  }
  return 'govt';
}

/**
 * Deterministic Regex & Bengali Keyword Heuristic Extractor (Zero-AI Fallback)
 */
export function extractViaHeuristics(text: string): ExtractedCircularFields {
  // Extract Title
  const titleMatch = text.match(/(?:পদের নাম|পদবি|পদ)\s*[:ঃ]\s*([^\n\r,।]{3,60})/i) ||
    text.match(/([^\n\r।]{3,50}\s*(?:কর্মকর্তা|সহকারী|ইন্সট্রাক্টর|মুদ্রাক্ষরিক|অপারেটর|প্রকৌশলী))/i);
  const title = titleMatch ? titleMatch[1].trim() : 'সরকারি চাকরির নিয়োগ বিজ্ঞপ্তি';

  // Extract Organization
  const orgMatch = text.match(/গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\s*\n\s*([^\n\r।]{4,60})/i) ||
    text.match(/([^\n\r।]{4,50}\s*(?:অধিদপ্তর|মন্ত্রণালয়|কমিশন|কর্তৃপক্ষ|বোর্ড|কার্যালয়|ব্যাংক))/i);
  const organization = orgMatch ? orgMatch[1].trim() : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার';

  // Extract Vacancies
  const vacancyMatch = text.match(/(?:শূন্যপদের সংখ্যা|পদসংখ্যা|পদের সংখ্যা)\s*[:ঃ]\s*([০-৯\d]+)/i) ||
    text.match(/([০-৯\d]+)\s*(?:টি পদ|জন|জনকে)/i);
  const vacancies = vacancyMatch ? parseNumberSafely(vacancyMatch[1], 1) : 1;

  // Extract Application Fee
  const feeMatch = text.match(/(?:পরীক্ষার ফি|আবেদন ফি|ফি বাবদ)\s*[:ঃ]?\s*([০-৯\d]+)\s*টাকা/i) ||
    text.match(/([০-৯\d]+)\s*টাকা\s*টেলিটক/i);
  const govtFee = feeMatch ? parseNumberSafely(feeMatch[1], 100) : 100;

  // Extract Grade
  const gradeMatch = text.match(/([০-৯\d]+(?:\s*তম|\s*ম)?\s*গ্রেড)/i);
  const grade = gradeMatch ? gradeMatch[1].trim() : 'গ্রেড উল্লেখ নেই';

  // Extract Salary
  const salaryMatch = text.match(/বেতন\s*[:ঃ]?\s*([০-৯\d,\-\s]+টাকা)/i) ||
    text.match(/([০-৯\d,]+\s*-\s*[০-৯\d,]+\s*টাকা)/i);
  const salary = salaryMatch ? salaryMatch[1].trim() : 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী';

  // Extract Application Link
  const urlMatch = text.match(/(https?:\/\/[a-z0-9\-.]+\.teletalk\.com\.bd[^\s"'>]*)/i) ||
    text.match(/(https?:\/\/[^\s"'>]+)/i);
  const applicationUrl = urlMatch ? urlMatch[1].trim() : undefined;

  // Determine Category
  const lower = text.toLowerCase();
  let category: ExtractedCircularFields['category'] = 'govt';
  if (lower.includes('bank') || lower.includes('ব্যাংক')) category = 'bank';
  else if (lower.includes('railway') || lower.includes('রেলওয়ে')) category = 'railway';
  else if (lower.includes('police') || lower.includes('পুলিশ') || lower.includes('army') || lower.includes('বাহিনী') || lower.includes('বিজিবি')) category = 'defense';
  else if (lower.includes('teacher') || lower.includes('শিক্ষক') || lower.includes('বিদ্যালয়') || lower.includes('মাদরাসা')) category = 'teacher';
  else if (lower.includes('স্বাস্থ্য') || lower.includes('হাসপাতাল') || lower.includes('নার্স') || lower.includes('চিকিৎসা')) category = 'health';

  return {
    title,
    organization,
    category,
    grade,
    vacancies,
    deadline: parseDeadlineSafely(null),
    salary,
    govtFee,
    minEducation: 'বিজ্ঞপ্তি অনুযায়ী যোগ্যতা প্রযোজ্য',
    applicationUrl,
    confidenceScore: 0.85,
    sourceUsed: 'regex_fallback',
    extractedAt: new Date().toISOString()
  };
}
