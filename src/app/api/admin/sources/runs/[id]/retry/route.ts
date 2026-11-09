import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { retrySpiderRun } from '@/lib/collector';

export async function POST(req: Request, context: { params: Promise<Promise<{ id: string }> | { id: string }> }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { id } = await Promise.resolve((await context.params));
  if (!id) {
    return NextResponse.json({ error: 'স্পাইডার রান আইডি প্রদান করা আবশ্যক' }, { status: 400 });
  }

  try {
    const result = await retrySpiderRun(id, session.candidateId);
    return NextResponse.json({
      success: true,
      message: 'স্পাইডার রান সফলভাবে পুনরায় এক্সিকিউট করা হয়েছে',
      result
    });
  } catch (err: any) {
    const isNotFound = err.message?.includes('খুঁজে পাওয়া যায়নি') || err.message?.toLowerCase().includes('not found');
    return NextResponse.json({
      error: err.message || 'স্পাইডার রান রিট্রাই করতে ব্যর্থ হয়েছে'
    }, { status: isNotFound ? 404 : 500 });
  }
}
