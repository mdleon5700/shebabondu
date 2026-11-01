import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { SearchAnalyticsManager } from '@/lib/search/analytics';

export async function GET(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
    }

    const events = serverDB.getSearchAnalytics();
    const summary = SearchAnalyticsManager.summarize(events);

    return NextResponse.json({
      success: true,
      analytics: summary
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
