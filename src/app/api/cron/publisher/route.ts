import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import { NextResponse } from 'next/server';
import { processDueScheduledPublications } from '@/lib/publishing/scheduler';
import { expireJob } from '@/lib/publishing/lifecycle';
import { serverDB } from '@/lib/db';

function verifyCronAuth(req: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) return false;

  const headerSecret = req.headers.get('x-cron-secret');
  if (headerSecret && headerSecret === configuredSecret) return true;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    if (authHeader.substring(7).trim() === configuredSecret) return true;
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (token && token === configuredSecret) return true;
  } catch {}

  return false;
}

export async function GET(req: Request) {
  return handleCronRun(req);
}

export async function POST(req: Request) {
  return handleCronRun(req);
}

async function handleCronRun(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({
      error: 'UNAUTHORIZED: Valid cron secret or Bearer token is required.'
    }, { status: 401 });
  }

  const startTime = Date.now();

  // 1. Process Due Scheduled Publications
  const scheduleResult = processDueScheduledPublications();

  // 2. Auto-Expire Overdue Active Jobs
  const allJobs = serverDB.getAllJobs ? serverDB.getAllJobs() : serverDB.getJobs();
  const now = new Date();
  let autoExpiredCount = 0;

  allJobs.forEach(job => {
    const pubStatus = (job as any).publicationStatus || 'PUBLISHED';
    if (pubStatus === 'PUBLISHED' || pubStatus === 'PUBLISHED_WITH_WARNINGS') {
      if (CentralDeadlineEngine.evaluateDeadline(job).isClosed || (job.deadline && (job.deadline.includes('সমাপ্ত') || job.deadline.includes('শেষ')))) {
        expireJob(job.id, 'CRON_AUTO_EXPIRE');
        autoExpiredCount++;
      }
    }
  });

  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    scheduledProcessed: scheduleResult.processedCount,
    scheduledResults: scheduleResult.results,
    autoExpiredCount,
    durationMs,
    executedAt: new Date().toISOString()
  });
}
