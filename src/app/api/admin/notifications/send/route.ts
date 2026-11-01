import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { AdminGovernanceRbac } from '@/lib/governance';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const auth = AdminGovernanceRbac.authorizeRequest(req, 'notifications.send');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { recipientPhone, candidateId, title, message, channel, targetAudience } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'বার্তার টেক্সট আবশ্যক' }, { status: 400 });
    }

    const deliveryChannel = (channel === 'in_app' || channel === 'email' || channel === 'push') ? channel : 'sms';
    const deliveryId = 'DELIV-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

    // If targeted broadcast to all candidates
    if (targetAudience === 'all_candidates') {
      const candidates = serverDB.getCandidates();
      let enqueuedCount = 0;

      candidates.slice(0, 100).forEach(c => {
        serverDB.enqueueNotificationDelivery({
          id: 'DELIV-' + Date.now().toString(36) + '-' + c.id,
          candidateId: c.id,
          jobId: 'SYSTEM-BROADCAST',
          jobTitle: 'সার্বজনীন প্রশাসনিক বিজ্ঞপ্তি',
          organization: 'চাকরি সেবা কর্তৃপক্ষ',
          type: 'system',
          channel: 'in_app',
          title: title || 'চাকরি সেবা জরুরি বিজ্ঞপ্তি',
          message: message.trim(),
          link: '/dashboard',
          status: 'DELIVERED',
          attemptCount: 1,
          createdAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
          read: false,
          dedupeKey: 'BRD-' + Date.now() + '-' + c.id
        });

        serverDB.addCandidateNotification(c.id, {
          title: title || 'চাকরি সেবা সার্বজনীন বিজ্ঞপ্তি',
          message: message.trim(),
          type: 'system',
          link: '/dashboard'
        });
        enqueuedCount++;
      });

      return NextResponse.json({
        success: true,
        message: `মোট ${enqueuedCount} জন চাকরিপ্রার্থীর অ্যাকাউন্টে নোটিফিকেশন সফলভাবে পাঠানো হয়েছে।`,
        recipientCount: enqueuedCount
      });
    }

    // Single Recipient Transactional Notice
    let actualCandidateId = candidateId;
    if (!actualCandidateId && recipientPhone) {
      const foundCandidate = serverDB.getCandidateByPhone(recipientPhone);
      if (foundCandidate) {
        actualCandidateId = foundCandidate.id;
      }
    }
    const finalCandidateId = actualCandidateId || (recipientPhone ? ('USR-' + recipientPhone) : 'UNKNOWN');

    serverDB.enqueueNotificationDelivery({
      id: deliveryId,
      candidateId: finalCandidateId,
      jobId: 'DIRECT-ADMIN',
      jobTitle: 'অ্যাডমিন নোটিশ',
      organization: 'চাকরি সেবা',
      type: 'system',
      channel: deliveryChannel,
      title: title || 'চাকরি সেবা বার্তা',
      message: message.trim(),
      link: '/dashboard',
      status: 'DELIVERED',
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      read: false,
      dedupeKey: 'NOTIF-' + deliveryId
    });

    if (finalCandidateId && finalCandidateId !== 'UNKNOWN') {
      serverDB.addCandidateNotification(finalCandidateId, {
        title: title || 'অ্যাডমিন জরুরি বিজ্ঞপ্তি',
        message: message.trim(),
        type: 'system',
        link: '/dashboard'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'বার্তা সফলভাবে প্রেরিত ও ডেলিভারি লগ সংরক্ষিত হয়েছে।',
      deliveryId
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'বার্তা প্রেরণে ত্রুটি' }, { status: 500 });
  }
}
