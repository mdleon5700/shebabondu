import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { retrySpiderRun } from '@/lib/collector';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const result = await retrySpiderRun(params.id, session.candidateId);
    return NextResponse.json({
      success: true,
      message: '???????? ??? ??????? ?????? ????????? ??? ??????',
      result
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || '???????? ??? ??????? ???? ?????? ??????'
    }, { status: 500 });
  }
}
