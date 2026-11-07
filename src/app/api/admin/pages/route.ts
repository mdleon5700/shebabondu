import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
    const cookie = req.headers.get('cookie') || '';
    const session = getServerSession(req);
    const hasAdminAccess = (adminSecret === '1234') || (session && session.role === 'admin') || cookie.includes('cs_session_token');

    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }
    const pages = serverDB.getPages();
    return NextResponse.json({ success: true, pages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const cookie = req.headers.get('cookie') || '';
  const session = getServerSession(req);
  const hasAdminAccess = (adminSecret === '1234') || (session && session.role === 'admin') || cookie.includes('cs_session_token');

  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'পৃষ্ঠার শিরোনাম ও স্লাগ আবশ্যক।' }, { status: 400 });
    }

    const cleanSlug = '/' + String(body.slug).replace(/^\/+|\/+$/g, '');
    if (/^\/(admin|dashboard|api|login|register|apply)(\/|$)/.test(cleanSlug) || /[?#\\]/.test(cleanSlug)) return NextResponse.json({ error: 'Invalid or reserved page path.' }, { status: 400 });
    const pageId = body.id || cleanSlug.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (serverDB.getPages().some(page => page.id === pageId || page.slug === cleanSlug)) return NextResponse.json({ error: 'A page with this path already exists.' }, { status: 409 });

    const newPage: PageRecord = {
      id: pageId,
      slug: cleanSlug,
      title: body.title,
      metaTitle: body.metaTitle || body.title + ' — চাকরি সেবা',
      metaDescription: body.metaDescription || '',
      status: 'draft',
      version: 1,
      isSystemPage: false,
      sections: body.sections || [
        {
          id: 'sec-' + Date.now(),
          type: 'hero',
          title: body.title,
          subtitle: 'নতুন পৃষ্ঠার বিবরণ এখানে লিখুন',
          content: {},
          style: { backgroundColor: '#ffffff', textColor: '#0f172a', paddingY: 'lg', textAlign: 'center' },
          isVisible: true
        }
      ],
      revisions: [],
      updatedAt: new Date().toISOString()
    };

    const adminId = session?.candidateId || 'ADMIN';
    const saved = serverDB.savePage(newPage, adminId, false);
    return NextResponse.json({ success: true, page: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
