/**
 * CHAKRI SHEBA (\u099a\u09be\u0995\u09b0\u09bf \u09b8\u09c7\u09ac\u09be) \u2014 STEP 09: SKILLS TAXONOMY & NORMALIZER
 * Bilingual (Bengali + English) Standardized Skill Dictionary
 */

export interface TaxonomySkill {
  id: string;
  nameEn: string;
  nameBn: string;
  category: 'technical' | 'language' | 'office' | 'vocational' | 'general';
  aliases: string[];
}

export const CANONICAL_SKILLS: TaxonomySkill[] = [
  // Office & Productivity
  {
    id: 'bangla_typing',
    nameEn: 'Bengali Typing',
    nameBn: '\u09ac\u09be\u0982\u09b2\u09be \u099f\u09be\u0987\u09aa\u09bf\u0982',
    category: 'office',
    aliases: ['\u099f\u09be\u0987\u09aa\u09bf\u0982', '\u09ac\u09be\u0982\u09b2\u09be \u099f\u09be\u0987\u09aa\u09bf\u0982', 'bangla typing', 'typing speed', '\u099f\u09be\u0987\u09aa\u09bf\u0982 \u09b8\u09cd\u09aa\u09bf\u09a1', '\u0995\u09ae\u09cd\u09aa\u09bf\u0989\u099f\u09be\u09b0 \u099f\u09be\u0987\u09aa\u09bf\u0982']
  },
  {
    id: 'english_typing',
    nameEn: 'English Typing',
    nameBn: '\u0987\u0982\u09b0\u09c7\u099c\u09bf \u099f\u09be\u0987\u09aa\u09bf\u0982',
    category: 'office',
    aliases: ['english typing', '\u0987\u0982\u09b0\u09c7\u099c\u09bf \u099f\u09be\u0987\u09aa\u09bf\u0982', '\u099f\u09be\u0987\u09aa\u09bf\u0982 \u0987\u0982\u09b0\u09c7\u099c\u09bf']
  },
  {
    id: 'ms_word',
    nameEn: 'Microsoft Word',
    nameBn: '\u09ae\u09be\u0987\u0995\u09cd\u09b0\u09cb\u09b8\u09ab\u099f \u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1',
    category: 'office',
    aliases: ['ms word', 'word', '\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1', 'word processing', '\u09ae\u09be\u0987\u0995\u09cd\u09b0\u09cb\u09b8\u09ab\u099f \u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1']
  },
  {
    id: 'ms_excel',
    nameEn: 'Microsoft Excel',
    nameBn: '\u09ae\u09be\u0987\u0995\u09cd\u09b0\u09cb\u09b8\u09ab\u099f \u098f\u0995\u09cd\u09b8\u09c7\u09b2',
    category: 'office',
    aliases: ['ms excel', 'excel', '\u098f\u0995\u09cd\u09b8\u09c7\u09b2', '\u09b8\u09cd\u09aa\u09cd\u09b0\u09c7\u09a1\u09b6\u09bf\u099f', 'spreadsheet', '\u09a1\u09be\u099f\u09be \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf', 'data entry']
  },
  {
    id: 'ms_powerpoint',
    nameEn: 'Microsoft PowerPoint',
    nameBn: '\u09aa\u09be\u0993\u09af\u09bc\u09be\u09b0\u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f',
    category: 'office',
    aliases: ['powerpoint', 'ppt', '\u09aa\u09be\u0993\u09af\u09bc\u09be\u09b0\u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f', '\u09aa\u09cd\u09b0\u09c7\u099c\u09c7\u09a8\u09cd\u099f\u09c7\u09b6\u09a8', 'presentation']
  },
  {
    id: 'computer_operation',
    nameEn: 'Computer Operation',
    nameBn: '\u0995\u09ae\u09cd\u09aa\u09bf\u0989\u099f\u09be\u09b0 \u099a\u09be\u09b2\u09a8\u09be',
    category: 'office',
    aliases: ['কম্পিউটার চালনা', 'কম্পিউটার পরিচালনা', 'কম্পিউটার জ্ঞান', 'কম্পিউটার অ্যাপ্লিকেশন', 'basic computer', 'computer operation', 'computer literacy']
  },

  // Technical & Software
  {
    id: 'javascript',
    nameEn: 'JavaScript',
    nameBn: '\u099c\u09be\u09ad\u09be\u09b8\u09cd\u0995\u09cd\u09b0\u09bf\u09aa\u09cd\u099f',
    category: 'technical',
    aliases: ['javascript', 'js', '\u099c\u09be\u09ad\u09be\u09b8\u09cd\u0995\u09cd\u09b0\u09bf\u09aa\u09cd\u099f']
  },
  {
    id: 'typescript',
    nameEn: 'TypeScript',
    nameBn: '\u099f\u09be\u0987\u09aa\u09b8\u09cd\u0995\u09cd\u09b0\u09bf\u09aa\u09cd\u099f',
    category: 'technical',
    aliases: ['typescript', 'ts', '\u099f\u09be\u0987\u09aa\u09b8\u09cd\u0995\u09cd\u09b0\u09bf\u09aa\u09cd\u099f']
  },
  {
    id: 'react',
    nameEn: 'React.js',
    nameBn: '\u09b0\u09bf\u0985\u09cd\u09af\u09be\u0995\u09cd\u099f',
    category: 'technical',
    aliases: ['react', 'reactjs', 'react.js', '\u09b0\u09bf\u0985\u09cd\u09af\u09be\u0995\u09cd\u099f']
  },
  {
    id: 'nextjs',
    nameEn: 'Next.js',
    nameBn: '\u09a8\u09c7\u0995\u09cd\u09b8\u099f.\u099c\u09c7\u098f\u09b8',
    category: 'technical',
    aliases: ['next', 'nextjs', 'next.js', '\u09a8\u09c7\u0995\u09cd\u09b8\u099f \u099c\u09c7\u098f\u09b8']
  },
  {
    id: 'nodejs',
    nameEn: 'Node.js',
    nameBn: '\u09a8\u09cb\u09a1.\u099c\u09c7\u098f\u09b8',
    category: 'technical',
    aliases: ['node', 'nodejs', 'node.js', '\u09a8\u09cb\u09a1 \u099c\u09c7\u098f\u09b8']
  },
  {
    id: 'python',
    nameEn: 'Python',
    nameBn: '\u09aa\u09be\u0987\u09a5\u09a8',
    category: 'technical',
    aliases: ['python', '\u09aa\u09be\u0987\u09a5\u09a8', 'django', 'flask']
  },
  {
    id: 'sql',
    nameEn: 'SQL & Database',
    nameBn: '\u098f\u09b8\u0995\u09bf\u0989\u098f\u09b2 \u0993 \u09a1\u09c7\u099f\u09be\u09ac\u09c7\u099c',
    category: 'technical',
    aliases: ['sql', 'database', 'mysql', 'postgresql', '\u09a1\u09c7\u099f\u09be\u09ac\u09c7\u099c', '\u098f\u09b8\u0995\u09bf\u0989\u098f\u09b2', 'oracle']
  },
  {
    id: 'networking',
    nameEn: 'Computer Networking',
    nameBn: '\u09a8\u09c7\u099f\u0993\u09af\u09bc\u09be\u09b0\u09cd\u0995\u09bf\u0982',
    category: 'technical',
    aliases: ['network', 'networking', 'ccna', '\u09b0\u09be\u0989\u099f\u09be\u09b0', '\u09b2\u09cd\u09af\u09be\u09a8', 'lan', '\u09a8\u09c7\u099f\u0993\u09af\u09bc\u09be\u09b0\u09cd\u0995\u09bf\u0982']
  },

  // Financial & Accounting
  {
    id: 'accounting',
    nameEn: 'Accounting & Auditing',
    nameBn: '\u09b9\u09bf\u09b8\u09be\u09ac\u09ac\u09bf\u099c\u09cd\u099e\u09be\u09a8 \u0993 \u0985\u09a1\u09bf\u099f',
    category: 'technical',
    aliases: ['accounting', 'accounts', '\u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f\u09bf\u0982', '\u09b9\u09bf\u09b8\u09be\u09ac\u09ac\u09bf\u099c\u09cd\u099e\u09be\u09a8', '\u09b9\u09bf\u09b8\u09be\u09ac\u09b0\u0995\u09cd\u09b7\u09a3', 'audit', '\u0985\u09a1\u09bf\u099f', '\u09ac\u09c1\u0995\u0995\u09bf\u09aa\u09bf\u0982', 'bookkeeping']
  },
  {
    id: 'tally',
    nameEn: 'Tally / ERP',
    nameBn: '\u099f\u09cd\u09af\u09be\u09b2\u09bf \u0993 \u0987\u0986\u09b0\u09aa\u09bf',
    category: 'technical',
    aliases: ['tally', 'erp', '\u099f\u09cd\u09af\u09be\u09b2\u09bf', '\u0995\u09c1\u0987\u0995\u09ac\u09c1\u0995\u09b8', 'quickbooks']
  },

  // Creative & Vocational
  {
    id: 'graphic_design',
    nameEn: 'Graphic Design',
    nameBn: '\u0997\u09cd\u09b0\u09be\u09ab\u09bf\u0995 \u09a1\u09bf\u099c\u09be\u0987\u09a8',
    category: 'vocational',
    aliases: ['graphic design', 'photoshop', 'illustrator', '\u0997\u09cd\u09b0\u09be\u09ab\u09bf\u0995\u09b8', '\u0997\u09cd\u09b0\u09be\u09ab\u09bf\u0995 \u09a1\u09bf\u099c\u09be\u0987\u09a8', '\u09ab\u099f\u09cb\u09b6\u09aa']
  },
  {
    id: 'digital_marketing',
    nameEn: 'Digital Marketing & SEO',
    nameBn: '\u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u09ae\u09be\u09b0\u09cd\u0995\u09c7\u099f\u09bf\u0982 \u0993 \u098f\u09b8\u0987\u0993',
    category: 'vocational',
    aliases: ['digital marketing', 'seo', '\u098f\u09b8\u0987\u0993', '\u09ae\u09be\u09b0\u09cd\u0995\u09c7\u099f\u09bf\u0982', 'social media', '\u09ae\u09be\u09b0\u09cd\u0995\u09c7\u099f\u09bf\u0982 \u0993 \u09ac\u09bf\u0995\u09cd\u09b0\u09af\u09bc']
  },
  {
    id: 'driving',
    nameEn: 'Driving License',
    nameBn: '\u09a1\u09cd\u09b0\u09be\u0987\u09ad\u09bf\u0982 \u09b2\u09be\u0987\u09b8\u09c7\u09a8\u09cd\u09b8',
    category: 'vocational',
    aliases: ['driving', '\u09a1\u09cd\u09b0\u09be\u0987\u09ad\u09bf\u0982', '\u09a1\u09cd\u09b0\u09be\u0987\u09ad\u09bf\u0982 \u09b2\u09be\u0987\u09b8\u09c7\u09a8\u09cd\u09b8', '\u09ad\u09be\u09b0\u09c0 \u09a1\u09cd\u09b0\u09be\u0987\u09ad\u09bf\u0982', '\u09b9\u09be\u09b2\u0995\u09be \u09a1\u09cd\u09b0\u09be\u0987\u09ad\u09bf\u0982']
  },

  // Language & General
  {
    id: 'spoken_english',
    nameEn: 'English Communication',
    nameBn: '\u0987\u0982\u09b0\u09c7\u099c\u09bf \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997',
    category: 'language',
    aliases: ['english', 'spoken english', '\u0987\u0982\u09b0\u09c7\u099c\u09bf', '\u0987\u0982\u09b0\u09c7\u099c\u09bf \u09ad\u09be\u09b7\u09be', 'ielts', '\u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u09a6\u0995\u09cd\u09b7\u09a4\u09be', 'communication']
  }
];

export class SkillsTaxonomyManager {
  /**
   * Normalizes raw user skill text or requirement token to canonical skill ID
   */
  public static normalizeSkill(rawText: string): TaxonomySkill | null {
    if (!rawText) return null;
    const clean = rawText.trim().toLowerCase();

    for (const skill of CANONICAL_SKILLS) {
      if (skill.id === clean) return skill;
      if (skill.nameEn.toLowerCase() === clean) return skill;
      if (skill.nameBn === clean) return skill;

      for (const alias of skill.aliases) {
        if (clean.includes(alias.toLowerCase()) || alias.toLowerCase().includes(clean)) {
          return skill;
        }
      }
    }
    return null;
  }

  /**
   * Finds matching canonical skill or creates safe unlisted skill representation
   */
  public static resolveSkill(rawText: string): { id: string; nameBn: string; nameEn: string; category: any } {
    const match = this.normalizeSkill(rawText);
    if (match) {
      return {
        id: match.id,
        nameBn: match.nameBn,
        nameEn: match.nameEn,
        category: match.category
      };
    }
    const clean = rawText.trim();
    const slug = clean.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    return {
      id: slug || ('skill_' + Date.now()),
      nameBn: clean,
      nameEn: clean,
      category: 'general'
    };
  }
}
