import { NextResponse } from 'next/server';
import { AdminGovernanceRbac } from '@/lib/governance';
import { CentralReportEngine } from '@/lib/reports/engine';
import { ReportGenerationFilterPayload } from '@/lib/reports/types';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'reports.export');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const catalog = CentralReportEngine.getCatalog();
    return NextResponse.json({
      success: true,
      catalog
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve report catalog' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'reports.export');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = (await req.json()) as ReportGenerationFilterPayload;
    const adminId = req.headers.get('x-admin-id') || 'ADMIN-SUPER';

    const report = CentralReportEngine.generateReport(body, adminId);

    if (body.format === 'csv' && report.csvPayload) {
      return new Response(report.csvPayload, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${report.reportId}_${report.reportType}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
