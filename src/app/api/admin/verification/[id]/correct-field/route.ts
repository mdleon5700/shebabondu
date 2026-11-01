import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { correctDraftField } from '@/lib/verification';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { field, correctedValue, reason } = body;

    if (!field || correctedValue === undefined) {
      return NextResponse.json({ error: 'field এবং correctedValue আবশ্যক' }, { status: 400 });
    }

    if (!reason || reason.trim().length < 3) {
      return NextResponse.json({ error: 'তথ্য সংশোধনের যুক্তিযুক্ত কারণ (reason) উল্লেখ করুন' }, { status: 400 });
    }

    const { draft, correction } = correctDraftField({
      draftId: params.id,
      fieldName: field,
      correctedValue,
      correctedBy: session.candidateId,
      correctionReason: reason
    });

    return NextResponse.json({
      success: true,
      message: `ক্ষেত্র "${field}" সফলভাবে সংশোধন ও অডিট লগ সংরক্ষণ করা হয়েছে`,
      draft,
      correction
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'ফিল্ড সংশোধনে ত্রুটি ঘটেছে' }, { status: 500 });
  }
}
