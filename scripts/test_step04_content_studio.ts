/**
 * CHAKRI SHEBA — STEP 04: JOB CONTENT & SEO STUDIO TEST SUITE
 * 
 * Verifies all 12 core capabilities:
 * 1. Verified Job Data Intake Gatekeeper & Blocker Rules
 * 2. Bengali & English Keyword Suggestion Engine & Intent Classification
 * 3. Bengali Content Brief & Reorderable Outline Generation
 * 4. Bengali AI / Deterministic Content Generation Engine
 * 5. Factual Accuracy, Conflict & Unsupported Claim Detection
 * 6. Bengali Language Quality & Grammar Analyzer
 * 7. Internal Content Uniqueness & Duplicate Checker
 * 8. SEO Optimization Engine & Internal Linking
 * 9. Elementor Visual Blocks Converter & Reversibility
 * 10. Structured Schemas (JSON-LD) & Social Metadata
 * 11. Revision Management & Autosave Engine
 * 12. Admin Approval Gate & Publishing Handoff
 */

import { serverDB } from '../src/lib/db';
import { CircularDraft } from '../src/lib/types';
import {
  intakeVerifiedJobData,
  generateKeywordSuggestions,
  classifySearchIntent,
  generateContentBrief,
  generateArticleOutline,
  generateDeterministicStudioArticle,
  validateArticleFacts,
  checkBengaliLanguageQuality,
  checkInternalContentUniqueness,
  generateInitialMetadata,
  analyzeSEO,
  recommendInternalLinks,
  blocksToMarkdown,
  createNewBlock,
  generateStructuredSchemas,
  createRevisionSnapshot,
  restoreRevision,
  ContentStudioState
} from '../src/lib/content_studio/index';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${testName}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runStep04TestSuite() {
  console.log('================================================================');
  console.log('   CHAKRI SHEBA — STEP 04: JOB CONTENT & SEO STUDIO TEST SUITE');
  console.log('================================================================');

  // Prepare standard mock verified draft from Step 03
  const validDraft: CircularDraft = {
    id: 'draft-bb-test-2026',
    sourceName: 'বাংলাদেশ ব্যাংক',
    sourceUrl: 'https://erecruitment.bb.org.bd/career/job2026.pdf',
    extractedTitle: 'সহকারী পরিচালক (সাধারণ)',
    extractedOrg: 'বাংলাদেশ ব্যাংক',
    category: 'bank',
    vacancies: 100,
    deadline: '৩০ নভেম্বর ২০২৬',
    govtFee: 200,
    confidenceScore: 95,
    salary: '২২,০০০ - ৫৩,০৬০ টাকা',
    minEducation: 'স্নাতক বা সমমান ডিগ্রি',
    rawEvidenceText: 'বাংলাদেশ ব্যাংক নিয়োগ বিজ্ঞপ্তি ২০২৬। সহকারী পরিচালক পদে ১০০ জন নিয়োগ দেওয়া হবে।',
    duplicateDetected: false,
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    verificationResult: {
      draftId: 'draft-bb-test-2026',
      verifiedAt: new Date().toISOString(),
      status: 'VERIFIED',
      confidenceScore: 95,
      confidenceBand: 'HIGH',
      confidenceReasons: ['Govt Tier 1 Authority', 'PDF Hash Verified', '100% Field Concordance'],
      sourceAuthority: {
        level: 1,
        domain: 'bb.org.bd',
        authorityLabel: 'Level 1: Govt',
        isOfficialDomain: true,
        redirectDetected: false,
        score: 1.0,
        notes: 'বাংলাদেশ ব্যাংকের অফিশিয়াল পোর্টাল'
      },
      documentValidation: {
        status: 'Valid PDF',
        isValidPdf: true,
        checksumSha256: 'a1b2c3d4e5f67890bb2026',
        pageCount: 3,
        requiresOcr: false,
        textCharCount: 4200,
        warnings: []
      },
      fields: {
        organization: { field: 'organization', extractedValue: 'বাংলাদেশ ব্যাংক', sourceType: 'PDF', verificationStatus: 'VERIFIED', confidence: 1.0, reviewRequired: false },
        title: { field: 'title', extractedValue: 'সহকারী পরিচালক (সাধারণ)', sourceType: 'PDF', verificationStatus: 'VERIFIED', confidence: 1.0, reviewRequired: false },
        vacancies: { field: 'vacancies', extractedValue: 100, sourceType: 'PDF', verificationStatus: 'VERIFIED', confidence: 1.0, reviewRequired: false },
        deadline: { field: 'deadline', extractedValue: '৩০ নভেম্বর ২০২৬', sourceType: 'PDF', verificationStatus: 'VERIFIED', confidence: 1.0, reviewRequired: false },
        govtFee: { field: 'govtFee', extractedValue: 200, sourceType: 'PDF', verificationStatus: 'VERIFIED', confidence: 1.0, reviewRequired: false },
        salary: { field: 'salary', extractedValue: '২২,০০০ - ৫৩,০৬০ টাকা', sourceType: 'PDF', verificationStatus: 'VERIFIED', confidence: 1.0, reviewRequired: false }
      },
      eligibility: {
        age: { minAge: 21, maxAge: 30, relaxationCondition: 'মুক্তিযোদ্ধা সন্তানদের জন্য ৩২ বছর', isSupported: true },
        education: { degree: 'স্নাতক', isSupported: true },
        experience: { isFresherAllowed: true, preferredOnly: false, isSupported: true }
      },
      verifiedData: {
        organization: 'বাংলাদেশ ব্যাংক',
        title: 'সহকারী পরিচালক (সাধারণ)',
        vacancies: 100,
        deadline: '৩০ নভেম্বর ২০২৬',
        salary: '২২,০০০ - ৫৩,০৬০ টাকা',
        govtFee: 200,
        category: 'bank',
        minEducation: 'স্নাতক বা সমমান ডিগ্রি',
        applicationUrl: 'https://erecruitment.bb.org.bd'
      },
      isCancellationNotice: false,
      isUpdateProposal: false,
      unresolvedWarnings: [],
      bengaliSummary: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক পদে ১০০ জনের নিয়োগ বিজ্ঞপ্তি যাচাই সম্পন্ন।'
    }
  };

  // --- VECTOR 1: VERIFIED DATA INTAKE ---
  console.log('\n>>> [Vector 1] Verified Job Data Intake & Gatekeeper');
  const intakeResult = intakeVerifiedJobData(validDraft);
  assert(intakeResult.canProceedToGeneration === true, 'Valid circular successfully approved for content generation');
  assert(intakeResult.facts.organization === 'বাংলাদেশ ব্যাংক', 'Verified organization mapped correctly');
  assert(intakeResult.facts.numericVacancies === 100, 'Numeric vacancies preserved');
  assert(intakeResult.facts.govtFee === '200 টাকা', 'Govt fee normalized');

  // Missing data test
  const missingFactsDraft: CircularDraft = {
    ...validDraft,
    id: 'draft-missing-test',
    vacancies: 0,
    salary: '',
    deadline: '',
    verificationResult: undefined
  };
  const missingIntake = intakeVerifiedJobData(missingFactsDraft);
  assert(missingIntake.facts.vacancies === 'বিজ্ঞপ্তিতে উল্লেখ নেই', 'Missing vacancy defaults strictly to "বিজ্ঞপ্তিতে উল্লেখ নেই"');
  assert(missingIntake.facts.salary === 'বিজ্ঞপ্তিতে উল্লেখ নেই', 'Missing salary defaults strictly to "বিজ্ঞপ্তিতে উল্লেখ নেই"');
  assert(missingIntake.facts.missingFields.includes('vacancies'), 'Missing fields tracked for editorial review');

  // Cancelled circular blocker test
  const cancelledDraft: CircularDraft = {
    ...validDraft,
    id: 'draft-cancelled-test',
    isCancellationNotice: true
  };
  const cancelledIntake = intakeVerifiedJobData(cancelledDraft);
  assert(cancelledIntake.canProceedToGeneration === false, 'Cancelled circular strictly blocked from generation');
  assert(cancelledIntake.blockers.length > 0, 'Cancellation blocker recorded');

  // --- VECTOR 2: KEYWORD INTELLIGENCE & SEARCH INTENT ---
  console.log('\n>>> [Vector 2] Keyword Intelligence & Search Intent');
  const kwSuggestions = generateKeywordSuggestions(intakeResult.facts);
  assert(kwSuggestions.primary.keyword.includes('বাংলাদেশ ব্যাংক নিয়োগ বিজ্ঞপ্তি ২০২৬'), 'Primary keyword generated with standard year');
  assert(kwSuggestions.secondary.some(k => k.keyword.includes('Bangladesh Bank Job Circular 2026')), 'Secondary English search keyword included');
  assert(kwSuggestions.longtail.some(k => k.keyword.includes('PDF')), 'Longtail download intent keyword generated');

  const intentClass = classifySearchIntent(intakeResult.facts, kwSuggestions.primary.keyword);
  assert(intentClass.primaryIntent === 'informational', 'Standard circular search intent classified');

  const applyIntent = classifySearchIntent(intakeResult.facts, 'বাংলাদেশ ব্যাংক অনলাইনে আবেদন করার নিয়ম');
  assert(applyIntent.primaryIntent === 'application', 'Application intent correctly classified');

  // --- VECTOR 3: CONTENT BRIEF & OUTLINE GENERATION ---
  console.log('\n>>> [Vector 3] Bengali Content Brief & Reorderable Outline');
  const brief = generateContentBrief(intakeResult.facts, kwSuggestions.primary, kwSuggestions.secondary, kwSuggestions.related);
  assert(brief.requiredFacts.vacancies === '100টি পদ', 'Brief contains confirmed vacancy fact');
  assert(brief.suggestedHeadings.length >= 8, 'Brief contains comprehensive suggested headings');

  const outline = generateArticleOutline(brief, intakeResult.facts);
  const h1Sections = outline.sections.filter(s => s.level === 'h1');
  assert(h1Sections.length === 1, 'Outline enforces strictly one H1 section');
  assert(outline.sections.some(s => s.id === 'sec-overview'), 'Overview table section present');
  assert(outline.sections.some(s => s.id === 'sec-faq'), 'FAQ section present in outline');

  // --- VECTOR 4: BENGALI AI CONTENT GENERATION ENGINE ---
  console.log('\n>>> [Vector 4] Bengali Content Engine (Deterministic & AI Fallback)');
  const generated = generateDeterministicStudioArticle(intakeResult.facts, brief, outline);
  assert(generated.article.title.includes('বাংলাদেশ ব্যাংক নিয়োগ বিজ্ঞপ্তি ২০২৬'), 'H1 title follows naming policy');
  assert(generated.article.bengaliMarkdown.includes('## বাংলাদেশ ব্যাংক নিয়োগ বিজ্ঞপ্তি ২০২৬ সংক্ষেপে'), 'Markdown includes H2 overview');
  assert(generated.article.faqItems.length >= 4, 'FAQ items generated with confirmed facts');
  assert(generated.blocks.length >= 10, 'Rich visual blocks generated for Elementor editor');

  // Language policy enforcement: pure Bengali
  const markdownText = generated.article.bengaliMarkdown;
  const englishSentenceRegex = /[A-Z][a-z]+ [a-z]+ [a-z]+ [a-z]+\./g;
  assert(!markdownText.match(englishSentenceRegex), 'No full English sentences; language is 100% natural Bengali');

  // --- VECTOR 5: FACTUAL ACCURACY & CONFLICT DETECTION ---
  console.log('\n>>> [Vector 5] Factual Accuracy & Integrity Validator');
  const factCheck = validateArticleFacts(markdownText, intakeResult.facts);
  assert(factCheck.status === 'FACTUALLY_SUPPORTED', 'Accurate article passes fact check');
  assert(factCheck.canProceedToApproval === true, 'Factually supported article approved to proceed');

  // Test detecting conflicting claims
  const fabricatedText = markdownText
    .replaceAll('100টি পদ', '৫০০টি পদ')
    .replaceAll('১০০টি পদ', '৫০০টি পদ')
    .replaceAll('100', '500')
    .replaceAll('১০০', '৫০০')
    .replaceAll('৩০ নভেম্বর ২০২৬', '১০ জানুয়ারি ২০২৭');
  const badFactCheck = validateArticleFacts(fabricatedText, intakeResult.facts);
  assert(badFactCheck.status === 'CONFLICTING_INFORMATION', 'Conflicting vacancy and deadline detected');
  assert(badFactCheck.canProceedToApproval === false, 'Approval blocked when critical facts conflict');

  // --- VECTOR 6: BENGALI QUALITY & GRAMMAR ANALYZER ---
  console.log('\n>>> [Vector 6] Bengali Language Quality & Grammar Analyzer');
  const quality = checkBengaliLanguageQuality(markdownText, kwSuggestions.primary.keyword, [
    ...kwSuggestions.secondary.map(k => k.keyword)
  ]);
  assert(quality.overallScore >= 80, 'Natural Bengali article achieves high quality score (>=80)');
  assert(quality.hasUnnaturalEnglishMix === false, 'No unnatural English keyword stuffing');

  // Test clickbait detection
  const clickbaitText = markdownText + '\n\nসবাই আবেদন করুন দ্রুত সুবর্ণ সুযোগ হাতছাড়া করবেন না অবিলম্বে দেখুন না হলে মিস।';
  const clickbaitQuality = checkBengaliLanguageQuality(clickbaitText, kwSuggestions.primary.keyword, []);
  assert(clickbaitQuality.issues.some(i => i.type === 'filler'), 'Promotional clickbait filler detected');

  // --- VECTOR 7: INTERNAL CONTENT UNIQUENESS & DUPLICATE CHECKER ---
  console.log('\n>>> [Vector 7] Internal Duplicate & Similarity Analysis');
  const uniqueness = checkInternalContentUniqueness(validDraft.id, generated.article.title, markdownText);
  assert(typeof uniqueness.internalSimilarityScore === 'number', 'Similarity score computed');
  assert(uniqueness.method === 'ngram_jaccard_token_hash', 'Uses transparent token n-gram methodology');

  // --- VECTOR 8: SEO OPTIMIZATION & METADATA ENGINE ---
  console.log('\n>>> [Vector 8] SEO Optimization Engine & Internal Linking');
  const initialMeta = generateInitialMetadata(intakeResult.facts, kwSuggestions.primary.keyword);
  assert(initialMeta.seoTitle.includes('বাংলাদেশ ব্যাংক নিয়োগ বিজ্ঞপ্তি ২০২৬'), 'SEO title contains primary keyword');
  assert(initialMeta.slug.includes('2026'), 'Clean slug contains year');

  const internalLinks = recommendInternalLinks(intakeResult.facts);
  assert(internalLinks.length >= 2, 'Internal links recommended');
  assert(internalLinks.some(l => l.targetUrl === '/bank-jobs'), 'Category-specific link recommended for bank job');

  const seoReport = analyzeSEO(markdownText, initialMeta, intakeResult.facts, internalLinks);
  assert(seoReport.score >= 70, 'Comprehensive article achieves high SEO score (>=70)');
  assert(seoReport.headingStructureValid === true, 'Heading hierarchy valid (1 H1 and multiple H2s)');

  // --- VECTOR 9: ELEMENTOR VISUAL BLOCKS & REVERSIBILITY ---
  console.log('\n>>> [Vector 9] Elementor Visual Blocks Converter');
  const reconvertedMarkdown = blocksToMarkdown(generated.blocks);
  assert(reconvertedMarkdown.includes('সহকারী পরিচালক (সাধারণ)'), 'Fidelity maintained across block conversion');
  const customBlock = createNewBlock('notice_box', 'প্রার্থীদের সতর্কতা');
  assert(customBlock.id.startsWith('blk-'), 'New block assigned unique ID');

  // --- VECTOR 10: STRUCTURED SCHEMAS (JSON-LD) & SOCIAL METADATA ---
  console.log('\n>>> [Vector 10] Structured Schemas & Social Metadata');
  const schemas = generateStructuredSchemas(intakeResult.facts, initialMeta, generated.article.faqItems);
  assert(Boolean(schemas.jobPostingSchema), 'JobPosting schema generated for verified circular');
  assert(schemas.jobPostingSchema?.["@type"] === 'JobPosting', 'Valid Schema.org JobPosting type');
  assert(schemas.breadcrumbSchema["@type"] === 'BreadcrumbList', 'Valid BreadcrumbList schema generated');
  assert(Boolean(schemas.faqSchema), 'Valid FAQPage schema generated');

  // --- VECTOR 11: REVISION SNAPSHOT & RESTORATION ---
  console.log('\n>>> [Vector 11] Revision Management & Autosave Engine');
  const mockState: ContentStudioState = {
    draftId: validDraft.id,
    status: 'DRAFT_CREATED',
    brief,
    outline,
    article: generated.article,
    blocks: generated.blocks,
    seo: initialMeta,
    internalLinks,
    revisions: [],
    lastSavedAt: new Date().toISOString()
  };

  const rev1 = createRevisionSnapshot(mockState, 'Admin 1', 'প্রথম সংস্করণ');
  mockState.revisions.push(rev1);
  assert(rev1.versionNumber === 1, 'Initial revision assigned version 1');

  // Modify state and create rev 2
  mockState.seo.seoTitle = 'সম্পাদিত নতুন টাইটেল ২০২৬';
  const rev2 = createRevisionSnapshot(mockState, 'Admin 2', 'টাইটেল পরিবর্তন');
  mockState.revisions.unshift(rev2);
  assert(rev2.versionNumber === 2, 'Second revision assigned version 2');

  // Restore rev 1
  const { updatedState, restoredRevision } = restoreRevision(mockState, rev1.id);
  assert(restoredRevision?.versionNumber === 1, 'Revision 1 successfully identified for restore');
  assert(updatedState.seo.seoTitle === rev1.seoSnapshot.seoTitle, 'State restored cleanly to revision 1 title');

  // --- VECTOR 12: ADMIN APPROVAL & PUBLISHING HANDOFF ---
  console.log('\n>>> [Vector 12] Admin Approval Gate & Publishing Handoff');
  const overrides = {
    title: generated.article.title,
    bengaliDescription: generated.article.bengaliMarkdown,
    seoTitle: initialMeta.seoTitle,
    seoDescription: initialMeta.seoDescription,
    seoKeywords: [initialMeta.focusKeyword, ...initialMeta.secondaryKeywords],
    faqItems: generated.article.faqItems,
    slug: initialMeta.slug
  };

  // Test approval in serverDB: save draft first to local store
  serverDB.saveCircularDraft(validDraft);
  const publishedJob = serverDB.approveCircularDraft(validDraft.id, 'SUPER_ADMIN_TEST', overrides);
  assert(Boolean(publishedJob), 'Draft successfully approved and published to canonical jobs catalog');
  assert(publishedJob?.seoTitle === initialMeta.seoTitle, 'Published job has rich SEO title');
  assert(publishedJob?.bengaliDescription === generated.article.bengaliMarkdown, 'Published job has full Bengali editorial content');
  assert(publishedJob?.slug === initialMeta.slug, 'Published job has clean SEO slug');

  console.log('\n================================================================');
  console.log(`   TEST EXECUTION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================\n');
}

runStep04TestSuite().catch(err => {
  console.error('Test execution failed with unhandled error:', err);
  process.exit(1);
});
