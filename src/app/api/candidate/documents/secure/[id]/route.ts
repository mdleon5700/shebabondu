import { findPrivateUpload } from '@/lib/private-uploads';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { AdminGovernanceRbac } from '@/lib/governance';
import { serverDB } from '@/lib/db';
import { SyntheticUserManager } from '@/lib/testing/synthetic/synthetic-user-manager';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const docId = params.id;
    const session = getServerSession(req);
    const adminAuth = AdminGovernanceRbac.authorizeRequest(req, 'certificates.review');

    // 1. Locate the document across database candidate records
    const allCandidates = serverDB.getAllCandidates();
    let targetDoc: any = null;
    let ownerCandidateId: string = '';

    for (const cand of allCandidates) {
      const docs = serverDB.getDocuments(cand.id);
      const found = docs.find((d: any) => d.id === docId || d.fileName?.includes(docId));
      if (found) {
        targetDoc = found;
        ownerCandidateId = cand.id;
        break;
      }
    }

    if (!targetDoc) {
      const synthDoc = SyntheticUserManager.findDocument(docId);
      if (synthDoc) {
        targetDoc = synthDoc.doc;
        ownerCandidateId = synthDoc.candidateId;
      }
    }

    if (!targetDoc) {
      return NextResponse.json({ error: 'ডকুমেন্ট বা সনদপত্রটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    // 2. Authorization Guard: Candidate must own document, OR caller must hold admin certificate review permission
    const isOwner = session && session.candidateId === ownerCandidateId;
    const isAdmin = adminAuth.authorized;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'FORBIDDEN: এই সনদপত্রটি দেখার অনুমতি আপনার নেই।' }, { status: 403 });
    }

    // 3. File existence check and mime mapping
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'candidate-documents');
    const safeFileName = path.basename(targetDoc.fileName || '');
    const fullFilePath = findPrivateUpload('candidate-documents', safeFileName);

    if (!fs.existsSync(fullFilePath)) {
      // If physical file not found on disk, return document metadata safely
      return NextResponse.json({
        success: true,
        documentMetadata: targetDoc,
        message: 'ডকুমেন্ট মেটাডাটা উপলব্ধ রয়েছে।'
      });
    }

    const fileBuffer = fs.readFileSync(fullFilePath);
    const ext = path.extname(safeFileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFileName}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'ডকুমেন্ট অ্যাক্সেস করতে ত্রুটি হয়েছে' },
      { status: 500 }
    );
  }
}

