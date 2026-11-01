import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { validateSafeUrl } from '@/lib/collector/security';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const source = serverDB.getJobSourceById(params.id);
  if (!source) {
    return NextResponse.json({ error: `NOT_FOUND: সোর্স "${params.id}" খুঁজে পাওয়া যায়নি` }, { status: 404 });
  }

  const testUrl = source.listingUrl || source.sourceUrl;
  const securityCheck = validateSafeUrl(testUrl);
  if (!securityCheck.safe) {
    return NextResponse.json({
      success: false,
      error: `নিরাপত্তা সমস্যা: ${securityCheck.reason}`,
      reachable: false,
      url: testUrl
    }, { status: 400 });
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba-Crawler/2.0 (+https://chakrisheba.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || 'unknown';
    const isOk = response.ok;

    // Update source health status based on probe
    serverDB.updateJobSource(source.id, {
      healthStatus: isOk ? 'healthy' : 'degraded',
      lastFetchedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, session.candidateId);

    return NextResponse.json({
      success: true,
      reachable: isOk,
      httpStatus: response.status,
      statusText: response.statusText,
      responseTimeMs,
      contentType,
      url: testUrl,
      message: isOk ? 'কানেকশন টেস্ট সফল এবং পেজ সক্রিয় রয়েছে' : `সোর্স পেজ অপ্রাপ্য বা ত্রুটিপূর্ণ রেসপন্স কোড: HTTP ${response.status}`
    });
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');

    serverDB.updateJobSource(source.id, {
      healthStatus: 'failing',
      lastFetchedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, session.candidateId);

    return NextResponse.json({
      success: false,
      reachable: false,
      responseTimeMs,
      url: testUrl,
      error: isTimeout ? 'কানেকশন টাইমআউট হয়েছে (Timeout > 6s)' : (err.message || 'সোর্স সার্ভারে যোগাযোগ ব্যর্থ')
    }, { status: 502 });
  }
}
