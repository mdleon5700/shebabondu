'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CandidateDataProvider } from '@/components/CandidateDataProvider';

export interface PlatformContextType {
  settings: any;
  homeHero: any;
  homeSections: any[];
  initialJobs: any[];
}

export const PlatformContext = createContext<PlatformContextType>({
  settings: null,
  homeHero: null,
  homeSections: [],
  initialJobs: []
});

export const usePlatformContext = () => useContext(PlatformContext);

export default function ConditionalLayout({ 
  children,
  initialSettings,
  initialHomeHero,
  initialHomeSections,
  initialJobs
}: { 
  children: React.ReactNode;
  initialSettings?: any;
  initialHomeHero?: any;
  initialHomeSections?: any[];
  initialJobs?: any[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const [settings, setSettings] = useState<any>(initialSettings || null);
  const [homeHero, setHomeHero] = useState<any>(initialHomeHero || null);
  const [homeSections, setHomeSections] = useState<any[]>(initialHomeSections || []);

  useEffect(() => {
    const handleSettingsChanged = () => {
      fetch('/api/platform/settings', { cache: 'no-store' })
        .then(res => res.json())
        .then(d => {
          if (d.success) {
            if (d.settings) setSettings(d.settings);
            if (d.homeHero) setHomeHero(d.homeHero);
            if (d.homePage?.sections) setHomeSections(d.homePage.sections);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('cs_settings_changed', handleSettingsChanged);
    window.addEventListener('cs_page_changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('cs_settings_changed', handleSettingsChanged);
      window.removeEventListener('cs_page_changed', handleSettingsChanged);
    };
  }, []);

  if (isAdmin) {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  return (
    <PlatformContext.Provider value={{ settings, homeHero, homeSections, initialJobs: initialJobs || [] }}>
      <CandidateDataProvider>
        <Navbar initialSettings={settings} />
        <main className="flex-grow">{children}</main>
        <Footer initialSettings={settings} />
      </CandidateDataProvider>
    </PlatformContext.Provider>
  );
}
