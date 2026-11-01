const http = require('http');
http.get('http://localhost:3000/jobs', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const reg = /href="([^"]*jobs[^"]*)"/g;
    let match;
    const links = [];
    while ((match = reg.exec(data)) !== null) {
      links.push(match[1]);
    }
    console.log('Total jobs links:', links.length);
    console.log('Sample links:', links.slice(0, 10));
  });
});