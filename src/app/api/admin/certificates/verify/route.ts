import { NextResponse } from 'next/server';
import { AdminGovernanceRbac } from '@/lib/governance';
import { CertificateVerificationManager } from '@/lib/education/verification';

export async function POST(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'certificates.review');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { candidateId, recordId, status, remarks, recordType = 'education' } = body;
    const reviewerId = req.headers.get('x-admin-id') || auth.role || 'ADMIN-SUPER';

    if (!candidateId || !recordId || !status) {
      return NextResponse.json(
        { error: 'candidateId, recordId, and status (VERIFIED | REJECTED | NEEDS_CORRECTION) are required.' },
        { status: 400 }
      );
    }

    const result = CertificateVerificationManager.applyDecision({
      candidateId,
      recordId,
      recordType,
      status,
      reviewerId,
      remarks: remarks || (status === 'VERIFIED' ? 'সনদপত্র সঠিকভাবে যাচাই ও সত্যায়িত করা হয়েছে।' : 'অসঙ্গতিপূর্ণ তথ্য।')
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      messageBn: status === 'VERIFIED' ? 'সনদপত্র সফলভাবে ভেরিফাই ও অনুমোদিত হয়েছে।' : `সনদপত্র স্ট্যাটাস '${status}'-এ আপডেট হয়েছে।`,
      updatedRecord: result.updatedRecord
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to apply certificate verification decision' },
      { status: 500 }
    );
  }
}
