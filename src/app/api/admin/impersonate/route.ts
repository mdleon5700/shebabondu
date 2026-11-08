import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { candidateId } = await req.json();
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const candidate = serverDB.getCandidateById(candidateId) || serverDB.getCandidateByIdentifier(candidateId);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Generate impersonation token
    const token = 'imp-' + crypto.randomBytes(24).toString('hex');
    serverDB.createSession(token, candidate.id, 'candidate', 1);

    const response = NextResponse.json({
      success: true,
      message: `${candidate.name} এর পোর্টালে সফলভাবে প্রবেশ করা হয়েছে।`,
      redirectUrl: '/dashboard',
      candidateName: candidate.name,
      candidateId: candidate.id
    });

    // Set cookies for candidate session + impersonation indicators
    const isProduction = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';
    response.cookies.set('cs_session_token', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 86400
    });

    response.cookies.set('cs_impersonating', encodeURIComponent(candidate.name), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 86400
    });

    response.cookies.set('cs_impersonating_id', candidate.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 86400
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Impersonation failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'অ্যাডমিন প্যানেলে ফিরে যাওয়া হয়েছে।',
    redirectUrl: '/admin?tab=candidate-directory'
  });

  const isProduction = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';

  response.cookies.set('cs_session_token', '', {
    path: '/',
    maxAge: 0,
    secure: isProduction,
    sameSite: 'lax'
  });

  response.cookies.set('cs_impersonating', '', {
    path: '/',
    maxAge: 0,
    secure: isProduction,
    sameSite: 'lax'
  });

  response.cookies.set('cs_impersonating_id', '', {
    path: '/',
    maxAge: 0,
    secure: isProduction,
    sameSite: 'lax'
  });

  return response;
}
