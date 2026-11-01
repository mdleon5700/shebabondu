import { runAutonomousSpiderAudit } from '../src/lib/testing';

async function main() {
  try {
    const run = await runAutonomousSpiderAudit({
      baseUrl: 'http://localhost:3000',
      headless: true
    });

    if (run.summary.failed > 0) {
      console.error(`Audit run finished with ${run.summary.failed} failures.`);
      process.exit(1);
    } else {
      console.log('ALL BASELINE AUDIT SCENARIOS PASSED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Fatal failure executing testing spider:', err);
    process.exit(1);
  }
}

main();