/**
 * BILINGUAL BENGALI & ENGLISH SEARCH NORMALIZER
 */

export class SearchNormalizer {
  // Common Cross-Language Vocabulary Synonyms
  private static SYNONYM_MAP: Record<string, string[]> = {
    'bank': ['ব্যাংক', 'bank', 'বিএসসিএস', 'বাংলাদেশ ব্যাংক', 'বাণিজ্যিক ব্যাংক'],
    'ব্যাংক': ['bank', 'ব্যাংক', 'ব্যাংকার্স', 'বাংলাদেশ ব্যাংক'],
    'govt': ['সরকারি', 'govt', 'government', 'মন্ত্রণালয়', 'অধিদপ্তর', 'বিসিএস'],
    'government': ['সরকারি', 'govt', 'government', 'মন্ত্রণালয়', 'অধিদপ্তর'],
    'সরকারি': ['govt', 'government', 'সরকারি', 'মন্ত্রণালয়', 'অধিদপ্তর'],
    'teacher': ['শিক্ষক', 'teacher', 'প্রভাষক', 'ntrca', 'প্রাথমিক', 'বিদ্যালয়'],
    'শিক্ষক': ['teacher', 'শিক্ষক', 'প্রভাষক', 'শিক্ষক নিবন্ধন', 'ntrca'],
    'engineer': ['প্রকৌশলী', 'ইঞ্জিনিয়ার', 'engineer', 'engineering', 'ডিপ্লোমা'],
    'engineering': ['প্রকৌশলী', 'ইঞ্জিনিয়ার', 'engineer', 'engineering', 'ডিপ্লোমা'],
    'ইঞ্জিনিয়ার': ['engineer', 'engineering', 'প্রকৌশলী', 'ইঞ্জিনিয়ার'],
    'it': ['আইটি', 'সফটওয়্যার', 'software', 'it', 'কম্পিউটার', 'প্রোগ্রামার', 'developer'],
    'software': ['আইটি', 'সফটওয়্যার', 'software', 'it', 'কম্পিউটার', 'developer'],
    'আইটি': ['it', 'software', 'আইটি', 'কম্পিউটার', 'সফটওয়্যার'],
    'doctor': ['ডাক্তার', 'চিকিৎসক', 'মেডিকেল', 'doctor', 'medical', 'স্বাস্থ্য'],
    'medical': ['ডাক্তার', 'চিকিৎসক', 'মেডিকেল', 'doctor', 'medical', 'স্বাস্থ্য'],
    'মেডিকেল': ['doctor', 'medical', 'মেডিকেল', 'স্বাস্থ্য', 'নার্স'],
    'defense': ['প্রতিরক্ষা', 'পুলিশ', 'police', 'সেনাবাহিনী', 'defense', 'বিজিবি', 'আনসার'],
    'police': ['পুলিশ', 'police', 'কনস্টেবল', 'এসআই', 'সার্জেন্ট'],
    'পুলিশ': ['police', 'পুলিশ', 'কনস্টেবল', 'এসআই'],
    'ngo': ['এনজিও', 'ngo', 'ব্র্যাক', 'আশা', 'উন্নয়ন সংস্থা'],
    'এনজিও': ['ngo', 'এনজিও', 'ব্র্যাক', 'আশা']
  };

  /**
   * Normalize search text (Bengali NFKC + zero width cleanup + case folding)
   */
  static normalize(text?: string): string {
    if (!text) return '';
    return text
      .normalize('NFKC')
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // remove zero-width chars
      .replace(/[^\w\s\u0980-\u09FF\-]/g, ' ') // preserve alphanumeric, Bengali script, hyphens
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /**
   * Tokenize normalized query into keywords
   */
  static tokenize(text?: string): string[] {
    const norm = this.normalize(text);
    if (!norm) return [];
    return norm.split(/\s+/).filter((t) => t.length > 0);
  }

  /**
   * Expand tokens with bilingual synonyms
   */
  static expandSynonyms(tokens: string[]): string[] {
    const expanded = new Set<string>(tokens);
    for (const token of tokens) {
      const synonyms = this.SYNONYM_MAP[token];
      if (synonyms) {
        for (const s of synonyms) {
          expanded.add(s.toLowerCase());
        }
      }
    }
    return Array.from(expanded);
  }

  /**
   * Compute Levenshtein distance for typo tolerance
   */
  static levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
