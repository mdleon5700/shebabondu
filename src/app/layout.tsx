import type { Metadata } from 'next';
import './globals.css';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { headers } from 'next/headers';
import { serverDB } from '@/lib/db';
import PublishedPage from '@/components/PublishedPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakrisheba.com';

const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'চাকরি সেবা • Chakri Sheba | বিডি চাকরির খবর ও আবেদন সার্ভিস',
    template: '%s | চাকরি সেবা'
  },
  description: 'বাংলাদেশের সকল সরকারি ও বেসরকারি চাকরির নিয়মিত আপডেট এবং ঘরে বসেই নির্ভুল আবেদনের বিশ্বস্ত প্ল্যাটফর্ম।',
  keywords: 'চাকরির খবর, সরকারি চাকরি, ব্যাংক জব, bd jobs, teletalk job application, chakri sheba, সার্কুলার ২০২৬',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'চাকরি সেবা • Chakri Sheba | বিডি চাকরির খবর ও আবেদন সার্ভিস',
    description: 'বাংলাদেশের সকল সরকারি ও বেসরকারি চাকরির নিয়মিত আপডেট এবং ঘরে বসেই নির্ভুল আবেদনের বিশ্বস্ত প্ল্যাটফর্ম।',
    url: SITE_URL,
    siteName: 'Chakri Sheba (চাকরি সেবা)',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'চাকরি সেবা • Chakri Sheba',
    description: 'বাংলাদেশের সকল সরকারি ও বেসরকারি চাকরির নিয়মিত আপডেট এবং নির্ভুল আবেদন সার্ভিস।',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export function generateMetadata(): Metadata {
  const settings = serverDB.getPlatformSettings();
  const pathname = headers().get('x-site-pathname') || '/';
  const page = serverDB.getPublishedPageBySlug(pathname);
  const title = page?.metaTitle || settings.seo?.defaultTitle || 'চাকরি সেবা';
  const description = page?.metaDescription || settings.seo?.defaultDescription;
  return {
    ...defaultMetadata,
    title: { default: title, template: '%s | চাকরি সেবা' },
    description,
    keywords: settings.seo?.defaultKeywords,
    openGraph: { ...defaultMetadata.openGraph, title, description, images: settings.seo?.defaultOgImage ? [settings.seo.defaultOgImage] : [] },
    twitter: { ...defaultMetadata.twitter, title, description }
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get('x-site-pathname') || '/';
  const managedPage = /^\/(admin|dashboard|login|register|apply|api)(\/|$)/.test(pathname)
    ? null : serverDB.getPublishedPageBySlug(pathname);
  return (
    <html lang="bn">
      <head>
        <link rel="preload" href="/fonts/solaimanlipi-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/solaimanlipi-bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-solaiman min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white overflow-x-hidden max-w-full">
        <ConditionalLayout>
          {managedPage ? <PublishedPage page={managedPage} /> : children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
