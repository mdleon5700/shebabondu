const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '..', 'src', 'components', 'JobDetailClient.tsx');
let code = fs.readFileSync(clientPath, 'utf8');

const targetStr = "return `/api/jobs/${job.id}/download`;\r\n  }, [job]);";
const targetStrAlt = "return `/api/jobs/${job.id}/download`;\n  }, [job]);";

const addition = `return \`/api/jobs/\${job.id}/download\`;
  }, [job]);

  const embedPdfUrl = useMemo(() => {
    if (!officialPdfUrl) return '';
    if (officialPdfUrl.startsWith('/api/') || officialPdfUrl.startsWith('/')) return officialPdfUrl;
    return \`/api/pdf-proxy?url=\${encodeURIComponent(officialPdfUrl)}\`;
  }, [officialPdfUrl]);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, addition);
} else if (code.includes(targetStrAlt)) {
  code = code.replace(targetStrAlt, addition);
}

code = code.replace(
  'src={`${officialPdfUrl}#view=FitH&toolbar=1`}',
  'src={`${embedPdfUrl}#view=FitH&toolbar=1`}'
);

fs.writeFileSync(clientPath, code, 'utf8');
console.log('✅ Updated JobDetailClient.tsx with embedPdfUrl proxy!');

