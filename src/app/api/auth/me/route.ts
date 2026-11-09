import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ 
      isLoggedIn: false, 
      user: null, 
      role: null,
      message: 'No active session' 
    }, { status: 200, headers: NO_CACHE_HEADERS });
  }

  if (session.role === 'admin') {
    return NextResponse.json({ 
      isLoggedIn: true,
      role: 'admin',
      user: { id: 'ADMIN-SUPER', name: 'Super Admin', role: 'admin' } 
    }, { headers: NO_CACHE_HEADERS });
  }

  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) {
    return NextResponse.json({ 
      isLoggedIn: false, 
      user: null, 
      role: null, 
      error: 'Candidate not found' 
    }, { status: 200, headers: NO_CACHE_HEADERS });
  }

  const { passwordHash, ...safeCandidate } = candidate;
  const cookieHeader = req.headers.get('cookie') || '';
  const impMatch = cookieHeader.match(/(?:^|;\s*)cs_impersonating=([^;]+)/);
  const impersonatingName = impMatch ? decodeURIComponent(impMatch[1]) : undefined;

  return NextResponse.json({ 
    success: true,
    isLoggedIn: true,
    role: 'candidate',
    user: safeCandidate,
    impersonatingName
  }, { headers: NO_CACHE_HEADERS });
}
