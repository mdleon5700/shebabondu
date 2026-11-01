import { NextResponse } from 'next/server';
import { AdminGovernanceRbac } from '@/lib/governance';
import { serverDB } from '@/lib/db';
import { SyntheticUserManager } from '@/lib/testing/synthetic/synthetic-user-manager';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'certificates.review');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') || 'all';

    const realCandidates = serverDB.getCandidates();
    const synthCandidates = SyntheticUserManager.getAllSyntheticUsers();
    const candidates = [...realCandidates, ...(synthCandidates as unknown as any[])];
    const queue: any[] = [];

    for (const cand of candidates) {
      const eduList: any[] = (cand.education as any[]) || [];
      for (const edu of eduList) {
        const vStatus = edu.verificationStatus || 'PENDING_REVIEW';
        if (statusFilter === 'all' || vStatus === statusFilter) {
          queue.push({
            candidateId: cand.id,
            candidateName: cand.nameBn || cand.name,
            candidatePhone: cand.phone,
            recordId: edu.id || '',
            recordType: 'education',
            degreeOrTitle: edu.degree || edu.level,
            institution: edu.boardOrUni || edu.institutionName || 'অনির্ধারিত',
            year: edu.year,
            result: edu.result || (edu.gpa ? `GPA ${edu.gpa}` : (edu.cgpa ? `CGPA ${edu.cgpa}` : '')),
            scale: edu.scale,
            documentId: edu.certificateDocumentId,
            documentUrl: edu.certificateFileUrl,
            status: vStatus,
            verificationRemarks: edu.verificationRemarks,
            verifiedAt: edu.verifiedAt,
            verifiedBy: edu.verifiedBy,
            submittedAt: edu.updatedAt || edu.createdAt || cand.updatedAt
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalCount: queue.length,
      pendingCount: queue.filter(q => q.status === 'PENDING_REVIEW').length,
      verifiedCount: queue.filter(q => q.status === 'VERIFIED').length,
      rejectedCount: queue.filter(q => q.status === 'REJECTED').length,
      queue
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch certificate verification queue' },
      { status: 500 }
    );
  }
}
