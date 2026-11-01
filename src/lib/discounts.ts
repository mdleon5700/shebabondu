/**
 * CHAKRISEBA BD — Pure Server-Side Financial & Discount Engine
 * Milestone 2: Coupon Management & Raffle Bonus Invariants
 * 
 * FINANCIAL INVARIANTS:
 * 1. finalServiceCharge = Math.max(0, serviceCharge - appliedRaffleBonus - appliedCouponDiscount)
 * 2. totalPayable = governmentApplicationFee + finalServiceCharge
 * 3. Government application fees must NEVER be discounted under any circumstances.
 * 4. Combined discounts must never exceed the original service charge.
 * 5. All monetary calculations use 2-decimal precision (Poisha units) to eliminate floating-point drift.
 */

import type { Coupon, RaffleCampaign, FinancialSnapshot } from './types';

export interface CandidateDiscountContext {
  candidateId: string;
  isNewCandidate?: boolean;
  candidateCouponRedemptionsCount?: number;
  existingOrdersCount?: number;
}

export interface OrderFinancialParams {
  governmentFee: number;
  serviceCharge: number;
  coupon?: Coupon | null;
  raffleCampaign?: RaffleCampaign | null;
  candidateContext: CandidateDiscountContext;
  evaluationDate?: Date;
}

export interface FinancialCalculationResult {
  success: boolean;
  error?: string;
  errors?: string[];
  snapshot: FinancialSnapshot;
  appliedCoupon: { code: string; discount: number } | null;
  appliedRaffle: { campaignId: string; bonus: number; hasPrizeDrawEntry: boolean } | null;
  invariantsVerified: boolean;
}

export function toPoisha(taka: number): number {
  return Math.round(taka * 100);
}

export function toTaka(poisha: number): number {
  return Math.round(poisha) / 100;
}

export function validateMoneyAmount(value: unknown, fieldName: string): { valid: boolean; error?: string; amount: number } {
  if (value === null || value === undefined) {
    return { valid: false, error: fieldName + ' is required.', amount: 0 };
  }
  if (typeof value !== 'number') {
    return { valid: false, error: fieldName + ' must be a number.', amount: 0 };
  }
  if (Number.isNaN(value)) {
    return { valid: false, error: fieldName + ' cannot be NaN.', amount: 0 };
  }
  if (!Number.isFinite(value)) {
    return { valid: false, error: fieldName + ' must be a finite number.', amount: 0 };
  }
  if (value < 0) {
    return { valid: false, error: fieldName + ' cannot be negative.', amount: 0 };
  }
  return { valid: true, amount: toTaka(toPoisha(value)) };
}

export function validateCouponEligibility(
  coupon: Coupon | null | undefined,
  context: CandidateDiscountContext,
  serviceCharge: number,
  now: Date = new Date()
): { eligible: boolean; error?: string } {
  if (!coupon) {
    return { eligible: false, error: 'COUPON_NOT_FOUND: Coupon does not exist.' };
  }

  if (coupon.status === 'paused') {
    return { eligible: false, error: 'COUPON_PAUSED: Coupon is currently paused.' };
  }
  if (coupon.status === 'expired') {
    return { eligible: false, error: 'COUPON_EXPIRED: Coupon is expired.' };
  }
  if (coupon.status !== 'active') {
    return { eligible: false, error: 'COUPON_INACTIVE: Coupon is ' + coupon.status + '.' };
  }

  const nowMs = now.getTime();
  if (coupon.startDate && new Date(coupon.startDate).getTime() > nowMs) {
    return { eligible: false, error: 'COUPON_NOT_YET_ACTIVE: Coupon campaign has not started yet.' };
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < nowMs) {
    return { eligible: false, error: 'COUPON_EXPIRED: Coupon has passed its expiration date.' };
  }

  if (coupon.minServiceCharge !== undefined && serviceCharge < coupon.minServiceCharge) {
    return {
      eligible: false,
      error: 'COUPON_MIN_CHARGE_NOT_MET: Service charge of ৳' + serviceCharge + ' is below required minimum of ৳' + coupon.minServiceCharge + '.'
    };
  }

  if (coupon.globalUsageLimit !== undefined && coupon.usedCount >= coupon.globalUsageLimit) {
    return { eligible: false, error: 'COUPON_GLOBAL_LIMIT_EXHAUSTED: Coupon has reached its total usage limit.' };
  }

  if (coupon.totalBudget !== undefined && coupon.usedBudget !== undefined && coupon.usedBudget >= coupon.totalBudget) {
    return { eligible: false, error: 'COUPON_BUDGET_EXHAUSTED: Promotional budget for this coupon has been exhausted.' };
  }

  const candidateLimit = coupon.perCandidateLimit ?? 1;
  const candidateRedemptions = context.candidateCouponRedemptionsCount ?? 0;
  if (candidateRedemptions >= candidateLimit) {
    return {
      eligible: false,
      error: 'COUPON_CANDIDATE_LIMIT_EXCEEDED: Candidate has already used this coupon ' + candidateRedemptions + ' time(s) (limit: ' + candidateLimit + ').'
    };
  }

  if (coupon.newCandidateOnly) {
    const isNew = context.isNewCandidate ?? (context.existingOrdersCount === 0);
    if (!isNew) {
      return { eligible: false, error: 'COUPON_NEW_CANDIDATE_ONLY: This coupon is reserved for first-time applicants.' };
    }
  }

  return { eligible: true };
}

export function validateRaffleEligibility(
  campaign: RaffleCampaign | null | undefined,
  serviceCharge: number,
  now: Date = new Date()
): { eligible: boolean; error?: string } {
  if (!campaign) {
    return { eligible: false, error: 'RAFFLE_NOT_FOUND: Raffle campaign does not exist.' };
  }

  if (campaign.status === 'paused') {
    return { eligible: false, error: 'RAFFLE_PAUSED: Raffle campaign is currently paused.' };
  }
  if (campaign.status === 'ended') {
    return { eligible: false, error: 'RAFFLE_ENDED: Raffle campaign has ended.' };
  }
  if (campaign.status !== 'active') {
    return { eligible: false, error: 'RAFFLE_INACTIVE: Raffle campaign is ' + campaign.status + '.' };
  }

  const nowMs = now.getTime();
  if (campaign.startDate && new Date(campaign.startDate).getTime() > nowMs) {
    return { eligible: false, error: 'RAFFLE_NOT_YET_ACTIVE: Raffle campaign has not started yet.' };
  }
  if (campaign.endDate && new Date(campaign.endDate).getTime() < nowMs) {
    return { eligible: false, error: 'RAFFLE_EXPIRED: Raffle campaign duration has expired.' };
  }

  if (campaign.minServiceCharge !== undefined && serviceCharge < campaign.minServiceCharge) {
    return {
      eligible: false,
      error: 'RAFFLE_MIN_CHARGE_NOT_MET: Service charge of ৳' + serviceCharge + ' is below required minimum of ৳' + campaign.minServiceCharge + '.'
    };
  }

  if (campaign.hasServiceDiscount && campaign.totalBudget !== undefined && campaign.usedBudget !== undefined && campaign.usedBudget >= campaign.totalBudget) {
    return { eligible: false, error: 'RAFFLE_BUDGET_EXHAUSTED: Raffle promotional bonus budget is exhausted.' };
  }

  return { eligible: true };
}

export function calculateCouponDiscountAmount(coupon: Coupon, serviceCharge: number): number {
  if (serviceCharge <= 0) return 0;

  let discountPoisha = 0;
  const serviceChargePoisha = toPoisha(serviceCharge);

  if (coupon.discountType === 'percentage') {
    const pct = Math.max(0, Math.min(100, coupon.discountValue));
    discountPoisha = Math.round((serviceChargePoisha * pct) / 100);
    if (coupon.maxDiscountCap !== undefined && coupon.maxDiscountCap > 0) {
      discountPoisha = Math.min(discountPoisha, toPoisha(coupon.maxDiscountCap));
    }
  } else {
    discountPoisha = toPoisha(Math.max(0, coupon.discountValue));
    if (coupon.maxDiscountCap !== undefined && coupon.maxDiscountCap > 0) {
      discountPoisha = Math.min(discountPoisha, toPoisha(coupon.maxDiscountCap));
    }
  }

  discountPoisha = Math.min(discountPoisha, serviceChargePoisha);
  return toTaka(discountPoisha);
}

export function calculateRaffleBonusAmount(campaign: RaffleCampaign, serviceCharge: number): number {
  if (serviceCharge <= 0 || !campaign.hasServiceDiscount) {
    return 0;
  }

  let bonusPoisha = 0;
  const serviceChargePoisha = toPoisha(serviceCharge);

  if (campaign.bonusType === 'percentage') {
    const pct = Math.max(0, Math.min(100, campaign.bonusValue));
    bonusPoisha = Math.round((serviceChargePoisha * pct) / 100);
  } else {
    bonusPoisha = toPoisha(Math.max(0, campaign.bonusValue));
  }

  if (campaign.maxBonusPerOrder !== undefined && campaign.maxBonusPerOrder > 0) {
    bonusPoisha = Math.min(bonusPoisha, toPoisha(campaign.maxBonusPerOrder));
  }

  bonusPoisha = Math.min(bonusPoisha, serviceChargePoisha);
  return toTaka(bonusPoisha);
}

export function calculateOrderDiscounts(params: OrderFinancialParams): FinancialCalculationResult {
  const { governmentFee, serviceCharge, coupon, raffleCampaign, candidateContext, evaluationDate } = params;
  const now = evaluationDate || new Date();
  const errors: string[] = [];

  const govtCheck = validateMoneyAmount(governmentFee, 'Government Application Fee');
  if (!govtCheck.valid) {
    return createFailureResult(govtCheck.error || 'Invalid government fee', govtCheck.amount, 0);
  }

  const serviceCheck = validateMoneyAmount(serviceCharge, 'Service Charge');
  if (!serviceCheck.valid) {
    return createFailureResult(serviceCheck.error || 'Invalid service charge', govtCheck.amount, serviceCheck.amount);
  }

  const validGovtFee = govtCheck.amount;
  const validServiceCharge = serviceCheck.amount;

  let appliedCouponDiscount = 0;
  let appliedRaffleBonus = 0;
  let appliedCouponCode: string | undefined = undefined;
  let appliedRaffleCampaignId: string | undefined = undefined;
  let hasPrizeDrawEntry = false;

  if (coupon) {
    const couponVal = validateCouponEligibility(coupon, candidateContext, validServiceCharge, now);
    if (!couponVal.eligible) {
      errors.push(couponVal.error || 'Invalid coupon');
    } else {
      appliedCouponDiscount = calculateCouponDiscountAmount(coupon, validServiceCharge);
      appliedCouponCode = coupon.code.toUpperCase();
    }
  }

  if (raffleCampaign) {
    const raffleVal = validateRaffleEligibility(raffleCampaign, validServiceCharge, now);
    if (!raffleVal.eligible) {
      errors.push(raffleVal.error || 'Invalid raffle campaign');
    } else {
      if (raffleCampaign.hasServiceDiscount) {
        appliedRaffleBonus = calculateRaffleBonusAmount(raffleCampaign, validServiceCharge);
      }
      if (raffleCampaign.hasPrizeDraw) {
        hasPrizeDrawEntry = true;
      }
      appliedRaffleCampaignId = raffleCampaign.id;
    }
  }

  if (coupon && raffleCampaign && appliedCouponCode && appliedRaffleCampaignId) {
    if (!coupon.allowCombineWithRaffle) {
      errors.push('STACKING_DISALLOWED: Coupon ' + coupon.code + ' cannot be combined with raffle campaigns.');
    }
    if (!raffleCampaign.allowCombineWithCoupon) {
      errors.push('STACKING_DISALLOWED: Raffle campaign ' + raffleCampaign.title + ' cannot be combined with coupons.');
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('; '),
      errors,
      snapshot: {
        governmentApplicationFee: validGovtFee,
        serviceCharge: validServiceCharge,
        raffleBonusDiscount: 0,
        couponDiscount: 0,
        finalServiceCharge: validServiceCharge,
        totalPayable: toTaka(toPoisha(validGovtFee) + toPoisha(validServiceCharge)),
        currency: 'BDT',
        snapshotCreatedAt: now.toISOString(),
        isImmutable: false
      },
      appliedCoupon: null,
      appliedRaffle: null,
      invariantsVerified: false
    };
  }

  const origServicePoisha = toPoisha(validServiceCharge);
  let rafflePoisha = toPoisha(appliedRaffleBonus);
  let couponPoisha = toPoisha(appliedCouponDiscount);

  rafflePoisha = Math.min(rafflePoisha, origServicePoisha);
  const remainingServicePoisha = Math.max(0, origServicePoisha - rafflePoisha);
  couponPoisha = Math.min(couponPoisha, remainingServicePoisha);

  const finalServicePoisha = Math.max(0, origServicePoisha - rafflePoisha - couponPoisha);
  const totalPayablePoisha = toPoisha(validGovtFee) + finalServicePoisha;

  const finalServiceCharge = toTaka(finalServicePoisha);
  const totalPayable = toTaka(totalPayablePoisha);
  appliedRaffleBonus = toTaka(rafflePoisha);
  appliedCouponDiscount = toTaka(couponPoisha);

  const invariantsVerified = 
    finalServiceCharge >= 0 &&
    appliedRaffleBonus + appliedCouponDiscount <= validServiceCharge &&
    totalPayable === toTaka(toPoisha(validGovtFee) + toPoisha(finalServiceCharge));

  const snapshot: FinancialSnapshot = {
    governmentApplicationFee: validGovtFee,
    serviceCharge: validServiceCharge,
    raffleBonusDiscount: appliedRaffleBonus,
    couponDiscount: appliedCouponDiscount,
    finalServiceCharge,
    totalPayable,
    paymentStatus: 'pending',
    currency: 'BDT',
    appliedCouponCode,
    appliedRaffleCampaignId,
    hasPrizeDrawEntry,
    snapshotCreatedAt: now.toISOString(),
    isImmutable: false
  };

  return {
    success: true,
    snapshot,
    appliedCoupon: appliedCouponCode ? { code: appliedCouponCode, discount: appliedCouponDiscount } : null,
    appliedRaffle: appliedRaffleCampaignId ? { campaignId: appliedRaffleCampaignId, bonus: appliedRaffleBonus, hasPrizeDrawEntry } : null,
    invariantsVerified
  };
}

function createFailureResult(errorMsg: string, govtFee = 0, serviceFee = 0): FinancialCalculationResult {
  return {
    success: false,
    error: errorMsg,
    errors: [errorMsg],
    snapshot: {
      governmentApplicationFee: govtFee,
      serviceCharge: serviceFee,
      raffleBonusDiscount: 0,
      couponDiscount: 0,
      finalServiceCharge: serviceFee,
      totalPayable: toTaka(toPoisha(govtFee) + toPoisha(serviceFee)),
      currency: 'BDT',
      snapshotCreatedAt: new Date().toISOString(),
      isImmutable: false
    },
    appliedCoupon: null,
    appliedRaffle: null,
    invariantsVerified: false
  };
}
