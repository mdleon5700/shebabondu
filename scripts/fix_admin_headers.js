const fs = require('fs');

['53-admin-application-review-status-transition-audit.ts', '54-application-status-notification-synchronization-audit.ts'].forEach(file => {
  const p = 'src/lib/testing/scenarios/' + file;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(
    "'Cookie': 'session_token=admin_token_master',\n      'x-admin-role': 'super_admin'",
    "'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'"
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated adminHeaders in', file);
});
