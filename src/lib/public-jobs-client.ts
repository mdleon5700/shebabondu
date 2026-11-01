import type { JobCircular } from './types';

export async function fetchPublicJobs(): Promise<JobCircular[]> {
  const jobs: JobCircular[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await fetch(`/api/jobs?limit=100&page=${page}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load jobs');
    const data = await response.json();
    if (!Array.isArray(data.jobs)) throw new Error('Invalid jobs response');
    jobs.push(...data.jobs);
    totalPages = data.totalPages || 1;
    page++;
  } while (page <= totalPages);
  return jobs;
}
