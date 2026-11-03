const fs = require('fs');
const path = require('path');

const localStorePath = path.join(__dirname, '..', 'src', 'db', 'local_store.json');
const localStoreBakPath = path.join(__dirname, '..', 'src', 'db', 'local_store.json.bak');

// 1. Create a safe backup first
fs.copyFileSync(localStorePath, localStoreBakPath);
console.log('✓ Created backup at', localStoreBakPath);

const store = JSON.parse(fs.readFileSync(localStorePath, 'utf8'));

// 2. Identify and keep Abdur Rahman Leon's real account
let leonAccount = null;
for (const [id, c] of Object.entries(store.candidates || {})) {
  const phone = (c.phone || '').replace(/\D/g, '');
  if (phone === '01774366647' || c.email === 'mdleon5700@gmail.com') {
    leonAccount = { ...c };
    break;
  }
}

if (!leonAccount) {
  console.error('FATAL: Could not find Abdur Rahman Leon account!');
  process.exit(1);
}

// Ensure smart username and smart candidate ID alias
leonAccount.username = 'leon.rahman.6647';
leonAccount.walletBalance = 500; // Fresh BDT 500 balance for user testing
leonAccount.updatedAt = new Date().toISOString();

console.log('Found & preserved real account:', {
  id: leonAccount.id,
  name: leonAccount.name,
  phone: leonAccount.phone,
  email: leonAccount.email,
  username: leonAccount.username,
  walletBalance: leonAccount.walletBalance
});

// Reset Candidates: Keep ONLY Abdur Rahman Leon
const newCandidates = {
  [leonAccount.id]: leonAccount
};

// Reset Applications: Fresh & empty
const newApplications = {
  [leonAccount.id]: []
};

// Reset Transactions: Fresh welcome credit transaction
const newTransactions = {
  [leonAccount.id]: [
    {
      id: 'CS-TXN-2611-0001',
      date: new Date().toISOString(),
      amount: 500,
      type: 'recharge',
      description: 'প্রাথমিক অ্যাকাউন্ট ব্যালেন্স',
      method: 'Wallet',
      trxId: 'CS-INIT-CREDIT-500',
      status: 'completed'
    }
  ]
};

// Reset Documents: Keep documents belonging to Leon
const newDocuments = {};
if (store.documents && store.documents[leonAccount.id]) {
  newDocuments[leonAccount.id] = store.documents[leonAccount.id];
} else {
  newDocuments[leonAccount.id] = [];
}

// Reset Notifications: Single fresh welcome notification
const newNotifications = {
  [leonAccount.id]: [
    {
      id: 'CS-NOTIF-2611-001',
      title: 'চাকরি সেবা প্ল্যাটফর্মে স্বাগতম!',
      message: 'আপনার অ্যাকাউন্ট সম্পূর্ণ সক্রিয় ও ফ্রেশ অবস্থায় প্রস্তুত। সরকারি চাকরির সার্কুলার দেখে সরাসরি আবেদন করতে পারেন।',
      type: 'system',
      link: '/dashboard',
      date: new Date().toISOString(),
      read: false
    }
  ]
};

// Reset Saved Jobs:
const newSavedJobs = {
  [leonAccount.id]: []
};

// Keep ONLY the 5 official Bangladesh Teletalk Government Circulars
const OFFICIAL_JOB_IDS = [
  'job-teletalk-15106-cpgcbl',
  'job-teletalk-15102-dcjhenaidah',
  'job-teletalk-15090-apscl',
  'job-teletalk-15085-basb',
  'job-teletalk-15083-itiiu'
];

const newJobs = {};
for (const id of OFFICIAL_JOB_IDS) {
  if (store.jobs && store.jobs[id]) {
    newJobs[id] = store.jobs[id];
  }
}

// Clean Circular Drafts to only match real jobs
const newDrafts = {};
if (store.circularDrafts) {
  for (const [k, v] of Object.entries(store.circularDrafts)) {
    if (OFFICIAL_JOB_IDS.some(id => k.includes(id.replace('job-teletalk-', '')))) {
      newDrafts[k] = v;
    }
  }
}

// Construct Fresh, Clean Store
store.candidates = newCandidates;
store.applications = newApplications;
store.transactions = newTransactions;
store.documents = newDocuments;
store.notifications = newNotifications;
store.savedJobs = newSavedJobs;
store.jobs = newJobs;
store.circularDrafts = newDrafts;
store.circularChangeProposals = {};
store.sessions = {};
store.notificationDeliveries = [];
store.companyApplications = {};
store.searchAnalytics = [];
store.adminAuditLogs = [
  {
    id: 'LOG-SYSTEM-INIT',
    adminId: 'SYSTEM',
    action: 'system_initialized',
    targetId: 'ALL',
    details: 'Database reset and fresh initialization for production readiness',
    timestamp: new Date().toISOString()
  }
];

fs.writeFileSync(localStorePath, JSON.stringify(store, null, 2), 'utf8');
console.log('✓ Successfully wrote fresh local_store.json');

// Purge synthetic stores to prevent synthetic dummy accounts/jobs leakage
const syntheticFiles = [
  'synthetic_users_store.json',
  'synthetic_applications_store.json',
  'synthetic_documents_store.json',
  'synthetic_notifications_store.json',
  'synthetic_jobs_store.json',
  'test_runs_store.json'
];

syntheticFiles.forEach(fileName => {
  const filePath = path.join(__dirname, '..', 'src', 'db', fileName);
  if (fs.existsSync(filePath)) {
    if (fileName === 'test_runs_store.json') {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    } else {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), 'utf8');
    }
    console.log(`✓ Cleared ${fileName}`);
  }
});

console.log('=== PURGE & RESET COMPLETE ===');
console.log('Remaining Candidates:', Object.keys(store.candidates).length);
console.log('Remaining Jobs:', Object.keys(store.jobs).length);
console.log('Remaining Applications:', Object.values(store.applications).flat().length);
console.log('Remaining Transactions:', Object.values(store.transactions).flat().length);

