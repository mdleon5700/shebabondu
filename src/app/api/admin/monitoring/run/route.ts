import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { DeadlineMonitoringEngine } from '@/lib/deadlines/monitoring';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const record = await DeadlineMonitoringEngine.runReconciliation({
      adminId: session.candidateId,
      force: true
    });

    return NextResponse.json({
      success: true,
      message: 'ডেডলাইন মনিটরিং ও রিকনসিলিয়েশন সফলভাবে সম্পন্ন হয়েছে',
      runRecord: record
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Monitoring run failed' }, { status: 500 });
  }
}
