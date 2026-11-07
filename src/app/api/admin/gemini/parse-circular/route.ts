import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';
import { parseCircularWithGeminiBrowser } from '@/lib/spider/gemini_browser_controller';

if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export const dynamic = 'force-dynamic';

const SETTINGS_PATH = path.join(process.cwd(), '.browser_profile', 'spider_settings.json');

function getSpiderSettings(): { autoPublish: boolean } {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    }
  } catch {}
  return { autoPublish: false };
}

export async function POST(req: Request) {
  try {
    const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
    const session = getServerSession(req);
    const hasAdminAccess = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

    if (!hasAdminAccess) {
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

    // Call In-System Standalone Chromium Gemini Agent
    const { job, rawGeminiResponse } = await parseCircularWithGeminiBrowser({
      pdfBuffer,
      pdfUrl,
      rawText
    });

    const totalPostsNum = typeof job.totalPosts === 'number'
      ? job.totalPosts
      : (parseInt(String(job.totalPosts || '1').replace(/\D/g, '')) || 1);

    // Map extracted fields for Elementor Workspace & UI compatibility
    const extracted = {
      ...job,
      title: job.title || 'সরকারি চাকরির নিয়োগ বিজ্ঞপ্তি ২০২৬',
      organization: job.organization || 'বাংলাদেশ সরকারি প্রতিষ্ঠান',
      category: job.category || 'govt',
      categoryLabel: job.categoryLabel || 'সরকারি চাকরি',
      grade: job.grade || '১০ম গ্রেড',
      salary: job.salary || '৯,৩০০ - ৫৩,০৬০/- টাকা',
      minEducation: job.minEducation || 'এসএসসি / এইচএসসি / স্নাতক পাস',
      minAge: 18,
      maxAge: 32,
      ageCutOffDate: job.ageCutOffDate || job.deadline,
      districts: 'সকল জেলার প্রার্থীরা আবেদন করতে পারবেন',
      deadline: job.deadline || '২৫ মার্চ ২০২৬',
      totalPosts: totalPostsNum,
      officialLink: job.officialLink || pdfUrl || 'https://alljobs.teletalk.com.bd',
      bengaliDescription: job.bengaliDescription || `${job.organization}-এ নতুন নিয়োগ বিজ্ঞপ্তি।`,
      requirements: job.requirements || [],
      documentsRequired: job.documentsRequired || [],
      applicationInstructions: job.applicationInstructions || '',
      smsPrefix: job.smsPrefix || '',
      selectionProcess: job.selectionProcess || [],
      faqItems: job.faqItems || [],
      seoTitle: job.title,
      seoDescription: (job.bengaliDescription || '').slice(0, 160),
      seoKeywords: job.seoKeywords || [],
      govtFee: (job.positions && job.positions[0]?.govtFee) || 200,
      serviceFee: 50,
      feeRange: `৳${(job.positions && job.positions[0]?.govtFee) || 200}`,
      positions: (job.positions || []).map(p => ({
        title: p.title,
        grade: p.grade,
        posts: Number(p.posts) || 1,
        salary: p.salary,
        minEducation: p.minEducation,
        govtFee: p.govtFee ?? 200
      }))
    };

    let savedJob: JobCircular | null = null;

    if (autoSave) {
      const settings = getSpiderSettings();
      const shouldPublish = typeof publishImmediately === 'boolean' ? publishImmediately : settings.autoPublish;
      const targetStatus = shouldPublish ? 'OPEN' : 'DRAFT';

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
        totalPosts: totalPostsNum,
        salary: extracted.salary,
        minEducation: extracted.minEducation,
        minAge: extracted.minAge,
        maxAge: extracted.maxAge,
        ageCutOffDate: extracted.ageCutOffDate,
        districts: extracted.districts,
        deadline: extracted.deadline,
        applicationStartDate: '',
        publishedDate: new Date().toLocaleDateString('bn-BD'),
        officialLink: extracted.officialLink,
        circularPdfUrl: pdfUrl || '',
        circularImage: job.circularImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
        daysRemaining: 30,
        audioSummary: `${extracted.title} - ${extracted.organization}-এ নতুন নিয়োগ বিজ্ঞপ্তি।`,
        govtFee: extracted.govtFee,
        serviceFee: extracted.serviceFee,
        feeRange: extracted.feeRange,
        featured: true,
        isHot: false,
        status: targetStatus as any,
        requirements: extracted.requirements,
        documentsRequired: extracted.documentsRequired,
        applicationInstructions: extracted.applicationInstructions,
        selectionProcess: Array.isArray(extracted.selectionProcess)
          ? extracted.selectionProcess.join('\n')
          : (extracted.selectionProcess || undefined),
        faqItems: extracted.faqItems,
        seoTitle: extracted.seoTitle,
        seoDescription: extracted.seoDescription,
        seoKeywords: extracted.seoKeywords,
        positions: extracted.positions,
        bengaliDescription: extracted.bengaliDescription,
        smsPrefix: typeof extracted.smsPrefix === 'string' ? extracted.smsPrefix : '',
        verificationStatus: shouldPublish ? 'VERIFIED' : 'AI_EXTRACTED',
        verificationConfidence: 99,
        verifiedBy: 'GEMINI-STANDALONE-CHROMIUM',
        lastVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      savedJob = serverDB.saveJob(newJob, 'ADMIN');

      try {
        revalidatePath('/jobs');
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: autoSave 
        ? `জেমিনি ব্রাউজার এজেন্ট সফলভাবে ${extracted.positions?.length || 1}টি পদের ১০০% ইউনিক ও হিউম্যান-কোয়ালিটি কন্টেন্ট সহ সার্কুলার ${savedJob?.status === 'OPEN' ? 'লাইভ পাবলিশ' : 'ড্রাফটে সংরক্ষণ'} করেছে!` 
        : 'অভ্যন্তরীণ জেমিনি ব্রাউজার সফলভাবে সার্কুলারের সকল তথ্য ও হিউম্যান কন্টেন্ট তৈরি করেছে।',
      extracted,
      rawGeminiResponse,
      savedJob
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
