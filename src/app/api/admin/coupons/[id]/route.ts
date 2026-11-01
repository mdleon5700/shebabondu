import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { Coupon, DiscountType, CouponStatus } from '@/lib/types';
import { validateMoneyAmount } from '@/lib/discounts';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const coupon = serverDB.getCouponById(params.id);
  if (!coupon) {
    return NextResponse.json({ error: 'COUPON_NOT_FOUND: Coupon does not exist.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, coupon });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const coupon = serverDB.getCouponById(params.id);
  if (!coupon) {
    return NextResponse.json({ error: 'COUPON_NOT_FOUND: Coupon does not exist.' }, { status: 404 });
  }

  try {
    const updates = await req.json();
    const changes: Record<string, { old: any; new: any }> = {};

    // 1. Code change
    if (updates.code && typeof updates.code === 'string') {
      const normalized = updates.code.trim().toUpperCase();
      if (normalized !== coupon.code) {
        if (!/^[A-Z0-9_-]{3,30}$/.test(normalized)) {
          return NextResponse.json({ error: 'INVALID_COUPON_CODE: Must be 3-30 valid characters.' }, { status: 400 });
        }
        const conflict = serverDB.getCouponByCode(normalized);
        if (conflict && conflict.id !== coupon.id) {
          return NextResponse.json({ error: 'COUPON_CODE_EXISTS: Code is already in use.' }, { status: 409 });
        }
        changes.code = { old: coupon.code, new: normalized };
        coupon.code = normalized;
      }
    }

    // 2. Title & Description
    if (updates.title !== undefined) {
      const t = String(updates.title).trim();
      if (!t) return NextResponse.json({ error: 'TITLE_REQUIRED: Title cannot be empty.' }, { status: 400 });
      changes.title = { old: coupon.title, new: t };
      coupon.title = t;
    }
    if (updates.description !== undefined) {
      changes.description = { old: coupon.description, new: updates.description };
      coupon.description = updates.description ? String(updates.description).trim() : undefined;
    }

    // 3. Status
    if (updates.status !== undefined) {
      if (!['active', 'paused', 'expired'].includes(updates.status)) {
        return NextResponse.json({ error: 'INVALID_STATUS: Status must be active, paused, or expired.' }, { status: 400 });
      }
      changes.status = { old: coupon.status, new: updates.status };
      coupon.status = updates.status;
    }

    // 4. Discount Value & Type
    if (updates.discountValue !== undefined) {
      const valCheck = validateMoneyAmount(updates.discountValue, 'Discount Value');
      if (!valCheck.valid || valCheck.amount <= 0) {
        return NextResponse.json({ error: 'INVALID_DISCOUNT_VALUE: Must be a positive number.' }, { status: 400 });
      }
      if (coupon.discountType === 'percentage' && (valCheck.amount <= 0 || valCheck.amount > 100)) {
        return NextResponse.json({ error: 'INVALID_PERCENTAGE: Must be between 1 and 100.' }, { status: 400 });
      }
      changes.discountValue = { old: coupon.discountValue, new: valCheck.amount };
      coupon.discountValue = valCheck.amount;
    }

    // 5. Min Service Charge & Max Discount Cap
    if (updates.minServiceCharge !== undefined) {
      const minCheck = validateMoneyAmount(updates.minServiceCharge, 'Minimum Service Charge');
      if (!minCheck.valid) return NextResponse.json({ error: minCheck.error }, { status: 400 });
      changes.minServiceCharge = { old: coupon.minServiceCharge, new: minCheck.amount };
      coupon.minServiceCharge = minCheck.amount;
    }

    if (updates.maxDiscountCap !== undefined) {
      if (updates.maxDiscountCap === null || updates.maxDiscountCap === '') {
        changes.maxDiscountCap = { old: coupon.maxDiscountCap, new: undefined };
        coupon.maxDiscountCap = undefined;
      } else {
        const capCheck = validateMoneyAmount(updates.maxDiscountCap, 'Maximum Discount Cap');
        if (!capCheck.valid || capCheck.amount <= 0) {
          return NextResponse.json({ error: 'INVALID_MAX_CAP: Must be a positive number.' }, { status: 400 });
        }
        changes.maxDiscountCap = { old: coupon.maxDiscountCap, new: capCheck.amount };
        coupon.maxDiscountCap = capCheck.amount;
      }
    }

    // 6. Dates
    if (updates.startDate !== undefined || updates.expiryDate !== undefined) {
      const startStr = updates.startDate || coupon.startDate;
      const endStr = updates.expiryDate || coupon.expiryDate;
      const startD = new Date(startStr);
      const endD = new Date(endStr);
      if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
        return NextResponse.json({ error: 'INVALID_DATES: Valid ISO dates required.' }, { status: 400 });
      }
      if (endD.getTime() < startD.getTime()) {
        return NextResponse.json({ error: 'INVALID_DATE_RANGE: Expiry date cannot be earlier than start date.' }, { status: 400 });
      }
      if (updates.startDate) {
        changes.startDate = { old: coupon.startDate, new: startD.toISOString() };
        coupon.startDate = startD.toISOString();
      }
      if (updates.expiryDate) {
        changes.expiryDate = { old: coupon.expiryDate, new: endD.toISOString() };
        coupon.expiryDate = endD.toISOString();
      }
    }

    // 7. Global & Candidate Limits
    if (updates.globalUsageLimit !== undefined) {
      if (updates.globalUsageLimit === null) {
        changes.globalUsageLimit = { old: coupon.globalUsageLimit, new: undefined };
        coupon.globalUsageLimit = undefined;
      } else {
        const parsed = parseInt(updates.globalUsageLimit, 10);
        if (isNaN(parsed) || parsed < 1) {
          return NextResponse.json({ error: 'INVALID_LIMIT: Global limit must be at least 1.' }, { status: 400 });
        }
        if (parsed < coupon.usedCount) {
          return NextResponse.json({
            error: 'LIMIT_TOO_LOW: Global limit cannot be less than already redeemed count (' + coupon.usedCount + ').'
          }, { status: 400 });
        }
        changes.globalUsageLimit = { old: coupon.globalUsageLimit, new: parsed };
        coupon.globalUsageLimit = parsed;
      }
    }

    if (updates.perCandidateLimit !== undefined) {
      const parsed = parseInt(updates.perCandidateLimit, 10);
      if (isNaN(parsed) || parsed < 1) {
        return NextResponse.json({ error: 'INVALID_LIMIT: Candidate limit must be at least 1.' }, { status: 400 });
      }
      changes.perCandidateLimit = { old: coupon.perCandidateLimit, new: parsed };
      coupon.perCandidateLimit = parsed;
    }

    if (updates.newCandidateOnly !== undefined) {
      changes.newCandidateOnly = { old: coupon.newCandidateOnly, new: Boolean(updates.newCandidateOnly) };
      coupon.newCandidateOnly = Boolean(updates.newCandidateOnly);
    }

    if (updates.allowCombineWithRaffle !== undefined) {
      changes.allowCombineWithRaffle = { old: coupon.allowCombineWithRaffle, new: Boolean(updates.allowCombineWithRaffle) };
      coupon.allowCombineWithRaffle = Boolean(updates.allowCombineWithRaffle);
    }

    // 8. Total Budget Protection
    if (updates.totalBudget !== undefined) {
      if (updates.totalBudget === null) {
        changes.totalBudget = { old: coupon.totalBudget, new: undefined };
        coupon.totalBudget = undefined;
      } else {
        const budgetCheck = validateMoneyAmount(updates.totalBudget, 'Total Budget');
        if (!budgetCheck.valid) return NextResponse.json({ error: budgetCheck.error }, { status: 400 });
        const currentUsed = coupon.usedBudget || 0;
        if (budgetCheck.amount < currentUsed) {
          return NextResponse.json({
            error: 'BUDGET_TOO_LOW: Total budget cannot be less than already used budget (৳' + currentUsed + ').'
          }, { status: 400 });
        }
        changes.totalBudget = { old: coupon.totalBudget, new: budgetCheck.amount };
        coupon.totalBudget = budgetCheck.amount;
      }
    }

    coupon.updatedAt = new Date().toISOString();
    serverDB.saveCoupon(coupon);

    if (Object.keys(changes).length > 0) {
      serverDB.recordAdminAudit({
        adminId: session.candidateId,
        action: 'update_coupon',
        targetId: coupon.id,
        targetType: 'coupon',
        changes,
        notes: 'Updated coupon ' + coupon.code + ' fields: ' + Object.keys(changes).join(', ')
      });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR: ' + (err.message || 'Failed to update coupon.') }, { status: 500 });
  }
}
