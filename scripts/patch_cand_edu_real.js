const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../src/components/admin/CandidateManagementHub.tsx');
let content = fs.readFileSync(target, 'utf8');

const oldBlock = `              {/* Education Fields */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">শিক্ষাগত রোল ও রেজাল্ট:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'SSC ROLL', val: '109841' },
                    { label: 'SSC REG', val: '1512409841' },
                    { label: 'SSC GPA', val: '5.00' },
                    { label: 'HSC ROLL', val: '214589' },
                    { label: 'HSC REG', val: '1512409841' },
                    { label: 'HSC GPA', val: '4.92' },
                    { label: 'HONOURS CGPA', val: '3.68' },
                    { label: 'PASSING YEAR', val: '2021' }
                  ].map((f, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => copyToClipboard(f.val, f.label)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all"
                    >
                      <span className="text-[10px] text-slate-400 block font-mono">{f.label}</span>
                      <span className="font-bold text-slate-900 font-mono text-[11px] block">{f.val}</span>
                    </button>
                  ))}
                </div>
              </div>`;

const newBlock = `              {/* Education Fields - 100% REAL CANDIDATE DATA */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">শিক্ষাগত রোল ও রেজাল্ট:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(() => {
                    const edus = currentCandidate?.education || [];
                    const ssc = edus.find((e: any) => (e.level || e.exam || e.degree || '').toLowerCase().includes('ssc'));
                    const hsc = edus.find((e: any) => (e.level || e.exam || e.degree || '').toLowerCase().includes('hsc'));
                    const grad = edus.find((e: any) => (e.level || e.exam || e.degree || '').toLowerCase().includes('honour') || (e.level || '').toLowerCase().includes('degree') || (e.level || '').toLowerCase().includes('bachelor'));

                    const eduFields = [
                      { label: 'SSC ROLL', val: ssc?.roll || (currentCandidate as any)?.sscRoll || 'উপলব্ধ নয়' },
                      { label: 'SSC REG', val: ssc?.registration || (currentCandidate as any)?.regNo || 'উপলব্ধ নয়' },
                      { label: 'SSC GPA', val: ssc?.result || ssc?.gpa || 'উপলব্ধ নয়' },
                      { label: 'HSC ROLL', val: hsc?.roll || (currentCandidate as any)?.hscRoll || 'উপলব্ধ নয়' },
                      { label: 'HSC REG', val: hsc?.registration || (currentCandidate as any)?.regNo || 'উপলব্ধ নয়' },
                      { label: 'HSC GPA', val: hsc?.result || hsc?.gpa || 'উপলব্ধ নয়' },
                      { label: 'HONOURS CGPA', val: grad?.result || grad?.cgpa || 'উপলব্ধ নয়' },
                      { label: 'PASSING YEAR', val: grad?.passingYear || hsc?.passingYear || ssc?.passingYear || 'উপলব্ধ নয়' }
                    ];

                    return eduFields.map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => f.val !== 'উপলব্ধ নয়' && copyToClipboard(f.val, f.label)}
                        className={\`p-2 rounded-xl text-left transition-all \${
                          f.val !== 'উপলব্ধ নয়'
                            ? 'bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 cursor-pointer'
                            : 'bg-slate-50/50 border border-dashed border-slate-200 cursor-default opacity-60'
                        }\`}
                      >
                        <span className="text-[10px] text-slate-400 block font-mono">{f.label}</span>
                        <span className="font-bold text-slate-900 font-mono text-[11px] block">{f.val}</span>
                      </button>
                    ));
                  })()}
                </div>
              </div>`;

const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedOld = oldBlock.replace(/\r\n/g, '\n');

if (!normalizedContent.includes(normalizedOld)) {
  console.error('Target block not found!');
  process.exit(1);
}

const updated = normalizedContent.replace(normalizedOld, newBlock.replace(/\r\n/g, '\n'));
fs.writeFileSync(target, updated, 'utf8');
console.log('Successfully replaced dummy education rolls with real data!');
