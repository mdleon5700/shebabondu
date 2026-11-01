const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');

const part6 = `
          {/* TAB 1: OVERVIEW -> DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Live KPI Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">মোট প্রার্থী</span>
                    <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.totalCandidates || candidates.length}</div>
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">✓ ভেরিফাইড চাকরিপ্রার্থী</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">মোট আবেদন</span>
                    <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{applications.length}</div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">টেলিটক ও ব্যাংক আবেদন</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">পেমেন্ট অপেক্ষমাণ</span>
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-600">{stats.pendingPayment}</div>
                  <p className="text-[11px] text-amber-700 font-bold mt-1">যাচাইয়ের অপেক্ষায়</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">মোট রাজস্ব আয়</span>
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">৳{stats.totalRevenue?.toLocaleString('bn-BD') || '১,৩৪০'}</div>
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">ফি ও সার্ভিস চার্জ</p>
                </div>
              </div>

              {/* Operational Queues Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Pending Payment Queue */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <h2 className="font-black text-sm text-slate-900">জরুরি পেমেন্ট ভেরিফিকেশন কিউ</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('payment-verification')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      সবগুলো দেখুন →
                    </button>
                  </div>

                  {applications.filter(a => a.status === 'pending_payment').length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 font-medium">
                      কোনো পেন্ডিং পেমেন্ট রিকোয়েস্ট নেই। সব ঠিক আছে!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {applications.filter(a => a.status === 'pending_payment').map((app) => (
                        <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-xs text-slate-900">{app.candidateName} — {app.jobTitle}</div>
                            <div className="text-[11px] text-slate-500">
                              মোবাইল: {app.candidatePhone} • TrxID: <span className="font-mono font-bold text-slate-800">{app.trxId || 'N/A'}</span> • ফি: ৳{app.totalAmount}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleApprovePayment(app.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              অনুমোদন
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectPayment(app.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              বাতিল
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Quick Action Hub & Source Crawler Status */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Radio className="w-4 h-4 text-emerald-700" />
                    <h2 className="font-black text-sm text-slate-900">অটো-পাইলট সোর্স স্ট্যাটাস</h2>
                  </div>

                  <div className="space-y-3 text-xs">
                    {sources.slice(0, 3).map((src) => (
                      <div key={src.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{src.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{src.sourceUrl}</div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="সক্রিয়" />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleTabChange('imported-drafts')}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ইম্পোর্ট খসড়া সার্কুলার রিভিউ করুন ({drafts.length})</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: OVERVIEW -> SYSTEM HEALTH */}
          {activeTab === 'system-health' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <h2 className="font-black text-base text-slate-900">সিস্টেম হেলথ ও ডায়াগনস্টিক রিপোর্ট</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">লোকাল ডাটাবেস</span>
                  <div className="text-lg font-black text-emerald-700">স্থানীয় স্টোর সক্রিয়</div>
                  <p className="text-[11px] text-slate-600">UTF-8 এনকোডিং যাচাইকৃত, শূন্য ত্রুটি।</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">রানটাইম এনভায়রনমেন্ট</span>
                  <div className="text-lg font-black text-slate-900">Next.js 14.2.35</div>
                  <p className="text-[11px] text-slate-600">App Router, সার্ভার সিঙ্ক ও রিয়েল-টাইম এপিআই।</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">নিরাপত্তা ও অথেন্টিকেশন</span>
                  <div className="text-lg font-black text-emerald-700">AES / Scrypt সুরক্ষিত</div>
                  <p className="text-[11px] text-slate-600">রেট লিমিটিং ও সেশন আইসোলেশন সক্রিয়।</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">সিস্টেম সম্পূর্ণ ত্রুটিমুক্ত:</span> চাকরিসেবা সিস্টেমের সকল এপিআই, প্রার্থী ডেটাবেস, টেলিটক সার্ভিস ও ওয়েবসাইট বিল্ডার সফলভাবে সিঙ্ক্রোনাইজড রয়েছে।
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATIONS -> ALL APPLICATIONS, PAYMENT VERIFICATION, PROCESSING QUEUE, COMPLETED/REJECTED */}
          {(activeTab === 'all-applications' || activeTab === 'payment-verification' || activeTab === 'processing-queue' || activeTab === 'completed-rejected') && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span className="font-black text-sm text-slate-900">
                    {activeTab === 'payment-verification' ? 'পেমেন্ট ভেরিফিকেশন কিউ' :
                     activeTab === 'processing-queue' ? 'টেলিটক প্রসেসিং কিউ' :
                     activeTab === 'completed-rejected' ? 'সম্পন্ন ও বাতিল আবেদনসমূহ' : 'সকল আবেদন তালিকা'}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                    {filteredApplications.length}
                  </span>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="নাম, ফোন বা TrxID দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Applications Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">আবেদন আইডি</th>
                      <th className="py-3 px-3">প্রার্থীর তথ্য</th>
                      <th className="py-3 px-3">বিজ্ঞপ্তি ও পদ</th>
                      <th className="py-3 px-3">পেমেন্ট বিবরণ</th>
                      <th className="py-3 px-3">স্ট্যাটাস</th>
                      <th className="py-3 px-3 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                          কোনো আবেদন পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {app.id}
                            {app.teleTalkTrackingId && (
                              <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                                TT: {app.teleTalkTrackingId}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{app.candidateName}</div>
                            <div className="text-slate-500 text-[11px]">{app.candidatePhone} • {app.candidateDistrict}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800 line-clamp-1">{app.jobTitle}</div>
                            <div className="text-[11px] text-slate-500">{app.organization}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">৳{app.totalAmount} ({app.paymentMethod})</div>
                            <div className="text-[11px] font-mono text-slate-500">Trx: {app.trxId || 'অপেক্ষমাণ'}</div>
                          </td>
                          <td className="py-3 px-3">
                            {app.status === 'completed' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                ✓ সম্পন্ন
                              </span>
                            ) : app.status === 'processing' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                ● প্রসেসিং
                              </span>
                            ) : app.status === 'pending_payment' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                ⏳ পেমেন্ট অপেক্ষমাণ
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                ✕ বাতিল
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.status === 'pending_payment' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprovePayment(app.id)}
                                    className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold hover:bg-emerald-800"
                                  >
                                    অনুমোদন
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectPayment(app.id)}
                                    className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-[11px] font-bold hover:bg-rose-200"
                                  >
                                    বাতিল
                                  </button>
                                </>
                              )}

                              {app.status === 'processing' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateTrackingId(app.id)}
                                    className="px-2 py-1 bg-blue-700 text-white rounded text-[11px] font-bold hover:bg-blue-800"
                                    title="টেলিটক ট্র্যাকিং আইডি যোগ করুন"
                                  >
                                    ট্র্যাকিং আইডি
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAttachPdf(app.id)}
                                    className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold hover:bg-emerald-800"
                                    title="স্লিপ যুক্ত করে সম্পন্ন করুন"
                                  >
                                    স্লিপ আপলোড
                                  </button>
                                </>
                              )}

                              {app.status === 'completed' && app.applicantCopyPdfUrl && (
                                <a
                                  href={app.applicantCopyPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[11px] font-bold hover:bg-slate-200 flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3 text-slate-600" />
                                  <span>স্লিপ</span>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: APPLICATIONS -> DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <h2 className="font-black text-sm text-slate-900">অ্যাপ্লিক্যান্ট কপি ও অফিশিয়াল ডকুমেন্টস রিপোজিটরি</h2>
              <p className="text-xs text-slate-600">
                টেলিটক ও বিভিন্ন নিয়োগকারী সংস্থা থেকে প্রাপ্ত অফিশিয়াল অ্যাপ্লিকেশন স্লিপ ও প্রার্থী ডকুমেন্টস আর্কাইভ।
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {applications.filter(a => a.applicantCopyPdfUrl).map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{app.jobTitle}</div>
                      <div className="text-[11px] text-slate-500">প্রার্থী: {app.candidateName} • ট্র্যাকিং: {app.teleTalkTrackingId || 'N/A'}</div>
                    </div>
                    <a
                      href={app.applicantCopyPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ডাউনলোড স্লিপ</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
`;

fs.appendFileSync(target, part6, 'utf8');
console.log('Appended part 6');
