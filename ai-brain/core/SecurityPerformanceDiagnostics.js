const fs = require('fs');
const path = require('path');

class SecurityPerformanceDiagnostics {
  constructor() {}

  // 1. Secret Leak & Hardcoded Credentials Scanner
  scanSecrets(workspacePath, fileExtensions = ['.ts', '.tsx', '.js', '.json']) {
    const issues = [];
    const files = this._collectFiles(workspacePath, fileExtensions);

    const patterns = [
      { name: 'Google API Key', regex: /AIzaSy[0-9a-zA-Z_-]{33}/ },
      { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/ },
      { name: 'GitHub Personal Token', regex: /ghp_[0-9a-zA-Z]{36}/ },
      { name: 'Private RSA/DSA Key', regex: /-----BEGIN\s+(RSA|DSA|EC)?\s*PRIVATE\s+KEY-----/ }
    ];

    for (const f of files) {
      if (f.includes('.env.local') || f.includes('.git') || f.includes('node_modules')) continue;
      try {
        const text = fs.readFileSync(f, 'utf8');
        for (const p of patterns) {
          if (p.regex.test(text)) {
            issues.push({
              file: path.relative(workspacePath, f),
              pattern: p.name,
              severity: 'CRITICAL'
            });
          }
        }
      } catch (e) {}
    }

    return {
      filesScanned: files.length,
      leaksFound: issues.length,
      issues
    };
  }

  // 2. Measure API Response Time & TTFB
  async measureApiLatency(url, iterations = 3) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      try {
        const res = await fetch(url);
        await res.text();
        times.push(Date.now() - start);
      } catch (err) {
        times.push(-1);
      }
    }

    const validTimes = times.filter(t => t >= 0);
    const avg = validTimes.length > 0 
      ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length) 
      : -1;

    return {
      url,
      iterations,
      latenciesMs: times,
      averageMs: avg,
      fast: avg >= 0 && avg < 300,
      status: avg >= 0 ? 'PASS' : 'FAIL'
    };
  }

  // 3. Slow Network & Retry Safety Simulation
  async simulateSlowNetworkWithRetries(operationFn, maxRetries = 3, initialBackoffMs = 10) {
    let attempts = 0;
    let delay = initialBackoffMs;

    while (attempts < maxRetries) {
      attempts++;
      try {
        const result = await operationFn(attempts);
        return {
          success: true,
          attemptsNeeded: attempts,
          result
        };
      } catch (err) {
        if (attempts >= maxRetries) {
          return {
            success: false,
            attempts,
            error: err.message
          };
        }
        // Jittered exponential backoff
        const jitter = Math.random() * delay * 0.2;
        await new Promise(r => setTimeout(r, delay + jitter));
        delay *= 2;
      }
    }
  }

  // 4. Rate Limiter Validation
  async testLoginRateLimiting(loginUrl) {
    const results = [];
    // Perform 7 consecutive bad login attempts
    for (let i = 0; i < 7; i++) {
      try {
        const res = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'admin', adminPin: 'BAD_PIN_' + i })
        });
        results.push(res.status);
      } catch (e) {
        results.push(500);
      }
    }

    const hasRateLimitTriggered = results.includes(429);
    return {
      attemptStatuses: results,
      rateLimitTriggered: hasRateLimitTriggered,
      status: hasRateLimitTriggered ? 'PASS' : 'WARN'
    };
  }

  _collectFiles(dir, extensions) {
    let results = [];
    try {
      const list = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of list) {
        if (['node_modules', '.next', '.git', 'storage'].includes(item.name)) continue;
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          results = results.concat(this._collectFiles(full, extensions));
        } else if (extensions.includes(path.extname(item.name))) {
          results.push(full);
        }
      }
    } catch (e) {}
    return results;
  }
}

module.exports = SecurityPerformanceDiagnostics;
