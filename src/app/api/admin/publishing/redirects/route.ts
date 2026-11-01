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
    const adminPin = req.headers.get('x-admin-pin');
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
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
