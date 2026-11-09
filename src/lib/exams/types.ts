export interface AdmitCardItem {
  id: string;
  title: string;
  organization: string;
  category: 'govt' | 'bank' | 'teacher' | 'railway' | 'autonomous';
  categoryLabel: string;
  postsCount: number;
  portalUrl: string;
  portalName: string;
  teletalkPrefix?: string;
  status: 'active' | 'upcoming' | 'expired';
  statusLabel: string;
  examDate: string;
  deadlineText: string;
  instructions?: string;
}

export interface ExamNoticeItem {
  id: string;
  title: string;
  organization: string;
  type: 'preliminary' | 'written' | 'practical' | 'seat_plan';
  typeLabel: string;
  badge: 'জরুরি' | 'নতুন' | 'চলমান' | 'সংশোধিত' | 'সক্রিয়';
  examDate: string;
  examTime: string;
  centersCount: string;
  totalCandidates?: string;
  pdfUrl?: string;
  seatPlanSummary?: Array<{
    centerName: string;
    rollRange: string;
    totalSeats: number;
    address: string;
  }>;
  instructions?: string[];
}

export interface VivaNoticeItem {
  id: string;
  title: string;
  organization: string;
  department: string;
  postsCount: number;
  startDate: string;
  endDate: string;
  reportingTime: string;
  venue: string;
  pdfUrl?: string;
  boardSchedules: Array<{
    boardNo: string;
    date: string;
    time: string;
    rollRange: string;
    candidatesCount: number;
  }>;
  requiredDocuments: string[];
}

export interface ExamResultItem {
  id: string;
  title: string;
  organization: string;
  type: 'written' | 'preliminary' | 'final';
  typeLabel: string;
  publishedDate: string;
  passedCount: number;
  totalAppeared?: number;
  pdfUrl?: string;
  nextStepNotice?: string;
  passedRolls: string[];
}
