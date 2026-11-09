const orgs = [
  { id: 754, name: 'Supreme Court of Bangladesh (HCD)', short: 'HCD' },
  { id: 609, name: 'Bangladesh Cable Shilpa Limited (BCSL)', short: 'BCSL' },
  { id: 1150, name: 'Office of the Deputy Commissioner,Bagerhat(DCBAGERHAT)', short: 'DCBAGERHAT' },
  { id: 994, name: 'Bangladesh Hi-Tech Park Authorit(BHTPA)', short: 'BHTPA' },
  { id: 740, name: 'DC OFFICE JAMALPUR (DCJAMALPUR)', short: 'DCJAMALPUR' },
  { id: 459, name: 'Directorate General of Medical Service (DGMS)', short: 'DGMS' },
  { id: 1170, name: 'Comptroller and Auditor General of Bangladesh(CAG)', short: 'CAG' },
  { id: 632, name: 'DC OFFICE RAJBARI (DCRAJBARI)', short: 'DCRAJBARI' },
  { id: 635, name: 'Dhaka South City Corporation (DSCC)', short: 'DSCC' },
  { id: 397, name: 'Coal Power Generation Company Bangladesh Limited (CPGCBL)', short: 'CPGCBL' },
  { id: 1151, name: 'DC Office Jhenaidah(dcjhenaidah)', short: 'dcjhenaidah' },
  { id: 289, name: 'Ashuganj Power Station Company Ltd. (APSCL)', short: 'APSCL' },
  { id: 1125, name: 'Bangladesh Armed Services Board(BASB)', short: 'BASB' },
  { id: 974, name: 'Income Tax Intelligence and Investigation Unit(ITIIU)', short: 'ITIIU' },
  { id: 993, name: 'Taxes Zone-19, Dhaka(TAX19)', short: 'TAX19' },
  { id: 559, name: 'Narail Distric (DCNARAIL)', short: 'DCNARAIL' },
  { id: 1168, name: 'Department of National Savings(NSD)', short: 'NSD' },
  { id: 1167, name: 'Taxes Zone-Narayanganj(TAXNAR)', short: 'TAXNAR' },
  { id: 760, name: 'DC Office Chuadanga (DCCHUADANGA)', short: 'DCCHUADANGA' },
  { id: 1166, name: 'Office of the Superintendent of Police, Sherpur(SPOSHERPUR)', short: 'SPOSHERPUR' }
];

function mapCategory(name, shortName = '') {
  const combined = (name + ' ' + shortName).toLowerCase();

  // 1. Defense & Law Enforcement
  if (
    combined.includes('dgms') ||
    combined.includes('armed services') ||
    combined.includes('basb') ||
    combined.includes('police') ||
    combined.includes('পুলিশ') ||
    combined.includes('sposherpur') ||
    combined.includes('প্রতিরক্ষা') ||
    combined.includes('সেনাবাহিনী') ||
    combined.includes('ansar') ||
    combined.includes('bgb')
  ) {
    return { category: 'defense', categoryLabel: 'প্রতিরক্ষা ও শৃঙ্খলা বাহিনী' };
  }

  // 2. Engineering, Power, Industrial
  if (
    combined.includes('cable') ||
    combined.includes('bcsl') ||
    combined.includes('shilpa') ||
    combined.includes('cpgcbl') ||
    combined.includes('apscl') ||
    combined.includes('power') ||
    combined.includes('বিদ্যুৎ') ||
    combined.includes('ইঞ্জিনিয়ারিং') ||
    combined.includes('engineer') ||
    combined.includes('bpdb') ||
    combined.includes('reb') ||
    combined.includes('desco') ||
    combined.includes('dpdc') ||
    combined.includes('pgcb')
  ) {
    return { category: 'engineer', categoryLabel: 'শিল্প ও প্রকৌশল খাত' };
  }

  // 3. Railway
  if (combined.includes('railway') || combined.includes('রেলওয়ে')) {
    return { category: 'railway', categoryLabel: 'বাংলাদেশ রেলওয়ে' };
  }

  // 4. Health
  if (
    (combined.includes('medical') && !combined.includes('dgms')) ||
    combined.includes('health') ||
    combined.includes('চিকিৎসা') ||
    combined.includes('হাসপাতাল') ||
    combined.includes('dghs') ||
    combined.includes('dgfp')
  ) {
    return { category: 'health', categoryLabel: 'স্বাস্থ্য ও পরিবার কল্যাণ' };
  }

  // 5. Teacher / Education
  if (
    combined.includes('teacher') ||
    combined.includes('শিক্ষক') ||
    combined.includes('শিক্ষা') ||
    combined.includes('school') ||
    combined.includes('college') ||
    combined.includes('dshe') ||
    combined.includes('dpe')
  ) {
    return { category: 'teacher', categoryLabel: 'শিক্ষা ও শিক্ষক নিয়োগ' };
  }

  // 6. Bank (Word boundary check to avoid "river bank")
  if (/\b(bank|banking)\b/i.test(combined) || combined.includes('ব্যাংক')) {
    return { category: 'bank', categoryLabel: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান' };
  }

  // 7. General Government & Judiciary
  if (
    combined.includes('supreme court') ||
    combined.includes('hcd') ||
    combined.includes('হাইকোর্ট') ||
    combined.includes('আদালত') ||
    combined.includes('বিচার')
  ) {
    return { category: 'govt', categoryLabel: 'সরকারি ও বিচার বিভাগ' };
  }

  return { category: 'govt', categoryLabel: 'সরকারি চাকরি ও প্রশাসন' };
}

orgs.forEach((o, i) => {
  const cat = mapCategory(o.name, o.short);
  console.log(`${i+1}. [${o.short}] ${o.name} => ${cat.category} (${cat.categoryLabel})`);
});

