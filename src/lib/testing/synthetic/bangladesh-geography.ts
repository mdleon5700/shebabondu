// Bangladesh 64-District Geographic & Demographic Mapping Engine
// Used for Nationwide Synthetic User Simulation & Continuous System Audit

export interface DistrictInfo {
  id: string;
  en: string;
  bn: string;
  divisionEn: string;
  divisionBn: string;
  upazilas: string[];
  headquarters: string;
  postalCode: string;
}

export const BD_64_DISTRICTS: DistrictInfo[] = [
  // --- 1. DHAKA DIVISION (13 Districts) ---
  {
    id: 'DIST-DHAKA',
    en: 'DHAKA',
    bn: 'ঢাকা',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Mirpur', 'Dhanmondi', 'Gulshan', 'Uttara', 'Motijheel', 'Mohammadpur', 'Savar', 'Dhamrai', 'Keraniganj', 'Tejgaon'],
    headquarters: 'Dhaka',
    postalCode: '1000'
  },
  {
    id: 'DIST-GAZIPUR',
    en: 'GAZIPUR',
    bn: 'গাজীপুর',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Tongi'],
    headquarters: 'Gazipur',
    postalCode: '1700'
  },
  {
    id: 'DIST-NARAYANGANJ',
    en: 'NARAYANGANJ',
    bn: 'নারায়ণগঞ্জ',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Sonargaon', 'Araihazar', 'Fatullah'],
    headquarters: 'Narayanganj',
    postalCode: '1400'
  },
  {
    id: 'DIST-NARSINGDI',
    en: 'NARSINGDI',
    bn: 'নরসিংদী',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Narsingdi Sadar', 'Palash', 'Belabo', 'Monohardi', 'Raipura', 'Shibpur'],
    headquarters: 'Narsingdi',
    postalCode: '1600'
  },
  {
    id: 'DIST-MUNSHIGANJ',
    en: 'MUNSHIGANJ',
    bn: 'মুন্সীগঞ্জ',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Munshiganj Sadar', 'Tongibari', 'Serajdikhan', 'Louhajang', 'Sreenagar', 'Gazaria'],
    headquarters: 'Munshiganj',
    postalCode: '1500'
  },
  {
    id: 'DIST-MANIKGANJ',
    en: 'MANIKGANJ',
    bn: 'মানিকগঞ্জ',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Manikganj Sadar', 'Singair', 'Shibalaya', 'Saturia', 'Harirampur', 'Ghior', 'Daulatpur'],
    headquarters: 'Manikganj',
    postalCode: '1800'
  },
  {
    id: 'DIST-TANGAIL',
    en: 'TANGAIL',
    bn: 'টাঙ্গাইল',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Tangail Sadar', 'Mirzapur', 'Kalihati', 'Ghatail', 'Madhupur', 'Sakhipur', 'Gopalpur', 'Delduar'],
    headquarters: 'Tangail',
    postalCode: '1900'
  },
  {
    id: 'DIST-KISHOREGANJ',
    en: 'KISHOREGANJ',
    bn: 'কিশোরগঞ্জ',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Hosseinpur', 'Karimganj', 'Tarail', 'Pakundia', 'Katiadi'],
    headquarters: 'Kishoreganj',
    postalCode: '2300'
  },
  {
    id: 'DIST-FARIDPUR',
    en: 'FARIDPUR',
    bn: 'ফরিদপুর',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Faridpur Sadar', 'Boalmari', 'Madhukhali', 'Bhanga', 'Saltha', 'Nagarkanda', 'Charbhadrasan'],
    headquarters: 'Faridpur',
    postalCode: '7800'
  },
  {
    id: 'DIST-MADARIPUR',
    en: 'MADARIPUR',
    bn: 'মাদারীপুর',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir', 'Dasar'],
    headquarters: 'Madaripur',
    postalCode: '7900'
  },
  {
    id: 'DIST-SHARIATPUR',
    en: 'SHARIATPUR',
    bn: 'শরীয়তপুর',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Shariatpur Sadar', 'Zajira', 'Naria', 'Bhedarganj', 'Damudya', 'Gosairhat'],
    headquarters: 'Shariatpur',
    postalCode: '8000'
  },
  {
    id: 'DIST-GOPALGANJ',
    en: 'GOPALGANJ',
    bn: 'গোপালগঞ্জ',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Gopalganj Sadar', 'Tungipara', 'Kotalipara', 'Kashiani', 'Muksudpur'],
    headquarters: 'Gopalganj',
    postalCode: '8100'
  },
  {
    id: 'DIST-RAJBARI',
    en: 'RAJBARI',
    bn: 'রাজবাড়ী',
    divisionEn: 'DHAKA',
    divisionBn: 'ঢাকা',
    upazilas: ['Rajbari Sadar', 'Pangsha', 'Baliakandi', 'Goalanda', 'Kalukhali'],
    headquarters: 'Rajbari',
    postalCode: '7700'
  },

  // --- 2. CHATTOGRAM DIVISION (11 Districts) ---
  {
    id: 'DIST-CHATTOGRAM',
    en: 'CHATTOGRAM',
    bn: 'চট্টগ্রাম',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Kotwali', 'Panchlaish', 'Halisahar', 'Double Mooring', 'Patenga', 'Hathazari', 'Rauzan', 'Patiya', 'Sitakunda'],
    headquarters: 'Chattogram',
    postalCode: '4000'
  },
  {
    id: 'DIST-COXS_BAZAR',
    en: 'COXS BAZAR',
    bn: 'কক্সবাজার',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Coxs Bazar Sadar', 'Chakaria', 'Maheshkhali', 'Teknaf', 'Ukhiya', 'Ramu', 'Pekua'],
    headquarters: 'Coxs Bazar',
    postalCode: '4700'
  },
  {
    id: 'DIST-CUMILLA',
    en: 'CUMILLA',
    bn: 'কুমিল্লা',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Cumilla Adarsha Sadar', 'Daudkandi', 'Chandina', 'Muradnagar', 'Laksham', 'Burichang', 'Chauddagram', 'Debidwar'],
    headquarters: 'Cumilla',
    postalCode: '3500'
  },
  {
    id: 'DIST-FENI',
    en: 'FENI',
    bn: 'ফেনী',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Feni Sadar', 'Daganbhuiyan', 'Sonagazi', 'Chhagalnaiya', 'Parshuram', 'Fulgazi'],
    headquarters: 'Feni',
    postalCode: '3900'
  },
  {
    id: 'DIST-BRAHMANBARIA',
    en: 'BRAHMANBARIA',
    bn: 'ব্রাহ্মণবাড়িয়া',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Brahmanbaria Sadar', 'Ashuganj', 'Sarail', 'Kasba', 'Nabinagar', 'Banchharampur', 'Akhaura'],
    headquarters: 'Brahmanbaria',
    postalCode: '3400'
  },
  {
    id: 'DIST-CHANDPUR',
    en: 'CHANDPUR',
    bn: 'চাঁদপুর',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Chandpur Sadar', 'Hajiganj', 'Shahrasti', 'Matlab North', 'Matlab South', 'Faridganj', 'Kachua'],
    headquarters: 'Chandpur',
    postalCode: '3600'
  },
  {
    id: 'DIST-LAKSHMIPUR',
    en: 'LAKSHMIPUR',
    bn: 'লক্ষ্মীপুর',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'],
    headquarters: 'Lakshmipur',
    postalCode: '3700'
  },
  {
    id: 'DIST-NOAKHALI',
    en: 'NOAKHALI',
    bn: 'নোয়াখালী',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Senbagh', 'Companiganj', 'Hatiya', 'Kabirhat', 'Sonaimuri'],
    headquarters: 'Maijdee',
    postalCode: '3800'
  },
  {
    id: 'DIST-BANDARBAN',
    en: 'BANDARBAN',
    bn: 'বান্দরবান',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Bandarban Sadar', 'Thanchi', 'Ruma', 'Rowangchhari', 'Lama', 'Alikadam', 'Naikhongchhari'],
    headquarters: 'Bandarban',
    postalCode: '4600'
  },
  {
    id: 'DIST-RANGAMATI',
    en: 'RANGAMATI',
    bn: 'রাঙ্গামাটি',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Rangamati Sadar', 'Kaptai', 'Baghaichhari', 'Barkal', 'Langadu', 'Juraichhari', 'Belaichhari'],
    headquarters: 'Rangamati',
    postalCode: '4500'
  },
  {
    id: 'DIST-KHAGRACHARI',
    en: 'KHAGRACHARI',
    bn: 'খাগড়াছড়ি',
    divisionEn: 'CHATTOGRAM',
    divisionBn: 'চট্টগ্রাম',
    upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Mahalchhari', 'Matiranga', 'Manikchhari', 'Ramgarh'],
    headquarters: 'Khagrachhari',
    postalCode: '4400'
  },

  // --- 3. RAJSHAHI DIVISION (8 Districts) ---
  {
    id: 'DIST-RAJSHAHI',
    en: 'RAJSHAHI',
    bn: 'রাজশাহী',
    divisionEn: 'RAJSHAHI',
    divisionBn: 'রাজশাহী',
    upazilas: ['Boalia', 'Rajpara', 'Motihar', 'Paba', 'Godagari', 'Tanore', 'Mohanpur', 'Bagmara', 'Puthia'],
    headquarters: 'Rajshahi',
    postalCode: '6000'
  },
  {
    id: 'DIST-BOGURA',
    en: 'BOGURA',
    bn: 'বগুড়া',
    divisionEn: 'RAJSHAHI',
    divisionBn: 'রাজশাহী',
    upazilas: ['Bogura Sadar', 'Shibganj', 'Sherpur', 'Dhunat', 'Sariakandi', 'Gabtali', 'Kahaloo', 'Dupchanchia', 'Shajahanpur'],
    headquarters: 'Bogura',
    postalCode: '5800'
  },
  {
    id: 'DIST-PABNA',
    en: 'PABNA',
    bn: 'পাবনা',
    divisionEn: 'RAJSHAHI',
    divisionBn: 'রাজশাহী',
    upazilas: ['Pabna Sadar', 'Ishwardi', 'Santhia', 'Sujanagar', 'Bera', 'Faridpur', 'Chatmohar', 'Bhangura'],
    headquarters: 'Pabna',
    postalCode: '6600'
  },
  {
    id: 'DIST-SIRAJGANJ',
    en: 'SIRAJGANJ',
    bn: 'সিরাজগঞ্জ',
    divisionEn: 'RAJSHAHI',
    divisionBn: 'রাজশাহী',
    upazilas: ['Sirajganj Sadar', 'Shahjadpur', 'Ullapara', 'Belkuchi', 'Raiganj', 'Tarash', 'Kamarkhanda', 'Kazipur'],
    headquarters: 'Sirajganj',
    postalCode: '6700'
  },
  {
    id: 'DIST-NAOGAON',
    en: 'NAOGAON',
    bn: 'নওগাঁ',
    divisionEn: 'RAJSHAHI',
    divisionBn: 'রাজশাহী',
    upazilas: ['Naogaon Sadar', 'Mohadevpur', 'Manda', 'Niamatpur', 'Patnitala', 'Dhamoirhat', 'Badalgachhi', 'Raninagar'],
    headquarters: 'Naogaon',
    postalCode: '6500'
  },
  {
    id: 'DIST-CHAPAINAWABGANJ',
    en: 'CHAPAINAWABGANJ',
    bn: 'চাঁপাইনবাবগঞ্জ',
    divisionEn: 'RAJSHAHI',
    divisionBn: 'রাজশাহী',
    upazilas: ['Chapainawabganj Sadar', 'Shibganj', 'Gomostapur', 'Nachole', 'Bholahat'],
    headquarters: 'Chapainawabganj',
    postalCode: '6300'
  },
  {
    id: 'DIST-NATORE',
    en: 'NATORE',
    bn: 'নাটোর',
    divisionEn: 'RAJSHAHI',
    divisionBn: 'রাজশাহী',
    upazilas: ['Natore Sadar', 'Singra', 'Baraigram', 'Bagatipara', 'Lalpur', 'Gurudaspur', 'Naldanga'],
    headquarters: 'Natore',
    postalCode: '6400'
  },
  {
    id: 'DIST-JOYPURHAT',
    en: 'JOYPURHAT',
    bn: 'জয়পুরহাট',
    divisionEn: 'RAJSHAHI',
    divisionBn: 'রাজশাহী',
    upazilas: ['Joypurhat Sadar', 'Panchbibi', 'Kalai', 'Khetlal', 'Akkelpur'],
    headquarters: 'Joypurhat',
    postalCode: '5900'
  },

  // --- 4. KHULNA DIVISION (10 Districts) ---
  {
    id: 'DIST-KHULNA',
    en: 'KHULNA',
    bn: 'খুলনা',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Batiaghata', 'Dumuria', 'Paikgachha', 'Rupsa', 'Phultala'],
    headquarters: 'Khulna',
    postalCode: '9000'
  },
  {
    id: 'DIST-JASHORE',
    en: 'JASHORE',
    bn: 'যশোর',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Jashore Sadar', 'Jhikargachha', 'Sharsha', 'Manirampur', 'Keshabpur', 'Abhaynagar', 'Bagherpara', 'Chaugachha'],
    headquarters: 'Jashore',
    postalCode: '7400'
  },
  {
    id: 'DIST-KUSHTIA',
    en: 'KUSHTIA',
    bn: 'কুষ্টিয়া',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Bheramara', 'Mirpur', 'Daulatpur', 'Khoksa'],
    headquarters: 'Kushtia',
    postalCode: '7000'
  },
  {
    id: 'DIST-JHENAIDAH',
    en: 'JHENAIDAH',
    bn: 'ঝিনাইদহ',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa', 'Harinakunda'],
    headquarters: 'Jhenaidah',
    postalCode: '7300'
  },
  {
    id: 'DIST-SATKHIRA',
    en: 'SATKHIRA',
    bn: 'সাতক্ষীরা',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
    headquarters: 'Satkhira',
    postalCode: '9400'
  },
  {
    id: 'DIST-BAGERHAT',
    en: 'BAGERHAT',
    bn: 'বাগেরহাট',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Bagerhat Sadar', 'Fakirhat', 'Mollahat', 'Kachua', 'Rampal', 'Mongla', 'Morrelganj', 'Sarankhola'],
    headquarters: 'Bagerhat',
    postalCode: '9300'
  },
  {
    id: 'DIST-CHUADANGA',
    en: 'CHUADANGA',
    bn: 'চুয়াডাঙ্গা',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'],
    headquarters: 'Chuadanga',
    postalCode: '7200'
  },
  {
    id: 'DIST-MEHERPUR',
    en: 'MEHERPUR',
    bn: 'মেহেরপুর',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'],
    headquarters: 'Meherpur',
    postalCode: '7100'
  },
  {
    id: 'DIST-MAGURA',
    en: 'MAGURA',
    bn: 'মাগুরা',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Magura Sadar', 'Sreepur', 'Mohammadpur', 'Shalikha'],
    headquarters: 'Magura',
    postalCode: '7600'
  },
  {
    id: 'DIST-NARAIL',
    en: 'NARAIL',
    bn: 'নড়াইল',
    divisionEn: 'KHULNA',
    divisionBn: 'খুলনা',
    upazilas: ['Narail Sadar', 'Lohagara', 'Kalia'],
    headquarters: 'Narail',
    postalCode: '7500'
  },

  // --- 5. BARISHAL DIVISION (6 Districts) ---
  {
    id: 'DIST-BARISHAL',
    en: 'BARISHAL',
    bn: 'বরিশাল',
    divisionEn: 'BARISHAL',
    divisionBn: 'বরিশাল',
    upazilas: ['Barishal Sadar', 'Bakerganj', 'Babuganj', 'Wazirpur', 'Banaripara', 'Gournadi', 'Agailjhara', 'Mehendiganj'],
    headquarters: 'Barishal',
    postalCode: '8200'
  },
  {
    id: 'DIST-PATUAKHALI',
    en: 'PATUAKHALI',
    bn: 'পটুয়াখালী',
    divisionEn: 'BARISHAL',
    divisionBn: 'বরিশাল',
    upazilas: ['Patuakhali Sadar', 'Bauphal', 'Galachipa', 'Dashmina', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali'],
    headquarters: 'Patuakhali',
    postalCode: '8600'
  },
  {
    id: 'DIST-BHOLA',
    en: 'BHOLA',
    bn: 'ভোলা',
    divisionEn: 'BARISHAL',
    divisionBn: 'বরিশাল',
    upazilas: ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'],
    headquarters: 'Bhola',
    postalCode: '8300'
  },
  {
    id: 'DIST-PIROJPUR',
    en: 'PIROJPUR',
    bn: 'পিরোজপুর',
    divisionEn: 'BARISHAL',
    divisionBn: 'বরিশাল',
    upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Mathbaria', 'Kawkhali', 'Nazirpur', 'Nesarabad', 'Indurkani'],
    headquarters: 'Pirojpur',
    postalCode: '8500'
  },
  {
    id: 'DIST-BARGUNA',
    en: 'BARGUNA',
    bn: 'বরগুনা',
    divisionEn: 'BARISHAL',
    divisionBn: 'বরিশাল',
    upazilas: ['Barguna Sadar', 'Amtali', 'Patharghata', 'Betagi', 'Bamna', 'Taltali'],
    headquarters: 'Barguna',
    postalCode: '8700'
  },
  {
    id: 'DIST-JHALOKATHI',
    en: 'JHALOKATHI',
    bn: 'ঝালকাঠি',
    divisionEn: 'BARISHAL',
    divisionBn: 'বরিশাল',
    upazilas: ['Jhalokathi Sadar', 'Kathalia', 'Nalchhiti', 'Rajapur'],
    headquarters: 'Jhalokathi',
    postalCode: '8400'
  },

  // --- 6. SYLHET DIVISION (4 Districts) ---
  {
    id: 'DIST-SYLHET',
    en: 'SYLHET',
    bn: 'সিলেট',
    divisionEn: 'SYLHET',
    divisionBn: 'সিলেট',
    upazilas: ['Sylhet Sadar', 'South Surma', 'Golapganj', 'Beanibazar', 'Zakiganj', 'Kanaighat', 'Companiganj', 'Gowainghat', 'Fenchuganj'],
    headquarters: 'Sylhet',
    postalCode: '3100'
  },
  {
    id: 'DIST-MOULVIBAZAR',
    en: 'MOULVIBAZAR',
    bn: 'মৌলভীবাজার',
    divisionEn: 'SYLHET',
    divisionBn: 'সিলেট',
    upazilas: ['Moulvibazar Sadar', 'Sreemangal', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Barlekha', 'Juri'],
    headquarters: 'Moulvibazar',
    postalCode: '3200'
  },
  {
    id: 'DIST-HABIGANJ',
    en: 'HABIGANJ',
    bn: 'হবিগঞ্জ',
    divisionEn: 'SYLHET',
    divisionBn: 'সিলেট',
    upazilas: ['Habiganj Sadar', 'Madhabpur', 'Chunarughat', 'Bahubal', 'Nabiganj', 'Baniachong', 'Ajmiriganj', 'Lakhai'],
    headquarters: 'Habiganj',
    postalCode: '3300'
  },
  {
    id: 'DIST-SUNAMGANJ',
    en: 'SUNAMGANJ',
    bn: 'সুনামগঞ্জ',
    divisionEn: 'SYLHET',
    divisionBn: 'সিলেট',
    upazilas: ['Sunamganj Sadar', 'Chhatak', 'Jagannathpur', 'Derai', 'Dharampasha', 'Tahirpur', 'Bishwamvarpur', 'Shantiganj'],
    headquarters: 'Sunamganj',
    postalCode: '3000'
  },

  // --- 7. RANGPUR DIVISION (8 Districts) ---
  {
    id: 'DIST-RANGPUR',
    en: 'RANGPUR',
    bn: 'রংপুর',
    divisionEn: 'RANGPUR',
    divisionBn: 'রংপুর',
    upazilas: ['Rangpur Sadar', 'Gangachara', 'Taraganj', 'Badarganj', 'Pirgachha', 'Kaunia', 'Pirganj', 'Mithapukur'],
    headquarters: 'Rangpur',
    postalCode: '5400'
  },
  {
    id: 'DIST-DINAJPUR',
    en: 'DINAJPUR',
    bn: 'দিনাজপুর',
    divisionEn: 'RANGPUR',
    divisionBn: 'রংপুর',
    upazilas: ['Dinajpur Sadar', 'Birganj', 'Kaharole', 'Bochaganj', 'Birol', 'Phulbari', 'Parbatipur', 'Nawabganj', 'Ghoraghat'],
    headquarters: 'Dinajpur',
    postalCode: '5200'
  },
  {
    id: 'DIST-KURIGRAM',
    en: 'KURIGRAM',
    bn: 'কুড়িগ্রাম',
    divisionEn: 'RANGPUR',
    divisionBn: 'রংপুর',
    upazilas: ['Kurigram Sadar', 'Nageshwari', 'Bhurungamari', 'Phulbari', 'Rajarhat', 'Ulipur', 'Chilmari', 'Rowmari'],
    headquarters: 'Kurigram',
    postalCode: '5600'
  },
  {
    id: 'DIST-GAIBANDHA',
    en: 'GAIBANDHA',
    bn: 'গাইবান্ধা',
    divisionEn: 'RANGPUR',
    divisionBn: 'রংপুর',
    upazilas: ['Gaibandha Sadar', 'Sadullapur', 'Gobindaganj', 'Sundarganj', 'Palashbari', 'Saghata', 'Fulchhari'],
    headquarters: 'Gaibandha',
    postalCode: '5700'
  },
  {
    id: 'DIST-NILPHAMARI',
    en: 'NILPHAMARI',
    bn: 'নীলফামারী',
    divisionEn: 'RANGPUR',
    divisionBn: 'রংপুর',
    upazilas: ['Nilphamari Sadar', 'Saidpur', 'Jaldhaka', 'Kishoreganj', 'Domar', 'Dimla'],
    headquarters: 'Nilphamari',
    postalCode: '5300'
  },
  {
    id: 'DIST-PANCHAGARH',
    en: 'PANCHAGARH',
    bn: 'পঞ্চগড়',
    divisionEn: 'RANGPUR',
    divisionBn: 'রংপুর',
    upazilas: ['Panchagarh Sadar', 'Debiganj', 'Boda', 'Atwari', 'Tetulia'],
    headquarters: 'Panchagarh',
    postalCode: '5000'
  },
  {
    id: 'DIST-THAKURGAON',
    en: 'THAKURGAON',
    bn: 'ঠাকুরগাঁও',
    divisionEn: 'RANGPUR',
    divisionBn: 'রংপুর',
    upazilas: ['Thakurgaon Sadar', 'Pirganj', 'Ranisankail', 'Haripur', 'Baliadangi'],
    headquarters: 'Thakurgaon',
    postalCode: '5100'
  },
  {
    id: 'DIST-LALMONIRHAT',
    en: 'LALMONIRHAT',
    bn: 'লালমনিরহাট',
    divisionEn: 'RANGPUR',
    divisionBn: 'রংপুর',
    upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Kaliganj', 'Hatibandha', 'Patgram'],
    headquarters: 'Lalmonirhat',
    postalCode: '5500'
  },

  // --- 8. MYMENSINGH DIVISION (4 Districts) ---
  {
    id: 'DIST-MYMENSINGH',
    en: 'MYMENSINGH',
    bn: 'ময়মনসিংহ',
    divisionEn: 'MYMENSINGH',
    divisionBn: 'ময়মনসিংহ',
    upazilas: ['Mymensingh Sadar', 'Trishal', 'Bhaluka', 'Muktagachha', 'Gafargaon', 'Ishwarganj', 'Nandail', 'Fulpur', 'Haluaghat'],
    headquarters: 'Mymensingh',
    postalCode: '2200'
  },
  {
    id: 'DIST-JAMALPUR',
    en: 'JAMALPUR',
    bn: 'জামালপুর',
    divisionEn: 'MYMENSINGH',
    divisionBn: 'ময়মনসিংহ',
    upazilas: ['Jamalpur Sadar', 'Melandaha', 'Islampur', 'Dewanganj', 'Sarishabari', 'Madarganj', 'Baksiganj'],
    headquarters: 'Jamalpur',
    postalCode: '2000'
  },
  {
    id: 'DIST-NETROKONA',
    en: 'NETROKONA',
    bn: 'নেত্রকোণা',
    divisionEn: 'MYMENSINGH',
    divisionBn: 'ময়মনসিংহ',
    upazilas: ['Netrokona Sadar', 'Barhatta', 'Durgapur', 'Kendua', 'Atpara', 'Madan', 'Mohanganj', 'Purbadhala', 'Kalmakanda'],
    headquarters: 'Netrokona',
    postalCode: '2400'
  },
  {
    id: 'DIST-SHERPUR',
    en: 'SHERPUR',
    bn: 'শেরপুর',
    divisionEn: 'MYMENSINGH',
    divisionBn: 'ময়মনসিংহ',
    upazilas: ['Sherpur Sadar', 'Nalitabari', 'Nakla', 'Jhenaigati', 'Sreebardi'],
    headquarters: 'Sherpur',
    postalCode: '2100'
  }
];

export function getAllDistricts(): DistrictInfo[] {
  return BD_64_DISTRICTS;
}

export function getDistrictsByDivision(div: string): DistrictInfo[] {
  const clean = div.trim().toUpperCase();
  return BD_64_DISTRICTS.filter(d => d.divisionEn === clean || d.divisionBn === div.trim());
}

export function getDistrictByName(name: string): DistrictInfo | null {
  const clean = name.trim().toUpperCase();
  return BD_64_DISTRICTS.find(d => d.en === clean || d.bn === name.trim()) || null;
}

export function getRandomUpazila(districtEnOrBn: string): string {
  const dist = getDistrictByName(districtEnOrBn);
  if (!dist || dist.upazilas.length === 0) return 'Sadar';
  return dist.upazilas[Math.floor(Math.random() * dist.upazilas.length)];
}