import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { FeedQueryOptions } from '@/lib/feeds/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const district = searchParams.get('district') || undefined;
    const education = searchParams.get('education') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'priority';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);

    const jobs = serverDB.getPublicJobs();
    const placements = serverDB.getFeaturedPlacements();

    const options: FeedQueryOptions = {
      feedType: 'featured',
      q,
      category,
      district,
      education,
      status,
      sortBy,
      page,
      limit
    };

    const result = JobFeedEngine.getFeed(jobs, options, placements);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিচার্ড চাকরির তালিকা লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
