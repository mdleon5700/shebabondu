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

  const allReports = serverDB.getJobReports();
  const filteredReports = status && status !== 'all' ? allReports.filter(r => r.status === status) : allReports;

  const counts = {
    total: allReports.length,
    pending: allReports.filter(r => r.status === 'pending').length,
    investigating: allReports.filter(r => r.status === 'investigating').length,
    resolved: allReports.filter(r => r.status === 'resolved').length,
    dismissed: allReports.filter(r => r.status === 'dismissed').length
  };

  return NextResponse.json({
    success: true,
    counts,
    reports: filteredReports
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
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'রিপোর্ট আইডি এবং স্ট্যাটাস আবশ্যক।' }, { status: 400 });
    }

    const result = serverDB.updateJobReportStatus(id, status, adminNotes);
    if (!result.success || !result.report) {
      return NextResponse.json({ error: 'রিপোর্ট খুঁজে পাওয়া যায়নি বা আপডেট করা সম্ভব হয়নি।' }, { status: 404 });
    }

    // Record admin audit log
    serverDB.addAuditLog({
      id: 'AUDIT-REP-' + Date.now().toString(36),
      adminId: (session as any)?.adminPin || session?.candidateId || 'ADMIN-SUPER',
      action: 'job_report_reviewed',
      targetId: id,
      targetType: 'circular',
      changes: {
        status: { old: '', new: status },
        adminNotes: { old: '', new: adminNotes || '' }
      },
      notes: `Job report ${id} status updated to ${status}`,
      timestamp: new Date().toISOString()
    } as any);

    return NextResponse.json({
      success: true,
      message: 'রিপোর্টের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
      report: result.report
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'স্ট্যাটাস আপডেটে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
