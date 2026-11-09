import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';

export const dynamic = 'force-dynamic';

function isValidUrlOrPath(url?: string): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') return true;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || (trimmed.startsWith('data:') && !trimmed.startsWith('data:image/')) || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:image/');
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Job ID required' }, { status: 400 });

    const job = serverDB.getJobById(id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Job ID required' }, { status: 400 });

    const existing = serverDB.getJobById(id);
    if (!existing) {
      return NextResponse.json({ error: 'সংশ্লিষ্ট সার্কুলারটি পাওয়া যায়নি।' }, { status: 404 });
    }

    const body: Partial<JobCircular> = await req.json();

    if (body.title && !body.title.trim()) {
      return NextResponse.json({ error: 'বিজ্ঞপ্তির শিরোনাম আবশ্যক।' }, { status: 400 });
    }
    if (body.organization && !body.organization.trim()) {
      return NextResponse.json({ error: 'প্রতিষ্ঠানের নাম আবশ্যক।' }, { status: 400 });
    }

    if (body.officialLink && !isValidUrlOrPath(body.officialLink)) {
      return NextResponse.json({ error: 'অফিসিয়াল আবেদনের লিংকটি সঠিক নয়।' }, { status: 400 });
    }
    if (body.circularPdfUrl && !isValidUrlOrPath(body.circularPdfUrl)) {
      return NextResponse.json({ error: 'সার্কুলার PDF লিংকটি সঠিক নয়।' }, { status: 400 });
    }

    const updatedJob: JobCircular = {
      ...existing,
      ...body,
      id: existing.id,
      title: body.title !== undefined ? body.title.trim() : existing.title,
      organization: body.organization !== undefined ? body.organization.trim() : existing.organization,
      category: body.category || existing.category,
      categoryLabel: body.categoryLabel || existing.categoryLabel,
      grade: body.grade || existing.grade,
      totalPosts: body.totalPosts !== undefined ? Number(body.totalPosts) : existing.totalPosts,
      salary: body.salary || existing.salary,
      minEducation: body.minEducation || existing.minEducation,
      minAge: body.minAge !== undefined ? Number(body.minAge) : existing.minAge,
      maxAge: body.maxAge !== undefined ? Number(body.maxAge) : existing.maxAge,
      ageCutOffDate: body.ageCutOffDate || existing.ageCutOffDate,
      districts: body.districts || existing.districts,
      deadline: body.deadline || existing.deadline,
      govtFee: body.govtFee !== undefined ? Number(body.govtFee) : existing.govtFee,
      serviceFee: body.serviceFee !== undefined ? Number(body.serviceFee) : existing.serviceFee,
      feeRange: body.feeRange || existing.feeRange,
      officialLink: body.officialLink !== undefined ? body.officialLink.trim() : existing.officialLink,
      circularPdfUrl: body.circularPdfUrl !== undefined ? body.circularPdfUrl.trim() : existing.circularPdfUrl,
      circularImage: body.circularImage || existing.circularImage,
      bengaliDescription: body.bengaliDescription !== undefined ? body.bengaliDescription.trim() : existing.bengaliDescription,
      requirements: Array.isArray(body.requirements) ? body.requirements : existing.requirements,
      documentsRequired: Array.isArray(body.documentsRequired) ? body.documentsRequired : existing.documentsRequired,
      applicationInstructions: body.applicationInstructions !== undefined ? body.applicationInstructions.trim() : existing.applicationInstructions,
      selectionProcess: body.selectionProcess !== undefined ? body.selectionProcess.trim() : existing.selectionProcess,
      faqItems: Array.isArray(body.faqItems) ? body.faqItems : existing.faqItems,
      audioSummary: body.audioSummary || existing.audioSummary,
      seoTitle: body.seoTitle || existing.seoTitle,
      seoDescription: body.seoDescription || existing.seoDescription,
      seoKeywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : existing.seoKeywords,
      smsPrefix: body.smsPrefix !== undefined ? body.smsPrefix.trim() : existing.smsPrefix,
      positions: Array.isArray(body.positions) ? body.positions : existing.positions,
      status: body.status || existing.status,
      updatedAt: new Date().toISOString()
    };

    serverDB.saveJob(updatedJob, session.candidateId || 'ADMIN');

    try {
      revalidatePath(`/jobs/${id}`);
      revalidatePath('/jobs');
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'সার্কুলার সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!',
      job: updatedJob
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Job ID required' }, { status: 400 });

    const existing = serverDB.getJobById(id);
    if (!existing) {
      return NextResponse.json({ error: 'সার্কুলারটি পাওয়া যায়নি।' }, { status: 404 });
    }

    serverDB.deleteJob(id, session.candidateId || 'ADMIN');

    try {
      revalidatePath('/jobs');
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      message: `"${existing.title}" সার্কুলারটি সফলভাবে মুছে ফেলা হয়েছে।`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
