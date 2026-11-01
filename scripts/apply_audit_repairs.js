const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\Leon Rahman\\Documents\\chakri-sheba';
console.log('--- Applying Full-System Integration Repairs ---');

// 1. PATCH src/lib/db.ts
{
  const dbPath = path.join(rootDir, 'src', 'lib', 'db.ts');
  let content = fs.readFileSync(dbPath, 'utf8');

  // 1.1 updateCandidate normalization
  if (!content.includes('// Normalize status and accountStatus')) {
    content = content.replace(
      /const existing = db\.candidates\[id\];\r?\n\s*if \(!existing\) return null;/,
      `const existing = db.candidates[id];
    if (!existing) return null;

    // Normalize status and accountStatus
    if ((updates as any).accountStatus && !(updates as any).status) {
      (updates as any).status = (updates as any).accountStatus;
    } else if ((updates as any).status && !(updates as any).accountStatus) {
      (updates as any).accountStatus = (updates as any).status;
    }`
    );
    console.log('[+] db.ts: updateCandidate normalization patched');
  }

  // 1.2 updateCandidateStatus fix
  if (content.includes("candidate.maritalStatus = (status === 'suspended' ? 'other' : 'single') as any; // safe flag or custom field")) {
    const bugLine = "candidate.maritalStatus = (status === 'suspended' ? 'other' : 'single') as any; // safe flag or custom field";
    const rep2 = `candidate.status = status as any;
    candidate.accountStatus = status;

    this.addCandidateNotification(id, {
      title: status === 'active' ? 'অ্যাকাউন্ট সক্রিয় হয়েছে' : 'অ্যাকাউন্ট স্থগিত করা হয়েছে',
      message: status === 'active'
        ? 'আপনার চাকরি সেবা অ্যাকাউন্টটি সফলভাবে সক্রিয় করা হয়েছে।'
        : \`আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। কারণ: \${reason}\`,
      type: 'system',
      link: '/dashboard'
    });`;
    content = content.replace(bugLine, rep2);
    console.log('[+] db.ts: updateCandidateStatus bug fixed and notification added');
  }

  // 1.3 updateAppStatus notification in admin loop
  if (!content.includes('statusMessages_app_update')) {
    content = content.replace(
      /saveDB\(db\);\r?\n\s*return found;\r?\n\s*\}\r?\n\s*\}\r?\n\s*\}\r?\n\s*return null;/,
      `saveDB(db);

            const statusMessages_app_update: Record<string, string> = {
              completed: 'আপনার আবেদনটি সম্পন্ন হয়েছে এবং প্রাপ্তি স্বীকারপত্র তৈরি হয়েছে।',
              processing: 'আপনার আবেদনটি যাচাইকরণ প্রক্রিয়ায় রয়েছে।',
              rejected: 'আবেদন তথ্য অসম্পূর্ণ বা অসামঞ্জস্যের কারণে বাতিল হয়েছে।'
            };
            if (statusMessages_app_update[status]) {
              this.addCandidateNotification(cid, {
                title: \`আবেদন স্ট্যাটাস: \${status === 'completed' ? 'সম্পন্ন' : status === 'processing' ? 'প্রক্রিয়াধীন' : 'বাতিল'}\`,
                message: \`\${(current as any)?.jobTitle || 'চাকরির আবেদন'}: \${statusMessages_app_update[status]}\`,
                type: 'application',
                link: '/dashboard/applications'
              });
            }

            return found;
          }
        }
      }
      return null;`
    );
    console.log('[+] db.ts: updateAppStatus notification added');
  }

  fs.writeFileSync(dbPath, content, 'utf8');
}

// 2. PATCH src/app/api/admin/notifications/send/route.ts
{
  const notifRoutePath = path.join(rootDir, 'src', 'app', 'api', 'admin', 'notifications', 'send', 'route.ts');
  let content = fs.readFileSync(notifRoutePath, 'utf8');

  if (!content.includes('actualCandidateId')) {
    const oldBlock = `    // Single Recipient Transactional Notice
    const targetCandidateId = candidateId || (recipientPhone ? ('USR-' + recipientPhone) : 'UNKNOWN');
    serverDB.enqueueNotificationDelivery({
      id: deliveryId,
      candidateId: targetCandidateId,
      jobId: 'DIRECT-ADMIN',
      jobTitle: 'অ্যাডমিন নোটিশ',
      organization: 'চাকরি সেবা',
      type: 'system',
      channel: deliveryChannel,
      title: title || 'চাকরি সেবা বার্তা',
      message: message.trim(),
      link: '/dashboard',
      status: 'DELIVERED',
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      read: false,
      dedupeKey: 'NOTIF-' + deliveryId
    });

    if (candidateId) {
      serverDB.addCandidateNotification(candidateId, {
        title: title || 'অ্যাডমিন জরুরি বিজ্ঞপ্তি',
        message: message.trim(),
        type: 'system',
        link: '/dashboard'
      });
    }`;

    const newBlock = `    // Single Recipient Transactional Notice
    let actualCandidateId = candidateId;
    if (!actualCandidateId && recipientPhone) {
      const foundCandidate = serverDB.getCandidateByPhone(recipientPhone);
      if (foundCandidate) {
        actualCandidateId = foundCandidate.id;
      }
    }
    const finalCandidateId = actualCandidateId || (recipientPhone ? ('USR-' + recipientPhone) : 'UNKNOWN');

    serverDB.enqueueNotificationDelivery({
      id: deliveryId,
      candidateId: finalCandidateId,
      jobId: 'DIRECT-ADMIN',
      jobTitle: 'অ্যাডমিন নোটিশ',
      organization: 'চাকরি সেবা',
      type: 'system',
      channel: deliveryChannel,
      title: title || 'চাকরি সেবা বার্তা',
      message: message.trim(),
      link: '/dashboard',
      status: 'DELIVERED',
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      read: false,
      dedupeKey: 'NOTIF-' + deliveryId
    });

    if (finalCandidateId && finalCandidateId !== 'UNKNOWN') {
      serverDB.addCandidateNotification(finalCandidateId, {
        title: title || 'অ্যাডমিন জরুরি বিজ্ঞপ্তি',
        message: message.trim(),
        type: 'system',
        link: '/dashboard'
      });
    }`;

    const normContent = content.replace(/\r\n/g, '\n');
    const normOld = oldBlock.replace(/\r\n/g, '\n');
    if (normContent.includes(normOld)) {
      content = normContent.replace(normOld, newBlock);
      fs.writeFileSync(notifRoutePath, content, 'utf8');
      console.log('[+] admin/notifications/send/route.ts patched');
    } else {
      console.warn('[-] admin/notifications/send/route.ts block not matched');
    }
  }
}

// 3. PATCH src/app/api/admin/candidates/[id]/route.ts
{
  const candRoutePath = path.join(rootDir, 'src', 'app', 'api', 'admin', 'candidates', '[id]', 'route.ts');
  let content = fs.readFileSync(candRoutePath, 'utf8');

  if (!content.includes('serverDB.addCandidateNotification(params.id')) {
    let normContent = content.replace(/\r\n/g, '\n');
    const oldStatusSync = `    // 4. Account Status & Verification
    if (body.status !== undefined) updates.accountStatus = body.status;
    if (body.accountStatus !== undefined) updates.accountStatus = body.accountStatus;
    if (body.isVerified !== undefined) updates.isVerified = Boolean(body.isVerified);`;

    const newStatusSync = `    // 4. Account Status & Verification
    if (body.status !== undefined) {
      updates.accountStatus = body.status;
      (updates as any).status = body.status;
    }
    if (body.accountStatus !== undefined) {
      updates.accountStatus = body.accountStatus;
      (updates as any).status = body.accountStatus;
    }
    if (body.isVerified !== undefined) updates.isVerified = Boolean(body.isVerified);`;

    const oldAuditCall = `    // Record system audit log
    serverDB.recordAdminAudit({
      adminId: session.candidateId,
      action: 'candidate_status_update' as any,
      targetId: params.id,
      targetType: 'order' as any,
      changes: { profile: { new: updates } } as any,
      notes: reason
    });`;

    const newAuditAndNotif = `    // Record system audit log
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
          : \`আপনার অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন করা হয়েছে (\${updates.accountStatus})। কারণ: \${reason}\`,
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
    }`;

    if (normContent.includes(oldStatusSync) && normContent.includes(oldAuditCall)) {
      normContent = normContent.replace(oldStatusSync, newStatusSync);
      normContent = normContent.replace(oldAuditCall, newAuditAndNotif);
      fs.writeFileSync(candRoutePath, normContent, 'utf8');
      console.log('[+] admin/candidates/[id]/route.ts patched');
    } else {
      console.warn('[-] admin/candidates/[id]/route.ts targets not found');
    }
  }
}

// 4. PATCH src/app/dashboard/profile/page.tsx
{
  const profPagePath = path.join(rootDir, 'src', 'app', 'dashboard', 'profile', 'page.tsx');
  let content = fs.readFileSync(profPagePath, 'utf8');
  let normContent = content.replace(/\r\n/g, '\n');

  // 4.1 Education ID generation
  const oldEduBlock = `    const newEdu: EducationRecord = {
      level: eduLevel,
      degree: eduDegree,
      boardOrUni: eduBoard || 'অন্যান্য',
      roll: eduRoll || 'N/A',
      reg: eduReg || 'N/A',
      year: eduYear,
      result: eduResult
    };`;

  const newEduBlock = `    const newEdu: EducationRecord = {
      id: 'EDU-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      level: eduLevel,
      degree: eduDegree,
      boardOrUni: eduBoard || 'অন্যান্য',
      roll: eduRoll || 'N/A',
      reg: eduReg || 'N/A',
      year: eduYear,
      result: eduResult
    };`;

  // 4.2 syncProfileToServer check
  const oldSyncBlock = `  const syncProfileToServer = async (p: CandidateProfile) => {
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
    } catch (err) {
      console.warn('Profile sync failed', err);
    }
  };`;

  const newSyncBlock = `  const syncProfileToServer = async (p: CandidateProfile) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) {
          storage.updateUser(data.profile);
        }
      }
    } catch (err) {
      console.warn('Profile sync failed', err);
    }
  };`;

  let changed = false;
  if (normContent.includes(oldEduBlock)) {
    normContent = normContent.replace(oldEduBlock, newEduBlock);
    changed = true;
    console.log('[+] dashboard/profile/page.tsx: education ID patched');
  }
  if (normContent.includes(oldSyncBlock)) {
    normContent = normContent.replace(oldSyncBlock, newSyncBlock);
    changed = true;
    console.log('[+] dashboard/profile/page.tsx: syncProfileToServer patched');
  }
  if (changed) {
    fs.writeFileSync(profPagePath, normContent, 'utf8');
  }
}

// 5. PATCH src/app/dashboard/page.tsx
{
  const dashPagePath = path.join(rootDir, 'src', 'app', 'dashboard', 'page.tsx');
  let content = fs.readFileSync(dashPagePath, 'utf8');
  let normContent = content.replace(/\r\n/g, '\n');

  if (!normContent.includes("fetch('/api/candidate/notifications')")) {
    const oldAppSync = `    // Live Server Sync
    fetch("/api/applications")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.applications && Array.isArray(data.applications)) {
          setApplications(data.applications);
        }
      })
      .catch(() => {});`;

    const newAppSync = `    // Live Server Sync
    fetch("/api/applications")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.applications && Array.isArray(data.applications)) {
          setApplications(data.applications);
        }
      })
      .catch(() => {});

    // Live Server Sync for profile
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.profile) {
          setProfile(data.profile);
          setCompletion(storage.calculateProfileCompletion(data.profile));
          storage.updateUser(data.profile);
        }
      })
      .catch(() => {});

    // Live Server Sync for notifications
    fetch('/api/candidate/notifications')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});

    // Live Server Sync for saved jobs
    fetch('/api/candidate/saved-jobs')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.savedJobs && Array.isArray(data.savedJobs)) {
          setSavedIds(data.savedJobs);
        }
      })
      .catch(() => {});`;

    if (normContent.includes(oldAppSync)) {
      normContent = normContent.replace(oldAppSync, newAppSync);
      fs.writeFileSync(dashPagePath, normContent, 'utf8');
      console.log('[+] dashboard/page.tsx: profile, notifs, saved-jobs live sync patched');
    } else {
      console.warn('[-] dashboard/page.tsx: oldAppSync not matched');
    }
  }
}

// 6. PATCH src/app/dashboard/layout.tsx
{
  const layoutPath = path.join(rootDir, 'src', 'app', 'dashboard', 'layout.tsx');
  let content = fs.readFileSync(layoutPath, 'utf8');
  let normContent = content.replace(/\r\n/g, '\n');

  if (!normContent.includes("fetch('/api/profile')")) {
    const oldMount = `    const user = storage.getUser();
    setProfile(user);
    setCompletion(storage.calculateProfileCompletion(user));`;

    const newMount = `    const user = storage.getUser();
    setProfile(user);
    setCompletion(storage.calculateProfileCompletion(user));

    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.profile) {
          storage.updateUser(data.profile);
          setProfile(data.profile);
          setCompletion(storage.calculateProfileCompletion(data.profile));
        }
      })
      .catch(() => {});`;

    if (normContent.includes(oldMount)) {
      normContent = normContent.replace(oldMount, newMount);
      fs.writeFileSync(layoutPath, normContent, 'utf8');
      console.log('[+] dashboard/layout.tsx: live profile sync patched');
    } else {
      console.warn('[-] dashboard/layout.tsx: oldMount not matched');
    }
  }
}

// 7. PATCH src/components/JobDetailClient.tsx
{
  const jobDetailPath = path.join(rootDir, 'src', 'components', 'JobDetailClient.tsx');
  let content = fs.readFileSync(jobDetailPath, 'utf8');
  let normContent = content.replace(/\r\n/g, '\n');

  let changed = false;

  // 7.1 Import Bookmark
  if (!normContent.includes('Bookmark,') && !normContent.includes('Bookmark ')) {
    normContent = normContent.replace('  Briefcase,', '  Briefcase,\n  Bookmark,');
    changed = true;
    console.log('[+] JobDetailClient.tsx: Bookmark icon imported');
  }

  // 7.2 Add isSaved state & handleToggleSave
  if (!normContent.includes('handleToggleSave')) {
    const stateTarget = `  const [copiedLink, setCopiedLink] = useState(false);`;
    const newSavedStates = `  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(storage.isJobSaved(job.id));
    const handleSavedChange = () => {
      setIsSaved(storage.isJobSaved(job.id));
    };
    window.addEventListener('cs_saved_changed', handleSavedChange);
    return () => window.removeEventListener('cs_saved_changed', handleSavedChange);
  }, [job.id]);

  const handleToggleSave = async () => {
    const nextSaved = storage.toggleSaveJob(job.id);
    setIsSaved(nextSaved);
    try {
      await fetch('/api/candidate/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, action: nextSaved ? 'save' : 'unsave' })
      });
    } catch {}
  };`;

    if (normContent.includes(stateTarget)) {
      normContent = normContent.replace(stateTarget, newSavedStates);
      changed = true;
      console.log('[+] JobDetailClient.tsx: isSaved state and toggle added');
    }
  }

  // 7.3 Desktop Share Bar: Add Save Button
  if (!normContent.includes('title={isSaved ? "সংরক্ষিত তালিকা থেকে সরান" : "সার্কুলারটি সংরক্ষণ করুন"}')) {
    const copyBtnTarget = `                <button
                  onClick={handleCopy}
                  className={\`flex-1 sm:flex-none py-1.5 px-2 sm:px-3 font-bold text-[11px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1 border shadow-2xs whitespace-nowrap \${
                    copiedLink
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }\`}
                  title="সার্কুলার লিংক কপি করুন"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span>{copiedLink ? "কপি হয়েছে" : "কপি"}</span>
                </button>`;

    const saveBtnHtml = `                <button
                  onClick={handleToggleSave}
                  className={\`flex-1 sm:flex-none py-1.5 px-2 sm:px-3 font-bold text-[11px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1 border shadow-2xs whitespace-nowrap \${
                    isSaved
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }\`}
                  title={isSaved ? "সংরক্ষিত তালিকা থেকে সরান" : "সার্কুলারটি সংরক্ষণ করুন"}
                >
                  <Bookmark className={\`w-3.5 h-3.5 \${isSaved ? "fill-amber-500 text-amber-600" : "text-slate-400"} shrink-0\`} />
                  <span>{isSaved ? "সংরক্ষিত" : "সেভ"}</span>
                </button>
` + copyBtnTarget;

    if (normContent.includes(copyBtnTarget)) {
      normContent = normContent.replace(copyBtnTarget, saveBtnHtml);
      changed = true;
      console.log('[+] JobDetailClient.tsx: desktop save button added');
    }
  }

  // 7.4 Mobile Floating Bar: Add Save Button
  if (!normContent.includes('title={isSaved ? "সংরক্ষিত" : "সেভ করুন"}')) {
    const mobileOldBlock = `        {isExpired ? (
          <div className="px-5 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 flex-shrink-0 cursor-not-allowed select-none">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>আবেদন বন্ধ</span>
          </div>
        ) : (
          <Link
            href={applyHref}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 flex-shrink-0"
          >
            <span>আবেদন বুকিং দিন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}`;

    const mobileNewBlock = `        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleToggleSave}
            className={\`p-2.5 rounded-xl border flex items-center justify-center transition-all shrink-0 \${
              isSaved
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }\`}
            title={isSaved ? "সংরক্ষিত" : "সেভ করুন"}
          >
            <Bookmark className={\`w-4 h-4 \${isSaved ? "fill-amber-500 text-amber-600" : "text-slate-600"}\`} />
          </button>
          {isExpired ? (
            <div className="px-5 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 flex-shrink-0 cursor-not-allowed select-none">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>আবেদন বন্ধ</span>
            </div>
          ) : (
            <Link
              href={applyHref}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 flex-shrink-0"
            >
              <span>আবেদন বুকিং দিন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>`;

    if (normContent.includes(mobileOldBlock)) {
      normContent = normContent.replace(mobileOldBlock, mobileNewBlock);
      changed = true;
      console.log('[+] JobDetailClient.tsx: mobile floating save button added');
    }
  }

  if (changed) {
    fs.writeFileSync(jobDetailPath, normContent, 'utf8');
  }
}

console.log('--- All Repairs Processed Successfully ---');