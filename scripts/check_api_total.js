const http = require('http');

http.get('http://localhost:3000/api/jobs?limit=300', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const json = JSON.parse(d);
    console.log('Total count in API response:', json.total);
    console.log('Returned jobs length:', json.jobs?.length);
  });
});

