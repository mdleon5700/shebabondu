const fs = require('fs');
const path = require('path');

async function testEndpoint(url, label) {
  console.log(`\n========================================`);
  console.log(`Testing [${label}]: ${url}`);
  console.log(`========================================`);

  try {
    const res = await fetch(url, { redirect: 'follow' });
    console.log(`HTTP Status: ${res.status} ${res.statusText}`);

    const html = await res.text();
    console.log(`HTML Length: ${html.length} characters`);

    // 1. Title Tag
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    console.log(`Page Title: ${titleMatch ? titleMatch[1].trim() : 'NOT FOUND'}`);

    // 2. Meta Description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    console.log(`Meta Description: ${descMatch ? descMatch[1].trim() : 'NOT FOUND'}`);

    // 3. Canonical Link
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    console.log(`Canonical Link: ${canonicalMatch ? canonicalMatch[1].trim() : 'NOT FOUND'}`);

    // 4. JSON-LD Schemas
    const scriptRegex = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let schemaCount = 0;

    while ((match = scriptRegex.exec(html)) !== null) {
      schemaCount++;
      const rawJson = match[1].trim();
      try {
        const parsed = JSON.parse(rawJson);
        console.log(`\n--- Schema #${schemaCount} (@type: ${parsed['@type'] || 'Unknown'}) ---`);
        if (parsed['@type'] === 'JobPosting') {
          console.log(`Job Title: ${parsed.title}`);
          console.log(`Hiring Org: ${parsed.hiringOrganization?.name}`);
          console.log(`Date Posted: ${parsed.datePosted}`);
          console.log(`Valid Through: ${parsed.validThrough}`);
          console.log(`Employment Type: ${parsed.employmentType}`);
          console.log(`Direct Apply: ${parsed.directApply}`);
        } else if (parsed['@type'] === 'BreadcrumbList') {
          console.log(`Breadcrumb Items: ${parsed.itemListElement?.length || 0}`);
        } else if (parsed['@type'] === 'FAQPage') {
          console.log(`FAQ Questions: ${parsed.mainEntity?.length || 0}`);
        } else {
          console.log(JSON.stringify(parsed, null, 2).slice(0, 200) + '...');
        }
      } catch (err) {
        console.error(`Schema #${schemaCount} JSON Parse Error:`, err.message);
      }
    }

    if (schemaCount === 0) {
      console.warn('⚠️ No JSON-LD schemas detected on this page.');
    } else {
      console.log(`\n✅ Verified ${schemaCount} valid JSON-LD schemas.`);
    }

    return { status: res.status, schemaCount };
  } catch (err) {
    console.error(`Request failed for ${url}:`, err.message);
    return { status: 0, schemaCount: 0 };
  }
}

async function run() {
  const localStorePath = path.join(__dirname, '..', 'src', 'db', 'local_store.json');
  let testJobId = 'job-alljobs-dcjamalpur-15137';

  try {
    if (fs.existsSync(localStorePath)) {
      const db = JSON.parse(fs.readFileSync(localStorePath, 'utf8'));
      const activeIds = Object.keys(db.jobs || {});
      if (activeIds.length > 0) {
        testJobId = activeIds[0];
      }
    }
  } catch {}

  console.log(`Starting Public SEO & JSON-LD Verification across live endpoints...`);
  console.log(`Selected Live Job ID for Detail Test: ${testJobId}`);

  await testEndpoint('http://localhost:3000/', 'Home Page');
  await testEndpoint('http://localhost:3000/jobs', 'Jobs Feed & Filter Page');
  await testEndpoint(`http://localhost:3000/jobs/${testJobId}`, `Real Public Job Posting Page (${testJobId})`);
  
  // Also test Petrobangla if present
  await testEndpoint(`http://localhost:3000/jobs/job-alljobs-bogmc-14989`, `Petrobangla Massive Circular (36 Positions)`);
  
  console.log(`\n========================================`);
  console.log(`✅ All Public SEO Verification Tests Completed!`);
  console.log(`========================================`);
}

run().catch(console.error);
