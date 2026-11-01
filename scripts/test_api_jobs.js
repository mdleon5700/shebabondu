const http = require('http');
http.get('http://localhost:3000/api/jobs?limit=200', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Success:', json.success, 'Total jobs returned:', json.jobs?.length);
    if (json.jobs?.length > 0) {
      console.log('Sample job id:', json.jobs[0].id, 'status:', json.jobs[0].status);
    }
  });
});