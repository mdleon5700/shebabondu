import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { SearchSuggestionsEngine } from '@/lib/search/suggestions';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const jobs = serverDB.getPublicJobs();
    const categories = serverDB.getCategories();

    const suggestions = SearchSuggestionsEngine.getSuggestions(query, jobs, categories);

    return NextResponse.json({
      success: true,
      query,
      suggestions
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
