import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { GlobalFeedConfig } from '@/lib/feeds/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  try {
    const config = serverDB.getFeedConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিড কনফিগারেশন লোড করা যায়নি' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'অবৈধ কনফিগারেশন বডি' },
        { status: 400 }
      );
    }

    const updatedConfig = serverDB.saveFeedConfig(body);

    // Record audit log
    serverDB.addAuditLog({
      action: 'UPDATE_FEED_CONFIG',
      adminId: 'ADMIN-STEP07',
      targetId: 'feed-config',
      targetType: 'SYSTEM_SETTINGS',
      notes: 'Updated homepage and dynamic job feed configuration parameters',
      changes: {
        config: { new: updatedConfig }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'ফিড কনফিগারেশন সফলভাবে আপডেট করা হয়েছে',
      config: updatedConfig
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'ফিড কনফিগারেশন সংরক্ষণে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
