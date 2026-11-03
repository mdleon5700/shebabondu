import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { inspectTeletalkPortal } from '@/lib/collector/teletalk_portal_inspector';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin authentication required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl || !targetUrl.trim()) {
    return NextResponse.json({ error: 'Target URL is required (?url=...)' }, { status: 400 });
  }

  try {
    const result = await inspectTeletalkPortal(targetUrl.trim());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Inspection failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin authentication required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const targetUrl = body.url;

    if (!targetUrl || !targetUrl.trim()) {
      return NextResponse.json({ error: 'Target URL is required in body ({ url })' }, { status: 400 });
    }

    const result = await inspectTeletalkPortal(targetUrl.trim());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Inspection failed' }, { status: 500 });
  }
}

