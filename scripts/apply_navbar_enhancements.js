const fs = require('fs');

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// 1. Ensure Bell icon is imported
if (!content.includes('Bell')) {
  content = content.replace(
    "import {\r\n  Briefcase,",
    "import {\r\n  Bell,\r\n  Briefcase,"
  );
  if (!content.includes('Bell,')) {
    content = content.replace(
      "import {\n  Briefcase,",
      "import {\n  Bell,\n  Briefcase,"
    );
  }
}

// 2. Make header sticky or relative based on stickyHeader
content = content.replace(
  '<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full max-w-full" ref={navRef}>',
  '<header className={`z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full max-w-full ${platformSettings?.general?.stickyHeader !== false ? \'sticky top-0\' : \'relative\'}`} ref={navRef}>'
);

// 3. Render badge next to menu item in desktop nav
const oldMenuSpan = '<span>{item.label}</span>';
const newMenuSpan = `<span>{item.label}</span>
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
                    )}`;

if (content.includes(oldMenuSpan) && !content.includes('item.badgeColor')) {
  content = content.replace(oldMenuSpan, newMenuSpan);
}

// 4. Upgrade Right Action Area for Guest & Logged in Candidate
const oldRightAreaStart = `{/* Right Action Area: WhatsApp (Outlined Green) | Login/Registration (Solid Green) */}`;
const oldRightAreaEnd = `{/* Mobile Menu Toggle Button */}`;

const oldRightIndex = content.indexOf(oldRightAreaStart);
const oldRightEndIndex = content.indexOf(oldRightAreaEnd);

if (oldRightIndex !== -1 && oldRightEndIndex !== -1) {
  const newRightArea = `{/* Right Action Area: Customizable Guest Buttons & User Widgets */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            
            {/* WhatsApp button */}
            {platformSettings?.general?.guestButtons?.showWhatsApp !== false && (
              <a
                href={\`https://wa.me/\${platformSettings?.general?.whatsappNumber || '8801774366643'}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-xl border border-emerald-600/80 text-emerald-700 bg-white hover:bg-emerald-50 text-xs 2xl:text-sm font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{platformSettings?.general?.guestButtons?.whatsAppText || platformSettings?.general?.whatsappButtonText || 'WhatsApp'}</span>
              </a>
            )}

            {!isMounted ? (
              <div className="w-28 h-9 rounded-xl bg-slate-100/60 animate-pulse border border-slate-200" />
            ) : !auth.isLoggedIn ? (
              /* GUEST BUTTONS: Track Application | Login | Free Register */
              <div className="flex items-center gap-2">
                {platformSettings?.general?.guestButtons?.showTrackApplication !== false && (
                  <Link
                    href="/dashboard/application-check"
                    className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
                    title="আবেদনের ট্র্যাকিং ও স্ট্যাটাস যাচাই"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{platformSettings?.general?.guestButtons?.trackApplicationText || 'আবেদন ট্র্যাক'}</span>
                  </Link>
                )}

                {platformSettings?.general?.guestButtons?.showLogin !== false && (
                  <Link
                    href="/login"
                    className="px-3 py-1.5 2xl:py-2 rounded-xl border border-emerald-600/80 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/60 text-xs 2xl:text-sm font-bold transition-all flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{platformSettings?.general?.guestButtons?.loginText || 'লগইন'}</span>
                  </Link>
                )}

                {platformSettings?.general?.guestButtons?.showRegister !== false && (
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 2xl:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs 2xl:text-sm font-black shadow-md shadow-emerald-800/20 transition-all flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-white" />
                    <span>{platformSettings?.general?.guestButtons?.registerText || 'ফ্রি রেজিস্ট্রেশন'}</span>
                  </Link>
                )}
              </div>
            ) : (
              /* LOGGED IN USER: Dashboard Direct Button + Wallet + Notification Bell + Profile Dropdown */
              <div className="flex items-center gap-2">
                {/* 1. Direct Dashboard CTA Button */}
                {auth.role === 'candidate' && platformSettings?.general?.userWidgets?.showDashboardButton !== false && (
                  <Link 
                    href="/dashboard"
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{platformSettings?.general?.userWidgets?.dashboardButtonText || 'ড্যাশবোর্ড'}</span>
                  </Link>
                )}

                {/* 2. Wallet Balance Widget */}
                {auth.role === 'candidate' && platformSettings?.general?.userWidgets?.showWalletBalance !== false && (
                  <Link 
                    href="/dashboard/wallet"
                    className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
                    title="ওয়ালেট ব্যালেন্স"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>৳{walletBalance}</span>
                  </Link>
                )}

                {/* 3. Notification Bell Widget */}
                {auth.role === 'candidate' && platformSettings?.general?.userWidgets?.showNotificationBell !== false && (
                  <Link
                    href="/dashboard/notifications"
                    className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                    title="নোটিফিকেশন"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  </Link>
                )}

                {/* 4. Admin Direct Link */}
                {auth.role === 'admin' && (
                  <Link 
                    href="/admin"
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>অ্যাডমিন</span>
                  </Link>
                )}

                {/* 5. Profile Avatar & Dropdown */}
                {platformSettings?.general?.userWidgets?.showAvatarDropdown !== false && (
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
                        {auth.name ? auth.name.charAt(0) : 'U'}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs space-y-1">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <div className="font-bold text-slate-800">{auth.name || 'ইউজার'}</div>
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {auth.role === 'admin' ? 'Super Admin' : 'ভেরিফাইড প্রার্থী'}
                          </div>
                        </div>

                        {auth.role === 'candidate' ? (
                          <>
                            <Link
                              href="/dashboard/profile"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                              <span>আমার প্রোফাইল</span>
                            </Link>
                            <Link
                              href="/dashboard/applications"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              <FileText className="w-4 h-4 text-emerald-600" />
                              <span>আমার আবেদন ও ট্র্যাকিং</span>
                            </Link>
                            <Link
                              href="/dashboard/vault"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>মাস্টার ডকুমেন্ট ভল্ট</span>
                            </Link>
                            <Link
                              href="/dashboard/wallet"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              <Wallet className="w-4 h-4 text-emerald-600" />
                              <span>ডিজিটাল ওয়ালেট</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>টিম ড্যাশবোর্ড</span>
                          </Link>
                        )}

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>লগআউট করুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          `;
  content = content.slice(0, oldRightIndex) + newRightArea + content.slice(oldRightEndIndex);
}

// 5. Update mobile drawer buttons
const oldMobileBottom = `{/* Mobile Bottom Actions (WhatsApp + Login) */}`;
const oldMobileBottomIndex = content.indexOf(oldMobileBottom);
if (oldMobileBottomIndex !== -1) {
  const newMobileBottom = `{/* Mobile Bottom Actions (WhatsApp + Guest Buttons / User Widgets) */}
          <div className="pt-4 space-y-2">
            {platformSettings?.general?.guestButtons?.showWhatsApp !== false && (
              <a
                href={\`https://wa.me/\${platformSettings?.general?.whatsappNumber || '8801774366643'}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 border border-emerald-600 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{platformSettings?.general?.guestButtons?.whatsAppText || 'WhatsApp হেল্পলাইন'}</span>
              </a>
            )}

            {!auth.isLoggedIn ? (
              <div className="space-y-2">
                {platformSettings?.general?.guestButtons?.showLogin !== false && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 border border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-emerald-700" />
                    <span>{platformSettings?.general?.guestButtons?.loginText || 'লগইন'}</span>
                  </Link>
                )}
                {platformSettings?.general?.guestButtons?.showRegister !== false && (
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-emerald-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20"
                  >
                    <UserCheck className="w-4 h-4 text-white" />
                    <span>{platformSettings?.general?.guestButtons?.registerText || 'ফ্রি রেজিস্ট্রেশন'}</span>
                  </Link>
                )}
                {platformSettings?.general?.guestButtons?.showTrackApplication !== false && (
                  <Link
                    href="/dashboard/application-check"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{platformSettings?.general?.guestButtons?.trackApplicationText || 'আবেদন ট্র্যাক করুন'}</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>আমার ড্যাশবোর্ড</span>
                </Link>
                <Link
                  href="/dashboard/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span>ওয়ালেট ব্যালেন্স: ৳{walletBalance}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-rose-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </div>
            )}
          </div>`;

  const drawerEnd = content.lastIndexOf('</div>\n      )}\n\n    </header>');
  const altDrawerEnd = content.lastIndexOf('</div>\r\n      )}\r\n\r\n    </header>');
  const endPoint = drawerEnd !== -1 ? drawerEnd : altDrawerEnd;
  if (endPoint !== -1) {
    content = content.slice(0, oldMobileBottomIndex) + newMobileBottom + content.slice(endPoint);
  }
}

fs.writeFileSync('src/components/Navbar.tsx', content, 'utf8');
console.log('Successfully enhanced src/components/Navbar.tsx');

