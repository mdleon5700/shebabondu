import { serverDB } from '@/lib/db';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = 'CHAKRISEBA_SECURE_ADMIN_2026';

const BANGLADESHI_FIRST_NAMES = [
  { en: 'Md. Al Amin', bn: 'মোঃ আল আমিন' },
  { en: 'Sabbir Ahmed', bn: 'সাব্বির আহমেদ' },
  { en: 'Naimur Rahman', bn: 'নাঈমুর রহমান' },
  { en: 'Fariha Tasnim', bn: 'ফারিহা তাসনিম' },
  { en: 'Habibur Rahman', bn: 'হাবিবুর রহমান' },
  { en: 'Sharmin Akter', bn: 'শারমিন আক্তার' },
  { en: 'Mahfuzur Rahman', bn: 'মাহফুজুর রহমান' },
  { en: 'Sumaiya Islam', bn: 'সুমাইয়া ইসলাম' },
  { en: 'Ashraful Islam', bn: 'আশরাফুল ইসলাম' },
  { en: 'Zannatul Nayem', bn: 'জান্নাতুল নাঈম' },
  { en: 'Raihan Kabir', bn: 'রায়হান কবির' },
  { en: 'Farzana Yesmin', bn: 'ফারজানা ইয়াসমিন' },
  { en: 'Tawhidul Islam', bn: 'তৌহিদুল ইসলাম' },
  { en: 'Shamima Nasrin', bn: 'শামীমা নাসরিন' },
  { en: 'Mustafizur Rahman', bn: 'মুস্তাফিজুর রহমান' },
  { en: 'Anika Tabassum', bn: 'আনিকা তাবাসসুম' },
  { en: 'Sohag Hossain', bn: 'সোহাগ হোসেন' },
  { en: 'Rabeya Bosri', bn: 'রাবেয়া বসরী' },
  { en: 'Shafiqul Islam', bn: 'শফিকুল ইসলাম' },
  { en: 'Tahmina Khatun', bn: 'তাহমিনা খাতুন' }
];

const DISTRICTS = [
  { district: 'কুমিল্লা', division: 'চট্টগ্রাম' },
  { district: 'সিলেট', division: 'সিলেট' },
  { district: 'খুলনা', division: 'খুলনা' },
  { district: 'বরিশাল', division: 'বরিশাল' },
  { district: 'রংপুর', division: 'রংপুর' },
  { district: 'ময়মনসিংহ', division: 'ময়মনসিংহ' },
  { district: 'বগুড়া', division: 'রাজশাহী' },
  { district: 'দিনাজপুর', division: 'রংপুর' },
  { district: 'পাবনা', division: 'রাজশাহী' },
  { district: 'যশোর', division: 'খুলনা' },
  { district: 'টাঙ্গাইল', division: 'ঢাকা' },
  { district: 'কিশোরগঞ্জ', division: 'ঢাকা' },
  { district: 'ফরিদপুর', division: 'ঢাকা' },
  { district: 'গাজীপুর', division: 'ঢাকা' },
  { district: 'নারায়ণগঞ্জ', division: 'ঢাকা' },
  { district: 'ব্রাহ্মণবাড়িয়া', division: 'চট্টগ্রাম' },
  { district: 'চাঁদপুর', division: 'চট্টগ্রাম' },
  { district: 'ফেনী', division: 'চট্টগ্রাম' },
  { district: 'নোয়াখালী', division: 'চট্টগ্রাম' },
  { district: 'কক্সবাজার', division: 'চট্টগ্রাম' },
  { district: 'পটুয়াখালী', division: 'বরিশাল' },
  { district: 'ভোলা', division: 'বরিশাল' },
  { district: 'ঝালকাঠি', division: 'বরিশাল' },
  { district: 'পিরোজপুর', division: 'বরিশাল' },
  { district: 'সাতক্ষীরা', division: 'খুলনা' },
  { district: 'বাগেরহাট', division: 'খুলনা' },
  { district: 'কুষ্টিয়া', division: 'খুলনা' },
  { district: 'মেহেরপুর', division: 'খুলনা' },
  { district: 'চুয়াডাঙ্গা', division: 'খুলনা' },
  { district: 'ঝিনাইদহ', division: 'খুলনা' },
  { district: 'মাগুরা', division: 'খুলনা' },
  { district: 'নড়াইল', division: 'খুলনা' },
  { district: 'সিরাজগঞ্জ', division: 'রাজশাহী' },
  { district: 'নাটোর', division: 'রাজশাহী' },
  { district: 'নওগাঁ', division: 'রাজশাহী' },
  { district: 'চাঁপাইনবাবগঞ্জ', division: 'রাজশাহী' },
  { district: 'জয়পুরহাট', division: 'রাজশাহী' },
  { district: 'গাইবান্ধা', division: 'রংপুর' },
  { district: 'কুড়িগ্রাম', division: 'রংপুর' },
  { district: 'লালমনিরহাট', division: 'রংপুর' },
  { district: 'নীলফামারী', division: 'রংপুর' },
  { district: 'পঞ্চগড়', division: 'রংপুর' },
  { district: 'ঠাকুরগাঁও', division: 'রংপুর' },
  { district: 'হবিগঞ্জ', division: 'সিলেট' },
  { district: 'মৌলভীবাজার', division: 'সিলেট' },
  { district: 'সুনামগঞ্জ', division: 'সিলেট' },
  { district: 'জামালপুর', division: 'ময়মনসিংহ' },
  { district: 'শেরপুর', division: 'ময়মনসিংহ' },
  { district: 'নেত্রকোণা', division: 'ময়মনসিংহ' },
  { district: 'মানিকগঞ্জ', division: 'ঢাকা' },
  { district: 'মুন্সীগঞ্জ', division: 'ঢাকা' },
  { district: 'নরসিংদী', division: 'ঢাকা' },
  { district: 'রাজবাড়ী', division: 'ঢাকা' },
  { district: 'গোপালগঞ্জ', division: 'ঢাকা' },
  { district: 'শরীয়তপুর', division: 'ঢাকা' },
  { district: 'মাদারীপুর', division: 'ঢাকা' }
];

const SKILL_POOLS = [
  ['কম্পিউটার টাইপিং', 'এমএস অফিস', 'ইন্টারনেট ব্রাউজিং', 'ডাটা এন্ট্রি'],
  ['ইংরেজি যোগাযোগ', 'অফিসিয়াল ড্রাফটিং', 'নথি ব্যবস্থাপনা', 'ইমেইল করেসপন্ডেন্স'],
  ['হিসাববিজ্ঞান', 'ট্যালি প্রাইম', 'এক্সেল অ্যানালিটিক্স', 'ভ্যাট ও ট্যাক্স অডিট'],
  ['নেটওয়ার্কিং', 'কম্পিউটার হার্ডওয়্যার', 'উইন্ডোজ ট্রাবলশুটিং', 'আইটি সাপোর্ট'],
  ['গ্রাফিক্স ডিজাইন', 'ফটশপ', 'ইলাস্ট্রেটর', 'ডিজিটাল পাবলিশিং'],
  ['ল্যাবরেটরি ম্যানেজমেন্ট', 'রাসায়নিক পরীক্ষা', 'গুণগত মান নিয়ন্ত্রণ', 'টেকনিক্যাল ডকুমেন্টেশন']
];

async function runExpandedAccountsLifecycle() {
  console.log('========================================================================');
  console.log('🚀 EXPANDING CANDIDATE ACCOUNTS AUDIT (ACCOUNTS 21 TO 100 - ONE BY ONE)');
  console.log('========================================================================\n');

  // Fetch active public jobs to apply to
  const jobsRes = await fetch(`${BASE_URL}/api/jobs?limit=10`);
  const jobsData = await jobsRes.json();
  const availableJobs = jobsData.jobs || [];

  if (availableJobs.length === 0) {
    console.error('❌ No public jobs found to apply to!');
    process.exit(1);
  }

  let totalSuccessful = 0;

  for (let i = 21; i <= 100; i++) {
    const padIndex = String(i).padStart(3, '0');
    const phone = `01711000${padIndex}`;
    const nameSeed = BANGLADESHI_FIRST_NAMES[(i - 1) % BANGLADESHI_FIRST_NAMES.length];
    const distSeed = DISTRICTS[(i - 1) % DISTRICTS.length];
    const candidateName = `${nameSeed.en} #${i}`;
    const candidateNameBn = `${nameSeed.bn} (${i})`;
    const email = `candidate${i}.chakrisheba@gmail.com`;
    const nid = `199${(i % 10)}` + String(Date.now()).slice(-8) + padIndex;
    const skills = SKILL_POOLS[i % SKILL_POOLS.length];

    console.log(`[Account ${i}/100] ${candidateName} | Mobile: ${phone} | District: ${distSeed.district}`);

    let candidateId = '';
    let token = '';

    // Check if already registered
    const existing = serverDB.getCandidateByPhone(phone);
    if (!existing) {
      const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          password: 'SecurePassword2026!',
          name: candidateName,
          nameBn: candidateNameBn,
          email: email,
          district: distSeed.district,
          division: distSeed.division
        })
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        console.error(`❌ Registration failed for Account ${i}:`, regData);
        throw new Error(`Registration failed for Account ${i}`);
      }
      candidateId = regData.user.id;
      token = regData.token;
    } else {
      candidateId = existing.id;
    }

    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: phone, password: 'SecurePassword2026!' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      console.error(`❌ Login failed for Account ${i}:`, loginData);
      throw new Error(`Login failed for Account ${i}`);
    }
    token = loginData.token;

    const userHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${token}`,
      'Authorization': `Bearer ${token}`
    };

    // Update Profile
    const updateRes = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PATCH',
      headers: userHeaders,
      body: JSON.stringify({
        fatherName: `Father of ${candidateName}`,
        motherName: `Mother of ${candidateName}`,
        nidNumber: nid,
        gender: i % 2 === 0 ? 'female' : 'male',
        dateOfBirth: `199${i % 8 + 1}-0${(i % 9) + 1}-15`,
        education: [
          { level: 'SSC', degree: 'Science', institution: `${distSeed.district} Zilla School`, passingYear: 2012, result: 'GPA 5.00' },
          { level: 'HSC', degree: 'Science', institution: `${distSeed.district} Govt College`, passingYear: 2014, result: 'GPA 4.90' },
          { level: 'Honours', degree: 'BSc / BBA', institution: 'National University', passingYear: 2019, result: 'CGPA 3.65' }
        ],
        skills: skills,
        presentAddress: `${distSeed.district} সদর, ${distSeed.district}`,
        permanentAddress: `${distSeed.district} সদর, ${distSeed.district}`
      })
    });
    if (!updateRes.ok) throw new Error(`Profile update failed for Account ${i}`);

    // Admin Verification & Edit
    const adminHeaders = {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_SECRET
    };

    const adminEditRes = await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        verificationStatus: 'verified',
        isVerified: true,
        adminNote: `স্বয়ংক্রিয় অডিট যাচাই সম্পন্ন: একাউন্ট #${i} এর প্রোফাইল ও এনআইডি অনুমোদিত।`,
        preferredJobTypes: ['Government', 'Bank', 'Private']
      })
    });
    if (!adminEditRes.ok) throw new Error(`Admin edit failed for Account ${i}`);

    // Submit Job Application
    const targetJob = availableJobs[(i - 1) % availableJobs.length];
    const postName = targetJob.positions && targetJob.positions.length > 0 
      ? targetJob.positions[0].title 
      : (targetJob.title || 'অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক');

    const appRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        jobId: targetJob.id,
        postName: postName,
        paymentMethod: i % 2 === 0 ? 'bKash' : 'Nagad',
        trxId: `TRX-${i % 2 === 0 ? 'BKASH' : 'NAGAD'}-${i}-${Date.now().toString().slice(-4)}`,
        candidateName: candidateName,
        candidatePhone: phone,
        notes: `অনলাইন আবেদনকারী - একাউন্ট #${i}`
      })
    });
    const appData = await appRes.json();
    const createdAppId = appData.createdApp ? appData.createdApp.id : appData.existingAppId;

    if (!createdAppId) {
      throw new Error(`Application failed for Account ${i}`);
    }

    // Admin Process Application to Completed with Teletalk ID
    const teleTalkUserId = `TT2026USR${1000 + i}`;
    const statusRes = await fetch(`${BASE_URL}/api/applications/${createdAppId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        status: 'completed',
        verificationType: 'officially_verified',
        teleTalkTrackingId: teleTalkUserId,
        applicantCopyPdfUrl: `https://storage.chakrisheba.com/applicant-copies/app_${createdAppId}.pdf`,
        notes: `টেলিটক অলজবসে ফরম পূরণ সম্পন্ন। ইউজার আইডি: ${teleTalkUserId}। অ্যাপ্লিক্যান্ট কপি সংযুক্ত।`
      })
    });
    if (!statusRes.ok) throw new Error(`Status update failed for App ${createdAppId}`);

    // Admin to Candidate Notification
    await fetch(`${BASE_URL}/api/admin/notifications/send`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        candidateId: candidateId,
        recipientPhone: phone,
        title: `অভিনন্দন ${candidateNameBn}! আবেদন সফল হয়েছে`,
        message: `আপনার পদের আবেদনপত্রটি (${createdAppId}) সফলভাবে দাখিল করা হয়েছে। আপনার টেলিটক ইউজার আইডি: ${teleTalkUserId}।`,
        channel: 'in_app'
      })
    });

    // Candidate retrieves and marks notifications read
    const notifsRes = await fetch(`${BASE_URL}/api/candidate/notifications`, { headers: userHeaders });
    const notifsData = await notifsRes.json();
    if (notifsData.notifications && notifsData.notifications.length > 0) {
      await fetch(`${BASE_URL}/api/candidate/notifications`, {
        method: 'PATCH',
        headers: userHeaders,
        body: JSON.stringify({ all: true })
      });
    }

    totalSuccessful++;
    console.log(`  -> ✅ Account ${i} verified: Reg, Profile, Admin Verified, App ${createdAppId} (Done), Notifs Flowed.\n`);
  }

  console.log('========================================================================');
  console.log(`🏆 SUCCESSFULLY PROCESSED & AUDITED ALL ACCOUNTS 21 TO 100! Total: ${totalSuccessful}`);
  console.log('========================================================================\n');
}

runExpandedAccountsLifecycle().catch((err) => {
  console.error('Fatal Expanded Lifecycle Error:', err);
  process.exit(1);
});

