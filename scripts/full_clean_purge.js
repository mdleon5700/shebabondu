const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(process.cwd(), 'src', 'db');
const timestamp = Date.now();
const BACKUP_PATH = path.join(DB_DIR, `local_store_backup_before_full_clean_${timestamp}.json`);

console.log('--- STEP 1: BACKUP AND PURGE ALL RUNTIME DATA ---');

// Backup local_store.json
const storePath = path.join(DB_DIR, 'local_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
fs.writeFileSync(BACKUP_PATH, JSON.stringify(store, null, 2), 'utf8');
console.log(`[BACKUP] Saved full backup to: ${BACKUP_PATH}`);

// Backup & clear synthetic_users_store.json
const synthPath = path.join(DB_DIR, 'synthetic_users_store.json');
if (fs.existsSync(synthPath)) {
  fs.writeFileSync(path.join(DB_DIR, `synthetic_users_backup_${timestamp}.json`), fs.readFileSync(synthPath));
  fs.writeFileSync(synthPath, JSON.stringify({}, null, 2), 'utf8');
  console.log('[PURGE] Cleared synthetic_users_store.json (0 users)');
}

// Clear all runtime collections in store
store.jobs = {};
store.candidates = {};
store.documents = {};
store.applications = {};
store.savedJobs = {};
store.transactions = {};
store.notifications = {};
store.sessions = {};
store.coupons = {};
store.raffleCampaigns = {};
store.couponRedemptions = {};
store.raffleEntries = {};
store.circularDrafts = {};
store.companies = {};
store.companyApplications = [];
store.spiderRuns = {};
store.aiUsageLogs = {};
store.verificationResults = {};
store.verificationQueue = [];
store.publicationSnapshots = {};
store.publicationAuditLogs = [];
store.publishingQueue = [];
store.contentStudioArticles = {};
store.deadlineData = {};
store.deadlineRevisions = {};
store.circularChangeProposals = [];
store.userJobReminders = {};
store.notificationDeliveries = [];
store.searchAnalytics = [];
store.adminAuditLogs = [];

// Persist clean local_store.json
fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

console.log('[PURGE SUCCESS] All jobs, user profiles, applications, documents, sessions, and drafts wiped 100% clean!');
console.log('Retained framework config:', {
  categories: Object.keys(store.categories || {}).length,
  pages: Object.keys(store.pages || {}).length,
  jobSources: Object.keys(store.jobSources || {}).length,
  staffMembers: Object.keys(store.staffMembers || {}).length,
  platformSettings: Boolean(store.platformSettings)
});

