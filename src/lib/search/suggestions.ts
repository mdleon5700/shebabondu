import { JobCircular } from '../types';
import { CategoryRecord } from '../taxonomy/types';
import { SearchSuggestionItem } from './types';
import { SearchNormalizer } from './normalizer';

export class SearchSuggestionsEngine {
  /**
   * Return fast, responsive autocomplete suggestions for search input
   */
  static getSuggestions(
    query: string,
    jobs: JobCircular[],
    categories: CategoryRecord[]
  ): SearchSuggestionItem[] {
    const norm = SearchNormalizer.normalize(query);
    if (!norm || norm.length < 2) return [];

    const suggestions: SearchSuggestionItem[] = [];
    const seen = new Set<string>();

    const addSuggestion = (text: string, type: 'title' | 'org' | 'category' | 'keyword', slug?: string) => {
      const clean = text.trim();
      const lower = clean.toLowerCase();
      if (!seen.has(lower) && clean.length > 0) {
        seen.add(lower);
        suggestions.push({ text: clean, type, slug });
      }
    };

    // 1. Match Active Categories
    for (const cat of categories) {
      if (!cat.is_active) continue;
      const catBn = SearchNormalizer.normalize(cat.name_bn);
      const catEn = SearchNormalizer.normalize(cat.name_en);
      if (catBn.includes(norm) || catEn.includes(norm)) {
        addSuggestion(cat.name_bn, 'category', cat.slug);
      }
    }

    // 2. Match Job Titles & Organizations (Only published eligible jobs)
    const eligibleJobs = jobs.filter(
      (j) => !j.id?.startsWith('draft-') && (j as any).status !== 'UNPUBLISHED' && (j as any).status !== 'DRAFT'
    );

    for (const job of eligibleJobs) {
      if (suggestions.length >= 8) break;

      const titleNorm = SearchNormalizer.normalize(job.title);
      const orgNorm = SearchNormalizer.normalize(job.organization);

      if (orgNorm.includes(norm)) {
        addSuggestion(job.organization, 'org');
      }

      if (titleNorm.includes(norm)) {
        addSuggestion(job.title, 'title', job.slug || job.id);
      }
    }

    // 3. Fallback to Popular Keyphrases
    const popularKeys = [
      'সরকারি চাকরি ২০২৬',
      'বাংলাদেশ ব্যাংক সহকারী পরিচালক',
      'প্রাইমারি শিক্ষক নিয়োগ',
      'রেলওয়ে খালাসী ও সহকারী চালক',
      'সমন্বিত ৯ ব্যাংক অফিসার',
      'পল্লী বিদ্যুৎ লাইনম্যান ও মিটার রিডার',
      'বিসিএস প্রিলিমিনারি আবেদন',
      'এনজিও অফিসার নিয়োগ'
    ];

    for (const pk of popularKeys) {
      if (suggestions.length >= 8) break;
      if (SearchNormalizer.normalize(pk).includes(norm)) {
        addSuggestion(pk, 'keyword');
      }
    }

    return suggestions.slice(0, 8);
  }
}
