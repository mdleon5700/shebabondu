const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../src/components/admin/UniversalUserWorkspace.tsx');
let content = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');

// 1. Update UserWorkspaceTab type
const oldTabType = `type UserWorkspaceTab =
  | 'overview'
  | 'personal'
  | 'professional'
  | 'education'
  | 'experience'
  | 'skills'
  | 'preferences'
  | 'documents'
  | 'saved_jobs'
  | 'notifications'
  | 'security'
  | 'admin_notes'
  | 'audit_log';`;

const newTabType = `type UserWorkspaceTab =
  | 'overview'
  | 'personal'
  | 'professional'
  | 'education'
  | 'experience'
  | 'skills'
  | 'preferences'
  | 'documents'
  | 'applications'
  | 'wallet'
  | 'saved_jobs'
  | 'notifications'
  | 'security'
  | 'admin_notes'
  | 'audit_log';`;

content = content.replace(oldTabType, newTabType);

// 2. Add state variables for transactions and balance adjustment
const oldStateAnchor = `  const [notifications, setNotifications] = useState<any[]>([]);`;
const newStateBlock = `  const [notifications, setNotifications] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adjAmount, setAdjAmount] = useState<string>('');
  const [adjType, setAdjType] = useState<'credit' | 'debit'>('credit');
  const [adjReason, setAdjReason] = useState<string>('');
  const [isAdjustingBalance, setIsAdjustingBalance] = useState<boolean>(false);`;

content = content.replace(oldStateAnchor, newStateBlock);

// 3. Update loadCandidateData
const oldLoadAnchor = `        setDocuments(data.documents || []);
        setApplications(data.applications || []);
        setSavedJobs(data.savedJobs || []);
        setNotifications(data.notifications || []);`;

const newLoadBlock = `        setDocuments(data.documents || []);
        setApplications(data.applications || []);
        setSavedJobs(data.savedJobs || []);
        setNotifications(data.notifications || []);
        setTransactions(data.transactions || []);`;

content = content.replace(oldLoadAnchor, newLoadBlock);

// 4. Update tab button list
const oldTabListAnchor = `            { id: 'documents', label: 'সার্টিফিকেট ও ফাইল', icon: FileText, badge: documents.length },
            { id: 'saved_jobs', label: 'সংরক্ষিত চাকরি', icon: Bookmark, badge: savedJobs.length },`;

const newTabListBlock = `            { id: 'documents', label: 'সার্টিফিকেট ও ফাইল', icon: FileText, badge: documents.length },
            { id: 'applications', label: 'চাকরির আবেদনসমূহ', icon: Briefcase, badge: applications.length },
            { id: 'wallet', label: 'ওয়ালেট ও লেনদেন', icon: CreditCard, badge: transactions.length },
            { id: 'saved_jobs', label: 'সংরক্ষিত চাকরি', icon: Bookmark, badge: savedJobs.length },`;

content = content.replace(oldTabListAnchor, newTabListBlock);

// 5. Add Applications and Wallet tab panels before TAB 13
const oldAuditTabAnchor = `          {/* ------------------------------------------------------------ */}
          {/* TAB 13: AUDIT HISTORY */}
          {/* ------------------------------------------------------------ */}`;

const newPanelsBlock = `          {/* ------------------------------------------------------------ */}
          {/* TAB: CANDIDATE APPLICATIONS (SUB-FEATURE 5) */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'applications' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>চাকরির আবেদনসমূহ ({applications.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">মোট আবেদন: {applications.length} টি</span>
                </div>

                {applications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-2.5 px-3">পদের নাম / বিজ্ঞপ্তি</th>
                          <th className="py-2.5 px-3">আবেদনের তারিখ</th>
                          <th className="py-2.5 px-3">সার্ভিস ফি</th>
                          <th className="py-2.5 px-3">অবস্থা</th>
                          <th className="py-2.5 px-3">ট্রানজেকশন আইডি</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {applications.map((app, aIdx) => (
                          <tr key={app.id || aIdx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {app.jobTitle || app.title || 'সরকারি পদ'}
                              <span className="block text-[11px] font-normal text-slate-500">{app.organization || 'সরকারি দপ্তর'}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('bn-BD') : 'তারিখ নেই'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              ৳{app.financialSnapshot?.finalServiceCharge ?? app.serviceCharge ?? 80}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={\`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold \${
                                app.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : app.status === 'processing'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : app.status === 'pending_payment'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }\`}>
                                {app.status === 'completed' ? 'সম্পন্ন' : app.status === 'processing' ? 'প্রক্রিয়াধীন' : app.status === 'pending_payment' ? 'পেমেন্ট অপেক্ষমাণ' : 'বাতিল'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                              {app.paymentDetails?.transactionId || app.trxId || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    এই প্রার্থীর এখনো কোনো চাকরির আবেদন জমা নেই।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB: CANDIDATE WALLET & LEDGER (SUB-FEATURE 7) */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'wallet' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Balance Card & Manual Adjustment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Balance Display */}
                <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-3xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                    <span>বর্তমান ওয়ালেট ব্যালেন্স</span>
                    <CreditCard className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="text-3xl font-black">
                    ৳{formData.walletBalance || 0}
                  </div>
                  <p className="text-[11px] text-emerald-300/80">
                    চাকরি সেবা অ্যাকাউন্ট ওয়ালেট (সার্ভিস ও আবেদন ফি সমন্বয়ের জন্য)
                  </p>
                </div>

                {/* Manual Adjustment Card */}
                <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>প্রশাসনিক ব্যালেন্স সমন্বয় (Admin Manual Adjustment)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">সমন্বয়ের ধরন</label>
                      <select
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
                      >
                        <option value="credit">জমা / ক্রেডিট (+)</option>
                        <option value="debit">কর্তন / ডেবিট (-)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">টাকার পরিমাণ (৳)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="যেমন: ১০০"
                        value={adjAmount}
                        onChange={(e) => setAdjAmount(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">বাধ্যতামূলক কারণ</label>
                      <input
                        type="text"
                        placeholder="কারণ লিখুন..."
                        value={adjReason}
                        onChange={(e) => setAdjReason(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={isAdjustingBalance || !adjAmount || !adjReason.trim()}
                      onClick={async () => {
                        if (!candidateId || !adjAmount || !adjReason.trim()) return;
                        setIsAdjustingBalance(true);
                        try {
                          const res = await fetch(\`/api/admin/candidates/\${candidateId}\`, {
                            method: 'PATCH',
                            headers: getAdminHeaders(),
                            body: JSON.stringify({
                              balanceAdjustment: {
                                amount: Number(adjAmount),
                                type: adjType,
                                reason: adjReason.trim()
                              }
                            })
                          });
                          const d = await res.json();
                          if (d.success) {
                            setSaveSuccessToast(\`ব্যালেন্স সফলভাবে সমন্বয় করা হয়েছে! নতুন ব্যালেন্স: ৳\${d.candidate.walletBalance}\`);
                            setFormData(prev => ({ ...prev, walletBalance: d.candidate.walletBalance }));
                            setAdjAmount('');
                            setAdjReason('');
                            loadCandidateData(candidateId);
                            setTimeout(() => setSaveSuccessToast(null), 3500);
                          } else {
                            setSaveError(d.error || 'সমন্বয় ব্যর্থ হয়েছে');
                          }
                        } catch (err: any) {
                          setSaveError(err.message || 'নেটওয়ার্ক এরর');
                        } finally {
                          setIsAdjustingBalance(false);
                        }
                      }}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isAdjustingBalance ? 'প্রক্রিয়াধীন...' : 'সমন্বয় নিশ্চিত করুন'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>লেনদেন ও লেজার হিস্ট্রি ({transactions.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">মোট লেনদেন: {transactions.length} টি</span>
                </div>

                {transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-2.5 px-3">ট্রানজেকশন আইডি</th>
                          <th className="py-2.5 px-3">তারিখ</th>
                          <th className="py-2.5 px-3">ধরন</th>
                          <th className="py-2.5 px-3">বিবরণ / কারণ</th>
                          <th className="py-2.5 px-3">মাধ্যম</th>
                          <th className="py-2.5 px-3 text-right">পরিমাণ (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((tx, tIdx) => (
                          <tr key={tx.id || tIdx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                              {tx.trxId || tx.id}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {tx.date ? new Date(tx.date).toLocaleDateString('bn-BD') : 'তারিখ নেই'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={\`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold \${
                                tx.type === 'recharge' || tx.type === 'deposit'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }\`}>
                                {tx.type === 'recharge' || tx.type === 'deposit' ? 'জমা (+)' : 'কর্তন (-)'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                              {tx.description || tx.purpose || 'সাধারণ লেনদেন'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {tx.method || 'Wallet'}
                            </td>
                            <td className={\`py-2.5 px-3 text-right font-black \${
                              tx.type === 'recharge' || tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-800'
                            }\`}>
                              {tx.type === 'recharge' || tx.type === 'deposit' ? '+' : '-'}৳{tx.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    কোনো পূর্ববর্তী লেনদেন রেকর্ড পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 13: AUDIT HISTORY */}
          {/* ------------------------------------------------------------ */}`;

content = content.replace(oldAuditTabAnchor, newPanelsBlock);

fs.writeFileSync(target, content, 'utf8');
console.log('Successfully updated UniversalUserWorkspace with applications and wallet tabs!');
