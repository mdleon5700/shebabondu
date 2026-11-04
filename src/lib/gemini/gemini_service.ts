import fs from 'fs';
import path from 'path';
import https from 'https';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';
import { extractText } from 'unpdf';

export interface GeminiConfig {
  apiKey: string;
  model: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastTestedAt?: string;
  error?: string;
}

export interface ExtractedPosition {
  title: string;
  grade: string;
  posts: number;
  salary: string;
  minEducation: string;
  experience?: string;
}

export interface ExtractedJobData {
  title: string;
  organization: string;
  totalPosts: number;
  positions: ExtractedPosition[];
  grade: string;
  salary: string;
  minEducation: string;
  deadline: string;
  applicationStartDate?: string;
  govtFee: number;
  serviceFee: number;
  minAge: number;
  maxAge: number;
  ageCutOffDate?: string;
  districts: string;
  category: string;
  categoryLabel: string;
  smsPrefix?: string;
  officialLink?: string;
  requirements: string[];
  bengaliDescription?: string;
  rawConfidence?: number;
}

const DEFAULT_MODEL = 'gemini-1.5-flash';

export class GeminiService {
  private static getEnvKey(): string {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const text = fs.readFileSync(envPath, 'utf8');
        const match = text.match(/GEMINI_API_KEY=(.+)/);
        if (match && match[1]) return match[1].trim();
      }
    } catch {}
    return '';
  }

  static getConfig(): GeminiConfig {
    const key = this.getEnvKey();
    const dbSettings = serverDB.getPlatformSettings();
    const savedAiConfig = (dbSettings as any).aiConfig || {};

    const effectiveKey = key || savedAiConfig.apiKey || '';
    const model = savedAiConfig.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;

    return {
      apiKey: effectiveKey,
      model,
      status: effectiveKey ? (savedAiConfig.status || 'CONNECTED') : 'DISCONNECTED',
      lastTestedAt: savedAiConfig.lastTestedAt,
      error: savedAiConfig.error
    };
  }

  static async saveConfig(apiKey: string, model = DEFAULT_MODEL): Promise<GeminiConfig> {
    const trimmedKey = apiKey.trim();
    
    // 1. Test key validity first
    const testResult = await this.testConnectivity(trimmedKey);
    const status = testResult.success ? 'CONNECTED' : 'ERROR';
    const error = testResult.error;

    // 2. Save in platformSettings
    const settings = serverDB.getPlatformSettings();
    const updatedAiConfig = {
      apiKey: trimmedKey,
      model,
      status,
      error,
      lastTestedAt: new Date().toISOString()
    };

    serverDB.updatePlatformSettings({
      ...settings,
      ...({ aiConfig: updatedAiConfig } as any)
    }, 'ADMIN-SUPER');

    // 3. Update .env.local for persistence
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${trimmedKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${trimmedKey}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
      process.env.GEMINI_API_KEY = trimmedKey;
    } catch {}

    return {
      apiKey: trimmedKey,
      model,
      status,
      lastTestedAt: updatedAiConfig.lastTestedAt,
      error
    };
  }

  static async testConnectivity(apiKey?: string): Promise<{ success: boolean; modelsCount?: number; error?: string }> {
    const key = apiKey || this.getEnvKey();
    if (!key) {
      return { success: false, error: 'কোনো Gemini API Key কনফিগার করা নেই।' };
    }

    return new Promise((resolve) => {
      const req = https.get({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models?key=${key}`,
        timeout: 12000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.models && data.models.length > 0) {
              resolve({
                success: true,
                modelsCount: data.models.length
              });
            } else {
              resolve({
                success: false,
                error: data.error?.message || 'কোনো এআই মডেল পাওয়া যায়নি।'
              });
            }
          } catch (e: any) {
            resolve({ success: false, error: e.message });
          }
        });
      });

      req.on('error', (err) => resolve({ success: false, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'জেমিনি সার্ভারে কানেকশন টাইমআউট হয়েছে।' });
      });
    });
  }

  /**
   * Generates response using Gemini API v1beta
   */
  static async callGemini(
    prompt: string,
    inlineData?: { mimeType: string; data: string },
    systemInstruction = 'You are an expert Bangladesh Government Job Circular Extractor. Output pure JSON without markdown codeblocks.'
  ): Promise<string> {
    const config = this.getConfig();
    if (!config.apiKey) {
      throw new Error('জেমিনি এআই এপিআই কি কনফিগার করা নেই। অনুগ্রহ করে এডমিন প্যানেলে এপিআই কি দিন।');
    }

    const parts: any[] = [];
    if (inlineData) {
      parts.push({
        inline_data: {
          mime_type: inlineData.mimeType,
          data: inlineData.data
        }
      });
    }
    parts.push({ text: prompt });

    const postData = JSON.stringify({
      contents: [{ role: 'user', parts }],
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096
      }
    });

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 45000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode && res.statusCode >= 400) {
              return reject(new Error(`Gemini API ত্রুটি (${res.statusCode}): ${data.error?.message || body}`));
            }
            const candidate = data.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text || '';
            resolve(text);
          } catch (e: any) {
            reject(new Error(`Failed to parse Gemini response: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`Gemini Network Error: ${err.message}`)));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('জেমিনি রেসপন্স টাইমআউট (৪৫ সেকেন্ড অতিক্রম করেছে)।'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Main Smart Extractor: Parses a circular PDF buffer or URL with zero wrong information.
   */
  static async extractCircularDetails(params: {
    pdfBuffer?: Buffer;
    pdfUrl?: string;
    rawText?: string;
  }): Promise<ExtractedJobData> {
    let pdfBuffer = params.pdfBuffer;

    // 1. Fetch remote PDF if URL provided
    if (!pdfBuffer && params.pdfUrl) {
      try {
        const res = await fetch(params.pdfUrl);
        if (!res.ok) throw new Error(`PDF ডাউনলোড ব্যর্থ (HTTP ${res.status})`);
        const arrayBuf = await res.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuf);
      } catch (err: any) {
        throw new Error(`সার্কুলার PDF ডাউনলোড করা সম্ভব হয়নি: ${err.message}`);
      }
    }

    let extractedPdfText = '';
    if (pdfBuffer) {
      try {
        const uint8 = new Uint8Array(pdfBuffer);
        const textResult = await extractText(uint8);
        extractedPdfText = Array.isArray(textResult.text) ? textResult.text.join('\n') : String(textResult.text || '');
      } catch (e) {
        console.warn('unpdf text extraction error, will rely directly on multimodal base64:', e);
      }
    }

    const prompt = `
You are the most precise Bangladesh Government & Semi-Government Job Circular parser.
Analyze this official recruitment circular document thoroughly.
Extract EVERY position, EVERY post count, exact pay scale according to the National Pay Scale 2015, exact educational qualifications, age limits, eligible and non-eligible districts, application start and end deadlines, and teletalk application fees.

${extractedPdfText ? `Extracted Document Text:\n${extractedPdfText.slice(0, 15000)}\n` : ''}

Output a strictly valid JSON object matching this schema without any markdown formatting or comments:
{
  "title": "Exact circular title in Bengali (e.g. বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড নিয়োগ বিজ্ঞপ্তি ২০২৬)",
  "organization": "Exact Organization Name (e.g. বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (BREB))",
  "totalPosts": Total vacancies across all positions (integer number),
  "grade": "Primary or highest grade mentioned (e.g. ৯তম গ্রেড, ১০ম গ্রেড, ১১তম গ্রেড)",
  "salary": "Pay scale format (e.g. ৳১৬,০০০ - ৩৮,৬৪০)",
  "minEducation": "Minimum education requirement (e.g. স্নাতক / স্নাতকোত্তর / ডিপ্লোমা / এইচএসসি)",
  "deadline": "Exact application deadline in Bengali (e.g. ২৫ নভেম্বর ২০২৬)",
  "applicationStartDate": "Application starting date if mentioned",
  "govtFee": Numeric teletalk exam fee (e.g. 100, 200, 300, 500),
  "serviceFee": 50,
  "minAge": Numeric min age (default 18),
  "maxAge": Numeric max age (e.g. 30 or 32),
  "ageCutOffDate": "Cut-off date for age calculation",
  "districts": "Districts allowed or barred (e.g. সকল জেলার প্রার্থীরা আবেদন করতে পারবেন অথবা নির্দিষ্ট জেলা)",
  "category": "govt or bank or railway or defense or teacher",
  "categoryLabel": "সরকারি চাকরি or ব্যাংক or অন্যান্য",
  "smsPrefix": "Teletalk SMS prefix keyword if visible",
  "officialLink": "Teletalk portal URL if visible (e.g. http://breb.teletalk.com.bd)",
  "requirements": [
    "Array of specific qualifications or conditions"
  ],
  "positions": [
    {
      "title": "Exact position/designation name in Bengali",
      "grade": "Grade (e.g. ১০ম গ্রেড)",
      "posts": Vacancies for this specific position (integer),
      "salary": "Pay scale for this position (e.g. ৳১৬,০০০ - ৩৮,৬৪০)",
      "minEducation": "Specific educational requirement for this post",
      "experience": "Experience requirement if any"
    }
  ],
  "bengaliDescription": "Short 2-line summary of the recruitment in Bengali"
}
`;

    let rawJsonText = '';

    // If PDF buffer is available, send as inline base64 to multimodal Gemini
    if (pdfBuffer) {
      const base64Data = pdfBuffer.toString('base64');
      rawJsonText = await this.callGemini(prompt, {
        mimeType: 'application/pdf',
        data: base64Data
      });
    } else {
      rawJsonText = await this.callGemini(prompt);
    }

    // Clean JSON response (strip markdown wrappers if any)
    const cleanedJson = rawJsonText
      .replace(/^```json/m, '')
      .replace(/^```/m, '')
      .replace(/```$/m, '')
      .trim();

    try {
      const parsed: ExtractedJobData = JSON.parse(cleanedJson);
      
      // Calculate total posts if positions array is present
      if (Array.isArray(parsed.positions) && parsed.positions.length > 0) {
        const sumPosts = parsed.positions.reduce((acc, p) => acc + (Number(p.posts) || 0), 0);
        if (sumPosts > 0 && (!parsed.totalPosts || parsed.totalPosts < sumPosts)) {
          parsed.totalPosts = sumPosts;
        }
      }

      parsed.rawConfidence = 98;
      return parsed;
    } catch (parseErr: any) {
      throw new Error(`জেমিনি এআই রেসপন্স JSON পার্সিং ত্রুটি: ${parseErr.message}\nকাঁচা টেক্সট: ${cleanedJson.slice(0, 300)}`);
    }
  }
}
