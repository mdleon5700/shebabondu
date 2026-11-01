import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobSource, SourceClassification, CollectionMethod } from '@/lib/types';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const sources = serverDB.getJobSources();
  return NextResponse.json({ success: true, sources });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'INVALID_REQUEST: JSON body required.' }, { status: 400 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'VALIDATION_ERROR: ??????? ??? ?????? (??????? ? ?????)?' }, { status: 400 });
    }

    const sourceUrl = typeof body.sourceUrl === 'string' ? body.sourceUrl.trim() : '';
    if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) {
      return NextResponse.json({ error: 'VALIDATION_ERROR: ???? HTTP ?? HTTPS ????? URL ???????' }, { status: 400 });
    }

    try {
      new URL(sourceUrl);
    } catch {
      return NextResponse.json({ error: 'VALIDATION_ERROR: ????? URL ?? ???? ???????? ????' }, { status: 400 });
    }

    const validClassifications: SourceClassification[] = ['official', 'news', 'job_board', 'custom_api'];
    const classification = body.classification ? String(body.classification).trim() as SourceClassification : 'official';
    if (!validClassifications.includes(classification)) {
      return NextResponse.json({ 
        error: `VALIDATION_ERROR: ???????? ????????????? ????????: ${validClassifications.join(', ')}` 
      }, { status: 400 });
    }

    const validMethods: CollectionMethod[] = ['html_scrape', 'json_api', 'rss_feed', 'gemini_ocr_pdf', 'manual_entry'];
    const collectionMethod = body.collectionMethod ? String(body.collectionMethod).trim() as CollectionMethod : 'html_scrape';
    if (!validMethods.includes(collectionMethod)) {
      return NextResponse.json({ 
        error: `VALIDATION_ERROR: ???????? ??????? ????? ????????: ${validMethods.join(', ')}` 
      }, { status: 400 });
    }

    let scanIntervalMinutes = 360;
    if (body.scanIntervalMinutes !== undefined) {
      const intervalNum = Number(body.scanIntervalMinutes);
      if (isNaN(intervalNum) || !Number.isInteger(intervalNum) || intervalNum < 15 || intervalNum > 10080) {
        return NextResponse.json({ 
          error: 'VALIDATION_ERROR: ??????? ??????? ?? ????? ???? ??,??? ??????? (? ???) ????? ??????????? ??? ????' 
        }, { status: 400 });
      }
      scanIntervalMinutes = intervalNum;
    }

    const enabled = body.enabled !== undefined ? Boolean(body.enabled) : true;
    const adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes.trim().slice(0, 1000) : '';

    // Whitelist permitted fields
    const sourcePayload: Partial<JobSource> = {
      name,
      sourceUrl,
      classification,
      collectionMethod,
      scanIntervalMinutes,
      enabled,
      adminNotes
    };

    if (body.organizationName && typeof body.organizationName === 'string') {
      sourcePayload.organizationName = body.organizationName.trim();
    }
    if (body.officialWebsiteUrl && typeof body.officialWebsiteUrl === 'string') {
      sourcePayload.officialWebsiteUrl = body.officialWebsiteUrl.trim();
    }
    if (body.listingUrl && typeof body.listingUrl === 'string') {
      sourcePayload.listingUrl = body.listingUrl.trim();
    }
    if (body.scanDepthPages !== undefined) {
      const depth = Number(body.scanDepthPages);
      if (!isNaN(depth) && depth >= 1 && depth <= 50) {
        sourcePayload.scanDepthPages = depth;
      }
    }
    if (body.priority && ['high', 'normal', 'low'].includes(body.priority)) {
      sourcePayload.priority = body.priority;
    }
    if (body.timeoutMs !== undefined) {
      const t = Number(body.timeoutMs);
      if (!isNaN(t) && t >= 1000 && t <= 60000) {
        sourcePayload.timeoutMs = t;
      }
    }

    if (body.id && typeof body.id === 'string' && body.id.trim()) {
      sourcePayload.id = body.id.trim();
    }

    const newSource = serverDB.createJobSource(sourcePayload, session.candidateId);
    return NextResponse.json({ success: true, source: newSource }, { status: 201 });
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      return NextResponse.json({ error: `CONFLICT: ${err.message}` }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || '????? ?????? ?????? ??????' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || !body.id) {
      return NextResponse.json({ error: 'VALIDATION_ERROR: ????? ???? ???? ????? ???? (id) ???????' }, { status: 400 });
    }

    const id = String(body.id).trim();
    const existing = serverDB.getJobSourceById(id);
    if (!existing) {
      return NextResponse.json({ error: `NOT_FOUND: ????? "${id}" ????? ??????` }, { status: 404 });
    }

    const updates: Partial<JobSource> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name || name.length < 2) {
        return NextResponse.json({ error: 'VALIDATION_ERROR: ??????? ??? ??????? ? ??????? ??? ????' }, { status: 400 });
      }
      updates.name = name;
    }

    if (body.sourceUrl !== undefined) {
      const sourceUrl = String(body.sourceUrl).trim();
      if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) {
        return NextResponse.json({ error: 'VALIDATION_ERROR: ???? HTTP ?? HTTPS ????? URL ???????' }, { status: 400 });
      }
      try {
        new URL(sourceUrl);
      } catch {
        return NextResponse.json({ error: 'VALIDATION_ERROR: ????? URL ?? ???? ???????? ????' }, { status: 400 });
      }
      updates.sourceUrl = sourceUrl;
    }

    if (body.classification !== undefined) {
      const validClassifications: SourceClassification[] = ['official', 'news', 'job_board', 'custom_api'];
      const c = String(body.classification).trim() as SourceClassification;
      if (!validClassifications.includes(c)) {
        return NextResponse.json({ 
          error: `VALIDATION_ERROR: ???????? ????????????? ????????: ${validClassifications.join(', ')}` 
        }, { status: 400 });
      }
      updates.classification = c;
    }

    if (body.collectionMethod !== undefined) {
      const validMethods: CollectionMethod[] = ['html_scrape', 'json_api', 'rss_feed', 'gemini_ocr_pdf', 'manual_entry'];
      const m = String(body.collectionMethod).trim() as CollectionMethod;
      if (!validMethods.includes(m)) {
        return NextResponse.json({ 
          error: `VALIDATION_ERROR: ???????? ??????? ????? ????????: ${validMethods.join(', ')}` 
        }, { status: 400 });
      }
      updates.collectionMethod = m;
    }

    if (body.scanIntervalMinutes !== undefined) {
      const intervalNum = Number(body.scanIntervalMinutes);
      if (isNaN(intervalNum) || !Number.isInteger(intervalNum) || intervalNum < 15 || intervalNum > 10080) {
        return NextResponse.json({ 
          error: 'VALIDATION_ERROR: ??????? ??????? ?? ????? ???? ??,??? ??????? (? ???) ????? ??????????? ??? ????' 
        }, { status: 400 });
      }
      updates.scanIntervalMinutes = intervalNum;
    }

    if (body.enabled !== undefined) {
      updates.enabled = Boolean(body.enabled);
    }

    if (body.adminNotes !== undefined) {
      updates.adminNotes = String(body.adminNotes).trim().slice(0, 1000);
    }

    if (body.organizationName !== undefined) {
      updates.organizationName = String(body.organizationName).trim();
    }
    if (body.officialWebsiteUrl !== undefined) {
      updates.officialWebsiteUrl = String(body.officialWebsiteUrl).trim();
    }
    if (body.listingUrl !== undefined) {
      updates.listingUrl = String(body.listingUrl).trim();
    }
    if (body.scanDepthPages !== undefined) {
      const depth = Number(body.scanDepthPages);
      if (!isNaN(depth) && depth >= 1 && depth <= 50) {
        updates.scanDepthPages = depth;
      }
    }
    if (body.priority !== undefined && ['high', 'normal', 'low'].includes(body.priority)) {
      updates.priority = body.priority;
    }
    if (body.timeoutMs !== undefined) {
      const t = Number(body.timeoutMs);
      if (!isNaN(t) && t >= 1000 && t <= 60000) {
        updates.timeoutMs = t;
      }
    }

    const updatedSource = serverDB.updateJobSource(id, updates, session.candidateId);
    return NextResponse.json({ success: true, source: updatedSource });
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      return NextResponse.json({ error: `CONFLICT: ${err.message}` }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || '????? ????? ?????? ??????' }, { status: 500 });
  }
}
