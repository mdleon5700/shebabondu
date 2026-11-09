const https = require('https');
const http = require('http');

const subdomains = [
  'desco', 'dpdc', 'pgcl', 'nwpgcl', 'bapex', 'sgfl', 'bgfcl', 'bsccl', 'btcl', 
  'titasgas', 'wzpdcl', 'nesco', 'breb', 'reb', 'biman', 'gtcl', 'jgtgsl', 'kgdcl', 
  'rpgcl', 'bpc', 'bfidc', 'bsec', 'bsfic', 'bjmc', 'blpa', 'cpa', 'mpa', 'payra'
];

function checkSubdomain(sub) {
  return new Promise((resolve) => {
    const url = `http://${sub}.teletalk.com.bd`;
    const req = http.get(url, { timeout: 4000 }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ sub, status: res.statusCode, title: extractTitle(data), len: data.length });
      });
    });
    req.on('error', err => resolve({ sub, error: err.code || err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ sub, error: 'TIMEOUT' }); });
  });
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : '';
}

async function run() {
  console.log(`Checking ${subdomains.length} company subdomains on teletalk.com.bd...`);
  const results = await Promise.all(subdomains.map(checkSubdomain));
  const active = results.filter(r => r.status === 200 || r.status === 302);
  console.log('Active subdomains found:', active);
}

run();

