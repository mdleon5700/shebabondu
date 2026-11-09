import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, context: { params: Promise<Promise<{ id: string }> | { id: string }> }) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const hasAdminAccess = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const { id } = await Promise.resolve((await context.params));
  const page = serverDB.getPageById(id);
  if (!page) return NextResponse.json({ error: 'পৃষ্ঠা পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json({ success: true, page });
}

export async function PUT(req: Request, context: { params: Promise<Promise<{ id: string }> | { id: string }> }) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const hasAdminAccess = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { id } = await Promise.resolve((await context.params));
    const existing = serverDB.getPageById(id);
    if (!existing) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const body = await req.json();
    const { action, ...pageData } = body;
    const title = pageData.title || existing.title;
    const slug = pageData.slug || pageData.path || existing.slug || (existing as any).path || '';
    const sections = Array.isArray(pageData.sections) ? pageData.sections : (existing.sections || []);

    if (!title || !slug) {
      return NextResponse.json({ error: 'Page title and path are required.' }, { status: 400 });
    }
    const isPublish = action === 'publish' || pageData.isPublished;
    const pageToSave: PageRecord = {
      ...existing,
      ...pageData,
      title,
      slug,
      sections,
      id
    };
    const adminId = session?.candidateId || 'ADMIN';
    const saved = serverDB.savePage(pageToSave, adminId, isPublish);
    if (isPublish) {
      try {
        revalidatePath(pageToSave.slug);
        revalidatePath('/', 'layout');
        revalidatePath('/');
      } catch (e) {}
    }
    return NextResponse.json({ success: true, page: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(req: Request, context: { params: Promise<Promise<{ id: string }> | { id: string }> }) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const hasAdminAccess = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const { id } = await Promise.resolve((await context.params));
  const adminId = session?.candidateId || 'ADMIN';
  const res = serverDB.deletePage(id, adminId);
  if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
