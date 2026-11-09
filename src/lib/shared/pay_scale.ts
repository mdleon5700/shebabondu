/**
 * Bangladesh National Pay Scale 2015 (জাতীয় বেতন স্কেল ২০১৫) & Teletalk Exam Fee Matrix
 * Pure isomorphic TypeScript - safe for both Server and Client (Next.js)
 */

export interface GradeSalaryResult {
  grade: string;
  salary: string;
  govtFee: number;
  minEducation: string;
}

export const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const toBn = (n: number | string | undefined | null): string => {
  if (n === undefined || n === null) return '';
  return String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
};

export const toEn = (str: string | undefined | null): string => {
  if (!str) return '';
  return String(str).replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);
};

export function formatBnDate(dateStr: string): string {
  try {
    if (!dateStr) return '';
    const enStr = toEn(dateStr.trim());
    const d = new Date(enStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = toBn(d.getDate());
    const month = MONTH_NAMES_BN[d.getMonth()];
    const year = toBn(d.getFullYear());
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * High-Precision National Pay Scale 2015 & Teletalk Govt Examination Fee Resolver
 * Accurately determines individual Civil Service grade, salary, official exam fee, and qualifications.
 */
export function inferPositionGradeAndSalary(title: string): GradeSalaryResult {
  const t = (title || '').toLowerCase().trim();

  // 1. Grade 9 / First Class Officers (২২,০০০ - ৫৩,০৬০/-, সরকারি ফি: ২২৩/-)
  if (
    t.includes('সহকারী পরিচালক') || t.includes('assistant director') ||
    t.includes('সহকারী ব্যবস্থাপক') || t.includes('assistant manager') ||
    ((t.includes('সহকারী প্রকৌশলী') || t.includes('assistant engineer')) && !t.includes('উপ-সহকারী') && !t.includes('উপসহকারী') && !t.includes('sub-assistant') && !t.includes('sub assistant')) ||
    t.includes('মেডিকেল অফিসার') || t.includes('medical officer') ||
    t.includes('সহকারী প্রোগ্রামার') || t.includes('assistant programmer') ||
    t.includes('বৈজ্ঞানিক কর্মকর্তা') || t.includes('scientific officer') ||
    t.includes('পরিসংখ্যান কর্মকর্তা') || t.includes('statistical officer') ||
    t.includes('গবেষণা কর্মকর্তা') || t.includes('research officer') ||
    t.includes('প্রভাষক') || t.includes('lecturer') ||
    (t.includes('রসায়নবিদ') && !t.includes('সহকারী') && !t.includes('উপ')) || (t.includes('chemist') && !t.includes('sub-assistant') && !t.includes('sub assistant')) ||
    t.includes('geologist') || t.includes('ভূ-তত্ত্ববিদ') || t.includes('geophysicist') ||
    t.includes('investigation officer') || t.includes('verification officer') ||
    (t.includes('কর্মকর্তা') && (t.includes('১ম') || t.includes('প্রথম শ্রেণি') || t.includes('ক্লাস-১'))) ||
    (t.includes('ব্যবস্থাপক') && !t.includes('সহকারী')) ||
    (t.includes('পরিচালক') && !t.includes('সহকারী') && !t.includes('উপ'))
  ) {
    return {
      grade: '৯ম গ্রেড',
      salary: '২২,০০০ - ৫৩,০৬০/- টাকা',
      govtFee: 223,
      minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে সংশ্লিষ্ট বিষয়ে ন্যূনতম ১ম শ্রেণি বা সমমানের সিজিপিএসহ ৪ বছর মেয়াদি স্নাতক (সম্মান) বা স্নাতকোত্তর ডিগ্রি'
    };
  }

  // 2. Grade 10 / Second Class Officers (১৬,০০০ - ৩৮,৬৪০/-, সরকারি ফি: ২২৩/-)
  if (
    t.includes('উপ-সহকারী প্রকৌশলী') || t.includes('উপসহকারী প্রকৌশলী') || t.includes('sub-assistant engineer') || t.includes('sub assistant engineer') ||
    t.includes('প্রশাসনিক কর্মকর্তা') || t.includes('administrative officer') ||
    t.includes('হিসাব রক্ষণ কর্মকর্তা') || t.includes('হিসাবরক্ষণ কর্মকর্তা') || t.includes('accounts officer') ||
    t.includes('ব্যক্তিগত কর্মকর্তা') || t.includes('personal officer') ||
    t.includes('সহকারী কর্মকর্তা') || t.includes('assistant officer') ||
    t.includes('সহকারী কারিগরি কর্মকর্তা') || t.includes('assistant technical officer') ||
    t.includes('কারিগরি কর্মকর্তা') || t.includes('technical officer') ||
    t.includes('নিরাপত্তা কর্মকর্তা') || t.includes('security officer') || t.includes('assistant security officer') ||
    t.includes('বাণিজ্যিক কর্মকর্তা') || t.includes('commercial officer') || t.includes('assistant commercial officer') ||
    t.includes('অপারেশন কর্মকর্তা') || t.includes('operations officer') || t.includes('assistant operations officer') ||
    t.includes('সহকারী গ্রন্থাগারিক') || t.includes('assistant librarian') || t.includes('librarian') || t.includes('গ্রন্থাগারিক') || t.includes('লাইব্রেরিয়ান') ||
    t.includes('সহকারী ড্রিলার') || t.includes('assistant driller') ||
    t.includes('উপ-সহকারী রসায়নবিদ') || t.includes('sub-assistant chemist') || t.includes('sub assistant chemist') ||
    t.includes('সহকারী শিক্ষক') || t.includes('assistant teacher') ||
    t.includes('নার্স') || t.includes('nurse') ||
    t.includes('সাব-ইন্সপেক্টর') || t.includes('sub-inspector') ||
    t.includes('কানুনগো') || t.includes('রাজস্ব পরিদর্শক') ||
    t.includes('জুনিয়র অফিসার') || t.includes('junior officer') ||
    (t.includes('কর্মকর্তা') && (t.includes('২য়') || t.includes('দ্বিতীয় শ্রেণি') || t.includes('ক্লাস-২')))
  ) {
    return {
      grade: '১০ম গ্রেড',
      salary: '১৬,০০০ - ৩৮,৬৪০/- টাকা',
      govtFee: 223,
      minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক ডিগ্রি অথবা সরকার স্বীকৃত পলিটেকনিক ইনস্টিটিউট হতে ৪ বছর মেয়াদি ডিপ্লোমা-ইন-ইঞ্জিনিয়ারিং'
    };
  }

  // 3. Grade 11 (১২,৫০০ - ৩২,২৪০/-, সরকারি ফি: ২২৩/- বা ১১২/-)
  if (
    t.includes('প্রধান সহকারী') || t.includes('head clerk') || t.includes('head assistant') ||
    t.includes('সহকারী হিসাবরক্ষক') || t.includes('হিসাবরক্ষক') || t.includes('accountant') ||
    (t.includes('অডিটর') && !t.includes('জুনিয়র') && !t.includes('অপারেটর')) ||
    (t.includes('auditor') && !t.includes('junior') && !t.includes('operator')) ||
    t.includes('সহকারী কর পরিদর্শক') || t.includes('assistant tax inspector')
  ) {
    return {
      grade: '১১তম গ্রেড',
      salary: '১২,৫০০ - ৩২,২৪০/- টাকা',
      govtFee: 223,
      minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে বাণিজ্য/বিজ্ঞান/মানবিকে ন্যূনতম ২য় শ্রেণি বা সমমানের সিজিপিএসহ স্নাতক বা সমমানের ডিগ্রি'
    };
  }

  // 4. Grade 12 (১১,৩০০ - ২৭,৩০০/-, সরকারি ফি: ১১২/-)
  if (
    t.includes('জুনিয়র অডিটর') || t.includes('junior auditor') ||
    t.includes('সার্ভেয়ার') || t.includes('surveyor') ||
    t.includes('ফটোগ্রাফার') || t.includes('photographer') ||
    t.includes('ক্যামেরাম্যান') || t.includes('সিনিয়র টেকনিশিয়ান') || t.includes('senior technician')
  ) {
    return {
      grade: '১২তম গ্রেড',
      salary: '১১,৩০০ - ২৭,৩০০/- টাকা',
      govtFee: 112,
      minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক বা সমমানের ডিগ্রি অথবা সার্ভে বা সংশ্লিষ্ট বিষয়ে ডিপ্লোমা'
    };
  }

  // 5. Grade 13 (১১,০০০ - ২৬,৫৯০/-, সরকারি ফি: ১১২/-)
  if (
    t.includes('সাঁটলিপিকার') || t.includes('stenographer') ||
    t.includes('ব্যক্তিগত সহকারী') || t.includes('personal assistant') ||
    t.includes('অর্থ সহকারী') || t.includes('মূল্যায়ন সহকারী') ||
    t.includes('সিনিয়র ডাটা এন্ট্রি') || t.includes('senior data entry')
  ) {
    return {
      grade: '১৩তম গ্রেড',
      salary: '১১,০০০ - ২৬,৫৯০/- টাকা',
      govtFee: 112,
      minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে অন্যূন দ্বিতীয় শ্রেণি বা সমমানের সিজিপিএসহ স্নাতক বা সমমানের ডিগ্রি এবং সাঁটলিপিতে প্রতি মিনিটে নির্ধারিত গতি'
    };
  }

  // 6. Grade 14 (১০,২০০ - ২৪,৬৮০/-, সরকারি ফি: ২১২/-)
  if (
    t.includes('উচ্চমান সহকারী') || t.includes('upper division assistant') || t.includes('u.d.a') || t.includes('uda') ||
    t.includes('সাঁট-মুদ্রাক্ষরিক') || t.includes('সাঁট মুদ্রাক্ষরিক') || t.includes('স্টেনো-টাইপিস্ট') || t.includes('steno-typist') || t.includes('stenotypist') ||
    t.includes('কম্পিউটার অপারেটর') || t.includes('computer operator') ||
    t.includes('ডাটা এন্ট্রি') || t.includes('data entry') || t.includes('কন্ট্রোল অপারেটর') ||
    t.includes('ড্রাফটসম্যান') || t.includes('draftsman') ||
    t.includes('অডিটর-কাম-কম্পিউটার') || t.includes('auditor-cum-computer') ||
    t.includes('বেঞ্চ সহকারী') || t.includes('bench assistant') ||
    t.includes('পেশকার') || t.includes('peshkar') ||
    t.includes('গবেষণা সহকারী') || t.includes('research assistant')
  ) {
    return {
      grade: '১৪তম গ্রেড',
      salary: '১০,২০০ - ২৪,৬৮০/- টাকা',
      govtFee: 212,
      minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে অন্যূন দ্বিতীয় শ্রেণি বা সমমানের সিজিপিএসহ স্নাতক বা সমমানের ডিগ্রি; সাঁটলিপিতে প্রতি মিনিটে সর্বনিম্ন গতি বাংলায় ৪৫ ও ইংরেজিতে ৭০ শব্দ এবং কম্পিউটার টাইপিংয়ে বাংলায় ২৫ ও ইংরেজিতে ৩০ শব্দ'
    };
  }

  // 7. Grade 15 (৯,৭০০ - ২৩,৪৯০/-, সরকারি ফি: ১১২/-)
  if (
    t.includes('স্টোরকিপার') || t.includes('স্টোর কিপার') || t.includes('storekeeper') ||
    t.includes('ক্যাশিয়ার') || t.includes('cashier') ||
    t.includes('নাজির') || t.includes('nazir') ||
    t.includes('ভারী গাড়ী চালক') || t.includes('heavy driver')
  ) {
    return {
      grade: '১৫তম গ্রেড',
      salary: '৯,৭০০ - ২৩,৪৯০/- টাকা',
      govtFee: 112,
      minEducation: 'উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ এবং সংশ্লিষ্ট কাজে ৩ বছরের অভিজ্ঞতা'
    };
  }

  // 8. Grade 16: "অফিস সহকারী", "মুদ্রাক্ষরিক", "টাইপিস্ট", "সহকারী", "চালক", "প্রকর্মী" (৯,৩০০ - ২২,৪৯০/-, সরকারি ফি: ১১২/-)
  if (
    t.includes('অফিস সহকারী') || t.includes('office assistant') ||
    t.includes('কম্পিউটার মুদ্রাক্ষরিক') || t.includes('computer typist') || t.includes('মুদ্রাক্ষরিক') || t.includes('typist') ||
    t.includes('হিসাব সহকারী') || t.includes('accounts assistant') ||
    t.includes('সার্টিফিকেট সহকারী') || t.includes('certificate assistant') ||
    t.includes('সার্টিফিকেট পেশকার') || t.includes('certificate peshkar') ||
    t.includes('সায়রাত সহকারী') || t.includes('sayrat assistant') ||
    t.includes('নামজারি সহকারী') || t.includes('mutation') ||
    t.includes('finance assistant') || t.includes('costing assistant') ||
    t.includes('junior assistant') ||
    t.includes('গ্রন্থাগার সহকারী') || t.includes('library assistant') ||
    t.includes('নকলনবিশ') || t.includes('copyist') ||
    t.includes('পরিবার কল্যাণ সহকারী') || t.includes('family welfare assistant') || t.includes('fwa') || t.includes('f w a') ||
    t.includes('টেকনিশিয়ান') || t.includes('technician') ||
    t.includes('ট্রেইনি ড্রিলার') || t.includes('trainee driller') ||
    ((t.includes('গাড়ি') || t.includes('গাড়ী') || t.includes('যানবাহন')) && t.includes('চালক')) ||
    t.includes('গাড়ীচালক') || t.includes('গাড়িচালক') || t.includes('ড্রাইভার') || t.includes('driver') ||
    t.includes('স্পীডবোট চালক') || t.includes('speed boat driver') ||
    (t.includes('চালক') && !t.includes('মেশিন') && !t.includes('পাম্প') && !t.includes('যন্ত্র')) ||
    t.includes('ইলেকট্রিশিয়ান') || t.includes('electrician') ||
    t.includes('প্রকর্মী') ||
    t.includes('টেলিফোন অপারেটর') ||
    t.includes('সহকারী স্টোরকিপার') ||
    t.includes('রেকর্ড কিপার') || t.includes('record keeper')
  ) {
    const isDriver = t.includes('চালক') || t.includes('ড্রাইভার') || t.includes('driver');
    return {
      grade: '১৬তম গ্রেড',
      salary: '৯,৩০০ - ২২,৪৯০/- টাকা',
      govtFee: 112,
      minEducation: isDriver
        ? 'কোনো স্বীকৃত বোর্ড হতে জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) বা অষ্টম শ্রেণি পাস এবং হালকা/ভারী যানবাহন চালনার বৈধ ড্রাইভিং লাইসেন্স'
        : 'কোনো স্বীকৃত বোর্ড হতে অন্যূন দ্বিতীয় বিভাগ বা সমমানের জিপিএতে উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ এবং কম্পিউটার টাইপিংয়ে প্রতি মিনিটে বাংলায় ২০ ও ইংরেজিতে ২০ শব্দের গতি'
    };
  }

  // 9. Grade 17 (৯,০০০ - ২১,৮০০/-, সরকারি ফি: ৫৬/-)
  if (
    t.includes('ট্রেসার') || t.includes('tracer') ||
    t.includes('লাইব্রেরি অ্যাটেনডেন্ট') || t.includes('library attendant')
  ) {
    return {
      grade: '১৭তম গ্রেড',
      salary: '৯,০০০ - ২১,৮০০/- টাকা',
      govtFee: 56,
      minEducation: 'কোনো স্বীকৃত বোর্ড হতে মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ'
    };
  }

  // 10. Grade 18 (৮,৮০০ - ২১,৩১০/-, সরকারি ফি: ৫৬/-)
  if (
    t.includes('দপ্তরি') || t.includes('daftari') ||
    t.includes('পাইপ মিস্ত্রি') || t.includes('plumber') ||
    t.includes('ফিটার') || t.includes('fitter') ||
    t.includes('পাম্প চালক') || t.includes('pump operator') ||
    t.includes('ফায়ারম্যান') || t.includes('fireman') ||
    t.includes('রেকর্ড সরবরাহকারী') || t.includes('রেকর্ড সাপ্লায়ার') || t.includes('record supplier')
  ) {
    return {
      grade: '১৮তম গ্রেড',
      salary: '৮,৮০০ - ২১,৩১০/- টাকা',
      govtFee: 56,
      minEducation: 'কোনো স্বীকৃত বোর্ড হতে মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ এবং সংশ্লিষ্ট ট্রেডে বাস্তব কর্ম অভিজ্ঞতা'
    };
  }

  // 11. Grade 19 (৮,৫০০ - ২০,৫৭০/-, সরকারি ফি: ৫৬/-)
  if (
    t.includes('ফটোস্ট্যাট') || t.includes('photostat') ||
    t.includes('ডুপ্লিকেটিং') || t.includes('duplicating') ||
    t.includes('বুক বাইন্ডার') || t.includes('book binder') ||
    t.includes('মেশিন চালক') || (t.includes('মেশিন') && t.includes('অপারেটর')) || t.includes('machine operator') ||
    t.includes('নোটিশ সার্ভার') || t.includes('notice server') || t.includes('নোটিশ জারিকারক') || t.includes('নোটিশ জারি কারক')
  ) {
    return {
      grade: '১৯তম গ্রেড',
      salary: '৮,৫০০ - ২০,৫৭০/- টাকা',
      govtFee: 56,
      minEducation: 'কোনো স্বীকৃত বোর্ড হতে মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ এবং সংশ্লিষ্ট মেশিন পরিচালনায় বাস্তব অভিজ্ঞতা'
    };
  }

  // 12. Grade 20 (৮,২৫০ - ২০,০১০/-, সরকারি ফি: ৫৬/-)
  return {
    grade: '২০তম গ্রেড',
    salary: '৮,২৫০ - ২০,০১০/- টাকা',
    govtFee: 56,
    minEducation: 'কোনো স্বীকৃত বোর্ড হতে মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ (বা অষ্টম শ্রেণি/জেএসসি উত্তীর্ণ)'
  };
}

