import { NextResponse } from 'next/server';
import { getServerSession, verifyAdminSecret, hashPassword } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { CandidateProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
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
    const docs = serverDB.getDocuments(c.id);
    return {
      ...rest,
      documents: docs,
      customDocuments: docs.filter(d => d.type === 'custom' || d.category || (!['photo', 'signature', 'nid_front', 'nid_back', 'father_nid', 'mother_nid', 'nagorik_certificate', 'birth_certificate', 'character_certificate', 'quota_certificate'].includes(d.type))),
      nid: rest.nid || ''
    };
  });

  return NextResponse.json({ success: true, candidates: safeCandidates, total: safeCandidates.length }, {
    headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
  });
}

export async function POST(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      nameBn,
      phone,
      email,
      password,
      gender,
      dateOfBirth,
      dob,
      nid,
      district,
      division,
      address,
      permanentAddress,
      maritalStatus,
      educationLevel,
      quota,
      walletBalance,
      accountStatus,
      status
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'প্রার্থীর পূর্ণ নাম আবশ্যক।' }, { status: 400 });
    }

    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      return NextResponse.json({ error: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর আবশ্যক (যেমন: 01700000000)।' }, { status: 400 });
    }

    // Check duplicate phone
    const existing = serverDB.getCandidateByPhone(cleanPhone);
    if (existing) {
      return NextResponse.json({ error: 'এই মোবাইল নম্বরের প্রার্থী ইতিমধ্যে সিস্টেমে নিবন্ধিত রয়েছে।' }, { status: 409 });
    }

    const candidateId = 'USR-' + Date.now();
    const resolvedAccountStatus = (accountStatus || status || 'active') as 'active' | 'suspended';
    const pwd = password ? String(password).trim() : '123456';

    const newCandidate: any = {
      id: candidateId,
      name: name.trim(),
      nameBn: nameBn ? String(nameBn).trim() : name.trim(),
      phone: cleanPhone,
      email: email ? String(email).trim().toLowerCase() : '',
      passwordHash: hashPassword(pwd),
      gender: gender || 'male',
      dob: String(dob || dateOfBirth || '2000-01-01'),
      dateOfBirth: String(dob || dateOfBirth || '2000-01-01'),
      nid: nid ? String(nid).trim() : '',
      district: district ? String(district).trim() : 'ঢাকা',
      division: division ? String(division).trim() : 'Dhaka',
      address: address ? String(address).trim() : '',
      permanentAddress: permanentAddress ? String(permanentAddress).trim() : '',
      maritalStatus: maritalStatus || 'unmarried',
      educationLevel: educationLevel || 'graduate',
      quota: quota || 'none',
      walletBalance: Number(walletBalance) || 0,
      accountStatus: resolvedAccountStatus,
      status: resolvedAccountStatus,
      role: 'candidate',
      isProfileComplete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = (serverDB as any).createCandidate(newCandidate);
    const { passwordHash: _, ...safeCandidate } = created;

    return NextResponse.json({
      success: true,
      message: 'নতুন প্রার্থী সফলভাবে তৈরি করা হয়েছে।',
      candidate: safeCandidate
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'প্রার্থী তৈরি করতে ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
