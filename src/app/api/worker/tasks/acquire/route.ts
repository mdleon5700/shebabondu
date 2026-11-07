import { NextResponse } from 'next/server';
import { verifyWorkerAuth } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  if (!verifyWorkerAuth(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Valid worker authorization token required.' }, { status: 401 });
  }

  const sources = serverDB.getJobSources().filter(s => s.enabled);
  return NextResponse.json({
    success: true,
    status: 'operational',
    activeSources: sources.map(s => ({
      id: s.id,
      name: s.name,
      sourceUrl: s.sourceUrl,
      classification: s.classification,
      lastFetchedAt: s.lastFetchedAt,
      healthStatus: s.healthStatus
    }))
  });
}

export async function POST(req: Request) {
  if (!verifyWorkerAuth(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Valid worker authorization token required.' }, { status: 401 });
  }

  try {
    let requestedSourceId: string | undefined;
    try {
      const body = await req.json();
      if (body && typeof body === 'object') {
        requestedSourceId = body.sourceId ? String(body.sourceId).trim() : undefined;
      }
    } catch {
      // Body is optional for acquire
    }

    const allSources = serverDB.getJobSources();
    const enabledSources = allSources.filter(s => s.enabled);

    if (enabledSources.length === 0) {
      return NextResponse.json({
        success: true,
        task: null,
        message: 'No active job sources configured or enabled.'
      });
    }

    let selectedSource = requestedSourceId
      ? enabledSources.find(s => s.id === requestedSourceId)
      : null;

    if (!selectedSource) {
      // Prioritize sources by least recently fetched or never fetched
      selectedSource = [...enabledSources].sort((a, b) => {
        const timeA = a.lastFetchedAt ? new Date(a.lastFetchedAt).getTime() : 0;
        const timeB = b.lastFetchedAt ? new Date(b.lastFetchedAt).getTime() : 0;
        return timeA - timeB;
      })[0];
    }

    if (!selectedSource) {
      return NextResponse.json({
        success: true,
        task: null,
        message: 'No eligible job source found for task assignment.'
      });
    }

    const leaseDurationMs = 15 * 60 * 1000; // 15 minute lease lock
    const now = new Date();
    const expiresAt = new Date(now.getTime() + leaseDurationMs).toISOString();
    const taskId = `task_${selectedSource.id}_${now.getTime()}`;

    // Mark source as running in database
    serverDB.updateJobSource(selectedSource.id, {
      fetchStatus: 'syncing',
      lastFetchedAt: now.toISOString()
    });

    return NextResponse.json({
      success: true,
      task: {
        taskId,
        sourceId: selectedSource.id,
        sourceName: selectedSource.name,
        sourceUrl: selectedSource.sourceUrl,
        classification: selectedSource.classification,
        collectionMethod: selectedSource.collectionMethod,
        leaseDurationMs,
        expiresAt,
        config: {
          maxItems: 25,
          enablePdf: true,
          requireOcrIfScanned: true
        }
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
