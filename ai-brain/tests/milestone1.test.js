const path = require('path');
const DiscoveryEngine = require('../core/DiscoveryEngine');
const ProjectProfileManager = require('../core/ProjectProfileManager');
const DeterministicScanner = require('../core/DeterministicScanner');

function runMilestone1Tests() {
  console.log('--- STARTING MILESTONE 1 VERIFICATION ---');
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

  const workspaceRoot = path.resolve(__dirname, '..', '..');

  // Test 1: Discovery Engine
  const discovery = new DiscoveryEngine();
  const report = discovery.discover(workspaceRoot);
  assert(report.workspacePath === workspaceRoot, 'DiscoveryEngine correctly identifies workspace root');
  assert(report.framework.name === 'Next.js', `DiscoveryEngine detects Next.js framework (detected: ${report.framework.name})`);
  assert(report.language.primary === 'TypeScript', 'DiscoveryEngine detects TypeScript language');
  assert(report.envVars.length > 0, `DiscoveryEngine extracts env var names safely (${report.envVars.length} found)`);
  assert(report.projectClassification === 'EXISTING_FUNCTIONING_PROJECT', `DiscoveryEngine classifies project (${report.projectClassification})`);

  // Test 2: Project Profile Manager
  const profileManager = new ProjectProfileManager(path.resolve(__dirname, '..', 'storage', 'profiles'));
  const profile = profileManager.createOrUpdateProfile({
    projectId: 'chakri-sheba',
    displayName: 'Chakri Sheba Recruitment Portal',
    workspacePath: workspaceRoot,
    framework: report.framework.name,
    language: report.language.primary,
    mode: 'MAINTENANCE'
  });

  assert(profile.projectId === 'chakri-sheba', 'Profile created with projectId: chakri-sheba');
  assert(profile.allowedFilesystemBoundary === workspaceRoot, 'Profile sets strict filesystem boundary');

  // Boundary validation
  const insideCheck = profileManager.validatePath('chakri-sheba', path.join(workspaceRoot, 'src', 'app'));
  assert(insideCheck.allowed === true, 'Path inside workspace is permitted');

  const outsideCheck = profileManager.validatePath('chakri-sheba', 'C:\\Windows\\System32');
  assert(outsideCheck.allowed === false, 'Path outside workspace is strictly blocked');

  // Command safety validation
  const safeCmd = profileManager.validateCommand('chakri-sheba', 'npm run build');
  assert(safeCmd.allowed === true, 'Allowlisted command is permitted');

  const dangerousCmd = profileManager.validateCommand('chakri-sheba', 'rm -rf /');
  assert(dangerousCmd.allowed === false, 'Forbidden command is rejected');

  // Test 3: Deterministic Scanner
  const scanner = new DeterministicScanner();
  const scanResult = scanner.scan(workspaceRoot);
  assert(scanResult.totalFilesScanned > 0, `DeterministicScanner scanned ${scanResult.totalFilesScanned} files`);
  assert(Array.isArray(scanResult.findings), 'DeterministicScanner returns structured findings array');

  console.log(`--- MILESTONE 1 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone1Tests();
