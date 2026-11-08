import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { EngineeringTaskStatus, TaskPriority, EngineeringWorkstream, TaskType } from '@/lib/engineering/types';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as EngineeringTaskStatus | null;
    const priority = searchParams.get('priority') as TaskPriority | null;
    const workstream = searchParams.get('workstream') as EngineeringWorkstream | null;
    const taskType = searchParams.get('taskType') as TaskType | null;
    const requiresHumanApprovalParam = searchParams.get('requiresHumanApproval');
    const requiresHumanApproval = requiresHumanApprovalParam !== null ? requiresHumanApprovalParam === 'true' : undefined;

    const tasks = serverDB.getEngineeringTasks({
      status: status || undefined,
      priority: priority || undefined,
      workstream: workstream || undefined,
      taskType: taskType || undefined,
      requiresHumanApproval
    });

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list engineering tasks' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workstream,
      taskType,
      title,
      description,
      priority,
      affectedModules,
      assignedAgent,
      requiresHumanApproval,
      idempotencyKey
    } = body;

    if (!workstream || !taskType || !title || !description || !priority) {
      return NextResponse.json(
        { success: false, error: 'Missing required task fields: workstream, taskType, title, description, priority' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const task = serverDB.createEngineeringTask({
      workstream,
      taskType,
      title,
      description,
      priority,
      affectedModules,
      assignedAgent,
      requiresHumanApproval,
      idempotencyKey
    });

    return NextResponse.json({
      success: true,
      message: 'Engineering task queued successfully',
      task
    }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create engineering task' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

