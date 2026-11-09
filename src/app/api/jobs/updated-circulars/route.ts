import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '50')));
    const type = searchParams.get('type') || 'ALL'; // ALL, EXTENDED, CORRIGENDUM, VACANCY

    const allJobs = serverDB.getPublicJobs();
    const approvedProposals = serverDB.getCircularChangeProposals('APPROVED');
    const updatedList: any[] = [];

    for (const job of allJobs) {
      if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
        continue;
      }

      const revisions = serverDB.getDeadlineRevisions(job.id);
      const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
      const jobProposals = approvedProposals.filter(p => p.jobId === job.id);

      const isExtended = 
        evalResult.status === 'EXTENDED' || 
        revisions.length > 0 || 
        Boolean(job.deadline && (job.deadline.includes('বৃদ্ধি') || job.deadline.includes('বর্ধিত') || job.deadline.toLowerCase().includes('extended'))) ||
        Boolean((job as any).isExtended) ||
        jobProposals.some(p => p.changeType === 'DEADLINE_EXTENDED');

      const hasCorrigendum = 
        Boolean((job as any).hasCorrigendum) ||
        Boolean((job as any).corrigendumText) ||
        Boolean((job as any).corrigendumPdfUrl) ||
        Boolean(job.title?.includes('সংশোধিত') || job.title?.includes('সংশোধনী')) ||
        Boolean(job.bengaliDescription?.includes('সংশোধিত') || job.bengaliDescription?.includes('সংশোধনী')) ||
        jobProposals.some(p => p.changeType === 'REVISED_CIRCULAR');

      const hasVacancyChanged =
        Boolean((job as any).vacanciesChanged) ||
        Boolean(job.revisionHistory?.some(r => r.summary?.includes('পদসংখ্যা') || r.changedFields?.includes('totalPosts'))) ||
        Boolean(job.title?.includes('পদ বৃদ্ধি') || job.bengaliDescription?.includes('পদসংখ্যা বৃদ্ধি')) ||
        jobProposals.some(p => p.changeType === 'VACANCY_CHANGED');

      if (isExtended || hasCorrigendum || hasVacancyChanged) {
        const updateTypes: string[] = [];
        if (isExtended) updateTypes.push('DEADLINE_EXTENDED');
        if (hasCorrigendum) updateTypes.push('CORRIGENDUM');
        if (hasVacancyChanged) updateTypes.push('VACANCY_CHANGED');

        if (type === 'EXTENDED' && !isExtended) continue;
        if (type === 'CORRIGENDUM' && !hasCorrigendum) continue;
        if (type === 'VACANCY' && !hasVacancyChanged) continue;

        updatedList.push({
          ...job,
          updateTypes,
          deadlineStatus: evalResult.status,
          deadlineLabelBn: evalResult.labelBn,
          daysRemaining: evalResult.daysRemaining,
          formattedCountdownBn: evalResult.formattedCountdownBn,
          badgeColor: evalResult.badgeColor,
          revisionCount: revisions.length,
          lastRevision: revisions[0] || null,
          corrigendumText: (job as any).corrigendumText || (hasCorrigendum ? 'উক্ত নিয়োগ বিজ্ঞপ্তির শর্তাবলী সংশোধিত হয়েছে।' : undefined),
          corrigendumPdfUrl: (job as any).corrigendumPdfUrl || (job as any).circularPdfUrl || undefined
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: updatedList.length,
      jobs: updatedList.slice(0, limit)
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
