import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Login required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get('type');

  let notifications = serverDB.getCandidateNotifications(session.candidateId);
  if (typeFilter && typeFilter !== 'all') {
    notifications = notifications.filter(n => n.type === typeFilter);
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return NextResponse.json({
    success: true,
    total: notifications.length,
    unreadCount,
    notifications
  });
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Login required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (body.all) {
      serverDB.markAllCandidateNotificationsRead(session.candidateId);
      return NextResponse.json({ success: true, message: 'সকল নোটিফিকেশন পড়া হিসেবে চিহ্নিত হয়েছে' });
    }

    if (!body.id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const updated = serverDB.markCandidateNotificationRead(session.candidateId, body.id);
    return NextResponse.json({ success: updated });
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
  const notifId = searchParams.get('id');
  if (!notifId) {
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  }

  const deleted = serverDB.deleteCandidateNotification(session.candidateId, notifId);
  return NextResponse.json({ success: deleted });
}
