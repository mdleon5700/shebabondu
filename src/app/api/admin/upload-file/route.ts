import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploadType = (formData.get('type') as string || 'image').toLowerCase();

    if (!file) {
      return NextResponse.json({ error: 'কোনো ফাইল নির্বাচন করা হয়নি।' }, { status: 400 });
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|svg|gif)$/i.test(file.name);

    if (!isPdf && !isImage) {
      return NextResponse.json({ error: 'শুধুমাত্র PDF অথবা ছবি (JPG, PNG, WEBP, SVG) ফাইল অনুমোদিত।' }, { status: 400 });
    }

    const maxBytes = isPdf ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'ফাইলের আকার অতিরিক্ত বড়।' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let subfolder = 'uploads';
    if (isPdf || uploadType === 'pdf') {
      subfolder = 'pdfs';
    } else if (uploadType === 'logo') {
      subfolder = 'uploads/logos';
    } else {
      subfolder = 'uploads/circulars';
    }

    const targetDir = path.join(process.cwd(), 'public', subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeBaseName = file.name
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._\-\u0980-\u09FF]/g, '');
    const uniqueFileName = `${Date.now()}_${safeBaseName}`;
    const targetFilePath = path.join(targetDir, uniqueFileName);

    fs.writeFileSync(targetFilePath, buffer);

    const publicUrl = `/${subfolder}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      message: 'ফাইল সফলভাবে আপলোড হয়েছে',
      url: publicUrl,
      filename: uniqueFileName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'ফাইল আপলোডে ত্রুটি হয়েছে' }, { status: 500 });
  }
}
