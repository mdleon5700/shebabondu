import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
    }

    const body = await req.json();
    const { jobIds, targetCategoryId } = body;

    if (!Array.isArray(jobIds) || jobIds.length === 0 || !targetCategoryId) {
      return NextResponse.json({ error: 'jobIds array and targetCategoryId are required' }, { status: 400 });
    }

    const targetCategory = serverDB.getCategoryById(targetCategoryId);
    if (!targetCategory) {
      return NextResponse.json({ error: 'Target category not found' }, { status: 404 });
    }

    const categoryKey = targetCategory.id.replace('cat-', '');
    let updatedCount = 0;

    for (const jobId of jobIds) {
      const job = serverDB.getJobById(jobId);
      if (job) {
        serverDB.saveJob({
          id: jobId,
          category: categoryKey as any,
          categoryLabel: targetCategory.name_bn
        }, 'ADMIN');
        updatedCount++;
      }
    }

    serverDB.recordAdminAudit({
      adminId: 'ADMIN',
      action: 'CATEGORY_BULK_ASSIGN',
      targetType: 'CATEGORY',
      targetId: targetCategoryId,
      changes: {}, notes: `Bulk reassigned ${updatedCount} jobs to category "${targetCategory.name_bn}"`
    });

    return NextResponse.json({
      success: true,
      updatedCount,
      targetCategory: targetCategory.name_bn
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
