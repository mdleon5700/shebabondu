/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 09: SMART JOB MATCHING & RECOMMENDATION TYPES
 * Structured Definitions for Candidate Matching Profiles, Job Normalization,
 * Dimension Breakdown, Explainable Scoring & Recommendation Feeds.
 */

import { EducationRecord, ExperienceRecord, JobCircular } from '../types';

// ============================================================================
// 1. CANDIDATE PROFILE MATCHING EXTENSIONS
// ============================================================================

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'expert';

export interface UserSkillItem {
  id: string;
  name: string;
  normalizedId: string;
  category: 'technical' | 'language' | 'office' | 'vocational' | 'general';
  proficiency?: ProficiencyLevel;
  yearsExperience?: number;
  isUserConfirmed: boolean;
}

export type EmploymentTypePreference = 
  | 'full_time' 
  | 'part_time' 
  | 'contractual' 
  | 'internship' 
  | 'govt' 
  | 'freelance' 
  | 'any';

export type OrganizationTypePreference = 
  | 'government' 
  | 'bank' 
  | 'autonomous' 
  | 'private_company' 
  | 'ngo' 
  | 'multinational' 
  | 'any';

export interface CareerPreferences {
  preferredCategories: string[];        // Standard Category slugs or IDs
  preferredSubcategories?: string[];
  preferredOrgTypes: OrganizationTypePreference[];
  preferredJobTitles: string[];         // Target keywords
  preferredEmploymentTypes: EmploymentTypePreference[];
  preferredDivisions: string[];         // Standard BD Divisions
  preferredDistricts: string[];         // Specific preferred districts
  remotePreference: 'any' | 'onsite' | 'remote' | 'hybrid';
  preferredSalaryMin?: number;          // Minimum expected BDT salary
  preferredSalaryMax?: number;          // Maximum expected BDT salary
  preferredExperienceLevel?: 'fresher' | 'junior' | 'mid' | 'senior' | 'any';
}

export interface ProfileCompletenessResult {
  percentage: number;
  isComplete: boolean;
  sections: {
    personal: boolean;
    education: boolean;
    skills: boolean;
    experience: boolean;
    careerPreferences: boolean;
    location: boolean;
  };
  missingFieldsBn: string[];
  recommendationTipBn: string;
}

// ============================================================================
// 2. NORMALIZED JOB REQUIREMENTS
// ============================================================================

export type NormalizedEducationLevel = 
  | 'jsc' 
  | 'jdc'
  | 'ssc' 
  | 'dakhil'
  | 'hsc' 
  | 'alim'
  | 'diploma' 
  | 'degree'
  | 'bachelor' 
  | 'masters' 
  | 'kamil'
  | 'mphil'
  | 'phd' 
  | 'any';

export type RequirementVerificationStatus = 
  | 'REQUIRED' 
  | 'PREFERRED' 
  | 'OPTIONAL' 
  | 'NOT_SPECIFIED' 
  | 'UNVERIFIED';

export interface NormalizedJobRequirements {
  jobId: string;
  requiredEducationLevel: NormalizedEducationLevel;
  requiredEducationLevelBn: string;
  requiredDegrees: string[];
  requiredSubjects: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperienceYears: number;
  minAge?: number;
  maxAge?: number;
  districts: string[];
  allBangladesh: boolean;
  category: string;
  organizationType: OrganizationTypePreference;
  employmentType: EmploymentTypePreference;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable?: boolean;
  isSalaryUndisclosed?: boolean;
  verificationStatuses: {
    education: RequirementVerificationStatus;
    skills: RequirementVerificationStatus;
    experience: RequirementVerificationStatus;
    location: RequirementVerificationStatus;
    age: RequirementVerificationStatus;
  };
}

// ============================================================================
// 3. MANDATORY ELIGIBILITY & MATCH STATUSES
// ============================================================================

export type MandatoryEligibilityStatus = 
  | 'MEETS_VERIFIED_REQUIREMENTS'
  | 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
  | 'POSSIBLY_ELIGIBLE'
  | 'NEEDS_MORE_INFORMATION'
  | 'REQUIREMENTS_CONFLICTING'
  | 'NOT_EVALUATED';

export type MatchDisplayBand = 
  | 'EXCELLENT'  // 90?100%
  | 'STRONG'     // 75?89%
  | 'GOOD'       // 60?74%
  | 'PARTIAL'    // 40?59%
  | 'LOW';       // Below 40%

// ============================================================================
// 4. MATCHING BREAKDOWN & EXPLANATION
// ============================================================================

export interface DimensionScore {
  score: number;        // Normalized to 0 - 100
  effectiveWeight: number; // Applied weight in calculation (e.g. 0.25)
  weightedContribution: number; // score * effectiveWeight
  status: 'EXACT_MATCH' | 'ACCEPTABLE_MATCH' | 'PARTIAL_MATCH' | 'MISMATCH' | 'NOT_SPECIFIED';
  detailsBn: string;
}

export interface EducationDimensionScore extends DimensionScore {
  candidateLevel?: NormalizedEducationLevel;
  requiredLevel: NormalizedEducationLevel;
  matchedDegree?: string;
  subjectMatch: boolean;
}

export interface SkillsDimensionScore extends DimensionScore {
  matchedSkills: string[];
  missingRequired: string[];
  missingPreferred: string[];
}

export interface ExperienceDimensionScore extends DimensionScore {
  userYears: number;
  requiredYears: number;
  isFresherFriendly: boolean;
}

export interface LocationDimensionScore extends DimensionScore {
  isAllBangladesh: boolean;
  userDistrict?: string;
  matchedDistrict?: string;
}

export interface MatchingDimensionBreakdown {
  education: EducationDimensionScore;
  skills: SkillsDimensionScore;
  experience: ExperienceDimensionScore;
  category: DimensionScore;
  location: LocationDimensionScore;
  employmentType: DimensionScore;
  organizationType: DimensionScore;
  salary: DimensionScore;
}

export interface JobMatchResult {
  jobId: string;
  candidateId: string;
  overallScore: number;                 // 0 ? 100 rounded integer
  displayBand: MatchDisplayBand;
  displayBandBn: string;
  displayBandColor: string;
  eligibilityStatus: MandatoryEligibilityStatus;
  eligibilityLabelBn: string;
  eligibilityBadgeColor: string;
  breakdown: MatchingDimensionBreakdown;
  matchReasonsBn: string[];
  qualificationGapsBn: string[];
  missingProfileFields: string[];
  scoringVersion: string;
  calculatedAt: string;
}

// ============================================================================
// 5. RECOMMENDATIONS & USER FEEDBACK
// ============================================================================

export type RecommendationFeedbackAction = 
  | 'RELEVANT'
  | 'NOT_RELEVANT'
  | 'ALREADY_APPLIED'
  | 'NOT_INTERESTED'
  | 'SAVED'
  | 'HIDDEN';

export interface RecommendationFeedbackItem {
  id: string;
  candidateId: string;
  jobId: string;
  action: RecommendationFeedbackAction;
  note?: string;
  createdAt: string;
}

export interface EnrichedJobRecommendation {
  job: JobCircular;
  match: JobMatchResult;
  isSaved: boolean;
  feedbackAction?: RecommendationFeedbackAction;
  recommendationBadgeBn: string;
}

export interface RecommendationSectionFeeds {
  candidateId: string;
  generatedAt: string;
  profileCompleteness: ProfileCompletenessResult;
  totalEligibleMatches: number;
  excellentMatchesCount: number;
  strongMatchesCount: number;
  bestMatches: EnrichedJobRecommendation[];
  skillsMatches: EnrichedJobRecommendation[];
  educationMatches: EnrichedJobRecommendation[];
  locationMatches: EnrichedJobRecommendation[];
  closingSoonMatches: EnrichedJobRecommendation[];
  recentlyPublishedMatches: EnrichedJobRecommendation[];
}

// ============================================================================
// 6. MATCHING ENGINE CONFIGURATION
// ============================================================================

export interface MatchingWeightsConfig {
  education: number;        // default: 25
  skills: number;           // default: 25
  experience: number;       // default: 15
  category: number;         // default: 10
  location: number;         // default: 10
  employmentType: number;   // default: 5
  organizationType: number; // default: 5
  salary: number;           // default: 5
}

export interface MatchingEngineConfig {
  version: string;
  enabled: boolean;
  weights: MatchingWeightsConfig;
  minScoreToRecommend: number; // default: 40
  excellentThreshold: number;  // default: 90
  strongThreshold: number;     // default: 75
  goodThreshold: number;       // default: 60
  partialThreshold: number;    // default: 40
  allowOverqualification: boolean; // default: true (Bachelor can apply to HSC job if circular permits)
  quotaAgeRelaxationYears: number; // default: 2 (30 -> 32)
  updatedAt: string;
  updatedBy: string;
}
