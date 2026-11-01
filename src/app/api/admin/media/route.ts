import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { MediaItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const typeFilter = searchParams.get('type') || 'all';

  let items = serverDB.getMediaItems();

  // If initial media items is empty, seed standard government job logos & circular banners
  if (items.length === 0) {
    const seedMedia: MediaItem[] = [
      {
        id: 'med_bd_gov',
        filename: 'bd-gov-emblem.png',
        originalName: 'বাংলাদেশ সরকার মনোগ্রাম.png',
        mimeType: 'image/png',
        size: 45200,
        url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=300&q=80',
        altText: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার মনোগ্রাম',
        caption: 'সরকারি চাকরির সার্কুলার ও অফিসিয়াল বিজ্ঞপ্তির জন্য অনুমোদিত লোগো',
        uploadedBy: 'ADMIN-SUPER',
        createdAt: new Date().toISOString()
      },
      {
        id: 'med_teletalk',
        filename: 'teletalk-alljobs.png',
        originalName: 'Teletalk AllJobs Banner.png',
        mimeType: 'image/png',
        size: 92400,
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
        altText: 'টেলিটক অলজবস নিয়োগ ব্যানার',
        caption: 'টেলিটক জব সার্কুলার ও ফর্ম-ফিল সার্ভিস ব্যানার',
        uploadedBy: 'ADMIN-SUPER',
        createdAt: new Date().toISOString()
      },
      {
        id: 'med_bb_logo',
        filename: 'bangladesh-bank-logo.png',
        originalName: 'বাংলাদেশ ব্যাংক লোগো.png',
        mimeType: 'image/png',
        size: 61800,
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=300&q=80',
        altText: 'বাংলাদেশ ব্যাংক রিক্রুটমেন্ট মনোগ্রাম',
        caption: 'ব্যাংকার্স সিলেকশন কমিটি সচিবালয় (BSCS) সার্কুলার ব্যানার',
        uploadedBy: 'ADMIN-SUPER',
        createdAt: new Date().toISOString()
      }
    ];
    seedMedia.forEach(m => serverDB.saveMediaItem(m));
    items = seedMedia;
  }

  // Filter
  if (q) {
    items = items.filter(m => 
      m.filename.toLowerCase().includes(q) ||
      m.originalName.toLowerCase().includes(q) ||
      (m.altText && m.altText.toLowerCase().includes(q)) ||
      (m.caption && m.caption.toLowerCase().includes(q))
    );
  }

  if (typeFilter !== 'all') {
    if (typeFilter === 'image') {
      items = items.filter(m => m.mimeType.startsWith('image/'));
    } else if (typeFilter === 'document') {
      items = items.filter(m => m.mimeType.includes('pdf') || m.mimeType.includes('document'));
    }
  }

  return NextResponse.json({
    success: true,
    total: items.length,
    media: items
  });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { filename, originalName, mimeType, size, url, altText, caption, associatedJobId } = body;

    if (!originalName || !url) {
      return NextResponse.json({ error: 'originalName and url are required' }, { status: 400 });
    }

    // MIME Validation
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf'];
    const detectedMime = mimeType || 'image/jpeg';
    if (!allowedMimes.includes(detectedMime) && !detectedMime.startsWith('image/')) {
      return NextResponse.json({ error: 'অননুমোদিত ফাইল টাইপ। শুধুমাত্র JPG, PNG, WEBP, SVG এবং PDF গ্রহণযোগ্য।' }, { status: 400 });
    }

    // Size limit 10MB
    const fileSize = Number(size) || 102400;
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ফাইল সাইজ ১০ মেগাবাইটের বেশি হতে পারবে না' }, { status: 400 });
    }

    const safeFilename = (filename || originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const id = 'med_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    const newItem: MediaItem = {
      id,
      filename: safeFilename,
      originalName: originalName.trim(),
      mimeType: detectedMime,
      size: fileSize,
      url: url.trim(),
      altText: altText ? String(altText).trim() : originalName.trim(),
      caption: caption ? String(caption).trim() : '',
      associatedJobId: associatedJobId || undefined,
      uploadedBy: session.candidateId || 'ADMIN-SUPER',
      createdAt: new Date().toISOString()
    };

    const saved = serverDB.saveMediaItem(newItem);

    return NextResponse.json({
      success: true,
      message: 'মিডিয়া ফাইল সফলভাবে সংরক্ষিত হয়েছে।',
      media: saved
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'আপলোড ব্যর্থ হয়েছে' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, altText, caption, associatedJobId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Media id is required' }, { status: 400 });
    }

    const updates: Partial<MediaItem> = {};
    if (altText !== undefined) updates.altText = String(altText).trim();
    if (caption !== undefined) updates.caption = String(caption).trim();
    if (associatedJobId !== undefined) updates.associatedJobId = associatedJobId;

    const updated = serverDB.updateMediaItem(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'মিডিয়া তথ্য সফলভাবে হালনাগাদ করা হয়েছে।',
      media: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
  }

  // Reference Check: Verify if media is used by any active job
  const item = serverDB.getMediaItemById(id);
  if (!item) {
    return NextResponse.json({ error: 'মিডিয়া ফাইল খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }

  const jobs = serverDB.getJobs();
  const associatedJobs = jobs.filter(j => 
    ((j as any).organizationLogo && (j as any).organizationLogo.includes(item.filename)) ||
    (j.circularPdfUrl && j.circularPdfUrl.includes(item.filename)) ||
    (item.associatedJobId && j.id === item.associatedJobId)
  );

  if (associatedJobs.length > 0) {
    return NextResponse.json({
      error: `ফাইলটি মুছে ফেলা সম্ভব নয়! এটি বর্তমানে ${associatedJobs.length}টি সক্রিয় সার্কুলারে ব্যবহৃত হচ্ছে (${associatedJobs[0].title})।`
    }, { status: 400 });
  }

  serverDB.deleteMediaItem(id);

  return NextResponse.json({
    success: true,
    message: 'মিডিয়া ফাইল সফলভাবে মুছে ফেলা হয়েছে।'
  });
}
