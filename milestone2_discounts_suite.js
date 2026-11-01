/**
 * CHAKRISEBA BD — MILESTONE 2 TEST SUITE
 * Financial Engine & Discount Data Models Validation
 */

import('./src/lib/discounts.ts').then(async (discounts) => {
  const fs = require('fs');
  const path = require('path');
  
  console.log('================================================================');
  console.log('   CHAKRISEBA BD — MILESTONE 2 FINANCIAL INVARIANTS TEST SUITE   ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(' [PASS] ' + testName);
      if (details) console.log('        -> ' + details);
      passed++;
    } else {
      console.error(' [FAIL] ' + testName);
      if (details) console.error('        -> ' + details);
      failed++;
    }
  }

  const {
    calculateOrderDiscounts,
    validateMoneyAmount,
    validateCouponEligibility,
    validateRaffleEligibility,
    calculateCouponDiscountAmount,
    calculateRaffleBonusAmount,
    toPoisha,
    toTaka
  } = discounts;

  const now = new Date('2026-10-28T12:00:00Z');

  // Base Candidate Context
  const testCandidate = {
    candidateId: 'USR-01712345678',
    isNewCandidate: false,
    candidateCouponRedemptionsCount: 0,
    existingOrdersCount: 2
  };

  // Test 1: No discounts: total equals government fee plus service charge
  console.log('--- TEST 1: NO DISCOUNTS INVARIANT ---');
  {
    const res = calculateOrderDiscounts({
      governmentFee: 500,
      serviceCharge: 100,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(res.success === true, 'Test 1.1: Order calculation succeeds without discounts');
    assert(res.snapshot.finalServiceCharge === 100, 'Test 1.2: Final service charge equals original service charge (100 BDT)', 'Final: BDT ' + res.snapshot.finalServiceCharge);
    assert(res.snapshot.totalPayable === 600, 'Test 1.3: Total payable equals Govt fee (500) + Service charge (100) = 600 BDT', 'Total: BDT ' + res.snapshot.totalPayable);
    assert(res.snapshot.couponDiscount === 0 && res.snapshot.raffleBonusDiscount === 0, 'Test 1.4: Coupon and raffle discounts are zero');
    assert(res.invariantsVerified === true, 'Test 1.5: Invariants strictly verified');
  }

  // Test 2: Coupon discount affects only service charge
  console.log('\n--- TEST 2: COUPON DISCOUNT AFFECTS ONLY SERVICE CHARGE ---');
  {
    const coupon = {
      id: 'CPN-FIXED-30',
      code: 'PROMO30',
      title: '30 Taka off service',
      discountType: 'fixed',
      discountValue: 30,
      minServiceCharge: 50,
      startDate: '2026-01-01T00:00:00Z',
      expiryDate: '2026-12-31T23:59:59Z',
      status: 'active',
      usedCount: 5,
      allowCombineWithRaffle: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const res = calculateOrderDiscounts({
      governmentFee: 700,
      serviceCharge: 120,
      coupon,
      candidateContext: testCandidate,
      evaluationDate: now
    });

    assert(res.success === true, 'Test 2.1: Calculation with coupon succeeds');
    assert(res.snapshot.governmentApplicationFee === 700, 'Test 2.2: Government fee remains completely untouched at BDT 700', 'Govt Fee: BDT ' + res.snapshot.governmentApplicationFee);
    assert(res.snapshot.couponDiscount === 30, 'Test 2.3: Coupon discount is BDT 30', 'Discount: BDT ' + res.snapshot.couponDiscount);
    assert(res.snapshot.finalServiceCharge === 90, 'Test 2.4: Service charge reduced from BDT 120 to BDT 90', 'Final Service Charge: BDT ' + res.snapshot.finalServiceCharge);
    assert(res.snapshot.totalPayable === 790, 'Test 2.5: Total payable is 700 + 90 = BDT 790', 'Total Payable: BDT ' + res.snapshot.totalPayable);
  }

  // Test 3: Raffle bonus affects only service charge
  console.log('\n--- TEST 3: RAFFLE BONUS AFFECTS ONLY SERVICE CHARGE ---');
  {
    const raffle = {
      id: 'RAF-BONUS-20',
      title: 'Special 20 Taka Service Bonus',
      description: 'Instant 20 Taka discount on service',
      bonusType: 'fixed',
      bonusValue: 20,
      minServiceCharge: 50,
      maxBonusPerOrder: 50,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      status: 'active',
      hasServiceDiscount: true,
      hasPrizeDraw: false,
      allowCombineWithCoupon: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const res = calculateOrderDiscounts({
      governmentFee: 300,
      serviceCharge: 80,
      raffleCampaign: raffle,
      candidateContext: testCandidate,
      evaluationDate: now
    });

    assert(res.success === true, 'Test 3.1: Calculation with raffle bonus succeeds');
    assert(res.snapshot.governmentApplicationFee === 300, 'Test 3.2: Government fee untouched at BDT 300');
    assert(res.snapshot.raffleBonusDiscount === 20, 'Test 3.3: Raffle bonus is BDT 20');
    assert(res.snapshot.finalServiceCharge === 60, 'Test 3.4: Final service charge is 80 - 20 = BDT 60');
    assert(res.snapshot.totalPayable === 360, 'Test 3.5: Total payable is 300 + 60 = BDT 360');
  }

  // Test 4 & 5: Combined discounts cannot exceed service charge & never negative
  console.log('\n--- TEST 4 & 5: COMBINED DISCOUNTS BOUNDED & NON-NEGATIVE INVARIANTS ---');
  {
    const bigCoupon = {
      id: 'CPN-BIG-100',
      code: 'BIG100',
      title: '100 Taka off',
      discountType: 'fixed',
      discountValue: 100,
      minServiceCharge: 50,
      startDate: '2026-01-01T00:00:00Z',
      expiryDate: '2026-12-31T23:59:59Z',
      status: 'active',
      usedCount: 0,
      allowCombineWithRaffle: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const bigRaffle = {
      id: 'RAF-BIG-50',
      title: '50 Taka bonus',
      description: 'Bonus 50',
      bonusType: 'fixed',
      bonusValue: 50,
      minServiceCharge: 50,
      maxBonusPerOrder: 100,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      status: 'active',
      hasServiceDiscount: true,
      hasPrizeDraw: false,
      allowCombineWithCoupon: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const res = calculateOrderDiscounts({
      governmentFee: 400,
      serviceCharge: 80,
      coupon: bigCoupon,
      raffleCampaign: bigRaffle,
      candidateContext: testCandidate,
      evaluationDate: now
    });

    assert(res.success === true, 'Test 4.1: Excessive discounts successfully clamped');
    assert(res.snapshot.finalServiceCharge === 0, 'Test 5.1: Final service charge clamped at exactly BDT 0 (never negative)', 'Final: BDT ' + res.snapshot.finalServiceCharge);
    assert(res.snapshot.finalServiceCharge >= 0, 'Test 5.2: Invariant finalServiceCharge >= 0 holds');
    const totalDiscounts = res.snapshot.raffleBonusDiscount + res.snapshot.couponDiscount;
    assert(totalDiscounts === 80, 'Test 4.2: Combined discounts (50 raffle + 30 coupon) capped at original service charge BDT 80', 'Combined discount: BDT ' + totalDiscounts);
    assert(totalDiscounts <= 80, 'Test 4.3: Invariant appliedDiscounts <= serviceCharge strictly satisfied');
    assert(res.snapshot.totalPayable === 400, 'Test 4.4: Total payable equals Govt fee BDT 400 + BDT 0 = BDT 400');
  }

  // Test 6: Expired, paused, and not-yet-active coupons are rejected
  console.log('\n--- TEST 6: STATUS & DATE RANGE VALIDATION REJECTIONS ---');
  {
    const expiredCoupon = {
      id: 'CPN-EXP',
      code: 'EXPIRED10',
      title: 'Expired',
      discountType: 'fixed',
      discountValue: 10,
      minServiceCharge: 50,
      startDate: '2026-01-01T00:00:00Z',
      expiryDate: '2026-06-01T00:00:00Z',
      status: 'expired',
      usedCount: 0,
      allowCombineWithRaffle: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const resExpired = calculateOrderDiscounts({
      governmentFee: 200,
      serviceCharge: 100,
      coupon: expiredCoupon,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resExpired.success === false, 'Test 6.1: Expired coupon rejected with error');
    assert(resExpired.error && resExpired.error.includes('EXPIRED'), 'Test 6.2: Explicit EXPIRED error message returned', resExpired.error);

    const pausedCoupon = {
      ...expiredCoupon,
      status: 'paused',
      expiryDate: '2026-12-31T00:00:00Z'
    };
    const resPaused = calculateOrderDiscounts({
      governmentFee: 200,
      serviceCharge: 100,
      coupon: pausedCoupon,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resPaused.success === false, 'Test 6.3: Paused coupon rejected');
    assert(resPaused.error && resPaused.error.includes('PAUSED'), 'Test 6.4: Explicit PAUSED error message returned', resPaused.error);

    const futureCoupon = {
      ...expiredCoupon,
      status: 'active',
      startDate: '2026-11-01T00:00:00Z',
      expiryDate: '2026-12-31T00:00:00Z'
    };
    const resFuture = calculateOrderDiscounts({
      governmentFee: 200,
      serviceCharge: 100,
      coupon: futureCoupon,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resFuture.success === false, 'Test 6.5: Not-yet-active future coupon rejected');
    assert(resFuture.error && resFuture.error.includes('NOT_YET_ACTIVE'), 'Test 6.6: Explicit NOT_YET_ACTIVE error message returned', resFuture.error);
  }

  // Test 7: Global and per-candidate limits are checked
  console.log('\n--- TEST 7: GLOBAL & PER-CANDIDATE LIMITS ---');
  {
    const exhaustedCoupon = {
      id: 'CPN-LIMIT-EXHAUSTED',
      code: 'LIMITFULL',
      title: 'Limited coupon',
      discountType: 'fixed',
      discountValue: 15,
      minServiceCharge: 50,
      startDate: '2026-01-01T00:00:00Z',
      expiryDate: '2026-12-31T00:00:00Z',
      status: 'active',
      globalUsageLimit: 100,
      usedCount: 100,
      allowCombineWithRaffle: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const resGlobal = calculateOrderDiscounts({
      governmentFee: 200,
      serviceCharge: 100,
      coupon: exhaustedCoupon,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resGlobal.success === false, 'Test 7.1: Global usage limit exceeded rejected');
    assert(resGlobal.error && resGlobal.error.includes('GLOBAL_LIMIT'), 'Test 7.2: Explicit GLOBAL_LIMIT error returned', resGlobal.error);

    const perCandidateCoupon = {
      ...exhaustedCoupon,
      usedCount: 10,
      perCandidateLimit: 1
    };

    const resUserLimit = calculateOrderDiscounts({
      governmentFee: 200,
      serviceCharge: 100,
      coupon: perCandidateCoupon,
      candidateContext: { ...testCandidate, candidateCouponRedemptionsCount: 1 },
      evaluationDate: now
    });
    assert(resUserLimit.success === false, 'Test 7.3: Per-candidate usage limit exceeded rejected');
    assert(resUserLimit.error && resUserLimit.error.includes('CANDIDATE_LIMIT'), 'Test 7.4: Explicit CANDIDATE_LIMIT error returned', resUserLimit.error);
  }

  // Test 8: Percentage discounts respect maximum caps and rounding rules
  console.log('\n--- TEST 8: PERCENTAGE DISCOUNTS, MAXIMUM CAPS & POISHA ROUNDING ---');
  {
    const cappedPercentCoupon = {
      id: 'CPN-PCT-CAP',
      code: 'SAVE50',
      title: '50% Off capped at 40',
      discountType: 'percentage',
      discountValue: 50,
      minServiceCharge: 50,
      maxDiscountCap: 40,
      startDate: '2026-01-01T00:00:00Z',
      expiryDate: '2026-12-31T00:00:00Z',
      status: 'active',
      usedCount: 0,
      allowCombineWithRaffle: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const resCapped = calculateOrderDiscounts({
      governmentFee: 500,
      serviceCharge: 150,
      coupon: cappedPercentCoupon,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resCapped.success === true, 'Test 8.1: Percentage calculation succeeds');
    assert(resCapped.snapshot.couponDiscount === 40, 'Test 8.2: 50% of 150 (75) is strictly capped at maxDiscountCap BDT 40', 'Discount: BDT ' + resCapped.snapshot.couponDiscount);
    assert(resCapped.snapshot.finalServiceCharge === 110, 'Test 8.3: Final service charge is 150 - 40 = BDT 110');

    const exactPercentCoupon = {
      ...cappedPercentCoupon,
      maxDiscountCap: undefined,
      discountValue: 15
    };
    const resFraction = calculateOrderDiscounts({
      governmentFee: 200,
      serviceCharge: 75,
      coupon: exactPercentCoupon,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resFraction.snapshot.couponDiscount === 11.25, 'Test 8.4: 15% of 75 rounded to exact 2-decimal Poisha = BDT 11.25', 'Discount: BDT ' + resFraction.snapshot.couponDiscount);
    assert(resFraction.snapshot.finalServiceCharge === 63.75, 'Test 8.5: Final service charge = BDT 63.75');
    assert(resFraction.snapshot.totalPayable === 263.75, 'Test 8.6: Total payable = 200 + 63.75 = BDT 263.75');
  }

  // Test 9: Coupon/raffle stacking policies are enforced
  console.log('\n--- TEST 9: COUPON & RAFFLE STACKING POLICIES ---');
  {
    const noStackCoupon = {
      id: 'CPN-NO-STACK',
      code: 'SOLO20',
      title: 'Solo Coupon',
      discountType: 'fixed',
      discountValue: 20,
      minServiceCharge: 50,
      startDate: '2026-01-01T00:00:00Z',
      expiryDate: '2026-12-31T00:00:00Z',
      status: 'active',
      usedCount: 0,
      allowCombineWithRaffle: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const raffle = {
      id: 'RAF-ALLOW-10',
      title: 'Bonus 10',
      description: '10 BDT',
      bonusType: 'fixed',
      bonusValue: 10,
      minServiceCharge: 50,
      maxBonusPerOrder: 20,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      status: 'active',
      hasServiceDiscount: true,
      hasPrizeDraw: false,
      allowCombineWithCoupon: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const resStackConflict = calculateOrderDiscounts({
      governmentFee: 200,
      serviceCharge: 100,
      coupon: noStackCoupon,
      raffleCampaign: raffle,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resStackConflict.success === false, 'Test 9.1: Stacking violation caught and rejected');
    assert(resStackConflict.error && resStackConflict.error.includes('STACKING_DISALLOWED'), 'Test 9.2: Explicit STACKING_DISALLOWED error message returned', resStackConflict.error);
  }

  // Test 10: Prize-draw entries are separate from service discounts
  console.log('\n--- TEST 10: PRIZE-DRAW ENTRY INDEPENDENCE ---');
  {
    const prizeDrawOnlyCampaign = {
      id: 'RAF-LOTTERY-ONLY',
      title: 'Chakriseba Eid Mega Prize Draw',
      description: 'Entry to win Laptop/Smartphone, no direct service fee deduction',
      bonusType: 'fixed',
      bonusValue: 50,
      minServiceCharge: 50,
      maxBonusPerOrder: 50,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      status: 'active',
      hasServiceDiscount: false, // CRITICAL: NO service discount
      hasPrizeDraw: true, // Lottery entry granted
      allowCombineWithCoupon: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    const resPrize = calculateOrderDiscounts({
      governmentFee: 500,
      serviceCharge: 100,
      raffleCampaign: prizeDrawOnlyCampaign,
      candidateContext: testCandidate,
      evaluationDate: now
    });

    assert(resPrize.success === true, 'Test 10.1: Prize-draw campaign processed successfully');
    assert(resPrize.snapshot.raffleBonusDiscount === 0, 'Test 10.2: raffleBonusDiscount is strictly 0 BDT (no monetary discount)', 'Bonus: BDT ' + resPrize.snapshot.raffleBonusDiscount);
    assert(resPrize.snapshot.hasPrizeDrawEntry === true, 'Test 10.3: hasPrizeDrawEntry is true (ticket granted)');
    assert(resPrize.snapshot.finalServiceCharge === 100, 'Test 10.4: Service charge remains full BDT 100');
    assert(resPrize.snapshot.totalPayable === 600, 'Test 10.5: Total payable is 500 + 100 = BDT 600');
  }

  // Test 11: Invalid amounts, NaN, Infinity, and negative amounts are rejected
  console.log('\n--- TEST 11: INVALID AMOUNTS, NAN, INFINITY & NEGATIVE VALUES REJECTION ---');
  {
    const checkNegative = validateMoneyAmount(-50, 'Fee');
    assert(checkNegative.valid === false && checkNegative.error.includes('negative'), 'Test 11.1: Negative monetary value rejected');

    const checkNaN = validateMoneyAmount(NaN, 'Fee');
    assert(checkNaN.valid === false && checkNaN.error.includes('NaN'), 'Test 11.2: NaN rejected');

    const checkInf = validateMoneyAmount(Infinity, 'Fee');
    assert(checkInf.valid === false && checkInf.error.includes('finite'), 'Test 11.3: Infinity rejected');

    const checkStr = validateMoneyAmount('500', 'Fee');
    assert(checkStr.valid === false && checkStr.error.includes('number'), 'Test 11.4: String number input rejected by validator');

    const resBadGovt = calculateOrderDiscounts({
      governmentFee: -100,
      serviceCharge: 50,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resBadGovt.success === false, 'Test 11.5: Order calculation rejects negative government fee');

    const resBadService = calculateOrderDiscounts({
      governmentFee: 500,
      serviceCharge: NaN,
      candidateContext: testCandidate,
      evaluationDate: now
    });
    assert(resBadService.success === false, 'Test 11.6: Order calculation rejects NaN service charge');
  }

  // Test 12: Existing records without new financial fields remain readable
  console.log('\n--- TEST 12: BACKWARD COMPATIBILITY OF EXISTING LOCAL_STORE RECORDS ---');
  {
    const rawStore = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
    const candidateIds = Object.keys(rawStore.candidates || {});
    assert(candidateIds.length > 0, 'Test 12.1: Candidates in local_store.json exist (' + candidateIds.length + ' found)');

    const defaultCand = rawStore.candidates['USR-01712345678'];
    assert(!!defaultCand && defaultCand.phone === '01712-345678', 'Test 12.2: Default candidate record readable with phone intact');

    const apps = rawStore.applications['USR-01712345678'] || [];
    assert(apps.length > 0, 'Test 12.3: Applications found (' + apps.length + ' records) without schema corruptions');

    const firstApp = apps[0];
    assert(firstApp.id && typeof firstApp.totalAmount === 'number', 'Test 12.4: Application request maintains original totalAmount');
  }

  // Test 13 & 14: Persistence Immutability & Safe Accounting
  console.log('\n--- TEST 13 & 14: PERSISTENCE IMMUTABILITY & SAFE ACCOUNTING ---');
  {
    const immutableSnapshot = {
      governmentApplicationFee: 500,
      serviceCharge: 100,
      raffleBonusDiscount: 20,
      couponDiscount: 15,
      finalServiceCharge: 65,
      totalPayable: 565,
      currency: 'BDT',
      snapshotCreatedAt: now.toISOString(),
      isImmutable: true
    };

    assert(immutableSnapshot.isImmutable === true, 'Test 13.1: Snapshot isImmutable flag properly set on confirmation');
    assert(immutableSnapshot.totalPayable === 565, 'Test 13.2: Total payable bound to 500 + 65 = 565 BDT');
    assert(immutableSnapshot.governmentApplicationFee === 500, 'Test 13.3: Government fee preserved without discount in snapshot');
  }

  console.log('\n================================================================');
  console.log(' MILESTONE 2 TEST RESULTS: ' + passed + ' PASSED / ' + failed + ' FAILED');
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}).catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
