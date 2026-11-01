/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 13 TEST SUITE
 * 100% Free Platform Access, Universal Feature Availability & Operational Cost Management
 */

import assert from 'assert';
import {
  FreeAccessPolicyEngine,
  OperationalExpenseManager,
  PlatformUsageAnalytics,
  APPROVED_FREE_FEATURES,
  USD_TO_BDT_RATE
} from '../src/lib/operations';
import { serverDB } from '../src/lib/db';

async function runStep13TestSuite() {
  console.log('================================================================');
  console.log('CHAKRI SHEBA — STEP 13 AUTOMATED VERIFICATION SUITE');
  console.log('100% Free Access & Operational Cost Management');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function runTest(name: string, fn: () => void | Promise<void>) {
    totalTests++;
    try {
      fn();
      console.log(`  [PASS] Test ${totalTests}: ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`  [FAIL] Test ${totalTests}: ${name}`);
      console.error(`         Error: ${err.message}`);
    }
  }

  // -------------------------------------------------------------
  // VECTOR 1: FREE ACCESS POLICY ENGINE & UNIVERSAL AVAILABILITY
  // -------------------------------------------------------------
  console.log('--- VECTOR 1: FREE ACCESS POLICY & UNIVERSAL AVAILABILITY ---');

  runTest('Policy engine guarantees 100% free platform with 0 paywalls', () => {
    const policy = FreeAccessPolicyEngine.getPolicy();
    assert.strictEqual(policy.is100PercentFree, true);
    assert.strictEqual(policy.hasPaidTiers, false);
    assert.strictEqual(policy.hasPaywalls, false);
    assert.strictEqual(policy.hasSubscriptions, false);
    assert.strictEqual(policy.activeRestrictions.length, 0);
    assert(policy.approvedFreeFeatures.length >= 15, 'Must approve at least 15 core features');
  });

  runTest('All 15 core approved features are marked as ACTIVE_UNIVERSAL_FREE', () => {
    const policy = FreeAccessPolicyEngine.getPolicy();
    for (const feat of policy.approvedFreeFeatures) {
      assert.strictEqual(feat.status, 'ACTIVE_UNIVERSAL_FREE');
      const verification = FreeAccessPolicyEngine.verifyFeatureAccess(feat.id);
      assert.strictEqual(verification.allowed, true);
    }
  });

  runTest('Paywall audit confirms 0 paywall barriers across the platform', () => {
    const audit = FreeAccessPolicyEngine.auditPaywalls();
    assert.strictEqual(audit.passed, true);
    assert.strictEqual(audit.paywallCount, 0);
  });

  // -------------------------------------------------------------
  // VECTOR 2: OPERATIONAL EXPENSE MANAGEMENT CRUD
  // -------------------------------------------------------------
  console.log('\n--- VECTOR 2: OPERATIONAL EXPENSE MANAGEMENT CRUD ---');

  let testExpenseId = '';

  runTest('Add operational expense in BDT with ACTUAL_BILLED nature', () => {
    const expense = OperationalExpenseManager.addExpense({
      title: 'Automated Test — SMS Gateway Bundle',
      category: 'sms',
      provider: 'Greenweb Test Provider',
      billingPeriod: '2026-10',
      amount: 1500,
      currency: 'BDT',
      costNature: 'ACTUAL_BILLED',
      paymentStatus: 'paid',
      expenseDate: '2026-10-31',
      invoiceNumber: 'TEST-INV-001',
      createdBy: 'ADMIN-TEST'
    });

    assert(expense.id.startsWith('EXP-'));
    assert.strictEqual(expense.amountBdt, 1500);
    assert.strictEqual(expense.costNature, 'ACTUAL_BILLED');
    testExpenseId = expense.id;
  });

  runTest('Add operational expense in USD with automatic BDT normalization', () => {
    const expense = OperationalExpenseManager.addExpense({
      title: 'Automated Test — Google Gemini Flash API',
      category: 'ai_api',
      provider: 'Google AI Studio',
      billingPeriod: '2026-10',
      amount: 10,
      currency: 'USD',
      costNature: 'ESTIMATED_USAGE',
      paymentStatus: 'pending',
      expenseDate: '2026-10-31',
      createdBy: 'ADMIN-TEST'
    });

    assert.strictEqual(expense.amount, 10);
    assert.strictEqual(expense.currency, 'USD');
    const expectedBdt = Math.round(10 * USD_TO_BDT_RATE);
    assert.strictEqual(expense.amountBdt, expectedBdt);
    assert.strictEqual(expense.costNature, 'ESTIMATED_USAGE');

    // Clean up test expense
    OperationalExpenseManager.deleteExpense(expense.id, 'ADMIN-TEST');
  });

  runTest('Filter expenses by category and billing period', () => {
    const allOct = OperationalExpenseManager.getExpenses({ billingPeriod: '2026-10' });
    assert(allOct.length > 0, 'Should find October expenses');

    const smsOnly = OperationalExpenseManager.getExpenses({ billingPeriod: '2026-10', category: 'sms' });
    assert(smsOnly.every(e => e.category === 'sms'));
  });

  runTest('Update an existing operational expense', () => {
    assert(testExpenseId, 'Test expense ID must exist');
    const updated = OperationalExpenseManager.updateExpense(testExpenseId, {
      amount: 1800,
      notes: 'Updated invoice amount'
    }, 'ADMIN-TEST');

    assert(updated !== null);
    assert.strictEqual(updated?.amountBdt, 1800);
    assert.strictEqual(updated?.notes, 'Updated invoice amount');
  });

  runTest('Delete operational expense cleanly', () => {
    assert(testExpenseId, 'Test expense ID must exist');
    const success = OperationalExpenseManager.deleteExpense(testExpenseId, 'ADMIN-TEST');
    assert.strictEqual(success, true);

    const check = serverDB.getOperationalExpenseById(testExpenseId);
    assert.strictEqual(check, null);
  });

  // -------------------------------------------------------------
  // VECTOR 3: PLATFORM BUDGET MANAGEMENT & VARIANCE REPORTING
  // -------------------------------------------------------------
  console.log('\n--- VECTOR 3: BUDGET MANAGEMENT & VARIANCE REPORTING ---');

  runTest('Retrieve default budget configuration', () => {
    const config = OperationalExpenseManager.getBudgetConfig();
    assert(config.monthlyBudgetBdt > 0);
    assert(config.annualBudgetBdt > 0);
    assert.strictEqual(config.alertThresholdPercent, 80);
  });

  runTest('Update budget configuration and verify persistence', () => {
    const updated = OperationalExpenseManager.updateBudgetConfig({
      monthlyBudgetBdt: 50000,
      alertThresholdPercent: 85
    }, 'ADMIN-TEST');

    assert.strictEqual(updated.monthlyBudgetBdt, 50000);
    assert.strictEqual(updated.alertThresholdPercent, 85);

    const recheck = OperationalExpenseManager.getBudgetConfig();
    assert.strictEqual(recheck.monthlyBudgetBdt, 50000);

    // Restore to standard 45,000
    OperationalExpenseManager.updateBudgetConfig({
      monthlyBudgetBdt: 45000,
      alertThresholdPercent: 80
    }, 'ADMIN-TEST');
  });

  runTest('Variance report calculates actual vs estimated and category breakdown', () => {
    const report = OperationalExpenseManager.getVarianceReport('2026-10');
    assert.strictEqual(report.period, '2026-10');
    assert(typeof report.actualTotalBdt === 'number');
    assert(typeof report.estimatedTotalBdt === 'number');
    assert(typeof report.projectedTotalBdt === 'number');
    assert.strictEqual(report.projectedTotalBdt, report.actualTotalBdt + report.estimatedTotalBdt);
    assert.strictEqual(report.varianceBdt, report.monthlyBudgetBdt - report.projectedTotalBdt);
    assert(report.categoryBreakdown.length >= 12, 'Must include breakdown across all categories');
  });

  // -------------------------------------------------------------
  // VECTOR 4: BUDGET THRESHOLD ALERTING & NOTIFICATION INTEGRATION
  // -------------------------------------------------------------
  console.log('\n--- VECTOR 4: BUDGET THRESHOLD ALERTING & NOTIFICATIONS ---');

  runTest('Budget threshold detection triggers in-app alert when exceeded', () => {
    // Add temporary high expense to trigger threshold
    const spikeExpense = OperationalExpenseManager.addExpense({
      title: 'Temporary Test Expense to Exceed Budget',
      category: 'server',
      provider: 'High Compute Test',
      billingPeriod: '2026-10',
      amount: 60000,
      currency: 'BDT',
      costNature: 'ACTUAL_BILLED',
      paymentStatus: 'paid',
      expenseDate: '2026-10-31',
      createdBy: 'ADMIN-TEST'
    });

    const report = OperationalExpenseManager.getVarianceReport('2026-10');
    assert.strictEqual(report.isOverBudget, true);
    assert(report.burnRatePercent > 100);
    assert(report.activeAlerts.length > 0);

    // Verify admin notifications received notice
    const adminNotifs = serverDB.getCandidateNotifications('admin');
    assert(adminNotifs.some(n => n.title.includes('বাজেট')), 'Admin must receive budget alert notification');

    // Clean up spike expense
    OperationalExpenseManager.deleteExpense(spikeExpense.id, 'ADMIN-TEST');
  });

  // -------------------------------------------------------------
  // VECTOR 5: PLATFORM USAGE & INFRASTRUCTURE ANALYTICS
  // -------------------------------------------------------------
  console.log('\n--- VECTOR 5: PLATFORM USAGE & INFRASTRUCTURE ANALYTICS ---');

  runTest('PlatformUsageAnalytics aggregates real candidate and job counts', () => {
    const snapshot = PlatformUsageAnalytics.getSnapshot();
    assert(snapshot.totalCandidates > 0, 'Total candidates must be > 0');
    assert.strictEqual(snapshot.activeCandidates, snapshot.totalCandidates, 'All registered candidates must have free access');
    assert(snapshot.totalPublishedJobs > 0, 'Published jobs must be > 0');
  });

  runTest('PlatformUsageAnalytics meters disk storage bytes and units', () => {
    const snapshot = PlatformUsageAnalytics.getSnapshot();
    assert(typeof snapshot.storageBytesUsed === 'number');
    assert(snapshot.storageFormatted.length > 0);
    assert(snapshot.storageEstimatedCostBdt > 0);
  });

  runTest('PlatformUsageAnalytics estimates AI and SMS/Email gateway unit costs', () => {
    const snapshot = PlatformUsageAnalytics.getSnapshot();
    assert(snapshot.aiTokensUsed > 0);
    assert(snapshot.aiEstimatedCostBdt > 0);
    assert(snapshot.smsMessagesSent >= 0);
    assert(snapshot.emailsSent >= 0);
    assert(snapshot.totalEstimatedMonthlyCostBdt > 0);
  });

  // -------------------------------------------------------------
  // VECTOR 6: PRESERVATION OF EXISTING DATA & INTEGRITY
  // -------------------------------------------------------------
  console.log('\n--- VECTOR 6: PRESERVATION OF HISTORICAL DATA ---');

  runTest('Historical applications, jobs, and candidates are 100% preserved', () => {
    const jobs = serverDB.getAllJobs();
    assert(jobs.length >= 200, 'All published jobs must be preserved');

    const candidates = serverDB.getAllCandidates();
    assert(candidates.length >= 40, 'All candidate profiles must be preserved');

    const applications = serverDB.getAllApplications();
    assert(applications.length > 0, 'Application records must be preserved');
  });

  // Summary
  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log('STATUS: ALL STEP 13 TESTS PASSED PERFECTLY!');
  } else {
    console.log('STATUS: SOME TESTS FAILED');
    process.exit(1);
  }
  console.log('================================================================');
}

runStep13TestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
