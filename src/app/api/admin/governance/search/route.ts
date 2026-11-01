import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { AdminGlobalSearchEngine, AdminRole } from '@/lib/governance';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin authentication required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const roleParam = (searchParams.get('role') || 'super_admin') as AdminRole;

    if (!query.trim() || query.trim().length < 2) {
      return NextResponse.json({ success: true, count: 0, results: [] });
    }

    const results = AdminGlobalSearchEngine.search(query, roleParam, 15);

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Search execution failed' },
      { status: 500 }
    );
  }
}
