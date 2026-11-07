import fs from 'fs';
import path from 'path';
import { resolveCircularInput, KNOWN_TELETALK_ORGS } from '../src/lib/collector/alljobs_smart_resolver';
import { parseCircularWithGeminiBrowser } from '../src/lib/spider/gemini_browser_controller';
import { serverDB } from '../src/lib/db';
import { JobCircular } from '../src/lib/types';

interface AuditResult {
  source: string;
  success: boolean;
  jobId?: string;
  orgName?: string;
  title?: string;
  posts?: number;
  deadline?: string;
  officialLink?: string;
  pdfUrl?: string;
  positionsCount?: number;
  hasEditorialOverview?: boolean;
  hasSmsFormat?: boolean;
  hasFaqs?: boolean;
  hasSeo?: boolean;
  issues: string[];
  durationMs: number;
}

// 1. Fetch real active jobs from AllJobs API
async function fetchActiveAllJobsList(): Promise<Array<{ id: number; title: string; orgId: number }>> {
  try {
    const res = await fetch('https://alljobs.teletalk.com.bd/api/v1/govt-jobs?page=1&limit=20', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.ok) {
      const data = await res.json();
      const list = data.data || data.results || data.jobs || [];
      return list.map((item: any) => ({
        id: item.id || item.job_id,
        title: item.job_title_bn || item.job_title,
        orgId: item.govt_organization_id || item.organization_id || 0
      })).filter((x: any) => x.id);
    }
  } catch (err: any) {
    console.warn('AllJobs listing fetch failed:', err.message);
  }
  return [];
}

async function auditAndProcessSingleJob(inputUrlOrPdf: string): Promise<AuditResult> {
  const start = Date.now();
  const issues: string[] = [];

  try {
    // 1. Resolve Circular Input (Smart Resolver)
    const resolved = await resolveCircularInput(inputUrlOrPdf);
    if (!resolved) {
      return {
        source: inputUrlOrPdf,
        success: false,
        issues: ['Failed to resolve input source'],
        durationMs: Date.now() - start
      };
    }

    // 2. Process with Autonomous AI Engine
    const { job } = await parseCircularWithGeminiBrowser({
      pdfUrl: resolved.circularPdfUrl || inputUrlOrPdf,
      rawText: resolved.rawText
    });

    const finalOrg = resolved.organization || job.organization || '';
    const finalTitle = resolved.title || job.title || '';
    const finalPosts = resolved.totalPosts || (typeof job.totalPosts === 'number' ? job.totalPosts : 1);
    const finalDeadline = resolved.deadline || job.deadline || '';
    const officialLink = resolved.officialLink || job.officialLink || '';
    const pdfUrl = resolved.circularPdfUrl || job.circularPdfUrl || '';
    const positions = resolved.positions && resolved.positions.length > 0 ? resolved.positions : (job.positions || []);

    // 3. Verification & Auditing Checks
    if (!finalOrg || finalOrg === 'সরকারি প্রতিষ্ঠান' || finalOrg.match(/^[a-zA-Z\s,().&-]+$/)) {
      issues.push(`Organization is generic or in English: "${finalOrg}"`);
    }

    if (!finalTitle || finalTitle.includes('undefined')) {
      issues.push(`Invalid job title: "${finalTitle}"`);
    }

    if (!finalPosts || finalPosts <= 0) {
      issues.push(`Zero or invalid vacancies: ${finalPosts}`);
    }

    if (!finalDeadline || finalDeadline === 'বিজ্ঞপ্তি অনুযায়ী' || finalDeadline.includes('undefined')) {
      issues.push(`Unresolved or generic deadline: "${finalDeadline}"`);
    }

    if (!officialLink || !officialLink.startsWith('http')) {
      issues.push(`Invalid official application link: "${officialLink}"`);
    }

    if (!pdfUrl) {
      issues.push('Missing circular PDF URL');
    }

    if (!positions || positions.length === 0) {
      issues.push('No positions extracted');
    }

    const hasEditorialOverview = Boolean((job.bengaliDescription || '').length > 100);
    if (!hasEditorialOverview) {
      issues.push('Editorial overview is missing or too short');
    }

    const hasSmsFormat = Boolean((job.smsFormat || '').includes('16222') || (job.applicationInstructions || '').includes('16222') || (job.applicationInstructions || '').includes('টেলিটক'));
    if (!hasSmsFormat) {
      issues.push('Missing 16222 SMS instructions');
    }

    const hasFaqs = Boolean(Array.isArray(job.faqItems) && job.faqItems.length >= 2);
    if (!hasFaqs) {
      issues.push('Insufficient FAQs');
    }

    const hasSeo = Boolean(job.seoTitle && (job.seoDescription || job.bengaliDescription));
    if (!hasSeo) {
      issues.push('Missing SEO title or description');
    }

    // 4. Save/Update Verified Job in serverDB
    const jobId = resolved.jobId?.startsWith('job-') ? resolved.jobId : `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullJobRecord: JobCircular = {
      id: jobId,
      title: finalTitle,
      organization: finalOrg,
      logo: '/icons/icon-192x192.png',
      category: resolved.category || 'govt',
      categoryLabel: resolved.categoryLabel || 'সরকারি চাকরি',
      grade: resolved.grade || positions[0]?.grade || '১০ম গ্রেড',
      salary: resolved.salary || positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
      minEducation: positions[0]?.minEducation || 'এইচএসসি / স্নাতক বা সমমান পাস',
      minAge: resolved.minAge || 18,
      maxAge: resolved.maxAge || 32,
      ageCutOffDate: resolved.deadline || finalDeadline,
      districts: 'সকল জেলার প্রার্থীরা আবেদন করতে পারবেন',
      deadline: finalDeadline,
      publishedDate: resolved.publishedDate || 'সম্প্রতি প্রকাশিত',
      totalPosts: finalPosts,
      daysRemaining: 18,
      audioSummary: '',
      officialLink,
      applicationUrl: officialLink,
      circularPdfUrl: pdfUrl,
      smsPrefix: (KNOWN_TELETALK_ORGS as any)[finalOrg.toLowerCase()]?.smsPrefix || 'GOVT',
      status: 'PUBLISHED',
      bengaliDescription: job.bengaliDescription || '',
      requirements: job.requirements || ['প্রার্থীকে বাংলাদেশের নাগরিক হতে হবে।'],
      documentsRequired: job.documentsRequired || ['সকল সনদপত্রের সত্যায়িত কপি', 'জাতীয় পরিচয়পত্র'],
      applicationInstructions: job.applicationInstructions || `অনলাইনে ${officialLink} ওয়েবসাইটের মাধ্যমে নির্ধারিত সময়ের মধ্যে আবেদনপত্র পূরণ করতে হবে।`,
      smsFormat: job.smsFormat || '১ম SMS: PREFIX <Space> User ID লিখে পাঠিয়ে দিন 16222 নম্বরে।',
      selectionProcess: typeof job.selectionProcess === 'string' ? job.selectionProcess : '১. লিখিত পরীক্ষা\n২. কম্পিউটার/ব্যবহারিক পরীক্ষা\n৩. মৌখিক পরীক্ষা',
      faqItems: job.faqItems || [
        { question: `${finalOrg}-এ আবেদনের শেষ তারিখ কবে?`, answer: `বিজ্ঞপ্তি অনুযায়ী আবেদন জমা দেওয়ার শেষ তারিখ ${finalDeadline}।` },
        { question: 'আবেদন কীভাবে করতে হবে?', answer: `অনলাইনে ${officialLink} পোর্টালে ফরম পূরণ করতে হবে।` }
      ],
      seoTitle: `${finalTitle} | চাকরি সেবা`,
      seoDescription: `${finalOrg}-এ ${finalTitle} প্রকাশ। মোট পদসংখ্যা: ${finalPosts}টি। আবেদনের শেষ সময়: ${finalDeadline}। অনলাইনে আবেদনের নিয়মাবলী ও বিস্তারিত জানুন।`,
      seoKeywords: [`${finalOrg} নিয়োগ বিজ্ঞপ্তি`, 'সরকারি চাকরি ২০২৬', 'alljobs teletalk'],
      positions: positions.map((p, idx) => ({
        id: `pos-${idx + 1}`,
        title: p.title,
        posts: p.posts || 1,
        salary: p.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
        grade: p.grade || '১০ম গ্রেড',
        minEducation: p.minEducation || 'এইচএসসি / স্নাতক পাস',
        govtFee: p.govtFee || 200
      })),
      govtFee: positions[0]?.govtFee || 200,
      serviceFee: 50,
      feeRange: `৳${positions[0]?.govtFee || 200}`,
      circularImage: job.circularImage || '/images/hero-banner.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    serverDB.saveJob(fullJobRecord);

    return {
      source: inputUrlOrPdf,
      success: issues.length === 0,
      jobId,
      orgName: finalOrg,
      title: finalTitle,
      posts: finalPosts,
      deadline: finalDeadline,
      officialLink,
      pdfUrl,
      positionsCount: positions.length,
      hasEditorialOverview,
      hasSmsFormat,
      hasFaqs,
      hasSeo,
      issues,
      durationMs: Date.now() - start
    };
  } catch (err: any) {
    return {
      source: inputUrlOrPdf,
      success: false,
      issues: [`Execution exception: ${err.message}`],
      durationMs: Date.now() - start
    };
  }
}

async function runMasterAudit() {
  console.log('====================================================');
  console.log('🚀 STARTING MASTER HUMAN-ACTION JOB PROCESSOR & AUDIT');
  console.log('====================================================\n');

  // Candidate sources to process & audit
  const targetSources: string[] = [
    // 1. Specific User Reported Links
    'https://alljobs.teletalk.com.bd/jobs/government/445?jobId=14989', // Petrobangla
    'https://alljobs.teletalk.com.bd/jobs/government/397?jobId=15104', // CPGCBL
    
    // 2. Major Teletalk Portal Circulars
    'http://bogmc.teletalk.com.bd',
    'http://breb.teletalk.com.bd',
    'http://dgms.teletalk.com.bd',
    'http://bpsc.teletalk.com.bd',
    'http://dghs.teletalk.com.bd',
    'http://dgfp.teletalk.com.bd',
    'http://dshe.teletalk.com.bd',
    'http://dpe.teletalk.com.bd',
    'http://br.teletalk.com.bd',
    'http://bpdb.teletalk.com.bd',
    'http://bforest.teletalk.com.bd',
    'http://bwdb.teletalk.com.bd',
    'http://bbs.teletalk.com.bd'
  ];

  // Try fetching additional live IDs from AllJobs API
  const liveAllJobs = await fetchActiveAllJobsList();
  if (liveAllJobs.length > 0) {
    console.log(`📡 Fetched ${liveAllJobs.length} live jobs from AllJobs API`);
    for (const item of liveAllJobs.slice(0, 5)) {
      const url = `https://alljobs.teletalk.com.bd/jobs/government/${item.orgId}?jobId=${item.id}`;
      if (!targetSources.includes(url)) {
        targetSources.push(url);
      }
    }
  }

  console.log(`📋 Total Job Targets to Process & Audit: ${targetSources.length}\n`);

  const results: AuditResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < targetSources.length; i++) {
    const src = targetSources[i];
    console.log(`[${i + 1}/${targetSources.length}] Processing: ${src}...`);
    const res = await auditAndProcessSingleJob(src);
    results.push(res);

    if (res.success) {
      successCount++;
      console.log(`   ✅ PASS: [${res.orgName}] ${res.title}`);
      console.log(`      Posts: ${res.posts} | Deadline: ${res.deadline} | Positions: ${res.positionsCount} | Time: ${res.durationMs}ms`);
    } else {
      failCount++;
      console.log(`   ⚠️ ISSUES (${res.issues.length}):`);
      res.issues.forEach(iss => console.log(`      - ${iss}`));
      console.log(`      Org: ${res.orgName || 'N/A'} | Title: ${res.title || 'N/A'} | Time: ${res.durationMs}ms`);
    }
    console.log('');
  }

  console.log('====================================================');
  console.log('📊 AUDIT SUMMARY:');
  console.log(`   Total Processed: ${targetSources.length}`);
  console.log(`   100% Clean Pass: ${successCount}`);
  console.log(`   Warnings/Issues: ${failCount}`);
  console.log('====================================================\n');

  // Save audit report as JSON
  fs.writeFileSync(
    path.resolve(process.cwd(), 'audit_report.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log('💾 Saved detailed audit report to audit_report.json');
}

runMasterAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
