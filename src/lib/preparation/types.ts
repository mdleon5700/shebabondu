export interface SyllabusTopic {
  title: string;
  marks?: number;
  importance: 'high' | 'medium' | 'standard';
  subtopics: string[];
}

export interface ExamSyllabusItem {
  id: string;
  subjectName: string;
  bcsMarks: number;
  primaryMarks: number;
  bankMarks: number;
  iconName: string;
  description: string;
  topics: SyllabusTopic[];
  recommendedBooks: string[];
  preparationStrategy: string;
}

export interface QuestionBankItem {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  examName: string;
  examCategory: 'bcs' | 'bank' | 'primary' | 'railway' | 'ntrca';
  year: string;
  subject: 'বাংলা' | 'ইংরেজি' | 'গণিত' | 'সাধারণ জ্ঞান' | 'বিজ্ঞান ও তথ্যপ্রযুক্তি';
}

export interface QuestionSetDownloadItem {
  id: string;
  title: string;
  category: 'bcs' | 'bank' | 'teacher' | 'railway';
  year: string;
  fileSize: string;
  downloads: number;
  pdfUrl: string;
}

export interface ModelTestQuestion {
  id: number;
  q: string;
  options: [string, string, string, string];
  ans: number;
  explanation: string;
  subject: string;
}

export interface ModelTestItem {
  id: string;
  title: string;
  category: 'bcs' | 'bank' | 'primary' | 'general';
  categoryLabel: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: number;
  questionsCount: number;
  passingScore: number;
  description: string;
  questions: ModelTestQuestion[];
}

export interface CareerGuideSection {
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  tipBox?: string;
}

export interface CareerGuideItem {
  slug: string;
  title: string;
  category: string;
  shortDesc?: string;
  readTime: string;
  heroSummary: string;
  keyTakeaways: string[];
  sections: CareerGuideSection[];
  interactiveChecklist?: string[];
  sampleTemplate?: {
    title: string;
    description: string;
    snippet: string;
  };
  relatedSlugs: string[];
}

export interface BlogArticleSection {
  heading: string;
  paragraphs: string[];
  bulletPoints?: string[];
  alertTip?: string;
}

export interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: 'bcs' | 'bank' | 'primary' | 'gazette' | 'tips';
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  viewsCount: number;
  coverGradient: string;
  sections: BlogArticleSection[];
  relatedSlugs: string[];
}
