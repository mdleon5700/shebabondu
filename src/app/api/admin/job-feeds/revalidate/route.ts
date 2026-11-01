import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { FeaturedManager } from '@/lib/feeds/featured';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const placements = serverDB.getFeaturedPlacements();
    const now = new Date();
    let updatedCount = 0;

    for (const p of placements) {
      if (p.status === 'CANCELLED') continue;
      const currentEval = FeaturedManager.evaluatePlacementStatus(p, now);
      if (currentEval !== p.status) {
        p.status = currentEval;
        serverDB.saveFeaturedPlacement(p);
        updatedCount++;
      }
    }

    serverDB.addAuditLog({
      action: 'REVALIDATE_FEEDS',
      adminId: 'ADMIN-STEP07',
      targetId: 'feeds-cache',
      targetType: 'SYSTEM_SETTINGS',
      notes: `Revalidated job feeds and updated ${updatedCount} placement statuses`,
      changes: {
        revalidation: { new: { updatedCount, revalidatedAt: now.toISOString() } }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'সকল ফিড ক্যাশ ও ফিচার্ড প্লেসমেন্ট সফলভাবে পুনর্মূল্যায়ন করা হয়েছে',
      updatedPlacementsCount: updatedCount,
      revalidatedAt: now.toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিড পুনর্মূল্যায়নে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
