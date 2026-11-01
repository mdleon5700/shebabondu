const fs = require('fs');
const path = require('path');

let part4 = `
      {/* TAB 1: LIVE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                ??????????? ????? ???????? ??? ({filteredApps.length} ??)
              </h2>
              <p className="text-xs text-slate-500">
                ?-?????? ???????? ?????? ???????? ???? ??? ????, ???-???????? ??????? ???? ??? ?????????? ????? ????? ?????
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {[
                { id: 'all', label: '???' },
                { id: 'pending_payment', label: '??????? ???????' },
                { id: 'processing', label: '??? ????????' },
                { id: 'completed', label: '???????' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOrderStatusFilter(f.id)}
                  className={'px-3 py-1.5 rounded-xl border transition-all ' + (
                    orderStatusFilter === f.id ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="????? ????, ????????? ???, ?????? ?? ??????? TrxID ???? ??????..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div 
                key={app.id} 
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-400 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-800">{app.id}</span>
                      <span className="text-xs text-slate-400">• {app.date}</span>
                      <span className={'text-[10px] font-black px-2.5 py-0.5 rounded-full ' + (
                        app.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : app.status === 'processing' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                      )}>
                        {app.status === 'completed' ? '????? ???????' : app.status === 'processing' ? '??? ???? ????' : '??????? ???????'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {app.jobTitle} — <span className="text-emerald-700 font-bold">{app.postName}</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      ????????: <strong>{app.candidateName}</strong> | ???: <strong>{app.candidatePhone}</strong> | ????: {app.candidateDistrict}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs min-w-[200px] text-right space-y-1 shadow-sm">
                    <div className="text-slate-600">
                      ???????: <strong className="text-slate-900">{app.paymentMethod}</strong> (?{app.totalAmount})
                    </div>
                    {app.trxId && (
                      <div className="font-mono text-emerald-800 font-bold text-[11px]">
                        TrxID: {app.trxId}
                      </div>
                    )}
                    {app.status === 'pending_payment' && (
                      <button
                        onClick={() => handleApprovePayment(app.id)}
                        className="w-full mt-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] shadow-sm"
                      >
                        ??????? ????????? ????
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleCopyCandidateData(app)}
                      className={'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ' + (
                        copiedCandidateId === app.id ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                      )}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCandidateId === app.id ? '???? ??? ?????!' : '?-?????? ?????? ???? ???'}</span>
                    </button>

                    <button
                      onClick={() => alert('????????? ???x??? ??? ? ???x?? ???????? ???????? ?????!')}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>??? ? ???????? (ZIP)</span>
                    </button>

                    <a
                      href="https://alljobs.teletalk.com.bd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>???????? ???????</span>
                    </a>
                  </div>

                  {app.status !== 'completed' ? (
                    <button
                      onClick={() => handleCompleteOrder(app.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Applicant Copy ????? ? ???????</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>??????? ???????</span>
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredApps.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400 font-bold">
                ???? ????? ????? ??????
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POST NEW JOB */}
      {activeTab === 'new-job' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">
              ???? ?????? ????????? ??????? ? ??????? ??????? ???-?????
            </h2>
            <p className="text-xs text-slate-500">
              ????????? ???? ???? ???????? ????? ??? ??? ?????? ??? ? ????????? ???????? ???????? ????? ??? ?????
            </p>
          </div>

          {publishStatus && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{publishStatus}</span>
            </div>
          )}

          <form onSubmit={handlePublishJob} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">?????????? ??????? *</label>
                <input 
                  type="text" 
                  required
                  placeholder="???: ?????? ?????? ?????? (?????) ????? ????"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">???????????? ??? *</label>
                <input 
                  type="text" 
                  required
                  placeholder="???: ?????? ?????? ??????"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">?????????</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="govt">?????? ????? / ??????</option>
                  <option value="bank">?????? ??</option>
                  <option value="teacher">?????? ?????</option>
                  <option value="railway">??????</option>
                  <option value="ngo">?????</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">?????</label>
                <input 
                  type="text" 
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">??? ?? ??????</label>
                <input 
                  type="number" 
                  value={newPosts}
                  onChange={(e) => setNewPosts(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">??????? ??? ?????</label>
                <input 
                  type="text" 
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">?????? ?? (?)</label>
                <input 
                  type="number" 
                  value={newGovtFee}
                  onChange={(e) => setNewGovtFee(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">??????? ????? (?)</label>
                <input 
                  type="number" 
                  value={newServiceFee}
                  onChange={(e) => setNewServiceFee(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">???? ?????</label>
                <input 
                  type="text" 
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wide block">??????? ?????? ???-???????</span>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input type="checkbox" checked={shareToFacebook} onChange={(e) => setShareToFacebook(e.target.checked)} className="rounded text-emerald-600" />
                  <span>Facebook Page</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input type="checkbox" checked={shareToTelegram} onChange={(e) => setShareToTelegram(e.target.checked)} className="rounded text-emerald-600" />
                  <span>Telegram Channel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input type="checkbox" checked={shareToLinkedIn} onChange={(e) => setShareToLinkedIn(e.target.checked)} className="rounded text-emerald-600" />
                  <span>LinkedIn</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>????????? ?????? ? ??????? ????? ????</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: WEBSITE BUILDER */}
      {activeTab === 'builder' && (
        <WebsiteBuilder />
      )}

      {/* TAB 4: CANDIDATE DIRECTORY */}
      {activeTab === 'candidates' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">???????? ???????? ?????? ({candidates.length} ??)</h2>
            <span className="text-xs text-slate-500">???????? ????????? NID ?????? ??? ???</span>
          </div>
          <div className="divide-y divide-slate-100">
            {candidates.map((cand) => (
              <div key={cand.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 text-sm block">{cand.name} ({cand.username || cand.phone})</span>
                  <span className="text-xs text-slate-600 block">???: {cand.phone} | ?????: {cand.email} | ????: {cand.district}</span>
                  <span className="text-[11px] font-mono text-slate-400 block">NID: {cand.nid}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">????????? ????????</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS & RAFFLE */}
      {activeTab === 'coupons-raffle' && (
        <CouponsRaffleManagement />
      )}

      {/* TAB 6: JOB SOURCES & INGESTION DRAFTS */}
      {activeTab === 'sources' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">
              ?? ???? ??????????? ? ????? ??????? ????????
            </h2>
            <p className="text-xs text-slate-500">
              ?????? ??????? ? ????? ??????? ???? ??????????? ??? ????????? ?????????? ????? ??? ?-?????? ????????? ???? ?????
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sources.map((src) => (
              <div key={src.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 block">{src.name}</span>
                <span className="text-slate-500 block truncate">{src.sourceUrl}</span>
                <span className="text-[10px] text-emerald-600 font-bold block">? ????? ?????????: ?????????</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900">???????? ???? ????????? ?????????? ({drafts.length} ??)</h3>
            <div className="space-y-3">
              {drafts.map((d) => (
                <div key={d.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-sm block">{d.extractedTitle}</span>
                    <span className="text-slate-600 block">???: {d.sourceName} | ??: {d.vacancies} ?? | ???????: {d.deadline}</span>
                    <span className="text-emerald-800 font-bold text-[11px] block">??? ??????????? ?????????: {Math.round(d.confidenceScore * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectDraft(d.id)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold"
                    >
                      ?????
                    </button>
                    <button
                      onClick={() => handleApproveDraft(d.id)}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow"
                    >
                      ?-?????? ????????? ? ????
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: COMPANIES ATS */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">???????? ???????? ? ????????? ATS ({companies.length} ??)</h2>
            <p className="text-xs text-slate-500">???????? ???????????? ????????? ??????? ??? ??????????? ??????????? ???????</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {companies.map((comp) => (
              <div key={comp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <span className="font-black text-slate-900 text-sm block">{comp.name}</span>
                <span className="text-slate-600 block">???????????: {comp.industry} | ????: {comp.district}</span>
                <span className="text-slate-500 block">???????: {comp.contactEmail} ({comp.contactPhone})</span>
                <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full font-bold text-[10px]">
                  ???? ??: {comp.activeJobsCount} ??
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">??????? ???? ? ???????? ???????????? ??</h2>
            <span className="text-xs text-slate-500 font-mono">???????? ??????</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 text-[10px]">{log.id}</span>
                  <span className="text-slate-400">• {new Date(log.timestamp).toLocaleString('bn-BD')}</span>
                  <span className="px-2 py-0.2 bg-slate-100 text-slate-800 rounded font-mono font-bold text-[10px] uppercase">{log.action}</span>
                </div>
                <p className="text-slate-800 font-bold">{log.notes || '??????? ??????? ?????'}</p>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">???? ???? ?? ???? ????? ??????</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
`;

const part1 = fs.readFileSync(path.join(__dirname, 'admin_part1.txt'), 'utf8');
const part2 = fs.readFileSync(path.join(__dirname, 'admin_part2.txt'), 'utf8');
const part3 = fs.readFileSync(path.join(__dirname, 'admin_part3.txt'), 'utf8');

const targetFile = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
fs.writeFileSync(targetFile, part1 + part2 + part3 + part4, 'utf8');
console.log('Successfully written complete src/app/admin/page.tsx!');
