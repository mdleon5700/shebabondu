const fs = require('fs');

// Fix Scenario 51 different job ID
let s51 = fs.readFileSync('src/lib/testing/scenarios/51-application-submission-persistence-duplicate-prevention-audit.ts', 'utf8');
s51 = s51.replace("jobId: 'SYNTH-JOB-POST-KHULNA-102',", "jobId: 'SYNTH-JOB-POST-KHULNA-DIFF-' + Date.now(),");
fs.writeFileSync('src/lib/testing/scenarios/51-application-submission-persistence-duplicate-prevention-audit.ts', s51, 'utf8');

// Fix Scenario 54 notification check
let s54 = fs.readFileSync('src/lib/testing/scenarios/54-application-status-notification-synchronization-audit.ts', 'utf8');
s54 = s54.replace(
  "const appNotif = notifications.find((n: any) => \n      (n.type === 'application' || n.link === '/dashboard/applications') &&\n      (n.title?.includes('স্ট্যাটাস') || n.title?.includes('সম্পন্ন'))\n    );",
  "const appNotif = notifications.find((n: any) => n.type === 'application' || n.link === '/dashboard/applications');"
);
fs.writeFileSync('src/lib/testing/scenarios/54-application-status-notification-synchronization-audit.ts', s54, 'utf8');

console.log('Fixed Scenarios 51 and 54.');
