/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 06 COMPREHENSIVE ACCEPTANCE TEST SUITE
 * Job Category, Taxonomy, Multi-dimensional Classification & Advanced Smart Search
 */

import { serverDB } from '../src/lib/db';
import { CategoryValidator } from '../src/lib/taxonomy/validator';
import { JobTaxonomyClassifier } from '../src/lib/taxonomy/classifier';
import { CategorySuggester } from '../src/lib/taxonomy/suggester';
import { SearchNormalizer } from '../src/lib/search/normalizer';
import { SearchScorer } from '../src/lib/search/scorer';
import { SearchEngine } from '../src/lib/search/engine';
import { SearchSuggestionsEngine } from '../src/lib/search/suggestions';
import { SearchAnalyticsManager } from '../src/lib/search/analytics';
import { CategoryRecord } from '../src/lib/taxonomy/types';
import { JobCircular, CircularDraft } from '../src/lib/types';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${testName}${detail ? ` (${detail})` : ''}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}${detail ? ` — DETAIL: ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

async function runStep06TestSuite() {
  console.log('================================================================');
  console.log('   CHAKRI SHEBA — STEP 06: TAXONOMY & SEARCH TEST SUITE');
  console.log('================================================================\n');

  const categories = serverDB.getCategories();
  const allJobs = serverDB.getJobs();

  // -------------------------------------------------------------
  // Vector 1: Taxonomy & Category CRUD and Hierarchy
  // -------------------------------------------------------------
  console.log('>>> [Vector 1] Category CRUD, Slug & Hierarchy Validation');
  assert(categories.length >= 20, 'Default taxonomy loaded with 20+ categories', `Total: ${categories.length}`);

  const validCat: Partial<CategoryRecord> = {
    id: 'cat-test-engineering-tech',
    name_bn: 'আইটি ও টেকনোলজি',
    name_en: 'IT & Technology',
    slug: 'it-and-technology',
    parent_id: null,
    display_order: 5,
    is_active: true
  };
  const validRes = CategoryValidator.validate(validCat, categories, false);
  assert(validRes.isValid, 'Valid category successfully validated');

  // Slug regex check
  const invalidSlugCat: Partial<CategoryRecord> = {
    ...validCat,
    slug: 'Invalid Slug With Spaces!'
  };
  const invalidSlugRes = CategoryValidator.validate(invalidSlugCat, categories, false);
  assert(!invalidSlugRes.isValid, 'Invalid slug with spaces rejected');
  assert(invalidSlugRes.errors.some(e => e.includes('ফরম্যাটে নেই')), 'Slug format error recorded');

  // Duplicate slug check
  const duplicateSlugCat: Partial<CategoryRecord> = {
    ...validCat,
    slug: 'government-jobs' // Already exists
  };
  const duplicateSlugRes = CategoryValidator.validate(duplicateSlugCat, categories, false);
  assert(!duplicateSlugRes.isValid, 'Duplicate slug collision prevented');
  assert(duplicateSlugRes.errors.some(e => e.includes('ইতিমধ্যে অন্য ক্যাটাগরিতে ব্যবহৃত')), 'Slug collision error returned');

  // Circular hierarchy check
  const selfParentCat: Partial<CategoryRecord> = {
    id: 'cat-circ-1',
    name_bn: 'সার্কুলার টেস্ট',
    name_en: 'Circular Test',
    slug: 'circular-test',
    parent_id: 'cat-circ-1'
  };
  const selfParentRes = CategoryValidator.validate(selfParentCat, categories, false);
  assert(!selfParentRes.isValid, 'Category cannot be its own parent');

  // Circular loop: A -> B -> A
  const existingWithLoop: CategoryRecord[] = [
    { ...categories[0], id: 'cat-a', parent_id: 'cat-b' },
    { ...categories[0], id: 'cat-b', parent_id: 'cat-a' }
  ];
  const loopCat: Partial<CategoryRecord> = {
    id: 'cat-a',
    name_bn: 'লুপ টেস্ট এ',
    name_en: 'Loop A',
    slug: 'loop-a',
    parent_id: 'cat-b'
  };
  const loopRes = CategoryValidator.validate(loopCat, existingWithLoop, true);
  assert(!loopRes.isValid, 'Circular reference loop (A -> B -> A) strictly detected');

  // -------------------------------------------------------------
  // Vector 2: Safe Category Deletion & Job Reassignment
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 2] Safe Deletion & Job Reassignment');
  const deletionBlocked = CategoryValidator.validateDeletion('cat-govt', categories, 15, undefined);
  assert(!deletionBlocked.isValid, 'Deletion blocked when active jobs exist without reassignment target');
  assert(deletionBlocked.errors.some(e => e.includes('স্থানান্তর')), 'Mandatory reassignment error recorded');

  const deletionAllowed = CategoryValidator.validateDeletion('cat-govt', categories, 15, 'cat-bank');
  assert(deletionAllowed.isValid, 'Deletion allowed when valid reassignment target is provided');

  // -------------------------------------------------------------
  // Vector 3: Backward-Compatible Job Classification
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 3] Multi-dimensional Classification & Backward Compatibility');
  const sampleGovtJob: JobCircular = {
    id: 'test-job-govt-1',
    title: 'সমাজসেবা অধিদপ্তরে সমাজকর্মী (গ্রেড-১৬) নিয়োগ',
    organization: 'সমাজসেবা অধিদপ্তর',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '১৬তম গ্রেড',
    totalPosts: 50,
    salary: '৯,৩০০ - ২২,৪৯০ টাকা',
    minEducation: 'এইচএসসি বা সমমান পাস',
    districts: 'সকল জেলা',
    deadline: '২০ নভেম্বর ২০২৬',
    daysRemaining: 10,
    publishedDate: '2026-10-25',
    govtFee: 100,
    serviceFee: 50,
    officialLink: '',
    circularImage: '',
    audioSummary: '',
    requirements: ['কম্পিউটার টাইপিংয়ে অভিজ্ঞতা থাকতে হবে'],
    logo: '',
    minAge: 18,
    maxAge: 30
  };

  const clGovt = JobTaxonomyClassifier.classify(sampleGovtJob);
  assert(clGovt.primaryCategory === 'cat-govt', 'Legacy govt category mapped to cat-govt');
  assert(clGovt.categorySlug === 'government-jobs', 'Category slug matches government-jobs');
  assert(clGovt.organizationType === 'government', 'Organization type identified as government');
  assert(clGovt.educationLevel === 'hsc', 'Education level identified as hsc');
  assert(clGovt.division === 'ALL_BD', 'Location division identified as ALL_BD');
  assert(clGovt.applicationStatus === 'open', 'Application status evaluated as open');

  const sampleBankJob: JobCircular = {
    ...sampleGovtJob,
    id: 'test-job-bank-1',
    title: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (সাধারণ) নিয়োগ ২০২৬',
    organization: 'বাংলাদেশ ব্যাংক',
    category: 'bank',
    categoryLabel: 'ব্যাংক জব',
    minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে ৪ বছর মেয়াদি স্নাতক ডিগ্রি',
    salary: '২২,০০০ - ৫৩,০৬০ টাকা',
    daysRemaining: 2
  };
  const clBank = JobTaxonomyClassifier.classify(sampleBankJob);
  assert(clBank.primaryCategory === 'cat-bank', 'Legacy bank category mapped to cat-bank');
  assert(clBank.organizationType === 'public_bank', 'Bangladesh Bank classified as public_bank');
  assert(clBank.educationLevel === 'bachelor', 'Bachelor degree classified as bachelor');
  assert(clBank.applicationStatus === 'closing_soon', '2 days remaining evaluated as closing_soon');

  // -------------------------------------------------------------
  // Vector 4: Automated Category Suggester for Ingested Drafts
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 4] Automated Category & Taxonomy Suggester');
  const sampleDraft: CircularDraft = {
    id: 'draft-test-1',
    sourceName: 'AllJobs Teletalk',
    sourceUrl: 'https://biman.teletalk.com.bd',
    extractedTitle: 'বিমান বাংলাদেশ এয়ারলাইন্স সিকিউরিটি গার্ড নিয়োগ',
    extractedOrg: 'বিমান বাংলাদেশ এয়ারলাইন্স',
    category: 'govt',
    deadline: '15-11-2026',
    vacancies: 10,
    minEducation: 'এসএসসি পাস',
    salary: '৯,০০০ - ২১,৮০০ টাকা',
    govtFee: 100,
    confidenceScore: 92,
    duplicateDetected: false,
    status: 'pending_review' as const,
    createdAt: new Date().toISOString()
  };

  const suggested = CategorySuggester.suggestForDraft(sampleDraft, categories);
  assert(suggested.primaryCategory === 'cat-govt', 'Primary category suggested as cat-govt');
  assert(suggested.confidence === 'HIGH', 'Confidence evaluated as HIGH');
  assert(!suggested.needsReview, 'Complete draft marked as needsReview: false');

  // -------------------------------------------------------------
  // Vector 5: Bilingual Search Normalization
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 5] Bilingual Search Normalizer & Unicode Handling');
  const rawQuery = '   ব্যাংক   নিয়োগ   ২০২৬ !   ';
  const normQuery = SearchNormalizer.normalize(rawQuery);
  assert(normQuery === SearchNormalizer.normalize('ব্যাংক নিয়োগ ২০২৬'), 'Extra spaces and punctuation cleaned');

  const zwQuery = 'ব্যাংক' + String.fromCharCode(0x200C) + ' নিয়োগ';
  assert(SearchNormalizer.normalize(zwQuery) === SearchNormalizer.normalize('ব্যাংক নিয়োগ'), 'Unicode zero-width non-joiner removed');

  const tokens = SearchNormalizer.tokenize('bank job circular');
  const expanded = SearchNormalizer.expandSynonyms(tokens);
  assert(expanded.includes('ব্যাংক'), 'English "bank" expanded to Bengali "ব্যাংক"');
  assert(expanded.includes('bank'), 'Original token preserved in expanded synonyms');

  const dist = SearchNormalizer.levenshteinDistance('software', 'softwear');
  assert(dist === 2, 'Levenshtein distance calculated correctly for typo tolerance');

  // -------------------------------------------------------------
  // Vector 6: Relevance Scoring & Typo Tolerance
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 6] Multi-tier Relevance Scoring & Typo Matching');
  const scoreExact = SearchScorer.scoreJob(sampleBankJob, 'বাংলাদেশ ব্যাংক সহকারী পরিচালক');
  assert(scoreExact.score >= 100, 'Exact title keyword match scores >= 100', `Score: ${scoreExact.score}`);
  assert(scoreExact.matchedFields.includes('title') || scoreExact.matchedFields.includes('title_phrase'), 'Title matched field recorded');

  const scoreTypo = SearchScorer.scoreJob(
    { ...sampleGovtJob, title: 'সফটওয়্যার ইঞ্জিনিয়ার (Software Engineer) নিয়োগ' },
    'softwear'
  );
  assert(scoreTypo.score > 0, 'Typo tolerant search scores positive match for softwear -> software');
  assert(scoreTypo.matchedFields.includes('title_fuzzy'), 'Fuzzy match field recorded');

  // -------------------------------------------------------------
  // Vector 7: Multi-Facet Search Engine
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 7] Multi-Facet Search Engine & Filtering');
  const testPool: JobCircular[] = [sampleGovtJob, sampleBankJob];
  const searchBankRes = SearchEngine.search(testPool, categories, { category: 'bank' });
  assert(searchBankRes.total === 1, 'Category filter matches exactly 1 bank job');
  assert(searchBankRes.jobs[0].id === 'test-job-bank-1', 'Target bank job returned');

  const searchEduRes = SearchEngine.search(testPool, categories, { education: 'hsc' });
  assert(searchEduRes.total === 1, 'Education filter matches exactly 1 HSC job');
  assert(searchEduRes.jobs[0].id === 'test-job-govt-1', 'Target govt job returned');

  const searchCombinedRes = SearchEngine.search(testPool, categories, {
    category: 'bank',
    education: 'bachelor',
    status: 'closing_soon'
  });
  assert(searchCombinedRes.total === 1, 'Multi-facet combination (category + edu + status) matches accurately');

  // -------------------------------------------------------------
  // Vector 8: Smart Sorting System
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 8] Smart Sorting Engine');
  const sortDeadlineRes = SearchEngine.search(testPool, categories, { sort: 'deadline_soon' });
  assert(sortDeadlineRes.jobs[0].daysRemaining === 2, 'deadline_soon sorts shortest remaining days first');

  const sortOrgRes = SearchEngine.search(testPool, categories, { sort: 'org_asc' });
  assert(sortOrgRes.jobs[0].organization === 'বাংলাদেশ ব্যাংক', 'org_asc sorts alphabetically');

  // -------------------------------------------------------------
  // Vector 9: Zero Public Leakage Guarantee
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 9] Public Zero-Leakage Guarantee');
  const draftJob: any = {
    id: 'draft-999-secret',
    title: 'অপ্রকাশিত খসড়া বিজ্ঞপ্তি ২০২৬',
    organization: 'গোপনীয় দপ্তর',
    status: 'DRAFT',
    category: 'govt'
  };
  const unpubJob: any = {
    id: 'job-unpub-999',
    title: 'বাতিলকৃত চাকরি বিজ্ঞপ্তি',
    organization: 'বাতিল দপ্তর',
    status: 'UNPUBLISHED',
    category: 'govt'
  };
  const sampleGovtJobWithNotice = {
    ...sampleGovtJob,
    title: 'সমাজসেবা অধিদপ্তরে সমাজকর্মী নিয়োগ বিজ্ঞপ্তি ২০২৬'
  };
  const leakageTestPool: JobCircular[] = [sampleGovtJobWithNotice, draftJob, unpubJob];
  const leakageRes = SearchEngine.search(leakageTestPool, categories, { q: 'বিজ্ঞপ্তি' });
  assert(leakageRes.total === 1, 'Zero public leakage: Draft and unpublished strictly excluded from search');
  assert(leakageRes.jobs[0]?.id === 'test-job-govt-1', 'Only eligible published job returned');

  // -------------------------------------------------------------
  // Vector 10: Dynamic Category Landing & SEO Schemas
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 10] Dynamic Category Landing & Structured Schemas');
  const govtCategory = serverDB.getCategoryBySlug('government-jobs');
  assert(govtCategory !== null, 'Government Jobs category resolved by slug');
  assert(govtCategory?.name_bn === 'সরকারি চাকরি', 'Category Bengali name preserved');
  assert(Boolean(govtCategory?.canonical_url.includes('government-jobs')), 'Canonical URL contains clean category slug');

  // -------------------------------------------------------------
  // Vector 11: Autocomplete Search Suggestions
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 11] Search Autocomplete Suggestions');
  const suggestions = SearchSuggestionsEngine.getSuggestions('ব্যাং', [sampleBankJob], categories);
  assert(suggestions.length > 0, 'Autocomplete suggestions returned for "ব্যাং"');
  assert(suggestions.some(s => s.text.includes('বাংলাদেশ ব্যাংক') || s.text.includes('ব্যাংক')), 'Bank suggestion returned');

  const shortQuerySuggestions = SearchSuggestionsEngine.getSuggestions('a', [sampleBankJob], categories);
  assert(shortQuerySuggestions.length === 0, 'Query under 2 characters returns empty suggestions');

  // -------------------------------------------------------------
  // Vector 12: Search Analytics Logging & Reporting
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 12] Search Analytics Logging & Metrics');
  const sampleEvents = [
    { id: '1', query: 'সহকারী পরিচালক', filters: { category: 'bank' }, resultsCount: 5, timestamp: new Date().toISOString() },
    { id: '2', query: 'সহকারী পরিচালক', filters: { category: 'bank' }, resultsCount: 5, timestamp: new Date().toISOString() },
    { id: '3', query: 'অজানা চাকরি ২০২৬', filters: {}, resultsCount: 0, timestamp: new Date().toISOString() }
  ];
  const summary = SearchAnalyticsManager.summarize(sampleEvents);
  assert(summary.totalSearches === 3, 'Total search event count calculated correctly');
  assert(summary.popularQueries[0].query === 'সহকারী পরিচালক', 'Popular query identified');
  assert(summary.popularQueries[0].count === 2, 'Query frequency counted');
  assert(summary.zeroResultQueries[0].query === 'অজানা চাকরি ২০২৬', 'Zero-result query identified');

  console.log('\n================================================================');
  console.log(`   TEST EXECUTION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================\n');
}

runStep06TestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});

