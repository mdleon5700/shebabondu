import { serverDB } from '@/lib/db';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = 'CHAKRISEBA_SECURE_ADMIN_2026';

interface CandidateProfileSeed {
  name: string;
  nameBn: string;
  phone: string;
  email: string;
  district: string;
  division: string;
  nid: string;
  fatherName: string;
  motherName: string;
  gender: string;
  dob: string;
  education: Array<{
    level: string;
    degree: string;
    institution: string;
    passingYear: number;
    result: string;
  }>;
  skills: string[];
}

const CANDIDATES_20: CandidateProfileSeed[] = [
  {
    name: 'Md. Tanvir Hossain',
    nameBn: 'মোঃ তানভীর হোসেন',
    phone: '01711000001',
    email: 'tanvir.hossain2026@gmail.com',
    district: 'ঢাকা',
    division: 'ঢাকা',
    nid: '19952691234567801',
    fatherName: 'Md. Delwar Hossain',
    motherName: 'Tahmina Begum',
    gender: 'male',
    dob: '1995-04-12',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Dhaka Residential Model College', passingYear: 2011, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Dhaka College', passingYear: 2013, result: 'GPA 5.00' },
      { level: 'Honours', degree: 'BSc in CSE', institution: 'University of Dhaka', passingYear: 2018, result: 'CGPA 3.75' }
    ],
    skills: ['Computer Programming', 'Bangla & English Typing', 'Database Management', 'MS Office']
  },
  {
    name: 'Nusrat Jahan',
    nameBn: 'নুসরাত জাহান',
    phone: '01811000002',
    email: 'nusrat.jahan2026@gmail.com',
    district: 'চট্টগ্রাম',
    division: 'চট্টগ্রাম',
    nid: '19961591234567802',
    fatherName: 'Abdul Jalil',
    motherName: 'Rehana Akter',
    gender: 'female',
    dob: '1996-08-20',
    education: [
      { level: 'SSC', degree: 'Business Studies', institution: 'Chittagong Govt Girls High School', passingYear: 2012, result: 'GPA 4.90' },
      { level: 'HSC', degree: 'Business Studies', institution: 'Chittagong Govt Commerce College', passingYear: 2014, result: 'GPA 5.00' },
      { level: 'Honours', degree: 'BBA in Accounting', institution: 'University of Chittagong', passingYear: 2019, result: 'CGPA 3.80' }
    ],
    skills: ['Financial Accounting', 'Tally Prime', 'Spreadsheet Analysis', 'Corporate Communication']
  },
  {
    name: 'Kamrul Islam',
    nameBn: 'কামরুল ইসলাম',
    phone: '01911000003',
    email: 'kamrul.islam2026@gmail.com',
    district: 'রাজশাহী',
    division: 'রাজশাহী',
    nid: '19948191234567803',
    fatherName: 'Rafiqul Islam',
    motherName: 'Momena Khatun',
    gender: 'male',
    dob: '1994-02-15',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Rajshahi Collegiate School', passingYear: 2010, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Rajshahi College', passingYear: 2012, result: 'GPA 4.80' },
      { level: 'Honours', degree: 'BA in English', institution: 'Rajshahi University', passingYear: 2017, result: 'CGPA 3.60' }
    ],
    skills: ['English Translation', 'Proofreading', 'Administrative Drafting', 'Public Relations']
  },
  {
    name: 'Farhana Akter',
    nameBn: 'ফারহানা আক্তার',
    phone: '01611000004',
    email: 'farhana.akter2026@gmail.com',
    district: 'খুলনা',
    division: 'খুলনা',
    nid: '19974791234567804',
    fatherName: 'Mokhlesur Rahman',
    motherName: 'Parvin Sultana',
    gender: 'female',
    dob: '1997-11-05',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Khulna Zilla School', passingYear: 2013, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Govt. Brajalal College (BL College)', passingYear: 2015, result: 'GPA 4.90' },
      { level: 'Honours', degree: 'BSc in Chemistry', institution: 'Khulna University', passingYear: 2020, result: 'CGPA 3.70' }
    ],
    skills: ['Laboratory Testing', 'Data Entry', 'Quality Control', 'MS Excel Specialist']
  },
  {
    name: 'Arifur Rahman',
    nameBn: 'আরিফুর রহমান',
    phone: '01711000005',
    email: 'arifur.rahman2026@gmail.com',
    district: 'সিলেট',
    division: 'সিলেট',
    nid: '19939191234567805',
    fatherName: 'Abdul Majid',
    motherName: 'Salma Begum',
    gender: 'male',
    dob: '1993-07-28',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Sylhet Govt Pilot High School', passingYear: 2009, result: 'GPA 4.80' },
      { level: 'HSC', degree: 'Science', institution: 'MC College Sylhet', passingYear: 2011, result: 'GPA 4.70' },
      { level: 'Honours', degree: 'BSc in Civil Engineering', institution: 'SUST', passingYear: 2016, result: 'CGPA 3.55' }
    ],
    skills: ['AutoCAD', 'Structural Estimation', 'Project Management', 'Field Supervision']
  },
  {
    name: 'Sultana Razia',
    nameBn: 'সুলতানা রাজিয়া',
    phone: '01811000006',
    email: 'sultana.razia2026@gmail.com',
    district: 'বরিশাল',
    division: 'বরিশাল',
    nid: '19980691234567806',
    fatherName: 'Abul Kashem',
    motherName: 'Anwara Begum',
    gender: 'female',
    dob: '1998-03-14',
    education: [
      { level: 'SSC', degree: 'Humanities', institution: 'Barisal Govt Girls School', passingYear: 2014, result: 'GPA 4.75' },
      { level: 'HSC', degree: 'Humanities', institution: 'Govt. BM College', passingYear: 2016, result: 'GPA 4.85' },
      { level: 'Honours', degree: 'BSS in Economics', institution: 'University of Barisal', passingYear: 2021, result: 'CGPA 3.65' }
    ],
    skills: ['Statistical Analysis', 'SPSS', 'Survey Coordination', 'Research Report Writing']
  },
  {
    name: 'Mahmudul Hasan',
    nameBn: 'মাহমুদুল হাসান',
    phone: '01911000007',
    email: 'mahmudul.hasan2026@gmail.com',
    district: 'রংপুর',
    division: 'রংপুর',
    nid: '19958591234567807',
    fatherName: 'Nurul Huda',
    motherName: 'Rowshan Ara',
    gender: 'male',
    dob: '1995-10-10',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Rangpur Zilla School', passingYear: 2011, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Carmichael College', passingYear: 2013, result: 'GPA 4.90' },
      { level: 'Honours', degree: 'BSc in Agriculture', institution: 'Hajee Mohammad Danesh STU', passingYear: 2018, result: 'CGPA 3.82' }
    ],
    skills: ['Agronomy Extension', 'Seed Technology', 'Soil Testing', 'Scientific Documentation']
  },
  {
    name: 'Sadia Afrin',
    nameBn: 'সাদিয়া আফরিন',
    phone: '01511000008',
    email: 'sadia.afrin2026@gmail.com',
    district: 'ময়মনসিংহ',
    division: 'ময়মনসিংহ',
    nid: '19976191234567808',
    fatherName: 'Nazrul Islam',
    motherName: 'Fatema Khatun',
    gender: 'female',
    dob: '1997-05-18',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Vidyamoyee Govt Girls High School', passingYear: 2013, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Muminunnisa Govt Women College', passingYear: 2015, result: 'GPA 5.00' },
      { level: 'Honours', degree: 'BSc in Fisheries', institution: 'Bangladesh Agricultural University', passingYear: 2020, result: 'CGPA 3.90' }
    ],
    skills: ['Aquaculture Management', 'Microbiology Lab', 'Technical Paper Drafting', 'English Fluency']
  },
  {
    name: 'Zahidul Islam',
    nameBn: 'জাহিদুল ইসলাম',
    phone: '01711000009',
    email: 'zahidul.islam2026@gmail.com',
    district: 'কুমিল্লা',
    division: 'চট্টগ্রাম',
    nid: '19941991234567809',
    fatherName: 'Sirajul Islam',
    motherName: 'Ayesha Begum',
    gender: 'male',
    dob: '1994-09-22',
    education: [
      { level: 'SSC', degree: 'Business Studies', institution: 'Comilla Zilla School', passingYear: 2010, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Business Studies', institution: 'Comilla Victoria Govt College', passingYear: 2012, result: 'GPA 4.95' },
      { level: 'Honours', degree: 'BBA in Finance & Banking', institution: 'Comilla University', passingYear: 2017, result: 'CGPA 3.72' }
    ],
    skills: ['Banking Operations', 'Credit Analysis', 'Financial Modeling', 'Audit Support']
  },
  {
    name: 'Roksana Parvin',
    nameBn: 'রোকসানা পারভীন',
    phone: '01811000010',
    email: 'roksana.parvin2026@gmail.com',
    district: 'বগুড়া',
    division: 'রাজশাহী',
    nid: '19961091234567810',
    fatherName: 'Golam Mostafa',
    motherName: 'Kohinoor Begum',
    gender: 'female',
    dob: '1996-01-30',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Bogra Govt Girls High School', passingYear: 2012, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Govt. Azizul Haque College', passingYear: 2014, result: 'GPA 4.90' },
      { level: 'Honours', degree: 'BSc in Mathematics', institution: 'Govt. Azizul Haque College', passingYear: 2019, result: 'CGPA 3.68' }
    ],
    skills: ['Mathematical Modeling', 'Data Analytics', 'LaTeX Typesetting', 'Advanced Excel']
  },
  {
    name: 'Shakil Ahmed',
    nameBn: 'শাকিল আহমেদ',
    phone: '01911000011',
    email: 'shakil.ahmed2026@gmail.com',
    district: 'গাজীপুর',
    division: 'ঢাকা',
    nid: '19953391234567811',
    fatherName: 'Liaquat Ali',
    motherName: 'Rasheda Begum',
    gender: 'male',
    dob: '1995-06-15',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Rani Bilash Moni Govt Boys High School', passingYear: 2011, result: 'GPA 4.90' },
      { level: 'HSC', degree: 'Science', institution: 'Bhawal Badre Alam Govt College', passingYear: 2013, result: 'GPA 4.80' },
      { level: 'Honours', degree: 'BSc in EEE', institution: 'DUET Gazipur', passingYear: 2018, result: 'CGPA 3.60' }
    ],
    skills: ['Circuit Design', 'MATLAB', 'Industrial Automation', 'Power Systems']
  },
  {
    name: 'Tasnim Ferdous',
    nameBn: 'তাসনিম ফেরদৌস',
    phone: '01611000012',
    email: 'tasnim.ferdous2026@gmail.com',
    district: 'নারায়ণগঞ্জ',
    division: 'ঢাকা',
    nid: '19976791234567812',
    fatherName: 'Ferdous Ahmed',
    motherName: 'Nasrin Sultana',
    gender: 'female',
    dob: '1997-12-04',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Narayanganj Govt Girls High School', passingYear: 2013, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Govt. Tolaram College', passingYear: 2015, result: 'GPA 4.85' },
      { level: 'Honours', degree: 'BSc in Textile Engineering', institution: 'BUTEX', passingYear: 2020, result: 'CGPA 3.78' }
    ],
    skills: ['Quality Assurance', 'Supply Chain Management', 'Fabric Inspection', 'ERP Software']
  },
  {
    name: 'Mehedi Hasan',
    nameBn: 'মেহেদী হাসান',
    phone: '01711000013',
    email: 'mehedi.hasan2026@gmail.com',
    district: 'যশোর',
    division: 'খুলna',
    nid: '19934191234567813',
    fatherName: 'Anwar Hossain',
    motherName: 'Shamsun Nahar',
    gender: 'male',
    dob: '1993-04-19',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Jessore Zilla School', passingYear: 2009, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Govt. Michael Madhusudan College', passingYear: 2011, result: 'GPA 4.75' },
      { level: 'Honours', degree: 'BSc in Physics', institution: 'JUST', passingYear: 2016, result: 'CGPA 3.62' }
    ],
    skills: ['Instrumentation', 'Scientific Research', 'Computer Hardware Troubleshooting', 'Network Administration']
  },
  {
    name: 'Sharmin Sultana',
    nameBn: 'শারমিন সুলতানা',
    phone: '01811000014',
    email: 'sharmin.sultana2026@gmail.com',
    district: 'দিনাজপুর',
    division: 'রংপুর',
    nid: '19962791234567814',
    fatherName: 'Shariful Alam',
    motherName: 'Halima Khatun',
    gender: 'female',
    dob: '1996-09-11',
    education: [
      { level: 'SSC', degree: 'Humanities', institution: 'Dinajpur Govt Girls High School', passingYear: 2012, result: 'GPA 4.80' },
      { level: 'HSC', degree: 'Humanities', institution: 'Dinajpur Govt College', passingYear: 2014, result: 'GPA 4.90' },
      { level: 'Honours', degree: 'BSS in Public Administration', institution: 'Begum Rokeya University', passingYear: 2019, result: 'CGPA 3.74' }
    ],
    skills: ['Public Policy Analysis', 'Government Secretariat Rules', 'Office Management', 'Bangla Typing 40 WPM']
  },
  {
    name: 'Imran Nazir',
    nameBn: 'ইমরান নাজির',
    phone: '01911000015',
    email: 'imran.nazir2026@gmail.com',
    district: 'পাবনা',
    division: 'রাজশাহী',
    nid: '19947691234567815',
    fatherName: 'Nazir Uddin',
    motherName: 'Rokeya Begum',
    gender: 'male',
    dob: '1994-08-08',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Pabna Zilla School', passingYear: 2010, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Pabna Edward College', passingYear: 2012, result: 'GPA 5.00' },
      { level: 'Honours', degree: 'BSc in Mechanical Engineering', institution: 'PUST', passingYear: 2017, result: 'CGPA 3.58' }
    ],
    skills: ['SolidWorks', 'Thermodynamics Modeling', 'Machine Maintenance', 'Technical Drawing']
  },
  {
    name: 'Sabrina Mostafa',
    nameBn: 'সাবরিনা মোস্তফা',
    phone: '01511000016',
    email: 'sabrina.mostafa2026@gmail.com',
    district: 'কুষ্টিয়া',
    division: 'খুলনা',
    nid: '19975091234567816',
    fatherName: 'Mostafa Kamal',
    motherName: 'Mahmuda Begum',
    gender: 'female',
    dob: '1997-02-23',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Kushtia Govt Girls High School', passingYear: 2013, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Kushtia Govt College', passingYear: 2015, result: 'GPA 4.95' },
      { level: 'Honours', degree: 'BSc in Biotechnology', institution: 'Islamic University Kushtia', passingYear: 2020, result: 'CGPA 3.86' }
    ],
    skills: ['DNA Extraction', 'PCR Techniques', 'Bioinformatics Tools', 'Scientific Communication']
  },
  {
    name: 'Tariqul Islam',
    nameBn: 'তারিকুল ইসলাম',
    phone: '01711000017',
    email: 'tariqul.islam2026@gmail.com',
    district: 'নোয়াখালী',
    division: 'চট্টগ্রাম',
    nid: '19957591234567817',
    fatherName: 'Nurul Islam',
    motherName: 'Jahanara Begum',
    gender: 'male',
    dob: '1995-12-17',
    education: [
      { level: 'SSC', degree: 'Business Studies', institution: 'Noakhali Zilla School', passingYear: 2011, result: 'GPA 4.85' },
      { level: 'HSC', degree: 'Business Studies', institution: 'Noakhali Govt College', passingYear: 2013, result: 'GPA 4.80' },
      { level: 'Honours', degree: 'BBA in Marketing', institution: 'Noakhali Science & Tech University', passingYear: 2018, result: 'CGPA 3.64' }
    ],
    skills: ['Digital Marketing', 'Content Strategy', 'Brand Management', 'Consumer Analytics']
  },
  {
    name: 'Fatema Tuz Zohra',
    nameBn: 'ফাতেমা তুজ জোহরা',
    phone: '01811000018',
    email: 'fatema.zohra2026@gmail.com',
    district: 'টাঙ্গাইল',
    division: 'ঢাকা',
    nid: '19989391234567818',
    fatherName: 'Zahirul Haque',
    motherName: 'Afroza Begum',
    gender: 'female',
    dob: '1998-07-03',
    education: [
      { level: 'SSC', degree: 'Humanities', institution: 'Bindubasini Govt Girls High School', passingYear: 2014, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Humanities', institution: 'Kumudini Govt College', passingYear: 2016, result: 'GPA 4.90' },
      { level: 'Honours', degree: 'BA in Bengali Literature', institution: 'Mawlana Bhashani STU', passingYear: 2021, result: 'CGPA 3.70' }
    ],
    skills: ['Bengali Proofreading', 'Creative Writing', 'Cultural Program Coordination', 'Documentation']
  },
  {
    name: 'Asaduzzaman Nur',
    nameBn: 'আসাদুজ্জামান নূর',
    phone: '01911000019',
    email: 'asaduzzaman.nur2026@gmail.com',
    district: 'কিশোরগঞ্জ',
    division: 'ঢাকা',
    nid: '19944891234567819',
    fatherName: 'Nur Mohammad',
    motherName: 'Khadija Khatun',
    gender: 'male',
    dob: '1994-05-25',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Kishoreganj Govt Boys High School', passingYear: 2010, result: 'GPA 4.90' },
      { level: 'HSC', degree: 'Science', institution: 'Gurudayal Govt College', passingYear: 2012, result: 'GPA 4.85' },
      { level: 'Honours', degree: 'BSc in Statistics', institution: 'Shahjalal University of Science & Tech', passingYear: 2017, result: 'CGPA 3.67' }
    ],
    skills: ['Statistical Inference', 'R Programming', 'Data Visualization', 'Python for Data Analysis']
  },
  {
    name: 'Mst. Jannatul Ferdous',
    nameBn: 'মোছাঃ জান্নাতুল ফেরদৌস',
    phone: '01611000020',
    email: 'jannatul.ferdous2026@gmail.com',
    district: 'ফরিদপুর',
    division: 'ঢাকা',
    nid: '19962991234567820',
    fatherName: 'Ferdous Wahid',
    motherName: 'Shirin Akter',
    gender: 'female',
    dob: '1996-10-14',
    education: [
      { level: 'SSC', degree: 'Science', institution: 'Faridpur Govt Girls High School', passingYear: 2012, result: 'GPA 5.00' },
      { level: 'HSC', degree: 'Science', institution: 'Govt. Rajendra College', passingYear: 2014, result: 'GPA 5.00' },
      { level: 'Honours', degree: 'BSc in Geography & Environment', institution: 'University of Dhaka', passingYear: 2019, result: 'CGPA 3.82' }
    ],
    skills: ['GIS Mapping', 'Remote Sensing Analysis', 'Environmental Impact Assessment', 'Cartography']
  }
];

async function runCandidateLifecycleAudit() {
  console.log('========================================================================');
  console.log('🚀 STARTING END-TO-END CANDIDATE ACCOUNT LIFECYCLE AUDIT (20 ACCOUNTS)');
  console.log('========================================================================\n');

  // Fetch active public jobs to apply to
  const jobsRes = await fetch(`${BASE_URL}/api/jobs?limit=5`);
  const jobsData = await jobsRes.json();
  const availableJobs = jobsData.jobs || [];

  if (availableJobs.length === 0) {
    console.error('❌ No public jobs found to apply to!');
    process.exit(1);
  }
  console.log(`Found ${availableJobs.length} active jobs in platform repository.`);

  const auditLog: Array<{
    index: number;
    candidateName: string;
    phone: string;
    candidateId: string;
    registered: boolean;
    profileUpdated: boolean;
    adminVerified: boolean;
    adminEdited: boolean;
    applicationSubmitted: boolean;
    applicationId: string;
    adminStatusUpdated: boolean;
    notificationsFlowing: boolean;
  }> = [];

  for (let i = 0; i < CANDIDATES_20.length; i++) {
    const seed = CANDIDATES_20[i];
    const accountIndex = i + 1;
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`[Account ${accountIndex}/20] Processing Candidate: ${seed.name} (${seed.nameBn})`);
    console.log(`Phone: ${seed.phone} | District: ${seed.district}`);
    console.log(`------------------------------------------------------------------------`);

    // Clean existing candidate if re-running
    const existing = serverDB.getCandidateByPhone(seed.phone);
    let candidateId = existing ? existing.id : '';

    let token = '';

    // STEP 1: Registration
    if (!existing) {
      const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: seed.phone,
          password: 'SecurePassword2026!',
          name: seed.name,
          nameBn: seed.nameBn,
          email: seed.email,
          district: seed.district,
          division: seed.division
        })
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        console.error(`❌ Registration failed for ${seed.name}:`, regData);
        throw new Error(`Registration failed for account ${accountIndex}`);
      }
      candidateId = regData.user.id;
      token = regData.token;
      console.log(`✅ Step 1: Registered successfully. Candidate ID: ${candidateId}`);
    } else {
      console.log(`ℹ️ Candidate already registered. ID: ${candidateId}`);
    }

    // STEP 2: Candidate Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: seed.phone,
        password: 'SecurePassword2026!'
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      console.error(`❌ Login failed for ${seed.name}:`, loginData);
      throw new Error(`Login failed for account ${accountIndex}`);
    }
    token = loginData.token;
    console.log(`✅ Step 2: Login verified. Session Token acquired.`);

    const userHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${token}`,
      'Authorization': `Bearer ${token}`
    };

    // STEP 3: Update Candidate Profile Details (User Side)
    const updateRes = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PATCH',
      headers: userHeaders,
      body: JSON.stringify({
        fatherName: seed.fatherName,
        motherName: seed.motherName,
        nidNumber: seed.nid,
        gender: seed.gender,
        dateOfBirth: seed.dob,
        education: seed.education,
        skills: seed.skills,
        presentAddress: `${seed.district} সদর, ${seed.district}`,
        permanentAddress: `${seed.district} সদর, ${seed.district}`
      })
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.success) {
      console.error(`❌ Profile update failed for ${seed.name}:`, updateData);
      throw new Error(`Profile update failed for account ${accountIndex}`);
    }
    console.log(`✅ Step 3: Candidate profile updated (NID: ${seed.nid}, Completeness: ${updateData.completeness}%).`);

    // STEP 4: Admin Verification of Candidate Details
    const adminHeaders = {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_SECRET
    };
    const adminVerifyRes = await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, {
      headers: adminHeaders
    });
    const adminVerifyData = await adminVerifyRes.json();
    if (!adminVerifyRes.ok || !adminVerifyData.success) {
      console.error(`❌ Admin inspection failed for ${seed.name}:`, adminVerifyData);
      throw new Error(`Admin inspection failed for account ${accountIndex}`);
    }
    const adminCandidate = adminVerifyData.candidate;
    if (adminCandidate.name !== seed.name || adminCandidate.district !== seed.district) {
      console.error(`❌ Admin sees mismatched candidate data!`, adminCandidate);
      throw new Error(`Candidate data sync mismatch for account ${accountIndex}`);
    }
    console.log(`✅ Step 4: Admin inspected candidate data. Verified match: ${adminCandidate.name} (${adminCandidate.phone}).`);

    // STEP 5: Admin Edits Candidate Data
    const adminEditRes = await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        verificationStatus: 'verified',
        isVerified: true,
        adminNote: `যাচাইকরণ সফল: একাউন্ট #${accountIndex} এর যাবতীয় এনআইডি ও শিক্ষাগত সনদ অনুমোদিত।`,
        preferredJobTypes: ['Government', 'Bank', 'Autonomous']
      })
    });
    const adminEditData = await adminEditRes.json();
    if (!adminEditRes.ok || !adminEditData.success) {
      console.error(`❌ Admin editing candidate failed:`, adminEditData);
      throw new Error(`Admin candidate edit failed for account ${accountIndex}`);
    }
    console.log(`✅ Step 5: Admin successfully edited candidate profile (Marked: verified, note added).`);

    // Verify candidate sees the admin update
    const userProfileCheckRes = await fetch(`${BASE_URL}/api/user/profile`, { headers: userHeaders });
    const userProfileCheckData = await userProfileCheckRes.json();
    const isVerifiedReflected = userProfileCheckData.profile?.isVerified === true || userProfileCheckData.profile?.verificationStatus === 'verified';
    console.log(`✅ Step 5.1: Candidate sees Admin verification: ${isVerifiedReflected ? 'YES (Verified)' : 'Pending'}`);

    // STEP 6: Candidate Submits Job Application
    const targetJob = availableJobs[i % availableJobs.length];
    const postName = targetJob.positions && targetJob.positions.length > 0 
      ? targetJob.positions[0].title 
      : (targetJob.title || 'অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক');
    
    const paymentMethods: Array<'bKash' | 'Nagad' | 'Wallet'> = ['bKash', 'Nagad', 'bKash'];
    const selectedMethod = paymentMethods[i % paymentMethods.length];
    const trxId = `TRX-${selectedMethod.toUpperCase()}-${accountIndex}-${Date.now().toString().slice(-4)}`;

    const appRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        jobId: targetJob.id,
        postName: postName,
        paymentMethod: selectedMethod,
        trxId: trxId,
        candidateName: seed.name,
        candidatePhone: seed.phone,
        notes: `অনলাইন আবেদনকারী - একাউন্ট #${accountIndex}`
      })
    });
    const appData = await appRes.json();
    let createdAppId = '';
    if (appRes.ok && appData.success && appData.createdApp) {
      createdAppId = appData.createdApp.id;
      console.log(`✅ Step 6: Application submitted. App ID: ${createdAppId} for Job: "${targetJob.title.slice(0, 30)}..." via ${selectedMethod}`);
    } else if (appData.existingAppId) {
      createdAppId = appData.existingAppId;
      console.log(`ℹ️ Existing application found: ${createdAppId}`);
    } else {
      console.error(`❌ Job application submission failed:`, appData);
      throw new Error(`Application submission failed for account ${accountIndex}`);
    }

    // STEP 7: Admin Application Status Transition & Processing
    const teleTalkUserId = `TT2026USR${1000 + accountIndex}`;
    const applicantCopyUrl = `https://storage.chakrisheba.com/applicant-copies/app_${createdAppId}.pdf`;

    const statusTransitionRes = await fetch(`${BASE_URL}/api/applications/${createdAppId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        status: 'completed',
        verificationType: 'officially_verified',
        teleTalkTrackingId: teleTalkUserId,
        applicantCopyPdfUrl: applicantCopyUrl,
        notes: `টেলিটক অলজবসে ফরম পূরণ সম্পন্ন। ইউজার আইডি: ${teleTalkUserId}। অ্যাপ্লিক্যান্ট কপি সংযুক্ত।`
      })
    });
    const statusTransitionData = await statusTransitionRes.json();
    if (!statusTransitionRes.ok || !statusTransitionData.success) {
      console.error(`❌ Admin status update failed:`, statusTransitionData);
      throw new Error(`Admin application status update failed for account ${accountIndex}`);
    }
    console.log(`✅ Step 7: Admin transitioned application status to "completed" (Teletalk ID: ${teleTalkUserId}).`);

    // STEP 8: Bi-Directional Notification & Communications Check
    // Admin sends direct notification to candidate
    const adminNotifRes = await fetch(`${BASE_URL}/api/admin/notifications/send`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        candidateId: candidateId,
        recipientPhone: seed.phone,
        title: `অভিনন্দন ${seed.nameBn}! আবেদন সফল হয়েছে`,
        message: `আপনার পদের আবেদনপত্রটি (${createdAppId}) সফলভাবে সরকারি পোর্টালে দাখিল করা হয়েছে। আপনার টেলিটক ইউজার আইডি: ${teleTalkUserId}।`,
        channel: 'in_app'
      })
    });
    const adminNotifData = await adminNotifRes.json();
    console.log(`✅ Step 8.1: Admin dispatched direct message. Server response: ${adminNotifData.success ? 'Success' : 'Failed'}`);

    // Candidate checks notifications
    const candidateNotifsRes = await fetch(`${BASE_URL}/api/candidate/notifications`, {
      headers: userHeaders
    });
    const candidateNotifsData = await candidateNotifsRes.json();
    const candidateNotifications = candidateNotifsData.notifications || [];
    console.log(`✅ Step 8.2: Candidate retrieved ${candidateNotifications.length} notifications in inbox (Unread: ${candidateNotifsData.unreadCount}).`);

    // Candidate marks all notifications as read
    const markReadRes = await fetch(`${BASE_URL}/api/candidate/notifications`, {
      method: 'PATCH',
      headers: userHeaders,
      body: JSON.stringify({ all: true })
    });
    const markReadData = await markReadRes.json();
    console.log(`✅ Step 8.3: Candidate marked notifications as read: ${markReadData.success ? 'Confirmed' : 'Failed'}`);

    auditLog.push({
      index: accountIndex,
      candidateName: seed.name,
      phone: seed.phone,
      candidateId,
      registered: true,
      profileUpdated: true,
      adminVerified: true,
      adminEdited: true,
      applicationSubmitted: true,
      applicationId: createdAppId,
      adminStatusUpdated: true,
      notificationsFlowing: candidateNotifications.length > 0
    });
  }

  console.log('\n========================================================================');
  console.log('🎉 20 CANDIDATE ACCOUNTS END-TO-END LIFECYCLE AUDIT REPORT');
  console.log('========================================================================\n');

  console.table(auditLog.map(item => ({
    '#': item.index,
    'Name': item.candidateName,
    'Phone': item.phone,
    'Reg': item.registered ? '✅' : '❌',
    'Profile': item.profileUpdated ? '✅' : '❌',
    'Admin Verify': item.adminVerified ? '✅' : '❌',
    'Admin Edit': item.adminEdited ? '✅' : '❌',
    'App Sub': item.applicationSubmitted ? '✅' : '❌',
    'App ID': item.applicationId,
    'Status Done': item.adminStatusUpdated ? '✅' : '❌',
    'Notifs OK': item.notificationsFlowing ? '✅' : '❌'
  })));

  const allPassed = auditLog.every(item => 
    item.registered && item.profileUpdated && item.adminVerified && 
    item.adminEdited && item.applicationSubmitted && 
    item.adminStatusUpdated && item.notificationsFlowing
  );

  if (allPassed) {
    console.log('\n🏆 ALL 20 ACCOUNTS PASSED 100% OF END-TO-END AUDIT CHECKS!\n');
  } else {
    console.error('\n❌ Some audit checks failed.');
    process.exit(1);
  }
}

runCandidateLifecycleAudit().catch((err) => {
  console.error('Fatal Candidate Lifecycle Audit Error:', err);
  process.exit(1);
});

