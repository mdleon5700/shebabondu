const http = require('http');

console.log('================================================================');
console.log('   CHAKRISEBA BD — MILESTONE 3: SECURE API TEST SUITE   ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(cond, name, details) {
  if (cond) {
    console.log(' [PASS] ' + name);
    if (details) console.log('        -> ' + details);
    passCount++;
  } else {
    console.error(' [FAIL] ' + name);
    if (details) console.error('        -> ' + details);
    failCount++;
  }
}

function makeReq(path, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000' + path, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function extractCookie(res) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return null;
  const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return raw.split(';')[0];
}

async function runMilestone3Suite() {
  try {
    console.log('--- 1. UNAUTHENTICATED & FORGED ACCESS TO ADMIN APIS (HTTP 401) ---');
    const noAuthGetC = await makeReq('/api/admin/coupons', 'GET');
    assert(noAuthGetC.status === 401, 'Unauth Test 1: GET /api/admin/coupons without session returns 401', noAuthGetC.body?.error);

    const forgedHdrGetC = await makeReq('/api/admin/coupons', 'GET', { 'x-user-role': 'admin', 'x-role': 'admin' });
    assert(forgedHdrGetC.status === 401, 'Unauth Test 2: Client header forgery (x-user-role: admin) returns 401', forgedHdrGetC.body?.error);

    const noAuthPostC = await makeReq('/api/admin/coupons', 'POST', { 'Content-Type': 'application/json' }, { code: 'HACK' });
    assert(noAuthPostC.status === 401, 'Unauth Test 3: POST /api/admin/coupons without session returns 401', noAuthPostC.body?.error);

    const noAuthPatchC = await makeReq('/api/admin/coupons/any-id', 'PATCH', { 'Content-Type': 'application/json' }, { status: 'active' });
    assert(noAuthPatchC.status === 401, 'Unauth Test 4: PATCH /api/admin/coupons/[id] without session returns 401', noAuthPatchC.body?.error);

    const noAuthGetR = await makeReq('/api/admin/raffles', 'GET');
    assert(noAuthGetR.status === 401, 'Unauth Test 5: GET /api/admin/raffles without session returns 401', noAuthGetR.body?.error);

    const noAuthPostR = await makeReq('/api/admin/raffles', 'POST', { 'Content-Type': 'application/json' }, { title: 'Hack' });
    assert(noAuthPostR.status === 401, 'Unauth Test 6: POST /api/admin/raffles without session returns 401', noAuthPostR.body?.error);

    const noAuthPatchR = await makeReq('/api/admin/raffles/any-id', 'PATCH', { 'Content-Type': 'application/json' }, { status: 'active' });
    assert(noAuthPatchR.status === 401, 'Unauth Test 7: PATCH /api/admin/raffles/[id] without session returns 401', noAuthPatchR.body?.error);

    console.log('\n--- 2. CANDIDATE ACCESS TO ADMIN APIS (HTTP 403 FORBIDDEN) ---');
    const candLogin = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      phone: '01712-345678',
      password: '123456'
    });
    assert(candLogin.status === 200 && candLogin.body.success, 'Candidate Login succeeded');
    const candCookie = extractCookie(candLogin);
    assert(!!candCookie, 'Candidate session cookie extracted', candCookie);

    const candGetCoupons = await makeReq('/api/admin/coupons', 'GET', { 'Cookie': candCookie });
    assert(candGetCoupons.status === 403, 'Candidate RBAC Test 1: Candidate GET /api/admin/coupons returns 403 Forbidden', candGetCoupons.body?.error);

    const candPostCoupons = await makeReq('/api/admin/coupons', 'POST', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, { code: 'ATTEMPT' });
    assert(candPostCoupons.status === 403, 'Candidate RBAC Test 2: Candidate POST /api/admin/coupons returns 403 Forbidden', candPostCoupons.body?.error);

    const candPatchCoupons = await makeReq('/api/admin/coupons/any-id', 'PATCH', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, { status: 'active' });
    assert(candPatchCoupons.status === 403, 'Candidate RBAC Test 3: Candidate PATCH /api/admin/coupons/[id] returns 403 Forbidden', candPatchCoupons.body?.error);

    const candGetRaffles = await makeReq('/api/admin/raffles', 'GET', { 'Cookie': candCookie });
    assert(candGetRaffles.status === 403, 'Candidate RBAC Test 4: Candidate GET /api/admin/raffles returns 403 Forbidden', candGetRaffles.body?.error);

    const candPostRaffles = await makeReq('/api/admin/raffles', 'POST', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, { title: 'Attempt' });
    assert(candPostRaffles.status === 403, 'Candidate RBAC Test 5: Candidate POST /api/admin/raffles returns 403 Forbidden', candPostRaffles.body?.error);

    const candPatchRaffles = await makeReq('/api/admin/raffles/any-id', 'PATCH', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, { status: 'active' });
    assert(candPatchRaffles.status === 403, 'Candidate RBAC Test 6: Candidate PATCH /api/admin/raffles/[id] returns 403 Forbidden', candPatchRaffles.body?.error);

    const candForgedHeader = await makeReq('/api/admin/coupons', 'GET', { 'Cookie': candCookie, 'x-user-role': 'admin' });
    assert(candForgedHeader.status === 403, 'Candidate RBAC Test 7: Candidate with x-user-role: admin header still returns 403 Forbidden');

    console.log('\n--- 3. ADMIN AUTHENTICATION & COUPON MANAGEMENT (GET, POST, PATCH) ---');
    const adminLogin = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      role: 'admin',
      adminPin: 'CHAKRISEBA_SECURE_ADMIN_2026'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user?.role === 'admin', 'Admin Login succeeded');
    const adminCookie = extractCookie(adminLogin);
    assert(!!adminCookie, 'Admin session cookie extracted');

    const adminGetCoupons = await makeReq('/api/admin/coupons', 'GET', { 'Cookie': adminCookie });
    assert(adminGetCoupons.status === 200 && Array.isArray(adminGetCoupons.body.coupons), 'Admin Coupon Test 1: GET /api/admin/coupons returns 200 with array', 'Count: ' + adminGetCoupons.body.coupons.length);

    // Validation: Missing title
    const invalidPost1 = await makeReq('/api/admin/coupons', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      code: 'TESTCODE'
    });
    assert(invalidPost1.status === 400 && invalidPost1.body?.error.includes('TITLE_REQUIRED'), 'Admin Coupon Test 2: Missing title rejected with 400', invalidPost1.body?.error);

    // Validation: Percentage > 100
    const invalidPost2 = await makeReq('/api/admin/coupons', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      code: 'OVER100',
      title: 'Invalid Percentage Coupon',
      discountType: 'percentage',
      discountValue: 150,
      minServiceCharge: 100,
      startDate: '2026-01-01T00:00:00.000Z',
      expiryDate: '2026-12-31T23:59:59.000Z'
    });
    assert(invalidPost2.status === 400 && invalidPost2.body?.error.includes('INVALID_PERCENTAGE'), 'Admin Coupon Test 3: Percentage > 100 rejected with 400', invalidPost2.body?.error);

    // Validation: Negative numbers
    const invalidPost3 = await makeReq('/api/admin/coupons', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      code: 'NEGATIVE',
      title: 'Negative Discount Coupon',
      discountType: 'fixed',
      discountValue: -20,
      minServiceCharge: 100,
      startDate: '2026-01-01T00:00:00.000Z',
      expiryDate: '2026-12-31T23:59:59.000Z'
    });
    assert(invalidPost3.status === 400 && invalidPost3.body?.error.includes('INVALID_DISCOUNT_VALUE'), 'Admin Coupon Test 4: Negative discountValue rejected with 400', invalidPost3.body?.error);

    // Validation: startDate after expiryDate
    const invalidPost4 = await makeReq('/api/admin/coupons', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      code: 'BADDATES',
      title: 'Inverted Date Coupon',
      discountType: 'fixed',
      discountValue: 20,
      minServiceCharge: 100,
      startDate: '2026-12-31T23:59:59.000Z',
      expiryDate: '2026-01-01T00:00:00.000Z'
    });
    assert(invalidPost4.status === 400 && invalidPost4.body?.error.includes('INVALID_DATE_RANGE'), 'Admin Coupon Test 5: startDate > expiryDate rejected with 400', invalidPost4.body?.error);

    // Valid Coupon Creation with lowercase code to test normalization
    const uniqueSuffix = Date.now().toString().slice(-4);
    const codeEid = 'eid' + uniqueSuffix;
    const createEidCoupon = await makeReq('/api/admin/coupons', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      code: codeEid,
      title: 'ঈদ স্পেশাল অফার ২৫%',
      discountType: 'percentage',
      discountValue: 25,
      minServiceCharge: 100,
      maxDiscountCap: 50,
      startDate: '2026-01-01T00:00:00.000Z',
      expiryDate: '2026-12-31T23:59:59.000Z',
      globalUsageLimit: 50,
      perCandidateLimit: 1,
      allowCombineWithRaffle: true,
      description: 'ঈদ অফার ২৫% ডিসকাউন্ট'
    });
    assert(createEidCoupon.status === 201 && createEidCoupon.body.coupon, 'Admin Coupon Test 6: Valid percentage coupon created with 201', createEidCoupon.body.coupon?.code);
    assert(createEidCoupon.body.coupon?.code === codeEid.toUpperCase(), 'Admin Coupon Test 7: Coupon code normalized to uppercase', createEidCoupon.body.coupon?.code);
    const createdCouponId = createEidCoupon.body.coupon?.id;

    // Duplicate Code Prevention (Case-insensitive)
    const duplicateCoupon = await makeReq('/api/admin/coupons', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      code: codeEid.toUpperCase(),
      title: 'Duplicate Attempt',
      discountType: 'fixed',
      discountValue: 30,
      minServiceCharge: 100,
      startDate: '2026-01-01T00:00:00.000Z',
      expiryDate: '2026-12-31T23:59:59.000Z'
    });
    assert(duplicateCoupon.status === 409 && duplicateCoupon.body?.error.includes('COUPON_CODE_EXISTS'), 'Admin Coupon Test 8: Duplicate coupon code rejected with 409 Conflict', duplicateCoupon.body?.error);

    // Create a second valid coupon: Flat BDT discount
    const codeFlat = 'flat' + uniqueSuffix;
    const createFlatCoupon = await makeReq('/api/admin/coupons', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      code: codeFlat,
      title: '১৫ টাকা ফ্ল্যাট ছাড়',
      discountType: 'fixed',
      discountValue: 15,
      minServiceCharge: 100,
      startDate: '2026-01-01T00:00:00.000Z',
      expiryDate: '2026-12-31T23:59:59.000Z',
      globalUsageLimit: 100,
      allowCombineWithRaffle: false,
      description: '১৫ টাকা নিশ্চিত ছাড়'
    });
    assert(createFlatCoupon.status === 201 && createFlatCoupon.body.coupon?.code === codeFlat.toUpperCase(), 'Admin Coupon Test 9: Fixed discount coupon created', codeFlat.toUpperCase());

    // Patch Coupon: Update status to 'paused'
    const patchCouponRes = await makeReq('/api/admin/coupons/' + createdCouponId, 'PATCH', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      status: 'paused',
      maxDiscountCap: 60
    });
    assert(patchCouponRes.status === 200 && patchCouponRes.body.coupon?.status === 'paused' && patchCouponRes.body.coupon?.maxDiscountCap === 60, 'Admin Coupon Test 10: PATCH updates status to paused & updates limit', 'Status: ' + patchCouponRes.body.coupon?.status);

    // Patch non-existent coupon
    const patchNonExistent = await makeReq('/api/admin/coupons/non-existent-999', 'PATCH', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      status: 'active'
    });
    assert(patchNonExistent.status === 404, 'Admin Coupon Test 11: PATCH non-existent coupon returns 404', patchNonExistent.body?.error);

    console.log('\n--- 4. ADMIN RAFFLE MANAGEMENT (GET, POST, PATCH) ---');
    const adminGetRaffles = await makeReq('/api/admin/raffles', 'GET', { 'Cookie': adminCookie });
    assert(adminGetRaffles.status === 200 && Array.isArray(adminGetRaffles.body.campaigns), 'Admin Raffle Test 1: GET /api/admin/raffles returns 200 with campaigns array', 'Count: ' + adminGetRaffles.body.campaigns.length);

    // Validation: Missing fields
    const invalidRaffle1 = await makeReq('/api/admin/raffles', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      title: 'Missing Rules'
    });
    assert(invalidRaffle1.status === 400, 'Admin Raffle Test 2: Missing fields rejected with 400', invalidRaffle1.body?.error);

    // Valid Raffle 1: Service charge monetary discount
    const createRaffle1 = await makeReq('/api/admin/raffles', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      title: 'বৈশাখী স্পেশাল ডিসকাউন্ট ' + uniqueSuffix,
      description: 'সার্ভিস চার্জে ২০ টাকা সরাসরি ছাড়',
      hasServiceDiscount: true,
      hasPrizeDraw: false,
      bonusType: 'fixed',
      bonusValue: 20,
      minServiceCharge: 100,
      maxBonusPerOrder: 20,
      totalBudget: 5000,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      allowCombineWithCoupon: true
    });
    assert(createRaffle1.status === 201 && createRaffle1.body.campaign, 'Admin Raffle Test 3: Monetary service charge discount campaign created (201)', createRaffle1.body.campaign?.title);
    const monetaryRaffleId = createRaffle1.body.campaign?.id;

    // Valid Raffle 2: Pure prize draw entries (Monetary discount MUST be 0)
    const createRaffle2 = await makeReq('/api/admin/raffles', 'POST', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      title: 'মোটরসাইকেল মেগা র‍্যাফেল ড্র ' + uniqueSuffix,
      description: 'প্রতি আবেদনে নিশ্চিত র‍্যাফেল টিকিট ড্র এন্ট্রি',
      hasServiceDiscount: false,
      hasPrizeDraw: true,
      bonusType: 'fixed',
      bonusValue: 0,
      minServiceCharge: 0,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      allowCombineWithCoupon: true
    });
    assert(createRaffle2.status === 201 && createRaffle2.body.campaign?.hasPrizeDraw && !createRaffle2.body.campaign?.hasServiceDiscount, 'Admin Raffle Test 4: Pure prize-draw campaign created with hasServiceDiscount = false', 'hasPrizeDraw: ' + createRaffle2.body.campaign?.hasPrizeDraw);
    const prizeDrawRaffleId = createRaffle2.body.campaign?.id;

    // Patch Raffle: Status & budget update
    const patchRaffleRes = await makeReq('/api/admin/raffles/' + monetaryRaffleId, 'PATCH', { 'Cookie': adminCookie, 'Content-Type': 'application/json' }, {
      status: 'active',
      totalBudget: 6000
    });
    assert(patchRaffleRes.status === 200 && patchRaffleRes.body.campaign?.totalBudget === 6000, 'Admin Raffle Test 5: PATCH updates total budget safely', 'New budget: ' + patchRaffleRes.body.campaign?.totalBudget);

    console.log('\n--- 5. CANDIDATE AVAILABLE DISCOUNTS API (GET /api/discounts/available) ---');
    const noAuthAvail = await makeReq('/api/discounts/available', 'GET');
    assert(noAuthAvail.status === 401, 'Available Discounts Test 1: Unauthenticated request returns 401', noAuthAvail.body?.error);

    const candAvail = await makeReq('/api/discounts/available', 'GET', { 'Cookie': candCookie });
    assert(candAvail.status === 200 && Array.isArray(candAvail.body.coupons), 'Available Discounts Test 2: Candidate receives active offers', 'Coupons: ' + candAvail.body.coupons.length);

    // Check that paused coupon (createdCouponId) is NOT disclosed to candidate
    const disclosedPausedCoupon = candAvail.body.coupons.find(c => c.id === createdCouponId);
    assert(!disclosedPausedCoupon, 'Available Discounts Test 3: Paused coupon is withheld from candidate offer disclosure');

    // Check that active FLAT coupon IS disclosed
    const disclosedFlatCoupon = candAvail.body.coupons.find(c => c.code === codeFlat.toUpperCase());
    assert(!!disclosedFlatCoupon, 'Available Discounts Test 4: Active coupon is disclosed to candidate', disclosedFlatCoupon?.code);

    // Information disclosure check: Internal budgets or admin notes not leaked in disclosed coupons or raffle
    const leakedBudgetCoupons = candAvail.body.coupons.some(c => c.totalBudget !== undefined || c.usedBudget !== undefined);
    assert(leakedBudgetCoupons === false, 'Available Discounts Test 5: Sensitive internal budget fields (totalBudget/usedBudget) are stripped from disclosed coupons');

    if (candAvail.body.raffleCampaign) {
      assert(candAvail.body.raffleCampaign.totalBudget === undefined && candAvail.body.raffleCampaign.usedBudget === undefined, 'Available Discounts Test 6: Internal raffle budget fields are stripped from candidate response');
    }

    console.log('\n--- 6. CANDIDATE DISCOUNT VALIDATION API (POST /api/discounts/validate) ---');
    const noAuthVal = await makeReq('/api/discounts/validate', 'POST', { 'Content-Type': 'application/json' }, {
      governmentFee: 500,
      serviceCharge: 120
    });
    assert(noAuthVal.status === 401, 'Validate Discounts Test 1: Unauthenticated validation returns 401', noAuthVal.body?.error);

    // Invalid negative amounts
    const invalidValNegative = await makeReq('/api/discounts/validate', 'POST', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, {
      governmentFee: 500,
      serviceCharge: -120
    });
    assert(invalidValNegative.status === 400, 'Validate Discounts Test 2: Negative serviceCharge rejected with 400', invalidValNegative.body?.error);

    // Valid dry-run calculation with coupon FLAT15
    const testGovtFee = 500;
    const testServiceCharge = 120;
    const valWithCoupon = await makeReq('/api/discounts/validate', 'POST', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, {
      governmentFee: testGovtFee,
      serviceCharge: testServiceCharge,
      couponCode: codeFlat.toUpperCase()
    });
    assert(valWithCoupon.status === 200 && valWithCoupon.body.valid === true, 'Validate Discounts Test 3: Valid coupon calculation succeeds');
    const snap = valWithCoupon.body.snapshot;
    assert(snap.governmentApplicationFee === 500, 'Validate Discounts Test 4: Govt fee strictly preserved at 500 BDT', snap.governmentApplicationFee);
    assert(snap.couponDiscount === 15, 'Validate Discounts Test 5: Fixed coupon discount of 15 BDT applied', snap.couponDiscount);
    assert(snap.finalServiceCharge === 105, 'Validate Discounts Test 6: Final service charge computed as 105 BDT', snap.finalServiceCharge);
    assert(snap.totalPayable === 605, 'Validate Discounts Test 7: Total payable computed as 605 BDT', snap.totalPayable);

    // DRY RUN ISOLATION: Confirm usage count was NOT permanently incremented
    const adminCheckCoupon = await makeReq('/api/admin/coupons', 'GET', { 'Cookie': adminCookie });
    const freshCouponObj = adminCheckCoupon.body.coupons.find(c => c.code === codeFlat.toUpperCase());
    assert(freshCouponObj?.usedCount === 0, 'Validate Discounts Test 8: DRY-RUN SAFETY: usedCount remains 0 after validation preview', 'usedCount: ' + freshCouponObj?.usedCount);

    // Pure Prize Draw Validation: Confirms monetary discount is 0
    const valPrizeDraw = await makeReq('/api/discounts/validate', 'POST', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, {
      governmentFee: 500,
      serviceCharge: 120,
      raffleCampaignId: prizeDrawRaffleId
    });
    assert(valPrizeDraw.status === 200 && valPrizeDraw.body.valid === true, 'Validate Discounts Test 9: Prize-draw campaign validation succeeds');
    assert(valPrizeDraw.body.snapshot.raffleBonusDiscount === 0, 'Validate Discounts Test 10: Prize draw DOES NOT reduce monetary service charge (discount = 0)', valPrizeDraw.body.snapshot.raffleBonusDiscount);
    assert(valPrizeDraw.body.snapshot.hasPrizeDrawEntry === true, 'Validate Discounts Test 11: Prize draw ticket entry granted (hasPrizeDrawEntry: true)', valPrizeDraw.body.snapshot.hasPrizeDrawEntry);
    assert(valPrizeDraw.body.snapshot.finalServiceCharge === 120, 'Validate Discounts Test 12: Service charge unchanged at 120 BDT');
    assert(valPrizeDraw.body.snapshot.totalPayable === 620, 'Validate Discounts Test 13: Total payable unchanged at 620 BDT');

    // Monetary Raffle Discount Validation
    const valMonetaryRaffle = await makeReq('/api/discounts/validate', 'POST', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, {
      governmentFee: 500,
      serviceCharge: 120,
      raffleCampaignId: monetaryRaffleId
    });
    assert(valMonetaryRaffle.status === 200 && valMonetaryRaffle.body.valid === true, 'Validate Discounts Test 14: Monetary raffle campaign validation succeeds');
    assert(valMonetaryRaffle.body.snapshot.raffleBonusDiscount === 20, 'Validate Discounts Test 15: Monetary raffle discount of 20 BDT applied', valMonetaryRaffle.body.snapshot.raffleBonusDiscount);
    assert(valMonetaryRaffle.body.snapshot.finalServiceCharge === 100, 'Validate Discounts Test 16: Final service charge computed as 100 BDT', valMonetaryRaffle.body.snapshot.finalServiceCharge);

    // Stacking Restriction Check: codeFlat has allowCombineWithRaffle = false
    const valStackingConflict = await makeReq('/api/discounts/validate', 'POST', { 'Cookie': candCookie, 'Content-Type': 'application/json' }, {
      governmentFee: 500,
      serviceCharge: 120,
      couponCode: codeFlat.toUpperCase(),
      raffleCampaignId: monetaryRaffleId
    });
    assert(valStackingConflict.status === 400 && valStackingConflict.body.valid === false, 'Validate Discounts Test 17: Non-stackable coupon rejects combining with raffle', valStackingConflict.body.error);

    console.log('\n================================================================');
    console.log('   MILESTONE 3 RESULTS: ' + passCount + ' PASSED, ' + failCount + ' FAILED');
    console.log('================================================================\n');

    process.exit(failCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('Milestone 3 Test Suite error:', err);
    process.exit(1);
  }
}

runMilestone3Suite();
