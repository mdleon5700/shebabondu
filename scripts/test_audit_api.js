const http = require('http');

const data = JSON.stringify({ autoRepair: true });
const req = http.request('http://localhost:3000/api/admin/audit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-secret': '1234',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('Audit Success:', json.success);
      console.log('Overall Score:', json.report?.overallScore, '/ 100');
      console.log('Overall Status:', json.report?.overallStatus);
      console.log('Environment:', json.report?.environment);
      console.log('Database stats:', JSON.stringify(json.report?.databaseStats));
      for (const c of (json.report?.checks || [])) {
        console.log(`- [${c.status}] (${c.score}/100) ${c.name}: ${c.message}`);
      }
    } catch (e) {
      console.log('Body:', body);
    }
  });
});

req.on('error', e => console.error(e.message));
req.write(data);
req.end();
