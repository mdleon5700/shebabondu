import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { expireJob } from '@/lib/publishing/lifecycle';

export async function POST(req: Request) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { jobId, adminId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
    }

    const res = expireJob(jobId, adminId || 'ADMIN');
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
