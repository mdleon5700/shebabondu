const fs = require('fs');
const file = 'src/app/dashboard/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {edu.level}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{edu.degree}</span>
                  </div>`;

const replacement = `                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {edu.level}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{edu.degree}</span>
                    {edu.verificationStatus === 'VERIFIED' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        ✓ যাচাইকৃত
                      </span>
                    )}
                    {edu.verificationStatus === 'NEEDS_CORRECTION' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        সংশোধন প্রয়োজন
                      </span>
                    )}
                    {edu.verificationStatus === 'REJECTED' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        বাতিল
                      </span>
                    )}
                    {edu.verificationStatus === 'PENDING_REVIEW' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        যাচাই অপেক্ষমান
                      </span>
                    )}
                  </div>
                  {edu.verificationRemarks && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 mt-1 inline-block">
                      ভেরিফিকেশন মন্তব্য: {edu.verificationRemarks}
                    </div>
                  )}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully enhanced profile page education cards with verification badges');
} else {
  console.log('Target not found in profile page');
}
