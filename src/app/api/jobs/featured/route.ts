import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { FeedQueryOptions } from '@/lib/feeds/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);

    const jobs = serverDB.getJobs();
    const placements = serverDB.getFeaturedPlacements();

    const options: FeedQueryOptions = {
      feedType: 'featured',
      category,
      page,
      limit,
      sortBy: 'priority'
    };

    const result = JobFeedEngine.getFeed(jobs, options, placements);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিচার্ড চাকরির তালিকা লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
