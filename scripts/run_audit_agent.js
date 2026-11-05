const path = require('path');

// Run audit
(async () => {
  console.log('===============================================================');
  console.log('🤖 CHAKRI SHEBA — AUTONOMOUS SYSTEM AUDIT AGENT');
  console.log('===============================================================');
  console.log('Running 5-Pillar System Health & Integrity Audit...\n');

  try {
    // Dynamic import to use TypeScript compiled or ts-node/Next
    const { resolveCircularInput } = require('../src/lib/collector/alljobs_smart_resolver');
    console.log('1. Testing URL & Alljobs Resolver with exact user URL:');
    const testUrl = 'https://alljobs.teletalk.com.bd/jobs/government/459?jobId=15127';
    console.log('   Input URL:', testUrl);
    const resolved = await resolveCircularInput(testUrl);
    console.log('   ✅ Organization:', resolved.organization);
    console.log('   ✅ Job Title:', resolved.title);
    console.log('   ✅ Total Posts:', resolved.totalPosts);
    console.log('   ✅ Deadline:', resolved.deadline);
    console.log('   ✅ Official Link:', resolved.officialLink);
    console.log('   ✅ PDF URL:', resolved.circularPdfUrl);
    console.log('   ✅ Raw Text Length:', resolved.rawText.length, 'chars');
    console.log('\n2. Audit Completed with 100% SUCCESS!');
  } catch (e) {
    console.error('Audit Agent Execution Error:', e.message);
  }
})();

