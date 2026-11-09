import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';

function isValidUrlOrPath(url?: string): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') return true;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || (trimmed.startsWith('data:') && !trimmed.startsWith('data:image/')) || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:image/');
}

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase().trim();

  let jobs = serverDB.getJobs();

  if (category && category !== 'ALL') {
    jobs = jobs.filter(j => j.category === category);
  }
  if (status && status !== 'ALL') {
    jobs = jobs.filter(j => (j.status || (j.daysRemaining > 0 ? 'OPEN' : 'EXPIRED')).toUpperCase() === status.toUpperCase());
  }
  if (search) {
    jobs = jobs.filter(j => 
      j.title.toLowerCase().includes(search) || 
      j.organization.toLowerCase().includes(search) ||
      (j.id && j.id.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({ success: true, count: jobs.length, jobs });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const jobData: Partial<JobCircular> = await req.json();
    if (!jobData.title?.trim() || !jobData.organization?.trim()) {
      return NextResponse.json({ error: 'বিজ্ঞপ্তির শিরোনাম এবং প্রতিষ্ঠানের নাম আবশ্যক।' }, { status: 400 });
    }

    if (!isValidUrlOrPath(jobData.officialLink)) {
      return NextResponse.json({ error: 'অফিসিয়াল আবেদনের লিংকটি সঠিক নয় (http/https অনুমোদিত)।' }, { status: 400 });
    }
    if (!isValidUrlOrPath(jobData.circularPdfUrl || jobData.pdfUrl)) {
      return NextResponse.json({ error: 'সার্কুলার PDF লিংকটি সঠিক নয়।' }, { status: 400 });
    }
    if (!isValidUrlOrPath(jobData.circularImage)) {
      return NextResponse.json({ error: 'সার্কুলার ছবির লিংকটি সঠিক নয়।' }, { status: 400 });
    }

    const categoryMap: Record<string, string> = {
      govt: 'সরকারি চাকরি',
      bank: 'ব্যাংক জব',
      railway: 'বাংলাদেশ রেলওয়ে',
      defense: 'প্রতিরক্ষা ও পুলিশ',
      teacher: 'শিক্ষক নিয়োগ',
      ngo: 'এনজিও',
      private: 'বেসরকারি',
      company: 'কোম্পানি ও স্বায়ত্তশাসিত',
      health: 'স্বাস্থ্য ও চিকিৎসা',
      engineer: 'প্রকৌশলী ও প্রযুক্তি',
      international: 'প্রবাসী ও আন্তর্জাতিক চাকরি',
      overseas: 'প্রবাসী ও আন্তর্জাতিক চাকরি'
    };

    const chosenCat = jobData.category || 'govt';

    const newJob: JobCircular = {
      id: jobData.id?.trim() || 'job-' + randomUUID(),
      title: jobData.title.trim(),
      organization: jobData.organization.trim(),
      logo: jobData.logo?.trim() || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
      category: chosenCat as any,
      categoryLabel: jobData.categoryLabel?.trim() || categoryMap[chosenCat] || 'সরকারি চাকরি',
      grade: jobData.grade?.trim() || '৯ম গ্রেড',
      totalPosts: Number(jobData.totalPosts) > 0 ? Number(jobData.totalPosts) : 1,
      salary: jobData.salary?.trim() || '২২,০০০ - ৫৩,০৬০ টাকা',
      minEducation: jobData.minEducation?.trim() || 'স্নাতক বা সমমান',
      minAge: Number(jobData.minAge) || 18,
      maxAge: Number(jobData.maxAge) || 32,
      districts: jobData.districts?.trim() || 'সকল জেলা',
      deadline: jobData.deadline?.trim() || '২৫ নভেম্বর ২০২৬',
      daysRemaining: Number.isFinite(Number(jobData.daysRemaining)) ? Number(jobData.daysRemaining) : 15,
      govtFee: Number(jobData.govtFee) || 0,
      serviceFee: Number(jobData.serviceFee) || 0,
      officialLink: jobData.officialLink?.trim() || 'https://alljobs.teletalk.com.bd',
      circularImage: jobData.circularImage?.trim() || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      circularPdfUrl: jobData.circularPdfUrl?.trim() || jobData.pdfUrl?.trim() || '',
      circularPages: Array.isArray(jobData.circularPages) ? jobData.circularPages : [],
      audioSummary: jobData.audioSummary?.trim() || `${jobData.title} প্রকাশিত হয়েছে। আবেদনের শেষ সময় ${jobData.deadline || 'শীঘ্রই'}।`,
      publishedDate: jobData.publishedDate?.trim() || new Date().toLocaleDateString('bn-BD'),
      requirements: Array.isArray(jobData.requirements) && jobData.requirements.length > 0 
        ? jobData.requirements.filter(r => Boolean(r && r.trim())) 
        : [jobData.minEducation || 'স্নাতক বা সমমান', 'বয়স: ১৮-৩২ বছর'],
      positions: Array.isArray(jobData.positions) ? jobData.positions : [],
      feeRange: jobData.feeRange?.trim() || '',
      ageCutOffDate: jobData.ageCutOffDate?.trim() || '2026-11-01',
      smsPrefix: jobData.smsPrefix?.trim() || '',
      minCgpa: jobData.minCgpa ? Number(jobData.minCgpa) : undefined,
      minDivision: jobData.minDivision,
      allowThirdDivision: jobData.allowThirdDivision ?? true,
      minFirstDivisionsCount: Number(jobData.minFirstDivisionsCount) || 0,
      documentsRequired: Array.isArray(jobData.documentsRequired) ? jobData.documentsRequired.filter(Boolean) : [],
      bengaliDescription: jobData.bengaliDescription?.trim() || '',
      faqItems: Array.isArray(jobData.faqItems) ? jobData.faqItems : [],
      seoTitle: jobData.seoTitle?.trim() || `${jobData.title} - ${jobData.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬`,
      seoDescription: jobData.seoDescription?.trim() || `${jobData.organization}-এ ${jobData.title} পদে নিয়োগ বিজ্ঞপ্তি প্রকাশ হয়েছে।`,
      seoKeywords: Array.isArray(jobData.seoKeywords) 
        ? jobData.seoKeywords 
        : (typeof jobData.seoKeywords === 'string' ? (jobData.seoKeywords as string).split(',').map((k: string) => k.trim()).filter(Boolean) : []),
      slug: (jobData.slug?.trim() || jobData.id || '').toLowerCase().replace(/[^a-z0-9-]/g, ''),
      refNo: jobData.refNo?.trim() || '',
      designation: jobData.designation?.trim() || jobData.title.trim(),
      eligibility: jobData.eligibility?.trim() || '',
      status: jobData.status || 'published',
      featured: Boolean(jobData.featured),
      isHot: Boolean(jobData.isHot),
      orgType: jobData.orgType?.trim() || '',
      subCategory: jobData.subCategory?.trim() || '',
      employmentType: jobData.employmentType || 'full_time',
      workArrangement: jobData.workArrangement || 'on_site',
      division: jobData.division?.trim() || '',
      district: jobData.district?.trim() || '',
      upazila: jobData.upazila?.trim() || '',
      salaryType: jobData.salaryType || 'range',
      applicationStartDate: jobData.applicationStartDate?.trim() || '',
      applicationMethod: jobData.applicationMethod || 'online_teletalk',
      applicationInstructions: jobData.applicationInstructions?.trim() || '',
      selectionProcess: jobData.selectionProcess?.trim() || '',
      experienceYears: jobData.experienceYears?.trim() || '',
      skills: Array.isArray(jobData.skills) ? jobData.skills.filter(Boolean) : [],
      canonicalUrl: jobData.canonicalUrl?.trim() || '',
      robotsDirective: jobData.robotsDirective?.trim() || 'index, follow',
      ogImage: jobData.ogImage?.trim() || '',
      twitterImage: jobData.twitterImage?.trim() || '',
      verificationStatus: jobData.verificationStatus || 'MANUAL_ENTERED',
      verificationConfidence: Number(jobData.verificationConfidence) || 100,
      verificationNotes: jobData.verificationNotes?.trim() || 'ম্যানুয়ালি অ্যাডমিন কর্তৃক তৈরিকৃত',
      lastVerifiedAt: jobData.lastVerifiedAt || new Date().toISOString(),
      verifiedBy: session.candidateId || 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (serverDB.getJobById(newJob.id)) {
      return NextResponse.json({ error: 'A job with this ID already exists.' }, { status: 409 });
    }
    const saved = serverDB.saveJob(newJob, session.candidateId);
    try {
      revalidatePath('/jobs');
      revalidatePath('/');
      revalidatePath('/latest-jobs');
      revalidatePath('/todays-jobs');
      revalidatePath('/daily-jobs');
      revalidatePath('/featured-jobs');
      revalidatePath('/updated-circulars');
      revalidatePath('/admin');
    } catch {}
    return NextResponse.json({ success: true, job: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const jobIds: string[] = Array.isArray(body.jobIds) 
      ? body.jobIds 
      : (body.jobId ? [body.jobId] : []);

    if (jobIds.length === 0) {
      return NextResponse.json({ error: 'মুছে ফেলার জন্য কোনো সার্কুলার আইডি পাওয়া যায়নি।' }, { status: 400 });
    }

    let deletedCount = 0;
    for (const id of jobIds) {
      if (serverDB.deleteJob(id, session.candidateId || 'ADMIN')) {
        deletedCount++;
      }
    }

    try {
      revalidatePath('/jobs');
      revalidatePath('/');
      revalidatePath('/latest-jobs');
      revalidatePath('/todays-jobs');
      revalidatePath('/daily-jobs');
      revalidatePath('/featured-jobs');
      revalidatePath('/updated-circulars');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      message: `${deletedCount}টি সার্কুলার সফলভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে।`,
      deletedCount
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const jobIds: string[] = Array.isArray(body.jobIds) ? body.jobIds : [];
    const status: string = body.status;

    if (jobIds.length === 0) {
      return NextResponse.json({ error: 'কোনো সার্কুলার আইডি পাওয়া যায়নি।' }, { status: 400 });
    }

    let updatedCount = 0;
    for (const id of jobIds) {
      const job = serverDB.getJobById(id);
      if (job) {
        serverDB.saveJob({
          ...job,
          id: job.id,
          status: (status || 'OPEN') as any,
          updatedAt: new Date().toISOString()
        }, session.candidateId || 'ADMIN');
        updatedCount++;
      }
    }

    try {
      revalidatePath('/jobs');
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      message: `${updatedCount}টি সার্কুলারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।`,
      updatedCount
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: 'সার্কুলার আইডি আবশ্যক।' }, { status: 400 });
    }

    const existing = serverDB.getJobById(id);
    if (!existing) {
      return NextResponse.json({ error: 'সংশ্লিষ্ট সার্কুলারটি পাওয়া যায়নি।' }, { status: 404 });
    }

    const updated = {
      ...existing,
      ...body,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };

    serverDB.saveJob(updated, session.candidateId || 'ADMIN');

    try {
      revalidatePath('/jobs');
      revalidatePath(`/jobs/${id}`);
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'সার্কুলার সফলভাবে আপডেট করা হয়েছে।',
      job: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
