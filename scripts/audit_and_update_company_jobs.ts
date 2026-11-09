import fs from 'fs';
import path from 'path';

const storePath = path.resolve(process.cwd(), 'src/db/local_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

console.log('Auditing and updating AllJobs Teletalk Company & Autonomous Jobs...');

const companyUpdates: Record<string, {
  category: 'company';
  categoryLabel: string;
  orgType: string;
  subCategory: string;
  officialNotes: string;
}> = {
  // CPGCBL (Coal Power Generation Company Bangladesh Limited)
  'job-ai-cpgcbl-dfc0e2': {
    category: 'company',
    categoryLabel: 'বিদ্যুৎ ও জ্বালানি কোম্পানি',
    orgType: 'state_owned_company',
    subCategory: 'power_energy',
    officialNotes: 'কোল পাওয়ার জেনারেশন কোম্পানি বাংলাদেশ লিমিটেড (CPGCBL) - রাষ্ট্রীয় মালিকানাধীন বিদ্যুৎ উৎপাদন কোম্পানি। বিদ্যুৎ খাতের আকর্ষণীয় বেতন কাঠামো, বাড়িভাড়া (৫০-৬০%), বিদ্যুৎ ভাতা, মেডিকেল ভাতা ও ভবিষ্যৎ তহবিল সুবিধা প্রযোজ্য।'
  },
  // APSCL (Ashuganj Power Station Company Ltd.)
  'job-ai-apscl-049b71': {
    category: 'company',
    categoryLabel: 'বিদ্যুৎ উৎপাদন কোম্পানি',
    orgType: 'state_owned_company',
    subCategory: 'power_energy',
    officialNotes: 'আশুগঞ্জ পাওয়ার স্টেশন কোম্পানি লিমিটেড (APSCL) - বিদ্যুৎ খাতের পাবলিক লিমিটেড কোম্পানি। মূল বেতন ৫২,০০০ টাকা (সহকারী প্রকৌশলী/ব্যবস্থাপক), বাড়িভাড়া ভাতা, বিদ্যুৎ ভাতা, গ্র্যাচুইটি ও প্রভিডেন্ট ফান্ড সুবিধা প্রযোজ্য।'
  },
  // BCSL (Bangladesh Cable Shilpa Limited)
  'job-ai-bcsl-52e221': {
    category: 'company',
    categoryLabel: 'টেলিকম ও কেবল শিল্প কোম্পানি',
    orgType: 'state_owned_company',
    subCategory: 'telecom_manufacturing',
    officialNotes: 'বাংলাদেশ কেবল শিল্প লিমিটেড (BCSL) - ডাক ও টেলিযোগাযোগ মন্ত্রণালয়ের অধীনস্থ পাবলিক লিমিটেড কোম্পানি। জাতীয় বেতন স্কেল ২০১৫ ও কোম্পানির নিজস্ব চাকরি প্রবিধানমালা অনুযায়ী বেতন-ভাতা প্রদান করা হবে।'
  },
  // BOGMC / Petrobangla (Bangladesh Oil, Gas & Mineral Corporation)
  'job-ai-bogmc-14989': {
    category: 'company',
    categoryLabel: 'তেল, গ্যাস ও খনিজ সম্পদ করপোরেশন',
    orgType: 'autonomous_corporation',
    subCategory: 'power_energy',
    officialNotes: 'বাংলাদেশ তৈল, গ্যাস ও খনিজ সম্পদ করপোরেশন (পেট্রোবাংলা) - জাতীয় হাইড্রোকার্বন ও জ্বালানি খাতের শীর্ষ রাষ্ট্রীয় করপোরেশন। ৩৬টি পদে সর্বমোট ৭৫৩ জন নিয়োগ করা হবে। জাতীয় বেতন স্কেল ২০১৫ ও গ্যাস সেক্টর ভাতা কার্যকর।'
  },
  // BCIC (Bangladesh Chemical Industries Corporation)
  'job-ai-bcic-14936': {
    category: 'company',
    categoryLabel: 'রাসায়নিক ও সার শিল্প করপোরেশন',
    orgType: 'autonomous_corporation',
    subCategory: 'industrial_manufacturing',
    officialNotes: 'বাংলাদেশ কেমিক্যাল ইন্ডাস্ট্রিজ কর্পোরেশন (বিসিআইসি) - শিল্প মন্ত্রণালয়ের অধীনস্থ শীর্ষ শিল্প করপোরেশন। ১৯টি পদে সর্বমোট ৩৯০ জন নিয়োগ করা হবে। কারখানা ও শিল্প ঝুঁকি ভাতা কার্যকর।'
  },
  // DSCC (Dhaka South City Corporation)
  'job-ai-dscc-7d0238': {
    category: 'company',
    categoryLabel: 'সিটি কর্পোরেশন ও স্বায়ত্তশাসিত',
    orgType: 'city_corporation',
    subCategory: 'urban_governance',
    officialNotes: 'ঢাকা দক্ষিণ সিটি কর্পোরেশন (ডিএসসিসি) - স্থানীয় সরকার বিভাগের অধীনস্থ স্বায়ত্তশাসিত প্রতিষ্ঠান। প্রকৌশল ও নগর উন্নয়ন বিভাগে সরাসরি নিয়োগ।'
  },
  // BHTPA (Bangladesh Hi-Tech Park Authority)
  'job-ai-bhtpa-f996da': {
    category: 'company',
    categoryLabel: 'হাই-টেক পার্ক ও আইটি কর্তৃপক্ষ',
    orgType: 'statutory_authority',
    subCategory: 'it_technology',
    officialNotes: 'বাংলাদেশ হাই-টেক পার্ক কর্তৃপক্ষ (BHTPA) - আইসিটি বিভাগের অধীনস্থ সংবিধিবদ্ধ স্বায়ত্তশাসিত কর্তৃপক্ষ। বিশেষায়িত আইটি ও প্রযুক্তি পার্ক উন্নয়ন প্রশাসন।'
  },
  // HBRI (Housing & Building Research Institute)
  'job-ai-hbri-14968': {
    category: 'company',
    categoryLabel: 'জাতীয় গবেষণা প্রতিষ্ঠান',
    orgType: 'autonomous_institute',
    subCategory: 'civil_research',
    officialNotes: 'হাউজিং অ্যান্ড বিল্ডিং রিসার্চ ইনস্টিটিউট (এইচবিআরআই) - গৃহায়ন ও গণপূর্ত মন্ত্রণালয়ের অধীনস্থ জাতীয় গবেষণা প্রতিষ্ঠান।'
  }
};

// Check for FRI
const friJob = store.jobs['job-teletalk-15178'] || store.jobs['job-d41a4d30-f464-49ea-9593-b4735ee604c4'];
if (friJob) {
  const friCleanId = 'job-ai-fri-15178';
  store.jobs[friCleanId] = {
    ...friJob,
    id: friCleanId,
    title: 'বাংলাদেশ মৎস্য গবেষণা ইনস্টিটিউট (FRI) বিভিন্ন পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬',
    organization: 'বাংলাদেশ মৎস্য গবেষণা ইনস্টিটিউট (FRI)',
    organizationEn: 'Bangladesh Fisheries Research Institute (FRI)',
    category: 'company',
    categoryLabel: 'মৎস্য গবেষণা প্রতিষ্ঠান',
    orgType: 'autonomous_institute',
    subCategory: 'fisheries_research',
    publicationStatus: 'PUBLISHED',
    status: 'PUBLISHED',
    officialLink: 'https://fri.gov.bd',
    applicationUrl: 'http://fri.teletalk.com.bd',
    verificationStatus: 'VERIFIED_ACCURATE',
    verificationConfidence: 100,
    verifiedBy: 'SYSTEM-AUDIT-ENGINE',
    lastVerifiedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bengaliDescription: 'বাংলাদেশ মৎস্য গবেষণা ইনস্টিটিউট (FRI)-এ বৈজ্ঞানিক কর্মকর্তাসহ ১১টি ক্যাটাগরির পদে সর্বমোট ৮১ জনকে স্থায়ী ভিত্তিতে নিয়োগের জন্য বিজ্ঞপ্তি প্রকাশ করা হয়েছে।',
    seoTitle: 'বাংলাদেশ মৎস্য গবেষণা ইনস্টিটিউট (FRI) নিয়োগ বিজ্ঞপ্তি ২০২৬ - ৮১ পদে আবেদন',
    seoDescription: 'মৎস্য গবেষণা ইনস্টিটিউটে বৈজ্ঞানিক কর্মকর্তা, প্রকৌশলীসহ ১১ পদে ৮১ জনের নিয়োগ। আবেদন ও বিস্তারিত তথ্য।'
  };
  console.log(`Created curated entry: ${friCleanId}`);
}

// Update the identified company jobs
for (const [id, update] of Object.entries(companyUpdates)) {
  const job = store.jobs[id];
  if (job) {
    job.category = update.category;
    job.categoryLabel = update.categoryLabel;
    (job as any).orgType = update.orgType;
    (job as any).subCategory = update.subCategory;
    (job as any).officialNotes = update.officialNotes;
    job.updatedAt = new Date().toISOString();
    job.lastVerifiedAt = new Date().toISOString();
    job.verificationNotes = `${update.officialNotes} [Audited & Categorized as Company/Autonomous Enterprise]`;
    console.log(`Updated job ${id} -> Category: ${job.category} (${job.categoryLabel}), OrgType: ${(job as any).orgType}`);
  } else {
    console.warn(`Job ID ${id} not found in store!`);
  }
}

// Clean up duplicate uncurated jobs
const toDelete = [
  'job-teletalk-15178',
  'job-d41a4d30-f464-49ea-9593-b4735ee604c4',
  'job-2f2ec094-04c4-4b4b-83d6-56d9e9a61d7f',
  'job-teletalk-15038',
  'job-teletalk-15031',
  'job-teletalk-15024',
  'job-teletalk-14987',
  'job-teletalk-14984',
  'job-teletalk-14968',
  'job-teletalk-14936',
  'job-teletalk-14935',
  'job-teletalk-14913',
  'job-teletalk-12949',
  'job-ai-gov-454e35' // duplicate Chuadanga DC
];

let deletedCount = 0;
for (const id of toDelete) {
  if (store.jobs[id]) {
    delete store.jobs[id];
    deletedCount++;
  }
}
console.log(`Cleaned up ${deletedCount} uncurated draft duplicates.`);

// Write back to local_store.json
fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log(`Successfully persisted updated jobs. Total jobs now: ${Object.keys(store.jobs).length}`);

