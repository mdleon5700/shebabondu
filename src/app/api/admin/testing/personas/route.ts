import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { SyntheticUserManager } from '@/lib/testing/synthetic/synthetic-user-manager';
import { BD_64_DISTRICTS } from '@/lib/testing/synthetic/bangladesh-geography';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const district = searchParams.get('district');
  const division = searchParams.get('division');
  const archetype = searchParams.get('archetype');
  const quota = searchParams.get('quota');
  const search = searchParams.get('search')?.toLowerCase().trim();
  const summaryOnly = searchParams.get('summary') === 'true';

  const summary = SyntheticUserManager.getDemographicSummary();
  const isolation = SyntheticUserManager.verifyDataIsolation();

  if (summaryOnly) {
    return NextResponse.json({
      success: true,
      summary,
    districtBatchAudit: SyntheticUserManager.getDistrictBatchAudit(),
      educationSummary: SyntheticUserManager.getEducationAuditSummary(),
      isolation,
      districts: BD_64_DISTRICTS.map(d => ({ en: d.en, bn: d.bn, divisionEn: d.divisionEn, divisionBn: d.divisionBn }))
    });
  }

  let users = SyntheticUserManager.getAllSyntheticUsers();

  if (district) {
    users = users.filter(u => u.district.trim() === district.trim() || u.districtCode.toUpperCase() === district.toUpperCase());
  }

  if (division) {
    users = users.filter(u => u.division?.trim() === division.trim());
  }

  if (archetype) {
    users = users.filter(u => u.archetype === archetype);
  }

  if (quota) {
    users = users.filter(u => (u.quota || 'none') === quota);
  }

  if (search) {
    users = users.filter(u => 
      u.name.toLowerCase().includes(search) || 
      u.nameBn.includes(search) || 
      u.phone.includes(search) || 
      u.id?.toLowerCase().includes(search)
    );
  }

  const totalMatches = users.length;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = (page - 1) * limit;
  const paginated = users.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    totalMatches,
    page,
    limit,
    totalPages: Math.ceil(totalMatches / limit),
    summary,
    districtBatchAudit: SyntheticUserManager.getDistrictBatchAudit(),
    isolation,
    users: paginated
  });
}