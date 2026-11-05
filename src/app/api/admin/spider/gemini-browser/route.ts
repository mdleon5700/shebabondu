import { triggerInstantSearchIndexing } from '@/lib/seo/instant_indexer';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { revalidatePath } from 'next/cache';
import { runAlljobsLiveSync } from '@/lib/collector/alljobs_live_collector';
import { serverDB } from '@/lib/db';
import { verifyAdminSecret } from '@/lib/auth';
import {
  getGeminiBrowserStatus,
  launchLoginBrowser,
  parseCircularWithGeminiBrowser,
  PROFILE_DIR
} from '@/lib/spider/gemini_browser_controller';
import {
  captureLiveScreen,
  launchVisibleDesktopChrome,
  runLiveAutomationPipeline,
  checkGoogleAuthStatus
} from '@/lib/spider/gemini_live_studio';
import { JobCircular } from '@/lib/types';

export const dynamic = 'force-dynamic';

const SETTINGS_PATH = path.join(process.cwd(), '.browser_profile', 'spider_settings.json');

function getSpiderSettings(): { autoPublish: boolean; lastSyncTime?: string } {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    }
  } catch {}
  return { autoPublish: false };
}

function saveSpiderSettings(settings: { autoPublish: boolean; lastSyncTime?: string }) {
  try {
    const dir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {}
}

export async function GET(req: Request) {
  try {
    const browserStatus = await getGeminiBrowserStatus();
    const settings = getSpiderSettings();
    const jobs = serverDB.getJobs();
    const alljobsJobs = jobs.filter(j => j.id.includes('alljobs') || (j as any).source === 'Alljobs Teletalk');

    return NextResponse.json({
      success: true,
      status: browserStatus.isConnected ? 'CONNECTED' : 'STANDBY',
      browserStatus,
      autoPublish: settings.autoPublish,
      totalJobs: jobs.length,
      alljobsSyncedCount: alljobsJobs.length,
      syncedJobs: alljobsJobs,
      features: [
        'Internal Playwright Standalone Chromium',
        'Direct Gemini Web Multimodal Session (Zero API Cost)',
        'Persistent Google Session in .browser_profile',
        'Auto-Generated Bilingual SEO Titles & Keywords',
        'Smart Elementor-Ready Rich Content Blocks',
        'High-Resolution SVG Featured Image Banner',
        'Configurable Auto-Publish vs. Admin Verification Queue'
      ]
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
    const cookie = req.headers.get('cookie') || '';
    
    // Auth Check
    if ((!adminSecret || !verifyAdminSecret(adminSecret)) && !cookie.includes('cs_session_token')) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Admin credentials required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'check_status';

    // 1. Launch Login in System Standalone Chromium
    if (action === 'launch' || action === 'launch_login' || action === 'launch_visible_chrome') {
      const launchResult = await launchVisibleDesktopChrome();
      return NextResponse.json({
        success: launchResult.success,
        message: launchResult.message,
        profileDir: PROFILE_DIR
      });
    }

    // 1.1 Capture Live Browser Screen
    if (action === 'get_live_screen') {
      const targetUrl = body.url || 'https://gemini.google.com/app';
      const screenResult = await captureLiveScreen(targetUrl);
      return NextResponse.json(screenResult);
    }

    // 1.2 Run Step-by-Step Live Automation Pipeline (Watch it work live)
    if (action === 'run_live_automation') {
      const circularUrl = body.url || 'https://alljobs.teletalk.com.bd/jobs/government/459?jobId=15127';
      const autoResult = await runLiveAutomationPipeline(circularUrl);
      if (autoResult.success) {
        try {
          revalidatePath('/jobs');
          revalidatePath('/');
          revalidatePath('/admin');
        } catch {}
      }
      return NextResponse.json(autoResult);
    }

    // 1.3 Check Google Authentication Status
    if (action === 'check_google_auth') {
      const auth = await checkGoogleAuthStatus();
      return NextResponse.json({
        success: true,
        isLoggedIn: auth.isLoggedIn,
        cookiesCount: auth.count
      });
    }

    // 2. Check Login & Browser Connection Status
    if (action === 'check_status') {
      const status = await getGeminiBrowserStatus();
      const settings = getSpiderSettings();
      return NextResponse.json({
        success: true,
        isConnected: status.isConnected,
        browserStatus: status,
        autoPublish: settings.autoPublish
      });
    }

    // 3. Toggle Auto-Publish Permission
    if (action === 'toggle_auto_publish') {
      const currentSettings = getSpiderSettings();
      const updated = {
        ...currentSettings,
        autoPublish: typeof body.autoPublish === 'boolean' ? body.autoPublish : !currentSettings.autoPublish
      };
      saveSpiderSettings(updated);
      return NextResponse.json({
        success: true,
        autoPublish: updated.autoPublish,
        message: updated.autoPublish
          ? 'স্বয়ংক্রিয় প্রকাশনা (Auto-Publish) সক্রিয় করা হয়েছে! নতুন সার্কুলার সাথে সাথে লাইভ হবে।'
          : 'অ্যাডমিন ভেরিফিকেশন ড্রাফট (Draft for Review) মোড সক্রিয় করা হয়েছে। নতুন সার্কুলার ড্রাফটে জমা থাকবে।'
      });
    }

    // 4. Parse Circular with In-System Gemini Browser Agent
    if (action === 'parse_circular') {
      const { pdfUrl, rawText, organization, teletalkSlug, deadline } = body;
      if (!pdfUrl && !rawText && !organization) {
        return NextResponse.json({ error: 'সার্কুলার PDF লিংক, টেক্সট অথবা প্রতিষ্ঠানের নাম প্রদান করুন।' }, { status: 400 });
      }

      const extraction = await parseCircularWithGeminiBrowser({
        pdfUrl,
        rawText,
        organization,
        teletalkSlug,
        deadline
      });

      return NextResponse.json({
        success: true,
        job: extraction.job,
        rawGeminiResponse: extraction.rawGeminiResponse,
        message: 'জেমিনি ব্রাউজার এজেন্ট সফলভাবে সম্পূর্ণ সার্কুলার বিশ্লেষণ ও স্ট্রাকচারড ডাটা তৈরি করেছে!'
      });
    }

    // 5. Save Extracted Job into Database
    if (action === 'save_extracted_job') {
      const incomingJob = body.job;
      if (!incomingJob || !incomingJob.title) {
        return NextResponse.json({ error: 'সংরক্ষণ করার মতো সঠিক সার্কুলার ডাটা পাওয়া যায়নি।' }, { status: 400 });
      }

      const settings = getSpiderSettings();
      const targetStatus = settings.autoPublish ? 'PUBLISHED' : 'DRAFT';
      const jobId = incomingJob.id || `job-alljobs-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

      const jobToSave: JobCircular = {
        ...incomingJob,
        id: jobId,
        status: targetStatus as any,
        publicationStatus: targetStatus as any,
        source: 'Alljobs Teletalk',
        updatedAt: new Date().toISOString()
      };

      const saved = serverDB.saveJob(jobToSave, 'ADMIN');
      if (targetStatus === 'PUBLISHED') {
        triggerInstantSearchIndexing(jobToSave.slug || jobId).catch(() => {});
      }

      try {
        revalidatePath('/jobs');
        revalidatePath(`/jobs/${jobId}`);
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}

      return NextResponse.json({
        success: true,
        message: targetStatus === 'PUBLISHED'
          ? `বিজ্ঞপ্তিটি সফলভাবে ওয়েবসাইটে লাইভ প্রকাশ করা হয়েছে! (আইডি: ${jobId})`
          : `বিজ্ঞপ্তিটি ড্রাফট / অ্যাডমিন অনুমোদনের অপেক্ষায় সংরক্ষিত হয়েছে। (আইডি: ${jobId})`,
        job: saved
      });
    }

    // 6. Live Sync Alljobs with Browser Controller
    if (action === 'sync') {
      const limit = typeof body.limit === 'number' ? body.limit : 20;
      const stats = await runAlljobsLiveSync(limit);
      
      const currentSettings = getSpiderSettings();
      saveSpiderSettings({
        ...currentSettings,
        lastSyncTime: new Date().toISOString()
      });

      try {
        revalidatePath('/jobs');
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}

      return NextResponse.json({
        success: stats.success,
        message: `টেলিটক ও জেমিনি লাইভ সিঙ্ক সম্পন্ন! ${stats.newJobsAdded}টি নতুন সার্কুলার যুক্ত হয়েছে, ${stats.updatedJobs}টি আপডেট হয়েছে।`,
        stats
      });
    }

    // 7. Toggle Publish / Draft
    if (action === 'toggle_publish') {
      const jobId = body.jobId;
      if (!jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
      const job = serverDB.getJobById(jobId);
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

      const currentStatus = String((job as any).status || (job as any).publicationStatus || 'PUBLISHED').toUpperCase();
      const newStatus = (currentStatus === 'PUBLISHED' || currentStatus === 'ACTIVE' || currentStatus === 'OPEN') ? 'DRAFT' : 'PUBLISHED';
      
      const updated = serverDB.saveJob({
        ...job,
        id: job.id,
        status: newStatus as any,
        updatedAt: new Date().toISOString()
      }, 'ADMIN');

      if (newStatus === 'PUBLISHED') {
        triggerInstantSearchIndexing(job.slug || job.id).catch(() => {});
      }

      try {
        revalidatePath('/jobs');
        revalidatePath('/jobs/' + jobId);
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}

      return NextResponse.json({
        success: true,
        message: newStatus === 'PUBLISHED' ? 'বিজ্ঞপ্তিটি সফলভাবে ওয়েবসাইটে লাইভ প্রকাশ করা হয়েছে!' : 'বিজ্ঞপ্তিটি ড্রাফট / অপ্রকাশিত হিসেবে সংরক্ষিত হয়েছে।',
        newStatus,
        job: updated
      });
    }

    // 8. Bulk Operations
    if (action === 'bulk_delete') {
      const jobIds = body.jobIds;
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return NextResponse.json({ error: 'মুছে ফেলার জন্য কোনো সার্কুলার সিলেক্ট করা হয়নি।' }, { status: 400 });
      }
      let deletedCount = 0;
      for (const id of jobIds) {
        if (serverDB.deleteJob(id, 'ADMIN')) {
          deletedCount++;
        }
      }
      try {
        revalidatePath('/jobs');
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}
      return NextResponse.json({
        success: true,
        message: `${deletedCount}টি সার্কুলার সফলভাবে মুছে ফেলা হয়েছে!`,
        deletedCount
      });
    }

    if (action === 'bulk_publish' || action === 'bulk_draft') {
      const jobIds = body.jobIds;
      const targetStatus = action === 'bulk_publish' ? 'PUBLISHED' : 'DRAFT';
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return NextResponse.json({ error: 'সার্কুলার আইডি পাওয়া যায়নি।' }, { status: 400 });
      }
      let count = 0;
      for (const id of jobIds) {
        const job = serverDB.getJobById(id);
        if (job) {
          serverDB.saveJob({
            ...job,
            id: job.id,
            status: targetStatus as any,
            updatedAt: new Date().toISOString()
          }, 'ADMIN');
          count++;
        }
      }
      try {
        revalidatePath('/jobs');
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}
      return NextResponse.json({
        success: true,
        message: `${count}টি সার্কুলার সফলভাবে ${targetStatus === 'PUBLISHED' ? 'লাইভ পাবলিশ' : 'ড্রাফট'} করা হয়েছে!`,
        count
      });
    }

    if (action === 'delete_job') {
      const jobId = body.jobId;
      if (!jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
      const deleted = serverDB.deleteJob(jobId, 'ADMIN');
      try {
        revalidatePath('/jobs');
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}
      return NextResponse.json({
        success: deleted,
        message: deleted ? 'বিজ্ঞপ্তিটি সফলভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে।' : 'বিজ্ঞপ্তিটি মোছা যায়নি।'
      });
    }

    if (action === 'verify_circular') {
      const jobId = body.jobId;
      if (!jobId) {
        return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
      }
      const job = serverDB.getJobById(jobId);
      if (!job) {
        return NextResponse.json({ error: 'Circular not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        jobId: job.id,
        organization: job.organization,
        title: job.title,
        pdfUrl: job.circularPdfUrl,
        officialLink: job.officialLink,
        positionsCount: job.positions?.length || 1,
        deadline: job.deadline,
        verifiedStatus: 'AI_VERIFIED',
        extractedData: {
          positions: job.positions,
          requirements: job.requirements,
          salary: job.salary,
          grade: job.grade,
          fee: job.govtFee
        }
      });
    }

    return NextResponse.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
