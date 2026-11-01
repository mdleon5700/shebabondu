import { NextResponse } from 'next/server';
import { computePublishingAnalytics } from '@/lib/publishing/analytics';

export async function GET() {
  try {
    const summary = computePublishingAnalytics();
    return NextResponse.json({
      success: true,
      analytics: summary
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
