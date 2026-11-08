import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { workerId, extensionMinutes } = body;

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: workerId' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const renewed = serverDB.heartbeatEngineeringTask(id, workerId, extensionMinutes || 10);

    if (!renewed) {
      return NextResponse.json(
        { success: false, error: `Could not extend lease for task ${id}. Either task does not exist or lease is not owned by ${workerId}.` },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Heartbeat received. Lease for task ${id} extended by ${extensionMinutes || 10} minutes.`
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to heartbeat engineering task' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
