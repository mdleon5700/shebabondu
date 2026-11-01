const fs = require('fs');
const path = require('path');
const apiDir = path.join(__dirname, '..', 'src', 'app', 'api', 'admin');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(apiDir);
ensureDir(path.join(apiDir, 'stats'));
ensureDir(path.join(apiDir, 'candidates'));
ensureDir(path.join(apiDir, 'candidates', '[id]'));
ensureDir(path.join(apiDir, 'jobs'));
ensureDir(path.join(apiDir, 'jobs', '[id]'));
ensureDir(path.join(apiDir, 'pages'));
ensureDir(path.join(apiDir, 'pages', '[id]'));
ensureDir(path.join(apiDir, 'sources'));
ensureDir(path.join(apiDir, 'sources', 'drafts'));
ensureDir(path.join(apiDir, 'audit-logs'));
ensureDir(path.join(apiDir, 'companies'));

// 1. /api/admin/stats/route.ts
const statsRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET() {
  const session = getServerSession();
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
    .reduce((sum, a) => sum + (a.serviceCharge || 80), 0);

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
`;
fs.writeFileSync(path.join(apiDir, 'stats', 'route.ts'), statsRoute, 'utf8');

// 2. /api/admin/candidates/route.ts
const candidatesRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase();

  let candidates = serverDB.getAllCandidates();
  if (search) {
    candidates = candidates.filter(c => 
      c.name.toLowerCase().includes(search) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search)) ||
      (c.district && c.district.toLowerCase().includes(search))
    );
  }

  // Mask sensitive NID and password hashes for data protection
  const safeCandidates = candidates.map(c => {
    const { passwordHash, ...rest } = c;
    return {
      ...rest,
      nid: rest.nid ? rest.nid.slice(0, 4) + '*********' + rest.nid.slice(-3) : ''
    };
  });

  return NextResponse.json({ success: true, candidates: safeCandidates, total: safeCandidates.length }, {
    headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
  });
}
`;
fs.writeFileSync(path.join(apiDir, 'candidates', 'route.ts'), candidatesRoute, 'utf8');

// 3. /api/admin/candidates/[id]/route.ts
const candidateDetailRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { status, reason } = await req.json();
    const updated = serverDB.updateCandidateStatus(params.id, status, reason || 'Admin status change', session.candidateId);
    if (!updated) return NextResponse.json({ error: 'প্রার্থী পাওয়া যায়নি' }, { status: 404 });
    return NextResponse.json({ success: true, candidate: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;
fs.writeFileSync(path.join(apiDir, 'candidates', '[id]', 'route.ts'), candidateDetailRoute, 'utf8');

// 4. /api/admin/jobs/route.ts
const jobsRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';

export async function GET() {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const jobs = serverDB.getJobs();
  return NextResponse.json({ success: true, jobs });
}

export async function POST(req: Request) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const jobData: Partial<JobCircular> = await req.json();
    if (!jobData.title || !jobData.organization) {
      return NextResponse.json({ error: 'বিজ্ঞপ্তির শিরোনাম এবং প্রতিষ্ঠানের নাম আবশ্যক।' }, { status: 400 });
    }

    const newJob: JobCircular = {
      id: jobData.id || 'job-' + Date.now().toString().slice(-6),
      title: jobData.title,
      organization: jobData.organization,
      logo: jobData.logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
      category: jobData.category || 'govt',
      categoryLabel: jobData.categoryLabel || 'সরকারি চাকরি',
      grade: jobData.grade || '৯ম গ্রেড',
      totalPosts: Number(jobData.totalPosts) || 1,
      salary: jobData.salary || '২২,০০০ - ৫৩,০৬০ টাকা',
      minEducation: jobData.minEducation || 'স্নাতক বা সমমান',
      minAge: Number(jobData.minAge) || 18,
      maxAge: Number(jobData.maxAge) || 32,
      districts: jobData.districts || 'সকল জেলা',
      deadline: jobData.deadline || '২৫ নভেম্বর ২০২৬',
      daysRemaining: Number(jobData.daysRemaining) || 15,
      govtFee: Number(jobData.govtFee) || 200,
      serviceFee: Number(jobData.serviceFee) || 80,
      officialLink: jobData.officialLink || 'https://alljobs.teletalk.com.bd',
      circularImage: jobData.circularImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      audioSummary: jobData.title + ' প্রকাশিত হয়েছে। আবেদনের শেষ সময় ' + (jobData.deadline || 'শীঘ্রই') + '।',
      publishedDate: new Date().toLocaleDateString('bn-BD'),
      requirements: jobData.requirements || [jobData.minEducation || 'স্নাতক বা সমমান', 'বয়স: ১৮-৩২ বছর']
    };

    const saved = serverDB.saveJob(newJob, session.candidateId);
    return NextResponse.json({ success: true, job: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;
fs.writeFileSync(path.join(apiDir, 'jobs', 'route.ts'), jobsRoute, 'utf8');

// 5. /api/admin/jobs/[id]/route.ts
const jobDetailRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  try {
    const jobData = await req.json();
    const saved = serverDB.saveJob({ ...jobData, id: params.id }, session.candidateId);
    return NextResponse.json({ success: true, job: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const deleted = serverDB.deleteJob(params.id, session.candidateId);
  return NextResponse.json({ success: deleted });
}
`;
fs.writeFileSync(path.join(apiDir, 'jobs', '[id]', 'route.ts'), jobDetailRoute, 'utf8');

// 6. /api/admin/pages/route.ts (Website Builder)
const pagesRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';

export async function GET() {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const pages = serverDB.getPages();
  return NextResponse.json({ success: true, pages });
}

export async function POST(req: Request) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'পৃষ্ঠার শিরোনাম ও স্লাগ আবশ্যক।' }, { status: 400 });
    }

    const cleanSlug = body.slug.startsWith('/') ? body.slug : '/' + body.slug;
    const pageId = body.id || cleanSlug.replace(/[^a-zA-Z0-9_-]/g, '_');

    const newPage: PageRecord = {
      id: pageId,
      slug: cleanSlug,
      title: body.title,
      metaTitle: body.metaTitle || body.title + ' — চাকরি সেবা',
      metaDescription: body.metaDescription || '',
      status: 'draft',
      version: 1,
      isSystemPage: false,
      sections: body.sections || [
        {
          id: 'sec-' + Date.now(),
          type: 'hero',
          title: body.title,
          subtitle: 'নতুন পৃষ্ঠার বিবরণ এখানে লিখুন',
          content: {},
          style: { backgroundColor: '#ffffff', textColor: '#0f172a', paddingY: 'lg', textAlign: 'center' },
          isVisible: true
        }
      ],
      revisions: [],
      updatedAt: new Date().toISOString()
    };

    const saved = serverDB.savePage(newPage, session.candidateId, false);
    return NextResponse.json({ success: true, page: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;
fs.writeFileSync(path.join(apiDir, 'pages', 'route.ts'), pagesRoute, 'utf8');

// 7. /api/admin/pages/[id]/route.ts
const pageDetailRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const page = serverDB.getPageById(params.id);
  if (!page) return NextResponse.json({ error: 'পৃষ্ঠা পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json({ success: true, page });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { action, ...pageData } = await req.json();
    const isPublish = action === 'publish';
    const pageToSave: PageRecord = {
      ...pageData,
      id: params.id
    };
    const saved = serverDB.savePage(pageToSave, session.candidateId, isPublish);
    return NextResponse.json({ success: true, page: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const res = serverDB.deletePage(params.id, session.candidateId);
  if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
`;
fs.writeFileSync(path.join(apiDir, 'pages', '[id]', 'route.ts'), pageDetailRoute, 'utf8');

// 8. /api/admin/sources/route.ts
const sourcesRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET() {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const sources = serverDB.getJobSources();
  return NextResponse.json({ success: true, sources });
}
`;
fs.writeFileSync(path.join(apiDir, 'sources', 'route.ts'), sourcesRoute, 'utf8');

// 9. /api/admin/sources/drafts/route.ts
const draftsRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET() {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const drafts = serverDB.getCircularDrafts();
  return NextResponse.json({ success: true, drafts });
}

export async function POST(req: Request) {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { action, draftId } = await req.json();
    if (action === 'approve') {
      const createdJob = serverDB.approveCircularDraft(draftId, session.candidateId);
      if (!createdJob) return NextResponse.json({ error: 'ড্রাফট পাওয়া যায়নি' }, { status: 404 });
      return NextResponse.json({ success: true, job: createdJob });
    } else if (action === 'reject') {
      const success = serverDB.rejectCircularDraft(draftId, session.candidateId);
      return NextResponse.json({ success });
    }
    return NextResponse.json({ error: 'অজ্ঞাত অ্যাকশন' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;
fs.writeFileSync(path.join(apiDir, 'sources', 'drafts', 'route.ts'), draftsRoute, 'utf8');

// 10. /api/admin/audit-logs/route.ts
const auditRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET() {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const logs = serverDB.getAdminAuditLogs();
  return NextResponse.json({ success: true, logs });
}
`;
fs.writeFileSync(path.join(apiDir, 'audit-logs', 'route.ts'), auditRoute, 'utf8');

// 11. /api/admin/companies/route.ts
const companiesRoute = `import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET() {
  const session = getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const companies = serverDB.getCompanies();
  return NextResponse.json({ success: true, companies });
}
`;
fs.writeFileSync(path.join(apiDir, 'companies', 'route.ts'), companiesRoute, 'utf8');

console.log('Successfully created all Admin API routes!');