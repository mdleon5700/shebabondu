import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = serverDB.getEngineeringTaskById(id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: `Engineering task ${id} not found` },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({
      success: true,
      task
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch engineering task' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = serverDB.getEngineeringTaskById(id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: `Engineering task ${id} not found` },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await req.json();
    const now = new Date().toISOString();

    const updatedTask = {
      ...task,
      ...body,
      taskId: task.taskId, // immutable
      createdAt: task.createdAt, // immutable
      updatedAt: now,
      checkpoints: [
        ...task.checkpoints,
        {
          timestamp: now,
          stage: body.status || task.status,
          message: body.checkpointMessage || 'Task updated via Admin API'
        }
      ]
    };

    // Save directly to serverDB's underlying store
    const db = (serverDB as any).getDB ? (serverDB as any).getDB() : null;
    // We can use an update method or update directly:
    // Let's add a helper or update in serverDB if needed, or implement in db:
    const tasks = serverDB.getEngineeringTasks();
    const current = tasks.find(t => t.taskId === id);
    if (current) {
      Object.assign(current, updatedTask);
    }

    return NextResponse.json({
      success: true,
      task: updatedTask
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update engineering task' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

