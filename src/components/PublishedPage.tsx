import React from 'react';
import type { PageRecord } from '@/lib/types';
import { serverDB } from '@/lib/db';
import CmsPageRenderer from './CmsPageRenderer';

export default function PublishedPage({ page }: { page: NonNullable<PageRecord['publishedContent']> | PageRecord }) {
  const normalizedPage: PageRecord = {
    id: (page as any).id || (page as any).slug?.replace(/^\//, '') || 'page',
    slug: page.slug || '/',
    title: page.title || 'পৃষ্ঠা',
    status: 'published',
    version: (page as any).version || 1,
    sections: page.sections || [],
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    revisions: [],
    updatedAt: (page as any).publishedAt || (page as any).updatedAt || new Date().toISOString()
  };

  return <CmsPageRenderer page={normalizedPage} initialJobs={serverDB.getPublicJobs()} />;
}
