/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 12: EDUCATION & CERTIFICATE TYPES
 */

export type AcademicStatus =
  | 'COMPLETED'
  | 'CURRENTLY_STUDYING'
  | 'RESULT_PENDING'
  | 'DISCONTINUED';

export type AcademicResultType =
  | 'GPA'
  | 'CGPA'
  | 'DIVISION'
  | 'CLASS'
  | 'PERCENTAGE'
  | 'PASS_FAIL'
  | 'GRADE';

export type CertificateVerificationStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'NEEDS_CORRECTION'
  | 'EXPIRED';

export type EducationLevelCategory =
  | 'junior_secondary'
  | 'secondary'
  | 'higher_secondary'
  | 'diploma'
  | 'undergraduate'
  | 'postgraduate'
  | 'advanced'
  | 'other';

export interface DegreeProgramDefinition {
  code: string;
  levelCategory: EducationLevelCategory;
  name: string;
  nameBn: string;
  defaultScale: number; // 5.00 for SSC/HSC, 4.00 for University
  standardDurationYears: number;
  availableDisciplines: string[];
}

export interface EnhancedEducationRecord {
  id?: string;
  level: string; // e.g. 'স্নাতক (সম্মান)', 'মাধ্যমিক (SSC)'
  degree: string; // e.g. 'বিএসসি ইন সিএসই', 'বিজ্ঞান'
  institutionName?: string;
  boardOrUni: string; // e.g. 'ঢাকা বিশ্ববিদ্যালয়', 'ঢাকা বোর্ড'
  roll?: string;
  reg?: string;
  year?: string; // Passing year (optional if currently studying)
  result?: string; // Formatted result string, e.g. 'GPA 5.00 / 5.00'
  majorSubject?: string;

  // Step 12 Enhancements
  academicStatus?: AcademicStatus;
  expectedPassingYear?: string;
  resultType?: AcademicResultType;
  scale?: number; // 5.00 or 4.00
  gpa?: number;
  cgpa?: number;
  divisionOrClass?: 'FIRST' | 'SECOND' | 'THIRD' | string;
  percentage?: number;
  isPrimary?: boolean; // Candidate's highest or primary degree

  // Certificate Document Association
  certificateDocumentId?: string;
  certificateFileUrl?: string;
  certificateFileName?: string;
  verificationStatus?: CertificateVerificationStatus;
  verificationRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingCertificateRecord {
  id?: string;
  title: string;
  institute: string;
  duration: string;
  year: string;
  subject?: string;
  credentialUrl?: string;
  certificateDocumentId?: string;
  certificateFileUrl?: string;
  verificationStatus?: CertificateVerificationStatus;
  verificationRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationVerificationDecision {
  id?: string;
  candidateId: string;
  recordId: string; // Education or Training ID
  recordType: 'education' | 'training' | 'document' | 'biometric_photo' | 'biometric_signature';
  status: CertificateVerificationStatus;
  reviewerId: string;
  reviewerName?: string;
  remarks: string;
  documentUrl?: string;
  timestamp: string;
}

export interface OcrExtractionField {
  value: string;
  confidence: number; // 0.0 to 1.0
  level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_DETECTED';
}

export interface CertificateOcrResult {
  candidateName?: OcrExtractionField;
  examinationOrDegree?: OcrExtractionField;
  institution?: OcrExtractionField;
  boardOrUniversity?: OcrExtractionField;
  passingYear?: OcrExtractionField;
  resultGpa?: OcrExtractionField;
  overallConfidence: number;
  isAssisted: boolean;
  disclaimerBn: string;
}


