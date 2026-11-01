import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: No active session found' }, { status: 401 });
  }

  if (session.role === 'admin') {
    return NextResponse.json({ 
      isLoggedIn: true,
      role: 'admin',
      user: { id: 'ADMIN-SUPER', name: 'Super Admin', role: 'admin' } 
    });
  }

  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }

  const { passwordHash, ...safeCandidate } = candidate;
  return NextResponse.json({ 
    isLoggedIn: true,
    role: 'candidate',
    user: safeCandidate 
  });
}
