import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { scrapeAllSources } from '@/lib/collector';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const report = await scrapeAllSources(session.candidateId);
    return NextResponse.json({
      success: true,
      report
    });
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message || 'সকল সোর্স স্ক্র্যাপিং ব্যর্থ হয়েছে।' 
    }, { status: 500 });
  }
}
