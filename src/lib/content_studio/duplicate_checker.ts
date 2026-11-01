import { ContentUniquenessReport } from './types';
import { serverDB } from '@/lib/db';

function getTrigramSet(text: string): Set<string> {
  const norm = (text || '').toLowerCase().replace(/[\s\-_.,!?:;|]/g, '');
  const trigrams = new Set<string>();
  if (norm.length < 3) return trigrams;
  for (let i = 0; i <= norm.length - 3; i++) {
    trigrams.add(norm.slice(i, i + 3));
  }
  return trigrams;
}

function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  Array.from(setA).forEach(item => {
    if (setB.has(item)) intersectionCount++;
  });
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : Math.round((intersectionCount / unionCount) * 100);
}

/**
 * Checks article text against existing published jobs and drafts for internal similarity
 */
export function checkInternalContentUniqueness(
  draftId: string,
  articleTitle: string,
  articleText: string
): ContentUniquenessReport {
  const jobs = serverDB.getAllJobs ? serverDB.getAllJobs() : [];
  const drafts = serverDB.getCircularDrafts ? serverDB.getCircularDrafts() : [];

  const articleTrigrams = getTrigramSet(articleText);
  const titleNorm = (articleTitle || '').toLowerCase().replace(/[\s\-_|]/g, '');

  const duplicateMatches: ContentUniquenessReport['duplicateMatches'] = [];
  let maxSimilarity = 0;

  // Check published jobs
  for (const job of jobs) {
    if ((job as any).draftId === draftId) continue;

    // Check title exact or high similarity
    const jobTitleNorm = (job.title || '').toLowerCase().replace(/[\s\-_|]/g, '');
    if (titleNorm && jobTitleNorm && (titleNorm === jobTitleNorm || titleNorm.includes(jobTitleNorm) || jobTitleNorm.includes(titleNorm))) {
      duplicateMatches.push({
        jobId: job.id,
        title: job.title,
        similarityPercentage: 95,
        matchedField: 'title (ক্যানোনিকাল চাকরির সাথে হুবহু বা কাছাকাছি শিরোনাম)'
      });
      maxSimilarity = Math.max(maxSimilarity, 95);
    }

    // Check description similarity
    if (job.bengaliDescription && articleTrigrams.size > 0) {
      const existingTrigrams = getTrigramSet(job.bengaliDescription);
      const sim = calculateJaccardSimilarity(articleTrigrams, existingTrigrams);
      if (sim >= 50) {
        duplicateMatches.push({
          jobId: job.id,
          title: job.title,
          similarityPercentage: sim,
          matchedField: 'bengaliDescription (বর্ণনায় অভ্যন্তরীণ সাদৃশ্য)'
        });
        maxSimilarity = Math.max(maxSimilarity, sim);
      }
    }
  }

  // Check drafts
  for (const d of drafts) {
    if (d.id === draftId) continue;
    if (d.aiGeneratedContent?.bengaliDescription && articleTrigrams.size > 0) {
      const draftTrigrams = getTrigramSet(d.aiGeneratedContent.bengaliDescription);
      const sim = calculateJaccardSimilarity(articleTrigrams, draftTrigrams);
      if (sim >= 50) {
        duplicateMatches.push({
          jobId: d.id,
          title: d.extractedTitle,
          similarityPercentage: sim,
          matchedField: 'draft_description (খসড়া তালিকার সাথে সাদৃশ্য)'
        });
        maxSimilarity = Math.max(maxSimilarity, sim);
      }
    }
  }

  const isDuplicate = maxSimilarity >= 75;

  return {
    internalSimilarityScore: maxSimilarity,
    isDuplicate,
    duplicateMatches: duplicateMatches.slice(0, 5),
    method: 'ngram_jaccard_token_hash'
  };
}
