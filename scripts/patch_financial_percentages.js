const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../src/components/admin/FinancialTransactionsLedger.tsx');
let content = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');

const oldBlock = `              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>টেলিটক ও সরকারি চালান ফি</span>
                    <span>৳{totalGovtFees} (৬৪%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>চাকরি সেবা নিট সার্ভিস চার্জ</span>
                    <span>৳{totalServiceFees} (৩৬%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '36%' }} />
                  </div>
                </div>
              </div>`;

const newBlock = `              {(() => {
                const totalSumFees = (totalGovtFees + totalServiceFees) || 1;
                const govtPct = Math.round((totalGovtFees / totalSumFees) * 100);
                const servicePct = 100 - govtPct;
                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>টেলিটক ও সরকারি চালান ফি</span>
                        <span>৳{totalGovtFees} ({toBnNumber(govtPct)}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: \`\${govtPct}%\` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>চাকরি সেবা নিট সার্ভিস চার্জ</span>
                        <span>৳{totalServiceFees} ({toBnNumber(servicePct)}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: \`\${servicePct}%\` }} />
                      </div>
                    </div>
                  </div>
                );
              })()}`;

if (!content.includes(oldBlock)) {
  console.error('Target block not found in FinancialTransactionsLedger.tsx');
  process.exit(1);
}

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(target, content, 'utf8');
console.log('Successfully patched FinancialTransactionsLedger.tsx with dynamic percentages!');
