import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { revalidatePath } from 'next/cache';
import { runAlljobsLiveSync } from '@/lib/collector/alljobs_live_collector';
import { serverDB } from '@/lib/db';
import { verifyAdminSecret } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

export async function GET(req: Request) {
  try {
    const profileExists = fs.existsSync(PROFILE_DIR);
    const jobs = serverDB.getJobs();
    const alljobsJobs = jobs.filter(j => j.id.includes('alljobs') || (j as any).source === 'Alljobs Teletalk');

    return NextResponse.json({
      success: true,
      status: 'READY',
      profileExists,
      profileDirectory: PROFILE_DIR,
      totalJobs: jobs.length,
      alljobsSyncedCount: alljobsJobs.length,
      syncedJobs: alljobsJobs,
      features: [
        'Persistent Headful Chrome Automation',
        'Direct Gemini Web Multimodal Session',
        'Human-in-the-loop CAPTCHA Resolver',
        'Zero API Cost PDF Parser',
        'Direct Edit, Update & Instant Publish Controls'
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
    const action = body.action || 'launch';

    if (action === 'launch') {
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      const profileDir = PROFILE_DIR;
      if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true });
      }

      if (fs.existsSync(chromePath)) {
        // Launch real Google Chrome desktop window with dedicated persistent profile
        const child = spawn(chromePath, [
          `--user-data-dir=${profileDir}`,
          '--no-first-run',
          '--no-default-browser-check',
          'https://gemini.google.com',
          'https://alljobs.teletalk.com.bd'
        ], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();

        return NextResponse.json({
          success: true,
          message: 'গুগল ক্রোম ব্রাউজার সফলভাবে চালু হয়েছে! স্ক্রিনে প্রদর্শিত ব্রাউজারে জেমিনিতে আপনার গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করে নিন। সেশনটি স্থায়ীভাবে সংরক্ষিত থাকবে।',
          profileDir: PROFILE_DIR
        });
      } else {
        // Fallback to playwright script
        const scriptPath = path.join(process.cwd(), 'scripts', 'spider', 'browser_agent.js');
        const child = spawn(process.execPath, [scriptPath], {
          detached: true,
          stdio: 'ignore',
          cwd: process.cwd()
        });
        child.unref();

        return NextResponse.json({
          success: true,
          message: 'ব্রাউজার এজেন্ট চালু হয়েছে।',
          profileDir: PROFILE_DIR
        });
      }
    }

    if (action === 'sync') {
      const limit = typeof body.limit === 'number' ? body.limit : 35;
      const stats = await runAlljobsLiveSync(limit);
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
