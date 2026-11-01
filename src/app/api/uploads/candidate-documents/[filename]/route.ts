import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { AdminGovernanceRbac } from '@/lib/governance';
import { serverDB } from '@/lib/db';
import { SyntheticUserManager } from '@/lib/testing/synthetic/synthetic-user-manager';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const rawFilename = params.filename;
    if (
      !rawFilename ||
      rawFilename.includes('..') ||
      rawFilename.includes('/') ||
      rawFilename.includes('\\') ||
      rawFilename.includes('%2e') ||
      rawFilename.includes('%2f') ||
      rawFilename.includes('%5c')
    ) {
      return NextResponse.json({ error: 'Invalid filename or path traversal detected' }, { status: 400 });
    }

    const filename = path.basename(rawFilename);

    // Identify owner candidate
    let ownerCandidateId: string = '';
    let targetDoc: any = null;

    const synthDoc = SyntheticUserManager.findDocument(filename);
    if (synthDoc) {
      ownerCandidateId = synthDoc.candidateId;
      targetDoc = synthDoc.doc;
    } else {
      const allCandidates = serverDB.getAllCandidates();
      for (const cand of allCandidates) {
        const docs = serverDB.getDocuments(cand.id);
        const found = docs.find((d: any) => d.fileName === filename || d.fileName?.includes(filename));
        if (found) {
          targetDoc = found;
          ownerCandidateId = cand.id;
          break;
        }
      }
    }

    if (!ownerCandidateId) {
      const match = filename.match(/^([a-zA-Z0-9_-]+?)_[a-zA-Z0-9_-]+_\d+\.[a-zA-Z0-9]+$/);
      if (match) {
        ownerCandidateId = match[1];
      }
    }

    // Authorization Guard
    const session = getServerSession(req);
    const adminAuth = AdminGovernanceRbac.authorizeRequest(req, 'certificates.review');
    const adminKeyHeader = req.headers.get('x-admin-key');
    const isSecretAdmin = adminKeyHeader === (process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026');

    const isAdmin = adminAuth.authorized || isSecretAdmin;
    const isOwner = session && session.candidateId && (session.candidateId === ownerCandidateId);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'FORBIDDEN: You do not have permission to access this candidate document.' },
        { status: 403 }
      );
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', 'candidate-documents', filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Document file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline; filename="' + filename + '"',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error serving document' }, { status: 500 });
  }
}
