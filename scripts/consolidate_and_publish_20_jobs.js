const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = 'chakri_sheba_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

const dbPath = path.join(__dirname, '..', 'src', 'db', 'local_store.json');
if (!fs.existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Current jobs count:', Object.keys(db.jobs || {}).length);
console.log('Current candidates count:', Object.keys(db.candidates || {}).length);
console.log('Current applications count:', Object.keys(db.applications || {}).length);

// 1. Filter jobs: Keep only the 20 AI verified jobs
const aiJobs = Object.values(db.jobs || {}).filter(j => j.id.startsWith('job-ai-'));
console.log(`Found ${aiJobs.length} AI-resolved government jobs.`);

if (aiJobs.length !== 20) {
  console.warn(`Warning: expected 20 AI jobs, found ${aiJobs.length}`);
}

const consolidatedJobs = {};
for (const job of aiJobs) {
  // Promote to OPEN / PUBLISHED
  job.status = 'OPEN';
  job.publicationStatus = 'PUBLISHED';
  job.verificationStatus = 'VERIFIED';
  job.verificationConfidence = 100;
  job.featured = true;
  job.isHot = true;
  job.updatedAt = new Date().toISOString();
  consolidatedJobs[job.id] = job;
}

db.jobs = consolidatedJobs;
console.log(`Consolidated db.jobs to ${Object.keys(db.jobs).length} published circulars.`);

// 2. Setup Canonical Candidate USR-01712345678
const defaultId = 'USR-01712345678';
const candidateProfile = {
  id: defaultId,
  name: 'Md. Tanvir Hossain',
  nameBn: 'মোঃ তানভীর হাসান',
  fatherName: 'মোঃ রফিকুল ইসলাম',
  motherName: 'নাসিমা বেগম',
  email: 'tanvir.jobseeker@gmail.com',
  phone: '01712-345678',
  username: 'tanvir2026',
  dob: '1998-05-14',
  gender: 'male',
  nid: '5512345678901',
  division: 'ঢাকা',
  district: 'ঢাকা',
  address: 'বাড়ি ৪২, রোড ৭, ব্লক সি, মিরপুর-১০, ঢাকা-১২১৬',
  permanentAddress: 'গ্রাম: উত্তরপাড়া, ডাকঘর: টাঙ্গাইল সদর, জেলা: টাঙ্গাইল',
  photoUrl: '/images/avatar-placeholder.png',
  signatureUrl: '/images/signature-placeholder.png',
  walletBalance: 450,
  maritalStatus: 'single',
  quota: 'none',
  role: 'candidate',
  passwordHash: hashPassword('123456'),
  createdAt: '2026-01-15T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
  education: [
    {
      id: 'edu-1',
      level: 'SSC',
      degree: 'দাখিল/এসএসসি',
      boardOrUni: 'ঢাকা',
      roll: '184920',
      reg: '1512948291',
      year: '2014',
      result: 'GPA 5.00',
      majorSubject: 'বিজ্ঞান'
    },
    {
      id: 'edu-2',
      level: 'HSC',
      degree: 'আলিম/এইচএসসি',
      boardOrUni: 'ঢাকা',
      roll: '109283',
      reg: '1512948291',
      year: '2016',
      result: 'GPA 4.92',
      majorSubject: 'বিজ্ঞান'
    },
    {
      id: 'edu-3',
      level: 'Honours',
      degree: 'বিএসসি (ইঞ্জিনিয়ারিং)',
      boardOrUni: 'ঢাকা বিশ্ববিদ্যালয়',
      roll: '160293',
      reg: '1612948291',
      year: '2021',
      result: 'CGPA 3.68',
      majorSubject: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং'
    }
  ]
};

if (!db.candidates) db.candidates = {};
db.candidates[defaultId] = candidateProfile;
console.log(`Seeded candidate ${defaultId} (${candidateProfile.nameBn}).`);

// 3. Setup Documents for candidate
const documents = [
  {
    id: 'doc-photo-' + defaultId,
    candidateId: defaultId,
    name: 'পাসপোর্ট সাইজ ছবি',
    type: 'photo',
    fileUrl: '/images/avatar-placeholder.png',
    fileName: 'tanvir_photo.jpg',
    fileSize: 45200,
    fileType: 'image/jpeg',
    status: 'verified',
    verificationStatus: 'verified',
    uploadedAt: '2026-01-15T08:30:00.000Z'
  },
  {
    id: 'doc-sig-' + defaultId,
    candidateId: defaultId,
    name: 'স্বাক্ষর',
    type: 'signature',
    fileUrl: '/images/signature-placeholder.png',
    fileName: 'tanvir_signature.png',
    fileSize: 18400,
    fileType: 'image/png',
    status: 'verified',
    verificationStatus: 'verified',
    uploadedAt: '2026-01-15T08:31:00.000Z'
  },
  {
    id: 'doc-nid-' + defaultId,
    candidateId: defaultId,
    name: 'জাতীয় পরিচয়পত্র (NID)',
    type: 'nid_front',
    fileUrl: '/images/nid-placeholder.png',
    fileName: 'nid_front_5512345678901.pdf',
    fileSize: 124500,
    fileType: 'application/pdf',
    status: 'verified',
    verificationStatus: 'verified',
    uploadedAt: '2026-01-15T08:32:00.000Z'
  },
  {
    id: 'doc-ssc-' + defaultId,
    candidateId: defaultId,
    name: 'এসএসসি সনদপত্র',
    type: 'ssc_certificate',
    fileUrl: '/images/ssc-placeholder.pdf',
    fileName: 'ssc_certificate.pdf',
    fileSize: 98400,
    fileType: 'application/pdf',
    status: 'verified',
    verificationStatus: 'verified',
    uploadedAt: '2026-01-15T08:33:00.000Z'
  },
  {
    id: 'doc-hsc-' + defaultId,
    candidateId: defaultId,
    name: 'এইচএসসি সনদপত্র',
    type: 'hsc_certificate',
    fileUrl: '/images/hsc-placeholder.pdf',
    fileName: 'hsc_certificate.pdf',
    fileSize: 104200,
    fileType: 'application/pdf',
    status: 'verified',
    verificationStatus: 'verified',
    uploadedAt: '2026-01-15T08:34:00.000Z'
  },
  {
    id: 'doc-bsc-' + defaultId,
    candidateId: defaultId,
    name: 'স্নাতক (বিএসসি) সার্টিফিকেট',
    type: 'graduation_certificate',
    fileUrl: '/images/bsc-placeholder.pdf',
    fileName: 'bsc_certificate_du.pdf',
    fileSize: 142000,
    fileType: 'application/pdf',
    status: 'verified',
    verificationStatus: 'verified',
    uploadedAt: '2026-01-15T08:35:00.000Z'
  }
];

if (!db.documents) db.documents = {};
db.documents[defaultId] = documents;
console.log(`Seeded ${documents.length} verified documents for ${defaultId}.`);

// 4. Setup 3 Authentic Applications
const sampleJobs = [
  aiJobs.find(j => j.id === 'job-ai-gov-fcfec3') || aiJobs[0],
  aiJobs.find(j => j.id === 'job-ai-bcsl-52e221') || aiJobs[1],
  aiJobs.find(j => j.id === 'job-ai-bhtpa-f996da') || aiJobs[2]
];

const applications = [
  {
    id: 'APP-2026-8801',
    trackingNumber: 'CS-APP-2026-8801',
    candidateId: defaultId,
    candidateName: 'মোঃ তানভীর হাসান',
    candidatePhone: '01712-345678',
    candidateEmail: 'tanvir.jobseeker@gmail.com',
    jobId: sampleJobs[0].id,
    jobTitle: sampleJobs[0].title,
    organization: sampleJobs[0].organization,
    postName: sampleJobs[0].positions?.[0]?.title || 'অফিস সহকারী কাম-কম্পিউটার মুদ্রাক্ষরিক',
    postGrade: sampleJobs[0].positions?.[0]?.grade || '১৬তম গ্রেড',
    govtFee: Number(sampleJobs[0].positions?.[0]?.govtFee || sampleJobs[0].govtFee || 200),
    serviceCharge: 50,
    totalAmount: Number(sampleJobs[0].positions?.[0]?.govtFee || sampleJobs[0].govtFee || 200) + 50,
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    trxId: 'TRX-WAL-88019',
    status: 'completed',
    statusLabel: 'সফলভাবে সম্পন্ন',
    applicantCopyUrl: '/uploads/applicant_copies/APP-2026-8801_applicant_copy.pdf',
    userTeletalkId: 'HCD78912',
    adminNotes: 'টেলিটক পোর্টালে সফলভাবে আবেদন সম্পন্ন এবং পেমেন্ট ভেরিফাইড।',
    createdAt: '2026-11-05T10:15:00.000Z',
    updatedAt: '2026-11-05T11:45:00.000Z'
  },
  {
    id: 'APP-2026-8802',
    trackingNumber: 'CS-APP-2026-8802',
    candidateId: defaultId,
    candidateName: 'মোঃ তানভীর হাসান',
    candidatePhone: '01712-345678',
    candidateEmail: 'tanvir.jobseeker@gmail.com',
    jobId: sampleJobs[1].id,
    jobTitle: sampleJobs[1].title,
    organization: sampleJobs[1].organization,
    postName: sampleJobs[1].positions?.[0]?.title || 'সহকারী প্রকৌশলী',
    postGrade: sampleJobs[1].positions?.[0]?.grade || '১০ম গ্রেড',
    govtFee: Number(sampleJobs[1].positions?.[0]?.govtFee || sampleJobs[1].govtFee || 100),
    serviceCharge: 50,
    totalAmount: Number(sampleJobs[1].positions?.[0]?.govtFee || sampleJobs[1].govtFee || 100) + 50,
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    trxId: 'TRX-WAL-88020',
    status: 'processing',
    statusLabel: 'প্রক্রিয়াধীন রয়েছে',
    adminNotes: 'আবেদন যাচাই চলছে, টেলিটক ফি জমাদানের কাজ প্রক্রিয়াধীন।',
    createdAt: '2026-11-07T14:20:00.000Z',
    updatedAt: '2026-11-07T14:30:00.000Z'
  },
  {
    id: 'APP-2026-8803',
    trackingNumber: 'CS-APP-2026-8803',
    candidateId: defaultId,
    candidateName: 'মোঃ তানভীর হাসান',
    candidatePhone: '01712-345678',
    candidateEmail: 'tanvir.jobseeker@gmail.com',
    jobId: sampleJobs[2].id,
    jobTitle: sampleJobs[2].title,
    organization: sampleJobs[2].organization,
    postName: sampleJobs[2].positions?.[0]?.title || 'সহকারী পরিচালক',
    postGrade: sampleJobs[2].positions?.[0]?.grade || '৯ম গ্রেড',
    govtFee: Number(sampleJobs[2].positions?.[0]?.govtFee || sampleJobs[2].govtFee || 200),
    serviceCharge: 50,
    totalAmount: Number(sampleJobs[2].positions?.[0]?.govtFee || sampleJobs[2].govtFee || 200) + 50,
    paymentMethod: 'bkash',
    paymentStatus: 'unpaid',
    status: 'pending_payment',
    statusLabel: 'পেমেন্ট অপেক্ষমাণ',
    adminNotes: 'বিকাশ পেমেন্ট কনফার্মেশনের অপেক্ষায় রয়েছে।',
    createdAt: '2026-11-08T09:00:00.000Z',
    updatedAt: '2026-11-08T09:00:00.000Z'
  }
];

if (!db.applications) db.applications = {};
db.applications[defaultId] = applications;
console.log(`Seeded ${applications.length} applications for ${defaultId}.`);

// 5. Setup Wallet Transactions for Candidate
const transactions = [
  {
    id: 'TRX-DEP-001',
    candidateId: defaultId,
    userId: defaultId,
    type: 'deposit',
    amount: 1000,
    method: 'bkash',
    gatewayTrxId: 'BKASH9827361',
    description: 'ওয়ালেট রিচার্জ (বিকাশ)',
    status: 'completed',
    balanceAfter: 1000,
    createdAt: '2026-11-01T10:00:00.000Z'
  },
  {
    id: 'TRX-WAL-88019',
    candidateId: defaultId,
    userId: defaultId,
    type: 'fee_deduction',
    amount: 250,
    method: 'wallet',
    applicationId: 'APP-2026-8801',
    description: 'আবেদন ফি ও সার্ভিস চার্জ: বাংলাদেশ সুপ্রিম কোর্ট',
    status: 'completed',
    balanceAfter: 750,
    createdAt: '2026-11-05T10:15:00.000Z'
  },
  {
    id: 'TRX-WAL-88020',
    candidateId: defaultId,
    userId: defaultId,
    type: 'fee_deduction',
    amount: 150,
    method: 'wallet',
    applicationId: 'APP-2026-8802',
    description: 'আবেদন ফি ও সার্ভিস চার্জ: বাংলাদেশ কেবল শিল্প লিমিটেড',
    status: 'completed',
    balanceAfter: 600,
    createdAt: '2026-11-07T14:20:00.000Z'
  }
];

if (!db.transactions) db.transactions = {};
db.transactions[defaultId] = transactions;
console.log(`Seeded ${transactions.length} wallet transactions.`);

// 6. Setup Notifications for Candidate
const notifications = [
  {
    id: 'NOTIF-001',
    candidateId: defaultId,
    userId: defaultId,
    title: 'আবেদন সফল হয়েছে',
    message: 'আপনার বাংলাদেশ সুপ্রিম কোর্ট (হাইকোর্ট বিভাগ)-এর আবেদনটি সফলভাবে সম্পন্ন হয়েছে। অ্যাপ্লিকেন্ট কপি ডাউনলোড করুন।',
    type: 'application_update',
    isRead: false,
    link: '/dashboard/applications',
    createdAt: '2026-11-05T11:45:00.000Z'
  },
  {
    id: 'NOTIF-002',
    candidateId: defaultId,
    userId: defaultId,
    title: 'আবেদন প্রক্রিয়া শুরু হয়েছে',
    message: 'বাংলাদেশ কেবল শিল্প লিমিটেড (BCSL) পদে আপনার আবেদনটির ভেরিফিকেশন কার্যক্রম শুরু হয়েছে।',
    type: 'application_update',
    isRead: true,
    link: '/dashboard/applications',
    createdAt: '2026-11-07T14:30:00.000Z'
  }
];

if (!db.notifications) db.notifications = {};
db.notifications[defaultId] = notifications;
console.log(`Seeded ${notifications.length} notifications.`);

// 7. Setup Saved Jobs
if (!db.savedJobs) db.savedJobs = {};
db.savedJobs[defaultId] = [sampleJobs[0].id, sampleJobs[1].id];

// 8. Atomic write to local_store.json
const backupPath = dbPath + '.bak';
fs.copyFileSync(dbPath, backupPath);
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('Successfully consolidated database and updated local_store.json!');

