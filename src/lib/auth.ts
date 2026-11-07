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
  if (!providedSecret || typeof providedSecret !== 'string') return false;
  
  const isProd = process.env.NODE_ENV === 'production';
  const configuredSecret = process.env.ADMIN_SECRET_KEY?.trim();

  let validSecrets: string[] = [];

  if (isProd) {
    // In production, strictly require configured non-trivial ADMIN_SECRET_KEY
    if (configuredSecret && !['1234', 'admin', '123456', 'admin123'].includes(configuredSecret)) {
      validSecrets.push(configuredSecret);
    } else {
      console.error('[CRITICAL SECURITY] In production, ADMIN_SECRET_KEY must be configured with a strong secret.');
      return false;
    }
  } else {
    // Development / test environment: allow configured key or standard dev keys
    if (configuredSecret) validSecrets.push(configuredSecret);
    validSecrets.push('CHAKRISEBA_SECURE_ADMIN_2026', '1234');
  }

  const bufProvided = Buffer.from(providedSecret.trim());
  for (const secret of validSecrets) {
    const bufExpected = Buffer.from(secret);
    if (bufProvided.length === bufExpected.length && crypto.timingSafeEqual(bufProvided, bufExpected)) {
      return true;
    }
  }
  
  return false;
}

export function isTestAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ENABLE_TEST_AUTH === 'true';
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
      if (isTestAuthEnabled() && candidateHeader) {
        return { candidateId: candidateHeader, role: 'candidate' };
      }
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (isTestAuthEnabled() && token.startsWith('SYNTH-')) {
          return { candidateId: token, role: 'candidate' };
        }
        const sess = serverDB.verifySession(token);
        if (sess) return sess;
      }
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:^|;\s*)(?:cs_session_token|session_token)=([^;]+)/);
      if (match) {
        const token = decodeURIComponent(match[1]);
        if (isTestAuthEnabled() && token.startsWith('SYNTH-')) {
          return { candidateId: token, role: 'candidate' };
        }
        const sess = serverDB.verifySession(token);
        if (sess) return sess;
      }
    }
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get('session_token')?.value;
    if (!token) return null;
    if (isTestAuthEnabled() && token.startsWith('SYNTH-')) {
      return { candidateId: token, role: 'candidate' };
    }
    return serverDB.verifySession(token);
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string, expiryDays = 30) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    // Keep secure false unless COOKIE_SECURE=true is explicitly set, allowing seamless operation on localhost HTTP
    secure: process.env.COOKIE_SECURE === 'true' || (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false'),
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
    secure: process.env.COOKIE_SECURE === 'true' || (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false'),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0
  };

}

export function verifyWorkerAuth(req: Request): boolean {
  try {
    const workerToken = req.headers.get('x-worker-token') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const expected = process.env.WORKER_AUTH_TOKEN || 'cs_worker_local_secret_2026';
    if (workerToken && workerToken.trim() === expected.trim()) {
      return true;
    }
    const session = getServerSession(req);
    return session?.role === 'admin';
  } catch {
    return false;
  }

}


