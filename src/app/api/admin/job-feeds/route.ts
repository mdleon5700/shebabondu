import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  try {
    const jobs = serverDB.getJobs();
    const placements = serverDB.getFeaturedPlacements();
    const config = serverDB.getFeedConfig();
    const metrics = JobFeedEngine.getFeedMetrics(jobs, placements);

    return NextResponse.json({
      success: true,
      metrics,
      config,
      totalPlacements: placements.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিড মেমোরি ও পরিসংখ্যান লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
