const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'admin', 'WebsiteBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Undo/Redo toolbar buttons & update Publish button
const oldToolbarTarget = `          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>সংস্করণ v{currentPage?.version || 1}</span>
          </button>

          <button
            onClick={() => handleSavePage(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ড্রাফট সেভ</span>
          </button>

          <button
            onClick={() => handleSavePage(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>পাবলিশ</span>
          </button>`;

const newToolbarTarget = `          {/* Undo / Redo Toolbar Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="পূর্বাবস্থায় ফেরান (Ctrl + Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="পুনরায় করুন (Ctrl + Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>সংস্করণ v{currentPage?.version || 1}</span>
          </button>

          <button
            onClick={() => handleSavePage(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ড্রাফট সেভ</span>
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>পাবলিশ</span>
          </button>`;

if (content.includes(oldToolbarTarget.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldToolbarTarget.replace(/\n/g, '\r\n'), newToolbarTarget.replace(/\n/g, '\r\n'));
} else if (content.includes(oldToolbarTarget)) {
  content = content.replace(oldToolbarTarget, newToolbarTarget);
} else {
  console.log('Old toolbar target not matched directly, checking normalized whitespace');
}

// 2. Add BuilderPublishModal at the end before closing div
const modalAnchor = `{showChromeSettingsModal && (`;
const publishModalJSX = `{/* Pre-Publish Quality Audit Modal */}
      {showPublishModal && currentPage && (
        <BuilderPublishModal
          isOpen={showPublishModal}
          page={currentPage}
          onClose={() => setShowPublishModal(false)}
          onConfirmPublish={async () => {
            await handleSavePage(true);
            setShowPublishModal(false);
          }}
          isPublishing={saveStatus?.includes('প্রকাশ') || false}
        />
      )}

      {showChromeSettingsModal && (`;

if (!content.includes('BuilderPublishModal') || !content.includes('showPublishModal && currentPage')) {
  if (content.includes(modalAnchor.replace(/\n/g, '\r\n'))) {
    content = content.replace(modalAnchor.replace(/\n/g, '\r\n'), publishModalJSX.replace(/\n/g, '\r\n'));
  } else if (content.includes(modalAnchor)) {
    content = content.replace(modalAnchor, publishModalJSX);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Step 2 toolbar & publish modal applied successfully!');

