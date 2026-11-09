import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { FeaturedManager } from '@/lib/feeds/featured';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  try {
    const id = params.id;
    const placement = serverDB.getFeaturedPlacementById(id);

    if (!placement) {
      return NextResponse.json(
        { success: false, error: 'ফিচার্ড প্লেসমেন্ট রেকর্ডটি খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updated = {
      ...placement,
      ...body,
      updatedAt: new Date().toISOString()
    };

    if (body.startAt && body.endAt) {
      const job = serverDB.getJobById(updated.jobId);
      const validation = FeaturedManager.validatePlacement(job, updated);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, errors: validation.errors },
          { status: 400 }
        );
      }
    }

    // Re-evaluate status if not explicitly cancelled
    if (body.status !== 'CANCELLED') {
      updated.status = FeaturedManager.evaluatePlacementStatus(updated);
    }

    const saved = serverDB.saveFeaturedPlacement(updated);

    serverDB.addAuditLog({
      action: 'UPDATE_FEATURED_PLACEMENT',
      adminId: 'ADMIN-STEP07',
      targetId: id,
      targetType: 'JOB_CIRCULAR',
      notes: `Updated featured placement ${id}`,
      changes: {
        placement: { old: placement, new: saved }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'ফিচার্ড প্লেসমেন্ট সফলভাবে হালনাগাদ করা হয়েছে',
      placement: saved
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিচার্ড প্লেসমেন্ট আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  try {
    const id = params.id;

    // Check if it is a legacy id
    if (id.startsWith('legacy-')) {
      const jobId = id.replace('legacy-', '');
      const job = serverDB.getJobById(jobId);
      if (job) {
        job.featured = false;
        serverDB.saveJob(job);
      }
      return NextResponse.json({
        success: true,
        message: 'লেগ্যাসি ফিচার্ড স্ট্যাটাস সফলভাবে অপসারণ করা হয়েছে'
      });
    }

    const placement = serverDB.getFeaturedPlacementById(id);
    if (!placement) {
      return NextResponse.json(
        { success: false, error: 'ফিচার্ড প্লেসমেন্ট পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    serverDB.deleteFeaturedPlacement(id);

    serverDB.addAuditLog({
      action: 'DELETE_FEATURED_PLACEMENT',
      adminId: 'ADMIN-STEP07',
      targetId: id,
      targetType: 'JOB_CIRCULAR',
      notes: `Deleted featured placement for job ${placement.jobId}`,
      changes: {
        placement: { old: placement }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'ফিচার্ড প্লেসমেন্টটি স্থায়ীভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিচার্ড প্লেসমেন্ট মুছে ফেলতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
