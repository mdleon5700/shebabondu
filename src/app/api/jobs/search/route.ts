export const dynamic = 'force-dynamic';
export const revalidate = 0;
﻿import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { SearchEngine } from '@/lib/search/engine';
import { SearchParams } from '@/lib/search/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params: SearchParams = {
      q: searchParams.get('q') || searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      orgType: searchParams.get('orgType') || undefined,
      jobType: searchParams.get('jobType') || undefined,
      division: searchParams.get('division') || undefined,
      district: searchParams.get('district') || undefined,
      education: searchParams.get('education') || undefined,
      experience: searchParams.get('experience') || undefined,
      salaryType: searchParams.get('salaryType') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      datePosted: (searchParams.get('datePosted') as any) || undefined,
      org: searchParams.get('org') || undefined,
      sort: (searchParams.get('sort') as any) || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10)
    };

    const allJobs = serverDB.getJobs();
    const categories = serverDB.getCategories();

    const result = SearchEngine.search(allJobs, categories, params);

    // Asynchronously log search analytics event
    if (params.q || (params.category && params.category !== 'all')) {
      try {
        serverDB.logSearchEvent({
          query: params.q || '',
          filters: {
            category: params.category,
            division: params.division,
            education: params.education,
            jobType: params.jobType,
            status: params.status
          },
          resultsCount: result.total
        });
      } catch (logErr) {
        console.error('Failed to log search event:', logErr);
      }
    }

    return NextResponse.json({
      success: true,
      ...result
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
