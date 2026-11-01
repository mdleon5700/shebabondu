// Bangladesh Administrative Divisions & Districts (Bilingual & English Standard for Teletalk / Govt / Bank applications)

export interface RegionOption {
  en: string;
  bn: string;
}

export const BD_DIVISIONS_MAP: Record<string, { bn: string; districts: { en: string; bn: string }[] }> = {
  'DHAKA': {
    bn: 'ঢাকা',
    districts: [
      { en: 'DHAKA', bn: 'ঢাকা' },
      { en: 'GAZIPUR', bn: 'গাজীপুর' },
      { en: 'NARAYANGANJ', bn: 'নারায়ণগঞ্জ' },
      { en: 'NARSINGDI', bn: 'নরসিংদী' },
      { en: 'MUNSHIGANJ', bn: 'মুন্সীগঞ্জ' },
      { en: 'MANIKGANJ', bn: 'মানিকগঞ্জ' },
      { en: 'TANGAIL', bn: 'টাঙ্গাইল' },
      { en: 'KISHOREGANJ', bn: 'কিশোরগঞ্জ' },
      { en: 'FARIDPUR', bn: 'ফরিদপুর' },
      { en: 'MADARIPUR', bn: 'মাদারীপুর' },
      { en: 'SHARIATPUR', bn: 'শরীয়তপুর' },
      { en: 'GOPALGANJ', bn: 'গোপালগঞ্জ' },
      { en: 'RAJBARI', bn: 'রাজবাড়ী' }
    ]
  },
  'CHATTOGRAM': {
    bn: 'চট্টগ্রাম',
    districts: [
      { en: 'CHATTOGRAM', bn: 'চট্টগ্রাম' },
      { en: 'COXS BAZAR', bn: 'কক্সবাজার' },
      { en: 'CUMILLA', bn: 'কুমিল্লা' },
      { en: 'FENI', bn: 'ফেনী' },
      { en: 'BRAHMANBARIA', bn: 'ব্রাহ্মণবাড়িয়া' },
      { en: 'CHANDPUR', bn: 'চাঁদপুর' },
      { en: 'LAKSHMIPUR', bn: 'লক্ষ্মীপুর' },
      { en: 'NOAKHALI', bn: 'নোয়াখালী' },
      { en: 'BANDARBAN', bn: 'বান্দরবান' },
      { en: 'RANGAMATI', bn: 'রাঙ্গামাটি' },
      { en: 'KHAGRACHARI', bn: 'খাগড়াছড়ি' }
    ]
  },
  'RAJSHAHI': {
    bn: 'রাজশাহী',
    districts: [
      { en: 'RAJSHAHI', bn: 'রাজশাহী' },
      { en: 'BOGURA', bn: 'বগুড়া' },
      { en: 'PABNA', bn: 'পাবনা' },
      { en: 'SIRAJGANJ', bn: 'সিরাজগঞ্জ' },
      { en: 'NAOGAON', bn: 'নওগাঁ' },
      { en: 'CHAPAINAWABGANJ', bn: 'চাঁপাইনবাবগঞ্জ' },
      { en: 'NATORE', bn: 'নাটোর' },
      { en: 'JOYPURHAT', bn: 'জয়পুরহাট' }
    ]
  },
  'KHULNA': {
    bn: 'খুলনা',
    districts: [
      { en: 'KHULNA', bn: 'খুলনা' },
      { en: 'JASHORE', bn: 'যশোর' },
      { en: 'KUSHTIA', bn: 'কুষ্টিয়া' },
      { en: 'JHENAIDAH', bn: 'ঝিনাইদহ' },
      { en: 'SATKHIRA', bn: 'সাতক্ষীরা' },
      { en: 'BAGERHAT', bn: 'বাগেরহাট' },
      { en: 'CHUADANGA', bn: 'চুয়াডাঙ্গা' },
      { en: 'MEHERPUR', bn: 'মেহেরপুর' },
      { en: 'MAGURA', bn: 'মাগুরা' },
      { en: 'NARAIL', bn: 'নড়াইল' }
    ]
  },
  'BARISHAL': {
    bn: 'বরিশাল',
    districts: [
      { en: 'BARISHAL', bn: 'বরিশাল' },
      { en: 'PATUAKHALI', bn: 'পটুয়াখালী' },
      { en: 'BHOLA', bn: 'ভোলা' },
      { en: 'PIROJPUR', bn: 'পিরোজপুর' },
      { en: 'BARGUNA', bn: 'বরগুনা' },
      { en: 'JHALOKATHI', bn: 'ঝালকাঠি' }
    ]
  },
  'SYLHET': {
    bn: 'সিলেট',
    districts: [
      { en: 'SYLHET', bn: 'সিলেট' },
      { en: 'MOULVIBAZAR', bn: 'মৌলভীবাজার' },
      { en: 'HABIGANJ', bn: 'হবিগঞ্জ' },
      { en: 'SUNAMGANJ', bn: 'সুনামগঞ্জ' }
    ]
  },
  'RANGPUR': {
    bn: 'রংপুর',
    districts: [
      { en: 'RANGPUR', bn: 'রংপুর' },
      { en: 'DINAJPUR', bn: 'দিনাজপুর' },
      { en: 'KURIGRAM', bn: 'কুড়িগ্রাম' },
      { en: 'GAIBANDHA', bn: 'গাইবান্ধা' },
      { en: 'NILPHAMARI', bn: 'নীলফামারী' },
      { en: 'PANCHAGARH', bn: 'পঞ্চগড়' },
      { en: 'THAKURGAON', bn: 'ঠাকুরগাঁও' },
      { en: 'LALMONIRHAT', bn: 'লালমনিরহাট' }
    ]
  },
  'MYMENSINGH': {
    bn: 'ময়মনসিংহ',
    districts: [
      { en: 'MYMENSINGH', bn: 'ময়মনসিংহ' },
      { en: 'JAMALPUR', bn: 'জামালপুর' },
      { en: 'NETROKONA', bn: 'নেত্রকোণা' },
      { en: 'SHERPUR', bn: 'শেরপুর' }
    ]
  }
};

// Major Upazilas / Thanas in English for Teletalk / Bank Job Standard
export const BD_UPAZILAS_EN_MAP: Record<string, string[]> = {
  'DHAKA': ['MIRPUR', 'DHANMONDI', 'GULSHAN', 'UTTARA', 'MOTIJHEEL', 'MOHAMMADPUR', 'BADDA', 'KHILGAON', 'KOTWALI', 'SAVAR', 'DHAMRAI', 'KERANIGANJ', 'TEJGAON', 'PALTAN', 'RAMNA', 'SHAHBAGH', 'JATRABARI', 'DEMRA', 'KHILKHET', 'CANTONMENT', 'BHASHANTAK', 'KAFRUL', 'SHAH ALI', 'TURAG', 'DARUSSALAM'],
  'GAZIPUR': ['GAZIPUR SADAR', 'KALIAKAIR', 'KALIGANJ', 'KAPASIA', 'SREEPUR', 'TONGI EAST', 'TONGI WEST', 'BASAN', 'KONABARI'],
  'NARAYANGANJ': ['NARAYANGANJ SADAR', 'BANDAR', 'RUPGANJ', 'SONARGAON', 'ARAIHAZAR', 'SIDDHIRGANJ', 'FATULLAH'],
  'NARSINGDI': ['NARSINGDI SADAR', 'PALASH', 'BELABO', 'MONOHARDI', 'RAIPURA', 'SHIBPUR'],
  'MUNSHIGANJ': ['MUNSHIGANJ SADAR', 'TONGIBARI', 'SERAJDHIKHAN', 'LOUHAJANG', 'SREENAGAR', 'GAZARIA'],
  'MANIKGANJ': ['MANIKGANJ SADAR', 'SINGAIR', 'SHIBALAYA', 'SATURIA', 'HARIRAMPUR', 'GHIOR', 'DAULATPUR'],
  'TANGAIL': ['TANGAIL SADAR', 'MIRZAPUR', 'KALIHATI', 'GHATAIL', 'MADHUPUR', 'SAKHIPUR', 'GOPALPUR', 'DELDUAR', 'BHUAPUR', 'BASAIL', 'NAGARPUR', 'DHANBARI'],
  'KISHOREGANJ': ['KISHOREGANJ SADAR', 'BHAIRAB', 'BAJITPUR', 'HOSSEINPUR', 'KARIMGANJ', 'TARAIL', 'PAKUNDIA', 'KATIADI', 'KULIARCHAR', 'NIKLI', 'ASHTAGRAM', 'MITHAMAIN', 'ITNA'],
  'FARIDPUR': ['FARIDPUR SADAR', 'BOALMARI', 'MADHUKHALI', 'BHANGA', 'SALTHA', 'NAGARKANDA', 'CHARBHADRASAN', 'SADARPUR', 'ALFADANGA'],
  'MADARIPUR': ['MADARIPUR SADAR', 'SHIBCHAR', 'KALKINI', 'RAJOIR', 'DASAR'],
  'SHARIATPUR': ['SHARIATPUR SADAR', 'ZAJIRA', 'NARIA', 'BHEDARGANJ', 'DAMUDYA', 'GOSAIRHAT'],
  'GOPALGANJ': ['GOPALGANJ SADAR', 'TUNGIPARA', 'KOTALIPARA', 'KASHIANI', 'MUKSUDPUR'],
  'RAJBARI': ['RAJBARI SADAR', 'PANGSHA', 'BALIAKANDI', 'GOALANDA', 'KALUKHALI'],
  
  'CHATTOGRAM': ['KOTWALI', 'PANCHLAISH', 'HALISHAHAR', 'DOUBLE MOORING', 'PATENGA', 'PAHARTALI', 'CHANDGAON', 'BAKALIA', 'HATHAZARI', 'RAUZAN', 'RANGUNIA', 'PATIYA', 'SITAKUNDA', 'MIRSHARAI', 'SANDWIP', 'BOALKHALI', 'ANWARA', 'CHANDANAISH', 'BANSHKHALI', 'LOHAGARA', 'SATKANIA', 'KARNAPHULI'],
  'COXS BAZAR': ['COXS BAZAR SADAR', 'CHAKARIA', 'MAHESHKHALI', 'TEKNAF', 'UKHIYA', 'RAMU', 'PEKUA', 'KUTUBDIA', 'EIDGAON'],
  'CUMILLA': ['CUMILLA ADARSHA SADAR', 'CUMILLA SADAR SOUTH', 'DAUDKANDI', 'CHANDINA', 'MURADNAGAR', 'HOMNA', 'TITAS', 'MEGHNA', 'LAKSHAM', 'BURICHANG', 'BRAHMANPARA', 'DEBIDWAR', 'CHAUDDAGRAM', 'BARURA', 'MONOHARGANJ', 'LALMAI'],
  'FENI': ['FENI SADAR', 'DAGANBHUIYAN', 'SONAGAZI', 'CHHAGALNAIYA', 'PARSHURAM', 'FULGAZI'],
  'BRAHMANBARIA': ['BRAHMANBARIA SADAR', 'ASHUGANJ', 'SARAIL', 'KASBA', 'NABINAGAR', 'NASIRNAGAR', 'BANCHHARAMPUR', 'AKHAURA', 'BIJOYNAGAR'],
  'CHANDPUR': ['CHANDPUR SADAR', 'HAJIGANJ', 'SHAHRASTI', 'MATLAB NORTH', 'MATLAB SOUTH', 'FARIDGANJ', 'KACHUA', 'HAIMCHAR'],
  'LAKSHMIPUR': ['LAKSHMIPUR SADAR', 'RAIPUR', 'RAMGANJ', 'RAMGATI', 'KAMALNAGAR'],
  'NOAKHALI': ['NOAKHALI SADAR', 'BEGUMGANJ', 'CHATKHIL', 'SENBAGH', 'COMPANIGANJ', 'HATIYA', 'KABIRHAT', 'SUBARNACHAR', 'SONAIMURI'],
  
  'RAJSHAHI': ['BOALIA', 'RAJPARA', 'MOTIHAR', 'SHAH MAKHDUM', 'PABA', 'GODAGARI', 'TANORE', 'MOHANPUR', 'BAGMARA', 'DURGAPUR', 'BAGHA', 'CHARGHAT', 'PUTHIA'],
  'BOGURA': ['BOGURA SADAR', 'SHIBGANJ', 'SHERPUR', 'DHUNAT', 'SARIYAKANDI', 'GABTALI', 'KAHALOO', 'DUPCHANCHIA', 'ADAMDIGHI', 'NANDIGRAM', 'SONATALA', 'SHAJAHANPUR'],
  'PABNA': ['PABNA SADAR', 'ISHWARDI', 'SANTHIA', 'SUJANAGAR', 'BERA', 'FARIDPUR', 'CHATMOHAR', 'BHANGURA', 'ATGHARIA'],
  'SIRAJGANJ': ['SIRAJGANJ SADAR', 'SHAHJADPUR', 'ULLAPARA', 'BELKUCHI', 'RAIGANJ', 'TARASH', 'KAMARKHANDA', 'KAZIPUR', 'CHAUHALI'],
  
  'KHULNA': ['KHULNA SADAR', 'SONADANGA', 'KHALISHPUR', 'DAULATPUR', 'KHAN JAHAN ALI', 'BATIAGHATA', 'DUMURIA', 'PAIKGACHHA', 'KOYRA', 'TEROKHADA', 'RUPSA', 'DIGHALIA', 'PHULTALA'],
  'JASHORE': ['JASHORE SADAR', 'JHIKARGACHHA', 'SHARSHA', 'MANIRAMPUR', 'KESHABPUR', 'ABHAYNAGAR', 'BAGHERPARA', 'CHAUGACHHA'],
  'KUSHTIA': ['KUSHTIA SADAR', 'KUMARKHALI', 'BHERAMARA', 'MIRPUR', 'DAULATPUR', 'KHOKSA'],
  
  'BARISHAL': ['KOTWALI', 'BARISHAL SADAR', 'BAKERGANJ', 'BABUGANJ', 'WZIRPUR', 'BANARIPARA', 'GOURNADI', 'AGAILJHARA', 'MEHENDIGANJ', 'MULADI', 'HIZLA'],
  'SYLHET': ['SYLHET SADAR', 'SOUTH SURMA', 'GOLAPGANJ', 'BEANIBAZAR', 'ZAKIGANJ', 'KANAIGHAT', 'COMPANIGANJ', 'GOWAINGHAT', 'JAINTIAPUR', 'BALAGANJ', 'BISHWANATH', 'FENCHUGANJ', 'OSMANI NAGAR'],
  'RANGPUR': ['RANGPUR SADAR', 'GANGACHARA', 'TARAGANJ', 'BADARGANJ', 'PIRGACHHA', 'KAUNIA', 'PIRGANJ', 'MITHAPUKUR'],
  'MYMENSINGH': ['MYMENSINGH SADAR', 'TRISHAL', 'VALUKA', 'MUKTAGACHHA', 'GAFORGAON', 'ISHWARGANJ', 'NANDAIL', 'FULPUR', 'TARAKANDA', 'HALUAGHAT', 'DHOBAURA', 'FULBARIA']
};

// Legacy Bengali Lists
export const BD_DIVISIONS = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
export const BD_DIVISIONS_EN = Object.keys(BD_DIVISIONS_MAP);

export const BD_ALL_DISTRICTS = Object.values(BD_DIVISIONS_MAP).flatMap(d => d.districts.map(dist => dist.en));

// Normalizer to English Standard
export function normalizeToEnglishDivision(div?: string): string {
  if (!div) return 'DHAKA';
  const clean = div.trim().toUpperCase();
  for (const [enKey, data] of Object.entries(BD_DIVISIONS_MAP)) {
    if (clean === enKey || clean.includes(enKey) || div.includes(data.bn)) {
      return enKey;
    }
  }
  return 'DHAKA';
}

export function normalizeToEnglishDistrict(dist?: string): string {
  if (!dist) return 'DHAKA';
  const clean = dist.trim().toUpperCase();
  for (const divData of Object.values(BD_DIVISIONS_MAP)) {
    for (const d of divData.districts) {
      if (clean === d.en || clean.includes(d.en) || dist.includes(d.bn)) {
        return d.en;
      }
    }
  }
  return clean || 'DHAKA';
}

export function getDivisionForDistrict(district?: string): string {
  const normDist = normalizeToEnglishDistrict(district);
  for (const [divKey, divData] of Object.entries(BD_DIVISIONS_MAP)) {
    if (divData.districts.some(d => d.en === normDist)) {
      return divKey;
    }
  }
  return 'DHAKA';
}

export function getDistrictsForDivision(division?: string): { en: string; bn: string }[] {
  const normDiv = normalizeToEnglishDivision(division);
  return BD_DIVISIONS_MAP[normDiv]?.districts || BD_DIVISIONS_MAP['DHAKA'].districts;
}

export function getUpazilasForDistrict(district?: string): string[] {
  const normDist = normalizeToEnglishDistrict(district);
  if (BD_UPAZILAS_EN_MAP[normDist]) {
    return BD_UPAZILAS_EN_MAP[normDist];
  }
  return [`${normDist} SADAR`, 'THANA 1', 'THANA 2'];
}
