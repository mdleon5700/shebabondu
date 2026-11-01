const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/wallet/page.tsx', 'utf8');

code = code.replace(
  'export default function WalletPage() {\r\n  const [profile, setProfile] = useState<CandidateProfile>(storage.getUser());',
  'export default function WalletPage() {\r\n  const [isMounted, setIsMounted] = useState(false);\r\n  const [profile, setProfile] = useState<CandidateProfile>(storage.getUser());'
).replace(
  'export default function WalletPage() {\n  const [profile, setProfile] = useState<CandidateProfile>(storage.getUser());',
  'export default function WalletPage() {\n  const [isMounted, setIsMounted] = useState(false);\n  const [profile, setProfile] = useState<CandidateProfile>(storage.getUser());'
);

code = code.replace(
  'useEffect(() => {\r\n    // 1. Local user',
  'useEffect(() => {\r\n    setIsMounted(true);\r\n    // 1. Local user'
).replace(
  'useEffect(() => {\n    // 1. Local user',
  'useEffect(() => {\n    setIsMounted(true);\n    // 1. Local user'
);

const skeleton = `  if (!isMounted) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse p-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-44 bg-slate-100 rounded-3xl mb-4"></div>
        <div className="h-64 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

`;

if (!code.includes('if (!isMounted)')) {
  code = code.replace(
    '  return (\r\n    <div className="space-y-6 max-w-4xl">',
    skeleton.replace(/\n/g, '\r\n') + '  return (\r\n    <div className="space-y-6 max-w-4xl">'
  ).replace(
    '  return (\n    <div className="space-y-6 max-w-4xl">',
    skeleton + '  return (\n    <div className="space-y-6 max-w-4xl">'
  );
}

fs.writeFileSync('src/app/dashboard/wallet/page.tsx', code, 'utf8');
console.log('WalletPage updated with isMounted guard');
