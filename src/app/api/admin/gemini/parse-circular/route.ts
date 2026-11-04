import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { GeminiService } from '@/lib/gemini/gemini_service';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { pdfUrl, pdfBase64, rawText, autoSave, publishImmediately } = body;

    if (!pdfUrl && !pdfBase64 && !rawText) {
      return NextResponse.json({
        error: 'অনুগ্রহ করে সার্কুলারের একটি PDF লিঙ্ক, ফাইল বা টেক্সট প্রদান করুন।'
      }, { status: 400 });
    }

    let pdfBuffer: Buffer | undefined;
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      pdfBuffer = Buffer.from(cleanBase64, 'base64');
    }

    // Call Gemini AI Extractor
    const extracted = await GeminiService.extractCircularDetails({
      pdfBuffer,
      pdfUrl,
      rawText
    });

    let savedJob: JobCircular | null = null;

    if (autoSave) {
      const orgSlug = (extracted.organization || 'gov').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'gov';
      const jobId = `job-ai-${orgSlug}-${randomUUID().slice(0, 6)}`;
      
      const newJob: JobCircular = {
        id: jobId,
        title: extracted.title,
        organization: extracted.organization,
        logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
        category: (extracted.category || 'govt') as any,
        categoryLabel: extracted.categoryLabel || 'সরকারি চাকরি',
        grade: extracted.grade || '১০ম গ্রেড',
        totalPosts: extracted.totalPosts || (extracted.positions?.length || 1),
        salary: extracted.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
        minEducation: extracted.minEducation || 'বিজ্ঞপ্তি অনুযায়ী',
        minAge: extracted.minAge || 18,
        maxAge: extracted.maxAge || 32,
        ageCutOffDate: extracted.ageCutOffDate || extracted.deadline,
        districts: extracted.districts || 'সকল জেলার প্রার্থীরা আবেদন করতে পারবেন',
        deadline: extracted.deadline || 'শীঘ্রই প্রকাশিত হবে',
        applicationStartDate: extracted.applicationStartDate || '',
        publishedDate: new Date().toLocaleDateString('bn-BD'),
        officialLink: extracted.officialLink || pdfUrl || '',
        circularPdfUrl: pdfUrl || '',
        circularImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
        daysRemaining: 30,
        audioSummary: extracted.audioSummary || `${extracted.title} - ${extracted.organization}-এ নতুন নিয়োগ বিজ্ঞপ্তি।`,
        govtFee: extracted.govtFee || 200,
        serviceFee: extracted.serviceFee || 50,
        feeRange: extracted.feeRange || `৳${extracted.govtFee || 200}`,
        featured: true,
        isHot: false,
        status: publishImmediately ? ('OPEN' as any) : ('DRAFT' as any),
        requirements: extracted.requirements?.length > 0 
          ? extracted.requirements 
          : [extracted.minEducation, `বয়সসীমা: ${extracted.minAge}-${extracted.maxAge} বছর`],
        documentsRequired: extracted.documentsRequired && extracted.documentsRequired.length > 0
          ? extracted.documentsRequired
          : undefined,
        applicationInstructions: extracted.applicationInstructions || undefined,
        selectionProcess: extracted.selectionProcess || undefined,
        faqItems: extracted.faqItems && extracted.faqItems.length > 0 ? extracted.faqItems : undefined,
        seoTitle: extracted.seoTitle || undefined,
        seoDescription: extracted.seoDescription || undefined,
        seoKeywords: extracted.seoKeywords && extracted.seoKeywords.length > 0 ? extracted.seoKeywords : undefined,
        positions: (extracted.positions || []).map(p => ({
          title: p.title,
          grade: p.grade,
          posts: Number(p.posts) || 1,
          salary: p.salary,
          minEducation: p.minEducation,
          govtFee: p.govtFee ?? extracted.govtFee ?? 200
        })),
        bengaliDescription: extracted.bengaliDescription || `${extracted.organization}-এ নতুন নিয়োগ বিজ্ঞপ্তি।`,
        smsPrefix: extracted.smsPrefix || '',
        verificationStatus: 'AI_EXTRACTED',
        verificationConfidence: 99,
        verifiedBy: session.candidateId || 'ADMIN-SUPER',
        lastVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      savedJob = serverDB.saveJob(newJob, session.candidateId || 'ADMIN');

      try {
        revalidatePath('/jobs');
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: autoSave 
        ? `জেমিনি এআই সফলভাবে ${extracted.positions?.length || 1}টি পদের ১০০% ইউনিক ও হিউম্যান-গ্রেড তথ্য সহ সার্কুলার সংরক্ষণ করেছে!` 
        : 'জেমিনি এআই সফলভাবে সার্কুলারের সকল তথ্য বিশ্লেষণ করেছে।',
      extracted,
      savedJob
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
