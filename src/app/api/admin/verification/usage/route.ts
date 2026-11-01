import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { checkGeminiProviderHealth, getActiveGeminiModel } from '@/lib/verification';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const summary = serverDB.getAiUsageSummary();
  const logs = serverDB.getAiUsageLogs(50);
  const health = await checkGeminiProviderHealth();

  return NextResponse.json({
    success: true,
    model: getActiveGeminiModel(),
    health,
    summary,
    recentLogs: logs
  });
}
