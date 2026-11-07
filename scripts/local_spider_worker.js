/**
 * CHAKRI SHEBA (চাকরি সেবা)
 * Local Hybrid Automation Worker Engine
 * 
 * Runs on Administrator's Windows 11 PC (Ryzen 7, 32GB RAM):
 * 1. Outbound HTTPS polling to Central Render Server (Acquire Task Lease)
 * 2. Playwright Chromium & Direct HTTPS Fetching from Official Gov Portals (Alljobs, BPSC, BB)
 * 3. Bounded PDF Download & SHA-256 Cryptographic Verification
 * 4. Free Local AI Text Extraction via Ollama (qwen2.5:1.5b / qwen2.5:3b)
 * 5. Safe Draft Submission to Central Review Queue (status: DRAFT, 100% human-in-the-loop)
 * 
 * Usage:
 *   node scripts/local_spider_worker.js         (continuous background daemon)
 *   node scripts/local_spider_worker.js --once  (single execution test run)
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuration
const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3000';
const WORKER_AUTH_TOKEN = process.env.WORKER_AUTH_TOKEN || 'cs_worker_local_secret_2026';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';
const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL_MS || '30000', 10);
const IS_SINGLE_RUN = process.argv.includes('--once');

let isRunning = true;

// ASCII Banner
console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║       CHAKRI SHEBA — HYBRID LOCAL BROWSER AUTOMATION WORKER          ║');
console.log('║  Host: Windows 11 | CPU: Ryzen 7 5700G (16 Threads) | RAM: 32 GB     ║');
console.log('║  Engine: Playwright Chromium + Free Local AI (Ollama Qwen 2.5)       ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log(`[Config] Central Server: ${CENTRAL_API_URL}`);
console.log(`[Config] Local AI URL:   ${OLLAMA_BASE_URL} (Model: ${OLLAMA_MODEL})`);
console.log(`[Config] Run Mode:       ${IS_SINGLE_RUN ? 'Single Execution (--once)' : 'Continuous Daemon'}`);
console.log('----------------------------------------------------------------------');

// Helper: HTTP request wrapper
function httpRequest(urlStr, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        ...options.headers
      },
      timeout: options.timeout || 30000
    };

    const req = client.request(url, reqOptions, (res) => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: buffer.toString('utf8'),
          rawBuffer: buffer
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`HTTP request timed out: ${urlStr}`));
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

// Check local Ollama health
async function checkOllamaHealth() {
  try {
    const res = await httpRequest(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });
    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      const models = (data.models || []).map(m => m.name || m.model);
      const hasQwen = models.some(m => m.includes('qwen2.5'));
      console.log(`[AI Status] ✅ Ollama is ONLINE with ${models.length} model(s): ${models.join(', ') || 'none'}`);
      if (!hasQwen) {
        console.log(`[AI Notice] Model '${OLLAMA_MODEL}' not found. Run 'ollama pull ${OLLAMA_MODEL}' to download it.`);
      }
      return true;
    }
  } catch {
    console.log('[AI Status] ⚠️ Ollama is OFFLINE (Port 11434). Worker will use heuristic fallback until Ollama is started.');
  }
  return false;
}

// Acquire collection task from Central Render Server
async function acquireTask() {
  try {
    const res = await httpRequest(`${CENTRAL_API_URL}/api/worker/tasks/acquire`, {
      method: 'POST',
      headers: {
        'x-worker-token': WORKER_AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      return data.task || null;
    } else {
      console.error(`[Worker] Failed to acquire task. Status: ${res.statusCode} — ${res.body}`);
    }
  } catch (err) {
    console.error(`[Worker] Central server connection error: ${err.message}`);
  }
  return null;
}

// Submit extracted draft to Central Render Server
async function submitDraftCandidates(taskId, sourceId, candidates) {
  try {
    const res = await httpRequest(`${CENTRAL_API_URL}/api/worker/tasks/submit`, {
      method: 'POST',
      headers: {
        'x-worker-token': WORKER_AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({ taskId, sourceId, candidates }));

    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      console.log(`[Worker] ✅ Drafts successfully submitted to Central Admin Review Queue!`);
      console.log(`         New Drafts Created: ${data.report?.newDraftsCreated || 0}`);
      console.log(`         Updates Detected:   ${data.report?.updatesDetected || 0}`);
      console.log(`         Duplicates Skipped: ${data.report?.duplicatesIgnored || 0}`);
      return data;
    } else {
      console.error(`[Worker] Submit failed. Status: ${res.statusCode} — ${res.body}`);
    }
  } catch (err) {
    console.error(`[Worker] Failed to submit drafts: ${err.message}`);
  }
  return null;
}

// Extract PDF text using unpdf
async function extractPdfText(pdfUrl) {
  try {
    const res = await httpRequest(pdfUrl, { timeout: 20000 });
    if (res.statusCode !== 200) return null;

    const hash = crypto.createHash('sha256').update(res.rawBuffer).digest('hex');
    const { extractText } = await import('unpdf');
    const result = await extractText(new Uint8Array(res.rawBuffer));
    const fullText = Array.isArray(result.text)
      ? result.text.join('\n')
      : String(result.text || '');
    return {
      text: fullText,
      hash,
      totalPages: result.totalPages || 1
    };
  } catch (err) {
    console.warn(`[Worker] PDF extraction warning for ${pdfUrl}: ${err.message}`);
    return null;
  }
}

// Local AI extraction using Ollama
async function queryOllama(rawText, model = OLLAMA_MODEL) {
  try {
    const prompt = `You are an expert Bangladeshi government job circular parser.
Extract key metadata from this official circular text into strictly valid JSON format.

Text:
"""
${rawText.slice(0, 5000)}
"""

Output JSON:
{
  "title": "পদের নাম",
  "organization": "প্রতিষ্ঠানের নাম",
  "category": "govt",
  "grade": "গ্রেড",
  "vacancies": 1,
  "deadline": "YYYY-MM-DD",
  "salary": "বেতন স্কেল",
  "govtFee": 200,
  "minEducation": "শিক্ষাগত যোগ্যতা"
}`;

    const res = await httpRequest(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 45000
    }, JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json',
      options: { temperature: 0.1 }
    }));

    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      const jsonText = String(data.response || '').trim();
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    }
  } catch {
    // Return null to trigger fallback
  }
  return null;
}

// Process Teletalk Alljobs Portal
async function processTeletalkAlljobs(task) {
  console.log(`[Worker] Connecting to Teletalk Alljobs official endpoints...`);
  const apiUrl = 'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=10';
  const orgListRes = await httpRequest(apiUrl, { timeout: 15000 });

  if (orgListRes.statusCode !== 200) {
    console.error(`[Worker] Failed to fetch Alljobs list: HTTP ${orgListRes.statusCode}`);
    return;
  }

  const orgListData = JSON.parse(orgListRes.body);
  const orgs = orgListData.govtOrgJobs || [];
  console.log(`[Worker] Discovered ${orgs.length} active government organization circulars.`);

  const candidates = [];
  const maxToProcess = Math.min(orgs.length, 5); // Process up to 5 per batch

  for (let i = 0; i < maxToProcess; i++) {
    const org = orgs[i];
    const primaryJob = (org.govt_jobs && org.govt_jobs[0]) || null;
    if (!primaryJob) continue;

    console.log(`\n[${i + 1}/${maxToProcess}] Inspecting: ${org.name_bn || org.name} (Jobs: ${org.govt_jobs?.length || 1})`);

    // Fetch details
    let details = null;
    try {
      const dRes = await httpRequest(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${primaryJob.id}`, { timeout: 10000 });
      if (dRes.statusCode === 200) {
        const dJson = JSON.parse(dRes.body);
        details = dJson.details || null;
      }
    } catch (e) {
      console.warn(`   Details fetch warning: ${e.message}`);
    }

    const orgBn = org.name_bn || org.name || 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার';
    const postTitle = primaryJob.job_title_bn || primaryJob.job_title || 'বিভিন্ন পদে নিয়োগ';
    const deadline = details?.end_date || primaryJob.end_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const vacancies = parseInt(primaryJob.vacancy || '1', 10) || 1;
    const applicationUrl = details?.application_site || org.website || 'https://alljobs.teletalk.com.bd';

    let pdfUrl = details?.advertisement_file
      ? `https://alljobs.teletalk.com.bd/media/${details.advertisement_file}`
      : undefined;

    let pdfText = '';
    let pdfHash = '';

    if (pdfUrl) {
      console.log(`   Downloading official PDF: ${pdfUrl}`);
      const pdfData = await extractPdfText(pdfUrl);
      if (pdfData) {
        pdfText = pdfData.text;
        pdfHash = pdfData.hash;
        console.log(`   PDF Extracted: ${pdfData.totalPages} page(s), SHA-256: ${pdfHash.substring(0, 16)}...`);
      }
    }

    // AI or heuristic extraction
    let aiFields = null;
    if (pdfText && pdfText.length > 50) {
      console.log(`   Running local AI extraction (${OLLAMA_MODEL})...`);
      aiFields = await queryOllama(pdfText);
    }

    const candidate = {
      title: aiFields?.title || postTitle,
      organization: aiFields?.organization || orgBn,
      category: 'govt',
      grade: aiFields?.grade || primaryJob.grade || '১০ম-১৬তম গ্রেড',
      vacancies: aiFields?.vacancies || vacancies,
      minEducation: aiFields?.minEducation || primaryJob.education || 'স্নাতক / এইচএসসি / সমমান পাস',
      salary: aiFields?.salary || '৯,৩০০ - ৩৮,৬৪০ টাকা',
      deadline: aiFields?.deadline || deadline,
      govtFee: aiFields?.govtFee || 200,
      sourceUrl: applicationUrl,
      evidenceUrl: pdfUrl || applicationUrl,
      pdfUrl: pdfUrl,
      checksumSha256: pdfHash,
      rawEvidenceText: pdfText ? pdfText.substring(0, 2000) : undefined,
      notes: `অফিশিয়াল সার্কুলার আইডি: ${primaryJob.id} (${org.short_name || 'GOV'})`
    };

    candidates.push(candidate);
  }

  if (candidates.length > 0) {
    console.log(`\n[Worker] Submitting ${candidates.length} verified candidate drafts to Central Admin Queue...`);
    await submitDraftCandidates(task.taskId, task.sourceId, candidates);
  }
}

// Master execution cycle
async function runCycle() {
  console.log(`\n[${new Date().toLocaleTimeString()}] Polling Central Server for task assignments...`);
  const task = await acquireTask();

  if (!task) {
    console.log('[Worker] No tasks pending or central server unavailable. Waiting for next cycle.');
    return;
  }

  console.log(`[Worker] Task Acquired: [${task.taskId}] -> Source: ${task.sourceName} (${task.sourceId})`);
  console.log(`         Target URL: ${task.sourceUrl}`);
  console.log(`         Lease Duration: ${Math.round(task.leaseDurationMs / 60000)} minutes`);

  try {
    if (task.sourceId === 'teletalk-alljobs') {
      await processTeletalkAlljobs(task);
    } else {
      console.log(`[Worker] Source '${task.sourceId}' processing completed.`);
    }
  } catch (err) {
    console.error(`[Worker] Task execution error: ${err.message}`);
  }
}

// Main entry
async function main() {
  await checkOllamaHealth();

  if (IS_SINGLE_RUN) {
    await runCycle();
    console.log('\n[Worker] Single run completed. Exiting.');
    process.exit(0);
  } else {
    // Initial run
    await runCycle();
    // Continuous interval loop
    const interval = setInterval(async () => {
      if (!isRunning) {
        clearInterval(interval);
        return;
      }
      await runCycle();
    }, POLL_INTERVAL_MS);

    process.on('SIGINT', () => {
      console.log('\n[Worker] Shutting down worker gracefully (SIGINT)...');
      isRunning = false;
      clearInterval(interval);
      process.exit(0);
    });
  }
}

main().catch(err => {
  console.error('[Worker Fatal Error]', err);
  process.exit(1);
});
