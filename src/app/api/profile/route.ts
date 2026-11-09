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

  const url = new URL(req.url);
  const requestedId = url.searchParams.get('id') || url.searchParams.get('candidateId') || req.headers.get('x-candidate-id');

  let targetId = session.candidateId;
  if (session.role === 'admin' && requestedId) {
    targetId = requestedId;
  }

  let candidate = serverDB.getCandidateById(targetId) || serverDB.getCandidateByIdentifier(targetId);

  if (!candidate && session.role === 'admin') {
    return NextResponse.json({
      success: true,
      profile: {
        id: 'ADMIN-SUPER',
        name: 'সুপার অ্যাডমিন',
        role: 'admin',
        email: 'admin@chakrisheba.com',
        phone: '01700-000000'
      },
      user: {
        id: 'ADMIN-SUPER',
        name: 'সুপার অ্যাডমিন',
        role: 'admin',
        email: 'admin@chakrisheba.com',
        phone: '01700-000000'
      }
    }, { headers: NO_CACHE_HEADERS });
  }

  if (!candidate) return NextResponse.json({ profile: null, authenticated: false }, { headers: NO_CACHE_HEADERS });
  const { passwordHash, ...safe } = candidate;
  return NextResponse.json({ success: true, profile: safe, user: safe }, { headers: NO_CACHE_HEADERS });
}

export async function PUT(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });
  try {
    let updates: any;
    try {
      updates = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    let targetId = session.candidateId;
    if (session.role === 'admin' && updates.id) {
      targetId = updates.id;
    }

    // Prevent unauthorized overwrite of id, role or passwordHash
    delete updates.id;
    delete updates.role;
    delete updates.passwordHash;
    if (session.role !== 'admin') {
      for (const key of ['walletBalance', 'status', 'accountStatus', 'isVerified', 'verificationStatus', 'createdAt', 'updatedAt']) {
        delete updates[key];
      }
    }

    let updated = serverDB.updateCandidate(targetId, updates);
    if (!updated) {
      const existing = serverDB.getCandidateByIdentifier(targetId);
      if (existing) {
        updated = serverDB.updateCandidate(existing.id, updates);
      }
    }

    if (!updated && session.role === 'admin') {
      return NextResponse.json({
        success: true,
        profile: { id: 'ADMIN-SUPER', role: 'admin', ...updates },
        user: { id: 'ADMIN-SUPER', role: 'admin', ...updates }
      }, { headers: NO_CACHE_HEADERS });
    }

    if (!updated) return NextResponse.json({ error: 'Candidate not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    const { passwordHash, ...safe } = updated;
    return NextResponse.json({ success: true, profile: safe, user: safe }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export const PATCH = PUT;
