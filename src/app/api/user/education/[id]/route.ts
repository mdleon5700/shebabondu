import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const updates = await req.json();
    const updated = serverDB.updateCandidateEducation(session.candidateId, params.id, updates);
    if (!updated) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      education: updated.education
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updated = serverDB.deleteCandidateEducation(session.candidateId, params.id);
  if (!updated) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  return NextResponse.json({
    success: true,
    education: updated.education
  });
}
