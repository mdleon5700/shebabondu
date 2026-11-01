import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const pages = serverDB.getPages();
  return NextResponse.json({ success: true, pages });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
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

    const saved = serverDB.savePage(newPage, session.candidateId, false);
    return NextResponse.json({ success: true, page: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
