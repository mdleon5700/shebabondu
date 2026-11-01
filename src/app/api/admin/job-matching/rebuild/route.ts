import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const timestamp = new Date().toISOString();
  serverDB.addAuditLog({
    adminId: session.candidateId,
    action: 'REBUILD_MATCHING_INDEX',
    targetId: 'smart_matching_engine',
    targetType: 'system',
    changes: { rebuild: { new: timestamp } },
    notes: 'Admin triggered manual recalculation of smart job matching index'
  });

  return NextResponse.json({
    success: true,
    message: 'Matching index rebuild scheduled successfully',
    triggeredAt: timestamp
  });
}
