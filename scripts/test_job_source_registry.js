const fs = require('fs');
const path = require('path');

// Ensure isolated temporary database for test execution
const TEMP_DB_PATH = path.resolve('src/db/local_store.test_registry_tmp.json');
const PROD_DB_PATH = path.resolve('src/db/local_store.json');

// Copy production DB to isolated test fixture
fs.copyFileSync(PROD_DB_PATH, TEMP_DB_PATH);
process.env.CHAKRI_DB_FILE = TEMP_DB_PATH;

const { serverDB } = require(path.resolve('src/lib/db.ts'));

let passed = 0;
let failed = 0;

function assertTest(label, condition, details = '') {
  if (condition) {
    console.log(`[PASS] ${label}`);
    if (details) console.log(`       Evidence: ${details}`);
    passed++;
  } else {
    console.error(`[FAIL] ${label}`);
    if (details) console.error(`       Error: ${details}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log(' JOB SOURCE REGISTRY BACKEND FOUNDATION — UNIT & INTEGRATION QA');
  console.log(` Environment: Isolated Fixture (${TEMP_DB_PATH})`);
  console.log('===============================================================\n');

  try {
    // TEST 1: Legacy Source Records Loading
    console.log('--- 1. Legacy Source Records Loading ---');
    const sources = serverDB.getJobSources();
    assertTest('Legacy sources load without errors', Array.isArray(sources) && sources.length >= 3, `Count: ${sources.length}`);
    
    const teletalk = sources.find(s => s.id === 'teletalk-alljobs');
    assertTest('Legacy source has backward-compatible fallback values', 
      teletalk && teletalk.enabled === true && teletalk.classification === 'official' && teletalk.healthStatus === 'healthy',
      `ID: ${teletalk?.id}, enabled: ${teletalk?.enabled}, classification: ${teletalk?.classification}`
    );

    // TEST 2: New Source Creation
    console.log('\n--- 2. Source Creation & Validation ---');
    const newSource = serverDB.createJobSource({
      name: 'Dhaka Tribune Jobs',
      sourceUrl: 'https://jobs.dhakatribune.com/feed',
      type: 'newspaper',
      classification: 'news',
      scanIntervalMinutes: 180,
      adminNotes: 'Verified national news job circulars feed'
    }, 'ADMIN_TEST_USER');

    assertTest('New source created successfully with generated slug ID',
      newSource.id === 'src-dhaka-tribune-jobs' && newSource.classification === 'news' && newSource.scanIntervalMinutes === 180,
      `ID: ${newSource.id}, URL: ${newSource.sourceUrl}, Interval: ${newSource.scanIntervalMinutes}m`
    );

    const retrieved = serverDB.getJobSourceById('src-dhaka-tribune-jobs');
    assertTest('getJobSourceById retrieves newly created source',
      retrieved !== null && retrieved.name === 'Dhaka Tribune Jobs',
      `Found: ${retrieved?.name}`
    );

    // TEST 3: Duplicate Source ID & URL Rejection
    console.log('\n--- 3. Duplicate Prevention & Validation Guards ---');
    let duplicateIdCaught = false;
    try {
      serverDB.createJobSource({ id: 'teletalk-alljobs', name: 'Duplicate Alljobs', sourceUrl: 'https://other.teletalk.com' });
    } catch (err) {
      duplicateIdCaught = err.message.includes('already exists');
    }
    assertTest('Duplicate source ID is rejected', duplicateIdCaught, 'Correctly threw duplicate ID error');

    let duplicateUrlCaught = false;
    try {
      serverDB.createJobSource({ name: 'Another Alljobs Copy', sourceUrl: 'https://alljobs.teletalk.com.bd' });
    } catch (err) {
      duplicateUrlCaught = err.message.includes('already exists under ID');
    }
    assertTest('Duplicate source URL is rejected', duplicateUrlCaught, 'Correctly threw duplicate URL error');

    let invalidUrlCaught = false;
    try {
      serverDB.createJobSource({ name: 'Invalid URL Source', sourceUrl: 'ftp://not-http.com' });
    } catch (err) {
      invalidUrlCaught = err.message.includes('valid HTTP or HTTPS');
    }
    assertTest('Non-HTTP sourceUrl is rejected', invalidUrlCaught, 'Correctly rejected invalid URL scheme');

    // TEST 4: Permitted Settings Updates
    console.log('\n--- 4. Source Setting Updates ---');
    const updated = serverDB.updateJobSource('src-dhaka-tribune-jobs', {
      scanIntervalMinutes: 120,
      adminNotes: 'Updated scan frequency to 2 hours'
    }, 'ADMIN_TEST_USER');

    assertTest('Source settings updated with audit history',
      updated.scanIntervalMinutes === 120 && updated.adminNotes.includes('2 hours'),
      `Interval: ${updated.scanIntervalMinutes}m, Notes: ${updated.adminNotes}`
    );

    // TEST 5: Enable / Disable Toggle
    console.log('\n--- 5. Source Enable / Disable Toggle ---');
    const disabled = serverDB.toggleJobSource('src-dhaka-tribune-jobs', false, 'ADMIN_TEST_USER');
    assertTest('Source disabled cleanly',
      disabled.enabled === false && disabled.autoSync === false && disabled.healthStatus === 'paused',
      `enabled: ${disabled.enabled}, healthStatus: ${disabled.healthStatus}`
    );

    const reEnabled = serverDB.toggleJobSource('src-dhaka-tribune-jobs', true, 'ADMIN_TEST_USER');
    assertTest('Source re-enabled cleanly',
      reEnabled.enabled === true && reEnabled.autoSync === true && reEnabled.healthStatus === 'healthy',
      `enabled: ${reEnabled.enabled}, healthStatus: ${reEnabled.healthStatus}`
    );

    // TEST 6: Operational Telemetry & Metrics
    console.log('\n--- 6. Telemetry & Metrics Updates ---');
    const withMetrics1 = serverDB.updateSourceHealthAndMetrics('src-dhaka-tribune-jobs', {
      healthStatus: 'healthy',
      metricsDelta: { discovered: 10, collected: 8, deduplicated: 2 },
      lastSuccessfulScanAt: '2026-10-29T19:00:00Z'
    });
    assertTest('Metrics delta applied accurately (Batch 1)',
      withMetrics1.metrics.discovered === 10 && withMetrics1.metrics.collected === 8 && withMetrics1.metrics.deduplicated === 2,
      `Discovered: ${withMetrics1.metrics.discovered}, Collected: ${withMetrics1.metrics.collected}`
    );

    const withMetrics2 = serverDB.updateSourceHealthAndMetrics('src-dhaka-tribune-jobs', {
      metricsDelta: { discovered: 5, failed: 1 }
    });
    assertTest('Cumulative metrics delta applied accurately (Batch 2)',
      withMetrics2.metrics.discovered === 15 && withMetrics2.metrics.failed === 1 && withMetrics2.metrics.collected === 8,
      `Discovered: ${withMetrics2.metrics.discovered}, Failed: ${withMetrics2.metrics.failed}`
    );

    // TEST 7: Referenced-Source Protection vs Deletion
    console.log('\n--- 7. Referenced-Source Protection vs Deletion ---');
    const archiveResult = serverDB.archiveOrDeleteJobSource('teletalk-alljobs', false, 'ADMIN_TEST_USER');
    assertTest('Referenced core source is protected from deletion (archived instead)',
      archiveResult.action === 'archived' && archiveResult.source.enabled === false,
      `Action: ${archiveResult.action}, Message: ${archiveResult.message}`
    );

    // Verify it still exists in the database
    const teletalkStillExists = serverDB.getJobSourceById('teletalk-alljobs');
    assertTest('Archived source remains in database with paused status',
      teletalkStillExists !== null && teletalkStillExists.enabled === false,
      `Still in DB: ${teletalkStillExists?.id}`
    );

    // Delete unreferenced source
    const deleteResult = serverDB.archiveOrDeleteJobSource('src-dhaka-tribune-jobs', false, 'ADMIN_TEST_USER');
    assertTest('Unreferenced custom source is deleted successfully',
      deleteResult.action === 'deleted' && serverDB.getJobSourceById('src-dhaka-tribune-jobs') === null,
      `Action: ${deleteResult.action}`
    );

    // TEST 8: Existing Canonical Jobs & Drafts Unchanged
    console.log('\n--- 8. Canonical Jobs & Drafts Integrity ---');
    const allJobs = serverDB.getJobs();
    assertTest('Canonical published jobs count remains exactly 9',
      allJobs.length === 9,
      `Jobs count: ${allJobs.length}`
    );

    const drafts = serverDB.getCircularDrafts();
    assertTest('Circular drafts count remains exactly 1',
      drafts.length === 1 && drafts[0].id === 'draft-rupali-01',
      `Drafts count: ${drafts.length}`
    );

  } finally {
    // Clean up temporary test fixture
    try {
      if (fs.existsSync(TEMP_DB_PATH)) fs.unlinkSync(TEMP_DB_PATH);
      const bak = TEMP_DB_PATH + '.bak';
      if (fs.existsSync(bak)) fs.unlinkSync(bak);
      const tmp = TEMP_DB_PATH + '.tmp';
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    } catch {}
  }

  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`FINAL OUTCOME: ${failed === 0 ? 'ALL REGISTRY TESTS PASSED (100%)' : 'TEST FAILURES DETECTED'}`);
  console.log('===============================================================');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
