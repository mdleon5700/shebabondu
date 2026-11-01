import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { storage } from '@/lib/store';
import { JobCircular } from '@/lib/types';

export async function POST(req: Request) {
  const session = getServerSession(req);
  
  try {
    const body = await req.json();
    let job: JobCircular | undefined | null = body.job;
    if (!job && body.jobId) {
      job = serverDB.getJobById(body.jobId);
    }
    if (!job || !job.id) {
      return NextResponse.json({ error: 'সঠিক সার্কুলার তথ্য পাওয়া যায়নি' }, { status: 400 });
    }

    let candidate = null;
    let docs: any[] = [];

    if (body.candidate || body.customProfile) {
      // 1. Explicit Candidate / Guest Simulator Input (Supports Guest & Admin Custom Simulations)
      candidate = body.candidate || body.customProfile;
      docs = body.documents || [];
    } else if (session) {
      // 2. Authenticated Session Candidate
      if (session.role === 'admin' && body.candidateId) {
        candidate = serverDB.getCandidateById(body.candidateId);
      } else {
        candidate = serverDB.getCandidateById(session.candidateId);
      }
      if (candidate) {
        docs = serverDB.getDocuments(candidate.id || session.candidateId);
      }
    }

    if (!candidate) {
      return NextResponse.json({ 
        error: 'অনুগ্রহ করে প্রার্থীর তথ্য (বয়স, শিক্ষাগত যোগ্যতা, জেলা) প্রদান করুন অথবা লগইন করুন।' 
      }, { status: 400 });
    }

    const evaluation = storage.checkEligibility(candidate, job, docs);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      candidateId: candidate.id || 'GUEST-SIMULATOR',
      candidateName: (candidate as any).name || (candidate as any).fullName || 'অতিথি চাকরিপ্রার্থী (Guest)',
      jobTitle: job.title,
      organization: job.organization,
      evaluation,
      evaluatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
