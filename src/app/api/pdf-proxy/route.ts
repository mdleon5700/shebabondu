import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';

export const dynamic = 'force-dynamic';

if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    const pdfBuffer = await fetchPdfDirect(targetUrl);

    if (!pdfBuffer || pdfBuffer.length < 5) {
      return new NextResponse('Empty PDF response', { status: 404 });
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="official-circular.pdf"',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return new NextResponse(`PDF Proxy Error: ${err.message}`, { status: 502 });
  }
}

async function fetchPdfDirect(url: string, redirectHops = 0): Promise<Buffer> {
  if (redirectHops > 5) {
    throw new Error(`Too many redirects fetching PDF: ${url}`);
  }

  const parsed = new URL(url);
  const isHttps = parsed.protocol === 'https:';
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(url, {
      agent: isHttps ? insecureHttpsAgent : undefined,
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*;q=0.9'
      },
      timeout: 20000
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        return resolve(fetchPdfDirect(redirectUrl, redirectHops + 1));
      }

      if (res.statusCode && res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} from source`));
      }

      const chunks: Buffer[] = [];
      res.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout from ${url}`));
    });
  });
}
