import { NextResponse } from 'next/server';
import { createPublishingQueueItem, enqueuePublishingItem } from '@/lib/publishing/queue';
import { bstToUtcIso, utcToBstFormatted } from '@/lib/publishing/scheduler';
import { executeStatusTransition } from '@/lib/publishing/status_machine';
import { serverDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, draftId, revisionId, scheduledTimeBst, priority, adminId, note } = body;

    if (!jobId || !revisionId || !scheduledTimeBst) {
      return NextResponse.json({ error: 'jobId, revisionId, and scheduledTimeBst are required.' }, { status: 400 });
    }

    const utcTimeIso = bstToUtcIso(scheduledTimeBst);
    const bstFormatted = utcToBstFormatted(utcTimeIso);

    const queueItem = createPublishingQueueItem({
      jobId,
      draftId,
      revisionId,
      action: 'SCHEDULED_PUBLISH',
      targetPublishTimeUtc: utcTimeIso,
      targetPublishTimeBst: bstFormatted,
      createdBy: adminId || 'ADMIN',
      priority: priority || 5
    });

    const enqueueResult = enqueuePublishingItem(queueItem);

    // Update job status to SCHEDULED
    const job = serverDB.getJobById(jobId);
    if (job) {
      const currentStatus = ((job as any).publicationStatus || 'APPROVED');
      const transition = executeStatusTransition(currentStatus, 'SCHEDULED', adminId || 'ADMIN', note || `শিডিউল প্রকাশনা: ${bstFormatted}`);
      (job as any).publicationStatus = 'SCHEDULED';
      (job as any).scheduledPublishAt = utcTimeIso;
      (job as any).statusHistory = (job as any).statusHistory || [];
      if (transition.transition) {
        (job as any).statusHistory.push(transition.transition);
      }
      serverDB.saveJob(job, adminId || 'ADMIN');
    }

    return NextResponse.json({
      success: true,
      queueItem: enqueueResult.item,
      isDuplicate: enqueueResult.isDuplicate,
      scheduledTimeBst: bstFormatted,
      scheduledTimeUtc: utcTimeIso
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
