const fs = require('fs');
const path = require('path');

const storePath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

console.log('--- PURGING ALL JOBS AND DATA FROM ADMIN PANEL & DATABASE ---');

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

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

console.log('Done! Verified counts in store:');
console.log({
  jobs: Object.keys(store.jobs).length,
  candidates: Object.keys(store.candidates).length,
  applications: Object.keys(store.applications).length,
  circularDrafts: Object.keys(store.circularDrafts).length,
  publishingQueue: store.publishingQueue.length,
  contentStudioArticles: Object.keys(store.contentStudioArticles).length
});
