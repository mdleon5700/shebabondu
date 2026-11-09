import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { SmartJobMatchingEngine } from '@/lib/matching/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

  const job = serverDB.getJobById(params.jobId);
  if (!job) return NextResponse.json({ error: 'Job circular not found' }, { status: 404 });

  const match = SmartJobMatchingEngine.evaluateMatch(candidate, job);

  return NextResponse.json({
    success: true,
    job,
    match
  });
}
