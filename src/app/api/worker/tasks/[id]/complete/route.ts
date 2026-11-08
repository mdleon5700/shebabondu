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
    const { workerId, summary, evidence } = body;

    if (!workerId || !summary) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: workerId, summary' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const task = serverDB.completeEngineeringTask(id, workerId, summary, evidence);

    if (!task) {
      return NextResponse.json(
        { success: false, error: `Could not complete task ${id}. Either task does not exist or lease is not owned by ${workerId}.` },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Task ${id} completed successfully. Status is now ${task.status}.`,
      task
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to complete engineering task' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

