import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const allLogs = serverDB.getAdminAuditLogs();
  const sourceLogs = allLogs.filter(l => l.targetType === 'source');
  return NextResponse.json({ success: true, logs: sourceLogs });
}
