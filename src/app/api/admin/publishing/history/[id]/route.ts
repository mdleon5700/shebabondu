import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  try {
    const jobId = params.id;
    const job = serverDB.getJobByIdOrSlug ? serverDB.getJobByIdOrSlug(jobId) : serverDB.getJobById(jobId);

    if (!job) {
      return NextResponse.json({ error: 'চাকরির রেকর্ডটি পাওয়া যায়নি।' }, { status: 404 });
    }

    const allSnapshots = serverDB.getPublicationSnapshots ? serverDB.getPublicationSnapshots() : {};
    const snapshots = Object.values(allSnapshots).filter(s => s.jobId === job.id);

    const allAudit = serverDB.getPublicationAuditLogs ? serverDB.getPublicationAuditLogs() : [];
    const auditLogs = allAudit.filter(a => a.jobId === job.id);

    const comments = serverDB.getReviewComments ? serverDB.getReviewComments(job.id) : [];

    return NextResponse.json({
      success: true,
      jobId: job.id,
      job,
      snapshots,
      auditLogs,
      reviewComments: comments,
      statusHistory: (job as any).statusHistory || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
