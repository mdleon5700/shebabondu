import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { findPrivateUpload } from '@/lib/private-uploads';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  try {
    const session = getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const filename = path.basename(params.filename);
    if (session.role !== 'admin' && !serverDB.getApplications(session.candidateId).some(app => {
      const url = app.applicantCopyPdfUrl || '';
      return url.split('/').pop() === filename;
    })) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const filePath = findPrivateUpload('applicant-copies', filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = 'application/pdf';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline; filename="' + filename + '"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
