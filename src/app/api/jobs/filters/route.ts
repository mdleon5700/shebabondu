import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { SearchEngine } from '@/lib/search/engine';

export async function GET() {
  try {
    const allJobs = serverDB.getPublicJobs();
    const categories = serverDB.getCategories();

    // Call SearchEngine with empty params to compute full facets across all eligible jobs
    const result = SearchEngine.search(allJobs, categories, { limit: 1 });

    return NextResponse.json({
      success: true,
      totalEligibleJobs: result.total,
      facets: result.facets
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
