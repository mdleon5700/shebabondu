const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'jobs', '[id]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Application Deadline Box
const oldDeadlineBox = `{/* Application Deadline & Trust Highlights (Fills the height gap with Right CTA Card) */}
            <div className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-teal-50/30 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>শেষ সময়: {job.deadline}</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    বাকি {toBn(job.daysRemaining)} দিন
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  রাত ১১:৫৯ মিনিট পর্যন্ত অফিশিয়াল সার্ভারে আবেদন ও ফি প্রদান করা যাবে
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-[11px] text-slate-700 font-bold border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                <span className="flex items-center gap-1 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ১০০% নির্ভুল টেলিটক ফরম
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-teal-800">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  অটো ফটো রিসাইজ
                </span>
              </div>
            </div>`;

const newDeadlineBox = `{/* Application Deadline & Trust Highlights (Fills the height gap with Right CTA Card) */}
            <div className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-teal-50/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
              <div className="space-y-1.5 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar">
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100/90 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap shrink-0">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>শেষ সময়: {job.deadline}</span>
                  </span>
                  <span className="inline-flex items-center font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs whitespace-nowrap shrink-0 shadow-2xs">
                    বাকি {toBn(job.daysRemaining)} দিন
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  রাত ১১:৫৯ মিনিট পর্যন্ত অফিশিয়াল সার্ভারে আবেদন ও ফি প্রদান করা যাবে
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 text-[11px] text-slate-700 font-bold border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                <span className="flex items-center gap-1 text-emerald-800 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  ১০০% নির্ভুল টেলিটক ফরম
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-teal-800 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  অটো ফটো রিসাইজ
                </span>
              </div>
            </div>`;

if (content.includes(oldDeadlineBox)) {
  content = content.replace(oldDeadlineBox, newDeadlineBox);
  console.log('1. Updated Deadline Box successfully');
} else {
  console.warn('1. WARNING: Could not find oldDeadlineBox exactly');
}

// 2. Update Social Share Bar
const oldShareBar = `{/* Small Sleek Social Share Bar on White Background */}
            <div className="flex items-center justify-start sm:justify-end gap-2 overflow-x-auto pb-1.5 sm:pb-1 no-scrollbar">
              <span style={{ fontSize: '15px' }} className="!text-[15px] font-bold text-slate-500 mr-0.5 whitespace-nowrap">শেয়ার:</span>
              
              <a
                href={\`https://facebook.com/sharer/sharer.php?u=\${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}\`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '15px' }}
                className="share-action-btn py-1.5 px-3 bg-white hover:bg-blue-50 text-slate-700 hover:text-[#1877F2] font-semibold !text-[15px] rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 hover:border-blue-300 shadow-2xs whitespace-nowrap"
                title="ফেসবুকে শেয়ার করুন"
              >
                <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
                <span style={{ fontSize: '15px' }}>Facebook</span>
              </a>

              <a
                href={\`https://wa.me/?text=\${encodeURIComponent(job.title + ' - বিস্তারিত দেখুন: ' + (typeof window !== 'undefined' ? window.location.href : ''))}\`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '15px' }}
                className="share-action-btn py-1.5 px-3 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold !text-[15px] rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 hover:border-emerald-300 shadow-2xs whitespace-nowrap"
                title="হোয়াটসঅ্যাপে শেয়ার করুন"
              >
                <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                <span style={{ fontSize: '15px' }}>WhatsApp</span>
              </a>

              <button
                onClick={handleCopy}
                style={{ fontSize: '15px' }}
                className={\`share-action-btn py-1.5 px-3 font-semibold !text-[15px] rounded-xl transition-all flex items-center gap-1.5 border shadow-2xs whitespace-nowrap \${
                  copiedLink
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }\`}
                title="সার্কুলার লিংক কপি করুন"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 text-slate-400 shrink-0" />}
                <span style={{ fontSize: '15px' }}>{copiedLink ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
              </button>
            </div>`;

const newShareBar = `{/* Small Sleek Social Share Bar on White Background */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full pb-1 sm:pb-0">
              <span className="text-xs sm:text-[14px] font-bold text-slate-500 whitespace-nowrap shrink-0">শেয়ার:</span>
              
              <a
                href={\`https://facebook.com/sharer/sharer.php?u=\${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-action-btn flex-1 sm:flex-none py-1.5 px-2.5 sm:px-3 bg-white hover:bg-blue-50 text-slate-700 hover:text-[#1877F2] font-semibold text-xs sm:text-[14px] rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 border border-slate-200 hover:border-blue-300 shadow-2xs whitespace-nowrap shrink-0"
                title="ফেসবুকে শেয়ার করুন"
              >
                <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1877F2] shrink-0" />
                <span>Facebook</span>
              </a>

              <a
                href={\`https://wa.me/?text=\${encodeURIComponent(job.title + ' - বিস্তারিত দেখুন: ' + (typeof window !== 'undefined' ? window.location.href : ''))}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-action-btn flex-1 sm:flex-none py-1.5 px-2.5 sm:px-3 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-xs sm:text-[14px] rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 border border-slate-200 hover:border-emerald-300 shadow-2xs whitespace-nowrap shrink-0"
                title="হোয়াটসঅ্যাপে শেয়ার করুন"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={handleCopy}
                className={\`share-action-btn flex-1 sm:flex-none py-1.5 px-2.5 sm:px-3 font-semibold text-xs sm:text-[14px] rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 border shadow-2xs whitespace-nowrap shrink-0 \${
                  copiedLink
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }\`}
                title="সার্কুলার লিংক কপি করুন"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />}
                <span>{copiedLink ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
              </button>
            </div>`;

if (content.includes(oldShareBar)) {
  content = content.replace(oldShareBar, newShareBar);
  console.log('2. Updated Social Share Bar successfully');
} else {
  console.warn('2. WARNING: Could not find oldShareBar exactly');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Finished updating deadline & share bar in page.tsx');
