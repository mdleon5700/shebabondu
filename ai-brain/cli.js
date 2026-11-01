#!/usr/bin/env node

const path = require('path');
const DiscoveryEngine = require('./core/DiscoveryEngine');
const ProjectProfileManager = require('./core/ProjectProfileManager');
const DeterministicScanner = require('./core/DeterministicScanner');
const TaskPlanner = require('./core/TaskPlanner');
const PersistentQueue = require('./core/PersistentQueue');
const CheckpointManager = require('./core/CheckpointManager');
const FailureMemory = require('./core/FailureMemory');
const MonitoringController = require('./core/MonitoringController');
const GeminiProvider = require('./core/GeminiProvider');

const command = process.argv[2] || 'status';
const targetProjectId = process.argv[3] || 'chakri-sheba';

const workspaceRoot = path.resolve(__dirname, '..');

const profileManager = new ProjectProfileManager();
const queue = new PersistentQueue();
const checkpointManager = new CheckpointManager();
const failureMemory = new FailureMemory();
const monitor = new MonitoringController(profileManager, queue, checkpointManager, failureMemory);

// Ensure chakri-sheba profile exists
if (!profileManager.getProfile('chakri-sheba')) {
  profileManager.createOrUpdateProfile({
    projectId: 'chakri-sheba',
    displayName: 'Chakri Sheba Recruitment Portal',
    workspacePath: workspaceRoot,
    framework: 'Next.js',
    language: 'TypeScript',
    mode: 'MAINTENANCE'
  });
}

switch (command) {
  case 'status': {
    console.log(monitor.renderCliDashboard(targetProjectId));
    break;
  }

  case 'scan': {
    const profile = profileManager.getProfile(targetProjectId);
    if (!profile) {
      console.error(`Project ${targetProjectId} not found`);
      process.exit(1);
    }
    console.log(`Scanning workspace: ${profile.workspacePath}...`);
    const scanner = new DeterministicScanner();
    const result = scanner.scan(profile.workspacePath);
    console.log(`Scan completed: ${result.totalFilesScanned} files scanned, ${result.findingsCount} findings.`);
    console.log('Summary:', JSON.stringify(result.findingsSummary, null, 2));
    break;
  }

  case 'plan': {
    const profile = profileManager.getProfile(targetProjectId);
    const scanner = new DeterministicScanner();
    const scan = scanner.scan(profile.workspacePath);
    const planner = new TaskPlanner();
    const tasks = planner.planFromFindings(targetProjectId, scan.findings);
    queue.enqueue(targetProjectId, tasks);
    console.log(`Planned & enqueued ${tasks.length} tasks for project ${targetProjectId}`);
    console.log(JSON.stringify(queue.getQueueSummary(targetProjectId), null, 2));
    break;
  }

  case 'test': {
    console.log('Running test suites across all milestones...');
    const { execSync } = require('child_process');
    const tests = [
      'milestone1.test.js',
      'milestone2.test.js',
      'milestone3.test.js',
      'milestone4.test.js',
      'milestone5.test.js',
      'milestone6.test.js',
      'milestone7.test.js',
      'milestone8.test.js',
      'milestone9.test.js',
      'e2e_acceptance.test.js'
    ];

    for (const t of tests) {
      console.log(`\nExecuting ${t}...`);
      execSync(`node ai-brain/tests/${t}`, { cwd: workspaceRoot, stdio: 'inherit' });
    }
    console.log('\nAll milestone test suites passed successfully!');
    break;
  }

  default:
    console.log(`Unknown command: ${command}`);
    console.log('Available commands: status, scan, plan, test');
    break;
}
