import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { PersonalizedRecommender } from '@/lib/matching/recommender';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

  const completeness = PersonalizedRecommender.calculateCompleteness(candidate);
  const { passwordHash, ...safe } = candidate;

  return NextResponse.json({
    success: true,
    profile: safe,
    completeness
  });
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const updates = await req.json();
    delete updates.id;
    delete updates.role;
    delete updates.passwordHash;
    for (const key of ['walletBalance', 'status', 'accountStatus', 'isVerified', 'verificationStatus', 'createdAt', 'updatedAt']) delete updates[key];

    const updated = serverDB.updateCandidate(session.candidateId, updates);
    if (!updated) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    const completeness = PersonalizedRecommender.calculateCompleteness(updated);
    const { passwordHash, ...safe } = updated;

    return NextResponse.json({
      success: true,
      profile: safe,
      completeness
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
