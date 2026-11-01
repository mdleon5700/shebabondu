import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { hashPassword, generateSessionToken, createSessionCookie } from '@/lib/auth';
import { mockUserProfile } from '@/data/mockJobs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, username, password, name, district } = body;

    if (!phone || !password || !name) {
      return NextResponse.json({ error: 'à¦¨à¦¾à¦®, à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦®à§à¦¬à¦° à¦“ à¦ªà¦¾à¦¸à¦“à§Ÿà¦¾à¦°à§à¦¡ à¦ªà§à¦°à¦¦à¦¾à¦¨ à¦•à¦°à§à¦¨à¥¤' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const existingPhone = serverDB.getCandidateByPhone(cleanPhone);
    if (existingPhone) {
      return NextResponse.json({ error: 'à¦à¦‡ à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦®à§à¦¬à¦° à¦¦à¦¿à§Ÿà§‡ à¦‡à¦¤à¦¿à¦®à¦§à§à¦¯à§‡ à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦°à§Ÿà§‡à¦›à§‡à¥¤ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦²à¦—à¦‡à¦¨ à¦•à¦°à§à¦¨à¥¤' }, { status: 409 });
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingEmail = serverDB.getCandidateByEmail(cleanEmail);
      if (existingEmail) {
        return NextResponse.json({ error: 'à¦à¦‡ à¦‡à¦®à§‡à¦‡à¦² à¦¦à¦¿à§Ÿà§‡ à¦‡à¦¤à¦¿à¦®à¦§à§à¦¯à§‡ à¦à¦•à¦Ÿà¦¿ à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦°à§Ÿà§‡à¦›à§‡à¥¤ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦²à¦—à¦‡à¦¨ à¦•à¦°à§à¦¨à¥¤' }, { status: 409 });
      }
    }

    const candidateId = `USR-${cleanPhone.replace(/[^0-9]/g, '') || Date.now().toString()}`;
    const generatedUsername = (username && username.trim()) 
      ? username.trim().toLowerCase() 
      : (email ? email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') : 'user') + Math.floor(100 + Math.random() * 900);

    const newCandidate = serverDB.createCandidate({
      ...mockUserProfile,
      id: candidateId,
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : '',
      username: generatedUsername,
      name,
      nameBn: name,
      district: district || 'à¦¢à¦¾à¦•à¦¾',
      passwordHash: hashPassword(password),
      role: 'candidate',
      walletBalance: 50, // Welcome bonus
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const token = generateSessionToken();
    serverDB.createSession(token, newCandidate.id, 'candidate');
    const { passwordHash, ...safeCandidate } = newCandidate;
    const res = NextResponse.json({ success: true, user: safeCandidate });
    const cookie = createSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
