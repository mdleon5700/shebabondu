/**
 * CHAKRI SHEBA — STEP 05: URL, SLUG & REDIRECT MANAGER
 * Clean slug management, duplicate prevention, and 301 permanent redirect handling with loop detection.
 */

import { RedirectRecord } from './types';
import { serverDB } from '@/lib/db';

export function normalizeSlug(rawTitle: string, orgName: string, year = '2026', idSuffix?: string): string {
  const combined = `${orgName} ${rawTitle} ${year}`.toLowerCase();
  let slug = combined
    .replace(/[^\w\s\-]/g, '') // remove non-alphanumeric except whitespace/hyphen
    .trim()
    .replace(/\s+/g, '-')
    .replace(/\-+/g, '-');

  // Fallback if title was exclusively Bengali or non-ASCII
  if (!slug || slug.length < 3) {
    const orgClean = (orgName || 'job').toLowerCase().replace(/[^\w]/g, '').slice(0, 15) || 'job';
    slug = `${orgClean}-circular-${year}`;
  }

  if (idSuffix) {
    const cleanSuffix = idSuffix.replace(/[^a-z0-9]/gi, '').slice(-4);
    if (!slug.endsWith(cleanSuffix)) {
      slug = `${slug}-${cleanSuffix}`;
    }
  }

  return slug.toLowerCase();
}

/**
 * Creates a permanent redirect from oldPath to newPath
 */
export function createRedirectRecord(
  sourcePath: string,
  targetPath: string,
  createdBy = 'ADMIN',
  reason = 'Slug or URL update'
): { success: boolean; redirect?: RedirectRecord; error?: string } {
  const normSource = sourcePath.toLowerCase().trim();
  const normTarget = targetPath.toLowerCase().trim();

  if (normSource === normTarget) {
    return { success: false, error: 'উৎস ও গন্তব্য পাথ একই হতে পারে না।' };
  }

  const existing = serverDB.getRedirects ? serverDB.getRedirects() : {};

  // 1. Loop Detection: Check if target leads back to source
  let currentTarget: string | undefined = normTarget;
  const visited = new Set<string>([normSource]);
  while (currentTarget) {
    if (visited.has(currentTarget)) {
      return { success: false, error: 'রিডাইরেক্ট লুপ (Loop) সনাক্ত হয়েছে! চক্রাকার রিডাইরেক্ট তৈরি করা যাবে না।' };
    }
    visited.add(currentTarget);
    if (!existing[currentTarget]) break;
    currentTarget = existing[currentTarget]?.targetPath;
  }

  const redirectRecord: RedirectRecord = {
    id: 'redir-' + Date.now().toString(36),
    sourcePath: normSource,
    targetPath: normTarget,
    statusCode: 301,
    createdAt: new Date().toISOString(),
    createdBy,
    reason,
    isActive: true,
    hitCount: 0
  };

  if (serverDB.saveRedirect) {
    serverDB.saveRedirect(redirectRecord);
  }

  return { success: true, redirect: redirectRecord };
}

/**
 * Resolves any redirect chain to its final destination
 */
export function resolveRedirect(path: string): string | null {
  const existing = serverDB.getRedirects ? serverDB.getRedirects() : {};
  let currentPath = path.toLowerCase().trim();
  let found = false;
  let hops = 0;
  const maxHops = 5;

  while (existing[currentPath] && existing[currentPath].isActive && hops < maxHops) {
    found = true;
    currentPath = existing[currentPath].targetPath;
    hops++;
  }

  return found ? currentPath : null;
}
