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
    const { approvedBy, decision, notes } = body;

    if (!approvedBy || !decision || !['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(decision)) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid fields: approvedBy, decision (APPROVED | REJECTED | CHANGES_REQUESTED)' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const task = serverDB.recordEngineeringTaskApproval(id, approvedBy, decision, notes);

    if (!task) {
      return NextResponse.json(
        { success: false, error: `Engineering task ${id} not found` },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Human approval decision recorded: ${decision}. Task status is now ${task.status}.`,
      task
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record task approval' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
