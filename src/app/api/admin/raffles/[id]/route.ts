import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { RaffleCampaign, DiscountType, CampaignStatus } from '@/lib/types';
import { validateMoneyAmount } from '@/lib/discounts';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const campaign = serverDB.getRaffleCampaignById(params.id);
  if (!campaign) {
    return NextResponse.json({ error: 'RAFFLE_NOT_FOUND: Campaign does not exist.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, campaign });
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const campaign = serverDB.getRaffleCampaignById(params.id);
  if (!campaign) {
    return NextResponse.json({ error: 'RAFFLE_NOT_FOUND: Campaign does not exist.' }, { status: 404 });
  }

  try {
    const updates = await req.json();
    const changes: Record<string, { old: any; new: any }> = {};

    if (updates.title !== undefined) {
      const t = String(updates.title).trim();
      if (!t) return NextResponse.json({ error: 'TITLE_REQUIRED: Title cannot be empty.' }, { status: 400 });
      changes.title = { old: campaign.title, new: t };
      campaign.title = t;
    }

    if (updates.description !== undefined) {
      changes.description = { old: campaign.description, new: updates.description };
      campaign.description = String(updates.description).trim();
    }

    if (updates.status !== undefined) {
      if (!['active', 'paused', 'ended'].includes(updates.status)) {
        return NextResponse.json({ error: 'INVALID_STATUS: Status must be active, paused, or ended.' }, { status: 400 });
      }
      changes.status = { old: campaign.status, new: updates.status };
      campaign.status = updates.status;
    }

    if (updates.hasServiceDiscount !== undefined) {
      changes.hasServiceDiscount = { old: campaign.hasServiceDiscount, new: Boolean(updates.hasServiceDiscount) };
      campaign.hasServiceDiscount = Boolean(updates.hasServiceDiscount);
    }

    if (updates.hasPrizeDraw !== undefined) {
      changes.hasPrizeDraw = { old: campaign.hasPrizeDraw, new: Boolean(updates.hasPrizeDraw) };
      campaign.hasPrizeDraw = Boolean(updates.hasPrizeDraw);
    }

    if (!campaign.hasServiceDiscount && !campaign.hasPrizeDraw) {
      return NextResponse.json({
        error: 'INVALID_CAMPAIGN_TYPE: Campaign must provide at least a service discount or a prize draw entry.'
      }, { status: 400 });
    }

    if (updates.bonusValue !== undefined) {
      const valCheck = validateMoneyAmount(updates.bonusValue, 'Bonus Value');
      if (!valCheck.valid || valCheck.amount < 0) {
        return NextResponse.json({ error: 'INVALID_BONUS_VALUE: Must be non-negative.' }, { status: 400 });
      }
      if (campaign.bonusType === 'percentage' && valCheck.amount > 100) {
        return NextResponse.json({ error: 'INVALID_PERCENTAGE: Must not exceed 100%.' }, { status: 400 });
      }
      changes.bonusValue = { old: campaign.bonusValue, new: valCheck.amount };
      campaign.bonusValue = valCheck.amount;
    }

    if (updates.minServiceCharge !== undefined) {
      const minCheck = validateMoneyAmount(updates.minServiceCharge, 'Minimum Service Charge');
      if (!minCheck.valid) return NextResponse.json({ error: minCheck.error }, { status: 400 });
      changes.minServiceCharge = { old: campaign.minServiceCharge, new: minCheck.amount };
      campaign.minServiceCharge = minCheck.amount;
    }

    if (updates.maxBonusPerOrder !== undefined) {
      const maxBonusCheck = validateMoneyAmount(updates.maxBonusPerOrder, 'Maximum Bonus Per Order');
      if (!maxBonusCheck.valid) return NextResponse.json({ error: maxBonusCheck.error }, { status: 400 });
      changes.maxBonusPerOrder = { old: campaign.maxBonusPerOrder, new: maxBonusCheck.amount };
      campaign.maxBonusPerOrder = maxBonusCheck.amount;
    }

    if (updates.startDate !== undefined || updates.endDate !== undefined) {
      const startStr = updates.startDate || campaign.startDate;
      const endStr = updates.endDate || campaign.endDate;
      const startD = new Date(startStr);
      const endD = new Date(endStr);
      if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
        return NextResponse.json({ error: 'INVALID_DATES: Valid ISO dates required.' }, { status: 400 });
      }
      if (endD.getTime() < startD.getTime()) {
        return NextResponse.json({ error: 'INVALID_DATE_RANGE: End date cannot be earlier than start date.' }, { status: 400 });
      }
      if (updates.startDate) {
        changes.startDate = { old: campaign.startDate, new: startD.toISOString() };
        campaign.startDate = startD.toISOString();
      }
      if (updates.endDate) {
        changes.endDate = { old: campaign.endDate, new: endD.toISOString() };
        campaign.endDate = endD.toISOString();
      }
    }

    if (updates.allowCombineWithCoupon !== undefined) {
      changes.allowCombineWithCoupon = { old: campaign.allowCombineWithCoupon, new: Boolean(updates.allowCombineWithCoupon) };
      campaign.allowCombineWithCoupon = Boolean(updates.allowCombineWithCoupon);
    }

    if (updates.totalBudget !== undefined) {
      if (updates.totalBudget === null) {
        changes.totalBudget = { old: campaign.totalBudget, new: undefined };
        campaign.totalBudget = undefined;
      } else {
        const budgetCheck = validateMoneyAmount(updates.totalBudget, 'Total Budget');
        if (!budgetCheck.valid) return NextResponse.json({ error: budgetCheck.error }, { status: 400 });
        const currentUsed = campaign.usedBudget || 0;
        if (budgetCheck.amount < currentUsed) {
          return NextResponse.json({
            error: 'BUDGET_TOO_LOW: Total budget cannot be less than already distributed bonuses (৳' + currentUsed + ').'
          }, { status: 400 });
        }
        changes.totalBudget = { old: campaign.totalBudget, new: budgetCheck.amount };
        campaign.totalBudget = budgetCheck.amount;
      }
    }

    campaign.updatedAt = new Date().toISOString();
    serverDB.saveRaffleCampaign(campaign);

    if (Object.keys(changes).length > 0) {
      serverDB.recordAdminAudit({
        adminId: session.candidateId,
        action: 'update_raffle',
        targetId: campaign.id,
        targetType: 'raffle',
        changes,
        notes: 'Updated raffle campaign: ' + campaign.title + ' fields: ' + Object.keys(changes).join(', ')
      });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR: ' + (err.message || 'Failed to update campaign.') }, { status: 500 });
  }
}
