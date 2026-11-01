import type { JobCircular } from './types';

const PUBLIC_STATUSES = new Set([
  'PUBLISHED', 'PUBLISHED_WITH_WARNINGS', 'OPEN', 'ACTIVE', 'UPCOMING',
  'EXPIRED', 'CLOSED', 'UPDATE_PENDING', 'UNPUBLISH_PENDING'
]);

export function isPublicJob(job: JobCircular): boolean {
  if (!job.id || /^(draft|temp)-/i.test(job.id)) return false;
  const status = job.status?.toUpperCase();
  const publicationStatus = (job as JobCircular & { publicationStatus?: string }).publicationStatus?.toUpperCase();
  return (!status || PUBLIC_STATUSES.has(status)) &&
    (!publicationStatus || PUBLIC_STATUSES.has(publicationStatus));
}
