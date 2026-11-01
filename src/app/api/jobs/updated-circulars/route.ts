import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || '20')));

    const allJobs = serverDB.getPublicJobs();
    const updatedList: any[] = [];

    for (const job of allJobs) {
      if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
        continue;
      }

      const revisions = serverDB.getDeadlineRevisions(job.id);
      const evalResult = CentralDeadlineEngine.evaluateDeadline(job);

      if (evalResult.status === 'EXTENDED' || revisions.length > 0 || (job.deadline && (job.deadline.includes('বৃদ্ধি') || job.deadline.includes('বর্ধিত')))) {
        updatedList.push({
          ...job,
          deadlineStatus: evalResult.status,
          deadlineLabelBn: evalResult.labelBn,
          daysRemaining: evalResult.daysRemaining,
          formattedCountdownBn: evalResult.formattedCountdownBn,
          badgeColor: evalResult.badgeColor,
          revisionCount: revisions.length,
          lastRevision: revisions[0] || null
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: updatedList.length,
      jobs: updatedList.slice(0, limit)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
