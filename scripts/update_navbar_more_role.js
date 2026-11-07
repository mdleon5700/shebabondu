const fs = require('fs');

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(
  `<button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'more-nav-items' ? null : 'more-nav-items')}
                  aria-expanded={activeDropdown === 'more-nav-items'}
                  className={\`px-2 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[13px] xl:text-[14px] whitespace-nowrap font-bold \${
                    activeDropdown === 'more-nav-items'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                  }\`}
                >
                  <span>আরও</span>
                  <ChevronDown className={\`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 \${activeDropdown === 'more-nav-items' ? 'rotate-180 text-emerald-700' : ''}\`} />
                </button>`,
  `<div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveDropdown(activeDropdown === 'more-nav-items' ? null : 'more-nav-items')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveDropdown(activeDropdown === 'more-nav-items' ? null : 'more-nav-items'); } }}
                  aria-expanded={activeDropdown === 'more-nav-items'}
                  className={\`cursor-pointer px-2 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[13px] xl:text-[14px] whitespace-nowrap font-bold \${
                    activeDropdown === 'more-nav-items'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                  }\`}
                >
                  <span>আরও</span>
                  <ChevronDown className={\`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 \${activeDropdown === 'more-nav-items' ? 'rotate-180 text-emerald-700' : ''}\`} />
                </div>`
);

fs.writeFileSync('src/components/Navbar.tsx', content, 'utf8');
console.log('Replaced button with div role=button in Navbar.tsx');

