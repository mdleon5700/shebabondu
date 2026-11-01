export const dynamic = 'force-dynamic';
export const revalidate = 0;
﻿import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobTaxonomyClassifier } from '@/lib/taxonomy/classifier';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let categories = serverDB.getCategories();
    if (!includeInactive) {
      categories = categories.filter((c) => c.is_active);
    }

    // Compute live job counts for each category from eligible published jobs
    const eligibleJobs = serverDB.getJobs().filter((j) => {
      if (j.id?.startsWith('draft-')) return false;
      const status = ((j as any).status || '').toLowerCase();
      const pubStatus = ((j as any).publicationStatus || '').toUpperCase();
      return status !== 'unpublished' && status !== 'draft' && pubStatus !== 'UNPUBLISHED' && pubStatus !== 'DRAFT';
    });

    const counts: Record<string, number> = {};
    for (const job of eligibleJobs) {
      const classification = JobTaxonomyClassifier.classify(job);
      counts[classification.primaryCategory] = (counts[classification.primaryCategory] || 0) + 1;
      for (const sub of classification.subcategories) {
        counts[sub] = (counts[sub] || 0) + 1;
      }
    }

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      job_count: counts[cat.id] || 0
    }));

    return NextResponse.json({
      success: true,
      total: categoriesWithCount.length,
      categories: categoriesWithCount
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
