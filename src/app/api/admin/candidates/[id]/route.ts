import { NextResponse } from 'next/server';
import { getServerSession, verifyAdminSecret, hashPassword } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: Request, context: RouteContext) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: 'প্রার্থীর আইডি আবশ্যক।' }, { status: 400 });
  }

  const candidate = serverDB.getCandidateById(id) || serverDB.getCandidateByIdentifier(id);
  if (!candidate) {
    return NextResponse.json({ error: 'প্রার্থী পাওয়া যায়নি।' }, { status: 404 });
  }

  const { passwordHash, ...safeCandidate } = candidate as any;
  const documents = serverDB.getDocuments(candidate.id);
  const applications = serverDB.getApplications(candidate.id);
  const savedJobs = serverDB.getSavedJobs(candidate.id);
  const allWalletTransactions = serverDB.getWalletTransactions();
  const transactions = allWalletTransactions.filter(
    (t: any) => t.candidateId === candidate.id || t.userId === candidate.id
  );

  return NextResponse.json(
    {
      success: true,
      candidate: safeCandidate,
      documents,
      applications,
      savedJobs,
      transactions,
      notifications: []
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function PATCH(req: Request, context: RouteContext) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: 'প্রার্থীর আইডি আবশ্যক।' }, { status: 400 });
  }

  const candidate = serverDB.getCandidateById(id) || serverDB.getCandidateByIdentifier(id);
  if (!candidate) {
    return NextResponse.json({ error: 'প্রার্থী পাওয়া যায়নি।' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const adminId = session?.candidateId || 'ADMIN-SUPER';

    // Handle password reset if requested
    const updates: Record<string, any> = { ...body };
    if (body.newPassword) {
      updates.passwordHash = hashPassword(body.newPassword);
      delete updates.newPassword;
    }

    // Handle admin notes if an admin note was added
    if (body.adminNote && typeof body.adminNote === 'string') {
      const existingNotes = Array.isArray((candidate as any).adminNotes) ? (candidate as any).adminNotes : [];
      const noteEntry = {
        id: 'NOTE-' + Date.now(),
        text: body.adminNote.trim(),
        author: adminId,
        authorName: 'অ্যাডমিন',
        timestamp: new Date().toISOString()
      };
      updates.adminNotes = [noteEntry, ...existingNotes];
      delete updates.adminNote;
    }

    const updated = serverDB.updateCandidate(candidate.id, updates, adminId, body.reason || 'Admin workspace edit');
    if (!updated) {
      return NextResponse.json({ error: 'প্রার্থীর তথ্য আপডেট করা সম্ভব হয়নি।' }, { status: 500 });
    }

    const { passwordHash, ...safeUpdated } = updated as any;
    return NextResponse.json({
      success: true,
      message: 'প্রার্থীর তথ্য সফলভাবে সংরক্ষিত হয়েছে।',
      candidate: safeUpdated
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'প্রার্থীর তথ্য আপডেট ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { id } = context.params;
  const candidate = serverDB.getCandidateById(id) || serverDB.getCandidateByIdentifier(id);
  if (!candidate) {
    return NextResponse.json({ error: 'প্রার্থী পাওয়া যায়নি।' }, { status: 404 });
  }

  const adminId = session?.candidateId || 'ADMIN-SUPER';
  const deleted = serverDB.deleteCandidate(candidate.id, adminId, 'Admin deleted candidate');

  if (!deleted) {
    return NextResponse.json({ error: 'প্রার্থী মুছে ফেলা সম্ভব হয়নি।' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'প্রার্থী সফলভাবে মুছে ফেলা হয়েছে।' });
}
