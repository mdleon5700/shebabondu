import { parseTeletalkHtml, extractEmbeddedJsonNotices, extractPaginationUrls } from '../src/lib/collector/html_parser';
import { normalizeCircularNotice, calculateDuplicateMatch } from '../src/lib/collector/normalizer';
import { generateBengaliJobContentWithGemini, generateDeterministicBengaliContent } from '../src/lib/collector/gemini_job_writer';
import { serverDB } from '../src/lib/db';
import { JobSource, CircularDraft } from '../src/lib/types';

async function runPipelineVerification() {
  console.log('=== STARTING ALLJOBS TELETALK PIPELINE VERIFICATION ===\n');

  const mockSource: JobSource = {
    id: 'test-alljobs-source',
    name: 'Teletalk Alljobs Portal',
    sourceUrl: 'https://alljobs.teletalk.com.bd/circulars',
    type: 'official_portal',
    fetchStatus: 'active',
    lastFetchedAt: new Date().toISOString(),
    autoSync: true
  };

  // TEST 1: Standard HTML parsing & cancellation detection
  console.log('--- Test 1: HTML Parser & Cancellation Detection ---');
  const normalHtml = `
    <div class="job-card">
      <h3 class="job-title">কম্পিউটার অপারেটর (Computer Operator)</h3>
      <p class="organization">বাংলাদেশ ডাক বিভাগ</p>
      <span>পদসংখ্যা: ৫টি</span>
      <span>আবেদনের শেষ তারিখ: ১৫ ডিসেম্বর ২০২৬</span>
      <a href="https://alljobs.teletalk.com.bd/circular/post-101.pdf">ডাউনলোড সার্কুলার</a>
      <a href="https://alljobs.teletalk.com.bd/apply/101">বিস্তারিত আবেদন</a>
    </div>
  `;
  const parsed1 = parseTeletalkHtml(normalHtml, mockSource);
  console.log(`Discovered: ${parsed1.discoveredCount}, Valid: ${parsed1.validCount}`);
  if (parsed1.discoveredCount !== 1) throw new Error('Expected 1 notice discovered');
  console.log('✓ Normal HTML parsing passed.');

  const cancelHtml = `
    <div class="job-card">
      <h3 class="job-title">নিয়োগ স্থগিতকরণ সংক্রান্ত বিজ্ঞপ্তি</h3>
      <p class="organization">বাংলাদেশ রেলওয়ে</p>
      <span>বিজ্ঞপ্তি বাতিল ও স্থগিত</span>
      <span>আবেদনের শেষ তারিখ: ২০ নভেম্বর ২০২৬</span>
      <a href="https://alljobs.teletalk.com.bd/circular/cancel.pdf">নোটিশ</a>
    </div>
  `;
  const parsedCancel = parseTeletalkHtml(cancelHtml, mockSource);
  console.log(`Cancellation notice detected needsReview: ${parsedCancel.rawNotices[0]?.needsReview}, isCancelled: ${parsedCancel.rawNotices[0]?.isCancelledNotice}`);
  if (!parsedCancel.rawNotices[0]?.isCancelledNotice) throw new Error('Cancellation notice was not flagged!');
  console.log('✓ Cancellation notice properly detected and flagged.');

  // TEST 2: Embedded JSON-LD parsing
  console.log('\n--- Test 2: Embedded JSON-LD / SPA Parser ---');
  const spaHtml = `
    <script type="application/ld+json">
    {
      "@type": "JobPosting",
      "title": "সহকারী প্রোগ্রামার (Assistant Programmer)",
      "hiringOrganization": { "name": "তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ" },
      "validThrough": "৩০ নভেম্বর ২০২৬",
      "url": "https://alljobs.teletalk.com.bd/ict-01"
    }
    </script>
    <div id="root"></div>
  `;
  const parsedJson = parseTeletalkHtml(spaHtml, mockSource);
  console.log(`JSON-LD Discovered: ${parsedJson.discoveredCount}, Title: ${parsedJson.rawNotices[0]?.title}`);
  if (parsedJson.discoveredCount !== 1) throw new Error('Expected 1 embedded JSON notice discovered');
  console.log('✓ Embedded JSON / SPA parser passed.');

  // TEST 3: Gemini Bengali Content & SEO Generator
  console.log('\n--- Test 3: Gemini Bengali Content & SEO Generator ---');
  const testDraft: CircularDraft = {
    id: 'test-draft-audit-999',
    sourceName: 'Teletalk Alljobs',
    sourceUrl: 'https://alljobs.teletalk.com.bd/circular/test',
    extractedTitle: 'সহকারী প্রকৌশলী (Assistant Engineer - Civil)',
    extractedOrg: 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর (LGED)',
    category: 'govt',
    deadline: '২০ ডিসেম্বর ২০২৬',
    vacancies: 42,
    minEducation: 'বিএসসি ইন সিভিল ইঞ্জিনিয়ারিং',
    salary: '২২,০০০ - ৫৩,০৬০ টাকা (৯ম গ্রেড)',
    govtFee: 600,
    confidenceScore: 0.95,
    duplicateDetected: false,
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    rawEvidenceText: 'পদের নাম: সহকারী প্রকৌশলী (সিভিল)। পদসংখ্যা: ৪২টি। বেতন স্কেল: ৯ম গ্রেড (২২০০০-৫৩০০০)। শিক্ষাগত যোগ্যতা: বিএসসি ইন সিভিল ইঞ্জিনিয়ারিং।'
  };

  const aiContent = await generateBengaliJobContentWithGemini(testDraft);
  console.log(`AI Content Generated: success=${aiContent.success}, isAi=${aiContent.isAiGenerated}`);
  console.log(`SEO Title: ${aiContent.seoTitle}`);
  console.log(`SEO Description: ${aiContent.seoDescription}`);
  console.log(`Target Keywords count: ${aiContent.targetKeywords.length}`);
  console.log(`FAQ Items count: ${aiContent.faqItems.length}`);
  if (!aiContent.bengaliDescription || aiContent.bengaliDescription.length < 50) {
    throw new Error('Bengali description is missing or too short!');
  }
  console.log('✓ Bengali content & SEO metadata generation passed.');

  // TEST 4: Canonical Job Publishing Integrity
  console.log('\n--- Test 4: Approval & Publishing Data Integrity ---');
  testDraft.aiGeneratedContent = {
    bengaliDescription: aiContent.bengaliDescription,
    seoTitle: aiContent.seoTitle,
    seoDescription: aiContent.seoDescription,
    targetKeywords: aiContent.targetKeywords,
    faqItems: aiContent.faqItems,
    generatedAt: new Date().toISOString()
  };

  // Add draft to DB
  serverDB.addCircularDraft(testDraft);
  const fetchedDraft = serverDB.getCircularDrafts().find(d => d.id === testDraft.id);
  if (!fetchedDraft) throw new Error('Failed to persist draft in DB');

  // Verify draft is NOT in published jobs
  const publicJobsBefore = serverDB.getJobs();
  if (publicJobsBefore.some(j => j.id === testDraft.id)) {
    throw new Error('SECURITY VIOLATION: Unapproved draft leaked to public jobs table!');
  }
  console.log('✓ Draft isolation confirmed: Unapproved draft never appears in public jobs.');

  // Approve draft
  const approvedJob = serverDB.approveCircularDraft(testDraft.id, 'AUDIT_TESTER');
  if (!approvedJob) throw new Error('Draft approval failed');
  console.log(`Canonical Job Created: ID=${approvedJob.id}, Title="${approvedJob.title}", SeoTitle="${approvedJob.seoTitle}"`);
  if (!approvedJob.bengaliDescription) throw new Error('Bengali description was not copied to canonical job');
  if (!approvedJob.seoTitle) throw new Error('SEO Title missing on canonical job');
  console.log('✓ Canonical job creation with full Bengali rich content and SEO passed.');

  // Clean up test records
  serverDB.deleteJob(approvedJob.id);
  serverDB.deleteCircularDraft(testDraft.id);
  console.log('✓ Test records cleaned up successfully.');

  console.log('\n=== ALL PIPELINE VERIFICATIONS PASSED SUCCESSFULLY (100%) ===');
}

runPipelineVerification().catch((err) => {
  console.error('\n❌ PIPELINE VERIFICATION FAILED:', err);
  process.exit(1);
});
