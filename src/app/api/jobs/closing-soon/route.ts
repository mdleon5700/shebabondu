import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { FeedQueryOptions } from '@/lib/feeds/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const district = searchParams.get('district') || undefined;
    const education = searchParams.get('education') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const q = searchParams.get('q') || searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const sortBy = (searchParams.get('sortBy') as any) || 'deadline_soon';

    const jobs = serverDB.getPublicJobs();
    const placements = serverDB.getFeaturedPlacements();

    const options: FeedQueryOptions = {
      feedType: 'closing_soon',
      category,
      district,
      education,
      status,
      q,
      page,
      limit,
      sortBy
    };

    const result = JobFeedEngine.getFeed(jobs, options, placements);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'জরুরি ডেডলাইনের চাকরির তালিকা লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
