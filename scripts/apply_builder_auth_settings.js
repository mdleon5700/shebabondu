const fs = require('fs');

let content = fs.readFileSync('src/components/admin/WebsiteBuilder.tsx', 'utf8');

// 1. Update chromeModalTab type & add guestButtons/userWidgets/stickyHeader state
const oldStateTarget = `  const [chromeMenuItems, setChromeMenuItems] = useState<{ id: string; label: string; href: string; badge?: string; dropdown?: { label: string; href: string }[] }[]>([]);
  const [chromeModalTab, setChromeModalTab] = useState<'general' | 'menu' | 'footer'>('general');
  const [chromeExpandedDropdownId, setChromeExpandedDropdownId] = useState<string | null>(null);`;

const newStateReplacement = `  const [chromeMenuItems, setChromeMenuItems] = useState<{ id: string; label: string; href: string; badge?: string; badgeColor?: string; dropdown?: { label: string; href: string }[] }[]>([]);
  const [chromeModalTab, setChromeModalTab] = useState<'general' | 'menu' | 'auth-buttons' | 'footer'>('general');
  const [chromeExpandedDropdownId, setChromeExpandedDropdownId] = useState<string | null>(null);

  const [chromeGuestButtons, setChromeGuestButtons] = useState({
    showLogin: true,
    loginText: 'লগইন',
    showRegister: true,
    registerText: 'ফ্রি রেজিস্ট্রেশন',
    showTrackApplication: true,
    trackApplicationText: 'আবেদন ট্র্যাক',
    showWhatsApp: true,
    whatsAppText: 'হোয়াটসঅ্যাপ'
  });

  const [chromeUserWidgets, setChromeUserWidgets] = useState({
    showWalletBalance: true,
    showNotificationBell: true,
    showDashboardButton: true,
    dashboardButtonText: 'ড্যাশবোর্ড',
    showAvatarDropdown: true
  });

  const [chromeStickyHeader, setChromeStickyHeader] = useState(true);`;

if (content.includes(oldStateTarget)) {
  content = content.replace(oldStateTarget, newStateReplacement);
} else {
  // Normalize line endings
  const nContent = content.replace(/\r\n/g, '\n');
  const nTarget = oldStateTarget.replace(/\r\n/g, '\n');
  const nReplacement = newStateReplacement.replace(/\r\n/g, '\n');
  if (nContent.includes(nTarget)) {
    content = nContent.replace(nTarget, nReplacement);
  } else {
    console.error('Could not find oldStateTarget in WebsiteBuilder.tsx');
  }
}

// 2. In fetchPlatformSettings, populate the new states
const fetchSettingsTarget = `        if (g.footerAboutText) setChromeFooterAbout(g.footerAboutText);`;
const fetchSettingsReplacement = `        if (g.footerAboutText) setChromeFooterAbout(g.footerAboutText);
        if (g.guestButtons) {
          setChromeGuestButtons({
            showLogin: g.guestButtons.showLogin !== false,
            loginText: g.guestButtons.loginText || 'লগইন',
            showRegister: g.guestButtons.showRegister !== false,
            registerText: g.guestButtons.registerText || 'ফ্রি রেজিস্ট্রেশন',
            showTrackApplication: g.guestButtons.showTrackApplication !== false,
            trackApplicationText: g.guestButtons.trackApplicationText || 'আবেদন ট্র্যাক',
            showWhatsApp: g.guestButtons.showWhatsApp !== false,
            whatsAppText: g.guestButtons.whatsAppText || 'হোয়াটসঅ্যাপ'
          });
        }
        if (g.userWidgets) {
          setChromeUserWidgets({
            showWalletBalance: g.userWidgets.showWalletBalance !== false,
            showNotificationBell: g.userWidgets.showNotificationBell !== false,
            showDashboardButton: g.userWidgets.showDashboardButton !== false,
            dashboardButtonText: g.userWidgets.dashboardButtonText || 'ড্যাশবোর্ড',
            showAvatarDropdown: g.userWidgets.showAvatarDropdown !== false
          });
        }
        if (g.stickyHeader !== undefined) setChromeStickyHeader(g.stickyHeader);`;

if (content.includes(fetchSettingsTarget)) {
  content = content.replace(fetchSettingsTarget, fetchSettingsReplacement);
}

// 3. In handleSaveChromeSettings, include guestButtons, userWidgets, and stickyHeader
const saveTarget = `          footerAboutText: chromeFooterAbout.trim(),
          headerMenuItems: chromeMenuItems
        }`;

const saveReplacement = `          footerAboutText: chromeFooterAbout.trim(),
          headerMenuItems: chromeMenuItems,
          guestButtons: chromeGuestButtons,
          userWidgets: chromeUserWidgets,
          stickyHeader: chromeStickyHeader
        }`;

if (content.includes(saveTarget)) {
  content = content.replace(saveTarget, saveReplacement);
}

// 4. Update Modal Tabs UI to include 'বাটন ও অথ সেটিংস'
const modalTabsTarget = `              <button
                type="button"
                onClick={() => setChromeModalTab('menu')}
                className={\`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                  chromeModalTab === 'menu' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }\`}
              >
                মেনু বার লিংকসমূহ ({chromeMenuItems.length}টি)
              </button>
              <button
                type="button"
                onClick={() => setChromeModalTab('footer')}
                className={\`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                  chromeModalTab === 'footer' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }\`}
              >
                ফুটার পরিচিতি
              </button>`;

const modalTabsReplacement = `              <button
                type="button"
                onClick={() => setChromeModalTab('menu')}
                className={\`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                  chromeModalTab === 'menu' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }\`}
              >
                মেনু বার লিংক ({chromeMenuItems.length}টি)
              </button>
              <button
                type="button"
                onClick={() => setChromeModalTab('auth-buttons')}
                className={\`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                  chromeModalTab === 'auth-buttons' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }\`}
              >
                বাটন ও অথ কন্ট্রোল
              </button>
              <button
                type="button"
                onClick={() => setChromeModalTab('footer')}
                className={\`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                  chromeModalTab === 'footer' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }\`}
              >
                ফুটার পরিচিতি
              </button>`;

if (content.includes(modalTabsTarget)) {
  content = content.replace(modalTabsTarget, modalTabsReplacement);
}

// 5. Add TAB: AUTH-BUTTONS content before TAB: FOOTER
const footerTabTarget = `{/* TAB 3: FOOTER ABOUT TEXT */}`;
const authButtonsTabContent = `{/* TAB: AUTH BUTTONS & WIDGETS (Without Login vs After Login) */}
            {chromeModalTab === 'auth-buttons' && (
              <div className="space-y-4 text-xs max-h-[420px] overflow-y-auto pr-1">
                
                {/* 1. Guest Buttons (Without Login) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">গেস্ট / ভিজিটর বাটন (Without Login)</h4>
                      <p className="text-[11px] text-slate-500">লগইন ছাড়া সাধারণ দর্শনার্থীদের হেডারের ডানপাশে কোন কোন বাটন প্রদর্শিত হবে</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">পাবলিক স্টেট</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Free Register Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">ফ্রি রেজিস্ট্রেশন CTA বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeGuestButtons.showRegister}
                          onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, showRegister: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeGuestButtons.registerText}
                        onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, registerText: e.target.value })}
                        placeholder="ফ্রি রেজিস্ট্রেশন"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                      />
                    </div>

                    {/* Login Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">লগইন বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeGuestButtons.showLogin}
                          onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, showLogin: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeGuestButtons.loginText}
                        onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, loginText: e.target.value })}
                        placeholder="লগইন"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* Track Application Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">আবেদন ট্র্যাক বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeGuestButtons.showTrackApplication}
                          onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, showTrackApplication: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeGuestButtons.trackApplicationText}
                        onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, trackApplicationText: e.target.value })}
                        placeholder="আবেদন ট্র্যাক"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* WhatsApp Support Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">হোয়াটসঅ্যাপ হেল্প বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeGuestButtons.showWhatsApp}
                          onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, showWhatsApp: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeGuestButtons.whatsAppText}
                        onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, whatsAppText: e.target.value })}
                        placeholder="WhatsApp"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. User Widgets (After Login) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">লগইনকৃত ক্যান্ডিডেট উইজেট (After Login)</h4>
                      <p className="text-[11px] text-slate-500">প্রার্থী লগইন করার পর হেডারে ড্যাশবোর্ড, ওয়ালেট ও নোটিফিকেশন প্রদর্শন</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">অথ স্টেট</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Dashboard Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">ড্যাশবোর্ড ডিরেক্ট বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeUserWidgets.showDashboardButton}
                          onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, showDashboardButton: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeUserWidgets.dashboardButtonText}
                        onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, dashboardButtonText: e.target.value })}
                        placeholder="ড্যাশবোর্ড"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* Wallet Balance Widget */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">ওয়ালেট ব্যালেন্স উইজেট (৳X)</span>
                        <input
                          type="checkbox"
                          checked={chromeUserWidgets.showWalletBalance}
                          onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, showWalletBalance: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">সক্রিয় রাখলে প্রার্থীর বর্তমান ওয়ালেট ব্যালেন্স হেডারে ইনস্ট্যান্ট দেখাবে।</p>
                    </div>

                    {/* Notification Bell Widget */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">নোটিফিকেশন ঘণ্টা আইকন</span>
                        <input
                          type="checkbox"
                          checked={chromeUserWidgets.showNotificationBell}
                          onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, showNotificationBell: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">নতুন সার্কুলার ও আবেদন আপডেটের জন্য লাল ব্যাজ সহ ঘণ্টা আইকন।</p>
                    </div>

                    {/* Profile Avatar Dropdown */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">প্রোফাইল অ্যাভাটার ও ড্রপডাউন</span>
                        <input
                          type="checkbox"
                          checked={chromeUserWidgets.showAvatarDropdown}
                          onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, showAvatarDropdown: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">প্রোফাইল, আবেদনসমূহ, ভল্ট ও লগআউট মেনু ড্রপডাউন।</p>
                    </div>
                  </div>
                </div>

                {/* 3. Sticky Header Behavior */}
                <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">স্টিকি হেডার (Sticky Navbar)</span>
                    <span className="text-[11px] text-slate-500">স্ক্রোল করার সময় মেনু বার সবসময় স্ক্রিনের শীর্ষে আটকে থাকবে</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={chromeStickyHeader}
                    onChange={(e) => setChromeStickyHeader(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

              </div>
            )}

            `;

if (content.includes(footerTabTarget)) {
  content = content.replace(footerTabTarget, authButtonsTabContent + footerTabTarget);
}

fs.writeFileSync('src/components/admin/WebsiteBuilder.tsx', content, 'utf8');
console.log('Successfully updated src/components/admin/WebsiteBuilder.tsx');

