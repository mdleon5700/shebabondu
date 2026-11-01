/**
 * Chakri Sheba - Feed Configuration & Defaults
 * Step 07: Dynamic Feed Section Customization
 */

import { GlobalFeedConfig } from './types';

export const DEFAULT_FEED_CONFIG: GlobalFeedConfig = {
  sections: {
    latest_jobs: {
      key: 'latest_jobs',
      enabled: true,
      title_bn: 'সর্বশেষ চাকরির বিজ্ঞপ্তি',
      title_en: 'Latest Job Circulars',
      item_limit: 9,
      display_order: 1
    },
    todays_jobs: {
      key: 'todays_jobs',
      enabled: true,
      title_bn: 'আজকের চাকরির খবর',
      title_en: "Today's Jobs",
      item_limit: 6,
      display_order: 2
    },
    featured_jobs: {
      key: 'featured_jobs',
      enabled: true,
      title_bn: 'বিশেষ চাকরির বিজ্ঞপ্তি',
      title_en: 'Featured Circulars',
      item_limit: 6,
      display_order: 3
    },
    category_jobs: {
      key: 'category_jobs',
      enabled: true,
      title_bn: 'ক্যাটাগরিভিত্তিক চাকরি',
      title_en: 'Category-wise Jobs',
      item_limit: 9,
      display_order: 4
    },
    closing_soon: {
      key: 'closing_soon',
      enabled: true,
      title_bn: 'জরুরি ডেডলাইন (শীঘ্রই শেষ)',
      title_en: 'Closing Soon Jobs',
      item_limit: 6,
      display_order: 5
    }
  },
  newJobBadgeDurationDays: 3,
  closingSoonThresholdDays: 3,
  revalidationIntervalSeconds: 60,
  updatedAt: new Date().toISOString()
};
