const fs = require('fs');
const path = require('path');

function replaceInFile(relPath, replacers) {
  const fullPath = path.join(__dirname, '..', relPath);
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const [target, replacement] of replacers) {
    if (content.includes(target)) {
      content = content.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${relPath}`);
}

// 43
replaceInFile('src/lib/testing/scenarios/43-notification-catalog-event-lifecycle-audit.ts', [
  [`category: 'notification'`, `category: 'api'`]
]);

// 44
replaceInFile('src/lib/testing/scenarios/44-64-district-personalized-job-alerts-eligibility-audit.ts', [
  [`category: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান'`, `category: 'bank'`],
  [`category: 'বিসিএস ও সরকারি চাকরি'`, `category: 'govt'`],
  [`experienceYears: 0`, `experienceYears: '0'`],
  [`PersonalizedRecommender.notifyCandidateOnTopMatches(userB.id);`, `PersonalizedRecommender.notifyCandidateOnTopMatches(userB.id || '');`],
  [`category: 'alerts'`, `category: 'user'`]
]);

// 45
replaceInFile('src/lib/testing/scenarios/45-notification-preferences-channel-control-audit.ts', [
  [`category: 'preferences'`, `category: 'user'`]
]);

// 46
replaceInFile('src/lib/testing/scenarios/46-duplicate-prevention-and-idempotency-audit.ts', [
  [`type: 'matching'`, `type: 'job_match'`],
  [`category: 'idempotency'`, `category: 'api'`]
]);

// 47
replaceInFile('src/lib/testing/scenarios/47-deadline-alerts-and-automated-reminders-audit.ts', [
  [`category: 'deadlines'`, `category: 'api'`]
]);

// 48
replaceInFile('src/lib/testing/scenarios/48-user-panel-notification-experience-security-isolation-audit.ts', [
  [`category: 'user_experience'`, `category: 'user'`]
]);

console.log('All Step 09 scenario types patched!');
