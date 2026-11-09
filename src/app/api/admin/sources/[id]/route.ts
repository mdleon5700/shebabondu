import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobSource, SourceClassification, CollectionMethod } from '@/lib/types';

export async function GET(req: Request, context: { params: Promise<Promise<{ id: string }> | { id: string }> }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { id } = await Promise.resolve((await context.params));
  const source = serverDB.getJobSourceById(id);
  if (!source) {
    return NextResponse.json({ error: `NOT_FOUND: সোর্স "${id}" পাওয়া যায়নি।` }, { status: 404 });
  }

  return NextResponse.json({ success: true, source });
}

export async function PUT(req: Request, context: { params: Promise<Promise<{ id: string }> | { id: string }> }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { id } = await Promise.resolve((await context.params));
    const existing = serverDB.getJobSourceById(id);
    if (!existing) {
      return NextResponse.json({ error: `NOT_FOUND: সোর্স "${id}" পাওয়া যায়নি।` }, { status: 404 });
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'INVALID_REQUEST: JSON body required.' }, { status: 400 });
    }

    const updates: Partial<JobSource> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name || name.length < 2) {
        return NextResponse.json({ error: 'VALIDATION_ERROR: সোর্সের নাম কমপক্ষে ২ অক্ষরের হতে হবে।' }, { status: 400 });
      }
      updates.name = name;
    }

    if (body.sourceUrl !== undefined) {
      const sourceUrl = String(body.sourceUrl).trim();
      if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) {
        return NextResponse.json({ error: 'VALIDATION_ERROR: সঠিক HTTP বা HTTPS সোর্স URL আবশ্যক।' }, { status: 400 });
      }
      try {
        new URL(sourceUrl);
      } catch {
        return NextResponse.json({ error: 'VALIDATION_ERROR: সোর্স URL টি সঠিক ফরম্যাটে নেই।' }, { status: 400 });
      }
      updates.sourceUrl = sourceUrl;
    }

    if (body.classification !== undefined) {
      const validClassifications: SourceClassification[] = ['official', 'news', 'job_board', 'custom_api'];
      const c = String(body.classification).trim() as SourceClassification;
      if (!validClassifications.includes(c)) {
        return NextResponse.json({ 
          error: `VALIDATION_ERROR: অকার্যকর ক্লাসিফিকেশন। অনুমোদিত: ${validClassifications.join(', ')}` 
        }, { status: 400 });
      }
      updates.classification = c;
    }

    if (body.collectionMethod !== undefined) {
      const validMethods: CollectionMethod[] = ['html_scrape', 'json_api', 'rss_feed', 'gemini_ocr_pdf', 'manual_entry'];
      const m = String(body.collectionMethod).trim() as CollectionMethod;
      if (!validMethods.includes(m)) {
        return NextResponse.json({ 
          error: `VALIDATION_ERROR: অকার্যকর কালেকশন মেথড। অনুমোদিত: ${validMethods.join(', ')}` 
        }, { status: 400 });
      }
      updates.collectionMethod = m;
    }

    const intervalVal = body.scanIntervalMinutes !== undefined ? body.scanIntervalMinutes : body.scrapeIntervalMinutes;
    if (intervalVal !== undefined) {
      const intervalNum = Number(intervalVal);
      if (isNaN(intervalNum) || !Number.isInteger(intervalNum) || intervalNum < 15 || intervalNum > 10080) {
        return NextResponse.json({ 
          error: 'VALIDATION_ERROR: স্ক্যান ব্যবধান ১৫ মিনিট থেকে ১০,০৮০ মিনিটের (৭ দিন) মধ্যে পূর্ণসংখ্যা হতে হবে।' 
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

    const updatedSource = serverDB.updateJobSource(id, updates, session.candidateId);
    return NextResponse.json({ success: true, source: updatedSource });
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      return NextResponse.json({ error: `CONFLICT: ${err.message}` }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || 'সোর্স আপডেট ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  return PUT(req, context as any);
}

export async function DELETE(req: Request, context: { params: Promise<Promise<{ id: string }> | { id: string }> }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { id } = await Promise.resolve((await context.params));
    const existing = serverDB.getJobSourceById(id);
    if (!existing) {
      return NextResponse.json({ error: `NOT_FOUND: সোর্স "${id}" পাওয়া যায়নি।` }, { status: 404 });
    }

    const result = serverDB.archiveOrDeleteJobSource(id, false, session.candidateId);
    return NextResponse.json({ ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'সোর্স ডিলিট বা আর্কাইভ করতে ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
