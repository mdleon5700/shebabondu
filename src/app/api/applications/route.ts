import { NextResponse } from 'next/server';
import { getServerSession, generateSessionToken, createSessionCookie, hashPassword } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { storage } from '@/lib/store';
import { mockUserProfile } from '@/data/mockJobs';
import { ApplicationRequest } from '@/lib/types';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  let apps: ApplicationRequest[] = [];

  if (session.role === 'admin') {
    // Admin sees all applications across all candidates
    apps = serverDB.getAllApplications();
  } else {
    // Candidate strictly sees ONLY their own applications
    apps = serverDB.getApplications(session.candidateId);
  }

  if (statusFilter && statusFilter !== 'all') {
    apps = apps.filter(a => a.status === statusFilter);
  }

  if (search) {
    apps = apps.filter(a => 
      a.id.toLowerCase().includes(search) ||
      a.candidateName.toLowerCase().includes(search) ||
      a.candidatePhone.includes(search) ||
      a.jobTitle.toLowerCase().includes(search) ||
      (a.trxId && a.trxId.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({ 
    success: true, 
    applications: apps,
    role: session.role,
    totalCount: apps.length
  }, {
    headers: {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate'
    }
  });
}

export async function POST(req: Request) {
  const session = getServerSession(req);

  try {
    const appData: ApplicationRequest = await req.json();
    if (!appData.jobId || !appData.postName) {
      return NextResponse.json({ error: 'চাকরির আইডি ও পদের নাম আবশ্যক' }, { status: 400 });
    }

    let candidateId = session?.candidateId;
    let candidate = candidateId ? serverDB.getCandidateById(candidateId) : null;
    let newSessionToken: string | null = null;

    if (!candidate) {
      const rawPhone = (appData.candidatePhone || '').trim();
      const cleanPhone = rawPhone.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        return NextResponse.json({ error: 'সঠিক মোবাইল নম্বর প্রদান করা আবশ্যক' }, { status: 400 });
      }

      const existingCandidate = serverDB.getCandidateByPhone(cleanPhone) || serverDB.getCandidateByPhone(rawPhone);
      if (existingCandidate) {
        candidate = existingCandidate;
        candidateId = existingCandidate.id;
      } else {
        const genCandId = 'USR-' + (cleanPhone.startsWith('88') ? cleanPhone.slice(2) : cleanPhone);
        candidate = serverDB.createCandidate({
          ...mockUserProfile,
          id: genCandId,
          name: appData.candidateName || 'আবেদনকারী',
          nameBn: appData.candidateName || 'আবেদনকারী',
          phone: rawPhone,
          email: `${cleanPhone}@candidate.chakrisheba.com`,
          district: appData.candidateDistrict || 'ঢাকা',
          role: 'candidate',
          passwordHash: hashPassword('ChakriShebaGuest2026!'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        candidateId = candidate.id;
      }

      newSessionToken = generateSessionToken();
      serverDB.createSession(newSessionToken, candidateId, 'candidate');
    }

    // 1. Verify Job Status and Deadline
    const job = serverDB.getJobById(appData.jobId);
    if (job) {
      const jobStatus = (job as any).status;
      if (jobStatus === 'EXPIRED' || jobStatus === 'CLOSED' || job.daysRemaining <= 0) {
        return NextResponse.json({ 
          error: 'JOB_CLOSED: এই চাকরির আবেদনের সময়সীমা শেষ হয়েছে। নতুন আবেদন গ্রহণ সম্ভব নয়।' 
        }, { status: 400 });
      }
      if (jobStatus === 'UPCOMING') {
        return NextResponse.json({ 
          error: 'JOB_UPCOMING: এই চাকরির আবেদন এখনো শুরু হয়নি। নির্ধারিত তারিখে আবেদন প্রক্রিয়া শুরু হবে।' 
        }, { status: 400 });
      }
    }

    let eligibilityNote = 'যোগ্যতা যাচাই সম্পন্ন';

    // 2. Prevent duplicate active submissions
    const existing = candidateId ? serverDB.getApplications(candidateId) : [];
    const recentDuplicate = existing.find(a => 
      a.jobId === appData.jobId && 
      a.postName === appData.postName && 
      (a.status === 'pending_payment' || a.status === 'processing' || a.status === 'submitted')
    );
    if (recentDuplicate) {
      return NextResponse.json({ 
        error: 'DUPLICATE_APPLICATION: আপনি ইতিমধ্যে এই পদের জন্য আবেদন করেছেন। একটি পদে একবারই আবেদন গ্রহণযোগ্য।',
        existingAppId: recentDuplicate.id
      }, { status: 409 });
    }

    const genAppId = appData.id || ('APP-' + Math.floor(10000 + Math.random() * 90000));
    const isWalletPay = appData.paymentMethod === 'Wallet';
    const computedStatus = isWalletPay ? 'processing' : (appData.status || 'pending_payment');

    if (isWalletPay && candidate) {
      const currentBal = candidate.walletBalance || 0;
      const deduct = appData.totalAmount || 0;
      const newBal = Math.max(0, currentBal - deduct);
      serverDB.updateCandidate(candidateId!, { walletBalance: newBal });
      const walletTx = {
        id: `TXN-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString('bn-BD'),
        amount: deduct,
        type: 'fee_deduction' as const,
        description: `চাকরির আবেদন ফি (${appData.jobTitle || 'সরকারি চাকরি'} - ${appData.postName})`,
        method: 'Wallet' as const,
        trxId: appData.trxId || `WLT-APP-${Date.now().toString().slice(-6)}`,
        status: 'completed' as const
      };
      serverDB.addTransaction(candidateId!, walletTx);
    }

    const newApp: ApplicationRequest = {
      ...appData,
      id: genAppId,
      candidateName: candidate.name || appData.candidateName || 'আবেদনকারী',
      candidatePhone: candidate.phone || appData.candidatePhone || '',
      verificationType: isWalletPay ? 'officially_verified' : 'user_reported',
      status: computedStatus,
      date: new Date().toLocaleDateString('bn-BD'),
      statusHistory: [
        {
          status: computedStatus,
          date: new Date().toISOString(),
          notes: isWalletPay 
            ? 'ডিজিটাল ওয়ালেট দিয়ে ফি পরিশোধ সম্পন্ন হয়েছে। আবেদনটি টেলিটক প্রসেসিং কিউতে যুক্ত হলো।' 
            : ('অনলাইন আবেদন দাখিল হয়েছে। ' + eligibilityNote)
        }
      ]
    };

    const updated = serverDB.addApplication(candidateId!, newApp);
    const res = NextResponse.json({ success: true, applications: updated, createdApp: newApp }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });

    if (newSessionToken) {
      const cookie = createSessionCookie(newSessionToken);
      res.cookies.set(cookie.name, cookie.value, cookie);
    }

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
  }

  try {
    const { applicationId, status, verificationType, notes, applicantCopyPdfUrl, teleTalkTrackingId, teleTalkPassword, corporateTrackingId, submissionChannel } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
    }

    if (session.role !== 'admin' && (status === 'completed' || status === 'processing' || verificationType === 'officially_verified')) {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required for this state transition.' }, { status: 403 });
    }

    const historyItem = {
      status: status,
      date: new Date().toISOString(),
      notes: notes || (status === 'completed' ? 'আবেদন সফলভাবে সম্পন্ন হয়েছে এবং স্লিপ প্রস্তুত।' : 'স্ট্যাটাস আপডেট করা হয়েছে।'),
      updatedBy: session.role === 'admin' ? 'Admin (' + session.candidateId + ')' : 'Candidate'
    };

    const extra: Partial<ApplicationRequest> = {
      ...(applicantCopyPdfUrl ? { applicantCopyPdfUrl } : {}),
      ...(teleTalkTrackingId ? { teleTalkTrackingId } : {}),
      ...(teleTalkPassword ? { teleTalkPassword } : {}),
      ...(corporateTrackingId ? { corporateTrackingId } : {}),
      ...(submissionChannel ? { submissionChannel } : {}),
      statusHistory: [historyItem]
    };

    const updated = serverDB.updateAppStatus(
      session.candidateId,
      applicationId,
      status as ApplicationRequest['status'],
      verificationType as ApplicationRequest['verificationType'],
      notes,
      session.role === 'admin',
      extra
    );

    if (!updated) {
      return NextResponse.json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    if (session.role === 'admin') {
      serverDB.recordAdminAudit({
        adminId: session.candidateId,
        action: 'status_change' as any,
        targetId: applicationId,
        targetType: 'order',
        changes: { status: { new: status } },
        notes: notes || ('Application ' + applicationId + ' transitioned to ' + status)
      });
    }

    return NextResponse.json({ success: true, application: updated }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
