import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const jobId = params.id;
  const job = serverDB.getPublicJobById(jobId);

  if (!job) {
    return NextResponse.json({ error: 'বিজ্ঞপ্তি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
  }

  // 1. Check local file in public/pdfs/<jobId>.pdf
  const localPdfPath = path.join(process.cwd(), 'public', 'pdfs', `${jobId}.pdf`);
  if (fs.existsSync(localPdfPath)) {
    try {
      const fileBuffer = fs.readFileSync(localPdfPath);
      const safeOrg = (job.organization || 'ChakriSheba').replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, '_');
      const filename = `${safeOrg}_Circular_${jobId}.pdf`;

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
        }
      });
    } catch (err: any) {
      console.error(`[Download-API] Error reading local PDF:`, err.message);
    }
  }

  // 2. Check if job has a circularPdfUrl or pdfUrl pointing to a local relative path
  const targetPdf = job.circularPdfUrl || (job as any).pdfUrl;
  if (targetPdf && typeof targetPdf === 'string' && targetPdf.startsWith('/pdfs/')) {
    const cleanRel = targetPdf.replace(/^\/+/, '');
    const altLocal = path.join(process.cwd(), 'public', cleanRel);
    if (fs.existsSync(altLocal)) {
      const fileBuffer = fs.readFileSync(altLocal);
      const safeOrg = (job.organization || 'ChakriSheba').replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, '_');
      const filename = `${safeOrg}_Circular_${jobId}.pdf`;

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }
  }

  // 3. If remote URL, proxy-stream or redirect with proper attachment headers
  if (targetPdf && typeof targetPdf === 'string' && (targetPdf.startsWith('http://') || targetPdf.startsWith('https://'))) {
    try {
      return await new Promise<NextResponse>((resolve) => {
        const client = targetPdf.startsWith('https://') ? https : http;
        const request = client.get(
          targetPdf,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/pdf,application/octet-stream,*/*'
            },
            timeout: 10000
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              const chunks: Buffer[] = [];
              res.on('data', (c) => chunks.push(c));
              res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const safeOrg = (job.organization || 'ChakriSheba').replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, '_');
                const filename = `${safeOrg}_Circular_${jobId}.pdf`;
                resolve(
                  new NextResponse(buffer, {
                    status: 200,
                    headers: {
                      'Content-Type': 'application/pdf',
                      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                      'Content-Length': buffer.length.toString()
                    }
                  })
                );
              });
            } else {
              resolve(NextResponse.redirect(targetPdf));
            }
          }
        );
        request.on('error', () => {
          resolve(NextResponse.redirect(job.officialLink || targetPdf));
        });
      });
    } catch {
      return NextResponse.redirect(targetPdf);
    }
  }

  // 4. Fallback: If no PDF is bound yet, redirect to official portal application link
  if (job.officialLink) {
    return NextResponse.redirect(job.officialLink);
  }

  return NextResponse.json({ error: 'এই বিজ্ঞপ্তির কোনো অফিশিয়াল PDF ফাইল পাওয়া যায়নি।' }, { status: 404 });
}
