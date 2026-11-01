/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 09: PERSONALIZED RECOMMENDER ENGINE
 * Generates Ranked Recommendations, Section Feeds & Profile Completeness
 */

import { CandidateProfile, JobCircular } from '../types';
import { 
  EnrichedJobRecommendation, 
  RecommendationSectionFeeds, 
  ProfileCompletenessResult,
  RecommendationFeedbackAction,
  MatchingEngineConfig
} from './types';
import { SmartJobMatchingEngine, DEFAULT_MATCHING_CONFIG } from './engine';
import { CentralDeadlineEngine } from '../deadlines/engine';
import { serverDB } from '../db';

export class PersonalizedRecommender {
  /**
   * Calculates progressive profile completeness
   */
  public static calculateCompleteness(candidate: CandidateProfile): ProfileCompletenessResult {
    const sections = {
      personal: Boolean(candidate.name && (candidate.dob || (candidate as any).dateOfBirth) && (candidate.phone || candidate.email)),
      education: Boolean(candidate.education && candidate.education.length > 0),
      skills: Boolean(candidate.skills && candidate.skills.length > 0),
      experience: Boolean(candidate.experiences && candidate.experiences.length > 0),
      careerPreferences: Boolean((candidate as any).careerPreferences?.preferredCategories?.length > 0),
      location: Boolean(candidate.district || candidate.division)
    };

    let points = 0;
    if (sections.personal) points += 25;
    if (sections.education) points += 25;
    if (sections.skills) points += 20;
    if (sections.experience) points += 10;
    if (sections.careerPreferences) points += 10;
    if (sections.location) points += 10;

    const missing: string[] = [];
    if (!sections.education) missing.push('শিক্ষাগত যোগ্যতার তথ্য');
    if (!sections.skills) missing.push('দক্ষতা বা স্কিলস');
    if (!sections.careerPreferences) missing.push('পছন্দের চাকরির ক্ষেত্র (Career Preferences)');
    if (!sections.location) missing.push('স্থায়ী/বর্তমান জেলা ও বিভাগ');
    if (!sections.experience) missing.push('কাজের অভিজ্ঞতা বা ইন্টার্নশিপ');

    let tip = 'আপনার প্রোফাইল শতভাগ সম্পূর্ণ! স্মার্ট রিকমেন্ডেশন সবচেয়ে নির্ভুল ফলাফল প্রদর্শন করছে।';
    if (points < 50) {
      tip = 'আরও নির্ভুল ও ব্যক্তিগতকৃত চাকরির সুপারিশ পেতে অনুগ্রহ করে আপনার শিক্ষা ও দক্ষতার তথ্য যোগ করুন।';
    } else if (points < 80) {
      tip = 'পছন্দের ক্যাটাগরি ও স্কিলস যুক্ত করলে আপনার ফিল্ডের চাকরিগুলো শীর্ষে দেখতে পাবেন।';
    }

    return {
      percentage: points,
      isComplete: points >= 80,
      sections,
      missingFieldsBn: missing,
      recommendationTipBn: tip
    };
  }

  /**
   * Generates full recommendation feeds for candidate
   */
  public static getRecommendations(
    candidate: CandidateProfile,
    options?: {
      limit?: number;
      minScore?: number;
      category?: string;
      config?: MatchingEngineConfig;
    }
  ): RecommendationSectionFeeds {
    const config = options?.config || DEFAULT_MATCHING_CONFIG;
    const minScore = options?.minScore !== undefined ? options?.minScore : config.minScoreToRecommend;
    const completeness = this.calculateCompleteness(candidate);

    const candidateId = candidate.id || '';
    const feedbackList = serverDB.getRecommendationFeedback(candidateId);
    const hiddenJobIds = new Set(
      feedbackList.filter(f => f.action === 'HIDDEN' || f.action === 'NOT_INTERESTED').map(f => f.jobId)
    );
    const feedbackMap = new Map<string, RecommendationFeedbackAction>();
    feedbackList.forEach(f => feedbackMap.set(f.jobId, f.action));

    const savedJobIds = new Set<string>();
    try {
      const reminders = serverDB.getUserJobReminders(candidateId);
      reminders.forEach(r => savedJobIds.add(r.jobId));
    } catch {}

    const allJobs = serverDB.getPublicJobs();
    const evaluatedRecommendations: EnrichedJobRecommendation[] = [];

    for (const job of allJobs) {
      const deadlineEval = CentralDeadlineEngine.evaluateDeadline(job);
      if (deadlineEval.isClosed || deadlineEval.status === 'CANCELLED' || deadlineEval.status === 'SUSPENDED') {
        continue;
      }

      if (hiddenJobIds.has(job.id)) {
        continue;
      }

      if (options?.category && job.category !== options.category) {
        continue;
      }

      const match = SmartJobMatchingEngine.evaluateMatch(candidate, job, config);

      if (match.overallScore >= minScore) {
        let badgeBn = match.displayBandBn;
        if (deadlineEval.isClosingSoon) {
          badgeBn = 'দ্রুত শেষ হচ্ছে';
        } else if (match.breakdown.skills.score >= 85) {
          badgeBn = 'দক্ষতার সেরা মিল';
        } else if (match.breakdown.education.score >= 95) {
          badgeBn = 'শিক্ষাগত যোগ্যতার মিল';
        }

        evaluatedRecommendations.push({
          job,
          match,
          isSaved: savedJobIds.has(job.id),
          feedbackAction: feedbackMap.get(job.id),
          recommendationBadgeBn: badgeBn
        });
      }
    }

    // Deterministic Sorting & Ranking
    evaluatedRecommendations.sort((a, b) => {
      const eligOrder: Record<string, number> = {
        MEETS_VERIFIED_REQUIREMENTS: 3,
        POSSIBLY_ELIGIBLE: 2,
        NEEDS_MORE_INFORMATION: 1,
        DOES_NOT_MEET_VERIFIED_REQUIREMENTS: 0
      };
      const aElig = eligOrder[a.match.eligibilityStatus] ?? 0;
      const bElig = eligOrder[b.match.eligibilityStatus] ?? 0;
      if (aElig !== bElig) return bElig - aElig;

      if (b.match.overallScore !== a.match.overallScore) {
        return b.match.overallScore - a.match.overallScore;
      }

      const aDate = new Date(a.job.publishedDate || 0).getTime();
      const bDate = new Date(b.job.publishedDate || 0).getTime();
      if (aDate !== bDate) return bDate - aDate;

      return a.job.id.localeCompare(b.job.id);
    });

    const maxItems = options?.limit || 50;
    const ranked = evaluatedRecommendations.slice(0, maxItems);

    const bestMatches = ranked.filter(r => r.match.overallScore >= config.goodThreshold).slice(0, 15);
    const skillsMatches = ranked.filter(r => r.match.breakdown.skills.score >= 70).slice(0, 10);
    const educationMatches = ranked.filter(r => r.match.breakdown.education.score >= 90).slice(0, 10);
    const locationMatches = ranked.filter(r => r.match.breakdown.location.score >= 80).slice(0, 10);
    const closingSoonMatches = ranked.filter(r => {
      const evalDl = CentralDeadlineEngine.evaluateDeadline(r.job);
      return evalDl.isClosingSoon;
    }).slice(0, 10);
    const recentlyPublishedMatches = ranked.filter(r => {
      if (!r.job.publishedDate) return false;
      const diffDays = (Date.now() - new Date(r.job.publishedDate).getTime()) / (1000 * 86400);
      return diffDays <= 7;
    }).slice(0, 10);

    const excellentCount = evaluatedRecommendations.filter(r => r.match.displayBand === 'EXCELLENT').length;
    const strongCount = evaluatedRecommendations.filter(r => r.match.displayBand === 'STRONG').length;

    return {
      candidateId,
      generatedAt: new Date().toISOString(),
      profileCompleteness: completeness,
      totalEligibleMatches: evaluatedRecommendations.length,
      excellentMatchesCount: excellentCount,
      strongMatchesCount: strongCount,
      bestMatches,
      skillsMatches,
      educationMatches,
      locationMatches,
      closingSoonMatches,
      recentlyPublishedMatches
    };
  }

  /**
   * Dispatches notifications for new top matches (>= 90%) with deduplication
   */
  public static notifyCandidateOnTopMatches(candidateId: string): number {
    const candidate = serverDB.getCandidateById(candidateId);
    if (!candidate) return 0;
    const feeds = this.getRecommendations(candidate, { minScore: 90 });
    const existingNotifs = serverDB.getCandidateNotifications(candidateId) || [];
    let sentCount = 0;

    for (const rec of feeds.bestMatches.slice(0, 3)) {
      if (rec.match.eligibilityStatus !== 'MEETS_VERIFIED_REQUIREMENTS') {
        continue; // Never notify ineligible candidates!
      }
      const alreadyNotified = existingNotifs.some(n => 
        (n.message && n.message.includes(rec.job.id)) || 
        (n.link && n.link.includes(rec.job.id)) ||
        (n.title && n.title.includes(rec.job.title))
      );
      if (!alreadyNotified) {
        serverDB.addCandidateNotification(candidateId, {
          title: `উৎকৃষ্ট চাকরির সুযোগ: ${rec.job.title}`,
          message: `আপনার শিক্ষাগত যোগ্যতা ও স্কিলের সাথে সরাসরি সামঞ্জস্যপূর্ণ চাকরি প্রকাশিত হয়েছে। প্রতিষ্ঠান: ${rec.job.organization}`,
          type: 'system',
          link: `/jobs/${rec.job.slug || rec.job.id}`
        });
        sentCount++;
      }
    }
    return sentCount;
  }
}
