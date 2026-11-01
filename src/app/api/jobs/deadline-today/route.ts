import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import { BangladeshDateHelper } from '@/lib/feeds/timezone';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '50')));

    const allJobs = serverDB.getJobs();
    const todayJobs: any[] = [];

    for (const job of allJobs) {
      if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
        continue;
      }
      if (category && job.category !== category) {
        continue;
      }

      const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
      if (evalResult.isClosingToday && !evalResult.isClosed) {
        todayJobs.push({
          ...job,
          deadlineStatus: evalResult.status,
          deadlineLabelBn: evalResult.labelBn,
          daysRemaining: 0,
          hoursRemaining: evalResult.hoursRemaining,
          minutesRemaining: evalResult.minutesRemaining,
          formattedCountdownBn: evalResult.formattedCountdownBn,
          badgeColor: evalResult.badgeColor
        });
      }
    }

    const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();

    return NextResponse.json({
      success: true,
      date: todayInfo.isoDate,
      dateBn: todayInfo.dateBn,
      total: todayJobs.length,
      jobs: todayJobs.slice(0, limit)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
