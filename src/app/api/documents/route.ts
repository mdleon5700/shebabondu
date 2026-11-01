import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { CandidateDocument } from '@/lib/types';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const docs = serverDB.getDocuments(session.candidateId);
  return NextResponse.json({ success: true, documents: docs });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const doc: CandidateDocument = await req.json();
    if (!doc.title || !doc.type) {
      return NextResponse.json({ error: 'ডকুমেন্টের শিরোনাম ও ধরন প্রয়োজন' }, { status: 400 });
    }

    // Supported file types validation
    const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const fileExt = ((doc as any).fileUrl || doc.fileName || doc.type || '').split('.').pop()?.toLowerCase();
    const typeValid = allowedTypes.includes(doc.type.toLowerCase()) || (fileExt && allowedTypes.includes(fileExt));
    if (!typeValid) {
      return NextResponse.json({ error: 'শুধুমাত্র PDF, JPG, বা PNG ফরম্যাট গ্রহণযোগ্য' }, { status: 400 });
    }

    // Max file size 5MB (5242880 bytes)
    if ((doc as any).sizeBytes && (doc as any).sizeBytes > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ফাইলের আকার সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারে' }, { status: 400 });
    }

    const genDocId = doc.id || ('DOC-' + Date.now().toString().slice(-4));
    const newDoc: CandidateDocument = {
      ...doc,
      id: genDocId,
      uploadDate: doc.uploadDate || new Date().toLocaleDateString('bn-BD'),
      isVerified: doc.isVerified ?? false
    };
    const updated = serverDB.saveDocument(session.candidateId, newDoc);
    return NextResponse.json({ success: true, documents: updated, savedDoc: newDoc });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get('id');
    if (!docId) return NextResponse.json({ error: 'Document ID required' }, { status: 400 });

    const updated = serverDB.deleteDocument(session.candidateId, docId);
    return NextResponse.json({ success: true, documents: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}