import type { CandidateProfile } from './types';

export const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="100%" height="100%" fill="%23f1f5f9"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

export const DEFAULT_SIGNATURE_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect width="200" height="60" fill="%23f8fafc" rx="6"/><text x="100" y="35" font-family="sans-serif" font-size="12" fill="%2394a3b8" text-anchor="middle">স্বাক্ষর যুক্ত করুন</text></svg>';

export const emptyCandidateProfile: CandidateProfile = {
  id: '', name: '', nameBn: '', fatherName: '', motherName: '',
  email: '', phone: '', username: '', dob: '', gender: 'male', nid: '',
  division: '', district: '', address: '', permanentAddress: '',
  photoUrl: DEFAULT_AVATAR_PLACEHOLDER, signatureUrl: DEFAULT_SIGNATURE_PLACEHOLDER, walletBalance: 0,
  maritalStatus: 'single', quota: 'none', education: []
};
