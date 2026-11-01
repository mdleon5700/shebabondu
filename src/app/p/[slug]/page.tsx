import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import CmsPageRenderer from '@/components/CmsPageRenderer';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cleanSlug = params.slug.replace(/^_/, '');
  const pages = serverDB.getPages().map(page => serverDB.getPublishedPageById(page.id)).filter((page): page is NonNullable<typeof page> => page !== null);
  const page = pages.find(p => p.id === params.slug || p.id === cleanSlug || p.id === `_${cleanSlug}` || p.slug === `/${params.slug}` || p.slug === `/${cleanSlug}`);

  if (!page) {
    return { title: 'পৃষ্ঠা পাওয়া যায়নি | চাকরি সেবা' };
  }

  return {
    title: page.metaTitle || `${page.title} | চাকরি সেবা`,
    description: page.metaDescription || `${page.title} — চাকরি সেবা প্ল্যাটফর্মের অফিসিয়াল পেজ।`
  };
}

export default function DynamicCmsPage({ params }: Props) {
  const cleanSlug = params.slug.replace(/^_/, '');
  const pages = serverDB.getPages().map(page => serverDB.getPublishedPageById(page.id)).filter((page): page is NonNullable<typeof page> => page !== null);
  const page = pages.find(p => p.id === params.slug || p.id === cleanSlug || p.id === `_${cleanSlug}` || p.slug === `/${params.slug}` || p.slug === `/${cleanSlug}`);

  if (!page) {
    notFound();
  }

  return <CmsPageRenderer page={page} />;
}