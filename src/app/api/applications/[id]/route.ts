import { NextResponse } from 'next/server';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { ApplicationRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<Promise<{ id: string }> | { id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const isAdmin = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));

  const resolvedParams = await context.params;
  const appId = (resolvedParams as any)?.id;

  if (!appId) {
    return NextResponse.json({ error: 'আবেদনের আইডি আবশ্যক।' }, { status: 400 });
  }

  const allApps = serverDB.getAllApplications();
  const app = allApps.find(a => a.id.toLowerCase() === appId.toLowerCase());

  if (!app) {
    return NextResponse.json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
  }

  // Access control: only admin or the application owner can view
  if (!isAdmin && (!session || session.candidateId !== app.candidateId)) {
    return NextResponse.json({ error: 'FORBIDDEN: অননুমোদিত অ্যাক্সেস।' }, { status: 403 });
  }

  return NextResponse.json({ success: true, application: app }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  });
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const isAdmin = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));

  const resolvedParams = await context.params;
  const appId = (resolvedParams as any)?.id;

  if (!appId) {
    return NextResponse.json({ error: 'আবেদনের আইডি আবশ্যক।' }, { status: 400 });
  }

  const allApps = serverDB.getAllApplications();
  const existingApp = allApps.find(a => a.id.toLowerCase() === appId.toLowerCase());

  if (!existingApp) {
    return NextResponse.json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
  }

  // Access control
  if (!isAdmin && (!session || session.candidateId !== existingApp.candidateId)) {
    return NextResponse.json({ error: 'FORBIDDEN: এই পরিবর্তনের জন্য অনুমতি নেই।' }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'অনুরোধের তথ্য সঠিক নয়।' }, { status: 400 });
  }

  const targetCandidateId = existingApp.candidateId || '';
  const newStatus = body.status || existingApp.status;
  const newVerification = body.verificationType || existingApp.verificationType;
  const notes = body.notes || (newStatus === 'completed' ? 'আবেদন সফলভাবে সম্পন্ন হয়েছে এবং স্লিপ প্রস্তুত।' : 'তথ্য হালনাগাদ করা হয়েছে।');

  const extra: Partial<ApplicationRequest> = {
    ...(body.applicantCopyPdfUrl !== undefined ? { applicantCopyPdfUrl: body.applicantCopyPdfUrl } : {}),
    ...(body.teleTalkTrackingId !== undefined ? { teleTalkTrackingId: body.teleTalkTrackingId } : {}),
    ...(body.teleTalkPassword !== undefined ? { teleTalkPassword: body.teleTalkPassword } : {}),
    ...(body.corporateTrackingId !== undefined ? { corporateTrackingId: body.corporateTrackingId } : {}),
    ...(body.submissionChannel !== undefined ? { submissionChannel: body.submissionChannel } : {}),
    ...(body.postName !== undefined ? { postName: body.postName } : {}),
    ...(body.candidatePhone !== undefined ? { candidatePhone: body.candidatePhone } : {}),
    ...(body.candidateName !== undefined ? { candidateName: body.candidateName } : {})
  };

  const historyItem = {
    status: newStatus,
    date: new Date().toISOString(),
    notes: notes,
    updatedBy: isAdmin ? `Admin (${session?.candidateId || 'ADMIN-SUPER'})` : 'Candidate'
  };
  extra.statusHistory = [historyItem];

  const updated = serverDB.updateAppStatus(
    targetCandidateId,
    existingApp.id,
    newStatus as ApplicationRequest['status'],
    newVerification as ApplicationRequest['verificationType'],
    notes,
    isAdmin,
    extra
  );

  if (!updated) {
    return NextResponse.json({ error: 'আবেদনের তথ্য আপডেট করা সম্ভব হয়নি।' }, { status: 500 });
  }

  // Automated Bi-Directional Notification & SMS Sync
  try {
    if (isAdmin && existingApp.status !== newStatus && targetCandidateId) {
      let statusLabelBn = newStatus;
      if (newStatus === 'completed') statusLabelBn = 'সফলভাবে সম্পন্ন (Completed)';
      else if (newStatus === 'processing') statusLabelBn = 'প্রসেসিং কিউতে চলমান (Processing)';
      else if (newStatus === 'rejected') statusLabelBn = 'বাতিল (Rejected)';
      else if (newStatus === 'submitted') statusLabelBn = 'দাখিলকৃত (Submitted)';

      // 1. Add notification for candidate
      serverDB.addCandidateNotification(targetCandidateId, {
        title: `আবেদন স্ট্যাটাস আপডেট: ${existingApp.jobTitle || 'চাকরি আবেদন'}`,
        message: `আপনার আবেদনটি (${existingApp.id}) এখন "${statusLabelBn}" অবস্থায় রয়েছে। ${notes ? 'মন্তব্য: ' + notes : ''}`,
        type: 'application',
        link: '/dashboard/applications'
      });

      // 2. Enqueue notification delivery for audit trail
      serverDB.enqueueNotificationDelivery({
        id: 'DELIV-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
        candidateId: targetCandidateId,
        jobId: existingApp.jobId || 'GENERAL',
        jobTitle: existingApp.jobTitle || 'চাকরি আবেদন',
        organization: existingApp.organization || 'চাকরি সেবা',
        type: 'system',
        channel: 'in_app',
        title: `আবেদন স্ট্যাটাস আপডেট: ${existingApp.id}`,
        message: `স্ট্যাটাস: ${statusLabelBn}। ${notes}`,
        link: '/dashboard/applications',
        status: 'DELIVERED',
        attemptCount: 1,
        createdAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        read: false,
        dedupeKey: `STATUS-CHG-${existingApp.id}-${newStatus}`
      });
    }

    if (isAdmin) {
      serverDB.recordAdminAudit({
        adminId: session?.candidateId || 'ADMIN-SUPER',
        action: 'status_change' as any,
        targetId: existingApp.id,
        targetType: 'order',
        changes: { status: { old: existingApp.status, new: newStatus } },
        notes: `Application ${existingApp.id} updated by Admin: ${notes}`
      });
    }

    revalidatePath('/dashboard/applications');
    revalidatePath('/dashboard');
    revalidatePath('/admin');
  } catch (syncErr) {
    console.warn('[Application Route PATCH] Sync error (non-fatal):', syncErr);
  }

  return NextResponse.json({
    success: true,
    message: 'আবেদনের তথ্য সফলভাবে সংরক্ষিত হয়েছে।',
    application: updated
  }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  });
}

export async function DELETE(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const isAdmin = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const resolvedParams = await context.params;
  const appId = (resolvedParams as any)?.id;

  if (!appId) {
    return NextResponse.json({ error: 'আবেদনের আইডি আবশ্যক।' }, { status: 400 });
  }

  const allApps = serverDB.getAllApplications();
  const existingApp = allApps.find(a => a.id.toLowerCase() === appId.toLowerCase());

  if (!existingApp) {
    return NextResponse.json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
  }

  serverDB.deleteApplication(existingApp.id);

  serverDB.recordAdminAudit({
    adminId: session?.candidateId || 'ADMIN-SUPER',
    action: 'delete' as any,
    targetId: existingApp.id,
    targetType: 'order',
    changes: { status: { old: existingApp.status, new: 'deleted' } },
    notes: `Admin deleted application ${existingApp.id}`
  });

  return NextResponse.json({ success: true, message: 'আবেদনটি মুছে ফেলা হয়েছে।' });
}
