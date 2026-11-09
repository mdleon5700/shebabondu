import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      jobId, 
      jobTitle, 
      jobUrl, 
      issueType, 
      issueLabel, 
      details, 
      reporterName, 
      reporterPhone, 
      reporterEmail 
    } = body;

    if (!jobTitle || !jobTitle.trim()) {
      return NextResponse.json({ error: 'বিজ্ঞপ্তির নাম বা লিঙ্ক প্রদান করা আবশ্যক।' }, { status: 400 });
    }

    if (!details || !details.trim()) {
      return NextResponse.json({ error: 'অভিযোগ বা সমস্যার বিস্তারিত বিবরণ আবশ্যক।' }, { status: 400 });
    }

    // Try resolving reporter from session if available
    let resolvedName = reporterName;
    let resolvedPhone = reporterPhone;
    let resolvedEmail = reporterEmail;

    const session = getServerSession(req);
    if (session && session.candidateId) {
      const candidate = serverDB.getCandidateById(session.candidateId);
      if (candidate) {
        resolvedName = resolvedName || candidate.nameBn || candidate.name;
        resolvedPhone = resolvedPhone || candidate.phone;
        resolvedEmail = resolvedEmail || candidate.email;
      }
    }

    const report = serverDB.createJobReport({
      jobId: jobId || undefined,
      jobTitle: jobTitle.trim(),
      jobUrl: jobUrl || undefined,
      issueType: issueType || 'other',
      issueLabel: issueLabel || 'সাধারণ অভিযোগ',
      details: details.trim(),
      reporterName: resolvedName?.trim() || 'বেনামী চাকরিপ্রার্থী',
      reporterPhone: resolvedPhone?.trim() || undefined,
      reporterEmail: resolvedEmail?.trim() || undefined
    });

    return NextResponse.json({
      success: true,
      report,
      trackingCode: report.id,
      message: `আপনার অভিযোগটি সফলভাবে গ্রহণ করা হয়েছে। ট্র্যাকিং রেফারেন্স নম্বর: ${report.id}। আমাদের টিম দ্রুত যাচাই করবে।`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'অভিযোগ প্রক্রিয়াকরণে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingCode = searchParams.get('id') || searchParams.get('trackingCode');

    if (trackingCode) {
      const report = serverDB.getJobReportById(trackingCode.trim());
      if (!report) {
        return NextResponse.json({ error: 'এই ট্র্যাকিং নম্বরের কোনো অভিযোগ পাওয়া যায়নি।' }, { status: 404 });
      }
      return NextResponse.json({ success: true, report });
    }

    // List recent public audit resolved/investigating reports for transparency
    const all = serverDB.getJobReports();
    return NextResponse.json({
      success: true,
      total: all.length,
      reports: all.slice(0, 10)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

