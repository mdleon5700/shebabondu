import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';

function isValidUrlOrPath(url?: string): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') return true;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const job = serverDB.getJobByIdOrSlug(params.id);
  if (!job) {
    return NextResponse.json({ error: 'বিজ্ঞপ্তিটি পাওয়া যায়নি।' }, { status: 404 });
  }

  return NextResponse.json({ success: true, job });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const jobData: Partial<JobCircular> = await req.json();

    if (jobData.title !== undefined && !jobData.title?.trim()) {
      return NextResponse.json({ error: 'বিজ্ঞপ্তির শিরোনাম খালি রাখা যাবে না।' }, { status: 400 });
    }
    if (jobData.organization !== undefined && !jobData.organization?.trim()) {
      return NextResponse.json({ error: 'প্রতিষ্ঠানের নাম খালি রাখা যাবে না।' }, { status: 400 });
    }

    if (!isValidUrlOrPath(jobData.officialLink)) {
      return NextResponse.json({ error: 'অফিসিয়াল আবেদনের লিংকটি সঠিক নয়।' }, { status: 400 });
    }
    if (!isValidUrlOrPath(jobData.circularPdfUrl || jobData.pdfUrl)) {
      return NextResponse.json({ error: 'সার্কুলার PDF লিংকটি সঠিক নয়।' }, { status: 400 });
    }
    if (!isValidUrlOrPath(jobData.circularImage)) {
      return NextResponse.json({ error: 'সার্কুলার ছবির লিংকটি সঠিক নয়।' }, { status: 400 });
    }

    const payload: Partial<JobCircular> & { id: string } = {
      ...jobData,
      id: params.id,
      updatedAt: new Date().toISOString()
    };

    if (jobData.slug) {
      payload.slug = jobData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    const saved = serverDB.saveJob(payload, session.candidateId || 'ADMIN');
    return NextResponse.json({ success: true, job: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const deleted = serverDB.deleteJob(params.id, session.candidateId || 'ADMIN');
  return NextResponse.json({ success: deleted });
}
