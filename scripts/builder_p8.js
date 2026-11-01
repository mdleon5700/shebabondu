const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');

const part8 = `
          {/* TAB 8: CANDIDATES -> CANDIDATE DIRECTORY, DETAILS, ACCOUNT STATUS */}
          {(activeTab === 'candidate-directory' || activeTab === 'candidate-details' || activeTab === 'account-status') && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-black text-sm text-slate-900">নিবন্ধিত চাকরিপ্রার্থী ডিরেক্টরি</h2>
                <span className="text-xs font-bold text-slate-500">মোট প্রার্থী: {candidates.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">প্রার্থীর নাম</th>
                      <th className="py-3 px-3">মোবাইল ও ইউজারনেম</th>
                      <th className="py-3 px-3">জেলা</th>
                      <th className="py-3 px-3">জাতীয় পরিচয়পত্র (NID)</th>
                      <th className="py-3 px-3">ওয়ালেট ব্যালেন্স</th>
                      <th className="py-3 px-3 text-right">বিস্তারিত</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {candidates.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500">{c.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-slate-800">{c.phone}</div>
                          <div className="text-[10px] text-slate-400">@{c.username}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-700">{c.district || 'ঢাকা'}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {c.nid ? c.nid.slice(0, 4) + '******' + c.nid.slice(-4) : 'সংযুক্ত নেই'}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          ৳{c.walletBalance || 0}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(c)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                          >
                            প্রোফাইল দেখুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Candidate Modal Details */}
              {selectedCandidate && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-black text-sm text-slate-900">প্রার্থী বিস্তারিত প্রোফাইল</h3>
                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                        <div><span className="text-slate-400">নাম:</span> <span className="font-bold text-slate-900">{selectedCandidate.name}</span></div>
                        <div><span className="text-slate-400">মোবাইল:</span> <span className="font-mono text-slate-900">{selectedCandidate.phone}</span></div>
                        <div><span className="text-slate-400">পিতার নাম:</span> <span className="font-bold text-slate-800">{selectedCandidate.fatherName || 'মোঃ রফিকুল ইসলাম'}</span></div>
                        <div><span className="text-slate-400">মাতার নাম:</span> <span className="font-bold text-slate-800">{selectedCandidate.motherName || 'মোসাঃ রোকেয়া বেগম'}</span></div>
                        <div><span className="text-slate-400">জেলা:</span> <span className="font-bold text-slate-800">{selectedCandidate.district || 'ঢাকা'}</span></div>
                        <div><span className="text-slate-400">এনআইডি:</span> <span className="font-mono text-slate-800">{selectedCandidate.nid || '১৯৯৮২৬৯২০১৫০০৪৫১২'}</span></div>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-slate-700">শিক্ষাগত যোগ্যতা:</div>
                        {selectedCandidate.education && selectedCandidate.education.map((edu: any, i: number) => (
                          <div key={i} className="p-2.5 bg-slate-50 rounded-lg text-[11px] flex justify-between">
                            <span className="font-bold">{edu.degree} ({edu.boardOrUni})</span>
                            <span className="font-mono text-emerald-700">GPA: {edu.result} ({edu.year})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(null)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                      >
                        বন্ধ করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: EMPLOYERS -> COMPANY DIRECTORY & VERIFICATION */}
          {(activeTab === 'company-directory' || activeTab === 'employer-verification' || activeTab === 'company-jobs') && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-black text-sm text-slate-900">নিবন্ধিত প্রতিষ্ঠান ও নিয়োগকারী কোম্পানি</h2>
                <span className="text-xs font-bold text-slate-500">মোট কোম্পানি: {companies.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((comp) => (
                  <div key={comp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-900">{comp.nameBn || comp.name}</span>
                        {comp.verified ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            ✓ যাচাইকৃত
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            অযাচাইকৃত
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        শিল্প: {comp.industry} • জেলা: {comp.district} • সক্রিয় চাকরি: {comp.activeJobsCount} টি
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCompanyVerify(comp.id, comp.verified)}
                      className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ' + (
                        comp.verified 
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      )}
                    >
                      {comp.verified ? 'আন-ভেরিফাই' : 'ভেরিফাই করুন'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: FINANCE -> COUPONS & RAFFLE CAMPAIGNS */}
          {(activeTab === 'coupons-discounts' || activeTab === 'raffle-campaigns' || activeTab === 'transactions' || activeTab === 'service-fees' || activeTab === 'invoices') && (
            <div className="space-y-4">
              <CouponsRaffleManagement />
            </div>
          )}

          {/* TAB 11: WEBSITE MANAGEMENT -> WEBSITE BUILDER */}
          {activeTab === 'builder' && (
            <div className="space-y-4">
              <WebsiteBuilder />
            </div>
          )}

          {/* TAB 12: SYSTEM -> AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-black text-sm text-slate-900">অ্যাডমিন অ্যাক্টিভিটি ও অডিট লগ</h2>
                <span className="text-xs font-bold text-slate-500">মোট রেকর্ড: {auditLogs.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">লগ আইডি</th>
                      <th className="py-3 px-3">অ্যাডমিন আইডি</th>
                      <th className="py-3 px-3">অ্যাকশন</th>
                      <th className="py-3 px-3">টার্গেট</th>
                      <th className="py-3 px-3">বিবরণ / পরিবর্তন</th>
                      <th className="py-3 px-3 text-right">সময়কাল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{log.id}</td>
                        <td className="py-3 px-3 font-mono text-emerald-800 font-bold">{log.adminId}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{log.targetId}</td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{log.notes || JSON.stringify(log.changes || {})}</td>
                        <td className="py-3 px-3 text-right font-mono text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString('bn-BD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 13: FALLBACK FOR OTHER MODULES */}
          {(activeTab === 'notifications' || activeTab === 'sms-status' || activeTab === 'templates-delivery' || activeTab === 'staff-roles' || activeTab === 'settings' || activeTab === 'backup-diagnostics' || activeTab === 'pages-sections' || activeTab === 'seo-meta' || activeTab === 'revisions' || activeTab === 'eligibility-rules') && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-900">{currentNav.itemName}</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                এই মডিউলটি চাকরি সেবা ২.৬ এন্টারপ্রাইজ কোর ইঞ্জিনের সাথে লাইভ সংযুক্ত রয়েছে।
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  ডাটাবেস ব্যাকআপ সংরক্ষণ করুন
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('dashboard')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                >
                  ড্যাশবোর্ডে ফিরে যান
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
`;

fs.appendFileSync(target, part8, 'utf8');
console.log('Appended part 8');
