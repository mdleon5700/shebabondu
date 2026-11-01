/**
 * Centralized Gemini AI Provider for Job Verification
 * Handles server-side API communication, token estimation, quote validation, and fault-tolerant fallbacks.
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { 
  buildVerificationSystemInstruction, 
  buildVerificationUserPrompt, 
  PROMPT_REGISTRY 
} from './prompts';
import { GeminiVerificationResult, AIUsageLog } from './types';

export function getGeminiApiKey(): string | null {
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

export function getActiveGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.5-flash';
}

/**
 * Validates that quotes in AI supportedClaims actually exist in the source document
 */
export function validateEvidenceQuotes(claims: string[], sourceText: string): {
  verifiedClaims: string[];
  unsupportedClaims: string[];
} {
  const verifiedClaims: string[] = [];
  const unsupportedClaims: string[] = [];
  const normalizedSource = (sourceText || '').toLowerCase().replace(/\s+/g, ' ');

  for (const claim of claims) {
    // Extract quoted strings if any (e.g. 'স্মারক নং...')
    const quoteMatches = claim.match(/['"“‘](.+?)['"”’]/);
    if (quoteMatches && quoteMatches[1].length > 4) {
      const quote = quoteMatches[1].toLowerCase().replace(/\s+/g, ' ');
      if (normalizedSource.includes(quote)) {
        verifiedClaims.push(claim);
      } else {
        unsupportedClaims.push(`${claim} [উদ্ধৃতি সোর্সে সরাসরি মেলেনি]`);
      }
    } else {
      // General assertion without explicit quotes: accepted as supported claim
      verifiedClaims.push(claim);
    }
  }

  return { verifiedClaims, unsupportedClaims };
}

export async function runGeminiVerification(params: {
  draftId?: string;
  draftTitle: string;
  draftOrg: string;
  sourceUrl: string;
  vacancies: number;
  deadline: string;
  salary: string;
  govtFee: number;
  minEducation: string;
  sourceEvidenceText: string;
  pdfEvidenceText?: string;
  refNo?: string;
}): Promise<{
  result: GeminiVerificationResult;
  usageLog: AIUsageLog;
}> {
  const startTime = Date.now();
  const apiKey = getGeminiApiKey();
  const model = getActiveGeminiModel();
  const promptId = PROMPT_REGISTRY.VERIFICATION_PROMPT.id;
  const promptVersion = PROMPT_REGISTRY.VERIFICATION_PROMPT.version;
  const logId = `ai_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Default fallback usage log
  const usageLog: AIUsageLog = {
    id: logId,
    draftId: params.draftId,
    promptId,
    promptVersion,
    model,
    requestTimestamp: new Date().toISOString(),
    durationMs: 0,
    status: 'failed',
    promptTokens: 0,
    candidateTokens: 0,
    totalTokens: 0,
    estimatedCostBdt: 0
  };

  if (!apiKey) {
    const duration = Date.now() - startTime;
    usageLog.durationMs = duration;
    usageLog.errorSummary = 'GEMINI_API_KEY অনুপস্থিত বা কনফিগার করা হয়নি';
    return {
      result: {
        success: false,
        modelUsed: model,
        promptVersion,
        durationMs: duration,
        bengaliExplanation: 'AI যাচাইয়ের জন্য প্রয়োজনীয় API Key পাওয়া যায়নি। ডিটারমিনিস্টিক ও সোর্সভিত্তিক তথ্যাবলি সংরক্ষিত রয়েছে।',
        detectedIssues: ['AI ইন্টেলিজেন্স নিষ্ক্রিয়: API Key অনুপস্থিত'],
        supportedClaims: [],
        unsupportedClaims: ['AI যাচাই সম্পন্ন করা সম্ভব হয়নি'],
        aiConfidence: 0.5,
        error: 'API Key missing'
      },
      usageLog
    };
  }

  const systemInstruction = buildVerificationSystemInstruction();
  const userPrompt = buildVerificationUserPrompt(params);

  const postData = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.1, // Low temperature for high factual precision
      maxOutputTokens: 2500,
      responseMimeType: 'application/json'
    }
  });

  return new Promise((resolve) => {
    let retries = 0;
    const maxRetries = 1;

    const executeRequest = () => {
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
          const duration = Date.now() - startTime;
          usageLog.durationMs = duration;

          if (res.statusCode && res.statusCode >= 400) {
            // Handle rate limit retry
            if ((res.statusCode === 429 || res.statusCode === 503) && retries < maxRetries) {
              retries++;
              setTimeout(executeRequest, 1500);
              return;
            }

            usageLog.status = res.statusCode === 429 ? 'rate_limited' : 'failed';
            usageLog.errorSummary = `HTTP ${res.statusCode}: ${body.slice(0, 200)}`;

            return resolve({
              result: {
                success: false,
                modelUsed: model,
                promptVersion,
                durationMs: duration,
                bengaliExplanation: `Gemini API থেকে ত্রুটি এসেছে (HTTP ${res.statusCode})। ডিটারমিনিস্টিক ফিল্ড তথ্য বহাল রাখা হয়েছে।`,
                detectedIssues: [`API HTTP ${res.statusCode} ত্রুটি`],
                supportedClaims: [],
                unsupportedClaims: ['API প্রতিক্রিয়ায় তথ্য পাওয়া যায়নি'],
                aiConfidence: 0.5,
                error: `HTTP ${res.statusCode}`
              },
              usageLog
            });
          }

          try {
            const responseJson = JSON.parse(body);
            const rawText = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;
            const usageMeta = responseJson?.usageMetadata;

            const promptTokens = usageMeta?.promptTokenCount || Math.ceil(userPrompt.length / 4);
            const candidateTokens = usageMeta?.candidatesTokenCount || (rawText ? Math.ceil(rawText.length / 4) : 0);
            const totalTokens = promptTokens + candidateTokens;
            // Estimated cost: 1 BDT per ~15,000 tokens on Flash model
            const estimatedCostBdt = Number(((totalTokens / 15000) * 1.0).toFixed(4));

            usageLog.status = 'success';
            usageLog.promptTokens = promptTokens;
            usageLog.candidateTokens = candidateTokens;
            usageLog.totalTokens = totalTokens;
            usageLog.estimatedCostBdt = estimatedCostBdt;

            if (!rawText) {
              throw new Error('Empty text candidate returned from Gemini');
            }

            const parsed = JSON.parse(rawText);

            // Cross-validate evidence quotes against actual source text
            const combinedSourceText = `${params.sourceEvidenceText} ${params.pdfEvidenceText || ''}`;
            const { verifiedClaims, unsupportedClaims } = validateEvidenceQuotes(
              Array.isArray(parsed.supportedClaims) ? parsed.supportedClaims : [],
              combinedSourceText
            );

            const allUnsupported = [
              ...(Array.isArray(parsed.unsupportedClaims) ? parsed.unsupportedClaims : []),
              ...unsupportedClaims
            ];

            const result: GeminiVerificationResult = {
              success: true,
              modelUsed: model,
              promptVersion,
              durationMs: duration,
              bengaliExplanation: parsed.bengaliExplanation || 'বিজ্ঞপ্তির সকল তথ্যাবলি সফলতার সাথে সোর্স টেক্সট দ্বারা সমর্থিত হয়েছে।',
              detectedIssues: Array.isArray(parsed.detectedIssues) ? parsed.detectedIssues : [],
              supportedClaims: verifiedClaims,
              unsupportedClaims: allUnsupported,
              eligibilityAnalysis: parsed.eligibilityAnalysis,
              aiConfidence: typeof parsed.aiConfidence === 'number' ? Math.max(0, Math.min(1, parsed.aiConfidence)) : 0.85,
              rawResponseText: rawText,
              tokenUsage: {
                promptTokens,
                candidateTokens,
                totalTokens
              }
            };

            resolve({ result, usageLog });
          } catch (err: any) {
            usageLog.status = 'failed';
            usageLog.errorSummary = `JSON Parse Error: ${err.message}`;

            resolve({
              result: {
                success: false,
                modelUsed: model,
                promptVersion,
                durationMs: duration,
                bengaliExplanation: 'Gemini থেকে প্রাপ্ত ফলাফল পার্সিংয়ে ব্যতিক্রম ঘটেছে। ডিটারমিনিস্টিক ফলাফল প্রদর্শিত হচ্ছে।',
                detectedIssues: ['AI পার্সিং ত্রুটি ঘটেছে'],
                supportedClaims: [],
                unsupportedClaims: ['পার্সিং ব্যর্থতা'],
                aiConfidence: 0.5,
                error: err.message
              },
              usageLog
            });
          }
        });
      });

      req.on('error', (err) => {
        const duration = Date.now() - startTime;
        usageLog.durationMs = duration;
        usageLog.status = 'failed';
        usageLog.errorSummary = err.message;

        resolve({
          result: {
            success: false,
            modelUsed: model,
            promptVersion,
            durationMs: duration,
            bengaliExplanation: 'Gemini সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।',
            detectedIssues: ['নেটওয়ার্ক সংযোগ ত্রুটি'],
            supportedClaims: [],
            unsupportedClaims: [],
            aiConfidence: 0.5,
            error: err.message
          },
          usageLog
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const duration = Date.now() - startTime;
        usageLog.durationMs = duration;
        usageLog.status = 'timeout';
        usageLog.errorSummary = 'Request timeout (>25s)';

        resolve({
          result: {
            success: false,
            modelUsed: model,
            promptVersion,
            durationMs: duration,
            bengaliExplanation: 'Gemini সার্ভারে অনুরোধ সময়োত্তীর্ণ হয়েছে (Timeout > 25s)।',
            detectedIssues: ['AI প্রক্রিয়ায় সময়সীমা শেষ'],
            supportedClaims: [],
            unsupportedClaims: [],
            aiConfidence: 0.5,
            error: 'Timeout'
          },
          usageLog
        });
      });

      req.write(postData);
      req.end();
    };

    executeRequest();
  });
}

/**
 * Probes the Gemini API to verify health, quota status, and connectivity
 */
export async function checkGeminiProviderHealth(): Promise<{
  healthy: boolean;
  model: string;
  latencyMs: number;
  message: string;
}> {
  const startTime = Date.now();
  const apiKey = getGeminiApiKey();
  const model = getActiveGeminiModel();

  if (!apiKey) {
    return {
      healthy: false,
      model,
      latencyMs: 0,
      message: 'GEMINI_API_KEY কনফিগার করা নেই'
    };
  }

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Respond with JSON {"health":"ok"}' }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 8000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const latencyMs = Date.now() - startTime;
        if (res.statusCode && res.statusCode === 200) {
          resolve({
            healthy: true,
            model,
            latencyMs,
            message: `Gemini API সক্রিয় এবং প্রস্তুত (${latencyMs}ms)।`
          });
        } else {
          resolve({
            healthy: false,
            model,
            latencyMs,
            message: `Gemini API সংযোগে ত্রুটি: HTTP ${res.statusCode}`
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        healthy: false,
        model,
        latencyMs: Date.now() - startTime,
        message: `সংযোগ ব্যর্থতা: ${err.message}`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        healthy: false,
        model,
        latencyMs: Date.now() - startTime,
        message: 'সময়োত্তীর্ণ (>8s)'
      });
    });

    req.write(postData);
    req.end();
  });
}


export async function callGeminiApi(params: {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  model?: string;
}): Promise<{ success: boolean; text?: string; modelUsed: string; error?: string }> {
  const apiKey = getGeminiApiKey();
  const model = params.model || getActiveGeminiModel();

  if (!apiKey) {
    return { success: false, modelUsed: model, error: 'GEMINI_API_KEY অনুপস্থিত' };
  }

  const postData = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
    generationConfig: {
      temperature: params.temperature ?? 0.2,
      maxOutputTokens: params.maxOutputTokens ?? 3000,
      responseMimeType: params.responseMimeType || 'application/json'
    }
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/' + model + ':generateContent?key=' + apiKey,
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
        if (res.statusCode && res.statusCode >= 400) {
          return resolve({ success: false, modelUsed: model, error: 'HTTP ' + res.statusCode + ': ' + body.slice(0, 150) });
        }
        try {
          const parsed = JSON.parse(body);
          const rawText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            resolve({ success: true, text: rawText, modelUsed: model });
          } else {
            resolve({ success: false, modelUsed: model, error: 'ফলাফল খালি ছিল' });
          }
        } catch (e: any) {
          resolve({ success: false, modelUsed: model, error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, modelUsed: model, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, modelUsed: model, error: 'রিকোয়েস্ট সময়োত্তীর্ণ (>25s)' });
    });

    req.write(postData);
    req.end();
  });
}
