import { NextResponse } from 'next/server';
import { restoreJob } from '@/lib/publishing/lifecycle';

export async function POST(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, adminId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
    }

    const res = restoreJob(jobId, adminId || 'ADMIN');
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      jobId: res.jobId,
      newStatus: res.newStatus
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
