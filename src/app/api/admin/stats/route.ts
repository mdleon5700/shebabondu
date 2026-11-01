import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const allCandidates = serverDB.getAllCandidates();
  const allApps = serverDB.getAllApplications();
  const coupons = serverDB.getCoupons();
  const raffles = serverDB.getRaffleCampaigns();
  const jobs = serverDB.getJobs();
  const drafts = serverDB.getCircularDrafts();

  const pendingPayment = allApps.filter(a => a.status === 'pending_payment').length;
  const processing = allApps.filter(a => a.status === 'processing').length;
  const completed = allApps.filter(a => a.status === 'completed').length;
  const rejected = allApps.filter(a => a.status === 'rejected').length;

  const totalRevenue = allApps
    .filter(a => a.status === 'completed' || a.status === 'processing')
    .reduce((sum, a) => sum + (a.financialSnapshot?.finalServiceCharge ?? a.serviceCharge ?? 0), 0);

  return NextResponse.json({
    success: true,
    stats: {
      totalCandidates: allCandidates.length,
      totalApplications: allApps.length,
      pendingPayment,
      processing,
      completed,
      rejected,
      totalRevenue,
      activeCoupons: coupons.filter(c => c.status === 'active').length,
      activeRaffles: raffles.filter(r => r.status === 'active').length,
      totalJobs: jobs.length,
      pendingDrafts: drafts.filter(d => d.status === 'pending_review').length
    }
  }, {
    headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
  });
}
