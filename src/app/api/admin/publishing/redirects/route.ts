import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { createRedirectRecord } from '@/lib/publishing/redirect_manager';

export async function GET() {
  try {
    const redirects = serverDB.getRedirects ? serverDB.getRedirects() : {};
    return NextResponse.json({
      success: true,
      count: Object.keys(redirects).length,
      redirects: Object.values(redirects)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { sourcePath, targetPath, adminId, reason } = body;

    if (!sourcePath || !targetPath) {
      return NextResponse.json({ error: 'sourcePath and targetPath are required.' }, { status: 400 });
    }

    const res = createRedirectRecord(sourcePath, targetPath, adminId || 'ADMIN', reason || 'ম্যানেজড ৩০১ রিডাইরেক্ট');
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      redirect: res.redirect
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
