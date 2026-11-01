import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { DeadlineAlertsEngine } from '@/lib/deadlines/alerts';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Login required' }, { status: 401 });
  }

  const reminders = DeadlineAlertsEngine.getUserReminders(session.candidateId);
  return NextResponse.json({ success: true, reminders });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Login required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobId, leadDays, channels } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const defaultLeadDays = Array.isArray(leadDays) && leadDays.length > 0 ? leadDays : [3, 1, 0];
    const defaultChannels = Array.isArray(channels) && channels.length > 0 ? channels : ['in_app'];

    const saved = DeadlineAlertsEngine.subscribeReminder(
      session.candidateId,
      jobId,
      defaultLeadDays,
      defaultChannels
    );

    return NextResponse.json({
      success: true,
      message: 'ডেডলাইন রিমাইন্ডার সফলভাবে সক্রিয় করা হয়েছে',
      reminder: saved
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Login required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'jobId query parameter required' }, { status: 400 });
  }

  const deleted = DeadlineAlertsEngine.unsubscribeReminder(session.candidateId, jobId);
  return NextResponse.json({
    success: deleted,
    message: deleted ? 'রিমাইন্ডার বন্ধ করা হয়েছে' : 'রিমাইন্ডার পাওয়া যায়নি'
  });
}
