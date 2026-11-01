import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { SearchAnalyticsManager } from '@/lib/search/analytics';

export async function GET(req: Request) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
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
