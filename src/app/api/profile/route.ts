import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  const { passwordHash, ...safe } = candidate;
  return NextResponse.json({ profile: safe });
}

export async function PUT(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const updates = await req.json();
    // Prevent malicious overwrite of id, role or passwordHash
    delete updates.id;
    delete updates.role;
    delete updates.passwordHash;
    const updated = serverDB.updateCandidate(session.candidateId, updates);
    if (!updated) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    const { passwordHash, ...safe } = updated;
    return NextResponse.json({ success: true, profile: safe });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}