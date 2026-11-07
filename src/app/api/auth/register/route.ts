import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { hashPassword, generateSessionToken, createSessionCookie } from '@/lib/auth';
import { emptyCandidateProfile } from '@/lib/candidate-defaults';
import { generateSmartCandidateId, generateSmartUsername } from '@/lib/id-generator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, username, password, name, district } = body;

    if (!phone || !password || !name) {
      return NextResponse.json({ error: 'নাম, মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন।' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 6) return NextResponse.json({ error: 'Password must contain at least 6 characters.' }, { status: 400 });
    const cleanPhone = String(phone).replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/\D/g, '').replace(/^880/, '0');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) return NextResponse.json({ error: 'A valid Bangladesh mobile number is required.' }, { status: 400 });
    const existingPhone = serverDB.getCandidateByPhone(cleanPhone);
    if (existingPhone) {
      return NextResponse.json({ error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে। সরাসরি লগইন করুন।' }, { status: 409 });
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingEmail = serverDB.getCandidateByEmail(cleanEmail);
      if (existingEmail) {
        return NextResponse.json({ error: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। সরাসরি লগইন করুন।' }, { status: 409 });
      }
    }

    const candidateId = generateSmartCandidateId(cleanPhone);
    const generatedUsername = (username && username.trim()) 
      ? username.trim().toLowerCase() 
      : generateSmartUsername(name, cleanPhone, (u) => !!serverDB.getCandidateByIdentifier(u));

    if (serverDB.getCandidateByIdentifier(generatedUsername)) return NextResponse.json({ error: 'Username already exists.' }, { status: 409 });
    const newCandidate = serverDB.createCandidate({
      ...structuredClone(emptyCandidateProfile),
      id: candidateId,
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : '',
      username: generatedUsername,
      name,
      nameBn: name,
      district: district || 'ঢাকা',
      passwordHash: hashPassword(password),
      role: 'candidate',
      walletBalance: 50, // Welcome bonus
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const token = generateSessionToken();
    serverDB.createSession(token, newCandidate.id, 'candidate');
    const { passwordHash, ...safeCandidate } = newCandidate;
    const res = NextResponse.json({ success: true, token, user: safeCandidate });
    const cookie = createSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
