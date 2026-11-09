import store from '../src/db/local_store.json';
import { serverDB } from '../src/lib/db';

async function testCmsRoutes() {
  console.log('================================================================');
  console.log('TESTING DYNAMIC CMS AND LANDING ROUTE LOGIC');
  console.log('================================================================\n');

  const testCases = [
    { url: 'http://localhost:3000/exam-guidelines-2026', expectedStatus: 200, desc: 'Canonical CMS Page via [...slug]' },
    { url: 'http://localhost:3000/p/exam-guidelines-2026', expectedStatus: 200, desc: 'Dedicated CMS Page via /p/[slug]' },
    { url: 'http://localhost:3000/p/_exam-guidelines-2026', expectedStatus: 200, desc: 'Prefixed ID Page via /p/[slug]' },
    { url: 'http://localhost:3000/privacy', expectedStatus: 200, desc: 'Alias redirect /privacy -> /privacy-policy' },
    { url: 'http://localhost:3000/circulars', expectedStatus: 200, desc: 'Alias redirect /circulars -> /jobs' },
    { url: 'http://localhost:3000/p/definitely-nonexistent-slug-xyz', expectedStatus: 404, desc: 'Dedicated CMS 404 on missing page' },
    { url: 'http://localhost:3000/bangladesh-bank-syllabus-2026', expectedStatus: 200, desc: 'Graceful fallback redirect to jobs search' },
  ];

  for (const tc of testCases) {
    try {
      const res = await fetch(tc.url, { redirect: 'follow' });
      const finalUrl = res.url;
      const html = await res.text();
      const passed = res.status === tc.expectedStatus;
      console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.desc}`);
      console.log(`  Target: ${tc.url} -> Final: ${finalUrl} (Status: ${res.status}, Length: ${html.length})`);
    } catch (e: any) {
      console.log(`[ERROR] ${tc.desc}: ${e.message}`);
    }
  }

  console.log('\n================================================================');
  console.log('ALL DYNAMIC CMS ROUTE TESTS COMPLETED!');
  console.log('================================================================');
}

testCmsRoutes();

