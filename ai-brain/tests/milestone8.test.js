const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ModeSelector = require('../modes/ModeSelector');
const BuildMode = require('../modes/BuildMode');

function runMilestone8Tests() {
  console.log('--- STARTING MILESTONE 8 VERIFICATION ---');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  const selector = new ModeSelector();
  const builder = new BuildMode();

  // Test 1: Mode Selection
  const emptyReport = { projectClassification: 'NEW_EMPTY_PROJECT' };
  assert(selector.selectMode(emptyReport) === 'BUILD', 'Empty project selected BUILD mode');

  const liveReport = { projectClassification: 'EXISTING_FUNCTIONING_PROJECT' };
  assert(selector.selectMode(liveReport) === 'MAINTAIN', 'Existing project selected MAINTAIN mode');

  const lifecycle = selector.getModeLifecycle('BUILD');
  assert(lifecycle.length >= 5, `Lifecycle steps retrieved (count: ${lifecycle.length})`);

  // Test 2: Build New Website Execution
  const targetDir = path.resolve(__dirname, '..', 'storage', 'temp_build_mode_test');
  const buildResult = builder.buildNewProject(targetDir, {
    name: 'test-saas-portal',
    description: 'High-performance Next-gen Web Portal'
  });

  assert(buildResult.success === true, 'BuildMode created new project files');
  assert(fs.existsSync(path.join(targetDir, 'package.json')), 'Generated package.json');
  assert(fs.existsSync(path.join(targetDir, 'server.js')), 'Generated server.js');
  assert(fs.existsSync(path.join(targetDir, 'test.js')), 'Generated test.js');

  // Run generated test
  const testOutput = execSync('node test.js', { cwd: targetDir, encoding: 'utf8' });
  assert(testOutput.includes('[PASS]'), 'Generated project passes its own self-test');

  // Cleanup
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  console.log(`--- MILESTONE 8 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone8Tests();
