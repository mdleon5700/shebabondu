import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { CategoryValidator } from '@/lib/taxonomy/validator';
import { CategoryRecord } from '@/lib/taxonomy/types';
import { JobTaxonomyClassifier } from '@/lib/taxonomy/classifier';

export async function GET(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
    }

    const categories = serverDB.getCategories();
    const jobs = serverDB.getJobs();

    const counts: Record<string, number> = {};
    for (const job of jobs) {
      const cl = JobTaxonomyClassifier.classify(job);
      counts[cl.primaryCategory] = (counts[cl.primaryCategory] || 0) + 1;
      for (const sub of cl.subcategories) {
        counts[sub] = (counts[sub] || 0) + 1;
      }
    }

    const enriched = categories.map((cat) => ({
      ...cat,
      job_count: counts[cat.id] || 0
    }));

    return NextResponse.json({
      success: true,
      total: enriched.length,
      categories: enriched
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
    }

    const body = await req.json();
    const existing = serverDB.getCategories();

    // Generate unique ID if not provided
    const id = body.id || `cat-${body.slug || Date.now().toString(36)}`;
    const newCategory: CategoryRecord = {
      id,
      name_bn: body.name_bn || '',
      name_en: body.name_en || '',
      slug: body.slug ? body.slug.toLowerCase().trim() : '',
      description_bn: body.description_bn || '',
      description_en: body.description_en || '',
      parent_id: body.parent_id || null,
      icon: body.icon || 'Briefcase',
      image: body.image || null,
      display_order: parseInt(body.display_order ?? '0', 10),
      is_featured: !!body.is_featured,
      is_active: body.is_active !== undefined ? !!body.is_active : true,
      seo_title: body.seo_title || `${body.name_bn} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`,
      seo_description: body.seo_description || `${body.name_bn} এর সর্বশেষ চাকরির সার্কুলার ও আবেদন।`,
      canonical_url: body.canonical_url || `https://chakrisheba.com/categories/${body.slug || ''}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const validation = CategoryValidator.validate(newCategory, existing, false);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.errors[0],
        errors: validation.errors
      }, { status: 422 });
    }

    const saved = serverDB.saveCategory(newCategory);

    // Audit log
    serverDB.recordAdminAudit({
      adminId: 'ADMIN',
      action: 'CATEGORY_CREATE',
      targetType: 'CATEGORY',
      targetId: saved.id,
      changes: {}, notes: `Created category "${saved.name_bn}" (${saved.slug})`
    });

    return NextResponse.json({
      success: true,
      category: saved
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
