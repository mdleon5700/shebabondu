import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { CompanyProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const district = searchParams.get('district');
  const verified = searchParams.get('verified');
  const orgType = searchParams.get('type');

  let companies = serverDB.getCompanies();

  // Attach real-time associated jobs count
  const allJobs = serverDB.getJobs();
  companies = companies.map(comp => {
    const matchingJobs = allJobs.filter(j => 
      j.organization.toLowerCase() === comp.name.toLowerCase() ||
      (comp.nameBn && j.organization.toLowerCase() === comp.nameBn.toLowerCase())
    );
    return {
      ...comp,
      activeJobsCount: matchingJobs.length
    };
  });

  if (q) {
    companies = companies.filter(c => 
      c.name.toLowerCase().includes(q) ||
      (c.nameBn && c.nameBn.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.district && c.district.toLowerCase().includes(q))
    );
  }

  if (district && district !== 'all') {
    companies = companies.filter(c => c.district === district);
  }

  if (verified && verified !== 'all') {
    companies = companies.filter(c => String(c.verified) === verified);
  }

  if (orgType && orgType !== 'all') {
    companies = companies.filter(c => c.organizationType === orgType);
  }

  return NextResponse.json({
    success: true,
    total: companies.length,
    companies
  });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, nameBn, industry, district, division, website, logo, description, address, contactEmail, contactPhone, organizationType, verified } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'প্রতিষ্ঠানের নাম আবশ্যক' }, { status: 400 });
    }

    // Duplicate Prevention Check
    const existingCompanies = serverDB.getCompanies();
    const normalizedNew = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isDuplicate = existingCompanies.some(c => {
      const normExisting = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchName = normExisting === normalizedNew;
      const matchWebsite = website && c.website && c.website.toLowerCase().trim() === website.toLowerCase().trim();
      return matchName || matchWebsite;
    });

    if (isDuplicate) {
      return NextResponse.json({
        error: 'একই নাম অথবা ওয়েবসাইটের প্রতিষ্ঠান ইতিমধ্যে সিস্টেমে বিদ্যমান রয়েছে।'
      }, { status: 409 });
    }

    const created = serverDB.createCompany({
      name: name.trim(),
      nameBn: (nameBn || name).trim(),
      industry: industry || 'সরকারি / মন্ত্রণালয়',
      district: district || 'ঢাকা',
      division: division || 'Dhaka',
      website: website ? website.trim() : '',
      logo: logo ? logo.trim() : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
      description: description ? description.trim() : '',
      address: address ? address.trim() : '',
      contactEmail: contactEmail ? contactEmail.trim() : '',
      contactPhone: contactPhone ? contactPhone.trim() : '',
      organizationType: organizationType || 'government',
      verified: Boolean(verified),
      status: 'active'
    });

    return NextResponse.json({
      success: true,
      message: 'নতুন প্রতিষ্ঠান সফলভাবে তৈরি করা হয়েছে।',
      company: created
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'প্রতিষ্ঠান তৈরিতে ব্যর্থ' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const companyId = body.companyId || body.id;

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }

    const updates: Partial<CompanyProfile> = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.nameBn !== undefined) updates.nameBn = String(body.nameBn).trim();
    if (body.industry !== undefined) updates.industry = String(body.industry).trim();
    if (body.district !== undefined) updates.district = String(body.district).trim();
    if (body.division !== undefined) updates.division = String(body.division).trim();
    if (body.website !== undefined) updates.website = String(body.website).trim();
    if (body.logo !== undefined) updates.logo = String(body.logo).trim();
    if (body.description !== undefined) updates.description = String(body.description).trim();
    if (body.address !== undefined) updates.address = String(body.address).trim();
    if (body.contactEmail !== undefined) updates.contactEmail = String(body.contactEmail).trim();
    if (body.contactPhone !== undefined) updates.contactPhone = String(body.contactPhone).trim();
    if (body.organizationType !== undefined) updates.organizationType = body.organizationType;
    if (body.status !== undefined) updates.status = body.status;
    if (body.verified !== undefined) updates.verified = Boolean(body.verified);

    const updated = serverDB.updateCompany(companyId, updates, session.candidateId || 'ADMIN-SUPER');
    if (!updated) {
      return NextResponse.json({ error: 'প্রতিষ্ঠান খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'প্রতিষ্ঠানের বিবরণ সফলভাবে হালনাগাদ করা হয়েছে।',
      company: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
  }

  const company = serverDB.getCompanyById(id);
  if (!company) {
    return NextResponse.json({ error: 'প্রতিষ্ঠান খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }

  // Check associated jobs
  const allJobs = serverDB.getJobs();
  const relatedJobs = allJobs.filter(j => 
    j.organization.toLowerCase() === company.name.toLowerCase() ||
    (company.nameBn && j.organization.toLowerCase() === company.nameBn.toLowerCase())
  );

  if (relatedJobs.length > 0) {
    return NextResponse.json({
      error: `এই প্রতিষ্ঠানের অধীনে ${relatedJobs.length}টি সক্রিয় চাকরি রয়েছে। চাকরিগুলি অন্য প্রতিষ্ঠানে রিঅ্যাসাইন না করে প্রতিষ্ঠানটি মুছে ফেলা যাবে না।`
    }, { status: 400 });
  }

  serverDB.deleteCompany(id, session.candidateId || 'ADMIN-SUPER');

  return NextResponse.json({
    success: true,
    message: 'প্রতিষ্ঠান সফলভাবে মুছে ফেলা হয়েছে।'
  });
}
