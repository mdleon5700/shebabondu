import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobTaxonomyClassifier } from '@/lib/taxonomy/classifier';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug.toLowerCase().trim();
    const category = serverDB.getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ success: false, error: 'ক্যাটাগরি পাওয়া যায়নি' }, { status: 404 });
    }

    const allCategories = serverDB.getCategories();
    const subcategories = allCategories
      .filter((c) => c.parent_id === category.id && c.is_active)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    // Calculate job count
    const eligibleJobs = serverDB.getPublicJobs().filter((j) => {
      if (j.id?.startsWith('draft-')) return false;
      const status = ((j as any).status || '').toLowerCase();
      const pubStatus = ((j as any).publicationStatus || '').toUpperCase();
      return status !== 'unpublished' && status !== 'draft' && pubStatus !== 'UNPUBLISHED' && pubStatus !== 'DRAFT';
    });

    let count = 0;
    for (const job of eligibleJobs) {
      const cl = JobTaxonomyClassifier.classify(job);
      if (
        cl.primaryCategory === category.id ||
        cl.categorySlug === category.slug ||
        cl.subcategories.includes(category.id) ||
        (job.category || '').toLowerCase() === category.id.replace('cat-', '')
      ) {
        count++;
      }
    }

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        job_count: count,
        subcategories
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
