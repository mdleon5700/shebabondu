const http = require('http');
http.get('http://localhost:3000/admin', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const idx = data.indexOf('type="password"');
    console.log('Index of password:', idx);
    if (idx !== -1) {
      console.log('Context around password:', data.slice(idx - 100, idx + 200));
    }
  });
});