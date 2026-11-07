import { NextResponse } from 'next/server';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const allCandidates = serverDB.getAllCandidates();
  const allApps = serverDB.getAllApplications();
  const coupons = serverDB.getCoupons();
  const raffles = serverDB.getRaffleCampaigns();
  const jobs = serverDB.getJobs();
  const drafts = serverDB.getCircularDrafts();
  const jobSources = serverDB.getJobSources ? serverDB.getJobSources() : [];

  const pendingPayment = allApps.filter(a => a.status === 'pending_payment').length;
  const processing = allApps.filter(a => a.status === 'processing').length;
  const completed = allApps.filter(a => a.status === 'completed').length;
  const rejected = allApps.filter(a => a.status === 'rejected').length;

  const publishedJobs = jobs.filter(j => j.status === 'published' || (!j.status && j.title)).length;
  const draftJobs = jobs.filter(j => j.status === 'draft').length;
  const reviewJobs = drafts.filter(d => d.status === 'pending_review').length;
  const expiredJobs = jobs.filter(j => {
    if (j.status === 'expired') return true;
    if (!j.deadline) return false;
    const d = new Date(j.deadline);
    return !isNaN(d.getTime()) && d < new Date();
  }).length;

  const totalViews = jobs.reduce((sum, j) => sum + ((j as any).viewsCount || (j as any).viewCount || 0), 0);
  const activeSpiders = jobSources.filter((s: any) => s.status === 'active' || s.isActive).length;

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
      pendingDrafts: reviewJobs,
      publishedJobs,
      draftJobs,
      reviewJobs,
      expiredJobs,
      totalViews,
      activeSpiders
    }
  }, {
    headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
  });
}
