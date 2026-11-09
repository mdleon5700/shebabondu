const http = require('http');

const activeSubs = ['pgcl', 'bapex', 'bgfcl', 'bsccl', 'reb', 'gtcl', 'kgdcl', 'rpgcl', 'bpc', 'bsec'];

function inspectPage(sub) {
  return new Promise((resolve) => {
    http.get(`http://${sub}.teletalk.com.bd`, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        // Find links and text
        const links = [...data.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi)].map(m => ({
          href: m[1],
          text: m[2].trim()
        }));
        // Look for keywords like "circular", "apply", "notice", "download", "last date"
        const mentionsCircular = /circular|advertisement|notice|বিজ্ঞপ্তি|নিয়োগ/i.test(data);
        const mentionsApply = /apply|online application|আবেদন/i.test(data);
        
        // Also look for dates like YYYY-MM-DD or DD/MM/YYYY
        const dates = data.match(/\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}/g) || [];
        
        resolve({
          sub,
          title: (data.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1],
          mentionsCircular,
          mentionsApply,
          links: links.filter(l => l.text.length > 0 || l.href.endsWith('.pdf')),
          sampleDates: dates.slice(0, 5)
        });
      });
    }).on('error', err => resolve({ sub, error: err.message }));
  });
}

async function run() {
  for (const s of activeSubs) {
    const res = await inspectPage(s);
    console.log(`\n=== Subdomain: ${res.sub} ===`);
    console.log('Title:', res.title);
    console.log('Mentions circular:', res.mentionsCircular, '| Apply:', res.mentionsApply);
    console.log('Sample links:', res.links.slice(0, 8));
    console.log('Sample dates:', res.sampleDates);
  }
}

run();

