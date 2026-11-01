import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { FeaturedManager } from '@/lib/feeds/featured';
import { FeaturedPlacement } from '@/lib/feeds/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const placements = serverDB.getFeaturedPlacements();
    const jobsMap = new Map(serverDB.getJobs().map(j => [j.id, j]));
    const now = new Date();

    const enriched = placements.map(p => {
      const job = jobsMap.get(p.jobId);
      const evaluatedStatus = FeaturedManager.evaluatePlacementStatus(p, now);
      return {
        ...p,
        status: evaluatedStatus,
        job: job ? {
          id: job.id,
          title: job.title,
          organization: job.organization,
          category: job.category,
          categoryLabel: job.categoryLabel,
          deadline: job.deadline,
          daysRemaining: job.daysRemaining,
          publishedDate: job.publishedDate
        } : null
      };
    });

    // Also collect jobs that have job.featured === true but no explicit placement record
    const explicitJobIds = new Set(placements.map(p => p.jobId));
    const legacyFeatured = serverDB.getJobs()
      .filter(j => j.featured === true && !explicitJobIds.has(j.id))
      .map(j => ({
        id: `legacy-${j.id}`,
        jobId: j.id,
        placement: 'homepage' as const,
        priority: 50,
        startAt: j.createdAt || new Date().toISOString(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE' as const,
        adminNotes: 'Legacy boolean featured flag',
        createdAt: j.createdAt || new Date().toISOString(),
        updatedAt: j.createdAt || new Date().toISOString(),
        isLegacy: true,
        job: {
          id: j.id,
          title: j.title,
          organization: j.organization,
          category: j.category,
          categoryLabel: j.categoryLabel,
          deadline: j.deadline,
          daysRemaining: j.daysRemaining,
          publishedDate: j.publishedDate
        }
      }));

    return NextResponse.json({
      success: true,
      total: enriched.length + legacyFeatured.length,
      placements: [...enriched, ...legacyFeatured]
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিচার্ড সার্কুলার তালিকা লোড করা যায়নি' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, placement = 'homepage', priority = 50, startAt, endAt, adminNotes } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'সার্কুলার আইডি (jobId) প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }

    const job = serverDB.getJobById(jobId);
    const placementData: Partial<FeaturedPlacement> = {
      jobId,
      placement,
      priority: Number(priority),
      startAt,
      endAt,
      adminNotes
    };

    const validation = FeaturedManager.validatePlacement(job, placementData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const now = new Date();
    const newPlacement: FeaturedPlacement = {
      id: 'feat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      jobId,
      placement: placement as any,
      priority: Number(priority),
      startAt,
      endAt,
      status: FeaturedManager.evaluatePlacementStatus({
        id: '',
        jobId,
        placement: placement as any,
        priority: Number(priority),
        startAt,
        endAt,
        status: 'ACTIVE',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }, now),
      adminNotes,
      createdBy: 'ADMIN-STEP07',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const saved = serverDB.saveFeaturedPlacement(newPlacement);

    // Audit log
    serverDB.addAuditLog({
      action: 'CREATE_FEATURED_PLACEMENT',
      adminId: 'ADMIN-STEP07',
      targetId: saved.id,
      targetType: 'JOB_CIRCULAR',
      notes: `Created featured placement for job ${job?.title} (Priority: ${priority})`,
      changes: {
        placement: { new: saved }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'সার্কুলারটি সফলভাবে ফিচার্ড তালিকায় যুক্ত করা হয়েছে',
      placement: { new: saved }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিচার্ড প্লেসমেন্ট তৈরিতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
