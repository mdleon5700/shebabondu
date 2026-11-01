import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { SkillsTaxonomyManager } from '@/lib/matching/skills-taxonomy';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

  return NextResponse.json({
    success: true,
    skills: candidate.skills || []
  });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    const resolved = SkillsTaxonomyManager.resolveSkill(body.name);
    const skillItem = {
      id: body.id || resolved.id,
      name: body.name.trim(),
      normalizedId: resolved.id,
      category: body.category || resolved.category,
      proficiency: body.proficiency || 'intermediate',
      yearsExperience: body.yearsExperience || 0,
      isUserConfirmed: true
    };

    const updated = serverDB.addCandidateSkill(session.candidateId, skillItem);
    if (!updated) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      skills: updated.skills
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
