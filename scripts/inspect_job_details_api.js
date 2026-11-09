const https = require('https');

https.get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=15178', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(d), null, 2));
  });
});

