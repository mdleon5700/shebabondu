import { ContentStudioState, ContentRevision } from './types';

export function createRevisionSnapshot(
  state: ContentStudioState,
  author: string = 'Super Admin',
  changeSummary: string = 'নিয়মিত আপডেট ও সংরক্ষণ'
): ContentRevision {
  const versionNumber = (state.revisions?.length || 0) + 1;
  const id = `rev-${state.draftId}-v${versionNumber}-${Date.now()}`;

  return {
    id,
    draftId: state.draftId,
    versionNumber,
    timestamp: new Date().toISOString(),
    author,
    changeSummary,
    articleSnapshot: {
      title: state.article?.title || '',
      bengaliMarkdown: state.article?.bengaliMarkdown || '',
      faqItems: state.article?.faqItems ? JSON.parse(JSON.stringify(state.article.faqItems)) : []
    },
    seoSnapshot: {
      seoTitle: state.seo.seoTitle,
      seoDescription: state.seo.seoDescription,
      slug: state.seo.slug,
      focusKeyword: state.seo.focusKeyword,
      secondaryKeywords: [...state.seo.secondaryKeywords]
    },
    blocksSnapshot: JSON.parse(JSON.stringify(state.blocks || []))
  };
}

export function restoreRevision(
  state: ContentStudioState,
  revisionId: string
): { updatedState: ContentStudioState; restoredRevision: ContentRevision | null } {
  const targetRev = state.revisions?.find(r => r.id === revisionId);
  if (!targetRev) {
    return { updatedState: state, restoredRevision: null };
  }

  const updatedState: ContentStudioState = {
    ...state,
    blocks: JSON.parse(JSON.stringify(targetRev.blocksSnapshot)),
    article: state.article ? {
      ...state.article,
      title: targetRev.articleSnapshot.title,
      bengaliMarkdown: targetRev.articleSnapshot.bengaliMarkdown,
      faqItems: JSON.parse(JSON.stringify(targetRev.articleSnapshot.faqItems)),
      updatedAt: new Date().toISOString()
    } : undefined,
    seo: {
      ...state.seo,
      seoTitle: targetRev.seoSnapshot.seoTitle,
      seoDescription: targetRev.seoSnapshot.seoDescription,
      slug: targetRev.seoSnapshot.slug,
      focusKeyword: targetRev.seoSnapshot.focusKeyword,
      secondaryKeywords: [...targetRev.seoSnapshot.secondaryKeywords]
    },
    currentRevisionId: targetRev.id,
    lastSavedAt: new Date().toISOString()
  };

  return { updatedState, restoredRevision: targetRev };
}
