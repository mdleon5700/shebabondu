/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 08: CIRCULAR CHANGE & UPDATE DETECTOR
 * Automated Difference Engine, Proposal Generation & Admin Approval Lifecycle
 */

import { 
  CircularChangeProposal, 
  CircularChangeType, 
  DeadlineRevision,
  NotificationDeliveryItem 
} from './types';
import { CentralDeadlineEngine } from './engine';
import { serverDB } from '../db';
import { JobCircular } from '../types';

export class CircularChangeDetector {
  /**
   * Compare existing published job against newly scraped or revised circular data
   */
  public static detectChanges(
    existingJob: JobCircular,
    incoming: {
      deadline?: string;
      totalPosts?: number;
      vacancies?: number;
      minEducation?: string;
      govtFee?: number;
      sourceUrl?: string;
      status?: string;
      title?: string;
      evidenceSnippet?: string;
      docHash?: string;
    }
  ): CircularChangeProposal[] {
    const proposals: CircularChangeProposal[] = [];
    const sourceUrl = incoming.sourceUrl || existingJob.officialLink || 'https://alljobs.teletalk.com.bd';

    // 1. Detect Cancellation Notice
    const incomingText = ((incoming.title || '') + ' ' + (incoming.status || '') + ' ' + (incoming.deadline || '')).toLowerCase();
    if (incomingText.includes('বাতিল') || incomingText.includes('cancelled') || incoming.status === 'CANCELLED') {
      if ((existingJob as any).lifecycleStatus !== 'CANCELLED') {
        proposals.push({
          id: 'prop-cancel-' + existingJob.id + '-' + Date.now(),
          jobId: existingJob.id,
          jobTitle: existingJob.title,
          organization: existingJob.organization,
          changeType: 'CANCELLATION',
          field: 'lifecycleStatus',
          oldValue: (existingJob as any).lifecycleStatus || 'ACTIVE',
          newValue: 'CANCELLED',
          sourceUrl,
          evidenceSnippet: incoming.evidenceSnippet || 'বিজ্ঞপ্তি বাতিল সংক্রান্ত অফিসিয়াল নোটিশ প্রকাশিত হয়েছে।',
          evidenceDocHash: incoming.docHash,
          confidence: 0.98,
          status: 'PENDING_REVIEW',
          createdAt: new Date().toISOString()
        });
      }
      return proposals;
    }

    // 2. Detect Suspension Notice
    if (incomingText.includes('স্থগিত') || incomingText.includes('suspended') || incoming.status === 'SUSPENDED') {
      if ((existingJob as any).lifecycleStatus !== 'SUSPENDED') {
        proposals.push({
          id: 'prop-susp-' + existingJob.id + '-' + Date.now(),
          jobId: existingJob.id,
          jobTitle: existingJob.title,
          organization: existingJob.organization,
          changeType: 'SUSPENSION',
          field: 'lifecycleStatus',
          oldValue: (existingJob as any).lifecycleStatus || 'ACTIVE',
          newValue: 'SUSPENDED',
          sourceUrl,
          evidenceSnippet: incoming.evidenceSnippet || 'নিয়োগ কার্যক্রম সাময়িক স্থগিত সংক্রান্ত নোটিশ প্রাপ্ত হয়েছে।',
          evidenceDocHash: incoming.docHash,
          confidence: 0.95,
          status: 'PENDING_REVIEW',
          createdAt: new Date().toISOString()
        });
      }
      return proposals;
    }

    // 3. Detect Reopening of Cancelled or Suspended Circular
    if (((existingJob as any).lifecycleStatus === 'CANCELLED' || (existingJob as any).lifecycleStatus === 'SUSPENDED') &&
        (incoming.status === 'ACTIVE' || (incoming.deadline && !incomingText.includes('বাতিল') && !incomingText.includes('স্থগিত')))) {
      proposals.push({
        id: 'prop-reopen-' + existingJob.id + '-' + Date.now(),
        jobId: existingJob.id,
        jobTitle: existingJob.title,
        organization: existingJob.organization,
        changeType: 'REOPENED',
        field: 'lifecycleStatus',
        oldValue: (existingJob as any).lifecycleStatus,
        newValue: 'ACTIVE',
        sourceUrl,
        evidenceSnippet: incoming.evidenceSnippet || 'স্থগিত/বাতিলকৃত নিয়োগ পুনরায় চালুর সংশোধিত বিজ্ঞপ্তি পাওয়া গেছে।',
        evidenceDocHash: incoming.docHash,
        confidence: 0.92,
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString()
      });
    }

    // 4. Detect Deadline Extension or Shortening
    if (incoming.deadline && incoming.deadline !== existingJob.deadline) {
      const oldParsed = CentralDeadlineEngine.parseDeadline(existingJob.deadline || '');
      const newParsed = CentralDeadlineEngine.parseDeadline(incoming.deadline);

      if (newParsed.deadlineDate && newParsed.deadlineDate !== oldParsed.deadlineDate) {
        const isExtended = newParsed.deadlineDate > oldParsed.deadlineDate;
        proposals.push({
          id: 'prop-dl-' + existingJob.id + '-' + Date.now(),
          jobId: existingJob.id,
          jobTitle: existingJob.title,
          organization: existingJob.organization,
          changeType: isExtended ? 'DEADLINE_EXTENDED' : 'DEADLINE_SHORTENED',
          field: 'deadline',
          oldValue: existingJob.deadline,
          newValue: incoming.deadline,
          sourceUrl,
          evidenceSnippet: incoming.evidenceSnippet || `আবেদনের সময়সীমা ${existingJob.deadline} থেকে পরিবর্তন করে ${incoming.deadline} নির্ধারণ করা হয়েছে।`,
          evidenceDocHash: incoming.docHash,
          confidence: isExtended ? 0.96 : 0.90,
          status: 'PENDING_REVIEW',
          createdAt: new Date().toISOString()
        });
      }
    }

    // 5. Detect Vacancy Count Changes
    const incomingVacancies = incoming.totalPosts ?? incoming.vacancies;
    if (incomingVacancies !== undefined && incomingVacancies !== existingJob.totalPosts) {
      proposals.push({
        id: 'prop-vac-' + existingJob.id + '-' + Date.now(),
        jobId: existingJob.id,
        jobTitle: existingJob.title,
        organization: existingJob.organization,
        changeType: 'VACANCY_CHANGED',
        field: 'totalPosts',
        oldValue: existingJob.totalPosts,
        newValue: incomingVacancies,
        sourceUrl,
        evidenceSnippet: incoming.evidenceSnippet || `পদসংখ্যা ${existingJob.totalPosts} থেকে পরিবর্তিত হয়ে ${incomingVacancies} হয়েছে।`,
        evidenceDocHash: incoming.docHash,
        confidence: 0.92,
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString()
      });
    }

    // 6. Detect Educational Requirement Changes
    if (incoming.minEducation && incoming.minEducation !== existingJob.minEducation) {
      proposals.push({
        id: 'prop-edu-' + existingJob.id + '-' + Date.now(),
        jobId: existingJob.id,
        jobTitle: existingJob.title,
        organization: existingJob.organization,
        changeType: 'QUALIFICATION_CHANGED',
        field: 'minEducation',
        oldValue: existingJob.minEducation,
        newValue: incoming.minEducation,
        sourceUrl,
        evidenceSnippet: incoming.evidenceSnippet || `শিক্ষাগত যোগ্যতা সংশোধন: ${incoming.minEducation}`,
        evidenceDocHash: incoming.docHash,
        confidence: 0.88,
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString()
      });
    }

    // 7. Detect Application Fee Changes
    if (incoming.govtFee !== undefined && incoming.govtFee !== existingJob.govtFee) {
      proposals.push({
        id: 'prop-fee-' + existingJob.id + '-' + Date.now(),
        jobId: existingJob.id,
        jobTitle: existingJob.title,
        organization: existingJob.organization,
        changeType: 'FEE_CHANGED',
        field: 'govtFee',
        oldValue: existingJob.govtFee,
        newValue: incoming.govtFee,
        sourceUrl,
        evidenceSnippet: incoming.evidenceSnippet || `সরকারি ফি পরিবর্তন: ৳${existingJob.govtFee} -> ৳${incoming.govtFee}`,
        evidenceDocHash: incoming.docHash,
        confidence: 0.95,
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString()
      });
    }

    return proposals;
  }

  /**
   * Admin approves a proposed circular change
   */
  public static approveProposal(
    proposalId: string,
    adminId: string,
    reviewNotes?: string
  ): { success: boolean; message: string; updatedJob?: JobCircular } {
    const proposal = serverDB.getCircularChangeProposal(proposalId);
    if (!proposal) {
      return { success: false, message: 'প্রস্তাবনাটি খুঁজে পাওয়া যায়নি' };
    }
    if (proposal.status !== 'PENDING_REVIEW') {
      return { success: false, message: `প্রস্তাবনাটি ইতিমধ্যে ${proposal.status} অবস্থায় রয়েছে` };
    }

    const job = serverDB.getJobById(proposal.jobId);
    if (!job) {
      return { success: false, message: 'সংশ্লিষ্ট চাকরি ডাটাবেজে পাওয়া যায়নি' };
    }

    const previousJobSnapshot = { ...job };

    // Apply the change
    switch (proposal.changeType) {
      case 'DEADLINE_EXTENDED':
      case 'DEADLINE_SHORTENED': {
        const parsedNew = CentralDeadlineEngine.parseDeadline(proposal.newValue);
        const evalResult = CentralDeadlineEngine.evaluateDeadline(job, {
          deadlineOriginalText: proposal.newValue,
          deadlineDate: parsedNew.deadlineDate,
          deadlineTime: parsedNew.deadlineTime,
          deadlinePrecision: parsedNew.precision
        });

        job.deadline = proposal.newValue;
        job.daysRemaining = evalResult.daysRemaining;

        // Record immutable deadline revision
        const revision: DeadlineRevision = {
          id: 'dl-rev-' + Date.now(),
          jobId: job.id,
          previousDeadline: String(proposal.oldValue),
          newDeadline: String(proposal.newValue),
          changeReason: reviewNotes || (proposal.changeType === 'DEADLINE_EXTENDED' ? 'ডেডলাইন বৃদ্ধি করা হয়েছে' : 'ডেডলাইন সংশোধন করা হয়েছে'),
          sourceUrl: proposal.sourceUrl,
          evidenceDocHash: proposal.evidenceDocHash,
          verificationStatus: 'VERIFIED',
          approvedBy: adminId,
          approvedAt: new Date().toISOString(),
          timestamp: new Date().toISOString()
        };
        serverDB.addDeadlineRevision(revision);

        // Notify candidates who saved this job
        this.notifySavedCandidates(job, proposal.changeType === 'DEADLINE_EXTENDED' ? 'deadline_extended' : 'deadline_changed', {
          title: `আবেদনের সময় পরিবর্তন — ${job.organization}`,
          message: `${job.title}-এ আবেদনের শেষ সময় পরিবর্তন করে ${proposal.newValue} নির্ধারণ করা হয়েছে।`
        });
        break;
      }

      case 'CANCELLATION': {
        (job as any).lifecycleStatus = 'CANCELLED';
        (job as any).status = 'CANCELLED';

        this.notifySavedCandidates(job, 'job_cancelled', {
          title: `নিয়োগ কার্যক্রম বাতিল — ${job.organization}`,
          message: `${job.organization}-এর "${job.title}" পদের নিয়োগ বিজ্ঞপ্তিটি বাতিল করা হয়েছে।`
        });
        break;
      }

      case 'SUSPENSION': {
        (job as any).lifecycleStatus = 'SUSPENDED';
        (job as any).status = 'SUSPENDED';

        this.notifySavedCandidates(job, 'job_suspended', {
          title: `নিয়োগ কার্যক্রম স্থগিত — ${job.organization}`,
          message: `${job.organization}-এর "${job.title}" পদের নিয়োগ কার্যক্রম সাময়িকভাবে স্থগিত করা হয়েছে।`
        });
        break;
      }

      case 'REOPENED': {
        (job as any).lifecycleStatus = 'ACTIVE';
        (job as any).status = 'ACTIVE';

        this.notifySavedCandidates(job, 'job_reopened', {
          title: `নিয়োগ কার্যক্রম পুনরায় চালু — ${job.organization}`,
          message: `${job.organization}-এর "${job.title}" পদের নিয়োগ কার্যক্রম পুনরায় সক্রিয় করা হয়েছে।`
        });
        break;
      }

      case 'VACANCY_CHANGED': {
        job.totalPosts = Number(proposal.newValue);
        this.notifySavedCandidates(job, 'circular_updated', {
          title: `শূন্যপদ সংখ্যা হালনাগাদ — ${job.organization}`,
          message: `${job.title} পদে মোট শূন্যপদ পরিবর্তন হয়ে ${proposal.newValue}টি হয়েছে।`
        });
        break;
      }

      case 'QUALIFICATION_CHANGED': {
        job.minEducation = String(proposal.newValue);
        this.notifySavedCandidates(job, 'circular_updated', {
          title: `যোগ্যতার শর্ত সংশোধন — ${job.organization}`,
          message: `${job.title} পদে শিক্ষাগত যোগ্যতার শর্ত সংশোধন করা হয়েছে: ${proposal.newValue}`
        });
        break;
      }

      case 'FEE_CHANGED': {
        job.govtFee = Number(proposal.newValue);
        this.notifySavedCandidates(job, 'circular_updated', {
          title: `আবেদন ফি পরিবর্তন — ${job.organization}`,
          message: `${job.title} পদে সরকারি ফি সংশোধন করে ৳${proposal.newValue} করা হয়েছে।`
        });
        break;
      }
    }

    // Save modified job
    serverDB.saveJob(job);

    // Update proposal status
    serverDB.updateProposalStatus(proposalId, 'APPROVED', adminId, reviewNotes);

    // Audit log
    serverDB.addAuditLog({
      adminId,
      action: 'APPROVE_CIRCULAR_CHANGE_PROPOSAL',
      targetType: 'JOB',
      targetId: job.id,
      notes: `Approved ${proposal.changeType} on job ${job.id}. Notes: ${reviewNotes || 'N/A'}`,
      changes: {
        proposal: { old: previousJobSnapshot, new: job }
      }
    });

    return {
      success: true,
      message: 'প্রস্তাবনাটি সফলভাবে অনুমোদিত এবং মূল বিজ্ঞপ্তিতে প্রতিফলিত হয়েছে',
      updatedJob: job
    };
  }

  /**
   * Admin rejects a proposed circular change
   */
  public static rejectProposal(
    proposalId: string,
    adminId: string,
    rejectReason: string
  ): boolean {
    const success = serverDB.updateProposalStatus(proposalId, 'REJECTED', adminId, rejectReason);
    if (success) {
      serverDB.addAuditLog({
        adminId,
        action: 'REJECT_CIRCULAR_CHANGE_PROPOSAL',
        targetType: 'CIRCULAR_PROPOSAL',
        targetId: proposalId,
        notes: `Rejected proposal ${proposalId}. Reason: ${rejectReason}`,
        changes: { status: { old: 'PENDING_REVIEW', new: 'REJECTED' } }
      });
    }
    return success;
  }

  /**
   * Notify candidates who have bookmarked or subscribed to this job
   */
  private static notifySavedCandidates(
    job: JobCircular,
    type: any,
    payload: { title: string; message: string }
  ) {
    const allCandidates = serverDB.getCandidates();
    for (const cand of allCandidates) {
      const savedJobs = serverDB.getSavedJobs(cand.id);
      if (savedJobs.includes(job.id)) {
        // Enqueue delivery
        const deliveryItem: NotificationDeliveryItem = {
          id: 'notif-del-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          candidateId: cand.id,
          jobId: job.id,
          jobTitle: job.title,
          organization: job.organization,
          type,
          channel: 'in_app',
          title: payload.title,
          message: payload.message,
          link: `/jobs/${job.slug || job.id}`,
          status: 'QUEUED',
          attemptCount: 0,
          dedupeKey: `${cand.id}_${job.id}_${type}_${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString()
        };
        serverDB.enqueueNotificationDelivery(deliveryItem);

        // Immediate in-app notification
        serverDB.addCandidateNotification(cand.id, {
          title: payload.title,
          message: payload.message,
          type: 'system',
          link: `/jobs/${job.slug || job.id}`
        });
      }
    }
  }
}
