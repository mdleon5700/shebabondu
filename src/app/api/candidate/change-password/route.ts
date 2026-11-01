import { NextResponse } from 'next/server';
import { getServerSession, verifyPassword, hashPassword } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: অনুগ্রহ করে প্রথমে লগইন করুন।' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড প্রদান করা আবশ্যক।' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।' }, { status: 400 });
    }

    const candidate = serverDB.getCandidateById(session.candidateId);
    if (!candidate) {
      return NextResponse.json({ error: 'প্রার্থী অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    // Verify current password
    if (candidate.passwordHash) {
      const isValid = verifyPassword(currentPassword, candidate.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'বর্তমান পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' }, { status: 400 });
      }
    }

    // Hash and update
    const newHash = hashPassword(newPassword);
    const updated = serverDB.updateCandidate(session.candidateId, { passwordHash: newHash });
    if (!updated) {
      return NextResponse.json({ error: 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে।' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে হালনাগাদ করা হয়েছে!'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
