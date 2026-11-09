import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { FeedQueryOptions } from '@/lib/feeds/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;
    const category = serverDB.getCategoryBySlug(slug);

    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district') || undefined;
    const education = searchParams.get('education') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const sortBy = (searchParams.get('sortBy') as any) || 'latest';

    const jobs = serverDB.getPublicJobs();
    const placements = serverDB.getFeaturedPlacements();

    const options: FeedQueryOptions = {
      feedType: 'category',
      category: category ? category.id : slug,
      district,
      education,
      status,
      page,
      limit,
      sortBy
    };

    const result = JobFeedEngine.getFeed(jobs, options, placements);

    return NextResponse.json({
      ...result,
      categoryInfo: category ? {
        id: category.id,
        name_bn: category.name_bn,
        name_en: category.name_en,
        slug: category.slug,
        icon: category.icon
      } : null
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ক্যাটাগরিভিত্তিক সর্বশেষ চাকরির তথ্য লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
