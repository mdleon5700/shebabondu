const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function run() {
  const p1 = await fetchUrl('https://alljobs.teletalk.com.bd/assets/private-jobs-14a2591a.js');
  const p2 = await fetchUrl('https://alljobs.teletalk.com.bd/assets/private-jobs-8c313c78.js');
  
  console.log('p1 length:', p1.length, 'p2 length:', p2.length);
  const m1 = [...p1.matchAll(/["'`][^"'`]*(?:private-jobs|api)[^"'`]*["'`]/g)].map(m => m[0]);
  const m2 = [...p2.matchAll(/["'`][^"'`]*(?:private-jobs|api)[^"'`]*["'`]/g)].map(m => m[0]);
  console.log('m1 matches:', [...new Set(m1)]);
  console.log('m2 matches:', [...new Set(m2)]);
}

run().catch(console.error);

