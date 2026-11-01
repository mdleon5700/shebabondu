import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { resolveFieldConflict } from '@/lib/verification';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { field, chosenValue, reason } = body;

    if (!field || chosenValue === undefined) {
      return NextResponse.json({ error: 'field এবং chosenValue আবশ্যক' }, { status: 400 });
    }

    const updatedResult = resolveFieldConflict({
      draftId: params.id,
      fieldName: field,
      chosenValue,
      resolvedBy: session.candidateId,
      rationale: reason || 'অ্যাডমিন কর্তৃক দ্বন্দ্ব সমাধান ও সঠিক মান নির্ধারণ'
    });

    return NextResponse.json({
      success: true,
      message: `ক্ষেত্র "${field}" এর দ্বন্দ্ব সফলভাবে সমাধান হয়েছে`,
      result: updatedResult
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'বিরোধ সমাধানে ত্রুটি ঘটেছে' }, { status: 500 });
  }
}
