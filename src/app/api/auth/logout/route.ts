import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDB } from '@/lib/db';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('cs_session_token')?.value;
    if (token) {
      serverDB.revokeSession(token);
    }
    const res = NextResponse.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে' });
    const cleared = clearSessionCookie();
    res.cookies.set(cleared.name, cleared.value, cleared);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}