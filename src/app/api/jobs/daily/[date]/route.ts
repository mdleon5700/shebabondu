import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { BangladeshDateHelper } from '@/lib/feeds/timezone';
import { FeedQueryOptions } from '@/lib/feeds/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, props: { params: Promise<{ date: string }> }) {
  const params = await props.params;
  try {
    const rawDate = decodeURIComponent(params.date || '');
    const parsedIso = BangladeshDateHelper.parseToIsoDate(rawDate);

    if (!parsedIso) {
      return NextResponse.json(
        { success: false, error: 'তারিখের ফরম্যাট সঠিক নয় (প্রত্যাশিত: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const district = searchParams.get('district') || undefined;
    const education = searchParams.get('education') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);

    const jobs = serverDB.getPublicJobs();
    const placements = serverDB.getFeaturedPlacements();

    const options: FeedQueryOptions = {
      feedType: 'daily',
      date: parsedIso,
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

    // Calculate previous and next date for calendar navigation
    const currDate = new Date(`${parsedIso}T00:00:00Z`);
    const prevDateIso = new Date(currDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextDateIso = new Date(currDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return NextResponse.json({
      ...result,
      navigation: {
        currentDate: parsedIso,
        currentDateBn: BangladeshDateHelper.formatBengaliFullDate(parsedIso),
        prevDate: prevDateIso,
        prevDateBn: BangladeshDateHelper.formatBengaliFullDate(prevDateIso),
        nextDate: nextDateIso,
        nextDateBn: BangladeshDateHelper.formatBengaliFullDate(nextDateIso)
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'উক্ত তারিখের চাকরির তথ্য লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
