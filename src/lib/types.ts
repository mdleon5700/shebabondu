export interface JobPosition {







  title: string;







  grade: string;







  posts: number;







  salary: string;







  minEducation: string;







  govtFee?: number;







}















export interface JobCircular {







  id: string;







  title: string;







  organization: string;







  logo: string;







  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health' | 'engineer';







  categoryLabel: string;







  grade: string;







  totalPosts: number;







  salary: string;







  minEducation: string;







  minAge: number;







  maxAge: number;







  districts: string;







  deadline: string;







  daysRemaining: number;







  govtFee: number;







  serviceFee: number;







  officialLink: string;







  circularImage: string;







  circularPdfUrl?: string;







  circularPages?: string[];







  audioSummary: string;







  featured?: boolean;







  publishedDate: string;







  requirements: string[];







  positions?: JobPosition[];







  feeRange?: string;







  ageCutOffDate?: string;







  smsPrefix?: string;







  minCgpa?: number;







  minDivision?: '1st' | '2nd';







  allowThirdDivision?: boolean;







  minFirstDivisionsCount?: number;







  documentsRequired?: string[];



  seoTitle?: string;



  seoDescription?: string;



  seoKeywords?: string[];



  bengaliDescription?: string;



  faqItems?: Array<{ question: string; answer: string }>;



  aiGeneratedAt?: string;



  slug?: string;



  refNo?: string;



  designation?: string;



  eligibility?: string;



  pdfUrl?: string;



  status?: string;



  isHot?: boolean;



  createdAt?: string;



  lastVerifiedAt?: string;



  updatedAt?: string;
  orgType?: string;
  subCategory?: string;
  employmentType?: 'full_time' | 'part_time' | 'contractual' | 'internship' | 'project';
  workArrangement?: 'on_site' | 'hybrid' | 'remote';
  division?: string;
  district?: string;
  upazila?: string;
  salaryType?: 'fixed' | 'range' | 'negotiable' | 'not_disclosed';
  applicationStartDate?: string;
  applicationMethod?: string;
  applicationInstructions?: string;
  experienceYears?: string;
  skills?: string[];
  canonicalUrl?: string;
  robotsDirective?: string;
  ogImage?: string;
  twitterImage?: string;
  verificationStatus?: 'UNVERIFIED' | 'AI_EXTRACTED' | 'MANUAL_ENTERED' | 'MANUAL_CORRECTED' | 'SOURCE_REVIEWED' | 'VERIFIED';
  verificationConfidence?: number;
  verificationNotes?: string;
  verifiedBy?: string;
  revisionHistory?: Array<{
    timestamp: string;
    adminId: string;
    action: string;
    changedFields: string[];
    summary: string;
  }>;
}















export interface EducationRecord {







  id?: string;







  level: string; // 'SSC', 'HSC', 'Diploma', 'Honours', 'Masters'







  degree: string;







  boardOrUni: string;







  roll?: string;







  reg?: string;







  year?: string;







  result?: string;







  majorSubject?: string;







  institutionName?: string;







  academicStatus?: 'COMPLETED' | 'CURRENTLY_STUDYING' | 'RESULT_PENDING' | 'DISCONTINUED';







  expectedPassingYear?: string;







  resultType?: 'GPA' | 'CGPA' | 'DIVISION' | 'CLASS' | 'PERCENTAGE' | 'PASS_FAIL' | 'GRADE';







  scale?: number;







  gpa?: number;







  cgpa?: number;







  divisionOrClass?: string;







  percentage?: number;







  isPrimary?: boolean;







  certificateDocumentId?: string;







  certificateFileUrl?: string;







  certificateFileName?: string;







  verificationStatus?: 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION' | 'EXPIRED';







  verificationRemarks?: string;







  verifiedAt?: string;







  verifiedBy?: string;







}















export interface ExperienceRecord {







  id: string;







  designation: string;







  organization: string;







  startDate: string;







  endDate: string;







  isCurrent: boolean;







  responsibilities: string;







}















export interface TrainingRecord {
  id: string;
  title: string;
  institute: string;
  duration: string;
  year: string;
  subject?: string;
  credentialUrl?: string;
  certificateDocumentId?: string;
  certificateFileUrl?: string;
  verificationStatus?: 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION';
  verificationRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  checksumSha256?: string;
  mimeType?: string;
  educationRecordId?: string;
  secureUrl?: string;
  version?: number;
  replacedAt?: string;
  previousVersionId?: string;
}















export interface CandidateDocument {
  id: string;
  type: string;
  title: string;
  fileName: string;
  fileSize: string;
  dimensions?: string;
  uploadDate: string;
  dataUrl?: string;
  fileUrl?: string;
  category?: string;
  isVerified?: boolean;
  verificationStatus?: 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION';
  verificationRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  checksumSha256?: string;
  mimeType?: string;
  educationRecordId?: string;
  secureUrl?: string;
  version?: number;
  replacedAt?: string;
  previousVersionId?: string;
}















export interface AddressDetails {



  careOf?: string;



  villageRoad?: string;



  division?: string;



  district?: string;



  upazilaThana?: string;



  postOffice?: string;



  postCode?: string;



}







export interface CandidateProfile {



  id?: string;



  passwordHash?: string;



  presentAddressDetails?: AddressDetails;



  permanentAddressDetails?: AddressDetails;



  sameAsPresentAddress?: boolean;







  name: string;







  nameBn: string;







  fatherName: string;







  motherName: string;







  fatherNameBn?: string;







  motherNameBn?: string;







  fatherNid?: string;



  fatherNidUrl?: string;







  motherNid?: string;



  motherNidUrl?: string;







  nagorikCertificateUrl?: string;







  nidFrontUrl?: string;







  nidBackUrl?: string;



  birthCertificateUrl?: string;



  characterCertificateUrl?: string;



  documents?: CandidateDocument[];



  customDocuments?: CandidateDocument[];







  email: string;







  phone: string;







  username?: string;







  dob: string;







  gender: 'male' | 'female';







  nid: string;







  division?: string;



  district: string;







  address: string;







  permanentAddress?: string;







  nationality?: string;







  maritalStatus?: 'single' | 'married' | 'other';







  photoUrl: string;







  signatureUrl: string;







  education: EducationRecord[];







  walletBalance: number;







  // Extended Smart Fields







  quota?: 'none' | 'freedom_fighter' | 'disabled' | 'ethnic_minority' | 'ansar';







  quotaCertificateUrl?: string;







  skills?: string[];







  experiences?: ExperienceRecord[];







  trainings?: TrainingRecord[];







  languages?: string[];







  profileCompletionPercentage?: number;



  isVerified?: boolean;



  accountStatus?: 'active' | 'suspended' | 'banned';



  alertPreferences?: JobAlertPreference;



  careerPreferences?: import('./matching/types').CareerPreferences;
  careerObjective?: string;
  professionalSummary?: string;
  currentPosition?: string;
  currentOrganization?: string;
  expectedSalary?: string;
  adminNotes?: Array<{
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
  }>;
  adminAuditHistory?: Array<{
    timestamp: string;
    adminId: string;
    action: string;
    changedFields: string[];
    notes: string;
    reason?: string;
  }>;







}















export interface ApplicationStatusHistoryItem {







  status: 'draft' | 'pending_payment' | 'processing' | 'submitted' | 'fee_paid' | 'completed' | 'admit_issued' | 'rejected';







  date: string;







  notes?: string;







  updatedBy?: string;







}















export interface ApplicationRequest {







  id: string;



  submittedAt?: string;







  jobId: string;







  jobTitle: string;







  organization: string;







  postName: string;







  candidateName: string;







  candidatePhone: string;







  candidateDistrict: string;







  date: string;







  totalAmount: number;







  paymentMethod: 'bKash' | 'Nagad' | 'Wallet';







  trxId?: string;







  status: 'pending_payment' | 'processing' | 'completed' | 'admit_issued' | 'rejected' | 'draft' | 'submitted' | 'fee_paid';







  teleTalkTrackingId?: string;







  teleTalkPassword?: string;







  corporateTrackingId?: string;







  submissionChannel?: string;







  applicantCopyPdfUrl?: string;







  notes?: string;







  statusHistory?: ApplicationStatusHistoryItem[];







  userReportedStatus?: string;







  verificationType?: 'user_reported' | 'admin_verified' | 'officially_verified';







  governmentFee?: number;







  serviceCharge?: number;







  couponDiscount?: number;







  raffleDiscount?: number;







  financialSnapshot?: FinancialSnapshot;







  senderPhone?: string;







  paymentScreenshotUrl?: string;







  walletDeduction?: number;







  cashPaid?: number;







  submittedEducation?: EducationRecord[];







  submittedEducationLevels?: string[];







  createdAt?: string;



  pdfUrl?: string;



  rejectionReason?: string;



  candidateId?: string;



  attachedDocuments?: Array<{



    id: string;



    title: string;



    type?: string;



    url: string;



    uploadDate?: string;



    fileSize?: string;



  }>;







}















export interface WalletTransaction {
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;







  id: string;







  date: string;







  amount: number;







  type: 'recharge' | 'fee_deduction' | 'refund' | 'cashback';







  description: string;







  method: 'bKash' | 'Nagad' | 'Wallet' | 'Bank';







  trxId: string;







  status: 'completed' | 'pending' | 'failed';







  receiptUrl?: string;







}















export interface NotificationItem {







  id: string;







  title: string;







  message: string;







  date: string;







  read: boolean;







  type: 'deadline' | 'admit' | 'application' | 'exam' | 'system';







  link?: string;







}















export interface JobAlertPreference {







  categories: string[];







  districts: string[];







  grades: string[];







  emailAlert: boolean;







  smsAlert: boolean;







  whatsappAlert: boolean;







  frequency: 'daily' | 'weekly' | 'instant';







}















export interface EligibilityResult {







  status: 'eligible' | 'not_eligible' | 'need_info' | 'needs_review';







  statusLabel: string;







  reasons: string[];







  ageCalculated?: {







    years: number;







    months: number;







    days: number;







    meetsAge: boolean;







  };







  educationMatch?: {







    matched: boolean;







    required: string;







    provided: string;







  };







  resultMatch?: {







    matched: boolean;







    hasThirdDivision: boolean;







    firstDivisionsCount: number;







    details: string;







  };







  positionsEvaluated?: {







    title: string;







    grade: string;







    posts: number;







    minEducation: string;







    govtFee?: number;







    isEligible: boolean;







    reason: string;







  }[];







  eligiblePositionsCount?: number;







  totalPositionsCount?: number;







}























export type DiscountType = 'fixed' | 'percentage';







export type CouponStatus = 'active' | 'paused' | 'expired';







export type CampaignStatus = 'active' | 'paused' | 'ended';















export interface Coupon {







  id: string;







  code: string;







  title: string;







  description?: string;







  discountType: DiscountType;







  discountValue: number;







  minServiceCharge: number;







  maxDiscountCap?: number;







  startDate: string;







  expiryDate: string;







  status: CouponStatus;







  globalUsageLimit?: number;







  usedCount: number;







  perCandidateLimit?: number;







  newCandidateOnly?: boolean;







  allowCombineWithRaffle: boolean;







  totalBudget?: number;







  usedBudget?: number;







  createdAt: string;







  updatedAt: string;







}















export interface RaffleCampaign {







  id: string;







  title: string;







  description: string;







  bonusType: DiscountType;







  bonusValue: number;







  minServiceCharge: number;







  maxBonusPerOrder: number;







  totalBudget?: number;







  usedBudget?: number;







  startDate: string;







  endDate: string;







  status: CampaignStatus;







  hasServiceDiscount: boolean;







  hasPrizeDraw: boolean;







  allowCombineWithCoupon: boolean;







  createdAt: string;







  updatedAt: string;







}















export interface CouponRedemption {







  id: string;







  couponId: string;







  couponCode: string;







  candidateId: string;







  orderId: string;







  discountAmount: number;







  serviceChargeBeforeDiscount: number;







  date: string;







  status: 'reserved' | 'committed' | 'released';







}















export interface RaffleEntry {







  id: string;







  campaignId: string;







  candidateId: string;







  orderId: string;







  bonusAwarded: number;







  hasPrizeDrawEntry: boolean;







  ticketNumber?: string;







  date: string;







  status: 'reserved' | 'committed' | 'cancelled';







}















export interface FinancialSnapshot {







  governmentApplicationFee: number;







  serviceCharge: number;







  raffleBonusDiscount: number;







  couponDiscount: number;







  finalServiceCharge: number;







  totalPayable: number;







  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';







  currency: 'BDT';







  appliedCouponCode?: string;







  appliedRaffleCampaignId?: string;







  hasPrizeDrawEntry?: boolean;







  raffleTicketNumber?: string;







  snapshotCreatedAt: string;







  isImmutable?: boolean;







}















export interface AdminAuditLog {







  id: string;







  adminId: string;







  action: 'create_coupon' | 'update_coupon' | 'create_raffle' | 'update_raffle' | 'order_adjustment' | 'source_approval' | 'source_rejection' | 'source_create' | 'source_update' | 'source_toggle' | 'source_archive' | 'source_delete' | string;







  targetId: string;







  targetType: 'coupon' | 'raffle' | 'order' | 'source' | 'page' | string;







  changes: Record<string, { old?: any; new?: any }>;







  notes?: string;







  timestamp: string;







}















// ==========================================







// WEBSITE BUILDER (ELEMENTOR-LIKE) TYPES







// ==========================================







export type SectionType = 'hero' | 'features' | 'jobs' | 'cta' | 'faq' | 'text' | 'stats';















export interface SectionStyle {







  backgroundColor?: string;







  textColor?: string;







  accentColor?: string;







  paddingY?: 'sm' | 'md' | 'lg' | 'xl';







  maxWidth?: 'sm' | 'md' | 'lg' | 'full';







  columns?: 1 | 2 | 3 | 4;







  textAlign?: 'left' | 'center' | 'right';







  borderRadius?: 'none' | 'md' | 'xl' | '2xl';







}















export interface PageSection {







  id: string;







  type: SectionType;







  title: string;







  subtitle?: string;







  content: Record<string, any>;







  style: SectionStyle;







  isVisible: boolean;







}















export interface PageRevision {







  id: string;







  version: number;







  savedAt: string;







  savedBy: string;







  status: 'draft' | 'published';







  sections: PageSection[];







  notes?: string;







}















export interface PageRecord {
  publishedContent?: {
    useOnCanonicalPath?: boolean;
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    sections: PageSection[];
    publishedAt: string;
  };







  id: string;







  slug: string;







  title: string;







  metaTitle: string;







  metaDescription: string;







  status: 'published' | 'draft' | 'archived';







  version: number;







  isSystemPage?: boolean;







  sections: PageSection[];







  revisions: PageRevision[];







  updatedAt: string;







  publishedAt?: string;







}















// ==========================================







// JOB SOURCES & INGESTION DRAFTS TYPES







// ==========================================







export type SourceClassification = 'official' | 'news' | 'job_board' | 'custom_api';







export type CollectionMethod = 'html_scrape' | 'json_api' | 'rss_feed' | 'gemini_ocr_pdf' | 'manual_entry';







export type SourceHealthStatus = 'healthy' | 'degraded' | 'failing' | 'paused';















export interface SourceErrorDetails {







  timestamp: string;







  message: string;







  httpStatus?: number;







  retryCount: number;







}















export interface SourceCollectionMetrics {







  discovered: number;







  collected: number;







  failed: number;







  deduplicated: number;







}







export type SpiderRunStatus = 'pending' | 'running' | 'completed' | 'completed_with_warnings' | 'failed' | 'cancelled';



export type SpiderTriggerType = 'manual' | 'cron' | 'admin' | 'api';







export interface SpiderFailedRecord {



  url: string;



  title?: string;



  reason: string;



  retryCount: number;



  lastAttemptAt: string;



}







export interface SpiderRun {



  id: string;



  sourceId: string;



  sourceName: string;



  triggerType: SpiderTriggerType;



  startedAt: string;



  finishedAt?: string;



  durationMs: number;



  status: SpiderRunStatus;



  pagesVisited: number;



  jobsDiscovered: number;



  jobsExtracted: number;



  pdfsDiscovered: number;



  pdfsDownloaded: number;



  newDraftsCreated: number;



  duplicatesDetected: number;



  updatesDetected: number;



  conflictsDetected: number;



  failedRecords: SpiderFailedRecord[];



  errorSummary?: string;



}















export interface JobSource {







  id: string;







  name: string;







  sourceUrl: string;







  type: 'official_portal' | 'ministry' | 'newspaper' | 'direct_employer';







  fetchStatus: 'active' | 'syncing' | 'error';







  lastFetchedAt: string;







  autoSync: boolean;















  // Backward-compatible registry extensions







  classification?: SourceClassification;







  enabled?: boolean;







  collectionMethod?: CollectionMethod;







  scanIntervalMinutes?: number;







  lastSuccessfulScanAt?: string;







  nextScheduledScanAt?: string;







  healthStatus?: SourceHealthStatus;







  lastError?: SourceErrorDetails | null;







  metrics?: SourceCollectionMetrics;







  adminNotes?: string;







  scanDepthPages?: number;







  organizationName?: string;







  officialWebsiteUrl?: string;







  listingUrl?: string;







  priority?: 'high' | 'medium' | 'low';







  timeoutMs?: number;







  maxResponseSizeBytes?: number;







  createdAt?: string;







  updatedAt?: string;







}















export interface CircularDraft {







  id: string;







  sourceName: string;







  sourceUrl: string;







  evidenceUrl?: string;







  extractedTitle: string;







  extractedOrg: string;







  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health';







  grade?: string;







  deadline: string;







  vacancies: number;







  minEducation: string;







  salary: string;







  govtFee: number;







  confidenceScore: number;







  duplicateDetected: boolean;







  status: 'pending_review' | 'approved' | 'rejected';







  approvedJobId?: string;







  notes?: string;







  createdAt: string;







  refNo?: string;







  rawEvidenceText?: string;







  evidenceHash?: string;
  pdfUrl?: string;
  circularPdfUrl?: string;







  needsReview?: boolean;







  reviewReason?: string;







  extractionWarnings?: string[];







  pdfEvidence?: PdfExtractedCircular;







  htmlPdfComparison?: HtmlPdfComparison;







  isCancellationNotice?: boolean;







  conflictSummary?: string[];







  aiGeneratedContent?: {



    bengaliDescription?: string;



    seoTitle?: string;



    seoDescription?: string;



    targetKeywords?: string[];



    faqItems?: { question: string; answer: string }[];



    generatedAt?: string;



  };



  verificationResult?: import('./verification/types').VerificationResult;



  adminCorrections?: import('./verification/types').AdminCorrection[];



  contentStudioState?: import('./content_studio/types').ContentStudioState;



}







export interface PdfExtractedField<T = any> {



  field: string;



  originalText: string;



  normalizedValue?: T;



  pageNumber: number;



  evidenceSnippet: string;



  extractionMethod: 'regex_pattern' | 'table_row' | 'heading_match' | 'section_match' | 'metadata';



  confidence: number;



}







export interface PdfExtractedCircular {



  pdfUrl: string;



  pdfHash: string;



  isScanned: boolean;



  requiresOcr: boolean;



  totalPages: number;



  pagesProcessed: number;



  extractedAt: string;



  isDeadlineExtended?: boolean;



  isCorrectionNotice?: boolean;



  isCancellationNotice?: boolean;



  fields: {



    title?: PdfExtractedField<string>;



    organization?: PdfExtractedField<string>;



    refNo?: PdfExtractedField<string>;



    publishedDate?: PdfExtractedField<string>;



    startDate?: PdfExtractedField<string>;



    deadline?: PdfExtractedField<string>;



    extendedDeadline?: PdfExtractedField<string>;



    vacancies?: PdfExtractedField<number>;



    postWiseVacancies?: PdfExtractedField<Array<{ postName: string; vacancies: number; grade?: string }>>;



    govtFee?: PdfExtractedField<number>;



    feeCategories?: PdfExtractedField<Array<{ category: string; amount: number }>>;



    grade?: PdfExtractedField<string>;



    salary?: PdfExtractedField<string>;



    minEducation?: PdfExtractedField<string>;



    educationalRequirements?: PdfExtractedField<string[]>;



    ageLimit?: PdfExtractedField<string>;



    ageCutoffDate?: PdfExtractedField<string>;



    applicationMethod?: PdfExtractedField<string>;



    applicationUrl?: PdfExtractedField<string>;



  };



  rawTextByPage: Array<{ pageNumber: number; text: string }>;



  warnings: string[];



  extractionStatus: 'success' | 'partial' | 'requires_ocr' | 'failed';



}







export interface HtmlPdfFieldComparison<T = any> {



  field: string;



  htmlValue?: T;



  pdfValue?: T;



  hasConflict: boolean;



  conflictReason?: string;



  resolution?: 'use_pdf' | 'use_html' | 'needs_manual_review';



}







export interface HtmlPdfComparison {



  hasConflicts: boolean;



  conflictSummary: string[];



  isDeadlineExtensionNotice: boolean;



  isCorrectionNotice: boolean;



  proposedAction: 'keep_html' | 'update_from_pdf' | 'create_update_proposal' | 'manual_review_required';



  fieldComparisons: Record<string, HtmlPdfFieldComparison>;



}















// ==========================================







// PRIVATE COMPANY / EMPLOYER ATS TYPES







// ==========================================







export interface CompanyProfile {
  slug?: string;







  id: string;







  name: string;







  nameBn?: string;







  logo?: string;







  industry: string;







  district: string;







  verified: boolean;







  contactEmail: string;







  contactPhone: string;







  activeJobsCount: number;
  organizationType?: 'government' | 'semi_govt' | 'autonomous' | 'bank' | 'private' | 'ngo' | 'other';
  website?: string;
  description?: string;
  address?: string;
  division?: string;
  status?: 'active' | 'suspended' | 'pending';
  updatedAt?: string;







  createdAt: string;







}















export interface CompanyApplication {







  id: string;







  companyId: string;







  jobId: string;







  jobTitle: string;







  candidateId: string;







  candidateName: string;







  candidatePhone: string;







  candidateEmail: string;







  cvUrl?: string;







  status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'rejected' | 'hired';







  interviewDate?: string;







  notes?: string;







  appliedAt: string;







}















export * from './verification/types';





// =========================================================================
// PHASE 04: MEDIA LIBRARY ITEM & CENTRALIZED PLATFORM CONFIGURATION
// =========================================================================

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  caption?: string;
  associatedJobId?: string;
  associatedJobTitle?: string;
  associatedContentId?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    supportEmail: string;
    supportPhone: string;
    officeAddress: string;
    whatsappNumber?: string;
    logoUrl?: string;
    faviconUrl?: string;
    defaultTimezone: string;
    defaultLanguage: 'bn' | 'en';
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string[];
    defaultOgImage: string;
    googleSiteVerification?: string;
    robotsTxtContent?: string;
  };
  workflow: {
    requireVerificationBeforePublish: boolean;
    autoScrapeInterval: '6h' | '12h' | '24h';
    allowCandidateSelfRegistration: boolean;
    maintenanceMode: boolean;
    defaultJobVisibility: 'public' | 'draft' | 'archived';
  };
  notifications: {
    smsProvider: 'teletalk' | 'greenweb' | 'ssl_wireless' | 'mock';
    emailProvider: 'smtp' | 'resend' | 'sendgrid' | 'mock';
    smsEnabled: boolean;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    dailyDigestHour: number;
  };
  operational: {
    standardServiceFee: number;
    expressServiceFee: number;
    urgentServiceFee: number;
    officialBkashNumber: string;
    officialNagadNumber: string;
    officialRocketNumber: string;
  };
  updatedAt: string;
  updatedBy: string;
}
