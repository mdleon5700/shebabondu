export const dynamic = 'force-dynamic';
export const revalidate = 0;
﻿import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = (searchParams.get('search') || searchParams.get('q'))?.toLowerCase().trim();
    const status = searchParams.get('status');
    const grade = searchParams.get('grade');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    let jobs: JobCircular[] = serverDB.getJobs();

    // 1. Search Filter
    if (search) {
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(search) ||
        j.organization.toLowerCase().includes(search) ||
        (j.requirements && j.requirements.some(r => r.toLowerCase().includes(search))) ||
        (j.minEducation && j.minEducation.toLowerCase().includes(search)) ||
        (j.seoKeywords && j.seoKeywords.some(k => k.toLowerCase().includes(search))) ||
        (j.positions && j.positions.some(p => p.title.toLowerCase().includes(search)))
      );
    }

    // 2. Category Filter
    if (category && category !== 'all') {
      if (category === 'govt') {
        jobs = jobs.filter(j => ['govt', 'railway', 'defense', 'teacher'].includes(j.category));
      } else if (category === 'private') {
        jobs = jobs.filter(j => ['private', 'ngo'].includes(j.category));
      } else {
        jobs = jobs.filter(j => j.category === category);
      }
    }

    // 3. Status Filter (open, upcoming, closed, expired)
    if (status && status !== 'all') {
      if (status === 'open') {
        jobs = jobs.filter(j => (j as any).status === 'OPEN' || j.daysRemaining > 0);
      } else if (status === 'closed' || status === 'expired') {
        jobs = jobs.filter(j => (j as any).status === 'CLOSED' || (j as any).status === 'EXPIRED' || j.daysRemaining <= 0);
      } else if (status === 'upcoming') {
        jobs = jobs.filter(j => (j as any).status === 'UPCOMING');
      }
    }

    // 4. Grade Filter
    if (grade && grade !== 'all') {
      jobs = jobs.filter(j => j.grade === grade);
    }

    const total = jobs.length;
    const startIndex = (page - 1) * limit;
    const paginated = jobs.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      jobs: paginated
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
