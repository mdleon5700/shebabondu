import { NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini/gemini_service';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const config = GeminiService.getConfig();
    const maskedKey = config.apiKey
      ? `${config.apiKey.slice(0, 6)}...${config.apiKey.slice(-4)}`
      : '';

    return NextResponse.json({
      success: true,
      configured: Boolean(config.apiKey),
      maskedKey,
      model: config.model,
      status: config.status,
      lastTestedAt: config.lastTestedAt,
      error: config.error
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { apiKey, model } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 15) {
      return NextResponse.json({ error: 'একটি সঠিক Google Gemini API Key প্রদান করুন।' }, { status: 400 });
    }

    const updated = await GeminiService.saveConfig(apiKey, model || 'gemini-1.5-flash');

    return NextResponse.json({
      success: updated.status === 'CONNECTED',
      status: updated.status,
      message: updated.status === 'CONNECTED'
        ? 'জেমিনি এআই সফলভাবে সংযুক্ত ও সংরক্ষিত হয়েছে!'
        : `সংযোগে ত্রুটি: ${updated.error}`,
      error: updated.error,
      model: updated.model
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

