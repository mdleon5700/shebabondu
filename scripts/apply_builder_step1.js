const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'admin', 'WebsiteBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports if not present
if (!content.includes("import BuilderLeftSidebar from './builder/BuilderLeftSidebar';")) {
  content = content.replace(
    "import { PageRecord, PageSection, SectionType, PageRevision } from '@/lib/types';",
    `import { PageRecord, PageSection, SectionType, PageRevision } from '@/lib/types';
import BuilderLeftSidebar from './builder/BuilderLeftSidebar';
import BuilderRightInspector from './builder/BuilderRightInspector';
import BuilderPublishModal from './builder/BuilderPublishModal';
import { PRESET_PAGE_TEMPLATES } from './builder/templates/presetTemplates';
import { RotateCcw, RotateCw } from 'lucide-react';`
  );
}

// 2. Add Undo/Redo & Publish Modal state if not present
if (!content.includes('const [showPublishModal, setShowPublishModal]')) {
  content = content.replace(
    "  const [chromeSaveSuccess, setChromeSaveSuccess] = useState<boolean>(false);",
    `  const [chromeSaveSuccess, setChromeSaveSuccess] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [history, setHistory] = useState<PageSection[][]>([]);
  const [redoStack, setRedoStack] = useState<PageSection[][]>([]);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);

  const pushHistory = (sections: PageSection[]) => {
    setHistory(prev => [...prev.slice(-20), JSON.parse(JSON.stringify(sections))]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0 || !currentPage) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(currentPage.sections))]);
    setHistory(prev => prev.slice(0, -1));
    updateCurrentPage(p => ({ ...p, sections: previous }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !currentPage) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(currentPage.sections))]);
    setRedoStack(prev => prev.slice(0, -1));
    updateCurrentPage(p => ({ ...p, sections: next }));
  };

  const handleApplyTemplate = (templateId: string) => {
    if (!currentPage) return;
    const tpl = PRESET_PAGE_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    pushHistory(currentPage.sections);
    updateCurrentPage(p => ({
      ...p,
      sections: JSON.parse(JSON.stringify(tpl.sections))
    }));
    setActiveSectionId(tpl.sections[0]?.id || null);
    setSaveStatus('"' + tpl.name + '" টেমপ্লেট সফলভাবে প্রয়োগ করা হয়েছে!');
    setTimeout(() => setSaveStatus(null), 3000);
  };`
  );
}

// 3. Add Keyboard Listener for Ctrl+Z and Ctrl+Y
if (!content.includes('// Builder Keyboard Shortcuts')) {
  content = content.replace(
    "  useEffect(() => {\n    fetchPages();",
    `  // Builder Keyboard Shortcuts (Undo / Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, redoStack, currentPage]);

  useEffect(() => {
    fetchPages();`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Step 1 applied successfully!');

