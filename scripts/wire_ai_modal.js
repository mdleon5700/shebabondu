const fs = require('fs');
const file = 'C:/Users/Leon Rahman/Documents/chakri-sheba/src/components/admin/JobVerificationCenter.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes("import GeminiManagementCenter from './GeminiManagementCenter';")) {
  code = code.replace(
    "import { VerificationStatus } from '@/lib/verification/types';",
    "import { VerificationStatus } from '@/lib/verification/types';\nimport GeminiManagementCenter from './GeminiManagementCenter';"
  );
}

// Add state
if (!code.includes('isAiCenterOpen')) {
  code = code.replace(
    "const [selectedFieldForAction, setSelectedFieldForAction] = useState<string>('vacancies');",
    "const [selectedFieldForAction, setSelectedFieldForAction] = useState<string>('vacancies');\n  const [isAiCenterOpen, setIsAiCenterOpen] = useState<boolean>(false);"
  );
}

// Make KPI card clickable
const oldKpiCard = `<div className="p-4 bg-purple-50 border border-purple-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-purple-700 block">AI প্রোভাইডার স্ট্যাটাস</span>`;

const newKpiCard = `<div 
            onClick={() => setIsAiCenterOpen(true)} 
            className="p-4 bg-purple-50 border border-purple-200/80 rounded-2xl space-y-1 cursor-pointer hover:bg-purple-100/70 transition-all shadow-2xs"
            title="AI প্রোভাইডার কনফিগারেশন ও টোকেন এনালিটিক্স খুলুন"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-700 block">AI প্রোভাইডার স্ট্যাটাস</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            </div>`;

if (code.includes(oldKpiCard)) {
  code = code.replace(oldKpiCard, newKpiCard);
}

// Render component at bottom
if (!code.includes('<GeminiManagementCenter')) {
  code = code.replace(
    '      {/* 4. DEEP AUDIT & CONFLICT RESOLUTION MODAL */}',
    `      {/* AI MANAGEMENT CENTER MODAL */}
      <GeminiManagementCenter isOpen={isAiCenterOpen} onClose={() => setIsAiCenterOpen(false)} />

      {/* 4. DEEP AUDIT & CONFLICT RESOLUTION MODAL */}`
  );
}

fs.writeFileSync(file, code, 'utf8');
console.log('Successfully wired GeminiManagementCenter into JobVerificationCenter!');
