'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar, { ADMIN_NAV_ITEMS } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminGlobalSearchModal from '../AdminGlobalSearchModal';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onLogout?: () => void;
  adminEmail?: string;
  adminName?: string;
}

export default function AdminLayout({
  children,
  activeTab,
  onSelectTab,
  onLogout,
  adminEmail,
  adminName
}: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl + K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-solaiman flex">
      {/* Dark Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onLogout={onLogout}
        adminEmail={adminEmail}
        adminName={adminName}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header */}
        <AdminHeader
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsMobileOpen(!isMobileOpen);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectTab={onSelectTab}
          onLogout={onLogout}
          adminName={adminName}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      <AdminGlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab, detailId) => {
          onSelectTab(tab);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}
