import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const existing = serverDB.getJobSourceById(params.id);
    if (!existing) {
      return NextResponse.json({ error: `NOT_FOUND: সোর্স "${params.id}" পাওয়া যায়নি।` }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const targetEnabled = body && body.enabled !== undefined ? Boolean(body.enabled) : undefined;
    
    const updated = serverDB.toggleJobSource(params.id, targetEnabled, session.candidateId);
    return NextResponse.json({ success: true, source: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'সোর্স স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
