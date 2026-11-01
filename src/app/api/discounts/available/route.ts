import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession(req);
  const candidateId = session?.candidateId || 'GUEST';
  const applications = candidateId !== 'GUEST' ? serverDB.getApplications(candidateId) : [];
  const isNewCandidate = applications.length === 0;
  const now = new Date();
  const nowMs = now.getTime();

  // 1. Available Coupons Evaluation
  const allCoupons = serverDB.getCoupons();
  const availableCoupons = allCoupons
    .filter(c => {
      // Status check
      if (c.status !== 'active') return false;

      // Date range check
      const startMs = c.startDate ? new Date(c.startDate).getTime() : 0;
      const endMs = c.expiryDate ? new Date(c.expiryDate).getTime() : Infinity;
      if (nowMs < startMs || nowMs > endMs) return false;

      // Global usage limit check
      if (c.globalUsageLimit !== undefined && c.usedCount >= c.globalUsageLimit) return false;

      // Budget exhaustion check
      if (c.totalBudget !== undefined && (c.usedBudget || 0) >= c.totalBudget) return false;

      // Candidate-specific redemption limit check
      if (candidateId !== 'GUEST') {
        const userRedemptions = serverDB.getCouponRedemptions(candidateId, c.id);
        const perLimit = c.perCandidateLimit ?? 1;
        if (userRedemptions.length >= perLimit) return false;
      }

      // First-time applicant restriction check
      if (c.newCandidateOnly && !isNewCandidate) return false;

      return true;
    })
    .map(c => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minServiceCharge: c.minServiceCharge,
      maxDiscountCap: c.maxDiscountCap,
      expiryDate: c.expiryDate,
      allowCombineWithRaffle: c.allowCombineWithRaffle,
      newCandidateOnly: c.newCandidateOnly
    }));

  // 2. Active Raffle Campaign Evaluation
  const activeRaffle = serverDB.getActiveRaffleCampaign();
  let disclosedRaffle = null;

  if (activeRaffle) {
    const budgetOk = activeRaffle.totalBudget === undefined || (activeRaffle.usedBudget || 0) < activeRaffle.totalBudget;
    if (budgetOk) {
      disclosedRaffle = {
        id: activeRaffle.id,
        title: activeRaffle.title,
        description: activeRaffle.description,
        bonusType: activeRaffle.bonusType,
        bonusValue: activeRaffle.bonusValue,
        minServiceCharge: activeRaffle.minServiceCharge,
        maxBonusPerOrder: activeRaffle.maxBonusPerOrder,
        hasServiceDiscount: activeRaffle.hasServiceDiscount,
        hasPrizeDraw: activeRaffle.hasPrizeDraw,
        allowCombineWithCoupon: activeRaffle.allowCombineWithCoupon,
        endDate: activeRaffle.endDate
      };
    }
  }

  return NextResponse.json({
    success: true,
    candidateContext: {
      isNewCandidate,
      totalPreviousApplications: applications.length
    },
    coupons: availableCoupons,
    raffleCampaign: disclosedRaffle
  });
}
