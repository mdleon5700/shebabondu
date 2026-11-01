import { MetadataRoute } from 'next';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chakrisheba.com';

  const staticRoutes = [
    '',
    '/jobs',
    '/latest-jobs',
    '/todays-jobs',
    '/daily-jobs',
    '/featured-jobs',
    '/closing-soon',
    '/deadline-today',
    '/updated-circulars',
    '/government-jobs',
    '/private-jobs',
    '/job-categories',
    '/deadline-approaching',
    '/bank-jobs',
    '/teacher-jobs',
    '/ngo-jobs',
    '/it-jobs',
    '/medical-jobs',
    '/tutoring-jobs',
    '/part-time-jobs',
    '/internships',
    '/fresher-jobs',
    '/marketing-jobs',
    '/engineering-jobs',
    '/accounting-finance-jobs',
    '/jobs/ssc-pass',
    '/jobs/hsc-pass',
    '/jobs/diploma-pass',
    '/jobs/bachelor-degree',
    '/jobs/masters-degree',
    '/jobs/no-experience',
    '/organizations',
    '/organizations/bangladesh-bank',
    '/organizations/bpsc',
    '/organizations/government-ministries',
    '/organizations/government-directorates',
    '/exam-notices',
    '/admit-cards',
    '/exam-results',
    '/written-exam-results',
    '/viva-notices',
    '/exam-preparation',
    '/previous-year-questions',
    '/model-tests',
    '/career-guides',
    '/career-guides/cv-writing',
    '/career-guides/online-job-application',
    '/career-guides/interview-preparation',
    '/career-guides/viva-preparation',
    '/career-guides/job-exam-preparation',
    '/career-guides/job-search-tips',
    '/career-advice',
    '/blog',
    '/about-us',
    '/contact-us',
    '/faq',
    '/editorial-policy',
    '/job-verification-policy',
    '/corrections-policy',
    '/report-a-job',
    '/privacy-policy',
    '/terms-and-conditions',
    '/disclaimer',
    '/job-alerts'
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/jobs' || route === '/todays-jobs' || route === '/latest-jobs' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : (route === '/todays-jobs' || route === '/latest-jobs') ? 0.9 : route.startsWith('/jobs') ? 0.9 : 0.7,
  }));

  const canonicalJobs = serverDB.getAllJobs ? serverDB.getAllJobs() : serverDB.getJobs();
  const eligibleJobs = JobFeedEngine.filterPublicEligibleJobs(canonicalJobs, false);

  const jobEntries: MetadataRoute.Sitemap = eligibleJobs
    .filter(job => {
      const pubStatus = (job as any).publicationStatus;
      return (
        pubStatus !== 'UNPUBLISHED' &&
        pubStatus !== 'DRAFT' &&
        pubStatus !== 'CONTENT_IN_PROGRESS' &&
        pubStatus !== 'PENDING_REVIEW' &&
        pubStatus !== 'CHANGES_REQUESTED' &&
        pubStatus !== 'SCHEDULED' &&
        pubStatus !== 'REJECTED' &&
        pubStatus !== 'ARCHIVED'
      );
    })
    .map((job) => ({
      url: `${baseUrl}/jobs/${job.slug || job.id}`,
      lastModified: (job as any).lastUpdatedDate ? new Date((job as any).lastUpdatedDate) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

  const activeCategories = serverDB.getCategories ? serverDB.getCategories().filter(c => c.is_active) : [];
  const categoryEntries: MetadataRoute.Sitemap = activeCategories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Daily archive date entries that have real jobs
  const archiveDates = JobFeedEngine.getDailyArchiveDates(eligibleJobs, 30).filter(a => a.hasJobs);
  const archiveEntries: MetadataRoute.Sitemap = archiveDates.map((a) => ({
    url: `${baseUrl}/daily-jobs/${a.date}`,
    lastModified: new Date(a.date),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...archiveEntries, ...jobEntries];
}
