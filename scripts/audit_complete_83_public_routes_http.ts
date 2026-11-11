export {};

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const PUBLIC_ROUTES_TO_AUDIT = [
  // Cluster 1: Homepage & Global Hub
  '/',
  
  // Cluster 2: Job Feeds & Search Hub
  '/jobs',
  '/latest-jobs',
  '/todays-jobs',
  '/daily-jobs',
  '/daily-jobs/2026-11-10',
  '/featured-jobs',
  '/updated-circulars',
  '/closing-soon',
  '/deadline-approaching',
  '/deadline-today',

  // Cluster 3: Education & Experience Feeds
  '/jobs/ssc-pass',
  '/jobs/hsc-pass',
  '/jobs/diploma-pass',
  '/jobs/bachelor-degree',
  '/jobs/masters-degree',
  '/jobs/no-experience',
  '/jobs/jsc-pass',
  '/fresher-jobs',
  '/internships',
  '/part-time-jobs',

  // Cluster 4: Sector & Specialized Category Hubs
  '/categories',
  '/job-categories',
  '/categories/government-jobs',
  '/categories/bank-jobs',
  '/categories/private-jobs',
  '/categories/bcs',
  '/government-jobs',
  '/bank-jobs',
  '/private-jobs',
  '/engineering-jobs',
  '/it-jobs',
  '/medical-jobs',
  '/teacher-jobs',
  '/tutoring-jobs',
  '/ngo-jobs',
  '/accounting-finance-jobs',
  '/marketing-jobs',

  // Cluster 5: Job Detail & Candidate Apply Flow
  '/jobs/job-alljobs-15184',
  '/apply/job-alljobs-15184',
  '/applications',

  // Cluster 6: Exam, Admit Card & Result Portal
  '/admit-cards',
  '/exam-notices',
  '/viva-notices',
  '/written-exam-results',
  '/exam-results',

  // Cluster 7: Preparation, Question Bank & Career Guides
  '/exam-preparation',
  '/previous-year-questions',
  '/questions',
  '/model-tests',
  '/career-advice',
  '/career-guides',
  '/career-guides/cv-writing',
  '/career-guides/interview-preparation',
  '/career-guides/job-exam-preparation',
  '/career-guides/online-job-application',
  '/career-guides/job-search-tips',
  '/career-guides/viva-preparation',
  '/blog',

  // Cluster 8: Recruiting Organizations Directory
  '/organizations',
  '/organizations/bpsc',
  '/organizations/bangladesh-bank',
  '/organizations/government-ministries',
  '/organizations/government-directorates',

  // Cluster 9: User Utility, Policy & Support Pages
  '/job-alerts',
  '/report-a-job',
  '/vault',
  '/wallet',
  '/profile',
  '/notifications',
  '/login',
  '/register',
  '/about-us',
  '/contact',
  '/contact-us',
  '/faq',
  '/privacy-policy',
  '/privacy',
  '/terms-and-conditions',
  '/terms',
  '/refund-policy',
  '/refund',
  '/disclaimer',
  '/editorial-policy',
  '/corrections-policy',
  '/job-verification-policy'
];

interface AuditResult {
  route: string;
  status: number;
  timeMs: number;
  ok: boolean;
  error?: string;
}

async function auditAllRoutes() {
  console.log('========================================================================');
  console.log(`🚀 STARTING COMPLETE AUDIT OF ALL ${PUBLIC_ROUTES_TO_AUDIT.length} PUBLIC PORTAL ROUTES`);
  console.log('========================================================================\n');

  const results: AuditResult[] = [];

  for (let i = 0; i < PUBLIC_ROUTES_TO_AUDIT.length; i++) {
    const route = PUBLIC_ROUTES_TO_AUDIT[i];
    const url = `${BASE_URL}${route}`;
    const start = Date.now();

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'ChakriSheba-AuditEngine/2.6'
        },
        redirect: 'follow'
      });
      const timeMs = Date.now() - start;
      const ok = res.status >= 200 && res.status < 400;

      results.push({ route, status: res.status, timeMs, ok });
      const symbol = ok ? '✅' : '❌';
      console.log(`[${String(i + 1).padStart(2, '0')}/${PUBLIC_ROUTES_TO_AUDIT.length}] ${symbol} ${route.padEnd(38)} -> HTTP ${res.status} (${timeMs}ms)`);
    } catch (err: any) {
      const timeMs = Date.now() - start;
      results.push({ route, status: 0, timeMs, ok: false, error: err.message });
      console.log(`[${String(i + 1).padStart(2, '0')}/${PUBLIC_ROUTES_TO_AUDIT.length}] ❌ ${route.padEnd(38)} -> ERROR: ${err.message}`);
    }
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  console.log('\n========================================================================');
  console.log(`🎯 AUDIT SUMMARY: Total ${results.length} | Passed ${passed} | Failed ${failed}`);
  console.log('========================================================================\n');

  if (failed > 0) {
    console.log('Failed Routes:');
    results.filter(r => !r.ok).forEach(r => console.log(`  - ${r.route}: HTTP ${r.status} ${r.error || ''}`));
    process.exit(1);
  } else {
    console.log('🏆 ALL PUBLIC ROUTES RETURNED HTTP 200/SUCCESS!');
  }
}

auditAllRoutes().catch(err => {
  console.error('Fatal Audit Error:', err);
  process.exit(1);
});
