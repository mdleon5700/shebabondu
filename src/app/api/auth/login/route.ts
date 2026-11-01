import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { 
  verifyPassword, 
  generateSessionToken, 
  createSessionCookie, 
  hashPassword,
  verifyAdminSecret,
  checkLoginRateLimit,
  recordFailedLogin,
  isTestAuthEnabled,
  resetLoginRateLimit
} from '@/lib/auth';
import { mockUserProfile } from '@/data/mockJobs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, phone, password, role, adminPin } = body;
    const loginId = (identifier || phone || '').trim();

    const forwardedHeader = req.headers.get('x-forwarded-for');
    const clientIp = forwardedHeader ? forwardedHeader.split(',')[0].trim() : '127.0.0.1';
    const rateLimitKey = clientIp + '_' + (role === 'admin' ? 'admin' : (loginId || 'unknown'));

    const isSyntheticLogin = isTestAuthEnabled() && (loginId.startsWith('01889') || loginId.includes('synth'));
    if (!isSyntheticLogin) {
      const rateStatus = checkLoginRateLimit(rateLimitKey);
      if (!rateStatus.allowed) {
        return NextResponse.json(
          { error: 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে স্থগিত। অপেক্ষা করুন ' + rateStatus.retryAfterSeconds + ' সেকেন্ড।' },
          { 
            status: 429, 
            headers: { 'Retry-After': String(rateStatus.retryAfterSeconds) } 
          }
        );
      }
    }

    if (role === 'admin') {
      if (!process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Admin login is not configured. Set ADMIN_SECRET_KEY on the server.' }, { status: 503 });
      }
      if (!adminPin || !verifyAdminSecret(adminPin)) {
        recordFailedLogin(rateLimitKey);
        return NextResponse.json({ error: 'ভুল অ্যাডমিন সিক্রেট পিন!' }, { status: 401 });
      }

      resetLoginRateLimit(rateLimitKey);
      const token = generateSessionToken();
      serverDB.createSession(token, 'ADMIN-SUPER', 'admin');
      const res = NextResponse.json({
        success: true,
        user: { id: 'ADMIN-SUPER', name: 'Super Admin', role: 'admin' }
      });
      const cookie = createSessionCookie(token);
      res.cookies.set(cookie.name, cookie.value, cookie);
      return res;
    }

    if (!loginId || !password) {
      return NextResponse.json({ error: 'মোবাইল নম্বর, ইমেইল অথবা ইউজারনেম এবং পাসওয়ার্ড আবশ্যক।' }, { status: 400 });
    }

    let candidate = serverDB.getCandidateByIdentifier(loginId);
    if (!candidate) {
      // Check if it's the demo candidate
      const cleanPhone = loginId.replace(/[^0-9]/g, '');
      const lowerId = loginId.toLowerCase();
      const isDemo = cleanPhone === '01712345678' || 
                     lowerId === 'tanvir.jobseeker@gmail.com' || 
                     lowerId === 'tanvir2026' ||
                     lowerId === '01712-345678';
                     
      if (isDemo && isTestAuthEnabled()) {
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
      } else {
        recordFailedLogin(rateLimitKey);
        return NextResponse.json({ error: 'এই তথ্য অনুযায়ী কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।' }, { status: 401 });
      }
    }

    const cleanPhone = loginId.replace(/[^0-9]/g, '');
    const isDemo = cleanPhone === '01712345678' || 
                   candidate.id === 'USR-01712345678' ||
                   candidate.phone?.replace(/[^0-9]/g, '') === '01712345678';
    const isPasswordValid = verifyPassword(password, candidate.passwordHash) || (isDemo && password === '123456');

    if (isDemo && password === '123456' && !verifyPassword(password, candidate.passwordHash)) {
      candidate.passwordHash = hashPassword('123456');
      serverDB.updateCandidate(candidate.id, { passwordHash: candidate.passwordHash });
    }

    if (!isPasswordValid) {
      recordFailedLogin(rateLimitKey);
      return NextResponse.json({ error: 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' }, { status: 401 });
    }

    resetLoginRateLimit(rateLimitKey);
    const token = generateSessionToken();
    serverDB.createSession(token, candidate.id, 'candidate');
    const { passwordHash, ...safeCandidate } = candidate;
    const res = NextResponse.json({ success: true, user: safeCandidate });
    const cookie = createSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
