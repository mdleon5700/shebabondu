/**
 * Explainable Confidence Scoring & State Machine Engine
 * Weights:
 * - Source Authority: 25%
 * - Document Availability & PDF Integrity: 20%
 * - Deterministic Field Concordance: 35%
 * - Gemini AI Verification & Fact Checking: 20%
 */
import { 
  SourceAuthorityResult, 
  DocumentValidationResult, 
  FieldVerificationRecord, 
  GeminiVerificationResult,
  VerificationStatus,
  ConfidenceBand
} from './types';

export function evaluateVerificationConfidence(params: {
  sourceAuthority: SourceAuthorityResult;
  documentValidation: DocumentValidationResult;
  fields: Record<string, FieldVerificationRecord>;
  geminiResult?: GeminiVerificationResult;
  isCancellation?: boolean;
  isRevised?: boolean;
  isExtended?: boolean;
}): {
  overallScore: number;
  confidenceBand: ConfidenceBand;
  breakdown: {
    authorityScore: number;
    documentScore: number;
    fieldConcordanceScore: number;
    aiVerificationScore: number;
  };
  status: VerificationStatus;
  reasons: string[];
} {
  const reasons: string[] = [];

  // 1. Source Authority (Weight 25%)
  const authorityScore = Math.max(0, Math.min(1, params.sourceAuthority.score));
  reasons.push(`উৎস নির্ভরযোগ্যতা স্কোর: ${Math.round(authorityScore * 100)}% (${params.sourceAuthority.authorityLabel})`);

  // 2. Document Availability & Integrity (Weight 20%)
  let documentScore = 0.3; // Default minimum
  if (params.documentValidation.status === 'Text Extracted') {
    documentScore = 1.0;
    reasons.push('অফিসিয়াল PDF থেকে টেক্সট সফলভাবে নিষ্কাশন করা হয়েছে');
  } else if (params.documentValidation.status === 'Available') {
    documentScore = 0.75;
    reasons.push('অফিসিয়াল PDF লিংক উপলব্ধ');
  } else if (params.documentValidation.status === 'OCR Required') {
    documentScore = 0.6;
    reasons.push('স্ক্যানকৃত ইমেজ PDF (OCR প্রয়োজন)');
  } else if (params.documentValidation.status === 'Needs Manual Review') {
    documentScore = 0.5;
    reasons.push('ডকুমেন্ট টেক্সট অপর্যাপ্ত হওয়ায় ম্যানুয়াল রিভিউ আবশ্যক');
  } else {
    reasons.push('কোনো অফিসিয়াল PDF বা সংযুক্ত ডকুমেন্ট পাওয়া যায়নি');
  }

  // 3. Field Concordance (Weight 35%)
  const fieldList = Object.values(params.fields);
  let fieldScoreSum = 0;
  let hasConflictingField = false;
  let hasMissingRequiredField = false;

  for (const f of fieldList) {
    if (f.verificationStatus === 'CONFLICTING') {
      hasConflictingField = true;
      fieldScoreSum += 0.2;
    } else if (f.verificationStatus === 'VERIFIED') {
      fieldScoreSum += 1.0;
    } else if (f.verificationStatus === 'SUPPORTED_BY_EVIDENCE') {
      fieldScoreSum += 0.85;
    } else if (f.verificationStatus === 'NOT_FOUND') {
      if (['vacancies', 'deadline', 'title'].includes(f.field)) {
        hasMissingRequiredField = true;
      }
      fieldScoreSum += 0.4;
    }
  }
  const fieldConcordanceScore = fieldList.length > 0 ? fieldScoreSum / fieldList.length : 0.5;
  reasons.push(`ক্ষেত্রভিত্তিক তথ্য সামঞ্জস্য: ${Math.round(fieldConcordanceScore * 100)}%`);

  // 4. Gemini AI Verification (Weight 20%)
  let aiVerificationScore = 0.8; // Safe baseline if AI is bypassed/fallback
  if (params.geminiResult) {
    if (params.geminiResult.success) {
      aiVerificationScore = params.geminiResult.aiConfidence;
      if (params.geminiResult.detectedIssues.length > 0) {
        aiVerificationScore = Math.max(0.3, aiVerificationScore - (params.geminiResult.detectedIssues.length * 0.1));
      }
      reasons.push(`AI সত্যতা যাচাই কনফিডেন্স: ${Math.round(aiVerificationScore * 100)}%`);
    } else {
      aiVerificationScore = 0.5;
      reasons.push('AI যাচাই ব্যর্থ বা উপলব্ধ নয়; ডিটারমিনিস্টিক চেক বজায় রাখা হয়েছে');
    }
  }

  // Calculate Weighted Overall Score
  const rawScore = 
    (authorityScore * 0.25) +
    (documentScore * 0.20) +
    (fieldConcordanceScore * 0.35) +
    (aiVerificationScore * 0.20);

  const overallScore = Number(Math.max(0.05, Math.min(1.0, rawScore)).toFixed(3));

  // Determine Confidence Band
  let confidenceBand: ConfidenceBand = 'UNVERIFIED';
  if (overallScore >= 0.85) {
    confidenceBand = 'HIGH';
  } else if (overallScore >= 0.70) {
    confidenceBand = 'MEDIUM';
  } else if (overallScore >= 0.50) {
    confidenceBand = 'LOW';
  }

  // Determine State Machine Verification Status
  let status: VerificationStatus = 'VERIFIED';

  if (hasConflictingField) {
    status = 'CONFLICT_DETECTED';
    reasons.push('সতর্কতা: HTML ও PDF এর মধ্যে তথ্যগত অমিল (দ্বন্দ্ব) রয়েছে');
  } else if (params.isCancellation) {
    status = 'NEEDS_MANUAL_REVIEW';
    reasons.push('বিজ্ঞপ্তিটি নিয়োগ কার্যক্রম বাতিল বা স্থগিত সংক্রান্ত');
  } else if (hasMissingRequiredField || overallScore < 0.70) {
    status = 'NEEDS_MANUAL_REVIEW';
    reasons.push('অপরিহার্য ফিল্ড অনুপস্থিত অথবা সামগ্রিক কনফিডেন্স ৭০% এর কম');
  } else if (
    (params.geminiResult && params.geminiResult.detectedIssues.length > 0) ||
    params.isRevised || 
    params.isExtended
  ) {
    status = 'VERIFIED_WITH_WARNINGS';
    reasons.push('বিজ্ঞপ্তিতে কিছু অসঙ্গতি বা সংশোধনী নোটিশ রয়েছে');
  }

  return {
    overallScore,
    confidenceBand,
    breakdown: {
      authorityScore: Number(authorityScore.toFixed(3)),
      documentScore: Number(documentScore.toFixed(3)),
      fieldConcordanceScore: Number(fieldConcordanceScore.toFixed(3)),
      aiVerificationScore: Number(aiVerificationScore.toFixed(3))
    },
    status,
    reasons
  };
}
