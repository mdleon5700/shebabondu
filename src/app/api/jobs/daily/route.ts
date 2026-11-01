import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { BangladeshDateHelper } from '@/lib/feeds/timezone';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '30', 10);

    const jobs = serverDB.getPublicJobs();
    const archives = JobFeedEngine.getDailyArchiveDates(jobs, daysBack);
    const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();

    return NextResponse.json({
      success: true,
      today: todayInfo,
      totalDates: archives.length,
      datesWithJobsCount: archives.filter(a => a.hasJobs).length,
      archives
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ডেইলি জবস আর্কাইভ লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
