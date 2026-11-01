import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

  return NextResponse.json({
    success: true,
    experiences: candidate.experiences || []
  });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.organization || !body.designation) {
      return NextResponse.json({ error: 'Organization and designation are required' }, { status: 400 });
    }

    const updated = serverDB.addCandidateExperience(session.candidateId, body);
    if (!updated) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      experiences: updated.experiences
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
