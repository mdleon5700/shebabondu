const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');

const part2 = `
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());
  };

  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [resApps, resStats, resCandidates, resJobs, resSources, resDrafts, resCompanies, resAudit] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/candidates'),
        fetch('/api/admin/jobs'),
        fetch('/api/admin/sources'),
        fetch('/api/admin/sources/drafts'),
        fetch('/api/admin/companies'),
        fetch('/api/admin/audit-logs')
      ]);

      if (resApps.ok) {
        const data = await resApps.json();
        setApplications(Array.isArray(data) ? data : []);
      }
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }
      if (resCandidates.ok) {
        const data = await resCandidates.json();
        setCandidates(data.candidates || []);
      }
      if (resJobs.ok) {
        const data = await resJobs.json();
        setJobs(data.jobs || []);
      }
      if (resSources.ok) {
        const data = await resSources.json();
        setSources(data.sources || []);
      }
      if (resDrafts.ok) {
        const data = await resDrafts.json();
        setDrafts(data.drafts || []);
      }
      if (resCompanies.ok) {
        const data = await resCompanies.json();
        setCompanies(data.companies || []);
      }
      if (resAudit.ok) {
        const data = await resAudit.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedPin = localStorage.getItem('cs_admin_auth');
    if (savedPin === 'verified') {
      setIsAdminAuthenticated(true);
    }
    fetchAllAdminData();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', adminPin: adminPin.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('cs_admin_auth', 'verified');
        fetchAllAdminData();
      } else {
        setAuthError(data.error || 'ভুল অ্যাডমিন সিক্রেট পিন!');
      }
    } catch {
      setAuthError('সার্ভারে যোগাযোগ করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে অ্যাডমিন কনসোল থেকে লগআউট করতে চান?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('cs_admin_auth');
    setIsAdminAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleApprovePayment = async (appId: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          status: 'processing',
          notes: 'পেমেন্ট অনুমোদিত হয়েছে এবং টেলিটক অটো-ফিল কিউতে পাঠানো হয়েছে।'
        })
      });
      if (res.ok) {
        alert('পেমেন্ট সফলভাবে অনুমোদিত এবং আবেদন প্রসেসিং কিউতে পাঠানো হয়েছে!');
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার এরর');
    }
  };

  const handleRejectPayment = async (appId: string) => {
    const reason = prompt('বাতিলের কারণ লিখুন (যেমন: ভুল ট্রানজেকশন আইডি বা টাকা পাওয়া যায়নি):', 'অকার্যকর ট্রানজেকশন আইডি');
    if (!reason) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          status: 'rejected',
          notes: 'আবেদন বাতিল করা হয়েছে: ' + reason
        })
      });
      if (res.ok) {
        alert('আবেদন বাতিল করা হয়েছে।');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };
`;

fs.appendFileSync(target, part2, 'utf8');
console.log('Appended part 2');
