const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');

const part4 = `
  const navGroups = [
    {
      name: 'ওভারভিউ',
      items: [
        { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, badge: null },
        { id: 'system-health', label: 'সিস্টেম হেলথ ও অ্যাক্টিভিটি', icon: Activity, badge: null }
      ]
    },
    {
      name: 'আবেদনসমূহ',
      items: [
        { id: 'all-applications', label: 'সকল আবেদন', icon: FileText, badge: applications.length },
        { id: 'payment-verification', label: 'পেমেন্ট ভেরিফিকেশন', icon: CreditCard, badge: stats.pendingPayment, badgeColor: 'bg-amber-500 text-white' },
        { id: 'processing-queue', label: 'প্রসেসিং কিউ', icon: Clock, badge: stats.processing, badgeColor: 'bg-blue-600 text-white' },
        { id: 'completed-rejected', label: 'সম্পন্ন ও বাতিল আবেদন', icon: CheckCircle2, badge: null },
        { id: 'documents', label: 'অ্যাপ্লিক্যান্ট কপি ও ডকুমেন্টস', icon: Download, badge: null }
      ]
    },
    {
      name: 'নিয়োগ বিজ্ঞপ্তি',
      items: [
        { id: 'circulars', label: 'সকল সার্কুলার', icon: Briefcase, badge: jobs.length },
        { id: 'create-circular', label: 'নতুন সার্কুলার তৈরি', icon: PlusCircle, badge: null },
        { id: 'source-monitoring', label: 'সোর্স মনিটরিং', icon: Radio, badge: sources.length },
        { id: 'imported-drafts', label: 'ইম্পোর্ট খসড়া কিউ', icon: Sparkles, badge: drafts.length, badgeColor: 'bg-emerald-600 text-white' },
        { id: 'eligibility-rules', label: 'যোগ্যতা ও শর্তাবলী ফিল্টার', icon: Sliders, badge: null }
      ]
    },
    {
      name: 'চাকরিপ্রার্থী',
      items: [
        { id: 'candidate-directory', label: 'প্রার্থী ডিরেক্টরি', icon: Users, badge: candidates.length },
        { id: 'candidate-details', label: 'প্রোফাইল ও আবেদন হিস্ট্রি', icon: UserCheck, badge: null },
        { id: 'account-status', label: 'অ্যাকাউন্ট স্ট্যাটাস', icon: Shield, badge: null }
      ]
    },
    {
      name: 'নিয়োগকারী প্রতিষ্ঠান',
      items: [
        { id: 'company-directory', label: 'কোম্পানি ডিরেক্টরি', icon: Building, badge: companies.length },
        { id: 'employer-verification', label: 'কোম্পানি ভেরিফিকেশন', icon: FileCheck, badge: null },
        { id: 'company-jobs', label: 'জব পোস্টিং ও আবেদন ট্র্যাকিং', icon: Briefcase, badge: null }
      ]
    },
    {
      name: 'আর্থিক লেনদেন',
      items: [
        { id: 'transactions', label: 'ট্রানজেকশন তালিকা', icon: Receipt, badge: null },
        { id: 'invoices', label: 'ইনভয়েস ও রসিদ', icon: FileText, badge: null },
        { id: 'service-fees', label: 'সার্ভিস ফি হিসাব', icon: PieChart, badge: null },
        { id: 'coupons-discounts', label: 'কুপন ও ডিসকাউন্ট', icon: Tag, badge: stats.activeCoupons },
        { id: 'raffle-campaigns', label: 'র‍্যাফেল ড্র ক্যাম্পেইন', icon: Gift, badge: stats.activeRaffles }
      ]
    },
    {
      name: 'ওয়েবসাইট ম্যানেজমেন্ট',
      items: [
        { id: 'builder', label: 'ভিজ্যুয়াল পেইজ বিল্ডার', icon: Globe, badge: 'লাইভ' },
        { id: 'pages-sections', label: 'পেইজ ও সেকশন ম্যানেজমেন্ট', icon: Layers, badge: null },
        { id: 'seo-meta', label: 'এসইও মেটাডাটা', icon: Search, badge: null },
        { id: 'revisions', label: 'রিভিশন ও হিস্ট্রি রিকভারি', icon: History, badge: null }
      ]
    },
    {
      name: 'যোগাযোগ ও বার্তা',
      items: [
        { id: 'notifications', label: 'নোটিফিকেশন সিস্টেম', icon: Bell, badge: null },
        { id: 'sms-status', label: 'এসএমএস গেটওয়ে স্ট্যাটাস', icon: MessageSquare, badge: 'সক্রিয়' },
        { id: 'templates-delivery', label: 'টেমপ্লেট ও ডেলিভারি হিস্ট্রি', icon: Mail, badge: null }
      ]
    },
    {
      name: 'সিস্টেম কনফিগারেশন',
      items: [
        { id: 'staff-roles', label: 'স্টাফ ও রোল পারমিশন', icon: ShieldAlert, badge: null },
        { id: 'audit-logs', label: 'অ্যাডমিন অডিট লগ', icon: Database, badge: auditLogs.length },
        { id: 'settings', label: 'সিস্টেম সেটিংস', icon: Settings, badge: null },
        { id: 'backup-diagnostics', label: 'ব্যাকআপ ও ডায়াগনস্টিকস', icon: HardDrive, badge: null }
      ]
    }
  ];

  const currentNav = useMemo(() => {
    for (const group of navGroups) {
      const match = group.items.find(i => i.id === activeTab);
      if (match) {
        return { groupName: group.name, itemName: match.label };
      }
    }
    return { groupName: 'ওভারভিউ', itemName: 'ড্যাশবোর্ড' };
  }, [activeTab]);

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />
          
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              চাকরি সেবা <span className="text-emerald-700">অ্যাডমিন কনসোল</span>
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              সিস্টেম কন্ট্রোল প্যানেলে প্রবেশের জন্য আপনার সিক্রেট অ্যাডমিন পিন প্রদান করুন
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                অ্যাডমিন সিক্রেট পিন / মাস্টার কী
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="সিক্রেট পিন প্রদান করুন"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono tracking-wider text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                ডিফল্ট মাস্টার কি: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono text-[10px]">CHAKRISEBA_SECURE_ADMIN_2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>কনসোলে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <Link href="/" className="hover:text-emerald-700 font-bold transition-colors">
              ← মূল ওয়েবসাইটে ফিরে যান
            </Link>
            <span className="font-mono text-slate-400">ChakriSheba v2.6 Enterprise</span>
          </div>
        </div>
      </div>
    );
  }
`;

fs.appendFileSync(target, part4, 'utf8');
console.log('Appended part 4');
