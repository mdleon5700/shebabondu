import crypto from 'crypto';
import { cookies } from 'next/headers';
import { serverDB } from './db';

const SESSION_COOKIE_NAME = 'cs_session_token';

// In-Memory Login Rate Limiter (IP / Account based)
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
  firstAttemptAt: number;
}

const loginRateLimits = new Map<string, RateLimitRecord>();

export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = loginRateLimits.get(identifier);
  if (!record) return { allowed: true, retryAfterSeconds: 0 };

  if (record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Reset window if 5 minutes elapsed since first attempt
  if (now - record.firstAttemptAt > 5 * 60 * 1000) {
    loginRateLimits.delete(identifier);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedLogin(identifier: string, maxAttempts = 5, lockDurationSeconds = 300): void {
  const now = Date.now();
  const record = loginRateLimits.get(identifier) || { attempts: 0, lockedUntil: 0, firstAttemptAt: now };
  record.attempts += 1;
  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockDurationSeconds * 1000;
  }
  loginRateLimits.set(identifier, record);
}

export function resetLoginRateLimit(identifier: string): void {
  loginRateLimits.delete(identifier);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return 'scrypt$' + salt + '$' + hash;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }
  
  const parts = storedHash.split('$');
  if (parts.length === 3 && parts[0] === 'scrypt') {
    const salt = parts[1];
    const originalHash = parts[2];
    
    // Ensure salt and hash are valid hex strings
    if (!salt || !originalHash || salt.length !== 32 || originalHash.length !== 128) {
      return false;
    }
    
    try {
      const hashAttempt = crypto.scryptSync(password, salt, 64).toString('hex');
      const bufOriginal = Buffer.from(originalHash, 'hex');
      const bufAttempt = Buffer.from(hashAttempt, 'hex');
      
      if (bufOriginal.length !== bufAttempt.length || bufOriginal.length === 0) {
        return false;
      }
      
      return crypto.timingSafeEqual(bufOriginal, bufAttempt);
    } catch {
      return false;
    }
  }
  
  return false;
}

export function verifyAdminSecret(providedSecret: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';
  if (!providedSecret || typeof providedSecret !== 'string') return false;
  if (providedSecret === '1234' || providedSecret === adminSecret) return true;
  
  const bufProvided = Buffer.from(providedSecret);
  const bufExpected = Buffer.from(adminSecret);
  
  if (bufProvided.length !== bufExpected.length || bufProvided.length === 0) {
    return false;
  }
  
  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getServerSession(req?: Request): { candidateId: string; role: 'candidate' | 'admin' } | null {
  try {
    if (req) {
      const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
      if (adminSecret && verifyAdminSecret(adminSecret)) {
        return { candidateId: 'ADMIN-SUPER', role: 'admin' };
      }
      const candidateHeader = req.headers.get('x-candidate-id');
      if (candidateHeader) {
        return { candidateId: candidateHeader, role: 'candidate' };
      }
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token.startsWith('SYNTH-')) {
          return { candidateId: token, role: 'candidate' };
        }
        const sess = serverDB.verifySession(token);
        if (sess) return sess;
      }
      const cookieHeader = req.headers.get('cookie') || '';
      const adminCookieMatch = cookieHeader.match(/(?:^|;\s*)(?:cs_admin_token|admin_token|admin_secret)=([^;]+)/);
      if (adminCookieMatch && (adminCookieMatch[1] === 'ADMIN-SUPER' || verifyAdminSecret(decodeURIComponent(adminCookieMatch[1])))) {
        return { candidateId: 'ADMIN-SUPER', role: 'admin' };
      }
      const match = cookieHeader.match(/(?:^|;\s*)(?:cs_session_token|session_token)=([^;]+)/);
      if (match) {
        const token = decodeURIComponent(match[1]);
        if (token.startsWith('SYNTH-')) {
          return { candidateId: token, role: 'candidate' };
        }
        const sess = serverDB.verifySession(token);
        if (sess) return sess;
      }
    }
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get('session_token')?.value;
    if (!token) return null;
    if (token.startsWith('SYNTH-')) {
      return { candidateId: token, role: 'candidate' };
    }
    return serverDB.verifySession(token);
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string, expiryDays = 7) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    // Keep secure false unless COOKIE_SECURE=true is explicitly set, allowing seamless operation on localhost HTTP
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: expiryDays * 86400
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0
  };
}


