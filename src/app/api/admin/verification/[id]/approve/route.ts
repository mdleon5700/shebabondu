import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { publishDirectly, overrides } = body;

    const drafts = serverDB.getCircularDrafts();
    const draft = drafts.find(d => d.id === params.id);
    if (!draft) {
      return NextResponse.json({ error: 'খসড়া সার্কুলার খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    // Update verification status to VERIFIED
    if (draft.verificationResult) {
      draft.verificationResult.status = 'VERIFIED';
      draft.verificationResult.confidenceBand = 'HIGH';
      serverDB.saveVerificationResult(draft.verificationResult);
    }

    if (publishDirectly) {
      const createdJob = serverDB.approveCircularDraft(params.id, session.candidateId, overrides);
      return NextResponse.json({
        success: true,
        message: 'সার্কুলার যাচাই সম্পন্ন করে সরাসরি চাকরিতে রূপান্তর করা হয়েছে!',
        job: createdJob
      });
    }

    // Keep in approved draft state ready for Step 04 Content Studio
    draft.status = 'pending_review';
    draft.needsReview = false;
    draft.reviewReason = 'অ্যাডমিন কর্তৃক তথ্যের সত্যতা যাচাই ও অনুমোদিত';
    serverDB.saveCircularDraft(draft);

    return NextResponse.json({
      success: true,
      message: 'সার্কুলার সফলভাবে যাচাই অনুমোদন পেয়েছে। কনটেন্ট তৈরির জন্য প্রস্তুত।',
      draft
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'অনুমোদনে সমস্যা দেখা দিয়েছে' }, { status: 500 });
  }
}
