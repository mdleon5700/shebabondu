import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { CareerPreferences } from '@/lib/matching/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = serverDB.getCandidateById(session.candidateId);
  if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

  const defaultPreferences: CareerPreferences = {
    preferredCategories: [],
    preferredOrgTypes: ['government', 'bank', 'autonomous'],
    preferredJobTitles: [],
    preferredEmploymentTypes: ['full_time', 'govt'],
    preferredDivisions: candidate.division ? [candidate.division] : [],
    preferredDistricts: candidate.district ? [candidate.district] : [],
    remotePreference: 'any'
  };

  return NextResponse.json({
    success: true,
    preferences: (candidate as any).careerPreferences || defaultPreferences
  });
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const updated = serverDB.updateCandidatePreferences(session.candidateId, body);
    if (!updated) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      preferences: (updated as any).careerPreferences
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
