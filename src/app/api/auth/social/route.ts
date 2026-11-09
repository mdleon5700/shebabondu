import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { generateSessionToken, createSessionCookie, hashPassword } from '@/lib/auth';
import { emptyCandidateProfile } from '@/lib/candidate-defaults';
import { generateSmartCandidateId, generateSmartUsername } from '@/lib/id-generator';
import { mockUserProfile } from '@/data/mockJobs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, email, name, photoUrl } = body;

    if (!provider || !['google', 'facebook'].includes(provider)) {
      return NextResponse.json({ error: 'অবৈধ সোশ্যাল প্রোভাইডার।' }, { status: 400 });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return NextResponse.json({ error: 'সোশ্যাল অ্যাকাউন্ট থেকে কোনো ইমেইল পাওয়া যায়নি।' }, { status: 400 });
    }

    // 1. Check if user already exists by email
    let candidate = serverDB.getCandidateByEmail(cleanEmail);

    // 2. If it's the demo email tanvir.jobseeker@gmail.com, ensure demo candidate exists
    if (!candidate && cleanEmail === 'tanvir.jobseeker@gmail.com') {
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

    // 3. If candidate doesn't exist, create a new one automatically
    if (!candidate) {
      const fallbackPhone = '017' + Math.floor(10000000 + Math.random() * 90000000).toString();
      const candidateId = generateSmartCandidateId(fallbackPhone);
      const displayName = (name || (provider === 'google' ? 'Google ইউজার' : 'Facebook ইউজার')).trim();
      const generatedUsername = generateSmartUsername(displayName, fallbackPhone, (u) => !!serverDB.getCandidateByIdentifier(u));

      candidate = serverDB.createCandidate({
        ...structuredClone(emptyCandidateProfile),
        id: candidateId,
        phone: fallbackPhone,
        email: cleanEmail,
        username: generatedUsername,
        name: displayName,
        nameBn: displayName,
        district: 'ঢাকা',
        passwordHash: hashPassword(generateSessionToken()),
        role: 'candidate',
        walletBalance: 50, // Welcome bonus
        photoUrl: photoUrl || (provider === 'google' ? '/images/google-avatar.png' : '/images/fb-avatar.png'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 4. Generate authenticated session
    const token = generateSessionToken();
    serverDB.createSession(token, candidate.id, 'candidate');

    const { passwordHash: _, ...safeCandidate } = candidate;
    const res = NextResponse.json({
      success: true,
      token,
      provider,
      user: safeCandidate,
      message: `${provider === 'google' ? 'Google' : 'Facebook'} দিয়ে সফলভাবে প্রবেশ করা হয়েছে!`
    });

    const cookie = createSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Social authentication failed' }, { status: 500 });
  }
}
