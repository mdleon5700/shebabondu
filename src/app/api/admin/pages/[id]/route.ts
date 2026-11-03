import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const page = serverDB.getPageById(params.id);
  if (!page) return NextResponse.json({ error: 'পৃষ্ঠা পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json({ success: true, page });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    if (!serverDB.getPageById(params.id)) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    const { action, ...pageData } = await req.json();
    if (!pageData.title || !pageData.slug || !Array.isArray(pageData.sections)) return NextResponse.json({ error: 'Page title, path and sections are required.' }, { status: 400 });
    const isPublish = action === 'publish';
    const pageToSave: PageRecord = {
      ...pageData,
      id: params.id
    };
    const saved = serverDB.savePage(pageToSave, session.candidateId, isPublish);
    if (isPublish) { try { revalidatePath(pageToSave.slug); revalidatePath('/'); } catch (e) {} }
    return NextResponse.json({ success: true, page: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const res = serverDB.deletePage(params.id, session.candidateId);
  if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
