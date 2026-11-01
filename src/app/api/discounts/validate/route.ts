import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { calculateOrderDiscounts, validateMoneyAmount } from '@/lib/discounts';
import { Coupon, RaffleCampaign } from '@/lib/types';

export async function POST(req: Request) {
  const session = getServerSession(req);
  const candidateId = session?.candidateId || 'GUEST';

  try {
    const body = await req.json();

    // 1. Validate service charge input
    const rawService = body.serviceCharge !== undefined ? body.serviceCharge : (body.serviceFee !== undefined ? body.serviceFee : 0);
    const serviceCheck = validateMoneyAmount(rawService, 'Service Charge');
    if (!serviceCheck.valid) {
      return NextResponse.json({ valid: false, error: serviceCheck.error }, { status: 400 });
    }

    // 2. Validate government fee input
    const rawGovtFee = body.governmentFee !== undefined ? body.governmentFee : (body.govtFee !== undefined ? body.govtFee : 0);
    const govtCheck = validateMoneyAmount(rawGovtFee, 'Government Fee');
    if (!govtCheck.valid) {
      return NextResponse.json({ valid: false, error: govtCheck.error }, { status: 400 });
    }

    const applications = candidateId !== 'GUEST' ? serverDB.getApplications(candidateId) : [];
    const isNewCandidate = applications.length === 0;

    // 3. Resolve Coupon
    let coupon: Coupon | null = null;
    let candidateUsageCount = 0;

    if (body.couponCode && typeof body.couponCode === 'string' && body.couponCode.trim()) {
      const code = body.couponCode.trim().toUpperCase();
      coupon = serverDB.getCouponByCode(code);
      if (!coupon) {
        return NextResponse.json({
          valid: false,
          error: 'COUPON_NOT_FOUND: Coupon code \'' + code + '\' does not exist.'
        }, { status: 400 });
      }
      candidateUsageCount = candidateId !== 'GUEST' ? serverDB.getCouponRedemptions(candidateId, coupon.id).length : 0;
    }

    // 4. Resolve Raffle Campaign
    let raffleCampaign: RaffleCampaign | null = null;
    if (body.raffleCampaignId && typeof body.raffleCampaignId === 'string' && body.raffleCampaignId.trim()) {
      const id = body.raffleCampaignId.trim();
      raffleCampaign = serverDB.getRaffleCampaignById(id);
      if (!raffleCampaign) {
        return NextResponse.json({
          valid: false,
          error: 'RAFFLE_NOT_FOUND: Raffle campaign was not found.'
        }, { status: 400 });
      }
    }

    // 5. Authoritative Server-Side Calculation (Dry-Run Preview)
    // Invariant: This endpoint strictly NEVER reserves or writes to the ledger!
    const calculation = calculateOrderDiscounts({
      governmentFee: govtCheck.amount,
      serviceCharge: serviceCheck.amount,
      coupon,
      raffleCampaign,
      candidateContext: {
        candidateId,
        isNewCandidate,
        candidateCouponRedemptionsCount: candidateUsageCount,
        existingOrdersCount: applications.length
      }
    });

    if (!calculation.success) {
      return NextResponse.json({
        valid: false,
        error: calculation.error,
        errors: calculation.errors,
        snapshot: calculation.snapshot
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      snapshot: calculation.snapshot,
      appliedCoupon: calculation.appliedCoupon,
      appliedRaffle: calculation.appliedRaffle,
      invariantsVerified: calculation.invariantsVerified
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      valid: false,
      error: 'SERVER_ERROR: ' + (err.message || 'Validation request failed.')
    }, { status: 500 });
  }
}
