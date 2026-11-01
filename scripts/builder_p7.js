const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');

const part7 = `
          {/* TAB 5: JOBS -> CIRCULARS */}
          {activeTab === 'circulars' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-black text-sm text-slate-900">সকল সক্রিয় ও আর্কাইভ নিয়োগ বিজ্ঞপ্তি</h2>
                <button
                  type="button"
                  onClick={() => handleTabChange('create-circular')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>নতুন সার্কুলার যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">প্রতিষ্ঠানের নাম ও পদবী</th>
                      <th className="py-3 px-3">ক্যাটাগরি</th>
                      <th className="py-3 px-3">পদসংখ্যা</th>
                      <th className="py-3 px-3">আবেদনের শেষ সময়</th>
                      <th className="py-3 px-3">ফি</th>
                      <th className="py-3 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{job.title}</div>
                          <div className="text-[11px] text-slate-500">{job.organization}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {job.categoryLabel || job.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold">{job.totalPosts} টি</td>
                        <td className="py-3 px-3 text-slate-600">{job.deadline}</td>
                        <td className="py-3 px-3 font-bold text-emerald-800">৳{job.govtFee + job.serviceFee}</td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={'/jobs/' + job.id}
                            target="_blank"
                            className="text-xs font-bold text-emerald-700 hover:underline"
                          >
                            দেখুন →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: JOBS -> CREATE CIRCULAR */}
          {activeTab === 'create-circular' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6 max-w-3xl">
              <div>
                <h2 className="font-black text-base text-slate-900">নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশ</h2>
                <p className="text-xs text-slate-500 font-medium">
                  সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন। এটি সরাসরি ওয়েবসাইটে লাইভ প্রকাশ পাবে।
                </p>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পদবীর নাম ও সার্কুলার টাইটেল *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: বাংলাদেশ ব্যাংক সহকারী পরিচালক (জেনারেল)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: বাংলাদেশ ব্যাংক"
                      value={newOrg}
                      onChange={(e) => setNewOrg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ক্যাটাগরি</label>
                    <select
                      value={newCategory}
                      onChange={(e: any) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="govt">সরকারি চাকরি</option>
                      <option value="bank">ব্যাংক জব</option>
                      <option value="railway">রেলওয়ে</option>
                      <option value="defense">প্রতিরক্ষা / ডিফেন্স</option>
                      <option value="teacher">শিক্ষক নিয়োগ</option>
                      <option value="ngo">এনজিও</option>
                      <option value="private">বেসরকারি কোম্পানি</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">গ্রেড</label>
                    <input
                      type="text"
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পদসংখ্যা</label>
                    <input
                      type="text"
                      value={newVacancies}
                      onChange={(e) => setNewVacancies(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বেতন স্কেল</label>
                    <input
                      type="text"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ন্যূনতম শিক্ষাগত যোগ্যতা</label>
                    <input
                      type="text"
                      value={newEducation}
                      onChange={(e) => setNewEducation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">আবেদনের শেষ তারিখ</label>
                    <input
                      type="text"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সরকারি ফি (টাকা)</label>
                    <input
                      type="number"
                      value={newGovtFee}
                      onChange={(e) => setNewGovtFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সার্ভিস ফি (টাকা)</label>
                    <input
                      type="number"
                      value={newServiceFee}
                      onChange={(e) => setNewServiceFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingJob}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isSubmittingJob ? 'প্রকাশ হচ্ছে...' : 'সার্কুলার প্রকাশ করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: JOBS -> SOURCE MONITORING & DRAFTS */}
          {(activeTab === 'source-monitoring' || activeTab === 'imported-drafts') && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="font-black text-sm text-slate-900">ইম্পোর্ট খসড়া কিউ (অটো-স্ক্র্যাপড সার্কুলার)</h2>
                  <span className="text-xs font-bold text-slate-500">মোট খসড়া: {drafts.length}</span>
                </div>

                {drafts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    কোনো নতুন খসড়া সার্কুলার অপেক্ষমাণ নেই।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {drafts.map((draft) => (
                      <div key={draft.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{draft.extractedTitle}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                              AI কনফিডেন্স: {Math.round(draft.confidenceScore * 100)}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            উৎস: {draft.sourceName} • প্রতিষ্ঠান: {draft.extractedOrg} • পদসংখ্যা: {draft.vacancies} • ডেডলাইন: {draft.deadline}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleApproveDraft(draft)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>অনুমোদন ও লাইভ করুন</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Source List */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">মনিটরকৃত নিয়োগ পোর্টাল ও সোর্সসমূহ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sources.map((src) => (
                    <div key={src.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <div className="font-bold text-xs text-slate-800">{src.name}</div>
                      <a href={src.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-700 hover:underline font-mono truncate block mt-0.5">
                        {src.sourceUrl}
                      </a>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span>স্ট্যাটাস: সক্রিয়</span>
                        <span className="text-emerald-700 font-bold">Auto-Sync On</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
`;

fs.appendFileSync(target, part7, 'utf8');
console.log('Appended part 7');
