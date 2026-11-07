import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { AdminGovernanceRbac } from '@/lib/governance';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const settings = serverDB.getPlatformSettings();
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve platform settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const auth = AdminGovernanceRbac.authorizeRequest(req, 'system.settings.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (body.general) {
      if (body.general.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.general.supportEmail)) {
        return NextResponse.json({ error: 'অকার্যকর সাপোর্ট ইমেইল ঠিকানা' }, { status: 400 });
      }
      if (body.general.supportPhone && String(body.general.supportPhone).replace(/[^\d০-৯]/g, '').length < 10) {
        return NextResponse.json({ error: 'অকার্যকর সাপোর্ট ফোন নম্বর' }, { status: 400 });
      }
    }

    if (body.operational) {
      if (body.operational.standardServiceFee !== undefined && Number(body.operational.standardServiceFee) < 0) {
        return NextResponse.json({ error: 'সার্ভিস ফি নেতিবাচক হতে পারে না' }, { status: 400 });
      }
    }

    const adminId = session.candidateId || 'ADMIN-SUPER';
    const updated = serverDB.updatePlatformSettings(body, adminId);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
    } catch (e) {
      console.warn('Settings revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'প্ল্যাটফর্মের কেন্দ্রীয় সেটিংস সফলভাবে সংরক্ষিত হয়েছে।',
      settings: updated
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'সেটিংস সংরক্ষণে ত্রুটি' },
      { status: 500 }
    );
  }
}
