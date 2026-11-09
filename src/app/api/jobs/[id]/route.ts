import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    const job = serverDB.getPublicJobById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
