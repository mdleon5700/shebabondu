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
  if (!session) return NextResponse.json({ profile: null, authenticated: false }, { headers: NO_CACHE_HEADERS });
  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) return NextResponse.json({ profile: null, authenticated: false }, { headers: NO_CACHE_HEADERS });
  const { passwordHash, ...safe } = candidate;
  return NextResponse.json({ success: true, profile: safe, user: safe }, { headers: NO_CACHE_HEADERS });
}

export async function PUT(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });
  try {
    const updates = await req.json();
    // Prevent malicious overwrite of id, role or passwordHash
    delete updates.id;
    delete updates.role;
    delete updates.passwordHash;
    for (const key of ['walletBalance', 'status', 'accountStatus', 'isVerified', 'verificationStatus', 'createdAt', 'updatedAt']) delete updates[key];
    const updated = serverDB.updateCandidate(session.candidateId, updates);
    if (!updated) return NextResponse.json({ error: 'Candidate not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    const { passwordHash, ...safe } = updated;
    return NextResponse.json({ success: true, profile: safe, user: safe }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}