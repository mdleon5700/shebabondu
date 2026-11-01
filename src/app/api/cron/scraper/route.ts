import { NextResponse } from 'next/server';
import { scrapeAllSources, isScrapingActive, getScrapeLockStatus } from '@/lib/collector';

function verifyCronAuth(req: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) return false;

  // 1. Header: x-cron-secret
  const headerSecret = req.headers.get('x-cron-secret');
  if (headerSecret && headerSecret === configuredSecret) {
    return true;
  }

  // 2. Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken === configuredSecret) {
      return true;
    }
  }

  // 3. Query string token (?token=...)
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (token && token === configuredSecret) {
      return true;
    }
  } catch {
    // ignore parse error
  }

  return false;
}

export async function GET(req: Request) {
  // Enforce CRON authentication
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ 
      error: 'UNAUTHORIZED: Valid cron secret or Bearer token is required to trigger automated collection.' 
    }, { status: 401 });
  }

  // Enforce concurrency lock
  if (isScrapingActive()) {
    const lock = getScrapeLockStatus();
    return NextResponse.json({
      error: 'CONFLICT: Another collection cycle is currently running.',
      lockStatus: lock
    }, { status: 409 });
  }

  try {
    const report = await scrapeAllSources('SYSTEM_CRON', 'cron');
    return NextResponse.json({
      success: true,
      message: 'Automated multi-source job collection completed successfully.',
      report
    });
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message || 'Scheduled scraping failed.' 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
