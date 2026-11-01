const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "src", "lib", "db.ts");
let content = fs.readFileSync(dbPath, "utf8");

if (!content.includes("getAllCandidates():")) {
  const methods = `
  // Candidate Management (Admin)
  getAllCandidates(): CandidateRecord[] {
    const db = loadDB();
    return Object.values(db.candidates).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAllApplications(): ApplicationRequest[] {
    const db = loadDB();
    const all: ApplicationRequest[] = [];
    for (const list of Object.values(db.applications)) {
      if (Array.isArray(list)) all.push(...list);
    }
    return all.sort((a, b) => (b.id > a.id ? 1 : -1));
  },

  updateCandidateStatus(id: string, status: 'active' | 'suspended', reason: string, adminId = 'ADMIN'): CandidateRecord | null {
    const db = loadDB();
    const candidate = db.candidates[id];
    if (!candidate) return null;
    candidate.maritalStatus = (status === 'suspended' ? 'other' : 'single') as any; // safe flag or custom field
    candidate.updatedAt = new Date().toISOString();
    db.candidates[id] = candidate;
    saveDB(db);

    this.recordAdminAudit({
      adminId,
      action: 'candidate_status_update' as any,
      targetId: id,
      targetType: 'order' as any,
      changes: { status: { old: 'active', new: status } },
      notes: reason
    });
    return candidate;
  },

  // Job Circular Management
  getJobs(): JobCircular[] {
    const db = loadDB();
    const list = Object.values(db.jobs || {});
    if (list.length === 0) return [...mockJobs];
    return list;
  },

  getJobById(id: string): JobCircular | null {
    const db = loadDB();
    if (db.jobs && db.jobs[id]) return db.jobs[id];
    return mockJobs.find(j => j.id === id) || null;
  },

  saveJob(job: JobCircular, adminId = 'ADMIN'): JobCircular {
    const db = loadDB();
    if (!db.jobs) db.jobs = {};
    const exists = !!db.jobs[job.id];
    db.jobs[job.id] = job;
    saveDB(db);

    this.recordAdminAudit({
      adminId,
      action: (exists ? 'job_edit' : 'job_publish') as any,
      targetId: job.id,
      targetType: 'order' as any,
      changes: { job: { new: job.title } },
      notes: \`Job circular \${exists ? 'updated' : 'published'}: \${job.title}\`
    });
    return job;
  },

  deleteJob(id: string, adminId = 'ADMIN'): boolean {
    const db = loadDB();
    if (!db.jobs || !db.jobs[id]) return false;
    const title = db.jobs[id].title;
    delete db.jobs[id];
    saveDB(db);

    this.recordAdminAudit({
      adminId,
      action: 'job_delete' as any,
      targetId: id,
      targetType: 'order' as any,
      changes: { job: { old: title } },
      notes: \`Job deleted: \${title}\`
    });
    return true;
  },

  // Website Builder (Pages & Revisions)
  getPages(): PageRecord[] {
    const db = loadDB();
    return Object.values(db.pages || {});
  },

  getPageById(id: string): PageRecord | null {
    const db = loadDB();
    return (db.pages && db.pages[id]) || null;
  },

  savePage(page: PageRecord, adminId = 'ADMIN', isPublish = false): PageRecord {
    const db = loadDB();
    if (!db.pages) db.pages = {};
    const existing = db.pages[page.id];
    const now = new Date().toISOString();
    const newVersion = (existing ? existing.version : 0) + 1;

    // Snapshot revision
    const revision = {
      id: 'REV-' + Date.now(),
      version: newVersion,
      savedAt: now,
      savedBy: adminId,
      status: isPublish ? ('published' as const) : ('draft' as const),
      sections: JSON.parse(JSON.stringify(page.sections || []))
    };

    const pastRevisions = existing ? (existing.revisions || []).slice(0, 9) : [];
    const updatedPage: PageRecord = {
      ...page,
      version: newVersion,
      status: isPublish ? 'published' : (page.status || 'draft'),
      updatedAt: now,
      publishedAt: isPublish ? now : (existing ? existing.publishedAt : undefined),
      revisions: [revision, ...pastRevisions]
    };

    db.pages[page.id] = updatedPage;
    saveDB(db);

    this.recordAdminAudit({
      adminId,
      action: (isPublish ? 'page_publish' : 'page_save') as any,
      targetId: page.id,
      targetType: 'order' as any,
      changes: { version: { old: existing?.version, new: newVersion } },
      notes: \`Page \${page.title} \${isPublish ? 'published' : 'saved as draft'}\`
    });
    return updatedPage;
  },

  deletePage(id: string, adminId = 'ADMIN'): { success: boolean; error?: string } {
    const db = loadDB();
    if (!db.pages || !db.pages[id]) return { success: false, error: 'পৃষ্ঠা পাওয়া যায়নি' };
    if (db.pages[id].isSystemPage) {
      return { success: false, error: 'সিস্টেম বা জরুরি মূল পৃষ্ঠা ডিলিট করা নিষিদ্ধ!' };
    }
    const title = db.pages[id].title;
    delete db.pages[id];
    saveDB(db);

    this.recordAdminAudit({
      adminId,
      action: 'page_delete' as any,
      targetId: id,
      targetType: 'order' as any,
      changes: { page: { old: title } },
      notes: \`Page deleted: \${title}\`
    });
    return { success: true };
  },

  restorePageRevision(pageId: string, revisionId: string, adminId = 'ADMIN'): PageRecord | null {
    const db = loadDB();
    if (!db.pages || !db.pages[pageId]) return null;
    const page = db.pages[pageId];
    const targetRev = (page.revisions || []).find(r => r.id === revisionId);
    if (!targetRev) return null;

    page.sections = JSON.parse(JSON.stringify(targetRev.sections));
    page.version += 1;
    page.updatedAt = new Date().toISOString();
    db.pages[pageId] = page;
    saveDB(db);

    this.recordAdminAudit({
      adminId,
      action: 'page_rollback' as any,
      targetId: pageId,
      targetType: 'order' as any,
      changes: { revisionRestored: { new: revisionId, targetVersion: targetRev.version } },
      notes: \`Restored page \${page.title} to revision v\${targetRev.version}\`
    });
    return page;
  },

  // Job Sources & Circular Ingestion Pipeline
  getJobSources(): JobSource[] {
    const db = loadDB();
    return Object.values(db.jobSources || {});
  },

  getCircularDrafts(): CircularDraft[] {
    const db = loadDB();
    return Object.values(db.circularDrafts || {}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addCircularDraft(draft: CircularDraft): CircularDraft {
    const db = loadDB();
    if (!db.circularDrafts) db.circularDrafts = {};
    db.circularDrafts[draft.id] = draft;
    saveDB(db);
    return draft;
  },

  approveCircularDraft(draftId: string, adminId = 'ADMIN'): JobCircular | null {
    const db = loadDB();
    const draft = (db.circularDrafts || {})[draftId];
    if (!draft) return null;

    draft.status = 'approved';
    const newJobId = 'job-' + Date.now().toString().slice(-6);
    const newJob: JobCircular = {
      id: newJobId,
      title: draft.extractedTitle,
      organization: draft.extractedOrg,
      logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
      category: draft.category || 'govt',
      categoryLabel: draft.category === 'bank' ? 'ব্যাংক জব' : 'সরকারি চাকরি',
      grade: draft.grade || '৯ম গ্রেড',
      totalPosts: draft.vacancies || 1,
      salary: draft.salary || '২২,০০০ - ৫৩,০৬০ টাকা',
      minEducation: draft.minEducation || 'স্নাতক বা সমমান',
      minAge: 21,
      maxAge: 32,
      districts: 'সকল জেলা',
      deadline: draft.deadline || '৩০ নভেম্বর ২০২৬',
      daysRemaining: 20,
      govtFee: draft.govtFee || 200,
      serviceFee: 80,
      officialLink: draft.sourceUrl || 'https://alljobs.teletalk.com.bd',
      circularImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      audioSummary: draft.extractedTitle + ' প্রকাশিত হয়েছে।',
      publishedDate: new Date().toLocaleDateString('bn-BD'),
      requirements: [draft.minEducation, 'বয়স: ২১-৩২ বছর']
    };

    if (!db.jobs) db.jobs = {};
    db.jobs[newJobId] = newJob;
    saveDB(db);

    this.recordAdminAudit({
      adminId,
      action: 'source_approval' as any,
      targetId: draftId,
      targetType: 'order' as any,
      changes: { draftId, createdJobId: newJobId },
      notes: \`Approved draft into live job: \${newJob.title}\`
    });
    return newJob;
  },

  rejectCircularDraft(draftId: string, adminId = 'ADMIN'): boolean {
    const db = loadDB();
    const draft = (db.circularDrafts || {})[draftId];
    if (!draft) return false;
    draft.status = 'rejected';
    saveDB(db);

    this.recordAdminAudit({
      adminId,
      action: 'source_rejection' as any,
      targetId: draftId,
      targetType: 'order' as any,
      changes: { draftId, status: 'rejected' },
      notes: \`Rejected draft circular: \${draft.extractedTitle}\`
    });
    return true;
  },

  // Private Company / Employer ATS
  getCompanies(): CompanyProfile[] {
    const db = loadDB();
    return Object.values(db.companies || {});
  },

  getCompanyApplications(companyId: string): CompanyApplication[] {
    const db = loadDB();
    return (db.companyApplications && db.companyApplications[companyId]) || [];
  },

  updateCompanyApplicationStatus(companyId: string, appId: string, status: CompanyApplication['status'], notes?: string): boolean {
    const db = loadDB();
    if (!db.companyApplications || !db.companyApplications[companyId]) return false;
    const list = db.companyApplications[companyId];
    const app = list.find(a => a.id === appId);
    if (!app) return false;
    app.status = status;
    if (notes) app.notes = notes;
    saveDB(db);
    return true;
  },
`;

  content = content.replace(
    /recordAdminAudit\(audit: Omit<AdminAuditLog, \x27id\x27 \| \x27timestamp\x27>\): AdminAuditLog \{/,
    methods + "\n  recordAdminAudit(audit: Omit<AdminAuditLog, 'id' | 'timestamp'>): AdminAuditLog {"
  );

  fs.writeFileSync(dbPath, content, "utf8");
  console.log("Appended serverDB methods successfully");
} else {
  console.log("serverDB methods already present");
}
