import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { Coupon, DiscountType, CouponStatus } from '@/lib/types';
import { validateMoneyAmount } from '@/lib/discounts';
function checkAdminAuth(req: Request): { authorized: boolean; adminId: string } {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const authorized = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));
  const adminId = session?.candidateId || 'ADMIN-SUPER';
  return { authorized, adminId };
}


export async function GET(req: Request) {
  const { authorized, adminId } = checkAdminAuth(req);
  if (!authorized) { return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 }); }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') as CouponStatus | null;
  const search = searchParams.get('search')?.trim().toUpperCase();

  let coupons = serverDB.getCoupons();

  if (statusFilter) {
    coupons = coupons.filter(c => c.status === statusFilter);
  }
  if (search) {
    coupons = coupons.filter(c => c.code.includes(search) || (c.title && c.title.toUpperCase().includes(search)));
  }

  return NextResponse.json({ success: true, coupons, total: coupons.length });
}

export async function POST(req: Request) {
  const { authorized, adminId } = checkAdminAuth(req);
  if (!authorized) { return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 }); }

  try {
    const body = await req.json();

    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json({ error: 'COUPON_CODE_REQUIRED: Coupon code is mandatory.' }, { status: 400 });
    }
    const normalizedCode = body.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(normalizedCode)) {
      return NextResponse.json({
        error: 'INVALID_COUPON_CODE: Code must be 3-30 alphanumeric characters, hyphens, or underscores.'
      }, { status: 400 });
    }

    const existing = serverDB.getCouponByCode(normalizedCode);
    if (existing) {
      return NextResponse.json({
        error: 'COUPON_CODE_EXISTS: Coupon code \'' + normalizedCode + '\' is already registered.'
      }, { status: 409 });
    }

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'TITLE_REQUIRED: Promotional title is mandatory.' }, { status: 400 });
    }
    const discountType: DiscountType = body.discountType === 'percentage' ? 'percentage' : 'fixed';

    const valCheck = validateMoneyAmount(body.discountValue, 'Discount Value');
    if (!valCheck.valid || valCheck.amount <= 0) {
      return NextResponse.json({ error: 'INVALID_DISCOUNT_VALUE: Discount value must be a positive number.' }, { status: 400 });
    }
    if (discountType === 'percentage' && (valCheck.amount <= 0 || valCheck.amount > 100)) {
      return NextResponse.json({ error: 'INVALID_PERCENTAGE: Percentage discount must be between 1 and 100.' }, { status: 400 });
    }

    const minChargeCheck = validateMoneyAmount(body.minServiceCharge ?? 0, 'Minimum Service Charge');
    if (!minChargeCheck.valid) {
      return NextResponse.json({ error: minChargeCheck.error }, { status: 400 });
    }

    let maxDiscountCap: number | undefined = undefined;
    if (body.maxDiscountCap !== undefined && body.maxDiscountCap !== null && body.maxDiscountCap !== '') {
      const capCheck = validateMoneyAmount(body.maxDiscountCap, 'Maximum Discount Cap');
      if (!capCheck.valid || capCheck.amount <= 0) {
        return NextResponse.json({ error: 'INVALID_MAX_CAP: Max discount cap must be a positive number.' }, { status: 400 });
      }
      maxDiscountCap = capCheck.amount;
    }

    if (!body.startDate || !body.expiryDate) {
      return NextResponse.json({ error: 'DATES_REQUIRED: Start date and expiry date are required.' }, { status: 400 });
    }
    const startDate = new Date(body.startDate);
    const expiryDate = new Date(body.expiryDate);
    if (isNaN(startDate.getTime()) || isNaN(expiryDate.getTime())) {
      return NextResponse.json({ error: 'INVALID_DATES: Dates must be valid ISO 8601 timestamps.' }, { status: 400 });
    }
    if (expiryDate.getTime() < startDate.getTime()) {
      return NextResponse.json({ error: 'INVALID_DATE_RANGE: Expiry date cannot be earlier than start date.' }, { status: 400 });
    }

    const status: CouponStatus = body.status === 'paused' ? 'paused' : (body.status === 'expired' ? 'expired' : 'active');
    const globalUsageLimit = body.globalUsageLimit ? Math.max(1, parseInt(body.globalUsageLimit, 10)) : undefined;
    const perCandidateLimit = body.perCandidateLimit ? Math.max(1, parseInt(body.perCandidateLimit, 10)) : 1;
    const newCandidateOnly = Boolean(body.newCandidateOnly);
    const allowCombineWithRaffle = body.allowCombineWithRaffle !== false;

    let totalBudget: number | undefined = undefined;
    if (body.totalBudget !== undefined && body.totalBudget !== null && body.totalBudget !== '') {
      const budgetCheck = validateMoneyAmount(body.totalBudget, 'Total Budget');
      if (!budgetCheck.valid) {
        return NextResponse.json({ error: budgetCheck.error }, { status: 400 });
      }
      totalBudget = budgetCheck.amount;
    }

    const nowIso = new Date().toISOString();
    const newCoupon: Coupon = {
      id: 'CPN-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
      code: normalizedCode,
      title: body.title.trim(),
      description: body.description ? String(body.description).trim() : undefined,
      discountType,
      discountValue: valCheck.amount,
      minServiceCharge: minChargeCheck.amount,
      maxDiscountCap,
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      status,
      globalUsageLimit,
      usedCount: 0,
      perCandidateLimit,
      newCandidateOnly,
      allowCombineWithRaffle,
      totalBudget,
      usedBudget: 0,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    serverDB.saveCoupon(newCoupon);

    serverDB.recordAdminAudit({
      adminId: adminId,
      action: 'create_coupon',
      targetId: newCoupon.id,
      targetType: 'coupon',
      changes: { initial: { new: newCoupon } },
      notes: 'Created coupon ' + newCoupon.code
    });

    return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR: ' + (err.message || 'Failed to create coupon.') }, { status: 500 });
  }
}
