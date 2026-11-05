const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '..', 'src', 'components', 'JobDetailClient.tsx');
let code = fs.readFileSync(clientPath, 'utf8');

// 1. Add viewerTab state
if (!code.includes('viewerTab')) {
  code = code.replace(
    "const [activeNoticePage, setActiveNoticePage] = useState(0);",
    `const [activeNoticePage, setActiveNoticePage] = useState(0);
  const [viewerTab, setViewerTab] = useState<'pdf' | 'summary'>('pdf');`
  );
}

// 2. Add isPdfNotice detection
if (!code.includes('isPdfNotice')) {
  code = code.replace(
    "const officialPdfUrl = useMemo(() => {",
    `const isPdfNotice = useMemo(() => {
    const url = job.circularPdfUrl || job.circularImage || '';
    return Boolean(url && (url.toLowerCase().includes('.pdf') || url.includes('/uploads/') || url.includes('advertisement')));
  }, [job]);

  const officialPdfUrl = useMemo(() => {`
  );
}

// 3. Add Tab Toggle in Header of Section 9
const headerButtonsOld = `<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">`;
const headerButtonsNew = `<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {isPdfNotice && (
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold mr-1">
                <button
                  type="button"
                  onClick={() => setViewerTab('pdf')}
                  className={\`px-3 py-1.5 rounded-lg transition-all \${viewerTab === 'pdf' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}\`}
                >
                  📄 মূল অফিশিয়াল PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewerTab('summary')}
                  className={\`px-3 py-1.5 rounded-lg transition-all \${viewerTab === 'summary' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}\`}
                >
                  🖼️ সারসংক্ষেপ পাতা
                </button>
              </div>
            )}`;

if (!code.includes('📄 মূল অফিশিয়াল PDF')) {
  code = code.replace(headerButtonsOld, headerButtonsNew);
}

// 4. Render embedded PDF iframe when viewerTab === 'pdf'
const figureOld = `<figure className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-100/60 p-2 sm:p-4 transition-all">`;
const figureNew = `{isPdfNotice && viewerTab === 'pdf' ? (
          <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-900 shadow-md overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-slate-800 text-slate-200 text-xs flex items-center justify-between border-b border-slate-700">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <FileText className="w-3.5 h-3.5" />
                <span>{job.organization} মূল অফিশিয়াল সার্কুলার গেজেট (হাই-রেজোলিউশন PDF)</span>
              </span>
              <a
                href={officialPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white hover:text-emerald-300 font-bold flex items-center gap-1 underline"
              >
                নতুন ট্যাবে বড় করে দেখুন ↗
              </a>
            </div>
            <iframe
              src={\`\${officialPdfUrl}#view=FitH&toolbar=1\`}
              className="w-full h-[650px] sm:h-[850px] border-0 bg-white"
              title={\`\${job.organization} অফিসিয়াল সার্কুলার PDF\`}
            />
          </div>
        ) : (
        <figure className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-100/60 p-2 sm:p-4 transition-all">`;

const figureClosingOld = `</figure>\r\n      </section>`;
const figureClosingOldAlt = `</figure>\n      </section>`;
const figureClosingNew = `</figure>\n        )}\n      </section>`;

if (!code.includes('হাই-রেজোলিউশন PDF')) {
  code = code.replace(figureOld, figureNew);
  if (code.includes(figureClosingOld)) {
    code = code.replace(figureClosingOld, figureClosingNew);
  } else if (code.includes(figureClosingOldAlt)) {
    code = code.replace(figureClosingOldAlt, figureClosingNew);
  }
}

fs.writeFileSync(clientPath, code, 'utf8');
console.log('✅ Successfully upgraded JobDetailClient with Real Embedded PDF Viewer!');
