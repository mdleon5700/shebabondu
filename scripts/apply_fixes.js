const fs = require('fs');

// 1. Fix globals.css
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace(
  `src: url('/fonts/solaimanlipi-normal.woff2') format('woff2'),
       url('https://fonts.maateen.me/solaiman-lipi/solaimanlipi-normal-v1.0.woff2') format('woff2');`,
  `src: url('/fonts/solaimanlipi-normal.woff2') format('woff2');`
);
css = css.replace(
  `src: url('/fonts/solaimanlipi-normal.woff2') format('woff2'),\r\n       url('https://fonts.maateen.me/solaiman-lipi/solaimanlipi-normal-v1.0.woff2') format('woff2');`,
  `src: url('/fonts/solaimanlipi-normal.woff2') format('woff2');`
);
css = css.replace(
  `src: url('/fonts/solaimanlipi-bold.woff2') format('woff2'),
       url('https://fonts.maateen.me/solaiman-lipi/solaimanlipi-bold-v1.0.woff2') format('woff2');`,
  `src: url('/fonts/solaimanlipi-bold.woff2') format('woff2');`
);
css = css.replace(
  `src: url('/fonts/solaimanlipi-bold.woff2') format('woff2'),\r\n       url('https://fonts.maateen.me/solaiman-lipi/solaimanlipi-bold-v1.0.woff2') format('woff2');`,
  `src: url('/fonts/solaimanlipi-bold.woff2') format('woff2');`
);
fs.writeFileSync('src/app/globals.css', css, 'utf8');
console.log('globals.css updated');

// 2. Fix layout.tsx
let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
layout = layout.replace(
  `        <link rel="stylesheet" href="https://fonts.maateen.me/solaiman-lipi/font.css" />\r\n`,
  ''
).replace(
  `        <link rel="stylesheet" href="https://fonts.maateen.me/solaiman-lipi/font.css" />\n`,
  ''
);
fs.writeFileSync('src/app/layout.tsx', layout, 'utf8');
console.log('layout.tsx updated');

// 3. Fix application-check/page.tsx
let appCheck = fs.readFileSync('src/app/dashboard/application-check/page.tsx', 'utf8');
appCheck = appCheck.replace(
  'useEffect(() => {\r\n    setProfile(storage.getUser());',
  'useEffect(() => {\r\n    setIsMounted(true);\r\n    setProfile(storage.getUser());'
).replace(
  'useEffect(() => {\n    setProfile(storage.getUser());',
  'useEffect(() => {\n    setIsMounted(true);\n    setProfile(storage.getUser());'
);
if (!appCheck.includes('if (!isMounted)')) {
  appCheck = appCheck.replace(
    '  return (\r\n    <div className="space-y-6 max-w-5xl">',
    '  if (!isMounted) {\r\n    return <div className="space-y-6 max-w-5xl animate-pulse p-6"><div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div><div className="h-32 bg-slate-100 rounded-2xl mb-4"></div><div className="h-64 bg-slate-100 rounded-2xl"></div></div>;\r\n  }\r\n\r\n  return (\r\n    <div className="space-y-6 max-w-5xl">'
  ).replace(
    '  return (\n    <div className="space-y-6 max-w-5xl">',
    '  if (!isMounted) {\n    return <div className="space-y-6 max-w-5xl animate-pulse p-6"><div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div><div className="h-32 bg-slate-100 rounded-2xl mb-4"></div><div className="h-64 bg-slate-100 rounded-2xl"></div></div>;\n  }\n\n  return (\n    <div className="space-y-6 max-w-5xl">'
  );
}
fs.writeFileSync('src/app/dashboard/application-check/page.tsx', appCheck, 'utf8');
console.log('application-check/page.tsx updated');

// 4. Fix transactions/page.tsx
let tx = fs.readFileSync('src/app/dashboard/transactions/page.tsx', 'utf8');
tx = tx.replace(
  'useEffect(() => {\r\n    setTxs(storage.getTransactions());\r\n  }, []);',
  'useEffect(() => {\r\n    setIsMounted(true);\r\n    setTxs(storage.getTransactions());\r\n  }, []);'
).replace(
  'useEffect(() => {\n    setTxs(storage.getTransactions());\n  }, []);',
  'useEffect(() => {\n    setIsMounted(true);\n    setTxs(storage.getTransactions());\n  }, []);'
);
if (!tx.includes('if (!isMounted)')) {
  tx = tx.replace(
    '  return (\r\n    <div className="space-y-6 max-w-4xl">',
    '  if (!isMounted) {\r\n    return <div className="space-y-6 max-w-4xl animate-pulse p-6"><div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div><div className="h-32 bg-slate-100 rounded-2xl"></div></div>;\r\n  }\r\n\r\n  return (\r\n    <div className="space-y-6 max-w-4xl">'
  ).replace(
    '  return (\n    <div className="space-y-6 max-w-4xl">',
    '  if (!isMounted) {\n    return <div className="space-y-6 max-w-4xl animate-pulse p-6"><div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div><div className="h-32 bg-slate-100 rounded-2xl"></div></div>;\n  }\n\n  return (\n    <div className="space-y-6 max-w-4xl">'
  );
}
fs.writeFileSync('src/app/dashboard/transactions/page.tsx', tx, 'utf8');
console.log('transactions/page.tsx updated');

// 5. Fix admin/page.tsx runLiveDiagnostics
let admin = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
admin = admin.replace(
  'const res = await fetch(ep.url);',
  'const res = await fetch(ep.url, { headers: { \'x-admin-secret\': \'CHAKRISEBA_SECURE_ADMIN_2026\' } });'
);
fs.writeFileSync('src/app/admin/page.tsx', admin, 'utf8');
console.log('admin/page.tsx updated');
