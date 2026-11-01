import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobTaxonomyClassifier } from '@/lib/taxonomy/classifier';
import { CategoryRecord } from '@/lib/taxonomy/types';

export async function GET() {
  try {
    const allCategories = serverDB.getCategories().filter((c) => c.is_active);

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

    // Build hierarchical tree
    const rootCategories: CategoryRecord[] = [];
    const childMap: Record<string, CategoryRecord[]> = {};

    for (const cat of allCategories) {
      const catWithCount: CategoryRecord = {
        ...cat,
        job_count: counts[cat.id] || 0,
        children: []
      };

      if (!cat.parent_id) {
        rootCategories.push(catWithCount);
      } else {
        if (!childMap[cat.parent_id]) {
          childMap[cat.parent_id] = [];
        }
        childMap[cat.parent_id].push(catWithCount);
      }
    }

    for (const root of rootCategories) {
      root.children = (childMap[root.id] || []).sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
    }

    rootCategories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    return NextResponse.json({
      success: true,
      tree: rootCategories
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
