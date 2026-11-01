const fs = require('fs');

// 1. globals.css
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('overflow-x: hidden')) {
  css = css.replace(
    "html, body {\n  font-family: 'SolaimanLipi', Arial, sans-serif !important;\n  line-height: 1.6;\n  background-color: #f8fafc;\n  color: #0f172a;\n}",
    "html, body {\n  font-family: 'SolaimanLipi', Arial, sans-serif !important;\n  line-height: 1.6;\n  background-color: #f8fafc;\n  color: #0f172a;\n  overflow-x: hidden !important;\n  max-width: 100vw !important;\n}"
  );
  fs.writeFileSync('src/app/globals.css', css, 'utf8');
  console.log('Fixed globals.css');
}

// 2. layout.tsx
let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
if (!layout.includes('overflow-x-hidden')) {
  layout = layout.replace(
    'className="font-solaiman min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white"',
    'className="font-solaiman min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white overflow-x-hidden max-w-full"'
  );
  fs.writeFileSync('src/app/layout.tsx', layout, 'utf8');
  console.log('Fixed layout.tsx');
}

// 3. Navbar.tsx
let nav = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Header overflow
nav = nav.replace(
  '<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm" ref={navRef}>',
  '<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full max-w-full overflow-hidden" ref={navRef}>'
);

// Desktop nav breakpoints & sizing
nav = nav.replace(
  'className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 font-bold text-[17px] text-slate-800 whitespace-nowrap flex-shrink-0"',
  'className="hidden xl:flex items-center gap-0.5 2xl:gap-1.5 font-bold text-[14px] 2xl:text-[16px] text-slate-800 whitespace-nowrap flex-shrink-0"'
);

nav = nav.replace(
  'className={`px-2 xl:px-3 py-2 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[17px] whitespace-nowrap ${',
  'className={`px-1.5 2xl:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px] 2xl:text-[16px] whitespace-nowrap ${'
);

// WhatsApp & Login button sizes
nav = nav.replace(
  'className="px-3.5 py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 text-[17px] font-bold transition-all flex items-center gap-1.5 shadow-sm"',
  'className="px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-xl border-2 border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 text-xs 2xl:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm"'
);

nav = nav.replace(
  'className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[17px] font-black shadow-md shadow-emerald-800/20 transition-all flex items-center gap-1.5"',
  'className="px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs 2xl:text-sm font-black shadow-md shadow-emerald-800/20 transition-all flex items-center gap-1.5"'
);

// Mobile toggle button breakpoint
nav = nav.replace(
  '<div className="flex lg:hidden items-center gap-2">',
  '<div className="flex xl:hidden items-center gap-2">'
);

// Mobile drawer breakpoint
nav = nav.replace(
  '{mobileMenuOpen && (\n        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto">',
  '{mobileMenuOpen && (\n        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto">'
);

fs.writeFileSync('src/components/Navbar.tsx', nav, 'utf8');
console.log('Fixed Navbar.tsx');
