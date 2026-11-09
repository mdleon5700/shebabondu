import fs from 'fs';

const files = [
  'src/db/backup_before_admin_test_purge_1794115334771.json',
  'src/db/local_store.before_user_reset.json',
  'src/db/local_store_backup_1794113999423.json',
  'src/db/local_store_backup_before_full_clean_1794184169916.json'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    console.log(`${f} => jobs: ${Object.keys(d.jobs || {}).length}`);
  }
}
