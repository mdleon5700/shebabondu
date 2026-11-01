const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');

const part3 = `
  const handleUpdateTrackingId = async (appId: string) => {
    const tracking = prompt('টেলিটক ট্র্যাকিং আইডি / ইউজার আইডি প্রদান করুন:', 'TELETALK-' + Math.floor(100000 + Math.random() * 900000));
    if (!tracking) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          teleTalkTrackingId: tracking,
          status: 'processing',
          notes: 'টেলিটক ট্র্যাকিং আইডি যুক্ত করা হয়েছে: ' + tracking
        })
      });
      if (res.ok) {
        alert('ট্র্যাকিং আইডি সফলভাবে সংরক্ষিত হয়েছে!');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };

  const handleAttachPdf = async (appId: string) => {
    const pdfUrl = prompt('অ্যাপ্লিক্যান্ট কপি PDF এর লিংক দিন:', 'https://alljobs.teletalk.com.bd/applicant-copy/' + appId + '.pdf');
    if (!pdfUrl) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          applicantCopyPdfUrl: pdfUrl,
          status: 'completed',
          notes: 'অফিসিয়াল অ্যাপ্লিক্যান্ট কপি আপলোড সম্পন্ন। আবেদনকারীকে এসএমএস অ্যালার্ট পাঠানো হয়েছে।'
        })
      });
      if (res.ok) {
        alert('অ্যাপ্লিক্যান্ট কপি যুক্ত ও আবেদন সফলভাবে সম্পন্ন করা হয়েছে!');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrg.trim()) {
      alert('পদবীর নাম এবং প্রতিষ্ঠানের নাম আবশ্যক!');
      return;
    }
    setIsSubmittingJob(true);
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          organization: newOrg.trim(),
          category: newCategory,
          grade: newGrade,
          totalPosts: parseInt(newVacancies) || 1,
          salary: newSalary,
          minEducation: newEducation,
          districts: newDistricts,
          deadline: newDeadline,
          govtFee: Number(newGovtFee) || 200,
          serviceFee: Number(newServiceFee) || 80
        })
      });
      if (res.ok) {
        alert('নতুন সার্কুলার সফলভাবে লাইভ প্রকাশ করা হয়েছে!');
        setNewTitle('');
        setNewOrg('');
        setActiveTab('circulars');
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'পোস্ট ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার সংযোগ সমস্যা');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleApproveDraft = async (draft: CircularDraft) => {
    if (!confirm('আপনি কি এই খসড়া সার্কুলারটি অনুমোদন করে মূল ওয়েবসাইটে প্রকাশ করতে চান?')) return;
    try {
      const res = await fetch('/api/admin/sources/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', draftId: draft.id })
      });
      if (res.ok) {
        alert('খসড়াটি সফলভাবে অনুমোদিত এবং প্রকাশিত হয়েছে!');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };

  const handleToggleCompanyVerify = async (compId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: compId, verified: !currentStatus })
      });
      if (res.ok) {
        alert('কোম্পানির ভেরিফিকেশন স্ট্যাটাস হালনাগাদ করা হয়েছে!');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      platform: 'Chakri Sheba BD Enterprise',
      version: '2.6',
      stats,
      applications,
      candidates,
      jobs,
      sources,
      drafts,
      companies,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chakriseba_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
  };

  const filteredApplications = useMemo(() => {
    let list = applications;
    if (activeTab === 'payment-verification') {
      list = list.filter(a => a.status === 'pending_payment');
    } else if (activeTab === 'processing-queue') {
      list = list.filter(a => a.status === 'processing');
    } else if (activeTab === 'completed-rejected') {
      list = list.filter(a => a.status === 'completed' || a.status === 'rejected');
    }
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(a => 
      a.id.toLowerCase().includes(term) ||
      (a.candidateName && a.candidateName.toLowerCase().includes(term)) ||
      (a.candidatePhone && a.candidatePhone.includes(term)) ||
      (a.jobTitle && a.jobTitle.toLowerCase().includes(term)) ||
      (a.trxId && a.trxId.toLowerCase().includes(term))
    );
  }, [applications, activeTab, searchTerm]);
`;

fs.appendFileSync(target, part3, 'utf8');
console.log('Appended part 3');
