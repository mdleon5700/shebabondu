import { NextResponse } from 'next/server';
import { runAlljobsLiveSync } from '@/lib/collector/alljobs_live_collector';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
    const session = getServerSession(req);
    const hasAdminAccess = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = typeof body.limit === 'number' ? body.limit : 10;

    const stats = await runAlljobsLiveSync(limit);
    return NextResponse.json({
      success: stats.success,
      message: `টেলিটক অলজবস লাইভ সিঙ্ক সফল! ${stats.newJobsAdded}টি নতুন চাকরি যুক্ত হয়েছে, ${stats.updatedJobs}টি আপডেট হয়েছে।`,
      stats
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'READY',
    collector: 'Teletalk Alljobs Live Sync Engine v2.0',
    description: 'Call POST to trigger real-time circular collection from alljobs.teletalk.com.bd'
  });
}

