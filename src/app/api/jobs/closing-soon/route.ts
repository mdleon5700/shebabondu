import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const maxDays = Number(searchParams.get('days') || '3');
    const category = searchParams.get('category');
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || '20')));

    const allJobs = serverDB.getPublicJobs();
    const eligibleJobs: any[] = [];

    for (const job of allJobs) {
      // Strict Zero-Leakage: Exclude drafts & unpublished
      if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
        continue;
      }
      if (category && job.category !== category) {
        continue;
      }

      const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
      if (evalResult.isClosed || evalResult.status === 'CANCELLED' || evalResult.status === 'SUSPENDED') {
        continue;
      }

      if (evalResult.daysRemaining >= 0 && evalResult.daysRemaining <= maxDays) {
        eligibleJobs.push({
          ...job,
          deadlineStatus: evalResult.status,
          deadlineLabelBn: evalResult.labelBn,
          daysRemaining: evalResult.daysRemaining,
          hoursRemaining: evalResult.hoursRemaining,
          minutesRemaining: evalResult.minutesRemaining,
          formattedCountdownBn: evalResult.formattedCountdownBn,
          badgeColor: evalResult.badgeColor
        });
      }
    }

    // Sort by daysRemaining ascending (urgency first)
    eligibleJobs.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const total = eligibleJobs.length;
    const startIndex = (page - 1) * limit;
    const paginated = eligibleJobs.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      jobs: paginated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
