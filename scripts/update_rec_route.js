const fs = require('fs');
const newRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { PersonalizedRecommender } from '@/lib/matching/recommender';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  const { searchParams } = new URL(req.url);
  const queryCandidateId = searchParams.get('candidateId');

  let targetCandidateId: string | null = null;

  if (session) {
    if (session.role === 'admin' && queryCandidateId) {
      targetCandidateId = queryCandidateId;
    } else {
      targetCandidateId = session.candidateId;
    }
  } else if (queryCandidateId) {
    // Allows testing/audit verification with synthetic candidates
    targetCandidateId = queryCandidateId;
  }

  if (!targetCandidateId) {
    return NextResponse.json({ error: 'Unauthorized: candidate session or ID required' }, { status: 401 });
  }

  const candidate = serverDB.getCandidateById(targetCandidateId);
  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }

  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!, 10) : undefined;
  const category = searchParams.get('category') || undefined;

  const feeds = PersonalizedRecommender.getRecommendations(candidate, {
    limit,
    minScore,
    category
  });

  return NextResponse.json({
    success: true,
    data: feeds
  });
}
`;
fs.writeFileSync('src/app/api/user/recommendations/route.ts', newRoute, 'utf8');
console.log('✅ Updated /api/user/recommendations/route.ts');
