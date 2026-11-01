import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import { DeadlineMonitoringEngine } from '@/lib/deadlines/monitoring';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status'); // closing_today, closing_soon, expired, cancelled, suspended
  const search = (searchParams.get('search') || '').toLowerCase();

  const allJobs = serverDB.getJobs();
  const list: any[] = [];

  for (const job of allJobs) {
    if (job.id.startsWith('draft-')) continue;

    const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
    const revisions = serverDB.getDeadlineRevisions(job.id);

    // Apply status filter
    if (statusFilter === 'closing_today' && !evalResult.isClosingToday) continue;
    if (statusFilter === 'closing_soon' && (!evalResult.isClosingSoon || evalResult.isClosingToday)) continue;
    if (statusFilter === 'expired' && !evalResult.isClosed) continue;
    if (statusFilter === 'cancelled' && evalResult.status !== 'CANCELLED') continue;
    if (statusFilter === 'suspended' && evalResult.status !== 'SUSPENDED') continue;

    if (search) {
      const match = job.title.toLowerCase().includes(search) || job.organization.toLowerCase().includes(search);
      if (!match) continue;
    }

    list.push({
      id: job.id,
      title: job.title,
      organization: job.organization,
      category: job.category,
      categoryLabel: job.categoryLabel,
      deadlineOriginal: job.deadline,
      publishedDate: job.publishedDate,
      evaluation: evalResult,
      revisionCount: revisions.length,
      lastRevision: revisions[0] || null
    });
  }

  const stats = DeadlineMonitoringEngine.getMonitoringStats();

  return NextResponse.json({
    success: true,
    stats,
    total: list.length,
    jobs: list
  });
}
