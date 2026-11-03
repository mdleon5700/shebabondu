import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ success: true, savedJobs: [], isLoggedIn: false }, { status: 200 });
  }

  const savedJobs = serverDB.getSavedJobs(session.candidateId);
  return NextResponse.json({ success: true, savedJobs, isLoggedIn: true });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Login required' }, { status: 401 });
  }

  try {
    const { jobId, action } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const updated = serverDB.toggleSavedJob(session.candidateId, jobId, action);
    return NextResponse.json({ success: true, savedJobs: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
