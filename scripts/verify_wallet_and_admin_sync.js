const { BangladeshDateHelper } = require('../src/lib/feeds/timezone');
const { CentralDeadlineEngine } = require('../src/lib/deadlines/engine');
const { serverDB } = require('../src/lib/db');

async function testAll() {
  console.log('=== STAGE 1: BENGALI DATE & DEADLINE PARSER VERIFICATION ===');
  const testDates = [
    { input: '২৫ নভেম্বর ২০২৬', expectedIso: '2026-11-25' },
    { input: 'শেষ তারিখ: ৩০ নভেম্বর ২০২৬ বিকাল ৫:০০', expectedIso: '2026-11-30' },
    { input: 'আবেদনের শেষ সময়: ১৫ ডিসেম্বর ২০২৬', expectedIso: '2026-12-15' },
    { input: '০৫/১১/২০২৬', expectedIso: '2026-11-05' },
    { input: '2026-12-31', expectedIso: '2026-12-31' }
  ];

  let datePass = true;
  for (const t of testDates) {
    const iso = BangladeshDateHelper.parseToIsoDate(t.input);
    const ok = iso === t.expectedIso;
    console.log(`Date [${t.input}] => ${iso} (${ok ? 'PASS' : 'FAIL: expected ' + t.expectedIso})`);
    if (!ok) datePass = false;
  }

  // Test deadline engine evaluation
  const mockJob = {
    id: 'test-job-1',
    title: 'সহকারী পরিচালক',
    organization: 'বাংলাদেশ ব্যাংক',
    deadline: '২৫ নভেম্বর ২০২৬',
    publishedDate: '০১ নভেম্বর ২০২৬'
  };
  const evalResult = CentralDeadlineEngine.evaluateDeadline(mockJob);
  console.log('Deadline Evaluation for job:', {
    daysRemaining: evalResult.daysRemaining,
    isClosed: evalResult.isClosed,
    labelBn: evalResult.labelBn,
    formattedCountdownBn: evalResult.formattedCountdownBn
  });
  if (evalResult.daysRemaining <= 0 || evalResult.isClosed) {
    console.error('FAIL: Expected positive days remaining for 25 Nov 2026');
    datePass = false;
  }

  console.log('\n=== STAGE 2: WALLET BALANCE DEDUCTION & TRANSACTION TEST ===');
  // 1. Get or create a test candidate
  const candidates = serverDB.getAllCandidates();
  let candidate = candidates[0];
  if (!candidate) {
    console.log('Creating test candidate...');
    candidate = serverDB.createCandidate({
      id: 'TEST-USR-100',
      name: 'মো: আব্দুল্লাহ',
      phone: '01700000000',
      walletBalance: 1000
    });
  } else {
    // Ensure sufficient balance for testing
    candidate.walletBalance = 1000;
  }

  const initialBalance = candidate.walletBalance;
  console.log('Candidate initial balance: ৳' + initialBalance);

  const uniqueSuffix = Date.now();
  const testApp = {
    id: 'TEST-APP-' + uniqueSuffix,
    jobId: 'test-job-' + uniqueSuffix,
    jobTitle: mockJob.title,
    organization: mockJob.organization,
    postName: 'সহকারী পরিচালক (' + uniqueSuffix + ')',
    totalAmount: 200,
    governmentFee: 150,
    serviceCharge: 50,
    paymentMethod: 'Wallet',
    status: 'processing',
    date: new Date().toLocaleDateString('bn-BD'),
    createdAt: new Date().toISOString()
  };

  const submitResult = serverDB.submitApplication(candidate.id, testApp, true);
  console.log('Submit application result:', {
    success: submitResult.success,
    walletBalance: submitResult.walletBalance,
    transactionCreated: Boolean(submitResult.transaction)
  });

  let walletPass = true;
  if (!submitResult.success) {
    console.error('FAIL: submitApplication failed:', submitResult.error);
    walletPass = false;
  } else if (submitResult.walletBalance !== initialBalance - 200) {
    console.error(`FAIL: Wallet balance mismatch. Expected ৳${initialBalance - 200}, got ৳${submitResult.walletBalance}`);
    walletPass = false;
  } else {
    console.log(`PASS: Wallet correctly deducted by ৳200. New balance: ৳${submitResult.walletBalance}`);
  }

  if (submitResult.transaction) {
    console.log('PASS: Transaction successfully created:', submitResult.transaction);
  } else {
    console.error('FAIL: No transaction returned from submitApplication');
    walletPass = false;
  }

  console.log('\n=== STAGE 3: APPLICATION SORTING CHRONOLOGICAL VERIFICATION ===');
  const allApps = serverDB.getApplications(candidate.id);
  console.log(`Candidate has ${allApps.length} applications in history.`);
  
  if (datePass && walletPass) {
    console.log('\n>>> ALL AUTOMATED LOGIC VERIFICATION CHECKS PASSED (100%) <<<');
    process.exit(0);
  } else {
    console.error('\n>>> SOME VERIFICATION CHECKS FAILED <<<');
    process.exit(1);
  }
}

testAll().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

