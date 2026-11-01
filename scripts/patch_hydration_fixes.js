const fs = require('fs');

// 1. application-check/page.tsx
let f1 = fs.readFileSync('src/app/dashboard/application-check/page.tsx', 'utf8');
f1 = f1.replace(
  "export default function ApplicationCheckPage() {",
  "export default function ApplicationCheckPage() {\n  const [isMounted, setIsMounted] = useState(false);"
);
f1 = f1.replace(
  "useEffect(() => {\n    setProfile(storage.getUser());\n    setJobs(storage.getJobs());\n  }, []);",
  "useEffect(() => {\n    setIsMounted(true);\n    setProfile(storage.getUser());\n    setJobs(storage.getJobs());\n  }, []);"
);
f1 = f1.replace(
  "<span>{passedCount} / {checks.length} টি শর্ত পূরণ হয়েছে</span>",
  "<span suppressHydrationWarning>{isMounted ? passedCount : checks.length} / {checks.length} টি শর্ত পূরণ হয়েছে</span>"
);
fs.writeFileSync('src/app/dashboard/application-check/page.tsx', f1, 'utf8');
console.log('Fixed application-check/page.tsx');

// 2. transactions/page.tsx
let f2 = fs.readFileSync('src/app/dashboard/transactions/page.tsx', 'utf8');
f2 = f2.replace(
  "const [txs, setTxs] = useState<WalletTransaction[]>(storage.getTransactions());",
  "const [txs, setTxs] = useState<WalletTransaction[]>([]);\n  const [isMounted, setIsMounted] = useState(false);"
);
f2 = f2.replace(
  "useEffect(() => {\n    setTxs(storage.getTransactions());\n  }, []);",
  "useEffect(() => {\n    setIsMounted(true);\n    setTxs(storage.getTransactions());\n  }, []);"
);
fs.writeFileSync('src/app/dashboard/transactions/page.tsx', f2, 'utf8');
console.log('Fixed transactions/page.tsx');
