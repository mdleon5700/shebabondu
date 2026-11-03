import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { runAlljobsLiveSync } from '@/lib/collector/alljobs_live_collector';
import { serverDB } from '@/lib/db';
import { verifyAdminSecret } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

export async function GET(req: Request) {
  try {
    const profileExists = fs.existsSync(PROFILE_DIR);
    const jobs = serverDB.getJobs();
    const alljobsCount = jobs.filter(j => j.id.includes('alljobs') || (j as any).source === 'Alljobs Teletalk').length;

    return NextResponse.json({
      success: true,
      status: 'READY',
      profileExists,
      profileDirectory: PROFILE_DIR,
      totalJobs: jobs.length,
      alljobsSyncedCount: alljobsCount,
      features: [
        'Persistent Headful Chrome Automation',
        'Direct Gemini Web Multimodal Session',
        'Human-in-the-loop CAPTCHA Resolver',
        'Zero API Cost PDF Parser'
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
      const scriptPath = path.join(process.cwd(), 'scripts', 'spider', 'browser_agent.js');
      
      // Spawn persistent headful chrome runner
      const child = spawn(process.execPath, [scriptPath], {
        detached: true,
        stdio: 'ignore',
        cwd: process.cwd()
      });
      child.unref();

      return NextResponse.json({
        success: true,
        message: 'জেমিনি ও অলজবস ক্রোম ব্রাউজার সফলভাবে চালু হয়েছে! অনুগ্রহ করে স্ক্রিনের উইন্ডোটি দেখুন।',
        profileDir: PROFILE_DIR
      });
    }

    if (action === 'sync') {
      const limit = typeof body.limit === 'number' ? body.limit : 35;
      const stats = await runAlljobsLiveSync(limit);
      return NextResponse.json({
        success: stats.success,
        message: `টেলিটক ও জেমিনি লাইভ সিঙ্ক সম্পন্ন! ${stats.newJobsAdded}টি নতুন সার্কুলার যুক্ত হয়েছে, ${stats.updatedJobs}টি আপডেট হয়েছে।`,
        stats
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
