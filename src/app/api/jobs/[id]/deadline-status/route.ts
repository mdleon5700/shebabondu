import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import { DeadlineAlertsEngine } from '@/lib/deadlines/alerts';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const job = serverDB.getJobById(params.id);
    if (!job || job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
      return NextResponse.json({ error: 'বিজ্ঞপ্তি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    const deadlineData = serverDB.getDeadlineData(job.id);
    const evalResult = CentralDeadlineEngine.evaluateDeadline(job, deadlineData || undefined);
    const revisions = serverDB.getDeadlineRevisions(job.id);

    // Check if current user is subscribed to reminders
    const session = getServerSession(req);
    let isSubscribed = false;
    let userReminder = null;

    if (session) {
      isSubscribed = DeadlineAlertsEngine.isReminderSubscribed(session.candidateId, job.id);
      const reminders = DeadlineAlertsEngine.getUserReminders(session.candidateId);
      userReminder = reminders.find(r => r.jobId === job.id) || null;
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      jobTitle: job.title,
      organization: job.organization,
      evaluation: evalResult,
      revisions,
      subscription: {
        isSubscribed,
        reminder: userReminder
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
