const https = require('https');

https.get('https://dcjamalpur.teletalk.com.bd/dcjamalpur202610/posts.php?circular_id=xpoPbGzIPmI=', { rejectUnauthorized: false }, (res) => {
  console.log('Status:', res.statusCode, 'Headers:', res.headers);
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Total length:', html.length);
    console.log(html.slice(html.indexOf('<body')));
  });
}).on('error', e => console.error(e.message));
