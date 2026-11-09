import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { hashPassword, generateSessionToken, createSessionCookie } from '@/lib/auth';
import { emptyCandidateProfile } from '@/lib/candidate-defaults';
import { generateSmartCandidateId, generateSmartUsername } from '@/lib/id-generator';
import { BD_DIVISIONS_MAP } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, username, password, name, nameBn, district, division } = body;

    const enName = (name || '').trim();
    const bnName = (nameBn || '').trim();

    if (!enName && !bnName) {
      return NextResponse.json({ error: 'প্রার্থীর পূর্ণ নাম (ইংরেজি ও বাংলায়) প্রদান করুন।' }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: 'সক্রিয় মোবাইল নম্বর প্রদান করুন।' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' }, { status: 400 });
    }

    const cleanPhone = String(phone)
      .replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
      .replace(/\D/g, '')
      .replace(/^880/, '0');

    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'সঠিক ১১-সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।' }, { status: 400 });
    }

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

    // Auto-detect division if not provided
    const selectedDistrict = (district || 'ঢাকা').trim();
    let detectedDivision = division;
    if (!detectedDivision) {
      for (const [_, divData] of Object.entries(BD_DIVISIONS_MAP)) {
        if (divData.districts.some(d => d.bn === selectedDistrict || d.en.toLowerCase() === selectedDistrict.toLowerCase())) {
          detectedDivision = divData.bn;
          break;
        }
      }
    }

    const candidateId = generateSmartCandidateId(cleanPhone);
    const primaryName = enName || bnName;
    const generatedUsername = (username && username.trim()) 
      ? username.trim().toLowerCase() 
      : generateSmartUsername(primaryName, cleanPhone, (u) => !!serverDB.getCandidateByIdentifier(u));

    if (serverDB.getCandidateByIdentifier(generatedUsername)) {
      return NextResponse.json({ error: 'ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে।' }, { status: 409 });
    }

    // Zero-balance digital wallet and 8-slot vault profile initialization
    const newCandidate = serverDB.createCandidate({
      ...structuredClone(emptyCandidateProfile),
      id: candidateId,
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : '',
      username: generatedUsername,
      name: enName || bnName,
      nameBn: bnName || enName,
      district: selectedDistrict,
      division: detectedDivision || 'ঢাকা',
      passwordHash: hashPassword(password),
      role: 'candidate',
      walletBalance: 0, // Clean zero-balance wallet provisioning
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const token = generateSessionToken();
    serverDB.createSession(token, newCandidate.id, 'candidate');
    const { passwordHash: _, ...safeCandidate } = newCandidate;
    const res = NextResponse.json({ 
      success: true, 
      token, 
      user: safeCandidate,
      message: 'রেজিস্ট্রেশন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...'
    });
    const cookie = createSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
