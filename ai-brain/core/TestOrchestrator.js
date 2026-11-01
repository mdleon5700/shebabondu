const { execSync } = require('child_process');

class TestOrchestrator {
  constructor(options = {}) {
    this.defaultTimeoutMs = options.defaultTimeoutMs || 60000;
  }

  runCommandTest(workspacePath, testId, commandLine, timeoutMs = this.defaultTimeoutMs) {
    const start = Date.now();
    try {
      const output = execSync(commandLine, {
        cwd: workspacePath,
        timeout: timeoutMs,
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
      });
      const durationMs = Date.now() - start;
      return {
        testId,
        type: 'COMMAND',
        command: commandLine,
        durationMs,
        exitCode: 0,
        status: 'PASS',
        output: output.slice(0, 4000)
      };
    } catch (err) {
      const durationMs = Date.now() - start;
      return {
        testId,
        type: 'COMMAND',
        command: commandLine,
        durationMs,
        exitCode: err.status || 1,
        status: 'FAIL',
        output: (err.stdout ? String(err.stdout) : '') + '\n' + (err.stderr ? String(err.stderr) : ''),
        error: err.message
      };
    }
  }

  async runHttpRouteTest(baseUrl, routePath, options = {}) {
    const start = Date.now();
    const url = `${baseUrl.replace(/\/$/, '')}/${routePath.replace(/^\//, '')}`;
    const testId = `HTTP-${options.method || 'GET'}-${routePath}`;

    try {
      const res = await fetch(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const bodyText = await res.text();
      const durationMs = Date.now() - start;
      const expectedStatus = options.expectedStatus || 200;

      const passed = res.status === expectedStatus && 
        (!options.shouldIncludeText || bodyText.includes(options.shouldIncludeText)) &&
        (!options.shouldExcludeText || !bodyText.includes(options.shouldExcludeText));

      return {
        testId,
        type: 'HTTP',
        url,
        durationMs,
        actualStatus: res.status,
        expectedStatus,
        status: passed ? 'PASS' : 'FAIL',
        evidence: {
          status: res.status,
          headers: Object.fromEntries(res.headers.entries()),
          bodySnippet: bodyText.slice(0, 500)
        }
      };
    } catch (err) {
      return {
        testId,
        type: 'HTTP',
        url,
        durationMs: Date.now() - start,
        status: 'FAIL',
        error: err.message
      };
    }
  }

  async runSuite(workspacePath, baseUrl, suiteConfig) {
    const results = [];

    // 1. Run Command Tests (e.g. tsc, lint)
    for (const cmdTest of (suiteConfig.commands || [])) {
      const res = this.runCommandTest(workspacePath, cmdTest.id, cmdTest.command, cmdTest.timeoutMs);
      results.push(res);
    }

    // 2. Run HTTP Tests if baseUrl provided
    if (baseUrl && suiteConfig.httpRoutes) {
      for (const routeTest of suiteConfig.httpRoutes) {
        const res = await this.runHttpRouteTest(baseUrl, routeTest.path, routeTest);
        results.push(res);
      }
    }

    const passedCount = results.filter(r => r.status === 'PASS').length;
    const failedCount = results.filter(r => r.status === 'FAIL').length;

    return {
      timestamp: new Date().toISOString(),
      total: results.length,
      passed: passedCount,
      failed: failedCount,
      allPassed: failedCount === 0,
      results
    };
  }
}

module.exports = TestOrchestrator;
