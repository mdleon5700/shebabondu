import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobAlertPreference } from '@/lib/types';

const DEFAULT_PREFERENCES: JobAlertPreference = {
  categories: ['বিসিএস ও সরকারি চাকরি', 'ব্যাংক ও আর্থিক প্রতিষ্ঠান'],
  districts: ['ঢাকা'],
  grades: ['৯ম গ্রেড', '১০ম গ্রেড'],
  emailAlert: true,
  smsAlert: true,
  whatsappAlert: true,
  frequency: 'daily'
};

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Login required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetId = (session.role === 'admin' && searchParams.get('candidateId'))
    ? searchParams.get('candidateId')!
    : session.candidateId;

  let candidate = serverDB.getCandidateById(targetId);
  if (!candidate && session.role === 'admin') {
    const all = serverDB.getAllCandidates();
    if (all.length > 0) candidate = all[0];
  }

  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }

  const prefs = candidate.alertPreferences || {
    ...DEFAULT_PREFERENCES,
    districts: candidate.district ? [candidate.district] : ['ঢাকা']
  };

  return NextResponse.json({
    success: true,
    alertPreferences: prefs
  });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Login required' }, { status: 401 });
  }

  try {
    const body = await req.json();

    let targetId = (session.role === 'admin' && body.candidateId)
      ? body.candidateId
      : session.candidateId;

    let candidate = serverDB.getCandidateById(targetId);
    if (!candidate && session.role === 'admin') {
      const all = serverDB.getAllCandidates();
      if (all.length > 0) {
        candidate = all[0];
        targetId = candidate.id;
      }
    }

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const alertPreferences: JobAlertPreference = {
      categories: Array.isArray(body.categories) ? body.categories : DEFAULT_PREFERENCES.categories,
      districts: Array.isArray(body.districts) ? body.districts : [body.district || 'ঢাকা'],
      grades: Array.isArray(body.grades) ? body.grades : DEFAULT_PREFERENCES.grades,
      emailAlert: Boolean(body.emailAlert),
      smsAlert: Boolean(body.smsAlert),
      whatsappAlert: Boolean(body.whatsappAlert),
      frequency: body.frequency || 'daily'
    };

    const updated = serverDB.updateCandidate(targetId, { alertPreferences });
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      alertPreferences: updated.alertPreferences
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
