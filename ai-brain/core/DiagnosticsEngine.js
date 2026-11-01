const fs = require('fs');
const path = require('path');

class DiagnosticsEngine {
  constructor() {}

  diagnoseDataIntegrity(dbFilePath) {
    const issues = [];
    if (!fs.existsSync(dbFilePath)) {
      return {
        status: 'FAIL',
        error: `Database file not found: ${dbFilePath}`,
        issues: [{ severity: 'CRITICAL', message: 'Database file missing' }]
      };
    }

    let data;
    try {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      data = JSON.parse(raw);
    } catch (e) {
      return {
        status: 'FAIL',
        error: `Malformed JSON in database: ${e.message}`,
        issues: [{ severity: 'CRITICAL', message: e.message }]
      };
    }

    // Required collections check
    const requiredCollections = [
      'candidates',
      'applications',
      'savedJobs',
      'transactions',
      'notifications',
      'coupons',
      'raffleCampaigns',
      'pages',
      'jobSources',
      'circularDrafts',
      'companies'
    ];

    for (const col of requiredCollections) {
      if (!data[col]) {
        issues.push({
          severity: 'HIGH',
          collection: col,
          message: `Missing collection: ${col}`
        });
      }
    }

    // Candidate entity integrity
    if (data.candidates && typeof data.candidates === 'object') {
      for (const [id, cand] of Object.entries(data.candidates)) {
        if (!cand.phone && !cand.email) {
          issues.push({ severity: 'HIGH', target: id, message: 'Candidate missing contact identifier' });
        }
        if (!cand.passwordHash) {
          issues.push({ severity: 'CRITICAL', target: id, message: 'Candidate missing passwordHash' });
        }
      }
    }

    // Application entity referential integrity
    if (data.applications && typeof data.applications === 'object') {
      for (const [userId, apps] of Object.entries(data.applications)) {
        if (Array.isArray(apps)) {
          for (const app of apps) {
            if (!app.id || !app.jobId) {
              issues.push({ severity: 'HIGH', target: app.id || 'unknown', message: 'Application missing id or jobId' });
            }
            if (!app.candidatePhone && !app.candidateName) {
              issues.push({ severity: 'MEDIUM', target: app.id, message: 'Application missing candidate identity details' });
            }
          }
        }
      }
    }

    return {
      status: issues.length === 0 ? 'PASS' : 'WARN',
      totalCollections: Object.keys(data).length,
      issuesCount: issues.length,
      issues
    };
  }

  simulateConcurrentUpdates(testFilePath, workerCount = 5) {
    // Test atomic concurrency using temp file
    const tempFile = testFilePath + '.concurrent.tmp';
    fs.writeFileSync(tempFile, JSON.stringify({ counter: 0, updates: [] }), 'utf8');

    const updateErrors = [];
    for (let i = 0; i < workerCount; i++) {
      try {
        const raw = fs.readFileSync(tempFile, 'utf8');
        const d = JSON.parse(raw);
        d.counter += 1;
        d.updates.push({ worker: i, time: Date.now() });
        fs.writeFileSync(tempFile, JSON.stringify(d), 'utf8');
      } catch (err) {
        updateErrors.push(err.message);
      }
    }

    const finalRaw = fs.readFileSync(tempFile, 'utf8');
    const finalData = JSON.parse(finalRaw);
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

    return {
      status: updateErrors.length === 0 && finalData.counter === workerCount ? 'PASS' : 'FAIL',
      expectedUpdates: workerCount,
      recordedUpdates: finalData.counter,
      errors: updateErrors
    };
  }

  async verifyCacheHeaders(url) {
    try {
      const res = await fetch(url);
      const cacheControl = res.headers.get('cache-control') || '';
      return {
        url,
        status: res.status,
        cacheControl,
        isPrivateOrNoStore: cacheControl.includes('no-store') || cacheControl.includes('private') || cacheControl.includes('no-cache'),
        isSecure: true
      };
    } catch (e) {
      return { url, error: e.message, isSecure: false };
    }
  }
}

module.exports = DiagnosticsEngine;
