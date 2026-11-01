import { JobCircular } from '../types';
import { SearchNormalizer } from './normalizer';

export interface ScoreResult {
  score: number;
  matchedFields: string[];
}

export class SearchScorer {
  /**
   * Score a job against search query tokens with multi-tier weighting and typo tolerance
   */
  static scoreJob(job: JobCircular, rawQuery: string): ScoreResult {
    const normQuery = SearchNormalizer.normalize(rawQuery);
    if (!normQuery) {
      return { score: 1, matchedFields: ['default'] };
    }

    const tokens = SearchNormalizer.tokenize(normQuery);
    const expandedTokens = SearchNormalizer.expandSynonyms(tokens);

    let score = 0;
    const matchedFields = new Set<string>();

    const titleNorm = SearchNormalizer.normalize(job.title);
    const orgNorm = SearchNormalizer.normalize(job.organization);
    const catNorm = SearchNormalizer.normalize(job.category);
    const catLabelNorm = SearchNormalizer.normalize(job.categoryLabel);
    const eduNorm = SearchNormalizer.normalize(job.minEducation);
    const descNorm = SearchNormalizer.normalize(
      `${job.bengaliDescription || ''} ${(job.requirements || []).join(' ')}`
    );
    const posNorm = SearchNormalizer.normalize(
      (job.positions || []).map((p) => p.title).join(' ')
    );
    const keywordsNorm = (job.seoKeywords || []).map((k) => SearchNormalizer.normalize(k));

    // 1. Exact Title Match
    if (titleNorm === normQuery) {
      score += 100;
      matchedFields.add('exact_title');
    } else if (titleNorm.includes(normQuery)) {
      score += 70;
      matchedFields.add('title_phrase');
    }

    // 2. Exact Organization Match
    if (orgNorm === normQuery) {
      score += 60;
      matchedFields.add('exact_org');
    } else if (orgNorm.includes(normQuery)) {
      score += 40;
      matchedFields.add('org_phrase');
    }

    // 3. Category / CategoryLabel Match
    for (const token of expandedTokens) {
      if (catNorm === token || catLabelNorm.includes(token)) {
        score += 35;
        matchedFields.add('category');
        break;
      }
    }

    // 4. Token-by-Token Match with weights & Typo tolerance
    for (const token of expandedTokens) {
      // Title Tokens
      if (titleNorm.includes(token)) {
        score += 30;
        matchedFields.add('title');
      } else if (token.length >= 5) {
        // Typo tolerance in title
        const titleWords = titleNorm.split(' ');
        for (const word of titleWords) {
          if (word.length >= 5 && SearchNormalizer.levenshteinDistance(token, word) <= 2) {
            score += 20;
            matchedFields.add('title_fuzzy');
            break;
          }
        }
      }

      // Organization Tokens
      if (orgNorm.includes(token)) {
        score += 20;
        matchedFields.add('organization');
      }

      // Positions / Designation
      if (posNorm.includes(token)) {
        score += 15;
        matchedFields.add('position');
      }

      // SEO Keywords
      if (keywordsNorm.some((k) => k.includes(token))) {
        score += 15;
        matchedFields.add('keywords');
      }

      // Education
      if (eduNorm.includes(token)) {
        score += 10;
        matchedFields.add('education');
      }

      // Description / Requirements
      if (descNorm.includes(token)) {
        score += 5;
        matchedFields.add('description');
      }
    }

    return {
      score,
      matchedFields: Array.from(matchedFields)
    };
  }
}
