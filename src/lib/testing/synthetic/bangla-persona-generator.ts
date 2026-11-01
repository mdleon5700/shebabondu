// High-Fidelity Nationwide Demographic Persona Modeling Engine
// Generates 1,280 realistic Bangladeshi Job Seeker Personas across all 64 districts
// Strict 20-Slot Persona Distribution matching Section 5 specifications

import { BD_64_DISTRICTS, DistrictInfo } from './bangladesh-geography';
import { CandidateProfile, EducationRecord, ExperienceRecord } from '../../types';
import { CareerPreferences } from '../../matching/types';
import { hashPassword } from '../../auth';

export interface SyntheticPersona extends CandidateProfile {
  isSynthetic: true;
  testDataVersion: string;
  role: 'candidate';
  createdAt: string;
  updatedAt: string;
  districtCode: string;
  archetype: 'fresh_graduate' | 'experienced_pro' | 'govt_aspirant' | 'diploma_tech' | 'madrasah_fazil' | 'underprivileged_entry';
  testPasswordPlain: string;
  slotIndex: number;
  profileCategory: 'jsc_jdc' | 'ssc_dakhil' | 'hsc_alim' | 'diploma' | 'honours_bachelor' | 'degree_graduate' | 'masters' | 'experienced' | 'incomplete_special';
}

const MALE_NAMES = [
  { enFirst: 'Tanvir', bnFirst: 'তানভীর', enLast: 'Rahman', bnLast: 'রহমান' },
  { enFirst: 'Arifur', bnFirst: 'আরিফুর', enLast: 'Islam', bnLast: 'ইসলাম' },
  { enFirst: 'Shahriar', bnFirst: 'শাহরিয়ার', enLast: 'Hasan', bnLast: 'হাসান' },
  { enFirst: 'Rakibul', bnFirst: 'রাকিবুল', enLast: 'Hossain', bnLast: 'হোসেন' },
  { enFirst: 'Mehedi', bnFirst: 'মেহেদী', enLast: 'Hasan', bnLast: 'হাসান' },
  { enFirst: 'Ashiqur', bnFirst: 'আশিকুর', enLast: 'Haque', bnLast: 'হক' },
  { enFirst: 'Mahmudul', bnFirst: 'মাহমুদুল', enLast: 'Kabir', bnLast: 'কবীর' },
  { enFirst: 'Sazzad', bnFirst: 'সাজ্জাদ', enLast: 'Ahmed', bnLast: 'আহমেদ' },
  { enFirst: 'Abdullah', bnFirst: 'আব্দুল্লাহ', enLast: 'Al-Mamun', bnLast: 'আল-মামুন' },
  { enFirst: 'Nazmul', bnFirst: 'নাজমুল', enLast: 'Huda', bnLast: 'হুদা' },
  { enFirst: 'Kamrul', bnFirst: 'কামরুল', enLast: 'Islam', bnLast: 'ইসলাম' },
  { enFirst: 'Faisal', bnFirst: 'ফয়সাল', enLast: 'Ahmed', bnLast: 'আহমেদ' },
  { enFirst: 'Imtiaz', bnFirst: 'ইমতিয়াজ', enLast: 'Mahmud', bnLast: 'মাহমুদ' },
  { enFirst: 'Monirul', bnFirst: 'মনিরুল', enLast: 'Islam', bnLast: 'ইসলাম' },
  { enFirst: 'Biplob', bnFirst: 'বিপ্লব', enLast: 'Chakma', bnLast: 'চাকমা' }
];

const FEMALE_NAMES = [
  { enFirst: 'Nusrat', bnFirst: 'নুসরাত', enLast: 'Jahan', bnLast: 'জাহান' },
  { enFirst: 'Farhana', bnFirst: 'ফারহানা', enLast: 'Akter', bnLast: 'আক্তার' },
  { enFirst: 'Sumaiya', bnFirst: 'সুমাইয়া', enLast: 'Islam', bnLast: 'ইসলাম' },
  { enFirst: 'Sadia', bnFirst: 'সাদিয়া', enLast: 'Sultana', bnLast: 'সুলতানা' },
  { enFirst: 'Jannatul', bnFirst: 'জান্নাতুল', enLast: 'Ferdous', bnLast: 'ফেরদৌস' },
  { enFirst: 'Sharmin', bnFirst: 'শারমিন', enLast: 'Khatun', bnLast: 'খাতুন' },
  { enFirst: 'Fatema', bnFirst: 'ফাতেমা', enLast: 'Zohra', bnLast: 'জোহরা' },
  { enFirst: 'Tasnim', bnFirst: 'তাসনিম', enLast: 'Rahman', bnLast: 'রহমান' },
  { enFirst: 'Marzia', bnFirst: 'মারজিয়া', enLast: 'Yasmin', bnLast: 'ইয়াসমিন' },
  { enFirst: 'Sabina', bnFirst: 'সাবিনা', enLast: 'Yesmin', bnLast: 'ইয়াসমিন' },
  { enFirst: 'Ananya', bnFirst: 'অনন্যা', enLast: 'Roy', bnLast: 'রায়' },
  { enFirst: 'Moumita', bnFirst: 'মৌমিত', enLast: 'Das', bnLast: 'দাস' },
  { enFirst: 'Sangita', bnFirst: 'সঙ্গীতা', enLast: 'Marma', bnLast: 'মারমা' }
];

const PARENT_NAMES = [
  { father: 'Md. Rafiqul Islam', mother: 'Begum Rokeya' },
  { father: 'Md. Abdul Karim', mother: 'Morium Begum' },
  { father: 'Ashutosh Das', mother: 'Shova Rani Das' },
  { father: 'Shah Alam Chowdhury', mother: 'Nasima Begum' },
  { father: 'Khurshid Alam', mother: 'Fatema Khatun' }
];

export class BanglaPersonaGenerator {
  private static DEFAULT_PASSWORD = 'SynthPass2026!';
  private static cachedHash: string | null = null;

  private static getPasswordHash(): string {
    if (!this.cachedHash) {
      this.cachedHash = hashPassword(this.DEFAULT_PASSWORD);
    }
    return this.cachedHash;
  }

  static generateNationwidePersonas(personasPerDistrict = 20): SyntheticPersona[] {
    const personas: SyntheticPersona[] = [];
    const usedPhones = new Set<string>();
    let phoneSeq = 100000;

    for (const district of BD_64_DISTRICTS) {
      const distCode = district.id.replace('DIST-', '').replace(/[^A-Z]/g, '');

      for (let slot = 1; slot <= personasPerDistrict; slot++) {
        phoneSeq++;
        const isFemale = slot % 2 === 0;
        const gender: 'male' | 'female' = isFemale ? 'female' : 'male';
        const phone = `01889${String(phoneSeq).slice(-6)}`;
        usedPhones.add(phone);

        // Name generation
        const nameData = isFemale
          ? FEMALE_NAMES[(slot + district.en.length) % FEMALE_NAMES.length]
          : MALE_NAMES[(slot + district.en.length) % MALE_NAMES.length];
        
        const prefixEn = isFemale ? 'Mst. ' : (slot % 3 === 0 ? 'Md. ' : 'Mohammad ');
        const prefixBn = isFemale ? 'মোসাঃ ' : (slot % 3 === 0 ? 'মোঃ ' : 'মুহাম্মদ ');

        const nameEn = `${prefixEn}${nameData.enFirst} ${nameData.enLast}`;
        const nameBn = `${prefixBn}${nameData.bnFirst} ${nameData.bnLast}`;

        const parents = PARENT_NAMES[(slot + district.bn.length) % PARENT_NAMES.length];
        const upazila = district.upazilas[slot % district.upazilas.length] || 'Sadar';
        const birthYear = 2026 - (19 + (slot % 12));
        const dob = `${birthYear}-0${(slot % 9) + 1}-15`;

        // Quota distribution
        let quota: 'none' | 'freedom_fighter' | 'disabled' | 'ethnic_minority' | 'ansar' = 'none';
        if (slot === 5) quota = 'freedom_fighter';
        else if (slot === 11 && (district.en === 'RANGAMATI' || district.en === 'BANDARBAN' || district.en === 'KHAGRACHARI')) quota = 'ethnic_minority';
        else if (slot === 15) quota = 'ansar';
        else if (slot === 19) quota = 'disabled';

        const education: EducationRecord[] = [];
        const experiences: ExperienceRecord[] = [];
        let completionPct = 90;
        let archetype: SyntheticPersona['archetype'] = 'fresh_graduate';
        let profileCategory: SyntheticPersona['profileCategory'] = 'honours_bachelor';

        switch (slot) {
          case 1:
            profileCategory = 'jsc_jdc';
            archetype = 'underprivileged_entry';
            completionPct = 85;
            education.push({
              id: `edu_jsc_${birthYear}`,
              level: 'JSC',
              degree: 'Junior School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 14),
              result: '4.50',
              resultType: 'GPA',
              majorSubject: 'General',
              institutionName: `${district.en} Model High School`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 2:
            profileCategory = 'jsc_jdc';
            archetype = 'madrasah_fazil';
            completionPct = 85;
            education.push({
              id: `edu_jdc_${birthYear}`,
              level: 'JDC',
              degree: 'Junior Dakhil Certificate',
              boardOrUni: 'Madrasah Board',
              year: String(birthYear + 14),
              result: '4.75',
              resultType: 'GPA',
              majorSubject: 'General',
              institutionName: `${district.en} Dakhil Madrasah`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 3:
            profileCategory = 'ssc_dakhil';
            archetype = 'govt_aspirant';
            completionPct = 90;
            education.push({
              id: `edu_jsc_${birthYear}`,
              level: 'JSC',
              degree: 'Junior School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 14),
              result: '4.80',
              resultType: 'GPA',
              majorSubject: 'General',
              institutionName: `${district.en} Model High School`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_ssc_${birthYear}`,
              level: 'SSC',
              degree: 'Secondary School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 16),
              result: '4.85',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. High School`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 4:
            profileCategory = 'ssc_dakhil';
            archetype = 'madrasah_fazil';
            completionPct = 90;
            education.push({
              id: `edu_jdc_${birthYear}`,
              level: 'JDC',
              degree: 'Junior Dakhil Certificate',
              boardOrUni: 'Madrasah Board',
              year: String(birthYear + 14),
              result: '4.90',
              resultType: 'GPA',
              majorSubject: 'General',
              institutionName: `${district.en} Dakhil Madrasah`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_dakhil_${birthYear}`,
              level: 'Dakhil',
              degree: 'Dakhil Examination',
              boardOrUni: 'Madrasah Board',
              year: String(birthYear + 16),
              result: '4.95',
              resultType: 'GPA',
              majorSubject: 'General',
              institutionName: `${district.en} Senior Model Madrasah`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 5:
            profileCategory = 'hsc_alim';
            archetype = 'govt_aspirant';
            completionPct = 90;
            education.push({
              id: `edu_ssc_${birthYear}`,
              level: 'SSC',
              degree: 'Secondary School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 16),
              result: '4.70',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. High School`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_hsc_${birthYear}`,
              level: 'HSC',
              degree: 'Higher Secondary Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 18),
              result: '4.65',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. College`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 6:
            profileCategory = 'hsc_alim';
            archetype = 'madrasah_fazil';
            completionPct = 90;
            education.push({
              id: `edu_dakhil_${birthYear}`,
              level: 'Dakhil',
              degree: 'Dakhil Examination',
              boardOrUni: 'Madrasah Board',
              year: String(birthYear + 16),
              result: '4.80',
              resultType: 'GPA',
              majorSubject: 'General',
              institutionName: `${district.en} Senior Model Madrasah`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_alim_${birthYear}`,
              level: 'Alim',
              degree: 'Alim Certificate',
              boardOrUni: 'Madrasah Board',
              year: String(birthYear + 18),
              result: '4.85',
              resultType: 'GPA',
              majorSubject: 'General',
              institutionName: `${district.en} Kamil Madrasah`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 7:
          case 8:
            profileCategory = 'diploma';
            archetype = 'diploma_tech';
            completionPct = 95;
            education.push({
              id: `edu_ssc_${birthYear}`,
              level: 'SSC',
              degree: 'Secondary School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 16),
              result: '4.50',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. High School`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_dip_${birthYear}`,
              level: 'Diploma',
              degree: slot === 7 ? 'Diploma in Civil Engineering' : 'Diploma in Computer Technology',
              boardOrUni: 'BTEB (Technical Board)',
              year: String(birthYear + 20),
              result: '3.65',
              resultType: 'CGPA',
              majorSubject: slot === 7 ? 'Civil Engineering' : 'Computer Technology',
              institutionName: `${district.en} Polytechnic Institute`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 9:
          case 10:
          case 11:
          case 12:
            profileCategory = 'honours_bachelor';
            archetype = 'fresh_graduate';
            completionPct = 100;
            education.push({
              id: `edu_ssc_${birthYear}`,
              level: 'SSC',
              degree: 'Secondary School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 16),
              result: '4.90',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. High School`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_hsc_${birthYear}`,
              level: 'HSC',
              degree: 'Higher Secondary Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 18),
              result: '4.80',
              resultType: 'GPA',
              majorSubject: slot === 10 ? 'Business Studies' : 'Science',
              institutionName: `${district.en} Govt. College`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_hon_${birthYear}`,
              level: 'Honours',
              degree: slot === 9 ? 'B.Sc in Computer Science & Engineering' :
                      slot === 10 ? 'BBA in Accounting & Information Systems' :
                      slot === 11 ? 'B.A (Honours) in English Literature' : 'B.S.S in Economics',
              boardOrUni: district.divisionEn === 'DHAKA' ? 'University of Dhaka' : `${district.divisionBn} University`,
              year: String(birthYear + 22),
              result: '3.70',
              resultType: 'CGPA',
              majorSubject: slot === 9 ? 'CSE' : slot === 10 ? 'Accounting' : slot === 11 ? 'English' : 'Economics',
              institutionName: `${district.en} University Campus`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 13:
          case 14:
            profileCategory = 'degree_graduate';
            archetype = 'fresh_graduate';
            completionPct = 90;
            education.push({
              id: `edu_ssc_${birthYear}`,
              level: 'SSC',
              degree: 'Secondary School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 16),
              result: '4.20',
              resultType: 'GPA',
              majorSubject: 'Humanities',
              institutionName: `${district.en} High School`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_hsc_${birthYear}`,
              level: 'HSC',
              degree: 'Higher Secondary Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 18),
              result: '4.00',
              resultType: 'GPA',
              majorSubject: slot === 13 ? 'Humanities' : 'Commerce',
              institutionName: `${district.en} Degree College`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_deg_${birthYear}`,
              level: 'Degree',
              degree: slot === 13 ? 'Bachelor of Arts (B.A Pass)' : 'Bachelor of Commerce (B.Com Pass)',
              boardOrUni: 'National University',
              year: String(birthYear + 21),
              result: 'First Class',
              resultType: 'CLASS',
              majorSubject: slot === 13 ? 'Arts & Social Studies' : 'Commerce & Management',
              institutionName: `${district.en} Central Degree College`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 15:
          case 16:
            profileCategory = 'masters';
            archetype = slot === 15 ? 'govt_aspirant' : 'madrasah_fazil';
            completionPct = 100;
            education.push({
              id: `edu_ssc_${birthYear}`,
              level: 'SSC',
              degree: 'Secondary School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 16),
              result: '5.00',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. High School`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_hsc_${birthYear}`,
              level: 'HSC',
              degree: 'Higher Secondary Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 18),
              result: '5.00',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. College`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_hon_${birthYear}`,
              level: 'Honours',
              degree: slot === 15 ? 'B.Sc (Honours) in Applied Mathematics' : 'Fazil (Honours) in Islamic Studies',
              boardOrUni: slot === 15 ? 'University of Dhaka' : 'Islamic Arabic University',
              year: String(birthYear + 22),
              result: '3.85',
              resultType: 'CGPA',
              majorSubject: slot === 15 ? 'Applied Mathematics' : 'Hadith & Islamic Law',
              institutionName: `${district.en} Govt. University Campus`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_mst_${birthYear}`,
              level: 'Masters',
              degree: slot === 15 ? 'M.Sc in Applied Mathematics' : 'Kamil (Master of Arts Equivalent)',
              boardOrUni: slot === 15 ? 'University of Dhaka' : 'Islamic Arabic University',
              year: String(birthYear + 23),
              result: '3.88',
              resultType: 'CGPA',
              majorSubject: slot === 15 ? 'Applied Mathematics' : 'Islamic Jurisprudence',
              institutionName: `${district.en} Postgraduate Institute`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 17:
          case 18:
            profileCategory = 'experienced';
            archetype = 'experienced_pro';
            completionPct = 100;
            education.push({
              id: `edu_ssc_${birthYear}`,
              level: 'SSC',
              degree: 'Secondary School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 16),
              result: '4.80',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. High School`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_hsc_${birthYear}`,
              level: 'HSC',
              degree: 'Higher Secondary Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 18),
              result: '4.75',
              resultType: 'GPA',
              majorSubject: 'Science',
              institutionName: `${district.en} Govt. College`,
              academicStatus: 'COMPLETED'
            });
            education.push({
              id: `edu_hon_${birthYear}`,
              level: 'Honours',
              degree: slot === 17 ? 'BBA in Finance & Banking' : 'B.Sc in Software Engineering',
              boardOrUni: 'University of Dhaka',
              year: String(birthYear + 22),
              result: '3.65',
              resultType: 'CGPA',
              majorSubject: slot === 17 ? 'Finance' : 'Software Engineering',
              institutionName: `${district.en} University Campus`,
              academicStatus: 'COMPLETED'
            });

            experiences.push({
              id: `exp_1_${distCode}_${slot}`,
              designation: slot === 17 ? 'Junior Credit Officer' : 'Junior Software Developer',
              organization: slot === 17 ? 'City Bank PLC' : 'Brain Station 23',
              startDate: '2021-01-01',
              endDate: '2023-03-31',
              isCurrent: false,
              responsibilities: slot === 17 ? 'Customer credit appraisal and SME loan file verification' : 'Frontend UI development with React and TypeScript'
            });
            experiences.push({
              id: `exp_2_${distCode}_${slot}`,
              designation: slot === 17 ? 'Senior Officer' : 'Lead Software Engineer',
              organization: slot === 17 ? 'BRAC Bank PLC' : 'Enosis Solutions',
              startDate: '2023-04-01',
              endDate: '',
              isCurrent: true,
              responsibilities: slot === 17 ? 'Branch SME portfolio management and corporate risk compliance' : 'Full-stack application architecture and team mentorship'
            });
            break;

          case 19:
            profileCategory = 'incomplete_special';
            archetype = 'underprivileged_entry';
            completionPct = 35;
            education.push({
              id: `edu_hsc_${birthYear}`,
              level: 'HSC',
              degree: 'Higher Secondary Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 18),
              result: '3.90',
              resultType: 'GPA',
              majorSubject: 'Humanities',
              institutionName: `${district.en} College`,
              academicStatus: 'COMPLETED'
            });
            break;

          case 20:
            profileCategory = 'incomplete_special';
            archetype = 'underprivileged_entry';
            completionPct = 45;
            education.push({
              id: `edu_ssc_${birthYear}`,
              level: 'SSC',
              degree: 'Secondary School Certificate',
              boardOrUni: `${district.divisionBn} Board`,
              year: String(birthYear + 16),
              result: '4.10',
              resultType: 'GPA',
              majorSubject: 'Humanities',
              institutionName: `${district.en} High School`,
              academicStatus: 'COMPLETED'
            });
            break;
        }

        const careerPreferences: CareerPreferences = {
          preferredCategories: slot <= 6 ? ['government-jobs', 'part-time-jobs'] :
                               slot <= 8 ? ['engineering-jobs', 'it-jobs', 'government-jobs'] :
                               slot <= 12 ? ['bank-jobs', 'it-jobs', 'accounting-finance-jobs', 'government-jobs'] :
                               slot <= 16 ? ['government-jobs', 'bank-jobs', 'teacher-jobs', 'ngo-jobs'] :
                               ['bank-jobs', 'it-jobs', 'engineering-jobs'],
          preferredOrgTypes: ['government', 'bank', 'private_company'],
          preferredJobTitles: ['Officer', 'Assistant', 'Specialist'],
          preferredEmploymentTypes: ['full_time', 'govt'],
          preferredDivisions: [district.divisionBn],
          preferredDistricts: [district.bn],
          remotePreference: slot === 18 || slot === 19 ? 'remote' : 'onsite',
          preferredSalaryMin: slot <= 4 ? 12000 : slot <= 8 ? 20000 : slot <= 16 ? 30000 : 50000,
          preferredSalaryMax: slot <= 4 ? 20000 : slot <= 8 ? 35000 : slot <= 16 ? 60000 : 120000,
          preferredExperienceLevel: slot >= 17 ? 'mid' : 'fresher'
        };

        const personaId = `SYNTH-USR-${distCode}-${String(slot).padStart(3, '0')}`;
        const email = `synth.${nameData.enFirst.toLowerCase()}.${nameData.enLast.toLowerCase()}.${distCode.toLowerCase()}${slot}@chakrisheba.local`;

        const persona: SyntheticPersona = {
          id: personaId,
          name: nameEn,
          nameBn: nameBn,
          fatherName: parents.father,
          motherName: parents.mother,
          email,
          phone,
          username: `synth_${distCode.toLowerCase()}_${slot}`,
          dob,
          gender,
          nid: `${birthYear}${String(phoneSeq).slice(-6)}${String(slot * 11).slice(-3)}`,
          division: district.divisionBn,
          district: district.bn,
          address: `${upazila}, ${district.bn}`,
          permanentAddress: `${upazila}, ${district.bn}`,
          photoUrl: '/images/avatar-placeholder.png',
          signatureUrl: '/images/signature-placeholder.png',
          presentAddressDetails: {
            villageRoad: `${upazila} Road`,
            district: district.bn,
            upazilaThana: upazila,
            postOffice: upazila,
            postCode: district.postalCode
          },
          permanentAddressDetails: {
            villageRoad: `${upazila} Village`,
            district: district.bn,
            upazilaThana: upazila,
            postOffice: upazila,
            postCode: district.postalCode
          },
          sameAsPresentAddress: true,
          education,
          experiences,
          skills: slot <= 2 ? ['Bangla Reading', 'Office Assistance'] :
                  slot <= 6 ? ['Data Entry', 'Computer Basics', 'MS Office'] :
                  slot <= 8 ? ['AutoCAD', 'Technical Drafting', 'Site Inspection'] :
                  slot <= 12 ? ['Financial Analysis', 'Communication', 'Python', 'MS Excel'] :
                  slot <= 16 ? ['Research Methodology', 'Data Modeling', 'Academic Writing'] :
                  ['Leadership', 'Client Relationship', 'Strategic Risk Management'],
          quota,
          walletBalance: 100,
          accountStatus: 'active',
          isVerified: true,
          profileCompletionPercentage: completionPct,
          careerObjective: `Seeking challenging employment opportunities in ${district.bn} or national level in aligned professional fields.`,
          professionalSummary: `${profileCategory.toUpperCase()} with solid academic background from ${district.bn} and practical execution abilities.`,
          careerPreferences,
          passwordHash: this.getPasswordHash(),
          role: 'candidate',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSynthetic: true,
          testDataVersion: '2.0',
          districtCode: distCode,
          archetype,
          testPasswordPlain: this.DEFAULT_PASSWORD,
          slotIndex: slot,
          profileCategory
        };

        personas.push(persona);
      }
    }

    return personas;
  }
}
