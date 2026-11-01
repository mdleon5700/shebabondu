import type { CandidateProfile } from './types';

export const emptyCandidateProfile: CandidateProfile = {
  id: '', name: '', nameBn: '', fatherName: '', motherName: '',
  email: '', phone: '', username: '', dob: '', gender: 'male', nid: '',
  division: '', district: '', address: '', permanentAddress: '',
  photoUrl: '', signatureUrl: '', walletBalance: 0,
  maritalStatus: 'single', quota: 'none', education: []
};
