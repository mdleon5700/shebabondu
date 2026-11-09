import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { CategoryValidator } from '@/lib/taxonomy/validator';
import { CategoryRecord } from '@/lib/taxonomy/types';
import { JobTaxonomyClassifier } from '@/lib/taxonomy/classifier';

export async function PATCH(
  req: Request,
  context: { params: Promise<Promise<{ id: string }> | { id: string }> }
) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const { id: categoryId } = await Promise.resolve((await context.params));
    const existingCat = serverDB.getCategoryById(categoryId);
    if (!existingCat) {
      return NextResponse.json({ success: false, error: 'ক্যাটাগরি পাওয়া যায়নি' }, { status: 404 });
    }

    const body = await req.json();
    const existingList = serverDB.getCategories();

    const name_bn = body.name_bn !== undefined ? body.name_bn : (body.nameBn !== undefined ? body.nameBn : existingCat.name_bn);
    const name_en = body.name_en !== undefined ? body.name_en : (body.nameEn !== undefined ? body.nameEn : existingCat.name_en);

    const updated: CategoryRecord = {
      ...existingCat,
      name_bn,
      name_en,
      slug: body.slug !== undefined ? body.slug.toLowerCase().trim() : existingCat.slug,
      description_bn: body.description_bn !== undefined ? body.description_bn : (body.descriptionBn !== undefined ? body.descriptionBn : existingCat.description_bn),
      description_en: body.description_en !== undefined ? body.description_en : (body.descriptionEn !== undefined ? body.descriptionEn : existingCat.description_en),
      parent_id: body.parent_id !== undefined ? body.parent_id : (body.parentId !== undefined ? body.parentId : existingCat.parent_id),
      icon: body.icon !== undefined ? body.icon : existingCat.icon,
      image: body.image !== undefined ? body.image : existingCat.image,
      display_order: body.display_order !== undefined ? parseInt(body.display_order, 10) : (body.displayOrder !== undefined ? parseInt(body.displayOrder, 10) : existingCat.display_order),
      is_featured: body.is_featured !== undefined ? !!body.is_featured : (body.isFeatured !== undefined ? !!body.isFeatured : existingCat.is_featured),
      is_active: body.is_active !== undefined ? !!body.is_active : (body.isActive !== undefined ? !!body.isActive : existingCat.is_active),
      seo_title: body.seo_title !== undefined ? body.seo_title : existingCat.seo_title,
      seo_description: body.seo_description !== undefined ? body.seo_description : existingCat.seo_description,
      canonical_url: body.canonical_url !== undefined ? body.canonical_url : existingCat.canonical_url,
      created_at: existingCat.created_at,
      updated_at: new Date().toISOString()
    };

    const validation = CategoryValidator.validate(updated, existingList, true);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.errors[0],
        errors: validation.errors
      }, { status: 422 });
    }

    const saved = serverDB.saveCategory(updated);

    serverDB.recordAdminAudit({
      adminId: 'ADMIN',
      action: 'CATEGORY_UPDATE',
      targetType: 'CATEGORY',
      targetId: saved.id,
      changes: {}, notes: `Updated category "${saved.name_bn}" (${saved.slug})`
    });

    return NextResponse.json({
      success: true,
      category: saved
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const PUT = PATCH;

export async function DELETE(
  req: Request,
  context: { params: Promise<Promise<{ id: string }> | { id: string }> }
) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const { id: categoryId } = await Promise.resolve((await context.params));
    const { searchParams } = new URL(req.url);
    const reassignmentCategoryId = searchParams.get('reassignTo') || undefined;

    const existingList = serverDB.getCategories();
    const targetCat = existingList.find((c) => c.id === categoryId);
    if (!targetCat) {
      return NextResponse.json({ success: false, error: 'ক্যাটাগরি পাওয়া যায়নি' }, { status: 404 });
    }

    // Count assigned jobs
    const jobs = serverDB.getJobs();
    let assignedCount = 0;
    for (const j of jobs) {
      const cl = JobTaxonomyClassifier.classify(j);
      if (cl.primaryCategory === categoryId || (j.category || '').toLowerCase() === categoryId.replace('cat-', '')) {
        assignedCount++;
      }
    }

    const deletionCheck = CategoryValidator.validateDeletion(
      categoryId,
      existingList,
      assignedCount,
      reassignmentCategoryId
    );

    if (!deletionCheck.isValid) {
      return NextResponse.json({
        success: false,
        error: deletionCheck.errors[0],
        errors: deletionCheck.errors
      }, { status: 422 });
    }

    const deleted = serverDB.deleteCategory(categoryId, reassignmentCategoryId);

    serverDB.recordAdminAudit({
      adminId: 'ADMIN',
      action: 'CATEGORY_DELETE',
      targetType: 'CATEGORY',
      targetId: categoryId,
      changes: {}, notes: `Deleted category "${targetCat.name_bn}". Reassigned jobs to ${reassignmentCategoryId || 'none'}`
    });

    return NextResponse.json({
      success: true,
      deletedId: categoryId,
      reassignedTo: reassignmentCategoryId,
      jobsReassigned: assignedCount
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
