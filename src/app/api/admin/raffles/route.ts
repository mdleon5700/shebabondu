import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { RaffleCampaign, DiscountType, CampaignStatus } from '@/lib/types';
import { validateMoneyAmount } from '@/lib/discounts';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') as CampaignStatus | null;

  let campaigns = serverDB.getRaffleCampaigns();
  if (statusFilter) {
    campaigns = campaigns.filter(c => c.status === statusFilter);
  }

  return NextResponse.json({ success: true, campaigns, total: campaigns.length });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'TITLE_REQUIRED: Campaign title is mandatory.' }, { status: 400 });
    }
    if (!body.description || typeof body.description !== 'string') {
      return NextResponse.json({ error: 'DESCRIPTION_REQUIRED: Campaign description is mandatory.' }, { status: 400 });
    }

    const hasServiceDiscount = Boolean(body.hasServiceDiscount);
    const hasPrizeDraw = Boolean(body.hasPrizeDraw);

    if (!hasServiceDiscount && !hasPrizeDraw) {
      return NextResponse.json({
        error: 'INVALID_CAMPAIGN_TYPE: Campaign must provide at least a service discount or a prize draw entry.'
      }, { status: 400 });
    }

    const bonusType: DiscountType = body.bonusType === 'percentage' ? 'percentage' : 'fixed';
    let bonusValue = 0;

    if (hasServiceDiscount) {
      const valCheck = validateMoneyAmount(body.bonusValue, 'Bonus Value');
      if (!valCheck.valid || valCheck.amount <= 0) {
        return NextResponse.json({ error: 'INVALID_BONUS_VALUE: Bonus value must be a positive number.' }, { status: 400 });
      }
      if (bonusType === 'percentage' && (valCheck.amount <= 0 || valCheck.amount > 100)) {
        return NextResponse.json({ error: 'INVALID_PERCENTAGE: Percentage bonus must be between 1 and 100.' }, { status: 400 });
      }
      bonusValue = valCheck.amount;
    }

    const minChargeCheck = validateMoneyAmount(body.minServiceCharge ?? 0, 'Minimum Service Charge');
    if (!minChargeCheck.valid) return NextResponse.json({ error: minChargeCheck.error }, { status: 400 });

    const maxBonusCheck = validateMoneyAmount(body.maxBonusPerOrder ?? 0, 'Maximum Bonus Per Order');
    if (!maxBonusCheck.valid) return NextResponse.json({ error: maxBonusCheck.error }, { status: 400 });

    if (!body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'DATES_REQUIRED: Start date and end date are required.' }, { status: 400 });
    }
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'INVALID_DATES: Dates must be valid ISO 8601 timestamps.' }, { status: 400 });
    }
    if (endDate.getTime() < startDate.getTime()) {
      return NextResponse.json({ error: 'INVALID_DATE_RANGE: End date cannot be earlier than start date.' }, { status: 400 });
    }

    const status: CampaignStatus = body.status === 'paused' ? 'paused' : (body.status === 'ended' ? 'ended' : 'active');

    let totalBudget: number | undefined = undefined;
    if (body.totalBudget !== undefined && body.totalBudget !== null && body.totalBudget !== '') {
      const budgetCheck = validateMoneyAmount(body.totalBudget, 'Total Budget');
      if (!budgetCheck.valid) return NextResponse.json({ error: budgetCheck.error }, { status: 400 });
      totalBudget = budgetCheck.amount;
    }

    const allowCombineWithCoupon = body.allowCombineWithCoupon !== false;
    const nowIso = new Date().toISOString();

    const campaign: RaffleCampaign = {
      id: 'RAF-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
      title: body.title.trim(),
      description: body.description.trim(),
      bonusType,
      bonusValue,
      minServiceCharge: minChargeCheck.amount,
      maxBonusPerOrder: maxBonusCheck.amount,
      totalBudget,
      usedBudget: 0,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status,
      hasServiceDiscount,
      hasPrizeDraw,
      allowCombineWithCoupon,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    serverDB.saveRaffleCampaign(campaign);

    serverDB.recordAdminAudit({
      adminId: session.candidateId,
      action: 'create_raffle',
      targetId: campaign.id,
      targetType: 'raffle',
      changes: { initial: { new: campaign } },
      notes: 'Created raffle campaign: ' + campaign.title
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR: ' + (err.message || 'Failed to create raffle campaign.') }, { status: 500 });
  }
}
