const fs = require('fs');
const path = require('path');
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'db', 'synthetic_users_store.json'), 'utf8'));
const users = Object.values(raw);
const districts = new Set();
const districtCodes = new Set();
users.forEach(u => {
  if (u.district) districts.add(u.district);
  if (u.districtCode) districtCodes.add(u.districtCode);
});
console.log('Total users:', users.length);
console.log('Districts count:', districts.size);
console.log('Has Sylhet (English):', Array.from(districts).filter(d => d.includes('Sylhet')));
console.log('Has Sylhet (Bengali):', Array.from(districts).filter(d => d.includes('?????')));
console.log('Has SYLHET code:', Array.from(districtCodes).filter(c => c.includes('SYL')));
console.log('Has KHULNA code:', Array.from(districtCodes).filter(c => c.includes('KHU')));
