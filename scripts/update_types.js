const fs = require('fs');

let content = fs.readFileSync('src/lib/types.ts', 'utf8');

const target = `export interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    supportEmail: string;
    supportPhone: string;
    officeAddress: string;
    whatsappNumber?: string;
    logoUrl?: string;
    faviconUrl?: string;
    defaultTimezone: string;
    defaultLanguage: 'bn' | 'en';
  };`;

const replacement = `export interface HeaderDropdownItem {
  label: string;
  href: string;
  badge?: string;
  target?: '_self' | '_blank';
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
  badgeColor?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
  target?: '_self' | '_blank';
  visibility?: 'all' | 'guest_only' | 'user_only';
  dropdown?: HeaderDropdownItem[];
}

export interface GuestHeaderButtons {
  showLogin: boolean;
  loginText: string;
  showRegister: boolean;
  registerText: string;
  showTrackApplication: boolean;
  trackApplicationText: string;
  showWhatsApp: boolean;
  whatsAppText: string;
}

export interface UserHeaderWidgets {
  showWalletBalance: boolean;
  showNotificationBell: boolean;
  showDashboardButton: boolean;
  dashboardButtonText: string;
  showAvatarDropdown: boolean;
}

export interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    supportEmail: string;
    supportPhone: string;
    officeAddress: string;
    whatsappNumber?: string;
    logoUrl?: string;
    faviconUrl?: string;
    defaultTimezone: string;
    defaultLanguage: 'bn' | 'en';
    headerMenuItems?: HeaderMenuItem[];
    guestButtons?: GuestHeaderButtons;
    userWidgets?: UserHeaderWidgets;
    announcementText?: string;
    announcementEnabled?: boolean;
    announcementUrl?: string;
    whatsappButtonText?: string;
    loginButtonText?: string;
    stickyHeader?: boolean;
    footerColumns?: Array<{ id: string; title: string; links: Array<{ label: string; url: string }> }>;
    footerAboutText?: string;
    facebookUrl?: string;
    telegramUrl?: string;
    youtubeUrl?: string;
    footerDisclaimer?: string;
    copyrightText?: string;
  };`;

const normalizedContent = content.replace(/\r\n/g, '\n');
if (normalizedContent.includes(target)) {
  const updated = normalizedContent.replace(target, replacement);
  fs.writeFileSync('src/lib/types.ts', updated.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated src/lib/types.ts');
} else {
  console.error('Target string not found in src/lib/types.ts');
  process.exit(1);
}
