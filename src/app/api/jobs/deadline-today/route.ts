import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import { matchJobQuery } from '@/lib/search-helper';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const district = searchParams.get('district') || undefined;
    const education = searchParams.get('education') || undefined;
    const q = searchParams.get('q') || searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '9', 10));

    const allJobs = serverDB.getPublicJobs();
    const todayJobs: any[] = [];

    for (const job of allJobs) {
      if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
        continue;
      }
      const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
      if (evalResult.isClosingToday && !evalResult.isClosed) {
        // Apply filters
        if (category && category !== 'all' && job.category !== category) continue;
        if (district && district !== 'all') {
          const d = job.districts || '';
          if (!d.includes('সকল জেলা') && !d.includes(district)) continue;
        }
        if (education && education !== 'all') {
          const edu = job.minEducation || '';
          if (!edu.includes(education)) continue;
        }
        if (q && !matchJobQuery(job, q)) continue;

        todayJobs.push({
          ...job,
          evaluation: evalResult
        });
      }
    }

    const total = todayJobs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedJobs = todayJobs.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        success: true,
        feedType: 'deadline_today',
        jobs: paginatedJobs,
        total,
        page,
        totalPages,
        limit
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'আজকের ডেডলাইনের চাকরির তালিকা লোড করতে সমস্যা হয়েছে'
      },
      { status: 500 }
    );
  }
}
