import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { BangladeshDateHelper } from '@/lib/feeds/timezone';
import { FeedQueryOptions } from '@/lib/feeds/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { date: string } }
) {
  try {
    const rawDate = params.date;
    const parsedIso = BangladeshDateHelper.parseToIsoDate(rawDate);

    if (!parsedIso) {
      return NextResponse.json(
        { success: false, error: 'তারিখের ফরম্যাট সঠিক নয় (প্রত্যাশিত: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const district = searchParams.get('district') || undefined;
    const education = searchParams.get('education') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);

    const jobs = serverDB.getPublicJobs();
    const placements = serverDB.getFeaturedPlacements();

    const options: FeedQueryOptions = {
      feedType: 'daily',
      date: parsedIso,
      category,
      district,
      education,
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
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'উক্ত তারিখের চাকরির তথ্য লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
