'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CandidateDataProvider } from '@/components/CandidateDataProvider';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  return (
    <CandidateDataProvider>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </CandidateDataProvider>
  );
}
