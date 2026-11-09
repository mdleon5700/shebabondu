const fs = require('fs');

if (fs.existsSync('src/db/synthetic_users_store.json')) {
  const content = fs.readFileSync('src/db/synthetic_users_store.json', 'utf8');
  console.log('synthetic_users_store.json length:', content.length);
  try {
    const data = JSON.parse(content);
    console.log('Keys or length:', Array.isArray(data) ? `Array of ${data.length}` : Object.keys(data));
  } catch (e) {
    console.log('Error parsing:', e.message);
  }
} else {
  console.log('synthetic_users_store.json does not exist');
}

