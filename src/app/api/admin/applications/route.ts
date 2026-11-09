import { NextResponse } from 'next/server';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { ApplicationRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const session = getServerSession(req);
  const adminSecret = req.headers.get('x-admin-secret');
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase().trim();

  let apps: ApplicationRequest[] = serverDB.getAllApplications();

  if (statusFilter && statusFilter !== 'all') {
    apps = apps.filter(a => a.status === statusFilter);
  }

  if (search) {
    apps = apps.filter(a =>
      a.id.toLowerCase().includes(search) ||
      a.candidateName.toLowerCase().includes(search) ||
      a.candidatePhone.includes(search) ||
      a.jobTitle.toLowerCase().includes(search) ||
      (a.trxId && a.trxId.toLowerCase().includes(search)) ||
      ((a as any).trackingNumber && (a as any).trackingNumber.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({
    success: true,
    applications: apps,
    totalCount: apps.length
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}
