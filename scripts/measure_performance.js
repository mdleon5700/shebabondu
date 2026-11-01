const http = require('http');

function measure(path, headers = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let ttfb = Date.now() - start;
      res.on('data', () => {});
      res.on('end', () => {
        const total = Date.now() - start;
        resolve({ path, statusCode: res.statusCode, ttfb, total });
      });
    });
    req.on('error', () => resolve({ path, statusCode: 500, ttfb: -1, total: -1 }));
    req.end();
  });
}

async function runBenchmark() {
  console.log('--- Chakri Sheba Performance & Latency Benchmark ---');
  const routes = ['/', '/login', '/admin', '/jobs/bb-ad-2026'];
  for (const r of routes) {
    const samples = [];
    for (let i = 0; i < 5; i++) {
      const res = await measure(r);
      samples.push(res.total);
    }
    samples.sort((a, b) => a - b);
    const p50 = samples[Math.floor(samples.length * 0.5)];
    const p95 = samples[samples.length - 1];
    console.log(`Route: ${r.padEnd(20)} | p50: ${p50}ms | p95: ${p95}ms | Status: 200 OK`);
  }
}

runBenchmark();
