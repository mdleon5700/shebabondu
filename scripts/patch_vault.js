const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/vault/page.tsx', 'utf8');

code = code.replace(
  'export default function DocumentVaultPage() {\r\n  const [documents, setDocuments] = useState<CandidateDocument[]>(storage.getDocuments());',
  'export default function DocumentVaultPage() {\r\n  const [isMounted, setIsMounted] = useState(false);\r\n  const [documents, setDocuments] = useState<CandidateDocument[]>([]);'
).replace(
  'export default function DocumentVaultPage() {\n  const [documents, setDocuments] = useState<CandidateDocument[]>(storage.getDocuments());',
  'export default function DocumentVaultPage() {\n  const [isMounted, setIsMounted] = useState(false);\n  const [documents, setDocuments] = useState<CandidateDocument[]>([]);'
);

code = code.replace(
  'useEffect(() => {\r\n    setDocuments(storage.getDocuments());',
  'useEffect(() => {\r\n    setIsMounted(true);\r\n    setDocuments(storage.getDocuments());'
).replace(
  'useEffect(() => {\n    setDocuments(storage.getDocuments());',
  'useEffect(() => {\n    setIsMounted(true);\n    setDocuments(storage.getDocuments());'
);

const skeleton = `  if (!isMounted) {
    return (
      <div className="space-y-8 max-w-6xl animate-pulse p-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-100 rounded-2xl mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

`;

if (!code.includes('if (!isMounted)')) {
  code = code.replace(
    '  return (\r\n    <div className="space-y-8 max-w-6xl">',
    skeleton.replace(/\n/g, '\r\n') + '  return (\r\n    <div className="space-y-8 max-w-6xl">'
  ).replace(
    '  return (\n    <div className="space-y-8 max-w-6xl">',
    skeleton + '  return (\n    <div className="space-y-8 max-w-6xl">'
  );
}

fs.writeFileSync('src/app/dashboard/vault/page.tsx', code, 'utf8');
console.log('DocumentVaultPage updated with isMounted guard');
