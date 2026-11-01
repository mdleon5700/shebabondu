import { NextResponse } from 'next/server';
import { publishJobNow } from '@/lib/publishing/orchestrator';

export async function POST(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    // Basic verification guard
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, draftId, revisionId, adminId, note, overrideFields } = body;

    if (!jobId || !revisionId) {
      return NextResponse.json({ error: 'jobId and revisionId are required.' }, { status: 400 });
    }

    const result = publishJobNow({
      jobId,
      draftId,
      revisionId,
      adminId: adminId || 'ADMIN',
      note: note || 'Immediate manual publication',
      overrideFields
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        validation: result.validation
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      job: result.job,
      snapshot: result.snapshot,
      validation: result.validation,
      isRepublish: result.isRepublish
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
