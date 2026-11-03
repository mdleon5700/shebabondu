import { randomUUID } from 'crypto';
import { generateSmartApplicationId } from '@/lib/id-generator';
import { calculateOrderDiscounts } from '@/lib/discounts';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { storage } from '@/lib/store';
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
  if (!session) return NextResponse.json({ error: 'Login required to apply.' }, { status: 401 });

  try {
    const appData: ApplicationRequest = await req.json();
    if (!appData.jobId || !appData.postName) {
      return NextResponse.json({ error: 'চাকরির আইডি ও পদের নাম আবশ্যক' }, { status: 400 });
    }

    const candidateId = session.candidateId;
    const candidate = serverDB.getCandidateById(candidateId);
    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    // 1. Verify Job Status and Deadline
    const job = serverDB.getPublicJobById(appData.jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    if (job) {
      const jobStatus = (job as any).status;
      if (jobStatus === 'EXPIRED' || jobStatus === 'CLOSED' || CentralDeadlineEngine.evaluateDeadline(job).isClosed) {
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

    const genAppId = generateSmartApplicationId();
    const isWalletPay = appData.paymentMethod === 'Wallet';
    const computedStatus = isWalletPay ? 'processing' : 'pending_payment';

    const position = job.positions?.find(position => position.title === appData.postName || `${position.title} (${position.grade})` === appData.postName);
    if (job.positions?.length && !position) return NextResponse.json({ error: 'Invalid job position' }, { status: 400 });
    const couponCode = appData.financialSnapshot?.appliedCouponCode;
    const raffleId = appData.financialSnapshot?.appliedRaffleCampaignId;
    const coupon = couponCode ? serverDB.getCouponByCode(couponCode) : null;
    const raffle = raffleId ? serverDB.getRaffleCampaignById(raffleId) : null;
    if ((couponCode && !coupon) || (raffleId && !raffle)) return NextResponse.json({ error: 'Invalid discount' }, { status: 400 });
    const calculation = calculateOrderDiscounts({
      governmentFee: position?.govtFee ?? job.govtFee ?? 0,
      serviceCharge: job.serviceFee ?? 0, coupon, raffleCampaign: raffle,
      candidateContext: {
        candidateId, isNewCandidate: existing.length === 0, existingOrdersCount: existing.length,
        candidateCouponRedemptionsCount: coupon ? serverDB.getCouponRedemptions(candidateId, coupon.id).length : 0
      }
    });
    if (!calculation.success) return NextResponse.json({ error: calculation.error }, { status: 400 });
    if (typeof appData.totalAmount !== 'number' || !Number.isFinite(appData.totalAmount) || Math.abs(appData.totalAmount - calculation.snapshot.totalPayable) > 0.01) {
      return NextResponse.json({ error: 'The application fee has changed. Please refresh and try again.' }, { status: 400 });
    }
    if (!['Wallet', 'bKash', 'Nagad'].includes(appData.paymentMethod)) return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    if (!isWalletPay && !appData.trxId?.trim()) return NextResponse.json({ error: 'Payment transaction ID required' }, { status: 400 });

    const newApp: ApplicationRequest = {
      ...appData,
      id: genAppId,
      candidateId,
      jobTitle: job.title,
      organization: job.organization,
      totalAmount: calculation.snapshot.totalPayable,
      governmentFee: calculation.snapshot.governmentApplicationFee,
      serviceCharge: calculation.snapshot.serviceCharge,
      financialSnapshot: calculation.snapshot,
      couponDiscount: calculation.snapshot.couponDiscount,
      raffleDiscount: calculation.snapshot.raffleBonusDiscount,
      walletDeduction: isWalletPay ? calculation.snapshot.totalPayable : 0,
      cashPaid: isWalletPay ? 0 : calculation.snapshot.totalPayable,
      candidateName: candidate.name || appData.candidateName || 'আবেদনকারী',
      candidatePhone: candidate.phone || appData.candidatePhone || '',
      verificationType: isWalletPay ? 'officially_verified' : 'user_reported',
      status: computedStatus,
      date: new Date().toLocaleDateString('bn-BD'),
      createdAt: new Date().toISOString(),
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

    const result = serverDB.submitApplication(candidateId, newApp, isWalletPay);
    try {
      revalidatePath('/dashboard/applications');
      revalidatePath('/dashboard');
      revalidatePath('/admin');
    } catch {}
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 409 });
    const updated = result.applications;
    const res = NextResponse.json({ success: true, applications: updated, createdApp: newApp, walletBalance: result.walletBalance, transaction: result.transaction }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });


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

    try {
      revalidatePath('/dashboard/applications');
      revalidatePath('/dashboard');
      revalidatePath('/admin');
    } catch {}
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
