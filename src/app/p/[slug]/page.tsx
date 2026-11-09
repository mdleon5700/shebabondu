import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import CmsPageRenderer from '@/components/CmsPageRenderer';
import { PageRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

function resolvePage(rawSlug: string): PageRecord | null {
  if (!rawSlug) return null;
  const cleanSlug = rawSlug.replace(/^_/, '');
  
  // 1. Direct ID lookups
  const byId = serverDB.getPublishedPageById(rawSlug) || 
               serverDB.getPublishedPageById(cleanSlug) ||
               serverDB.getPublishedPageById(`_${cleanSlug}`);
  if (byId) return byId;

  // 2. Direct slug lookups
  const bySlug = serverDB.getPublishedPageBySlug(rawSlug) || 
                 serverDB.getPublishedPageBySlug(cleanSlug) ||
                 serverDB.getPublishedPageBySlug(`/${cleanSlug}`);
  if (bySlug) return bySlug as any;

  // 3. Fallback scan over registered pages
  const allPages = serverDB.getPages();
  const matched = allPages.find(p => 
    p.id === rawSlug || 
    p.id === cleanSlug || 
    p.id === `_${cleanSlug}` || 
    p.slug === rawSlug ||
    p.slug === cleanSlug ||
    p.slug === `/${rawSlug}` || 
    p.slug === `/${cleanSlug}`
  );

  if (matched) {
    return serverDB.getPublishedPageById(matched.id) || (matched as any);
  }

  return null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const page = resolvePage(rawSlug);

  if (!page) {
    return { 
      title: 'পৃষ্ঠা পাওয়া যায়নি | চাকরি সেবা',
      robots: { index: false }
    };
  }

  return {
    title: page.metaTitle || `${page.title} | চাকরি সেবা`,
    description: page.metaDescription || `${page.title} — চাকরি সেবা প্ল্যাটফর্মের অফিসিয়াল পেজ।`,
    alternates: {
      canonical: page.slug || `/p/${rawSlug}`
    },
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription,
      type: 'website'
    }
  };
}

export default async function DynamicCmsPage(props: Props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const page = resolvePage(rawSlug);

  if (!page) {
    notFound();
  }

  return <CmsPageRenderer page={page} initialJobs={serverDB.getPublicJobs()} />;
}
