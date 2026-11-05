import { JobCircular, CandidateProfile, ApplicationRequest } from '@/lib/types';

export const mockJobs: JobCircular[] = [];

export const mockUserProfile: CandidateProfile = {
  id: 'USR-01712345678',
  name: 'Md. Tanvir Hossain',
  nameBn: 'মোঃ তানভীর হাসান',
  fatherName: 'Md. Rafiqul Islam',
  motherName: 'Nasima Begum',
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

export const mockApplications: ApplicationRequest[] = [];
