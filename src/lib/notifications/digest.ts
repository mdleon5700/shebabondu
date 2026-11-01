/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 11: JOB DIGEST ENGINE
 * Compiles personalized daily & weekly job circular digests for registered candidates.
 */

import { serverDB } from '../db';
import { CandidateDigest, DigestJobItem } from './types';
import { NotificationDeliveryQueue } from './queue';
import { NotificationTemplateManager } from './templates';

export class JobDigestEngine {
  /**
   * Generate personalized job digest based on candidate category & location preferences
   */
  public static generateCandidateDigest(
    candidateId: string, 
    frequency: 'daily' | 'weekly' = 'daily'
  ): CandidateDigest | null {
    const candidate = serverDB.getCandidateById(candidateId);
    if (!candidate) return null;

    const allJobs = serverDB.getAllJobs();
    const publishedStatuses = ['ACTIVE', 'OPEN', 'PUBLISHED', 'active', 'published', 'open'];
    const publishedJobs = allJobs.filter(j => publishedStatuses.includes(j.status || ''));

    const now = Date.now();
    const cutoffTime = frequency === 'daily' 
      ? now - (24 * 60 * 60 * 1000) 
      : now - (7 * 24 * 60 * 60 * 1000);

    const preferredCategories: string[] = (candidate.careerPreferences as any)?.preferredCategories || 
      (candidate.careerPreferences as any)?.preferredJobCategories || [];

    // Filter relevant jobs
    const matchedJobs = publishedJobs.filter(j => {
      const pubTime = new Date(j.publishedDate || (j as any).createdAt || '').getTime();
      // If no valid timestamp, consider eligible
      const isTimeEligible = isNaN(pubTime) ? true : pubTime >= cutoffTime;

      // Category match
      let isCatEligible = true;
      if (preferredCategories.length > 0) {
        isCatEligible = preferredCategories.some((cat: string) => 
          (j.category || '').toLowerCase().includes(cat.toLowerCase())
        );
      }

      return isTimeEligible && isCatEligible;
    }).slice(0, 10);

    const items: DigestJobItem[] = matchedJobs.map(j => ({
      jobId: j.id,
      title: j.title,
      organization: j.organization,
      category: j.category,
      categoryBn: j.category,
      deadline: j.deadline || 'উল্লেখ নেই',
      link: `/jobs/${(j as any).slug || j.id}`
    }));

    const periodLabelBn = frequency === 'daily' ? 'দৈনিক চাকরি ডাইজেস্ট' : 'সাপ্তাহিক চাকরি সামারি';

    return {
      id: `digest_${candidateId}_${Date.now()}`,
      candidateId,
      frequency,
      periodLabelBn,
      generatedAt: new Date().toISOString(),
      items,
      totalJobs: items.length,
      topJobCategories: Array.from(new Set(items.map(i => i.category))),
      unsubscribeUrl: `/dashboard/alerts`
    };
  }

  /**
   * Dispatch compiled digest to candidate via In-App / Email queue
   */
  public static dispatchDigest(candidateId: string, frequency: 'daily' | 'weekly' = 'daily'): boolean {
    const digest = this.generateCandidateDigest(candidateId, frequency);
    if (!digest || digest.items.length === 0) return false;

    const template = NotificationTemplateManager.getTemplate(
      frequency === 'daily' ? 'DAILY_DIGEST' : 'WEEKLY_DIGEST', 
      'in_app'
    );

    const title = NotificationTemplateManager.render(template.titleTemplate, {
      count: digest.totalJobs,
      date: new Date().toLocaleDateString('bn-BD')
    });

    const message = NotificationTemplateManager.render(template.bodyTemplate, {
      count: digest.totalJobs,
      link: '/dashboard/recommendations'
    });

    NotificationDeliveryQueue.enqueue({
      candidateId,
      eventType: frequency === 'daily' ? 'DAILY_DIGEST' : 'WEEKLY_DIGEST',
      channel: 'in_app',
      priority: 'LOW',
      title,
      message,
      link: '/dashboard/recommendations',
      dedupeKey: `digest_${candidateId}_${new Date().toISOString().slice(0, 10)}`
    });

    return true;
  }
}
