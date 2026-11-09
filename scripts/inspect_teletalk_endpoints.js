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
  const content = await fetchUrl('https://alljobs.teletalk.com.bd/assets/index-9097621b.js');
  
  // Search for govt-jobs or private-jobs
  const matches = [...content.matchAll(/["'`][^"'`]*(?:govt-jobs|private-jobs|notices|circular)[^"'`]*["'`]/g)].map(m => m[0]);
  console.log('Matches found:', [...new Set(matches)]);
}

run().catch(console.error);
