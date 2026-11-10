import { NextResponse } from 'next/server';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const hasAccess = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));
  if (!hasAccess) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;

  const allTickets = serverDB.getContactMessages();
  const filteredTickets = status && status !== 'all' ? allTickets.filter(t => t.status === status) : allTickets;

  const counts = {
    total: allTickets.length,
    new: allTickets.filter(t => t.status === 'new').length,
    in_progress: allTickets.filter(t => t.status === 'in_progress').length,
    replied: allTickets.filter(t => t.status === 'replied').length,
    closed: allTickets.filter(t => t.status === 'closed').length
  };

  return NextResponse.json({
    success: true,
    counts,
    tickets: filteredTickets
  });
}

export async function PATCH(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const hasAccess = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));
  if (!hasAccess) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status, replyNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'টিকেট আইডি এবং স্ট্যাটাস আবশ্যক।' }, { status: 400 });
    }

    const result = serverDB.updateContactMessageStatus(id, status, replyNotes);
    if (!result.success) {
      return NextResponse.json({ error: 'টিকেটটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'টিকেটের স্ট্যাটাস ও নোট সফলভাবে আপডেট করা হয়েছে।',
      ticket: result.message
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'টিকেট আপডেট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

