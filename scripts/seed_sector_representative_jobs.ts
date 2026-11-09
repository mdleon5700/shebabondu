import { serverDB } from '../src/lib/db';
import { JobCircular } from '../src/lib/types';

const representativeJobs: Partial<JobCircular>[] = [
  {
    id: 'job-boesl-overseas-2026',
    title: 'জর্ডান ও দক্ষিণ কোরিয়ায় সরকারি খরচে টেকনিক্যাল কর্মী নিয়োগ বিজ্ঞপ্তি ২০২৬',
    organization: 'বাংলাদেশ ওভারসিজ এমপ্লয়মেন্ট অ্যান্ড সার্ভিসেস লিমিটেড (বোয়েসেল - BOESL)',
    category: 'international',
    categoryLabel: 'প্রবাসী ও আন্তর্জাতিক চাকরি',
    grade: 'আন্তর্জাতিক চুক্তিভিত্তিক',
    totalPosts: 450,
    salary: '১,২০,০০০ - ২,৫০,০০০ টাকা',
    minEducation: 'ডিপ্লোমা / কারিগরি ট্রেড কোর্স পাস',
    minAge: 20,
    maxAge: 38,
    districts: 'সকল জেলা (বৈদেশিক কর্মসংস্থান)',
    deadline: '৩০ ডিসেম্বর ২০২৬',
    daysRemaining: 51,
    govtFee: 500,
    serviceFee: 150,
    publishedDate: '০৮ নভেম্বর ২০২৬',
    officialLink: 'http://boesl.gov.bd',
    verifiedBy: 'ADMIN_CHAKRI_SHEBA',
    featured: true,
    status: 'ACTIVE',
    eligibility: 'কারিগরি প্রশিক্ষণ কেন্দ্র (TTC) হতে সনদ এবং ন্যূনতম ২ বছরের কাজের অভিজ্ঞতা থাকতে হবে। বিএমইটি স্মার্ট কার্ড থাকা আবশ্যক।',
    positions: [
      {
        title: 'টেকনিক্যাল অপারেটর ও টেকনিশিয়ান (গার্মেন্টস ও ইন্ডাস্ট্রিয়াল)',
        grade: 'চুক্তিভিত্তিক',
        posts: 300,
        salary: '১,২০,০০০ - ১,৫০,০০০ টাকা',
        minEducation: 'ভোকেশনাল / ডিপ্লোমা',
        experience: '২ বছর'
      },
      {
        title: 'ইন্ডাস্ট্রিয়াল ওয়েল্ডার ও মেকানিক (দক্ষিণ কোরিয়া EPS)',
        grade: 'দক্ষ শ্রমিক',
        posts: 150,
        salary: '২,০০,০০০ - ২,৫০,০০০ টাকা',
        minEducation: 'কারিগরি ট্রেড পাস',
        experience: '৩ বছর'
      }
    ]
  },
  {
    id: 'job-bb-ad-officer-2026',
    title: 'সহকারী পরিচালক (AD - সাধারণ) পদে সরাসরি নিয়োগ বিজ্ঞপ্তি ২০২৬',
    organization: 'বাংলাদেশ ব্যাংক (কেন্দ্রীয় ব্যাংক ও বিএসসিএস)',
    category: 'bank',
    categoryLabel: 'ব্যাংক চাকরি',
    grade: '৯ম গ্রেড',
    totalPosts: 120,
    salary: '২২,০০০ - ৫৩,০৬০ টাকা',
    minEducation: 'স্নাতক (সম্মান) বা স্নাতকোত্তর ডিগ্রি',
    minAge: 21,
    maxAge: 32,
    districts: 'সকল জেলা',
    deadline: '১৫ ডিসেম্বর ২০২৬',
    daysRemaining: 36,
    govtFee: 200,
    serviceFee: 80,
    publishedDate: '০৬ নভেম্বর ২০২৬',
    officialLink: 'https://erecruitment.bb.org.bd',
    verifiedBy: 'ADMIN_CHAKRI_SHEBA',
    featured: true,
    status: 'ACTIVE',
    eligibility: 'স্বীকৃত বিশ্ববিদ্যালয় হতে যেকোনো বিষয়ে ন্যূনতম দ্বিতীয় শ্রেণি বা সমমানের সিজিপিএসহ ৪ বছর মেয়াদি স্নাতক বা স্নাতকোত্তর ডিগ্রি।',
    positions: [
      {
        title: 'সহকারী পরিচালক (সাধারণ শাখা)',
        grade: '৯ম গ্রেড',
        posts: 120,
        salary: '২২,০০০ - ৫৩,০৬০ টাকা',
        minEducation: 'স্নাতক বা স্নাতকোত্তর',
        experience: 'অভিজ্ঞতা প্রয়োজন নেই'
      }
    ]
  },
  {
    id: 'job-dpe-teacher-2026',
    title: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ বিজ্ঞপ্তি ২০২৬',
    organization: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    category: 'teacher',
    categoryLabel: 'শিক্ষক নিয়োগ',
    grade: '১৩তম গ্রেড',
    totalPosts: 2500,
    salary: '১১,০০০ - ২৬,৫৯০ টাকা',
    minEducation: 'স্নাতক (পাস) বা ডিগ্রি সমমান',
    minAge: 21,
    maxAge: 32,
    districts: 'সকল জেলা',
    deadline: '২০ ডিসেম্বর ২০২৬',
    daysRemaining: 41,
    govtFee: 200,
    serviceFee: 80,
    publishedDate: '০৫ নভেম্বর ২০২৬',
    officialLink: 'http://dpe.teletalk.com.bd',
    verifiedBy: 'ADMIN_CHAKRI_SHEBA',
    featured: true,
    status: 'ACTIVE',
    eligibility: 'যেকোনো স্বীকৃত বিশ্ববিদ্যালয় হতে ন্যূনতম দ্বিতীয় শ্রেণি বা সমমানের সিজিপিএসহ স্নাতক বা ডিগ্রি পাস।',
    positions: [
      {
        title: 'সহকারী শিক্ষক (সাধারণ ও সঙ্গীত/শারীরিক শিক্ষা)',
        grade: '১৩তম গ্রেড',
        posts: 2500,
        salary: '১১,০০০ - ২৬,৫৯০ টাকা',
        minEducation: 'স্নাতক সমমান',
        experience: 'প্রয়োজন নেই'
      }
    ]
  },
  {
    id: 'job-brac-ngo-2026',
    title: 'সিনিয়র প্রোগ্রাম অফিসার (ফিল্ড অপারেশনস) পদে নিয়োগ ২০২৬',
    organization: 'ব্র্যাক (BRAC Bangladesh)',
    category: 'ngo',
    categoryLabel: 'এনজিও ক্যারিয়ার',
    grade: 'কর্পোরেট গ্রেড',
    totalPosts: 35,
    salary: '৪৫,০০০ - ৬৫,০০০ টাকা',
    minEducation: 'স্নাতক বা স্নাতকোত্তর ডিগ্রি',
    minAge: 23,
    maxAge: 38,
    districts: 'ঢাকা, চট্টগ্রাম, রাজশাহী ও রংপুর বিভাগ',
    deadline: '১০ ডিসেম্বর ২০২৬',
    daysRemaining: 31,
    govtFee: 0,
    serviceFee: 100,
    publishedDate: '০৭ নভেম্বর ২০২৬',
    officialLink: 'https://careers.brac.net',
    verifiedBy: 'ADMIN_CHAKRI_SHEBA',
    featured: true,
    status: 'ACTIVE',
    eligibility: 'সমাজবিজ্ঞান, অর্থনীতি বা ডেভেলপমেন্ট স্টাডিজে স্নাতক/মাস্টার্স। মাঠপর্যায়ে প্রজেক্ট মনিটরিংয়ে ২ বছরের অভিজ্ঞতা।',
    positions: [
      {
        title: 'সিনিয়র প্রোগ্রাম অফিসার (মাইক্রোফাইন্যান্স ও জীবিকা)',
        grade: 'অফিসার',
        posts: 35,
        salary: '৪৫,০০০ - ৬৫,০০০ টাকা',
        minEducation: 'স্নাতকোত্তর',
        experience: '২ বছর'
      }
    ]
  },
  {
    id: 'job-square-marketing-2026',
    title: 'টেরিটরি সেলস ম্যানেজার ও ব্র্যান্ড এক্সিকিউটিভ পদে নিয়োগ ২০২৬',
    organization: 'স্কয়ার টয়লেট্রিজ লিমিটেড (Square Group)',
    category: 'private',
    categoryLabel: 'মার্কেটিং ও সেলস',
    grade: 'অফিসার গ্রেড',
    totalPosts: 20,
    salary: '৩৫,০০০ - ৫৫,০০০ টাকা',
    minEducation: 'বিবিএ / যেকোনো বিষয়ে স্নাতক',
    minAge: 22,
    maxAge: 32,
    districts: 'সকল বিভাগীয় শহর',
    deadline: '১৮ ডিসেম্বর ২০২৬',
    daysRemaining: 39,
    govtFee: 0,
    serviceFee: 100,
    publishedDate: '০৬ নভেম্বর ২০২৬',
    officialLink: 'https://squaretoiletries.com/career',
    verifiedBy: 'ADMIN_CHAKRI_SHEBA',
    featured: true,
    status: 'ACTIVE',
    eligibility: 'এফএমসিজি (FMCG) বা কর্পোরেট সেলস ও ডিস্ট্রিবিউশনে কাজ করার মানসিকতা। চমৎকার যোগাযোগ দক্ষতা।',
    positions: [
      {
        title: 'টেরিটরি সেলস অফিসার (TSO - রিটেইল)',
        grade: 'এক্সিকিউটিভ',
        posts: 15,
        salary: '৩৫,০০০ - ৪৫,০০০ টাকা',
        minEducation: 'স্নাতক',
        experience: '১ বছর (ফ্রেশাররাও আবেদনযোগ্য)'
      },
      {
        title: 'সহকারী ব্র্যান্ড ম্যানেজার (মার্কেটিং কমিউনিকেশন)',
        grade: 'ম্যানেজারিয়াল',
        posts: 5,
        salary: '৪৫,০০০ - ৫৫,০০০ টাকা',
        minEducation: 'বিবিএ / এমবিএ (মার্কেটিং)',
        experience: '২ বছর'
      }
    ]
  }
];

console.log('Seeding representative circulars...');
for (const job of representativeJobs) {
  const saved = serverDB.saveJob(job as any);
  console.log(`Saved: [${saved.id}] ${saved.title} -> ${saved.category} (${saved.categoryLabel})`);
}
console.log('Seeding completed successfully!');
