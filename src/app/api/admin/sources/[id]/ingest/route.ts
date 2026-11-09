import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { 
  normalizeCircularNotice, 
  ingestDiscoveredCandidates, 
  NormalizedCircularCandidate, 
  RawDiscoveredNotice,
  scrapeSingleSource 
} from '@/lib/collector';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // 1. Enforce Server-Side Admin Authentication
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const source = serverDB.getJobSourceById(params.id);
    if (!source) {
      return NextResponse.json({ error: `NOT_FOUND: সোর্স "${params.id}" পাওয়া যায়নি।` }, { status: 404 });
    }

    if (source.enabled === false) {
      return NextResponse.json({ error: `FORBIDDEN: সোর্স "${source.name}" বর্তমানে স্থগিত (paused) রয়েছে।` }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const rawCandidates: RawDiscoveredNotice[] = Array.isArray(body?.candidates) ? body.candidates : [];

    // Mode A: If raw candidates were supplied in payload, validate and ingest directly
    if (rawCandidates.length > 0) {
      const validatedCandidates: NormalizedCircularCandidate[] = [];
      const validationErrors: string[] = [];

      for (const raw of rawCandidates) {
        const norm = normalizeCircularNotice(raw, source);
        if (norm.valid && norm.candidate) {
          validatedCandidates.push(norm.candidate);
        } else {
          validationErrors.push(`"${raw.title || 'Unknown'}": ${norm.errors.join(', ')}`);
        }
      }

      if (validatedCandidates.length === 0) {
        return NextResponse.json({
          error: 'VALIDATION_ERROR: প্রদত্ত সকল সার্কুলার যাচাইকরণে ব্যর্থ হয়েছে।',
          details: validationErrors
        }, { status: 400 });
      }

      const ingestionReport = ingestDiscoveredCandidates(validatedCandidates, session.candidateId);
      return NextResponse.json({
        success: true,
        report: ingestionReport,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined
      });
    }

    // Mode B: "Scrape Now / এখনই স্ক্র্যাপ করুন" automated scrape execution
    const scrapeResult = await scrapeSingleSource(params.id, session.candidateId);

    if (!scrapeResult.success) {
      return NextResponse.json({ 
        error: scrapeResult.error || 'স্ক্র্যাপিং ব্যর্থ হয়েছে।' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      liveCollected: true,
      report: {
        totalDiscovered: scrapeResult.discoveredCount,
        newDraftsCreated: scrapeResult.newDraftsCreated,
        updatesDetected: scrapeResult.updatesDetected,
        duplicatesIgnored: scrapeResult.duplicatesIgnored,
        durationMs: scrapeResult.durationMs
      }
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message || 'খসড়া কিউতে সার্কুলার ইম্পোর্ট ব্যর্থ হয়েছে।' 
    }, { status: 500 });
  }
}
