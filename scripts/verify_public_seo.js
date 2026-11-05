fetch('http://localhost:3000/jobs/job-breb')
  .then(r => r.text())
  .then(html => {
    const scripts = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    console.log('JSON-LD count:', scripts ? scripts.length : 0);
    if (scripts) {
      scripts.forEach((s, idx) => {
        console.log(`--- Schema ${idx + 1} ---`);
        console.log(s.slice(0, 150) + '...');
      });
    } else {
      console.log('No JSON-LD found in raw HTML. HTML length:', html.length);
      console.log('Title tag:', html.match(/<title>[\s\S]*?<\/title>/i)?.[0]);
    }
  })
  .catch(err => console.error(err));
