import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { getScrapeLockStatus } from '@/lib/collector';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  let limit = 50;
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 200) {
        limit = parsed;
      }
    }
  } catch {
    // default limit
  }

  const runs = serverDB.getSpiderRuns(limit);
  const lockStatus = getScrapeLockStatus();

  return NextResponse.json({
    success: true,
    total: runs.length,
    lockStatus,
    runs
  });
}
