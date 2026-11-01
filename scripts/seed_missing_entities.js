const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'db', 'local_store.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// 1. Seed jobSources if empty
if (!data.jobSources || Object.keys(data.jobSources).length === 0) {
  data.jobSources = {
    'teletalk-alljobs': {
      id: 'teletalk-alljobs',
      name: 'Teletalk Alljobs Portal',
      sourceUrl: 'https://alljobs.teletalk.com.bd',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true
    },
    'bpsc-portal': {
      id: 'bpsc-portal',
      name: 'Bangladesh Public Service Commission (BPSC)',
      sourceUrl: 'http://www.bpsc.gov.bd',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true
    },
    'bb-erecruitment': {
      id: 'bb-erecruitment',
      name: 'Bangladesh Bank e-Recruitment System',
      sourceUrl: 'https://erecruitment.bb.org.bd',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true
    }
  };
}

// 2. Seed circularDrafts if empty
if (!data.circularDrafts || Object.keys(data.circularDrafts).length === 0) {
  data.circularDrafts = {
    'draft-rupali-01': {
      id: 'draft-rupali-01',
      sourceName: '????? ???????? ? ?????? ???????',
      sourceUrl: 'https://alljobs.teletalk.com.bd/circular/rupali-bank-2026',
      extractedTitle: '?????? ?????? ?????? ?????? ?????? (????) ?????',
      extractedOrg: '?????? ?????? ??????',
      category: 'bank',
      grade: '?? ?????',
      deadline: '?? ??????? ????',
      vacancies: 65,
      minEducation: '?????? ?? ????? / ????',
      salary: '??,??? - ??,??? ????',
      govtFee: 200,
      confidenceScore: 0.96,
      duplicateDetected: false,
      status: 'pending_review',
      createdAt: new Date().toISOString()
    }
  };
}

// 3. Seed FIRST50 coupon
data.coupons['FIRST50'] = {
  id: 'coupon-first50',
  code: 'FIRST50',
  title: '??% ??????? ??? (???? ????????? ????? ?????)',
  description: '????? ?????? ??????? ?????? ??% ???',
  discountType: 'percentage',
  discountValue: 50,
  minServiceCharge: 50,
  maxDiscountCap: 40,
  startDate: new Date(Date.now() - 86400000).toISOString(),
  expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  status: 'active',
  globalUsageLimit: 1000,
  usedCount: 12,
  perCandidateLimit: 1,
  allowCombineWithRaffle: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Seeded jobSources, circularDrafts, and FIRST50 coupon into local_store.json');
