const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'admin', 'CandidateManagementHub.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Plus, Trash2, Wallet to imports if not present
if (!content.includes('Trash2')) {
  content = content.replace(
    "import { \r\n  Users,",
    "import { \r\n  Plus,\r\n  Trash2,\r\n  Wallet,\r\n  Users,"
  ).replace(
    "import { \n  Users,",
    "import { \n  Plus,\n  Trash2,\n  Wallet,\n  Users,"
  );
}

// 2. Add handlers and state for create, delete, quick wallet
const stateTarget = "  // Universal User Workspace Modal State\r\n  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);";
const stateTargetLF = "  // Universal User Workspace Modal State\n  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);";

const newStatesAndHandlers = `  // Universal User Workspace Modal State
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);

  // Create Candidate Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    nameBn: '',
    phone: '',
    email: '',
    password: '',
    gender: 'male',
    dateOfBirth: '2000-01-01',
    nid: '',
    district: 'ঢাকা',
    division: 'Dhaka',
    educationLevel: 'স্নাতক / ডিগ্রি',
    quota: 'none',
    walletBalance: 0,
    accountStatus: 'active'
  });
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);
  const [createCandidateError, setCreateCandidateError] = useState<string | null>(null);

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateCandidateError(null);
    if (!createForm.name.trim()) {
      setCreateCandidateError('প্রার্থীর পূর্ণ নাম আবশ্যক');
      return;
    }
    const cleanPhone = createForm.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setCreateCandidateError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    setIsCreatingCandidate(true);
    try {
      const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': pin
        },
        credentials: 'include',
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'নতুন প্রার্থী তৈরি করতে ব্যর্থ হয়েছে');
      }
      setIsCreateModalOpen(false);
      setActionFeedback(\`নতুন প্রার্থী "\${data.candidate.name}" সফলভাবে তৈরি হয়েছে!\`);
      setTimeout(() => setActionFeedback(null), 4000);
      if (onRefreshCandidates) onRefreshCandidates();
    } catch (err: any) {
      setCreateCandidateError(err.message || 'সার্ভার এরর');
    } finally {
      setIsCreatingCandidate(false);
    }
  };

  const handleDeleteCandidate = async (candidate: any) => {
    if (!confirm(\`⚠️ সতর্কবার্তা: আপনি কি নিশ্চিত যে প্রার্থী "\${candidate.name}" (\${candidate.phone}) সম্পূর্ণ মুছে ফেলতে চান?\\n\\nএর সাথে তার সমস্ত আবেদন ও ডকুমেন্টস মুছে যাবে!\`)) {
      return;
    }
    try {
      const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
      const res = await fetch(\`/api/admin/candidates/\${candidate.id}\`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': pin
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'প্রার্থী মুছে ফেলা সম্ভব হয়নি');
      }
      setActionFeedback(\`প্রার্থী "\${candidate.name}" সফলভাবে মুছে ফেলা হয়েছে!\`);
      setTimeout(() => setActionFeedback(null), 3500);
      if (onRefreshCandidates) onRefreshCandidates();
    } catch (err: any) {
      alert(err.message || 'অ্যাকশন ব্যর্থ হয়েছে');
    }
  };

  const handleQuickAdjustWallet = async (candidate: any) => {
    const current = Number(candidate.walletBalance) || 0;
    const amountStr = prompt(\`প্রার্থী "\${candidate.name}" এর ওয়ালেটে কত টাকা যোগ বা বিয়োগ করতে চান?\\nবর্তমান ব্যালেন্স: ৳\${current}\\n(যেমন: 200 যোগ করতে 200, অথবা 50 বিয়োগ করতে -50 লিখুন)\`, '100');
    if (!amountStr) return;
    const delta = Number(amountStr);
    if (isNaN(delta) || delta === 0) {
      alert('অনুগ্রহ করে সঠিক সংখ্যা লিখুন');
      return;
    }
    const newBalance = Math.max(0, current + delta);
    try {
      const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
      const res = await fetch(\`/api/admin/candidates/\${candidate.id}\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': pin
        },
        credentials: 'include',
        body: JSON.stringify({ walletBalance: newBalance, reason: \`অ্যাডমিন ওয়ালেট এডজাস্টমেন্ট (\${delta >= 0 ? '+' : ''}\${delta} ৳)\` })
      });
      if (res.ok) {
        candidate.walletBalance = newBalance;
        setActionFeedback(\`"\${candidate.name}" এর ওয়ালেট ব্যালেন্স সফলভাবে আপডেট হয়েছে: ৳\${newBalance}\`);
        setTimeout(() => setActionFeedback(null), 3500);
        if (onRefreshCandidates) onRefreshCandidates();
      }
    } catch {
      alert('ওয়ালেট ব্যালেন্স আপডেট ব্যর্থ হয়েছে');
    }
  };`;

if (!content.includes('handleCreateCandidate')) {
  if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, newStatesAndHandlers.replace(/\n/g, '\r\n'));
  } else if (content.includes(stateTargetLF)) {
    content = content.replace(stateTargetLF, newStatesAndHandlers);
  }
}

// 3. Add Top "নতুন প্রার্থী তৈরি করুন" button next to sub-tabs
const headerSearchTarget = '{/* Sub-tab Pill Switcher */}';
const headerAddition = `<div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCreateCandidateError(null);
              setCreateForm({
                name: '',
                nameBn: '',
                phone: '',
                email: '',
                password: '',
                gender: 'male',
                dateOfBirth: '2000-01-01',
                nid: '',
                district: 'ঢাকা',
                division: 'Dhaka',
                educationLevel: 'স্নাতক / ডিগ্রি',
                quota: 'none',
                walletBalance: 0,
                accountStatus: 'active'
              });
              setIsCreateModalOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন প্রার্থী তৈরি করুন</span>
          </button>
        </div>

        {/* Sub-tab Pill Switcher */}`;

if (!content.includes('+ নতুন প্রার্থী তৈরি করুন')) {
  content = content.replace(headerSearchTarget, headerAddition);
}

// 4. Add Action Buttons to Candidate Row
const actionTarget = `<button
                              type="button"
                              onClick={() => {
                                setSmsCandidate(c);
                                setSmsMessage(\`চাকরি সেবা: জনাব \${c.name}, আপনার প্রোফাইল সংক্রান্ত জরুরি নোটিশ...\`);
                              }}
                              className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                              title="এসএমএস পাঠান"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>`;

const actionAddition = `<button
                              type="button"
                              onClick={() => handleQuickAdjustWallet(c)}
                              className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                              title={\`ওয়ালেট ব্যালেন্স: ৳\${c.walletBalance || 0} (পরিবর্তন করুন)\`}
                            >
                              <Wallet className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleSuspension(c)}
                              className={\`p-1 rounded-lg transition-colors cursor-pointer \${
                                isSuspended ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }\`}
                              title={isSuspended ? 'অ্যাকাউন্ট পুনরায় সক্রিয় করুন' : 'অ্যাকাউন্ট স্থগিত করুন'}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCandidate(c)}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                              title="প্রার্থী সম্পূর্ণ মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            ${actionTarget}`;

if (!content.includes('handleQuickAdjustWallet(c)')) {
  content = content.replace(actionTarget, actionAddition);
}

// 5. Add Create Candidate Modal
const modalTarget = '{/* =========================================================================\n          MODAL 3: PASSWORD RESET SUCCESS MODAL';
const modalTargetCRLF = '{/* =========================================================================\r\n          MODAL 3: PASSWORD RESET SUCCESS MODAL';

const createModalCode = `      {/* =========================================================================
          MODAL 0: CREATE CANDIDATE MODAL
         ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">নতুন চাকরিপ্রার্থী নিবন্ধন করুন</h3>
                  <p className="text-xs text-slate-500">অ্যাডমিন কনসোল থেকে সরাসরি ভল্ট প্রোফাইল তৈরি</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createCandidateError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createCandidateError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCandidate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণ নাম (ইংরেজি) *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="MD. RAHIM MIA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণ নাম (বাংলা)</label>
                  <input
                    type="text"
                    value={createForm.nameBn}
                    onChange={(e) => setCreateForm({ ...createForm, nameBn: e.target.value })}
                    placeholder="মোঃ রহিম মিয়া"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
                  <input
                    type="tel"
                    required
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="01700000000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল অ্যাড্রেস</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="rahim@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড (ডিফল্ট: 123456)</label>
                  <input
                    type="text"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="123456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র (NID)</label>
                  <input
                    type="text"
                    value={createForm.nid}
                    onChange={(e) => setCreateForm({ ...createForm, nid: e.target.value })}
                    placeholder="১০ বা ১৭ ডিজিটের NID"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">নিজ জেলা</label>
                  <input
                    type="text"
                    value={createForm.district}
                    onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                    placeholder="ঢাকা"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিভাগ</label>
                  <select
                    value={createForm.division}
                    onChange={(e) => setCreateForm({ ...createForm, division: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Dhaka">ঢাকা (Dhaka)</option>
                    <option value="Chittagong">চট্টগ্রাম (Chattogram)</option>
                    <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                    <option value="Khulna">খুলনা (Khulna)</option>
                    <option value="Barisal">বরিশাল (Barishal)</option>
                    <option value="Sylhet">সিলেট (Sylhet)</option>
                    <option value="Rangpur">রংপুর (Rangpur)</option>
                    <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষাগত ডিগ্রি</label>
                  <select
                    value={createForm.educationLevel}
                    onChange={(e) => setCreateForm({ ...createForm, educationLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="স্নাতক / ডিগ্রি">স্নাতক / অনার্স / ডিগ্রি</option>
                    <option value="মাস্টার্স">মাস্টার্স / স্নাতকোত্তর</option>
                    <option value="HSC">এইচএসসি / আলিম / ডিপ্লোমা</option>
                    <option value="SSC">এসএসসি / দাখিল</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিশেষ কোটা</label>
                  <select
                    value={createForm.quota}
                    onChange={(e) => setCreateForm({ ...createForm, quota: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="none">সাধারণ (কোনো কোটা নেই)</option>
                    <option value="freedom_fighter">বীর মুক্তিযোদ্ধা কোটা</option>
                    <option value="disabled">প্রতিবন্ধী কোটা</option>
                    <option value="ethnic_minority">ক্ষুদ্র নৃগোষ্ঠী কোটা</option>
                    <option value="ansar">আনসার ও ভিডিপি কোটা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রাথমিক ওয়ালেট ব্যালেন্স (৳)</label>
                  <input
                    type="number"
                    value={createForm.walletBalance}
                    onChange={(e) => setCreateForm({ ...createForm, walletBalance: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাকাউন্ট স্ট্যাটাস</label>
                  <select
                    value={createForm.accountStatus}
                    onChange={(e) => setCreateForm({ ...createForm, accountStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="suspended">স্থগিত (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCandidate}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingCandidate ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>প্রার্থী সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      `;

if (!content.includes('MODAL 0: CREATE CANDIDATE MODAL')) {
  if (content.includes(modalTargetCRLF)) {
    content = content.replace(modalTargetCRLF, createModalCode.replace(/\n/g, '\r\n') + modalTargetCRLF);
  } else if (content.includes(modalTarget)) {
    content = content.replace(modalTarget, createModalCode + modalTarget);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated CandidateManagementHub.tsx');

