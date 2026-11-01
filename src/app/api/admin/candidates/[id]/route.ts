import { NextResponse } from 'next/server';
import { getServerSession, hashPassword } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { CandidateProfile } from '@/lib/types';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const candidate = serverDB.getCandidateById(params.id);
  if (!candidate) {
    return NextResponse.json({ error: 'প্রার্থী পাওয়া যায়নি' }, { status: 404 });
  }

  const documents = serverDB.getDocuments(params.id) || [];
  const applications = serverDB.getApplications(params.id) || [];
  
  // Fetch Saved Jobs
  const savedJobIds = serverDB.getSavedJobs(params.id) || [];
  const allJobs = serverDB.getJobs();
  const savedJobs = allJobs.filter(j => savedJobIds.includes(j.id));

  // Fetch Notifications History
  const notifications = serverDB.getCandidateNotifications(params.id) || [];

  const { passwordHash, ...safeCandidate } = candidate;

  return NextResponse.json({
    success: true,
    candidate: safeCandidate,
    documents,
    applications,
    savedJobs,
    notifications
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const candidate = serverDB.getCandidateById(params.id);
    if (!candidate) {
      return NextResponse.json({ error: 'প্রার্থী পাওয়া যায়নি' }, { status: 404 });
    }

    const updates: Partial<CandidateProfile> & { passwordHash?: string } = {};

    // 1. Basic & Personal Information
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.nameBn !== undefined) updates.nameBn = String(body.nameBn).trim();
    if (body.fatherName !== undefined) updates.fatherName = String(body.fatherName).trim();
    if (body.motherName !== undefined) updates.motherName = String(body.motherName).trim();
    if (body.fatherNameBn !== undefined) updates.fatherNameBn = String(body.fatherNameBn).trim();
    if (body.motherNameBn !== undefined) updates.motherNameBn = String(body.motherNameBn).trim();
    
    // Phone validation
    if (body.phone !== undefined) {
      const p = String(body.phone).trim();
      if (p.length < 11) {
        return NextResponse.json({ error: 'ফোন নম্বরটি সঠিক নয় (ন্যূনতম ১১ ডিজিট)।' }, { status: 400 });
      }
      updates.phone = p;
    }

    // Email validation
    if (body.email !== undefined) {
      const em = String(body.email).trim().toLowerCase();
      if (!em.includes('@') || !em.includes('.')) {
        return NextResponse.json({ error: 'ইমেইল অ্যাড্রেসটি সঠিক নয়।' }, { status: 400 });
      }
      updates.email = em;
    }

    if (body.dob !== undefined) updates.dob = String(body.dob).trim();
    if (body.gender !== undefined) updates.gender = body.gender;
    if (body.nid !== undefined) updates.nid = String(body.nid).trim();
    if (body.district !== undefined) updates.district = String(body.district).trim();
    if (body.division !== undefined) updates.division = String(body.division).trim();
    if (body.address !== undefined) updates.address = String(body.address).trim();
    if (body.permanentAddress !== undefined) updates.permanentAddress = String(body.permanentAddress).trim();
    if (body.maritalStatus !== undefined) updates.maritalStatus = body.maritalStatus;
    if (body.nationality !== undefined) updates.nationality = String(body.nationality).trim();
    if (body.quota !== undefined) updates.quota = body.quota;
    if (body.photoUrl !== undefined) updates.photoUrl = String(body.photoUrl).trim();
    if (body.signatureUrl !== undefined) updates.signatureUrl = String(body.signatureUrl).trim();
    if (body.quotaCertificateUrl !== undefined) updates.quotaCertificateUrl = String(body.quotaCertificateUrl).trim();

    // 2. Professional Profile
    if (body.careerObjective !== undefined) updates.careerObjective = String(body.careerObjective).trim();
    if (body.professionalSummary !== undefined) updates.professionalSummary = String(body.professionalSummary).trim();
    if (body.currentPosition !== undefined) updates.currentPosition = String(body.currentPosition).trim();
    if (body.currentOrganization !== undefined) updates.currentOrganization = String(body.currentOrganization).trim();
    if (body.expectedSalary !== undefined) updates.expectedSalary = String(body.expectedSalary).trim();

    // 3. Education, Experience, Skills & Preferences
    if (Array.isArray(body.education)) {
      updates.education = body.education;
    }
    if (Array.isArray(body.experiences)) {
      updates.experiences = body.experiences;
    }
    if (Array.isArray(body.skills)) {
      updates.skills = body.skills.map((s: string) => String(s).trim()).filter(Boolean);
    }
    if (Array.isArray(body.languages)) {
      updates.languages = body.languages.map((l: string) => String(l).trim()).filter(Boolean);
    }
    if (body.careerPreferences && typeof body.careerPreferences === 'object') {
      updates.careerPreferences = body.careerPreferences;
    }

    // 4. Account Status & Verification
    if (body.status !== undefined) {
      updates.accountStatus = body.status;
      (updates as any).status = body.status;
    }
    if (body.accountStatus !== undefined) {
      updates.accountStatus = body.accountStatus;
      (updates as any).status = body.accountStatus;
    }
    if (body.isVerified !== undefined) updates.isVerified = Boolean(body.isVerified);

    // 5. Password Reset
    if (body.newPassword && typeof body.newPassword === 'string' && body.newPassword.length >= 6) {
      updates.passwordHash = hashPassword(body.newPassword);
    }

    // 6. Private Admin Notes
    if (body.adminNote && typeof body.adminNote === 'string' && body.adminNote.trim()) {
      const newNote = {
        id: 'note-' + Date.now().toString().slice(-6),
        authorId: session.candidateId || 'ADMIN',
        authorName: 'সুপার অ্যাডমিন',
        text: body.adminNote.trim(),
        createdAt: new Date().toISOString()
      };
      const existingNotes = candidate.adminNotes || [];
      updates.adminNotes = [newNote, ...existingNotes];
    } else if (Array.isArray(body.adminNotes)) {
      updates.adminNotes = body.adminNotes;
    }

    const reason = body.reason || 'অ্যাডমিন কর্তৃক প্রার্থীর পূর্ণাঙ্গ প্রোফাইল হালনাগাদ';
    const updated = serverDB.updateCandidate(params.id, updates as any, session.candidateId, reason);
    
    if (!updated) {
      return NextResponse.json({ error: 'প্রার্থী আপডেট ব্যর্থ হয়েছে' }, { status: 500 });
    }

    // Record system audit log
    serverDB.recordAdminAudit({
      adminId: session.candidateId,
      action: 'candidate_status_update' as any,
      targetId: params.id,
      targetType: 'order' as any,
      changes: { profile: { new: updates } } as any,
      notes: reason
    });

    // In-app notification for candidate
    if (updates.accountStatus && updates.accountStatus !== candidate.accountStatus) {
      serverDB.addCandidateNotification(params.id, {
        title: updates.accountStatus === 'active' ? 'অ্যাকাউন্ট সক্রিয় করা হয়েছে' : 'অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন',
        message: updates.accountStatus === 'active'
          ? 'আপনার চাকরি সেবা অ্যাকাউন্টটি সফলভাবে সক্রিয় করা হয়েছে।'
          : `আপনার অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন করা হয়েছে (${updates.accountStatus})। কারণ: ${reason}`,
        type: 'system',
        link: '/dashboard'
      });
    } else if (updates.isVerified !== undefined && updates.isVerified !== candidate.isVerified) {
      serverDB.addCandidateNotification(params.id, {
        title: updates.isVerified ? 'প্রোফাইল ভেরিফিকেশন সম্পন্ন' : 'প্রোফাইল ভেরিফিকেশন আপডেট',
        message: updates.isVerified
          ? 'অভিনন্দন! আপনার চাকরি সেবা প্রোফাইলটি অ্যাডমিন কর্তৃক সফলভাবে ভেরিফাই করা হয়েছে।'
          : 'আপনার প্রোফাইল ভেরিফিকেশন স্ট্যাটাস পরিবর্তন করা হয়েছে।',
        type: 'system',
        link: '/dashboard/profile'
      });
    }

    const { passwordHash, ...safeCandidate } = updated;
    return NextResponse.json({ success: true, candidate: safeCandidate });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
