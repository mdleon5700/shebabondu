import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase();

  let candidates = serverDB.getAllCandidates();
  if (search) {
    candidates = candidates.filter(c => 
      c.name.toLowerCase().includes(search) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search)) ||
      (c.district && c.district.toLowerCase().includes(search))
    );
  }

  // Mask sensitive NID and password hashes for data protection
  const safeCandidates = candidates.map(c => {
    const { passwordHash, ...rest } = c;
    const docs = serverDB.getDocuments(c.id);
    return {
      ...rest,
      documents: docs,
      customDocuments: docs.filter(d => d.type === 'custom' || d.category || (!['photo', 'signature', 'nid_front', 'nid_back', 'father_nid', 'mother_nid', 'nagorik_certificate', 'birth_certificate', 'character_certificate', 'quota_certificate'].includes(d.type))),
      nid: rest.nid || ''
    };
  });

  return NextResponse.json({ success: true, candidates: safeCandidates, total: safeCandidates.length }, {
    headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
  });
}
