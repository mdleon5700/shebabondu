import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { hashPassword, generateSessionToken, createSessionCookie, isTestAuthEnabled } from '@/lib/auth';
import { mockUserProfile } from '@/data/mockJobs';

// In-Memory store for password reset OTPs (5-minute expiry)
interface ResetRecord {
  identifier: string;
  otp: string;
  candidateId: string;
  expiresAt: number;
}

const otpStore = new Map<string, ResetRecord>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, identifier, otp, newPassword } = body;
    const cleanId = (identifier || '').trim().toLowerCase();

    if (!cleanId) {
      return NextResponse.json({ error: 'মোবাইল নম্বর অথবা ইমেইল ঠিকানা প্রদান করুন।' }, { status: 400 });
    }

    // 1. REQUEST OTP
    if (action === 'request_otp') {
      let candidate = serverDB.getCandidateByIdentifier(cleanId);
      
      // Allow demo user reset
      if (!candidate) {
        const cleanPhone = cleanId.replace(/[^0-9]/g, '');
        if (cleanPhone === '01712345678' || cleanId === 'tanvir.jobseeker@gmail.com' || cleanId === 'tanvir2026') {
          candidate = serverDB.createCandidate({
            ...mockUserProfile,
            id: 'USR-01712345678',
            phone: '01712-345678',
            email: 'tanvir.jobseeker@gmail.com',
            username: 'tanvir2026',
            name: 'মোঃ তানভীর হাসান',
            nameBn: 'মোঃ তানভীর হাসান',
            passwordHash: hashPassword('123456'),
            role: 'candidate',
            walletBalance: 450,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      if (!candidate) {
        return NextResponse.json({ 
          error: 'এই তথ্য অনুযায়ী কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক মোবাইল নম্বর বা ইমেইল দিন।' 
        }, { status: 404 });
      }

      // Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      otpStore.set(cleanId, {
        identifier: cleanId,
        otp: generatedOtp,
        candidateId: candidate.id,
        expiresAt
      });

      const isEmail = cleanId.includes('@');
      let maskedTarget = '';
      if (isEmail && candidate.email) {
        const [user, domain] = candidate.email.split('@');
        maskedTarget = `${user.slice(0, 2)}***@${domain}`;
      } else {
        const p = candidate.phone || cleanId;
        maskedTarget = p.length >= 8 ? `${p.slice(0, 3)}****${p.slice(-3)}` : p;
      }

      return NextResponse.json({
        success: true,
        channel: isEmail ? 'email' : 'phone',
        maskedTarget,
        testOtp: generatedOtp, // Included for instant verification in testing
        message: `আপনার ${isEmail ? 'ইমেইলে' : 'মোবাইলে'} (${maskedTarget}) একটি ৬-ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।`
      });
    }

    // 2. VERIFY OTP
    if (action === 'verify_otp') {
      const record = otpStore.get(cleanId);
      if (!record || record.expiresAt < Date.now()) {
        return NextResponse.json({ error: 'ভেরিফিকেশন কোডের মেয়াদ শেষ হয়েছে। পুনরায় কোড চেয়ে পাঠান।' }, { status: 400 });
      }

      if (record.otp !== (otp || '').trim()) {
        return NextResponse.json({ error: 'ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক ৬-ডিজিটের কোড দিন।' }, { status: 400 });
      }

      return NextResponse.json({ success: true, verified: true, message: 'কোড সফলভাবে যাচাই হয়েছে।' });
    }

    // 3. RESET PASSWORD
    if (action === 'reset_password') {
      const record = otpStore.get(cleanId);
      if (!record || record.expiresAt < Date.now()) {
        return NextResponse.json({ error: 'সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার শুরু করুন।' }, { status: 400 });
      }

      if (record.otp !== (otp || '').trim()) {
        return NextResponse.json({ error: 'অবৈধ বা ভুল ওটিপি কোড।' }, { status: 400 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' }, { status: 400 });
      }

      const candidate = serverDB.getCandidateById(record.candidateId);
      if (!candidate) {
        return NextResponse.json({ error: 'প্রার্থী প্রোফাইল খুঁজে পাওয়া যায়নি।' }, { status: 404 });
      }

      // Update password hash
      const newHash = hashPassword(newPassword);
      serverDB.updateCandidate(candidate.id, { passwordHash: newHash });

      // Clean up OTP record
      otpStore.delete(cleanId);

      // Log user in automatically
      const token = generateSessionToken();
      serverDB.createSession(token, candidate.id, 'candidate');
      const { passwordHash: _, ...safeCandidate } = candidate;

      const res = NextResponse.json({
        success: true,
        message: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...',
        token,
        user: safeCandidate
      });
      const cookie = createSessionCookie(token);
      res.cookies.set(cookie.name, cookie.value, cookie);
      return res;
    }

    return NextResponse.json({ error: 'অননুমোদিত রিকোয়েস্ট অ্যাকশন।' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Password reset failed' }, { status: 500 });
  }
}
