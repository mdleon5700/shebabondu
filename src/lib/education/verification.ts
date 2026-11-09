/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 12: CERTIFICATE VERIFICATION & AI/OCR ASSISTANCE
 * Lifecycle State Machine, Admin Decision Flow & Non-Destructive OCR Extraction Helper
 */

import { 
  CertificateVerificationStatus, 
  EducationVerificationDecision, 
  CertificateOcrResult, 
  EnhancedEducationRecord 
} from './types';
import { serverDB } from '../db';

export class CertificateVerificationManager {
  /**
   * Applies an admin verification decision to an education or training record
   */
  public static applyDecision(decision: {
    candidateId: string;
    recordId: string;
    recordType: 'education' | 'training' | 'document' | 'biometric_photo' | 'biometric_signature';
    status: CertificateVerificationStatus;
    reviewerId: string;
    reviewerName?: string;
    remarks: string;
  }): { success: boolean; error?: string; updatedRecord?: any } {
    const candidate = serverDB.getCandidateById(decision.candidateId);
    if (!candidate) {
      return { success: false, error: 'প্রার্থী প্রোফাইল খুঁজে পাওয়া যায়নি' };
    }

    const nowIso = new Date().toISOString();

    if (decision.recordType === 'education') {
      const eduList = candidate.education || [];
      const eduIdx = eduList.findIndex(e => e.id === decision.recordId);
      if (eduIdx < 0) {
        return { success: false, error: 'শিক্ষাগত রেকর্ড খুঁজে পাওয়া যায়নি' };
      }

      const existing = eduList[eduIdx];
      const updated: EnhancedEducationRecord = {
        ...existing,
        verificationStatus: decision.status,
        verificationRemarks: decision.remarks.trim(),
        verifiedAt: nowIso,
        verifiedBy: decision.reviewerId
      };

      const candAfter = serverDB.updateCandidateEducation(decision.candidateId, decision.recordId, updated as any);
      
      // Also sync linked document if present
      if (existing.certificateDocumentId) {
        serverDB.updateDocumentVerification(decision.candidateId, existing.certificateDocumentId, {
          isVerified: decision.status === 'VERIFIED',
          verificationStatus: decision.status,
          verificationRemarks: decision.remarks
        });
      }

      // Add audit log
      serverDB.recordAdminAudit({
        adminId: decision.reviewerId,
        action: 'certificate_verify',
        targetId: decision.recordId,
        targetType: 'education',
        changes: {},
        notes: `Certificate verification decision: ${decision.status} for candidate ${decision.candidateId}. Remarks: ${decision.remarks}`
      });

      // Dispatch in-app candidate notification
      let notifTitle = '';
      let notifMsg = '';
      if (decision.status === 'VERIFIED') {
        notifTitle = `সনদপত্র ভেরিফিকেশন সম্পন্ন: ${existing.degree || existing.level}`;
        notifMsg = `আপনার ${existing.degree || existing.level}-এর সনদপত্র অ্যাডমিন কর্তৃক সফলভাবে ভেরিফাই ও অনুমোদিত হয়েছে।`;
      } else if (decision.status === 'REJECTED') {
        notifTitle = `সনদপত্র বাতিল নোটিশ: ${existing.degree || existing.level}`;
        notifMsg = `আপনার দাখিলকৃত সনদপত্রটি বাতিল করা হয়েছে। কারণ: ${decision.remarks}`;
      } else if (decision.status === 'NEEDS_CORRECTION') {
        notifTitle = `সনদপত্রে সংশোধন প্রয়োজন: ${existing.degree || existing.level}`;
        notifMsg = `আপনার দাখিলকৃত তথ্যের সাথে সনদপত্রের অমিল রয়েছে। কারণ: ${decision.remarks}। অনুগ্রহ করে সঠিক কপি আপলোড করুন।`;
      }

      if (notifTitle) {
        serverDB.addCandidateNotification(decision.candidateId, {
          title: notifTitle,
          message: notifMsg,
          type: 'system',
          link: '/dashboard/profile'
        });
      }

      return { success: true, updatedRecord: updated };
    }

    if (decision.recordType === 'document') {
      const docUpdated = serverDB.updateDocumentVerification(decision.candidateId, decision.recordId, {
        isVerified: decision.status === 'VERIFIED',
        verificationStatus: decision.status,
        verificationRemarks: decision.remarks.trim(),
        verifiedAt: nowIso,
        verifiedBy: decision.reviewerId
      });

      let notifTitle = '';
      let notifMsg = '';
      if (decision.status === 'VERIFIED') {
        notifTitle = 'ডকুমেন্ট ভেরিফিকেশন অনুমোদিত';
        notifMsg = 'আপনার দাখিলকৃত ডকুমেন্টটি অ্যাডমিন কর্তৃক সফলভাবে অনুমোদিত হয়েছে।';
      } else if (decision.status === 'REJECTED') {
        notifTitle = 'ডকুমেন্ট বাতিল নোটিশ';
        notifMsg = 'আপনার দাখিলকৃত ডকুমেন্টটি বাতিল করা হয়েছে। কারণ: ' + decision.remarks;
      } else if (decision.status === 'NEEDS_CORRECTION') {
        notifTitle = 'ডকুমেন্টে সংশোধন প্রয়োজন';
        notifMsg = 'আপনার ডকুমেন্টে সংশোধন প্রয়োজন: ' + decision.remarks + '। অনুগ্রহ করে নতুন কপি আপলোড করুন।';
      }

      if (notifTitle) {
        serverDB.addCandidateNotification(decision.candidateId, {
          title: notifTitle,
          message: notifMsg,
          type: 'system',
          link: '/dashboard/vault'
        });
      }

      return {
        success: true,
        updatedRecord: {
          id: decision.recordId,
          status: decision.status,
          remarks: decision.remarks
        }
      };
    }

        if (decision.recordType === 'biometric_photo' || decision.recordType === 'biometric_signature') {
      const isPhoto = decision.recordType === 'biometric_photo';
      const fieldName = isPhoto ? 'photoVerificationStatus' : 'signatureVerificationStatus';
      const labelBn = isPhoto ? 'ছবি (৩০০x৩০০)' : 'স্বাক্ষর (৩০০x৮০)';

      serverDB.updateCandidate(decision.candidateId, {
        [fieldName]: decision.status,
        updatedAt: nowIso
      } as any);

      serverDB.recordAdminAudit({
        adminId: decision.reviewerId,
        action: isPhoto ? 'photo_verify' : 'signature_verify',
        targetId: decision.candidateId,
        targetType: 'candidate_biometric',
        changes: { [fieldName]: { new: decision.status } },
        notes: `Biometric verification: ${decision.status} for ${labelBn}. Remarks: ${decision.remarks}`
      });

      if (decision.status === 'VERIFIED') {
        serverDB.addCandidateNotification(decision.candidateId, {
          title: `বায়োমেট্রিক ${labelBn} ভেরিফিকেশন অনুমোদিত`,
          message: `আপনার আপলোডকৃত ${labelBn} টেলিটক স্ট্যান্ডার্ড অনুযায়ী সফলভাবে অনুমোদিত হয়েছে।`,
          type: 'system',
          link: '/dashboard/profile'
        });
      }

      return {
        success: true,
        updatedRecord: {
          id: decision.recordId,
          type: decision.recordType,
          status: decision.status,
          remarks: decision.remarks
        }
      };
    }

    return { success: false, error: 'Unsupported record type' };
  }

  /**
   * Retrieves all pending certificate verifications across candidate directory for admin review queue
   */
  public static getPendingVerificationQueue(): Array<{
    candidateId: string;
    candidateName: string;
    candidatePhone: string;
    recordId: string;
    recordType: 'education' | 'training';
    degreeOrTitle: string;
    institution: string;
    year?: string;
    result?: string;
    documentId?: string;
    documentUrl?: string;
    status: CertificateVerificationStatus;
    submittedAt?: string;
  }> {
    const candidates = serverDB.getCandidates();
    const queue: any[] = [];

    for (const cand of candidates) {
      const eduList: EnhancedEducationRecord[] = (cand.education as any[]) || [];
      for (const edu of eduList) {
        // If has document attached and not yet verified or pending review
        if (edu.certificateDocumentId || edu.certificateFileUrl) {
          const status = edu.verificationStatus || 'PENDING_REVIEW';
          queue.push({
            candidateId: cand.id,
            candidateName: cand.nameBn || cand.name,
            candidatePhone: cand.phone,
            recordId: edu.id || '',
            recordType: 'education',
            degreeOrTitle: edu.degree || edu.level,
            institution: edu.boardOrUni || edu.institutionName || 'অনির্ধারিত',
            year: edu.year,
            result: edu.result,
            documentId: edu.certificateDocumentId,
            documentUrl: edu.certificateFileUrl,
            status,
            submittedAt: edu.updatedAt || edu.createdAt || cand.updatedAt
          });
        }
      }
    }

    return queue;
  }
}

export class CertificateOcrHelper {
  /**
   * Non-destructive, heuristic-assisted extraction helper for certificate metadata
   * Never automatically overwrites or verifies records.
   */
  public static assistExtractMetadata(input: {
    fileName: string;
    fileContentSnippet?: string;
    documentType?: string;
  }): CertificateOcrResult {
    const text = ((input.fileName || '') + ' ' + (input.fileContentSnippet || '')).toLowerCase();

    // 1. Degree Detection
    let degVal = '';
    let degConf = 0;
    if (text.includes('ssc') || text.includes('dakhil') || text.includes('মাধ্যমিক')) {
      degVal = 'মাধ্যমিক স্কুল সার্টিফিকেট (SSC)';
      degConf = 0.92;
    } else if (text.includes('hsc') || text.includes('alim') || text.includes('উচ্চ মাধ্যমিক')) {
      degVal = 'উচ্চ মাধ্যমিক সার্টিফিকেট (HSC)';
      degConf = 0.90;
    } else if (text.includes('cse') || text.includes('computer science') || text.includes('বিএসসি')) {
      degVal = 'বিএসসি ইন কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং';
      degConf = 0.88;
    } else if (text.includes('bachelor') || text.includes('honours') || text.includes('অনার্স')) {
      degVal = 'স্নাতক (অনার্স)';
      degConf = 0.82;
    } else if (text.includes('masters') || text.includes('মাস্টার্স') || text.includes('msc')) {
      degVal = 'স্নাতকোত্তর (মাস্টার্স)';
      degConf = 0.85;
    }

    // 2. Board or University Detection
    let boardVal = '';
    let boardConf = 0;
    if (text.includes('dhaka board') || text.includes('ঢাকা বোর্ড')) {
      boardVal = 'ঢাকা শিক্ষা বোর্ড';
      boardConf = 0.90;
    } else if (text.includes('dhaka university') || text.includes('du') || text.includes('ঢাকা বিশ্ববিদ্যালয়')) {
      boardVal = 'ঢাকা বিশ্ববিদ্যালয়';
      boardConf = 0.88;
    } else if (text.includes('buet') || text.includes('বুয়েট')) {
      boardVal = 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)';
      boardConf = 0.95;
    } else if (text.includes('national university') || text.includes('জাতীয় বিশ্ববিদ্যালয়') || text.includes('nu')) {
      boardVal = 'জাতীয় বিশ্ববিদ্যালয়';
      boardConf = 0.85;
    } else if (text.includes('bteb') || text.includes('কারিগরি')) {
      boardVal = 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড (BTEB)';
      boardConf = 0.90;
    }

    // 3. Passing Year Detection
    let yearVal = '';
    let yearConf = 0;
    const yearMatch = text.match(/\b(199[0-9]|20[0-2][0-9])\b/);
    if (yearMatch) {
      yearVal = yearMatch[1];
      yearConf = 0.85;
    }

    // 4. Result / GPA Detection
    let gpaVal = '';
    let gpaConf = 0;
    const gpaMatch = text.match(/\b([2-5]\.[0-9]{1,2})\b/);
    if (gpaMatch) {
      gpaVal = gpaMatch[1];
      gpaConf = 0.80;
    }

    const confidences = [degConf, boardConf, yearConf, gpaConf].filter(c => c > 0);
    const overallConf = confidences.length > 0 
      ? Number((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)) 
      : 0;

    return {
      examinationOrDegree: degVal ? { value: degVal, confidence: degConf, level: degConf >= 0.85 ? 'HIGH' : 'MEDIUM' } : undefined,
      boardOrUniversity: boardVal ? { value: boardVal, confidence: boardConf, level: boardConf >= 0.85 ? 'HIGH' : 'MEDIUM' } : undefined,
      passingYear: yearVal ? { value: yearVal, confidence: yearConf, level: yearConf >= 0.85 ? 'HIGH' : 'MEDIUM' } : undefined,
      resultGpa: gpaVal ? { value: gpaVal, confidence: gpaConf, level: gpaConf >= 0.85 ? 'HIGH' : 'MEDIUM' } : undefined,
      overallConfidence: overallConf,
      isAssisted: overallConf > 0,
      disclaimerBn: 'এআই/ওসিআর নিষ্কাশিত তথ্য শুধুমাত্র দ্রুত ফর্ম পূরণে সহায়তার উদ্দেশ্যে। এটি প্রাতিষ্ঠানিক ভেরিফিকেশন নয়। প্রার্থীর সঠিক তথ্য নিশ্চিত করে সংরক্ষণ করুন।'
    };
  }
}
