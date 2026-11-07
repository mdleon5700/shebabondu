const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'admin', 'WebsiteBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add left sidebar toggle button to toolbar
const toolbarLeftTarget = `<div className="flex flex-wrap items-center gap-3">`;
const toolbarLeftReplacement = `<div className="flex flex-wrap items-center gap-3">
          {viewMode === 'editor' && (
            <button
              type="button"
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={\`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer mt-4 \${
                showLeftSidebar ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }\`}
              title="উপাদান ও টেমপ্লেট সাইডবার টগল করুন"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{showLeftSidebar ? 'উপাদান লুকান' : 'উপাদান প্যানেল'}</span>
            </button>
          )}`;

if (content.includes(toolbarLeftTarget) && !content.includes('setShowLeftSidebar(!showLeftSidebar)')) {
  content = content.replace(toolbarLeftTarget, toolbarLeftReplacement);
}

// Wrap canvas in three-panel layout
const oldCanvasContainer = `{/* CANVAS & INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">`;

const newCanvasContainer = `{/* THREE-PANEL BUILDER WORKSPACE */}
      <div className="flex bg-slate-100 rounded-3xl border border-slate-200/90 shadow-inner overflow-hidden min-h-[750px] relative">
        
        {/* PANEL 1: LEFT SIDEBAR (Elements, Sections, Templates, Layers, Globals, Media) */}
        {viewMode === 'editor' && showLeftSidebar && currentPage && (
          <BuilderLeftSidebar
            currentPage={currentPage}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
            onAddSection={(type, customData) => {
              pushHistory(currentPage.sections);
              if (customData) {
                const newSec: PageSection = {
                  id: 'sec-' + Date.now(),
                  type,
                  title: customData.title || 'নতুন সেকশন',
                  subtitle: customData.subtitle || '',
                  content: customData.content || {},
                  style: {
                    backgroundColor: '#ffffff',
                    textColor: '#0f172a',
                    paddingY: 'lg',
                    textAlign: 'center',
                    columns: 3,
                    ...customData.style
                  },
                  isVisible: true
                };
                updateCurrentPage(p => ({ ...p, sections: [...p.sections, newSec] }));
                setActiveSectionId(newSec.id);
              } else {
                handleAddSection(type);
              }
            }}
            onMoveSection={(idx, dir) => {
              pushHistory(currentPage.sections);
              handleMoveSection(idx, dir);
            }}
            onDuplicateSection={(idx) => {
              pushHistory(currentPage.sections);
              handleDuplicateSection(idx);
            }}
            onDeleteSection={(idx) => {
              pushHistory(currentPage.sections);
              handleDeleteSection(idx);
            }}
            onToggleSectionVisibility={(id) => {
              pushHistory(currentPage.sections);
              updateCurrentPage(p => ({
                ...p,
                sections: p.sections.map(s => s.id === id ? { ...s, isVisible: s.isVisible === false } : s)
              }));
            }}
            onApplyTemplate={handleApplyTemplate}
            onOpenChromeSettings={() => setShowChromeSettingsModal(true)}
            onSelectMediaImage={(url) => {
              if (activeSection) {
                updateCurrentPage(p => ({
                  ...p,
                  sections: p.sections.map(s => s.id === activeSection.id ? {
                    ...s,
                    content: { ...s.content, imageUrl: url }
                  } : s)
                }));
              }
            }}
          />
        )}

        {/* PANEL 2: CENTER CANVAS & PANEL 3: RIGHT INSPECTOR */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">`;

if (content.includes(oldCanvasContainer.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldCanvasContainer.replace(/\n/g, '\r\n'), newCanvasContainer.replace(/\n/g, '\r\n'));
} else if (content.includes(oldCanvasContainer)) {
  content = content.replace(oldCanvasContainer, newCanvasContainer);
}

// Close the extra wrapper div right before modals
const modalBeforeAnchor = `{/* Pre-Publish Quality Audit Modal */}`;
if (content.includes(modalBeforeAnchor) && !content.includes('</div>\n        </div>\n\n      </div>\n\n      {/* Pre-Publish Quality Audit Modal */}')) {
  content = content.replace(
    modalBeforeAnchor,
    `</div>\n        </div>\n      </div>\n\n      {/* Pre-Publish Quality Audit Modal */}`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Step 3 Three-Panel Layout applied successfully!');

