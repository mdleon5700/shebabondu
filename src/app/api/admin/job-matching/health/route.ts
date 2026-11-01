import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { CANONICAL_SKILLS } from '@/lib/matching/skills-taxonomy';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const jobs = serverDB.getJobs();
  const candidates = serverDB.getCandidates();
  const config = serverDB.getMatchingConfig();
  const feedback = serverDB.getRecommendationFeedback();

  let completedProfiles = 0;
  let candidatesWithSkills = 0;
  let candidatesWithEducation = 0;

  for (const c of candidates) {
    if (c.education && c.education.length > 0) candidatesWithEducation++;
    if (c.skills && c.skills.length > 0) candidatesWithSkills++;
    if (c.education && c.education.length > 0 && c.skills && c.skills.length > 0) {
      completedProfiles++;
    }
  }

  return NextResponse.json({
    success: true,
    health: {
      status: 'HEALTHY',
      matchingEnabled: config.enabled,
      scoringVersion: config.version,
      totalCatalogJobs: jobs.length,
      totalRegisteredCandidates: candidates.length,
      candidatesWithEducation,
      candidatesWithSkills,
      completedProfilesCount: completedProfiles,
      canonicalSkillsInTaxonomy: CANONICAL_SKILLS.length,
      totalUserFeedbackEvents: feedback.length,
      currentWeights: config.weights
    }
  });
}
