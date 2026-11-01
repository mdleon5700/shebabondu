const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');

const part5 = `
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-solaiman">
      
      {/* 1. DEDICATED ADMIN TOP BAR */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand Badge & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-white text-base">চাকরি সেবা</span>
                  <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-700/60">
                    অ্যাডমিন কনসোল
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">ভার্সন ২.৬ এন্টারপ্রাইজ • বিডি রিক্রুটমেন্ট হাব</p>
              </div>
            </div>
          </div>

          {/* Center System Status */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">লাইভ সার্ভার কানেক্টেড • লোকাল ডাটাবেস সিঙ্কড</span>
          </div>

          {/* Right Action Icons & Admin Profile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAllAdminData}
              disabled={isLoading}
              title="তথ্য রিফ্রেশ করুন"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={'w-4 h-4 ' + (isLoading ? 'animate-spin text-emerald-400' : '')} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors border border-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>পাবলিক সাইট দেখুন</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </Link>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center border border-emerald-500 shadow-xs">
                SA
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-bold text-slate-100">Super Admin</div>
                <div className="text-[10px] text-emerald-400 font-mono">ADMIN-SUPER</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 text-xs font-bold transition-colors border border-rose-800/60"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT SHELL: SIDEBAR + CONTENT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Fixed Sidebar (Desktop) & Slide-over Drawer (Mobile) */}
        <aside 
          className={'fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out shadow-lg lg:shadow-none ' + 
            (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
          }
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          {/* Quick search inside sidebar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="মডিউল খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Navigation Links Grouped into 9 Logical Categories */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-medium scrollbar-thin">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {group.name}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabChange(item.id)}
                        className={'w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-left font-bold ' +
                          (isActive 
                            ? 'bg-emerald-800 text-white shadow-sm' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={'w-4 h-4 shrink-0 ' + (isActive ? 'text-white' : 'text-slate-500')} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span className={'text-[10px] px-1.5 py-0.5 rounded-full font-bold ' + (item.badgeColor || (isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-100 text-slate-600'))}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer Info */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="font-medium">ChakriSheba BD</span>
            <span className="font-mono text-emerald-700 font-bold">2026 Live</span>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* 3. MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100">
          
          {/* Breadcrumb & Section Title Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <span>অ্যাডমিন</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>{currentNav.groupName}</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-emerald-800 font-bold">{currentNav.itemName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentNav.itemName}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>ডাটা ব্যাকআপ এক্সপোর্ট</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('create-circular')}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>নতুন সার্কুলার পোস্ট</span>
              </button>
            </div>
          </div>
`;

fs.appendFileSync(target, part5, 'utf8');
console.log('Appended part 5');
