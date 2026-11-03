const fs = require('fs');

const path = 'src/db/local_store.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

if (db.pages && db.pages['home']) {
  db.pages['home'].slug = '/home-cms-draft';
  if (db.pages['home'].publishedContent) {
    db.pages['home'].publishedContent.slug = '/home-cms-draft';
  }
  fs.writeFileSync(path, JSON.stringify(db, null, 2), 'utf8');
  console.log('Successfully updated home page slug in local_store.json!');
} else {
  console.log('home page not found in local_store.json');
}

