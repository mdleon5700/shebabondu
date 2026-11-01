import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverDB } from '@/lib/db';
import PublishedPage from '@/components/PublishedPage';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string[] } };

export function generateMetadata({ params }: Props): Metadata {
  const page = serverDB.getPublishedPageBySlug('/' + params.slug.join('/'));
  return page ? { title: page.metaTitle || page.title, description: page.metaDescription } : { robots: { index: false } };
}

export default function CustomPage({ params }: Props) {
  const page = serverDB.getPublishedPageBySlug('/' + params.slug.join('/'));
  if (!page) notFound();
  return <PublishedPage page={page} />;
}
