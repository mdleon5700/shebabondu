import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { serverDB } from '@/lib/db';
import { hashPassword, generateSessionToken, createSessionCookie } from '@/lib/auth';
import { mockUserProfile } from '@/data/mockJobs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, email, name, photoUrl } = body;

    if (!email) {
      return NextResponse.json({ error: 'ইমেইল ঠিকানা পাওয়া যায়নি।' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    let candidate = serverDB.getCandidateByEmail(cleanEmail);

    let isNewUser = false;
    if (!candidate) {
      isNewUser = true;
      const candidateId = `USR-SOC-${Date.now()}`;
      const generatedUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(100 + Math.random() * 900);
      
      candidate = serverDB.createCandidate({
        ...mockUserProfile,
        id: candidateId,
        name: name || (provider === 'google' ? 'Google ব্যবহারকারী' : 'Facebook ব্যবহারকারী'),
        nameBn: name || 'ব্যবহারকারী',
        email: cleanEmail,
        username: generatedUsername,
        phone: '',
        photoUrl: photoUrl || (provider === 'google' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' 
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'),
        passwordHash: hashPassword(crypto.randomBytes(16).toString('hex')),
        role: 'candidate',
        walletBalance: 100, // ৳100 welcome signup bonus
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const token = generateSessionToken();
    serverDB.createSession(token, candidate.id, 'candidate');
    const { passwordHash, ...safeCandidate } = candidate;
    const res = NextResponse.json({ 
      success: true, 
      user: safeCandidate, 
      isNewUser, 
      provider: provider || 'google' 
    });
    const cookie = createSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Social authentication failed' }, { status: 500 });
  }
}
