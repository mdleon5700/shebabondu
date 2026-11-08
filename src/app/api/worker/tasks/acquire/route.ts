import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { EngineeringWorkstream } from '@/lib/engineering/types';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workerId, allowedWorkstreams } = body;

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: workerId' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const task = serverDB.acquireNextEngineeringTask(
      workerId,
      allowedWorkstreams as EngineeringWorkstream[] | undefined
    );

    if (!task) {
      return NextResponse.json({
        success: true,
        message: 'No pending engineering tasks available for acquisition',
        task: null
      }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({
      success: true,
      message: `Task ${task.taskId} leased successfully to ${workerId}`,
      task
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to acquire engineering task' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
