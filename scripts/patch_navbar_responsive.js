const fs = require('fs');

const content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const navStart = content.indexOf('<nav className="hidden lg:flex');
const navEnd = content.indexOf('</nav>', navStart) + 6;

if (navStart === -1 || navEnd === -1) {
  console.error('nav tags not found!');
  process.exit(1);
}

const replacement = `<nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 font-bold text-slate-800 whitespace-nowrap flex-shrink-0">
            {navItems.map((item, index) => {
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
              const isCurrentOpen = activeDropdown === item.id;
              const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));

              // Responsive visibility: keeps navbar clean without overflow across screen sizes
              let visibilityClass = 'flex';
              if (index >= 6) {
                visibilityClass = 'hidden 2xl:flex';
              } else if (index === 5) {
                visibilityClass = 'hidden 2xl:flex';
              } else if (index === 4) {
                visibilityClass = 'hidden xl:flex';
              }

              return (
                <div 
                  key={item.id} 
                  className={\`relative \${visibilityClass}\`}
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.id)}
                  onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    aria-expanded={hasDropdown ? isCurrentOpen : undefined}
                    aria-haspopup={hasDropdown ? 'true' : undefined}
                    className={\`px-1.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[13px] xl:text-[14px] 2xl:text-[15px] whitespace-nowrap \${
                      isActive 
                        ? 'text-emerald-700 bg-emerald-50 font-black' 
                        : 'text-slate-800 hover:text-emerald-700 hover:bg-slate-50'
                    }\`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={\`text-[10px] font-black px-1.5 py-0.5 rounded-full \${
                        item.badgeColor === 'rose' ? 'bg-rose-100 text-rose-700' :
                        item.badgeColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                        item.badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                        item.badgeColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                        'bg-emerald-100 text-emerald-800'
                      }\`}>
                        {item.badge}
                      </span>
                    )}
                    {hasDropdown && (
                      <ChevronDown 
                        className={\`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 \${
                          isCurrentOpen ? 'rotate-180 text-emerald-700' : ''
                        }\`} 
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasDropdown && isCurrentOpen && (
                    <div className="absolute top-full pt-2 z-50 left-0 min-w-[260px] w-max">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.dropdown!.map((subItem, idx) => (
                          <Link
                            key={idx}
                            href={subItem.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2 text-[14px] text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold transition-colors whitespace-nowrap"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* "আরও" (More) Dropdown for items that overflow the current viewport */}
            {navItems.length > 4 && (
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('more-nav-items')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
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
                </button>

                {activeDropdown === 'more-nav-items' && (
                  <div className="absolute top-full pt-2 z-50 right-0 min-w-[280px] w-max max-h-[75vh] overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 py-2 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                      {navItems.map((item, index) => {
                        let hideClass = '';
                        if (index < 4) {
                          return null;
                        } else if (index === 4) {
                          hideClass = 'xl:hidden';
                        } else if (index === 5) {
                          hideClass = '2xl:hidden';
                        }

                        return (
                          <div key={\`more-\${item.id}\`} className={\`py-1.5 px-2 \${hideClass}\`}>
                            <Link
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[14px] font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            >
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                            {item.dropdown && item.dropdown.length > 0 && (
                              <div className="mt-1 pl-4 space-y-0.5 border-l-2 border-emerald-100 ml-3">
                                {item.dropdown.map((sub, sIdx) => (
                                  <Link
                                    key={sIdx}
                                    href={sub.href}
                                    onClick={() => setActiveDropdown(null)}
                                    className="block py-1 text-xs text-slate-600 hover:text-emerald-700 transition-colors"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>`;

const updated = content.substring(0, navStart) + replacement + content.substring(navEnd);
fs.writeFileSync('src/components/Navbar.tsx', updated, 'utf8');
console.log('Successfully updated Navbar.tsx!');

