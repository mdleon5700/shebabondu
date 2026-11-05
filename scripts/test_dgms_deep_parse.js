const fs = require('fs');
const path = require('path');

let txt = fs.readFileSync(path.join(__dirname, '..', 'dgms_extracted_text.txt'), 'utf8');

// 1. Repair common distorted font glyphs
const glyphMap = [
  [/সামিরক\s*িচিকৎসা\s*সািভȟস\s*মহাপিরদ˖র/g, 'সামরিক চিকিৎসা সার্ভিস মহাপরিদপ্তর'],
  [/ɓাফটসΖান/g, 'ড্রাফটসম্যান'],
  [/কি˫উটার\s*ӑɘাɻিরক/g, 'কম্পিউটার মুদ্রাক্ষরিক'],
  [/এফ\s*ডিˣউ\s*এ[\s\S]*?এɇািসসেট˂\)?/g, 'এফডিডব্লিউএ (ফ্যামিলি ওয়েলফেয়ার অ্যাসিস্ট্যান্ট)'],
  [/অিʁিনব\s*ȟাপক/g, 'অগ্নিনির্বাপক (ফায়ার ফাইটার)'],
  [/অিফস\s*সহায়ক/g, 'অফিস সহায়ক'],
  [/বাӋিচ\s*ȟ/g, 'বাবুর্চি'],
  [/সহকারী\s*বাӋিচ\s*ȟ/g, 'সহকারী বাবুর্চি'],
  [/ǯমসওেয়টার/g, 'মেসওয়েটার'],
  [/পিরʑˑতাকম̭/g, 'পরিচ্ছন্নতাকর্মী'],
  [/আয়া/g, 'আয়া'],
  [/মালী/g, 'মালী'],
  [/ǯɊড[-–—\s]*([০-৯\d]+)/g, 'গ্রেড-$1'],
  [/মাΒিমক/g, 'মাধ্যমিক'],
  [/উʎ\s*মাΒিমক/g, 'উচ্চ মাধ্যমিক'],
  [/নেভͯ\s*র/g, 'নভেম্বর'],
  [/সািভȟস/g, 'সার্ভিস'],
  [/মহাপিরদ˖র/g, 'মহাপরিদপ্তর'],
  [/ɛিতরɻা/g, 'প্রতিরক্ষা'],
  [/মˈণালয়/g, 'মন্ত্রণালয়'],
  [/ǯসনািনবাস/g, 'সেনানিবাস'],
  [/িনেয়াগ/g, 'নিয়োগ'],
  [/িবʗি˖/g, 'বিজ্ঞপ্তি']
];
glyphMap.forEach(([r, s]) => { txt = txt.replace(r, s); });

// Match numbered items in table
const regex = /(?:^|\n)\s*([১-৯]|১০|১১|১২|১৩|১৪|১৫|১৬|১৭|১৮|১৯|২০)\s*[।\.]\s*([^\n]+)([\s\S]*?)(?=(?:\n\s*(?:[১-৯]|১০|১১|১২|১৩|১৪|১৫|১৬|১৭|১৮|১৯|২০)\s*[।\.])|$)/g;
const positions = [];
let match;
let expectedSerial = 1;

while ((match = regex.exec(txt)) !== null) {
  const serial = match[1];
  const title = match[2].trim();
  const body = match[3];

  const serialNum = parseInt(serial.replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]), 10);

  // If this item doesn't look like a job position or is general conditions header
  if (title.includes('সামরিক চিকিৎসা সার্ভিস') || title.includes('মহাপরিদপ্তর') || title.includes('বয়স') || title.includes('শর্তাবলী') || title.includes('বিবিধ')) {
    continue;
  }

  // Must match consecutive sequence 1, 2, 3...
  if (serialNum === expectedSerial) {
    // Extract Grade
    const gradeMatch = body.match(/গ্রেড[-–—\s]*([০-৯\d]+)/i) || body.match(/Grade[-–—\s]*(\d+)/i);
    const gradeNum = gradeMatch ? gradeMatch[1] : '';
    const grade = gradeNum ? (gradeNum + 'তম গ্রেড') : '২০তম গ্রেড';

    // Extract Posts / Vacancies: Look for single or double digit before salary scale
    const postsMatch = body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s+[০-৯\d,]{4,}/m) ||
                       body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s*টি/m) ||
                       body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s+/m);
    const rawPosts = postsMatch ? postsMatch[1] : '০১';
    const posts = parseInt(rawPosts.replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]), 10) || 1;

    // Extract Salary
    const salMatch = body.match(/([০-৯\d]{1,2},[০-৯\d]{3}\s*[-–—]\s*[০-৯\d]{1,2},?[০-৯\d]{3}\/?[-–—\/]*)/);
    const salary = salMatch ? salMatch[1].trim() + ' টাকা' : 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী';

    // Fee calculation (govt civil rules or notice rules)
    const govtFee = serialNum <= 3 ? 112 : 56;

    // Education
    let minEdu = 'মাধ্যমিক (এসএসসি) বা অষ্টম শ্রেণি পাস';
    if (body.includes('উচ্চ মাধ্যমিক') || body.includes('ডিপ্লোমা')) minEdu = 'উচ্চ মাধ্যমিক (এইচএসসি) বা ডিপ্লোমা সমমান';
    else if (body.includes('মাধ্যমিক') || body.includes('এসএসসি')) minEdu = 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান';
    else if (body.includes('অষ্টম') || body.includes('জেএসসি')) minEdu = 'অষ্টম শ্রেণি বা জেএসসি পাস';

    positions.push({
      serial,
      title,
      posts,
      grade,
      salary,
      govtFee,
      minEdu
    });

    expectedSerial++;
  } else if (positions.length > 0 && serialNum < expectedSerial) {
    // Numbering reset back to 1 -> Table has ended!
    break;
  }
}

console.log('Extracted Positions Count:', positions.length);
let totalPosts = 0;
positions.forEach(p => {
  totalPosts += p.posts;
  console.log(`${p.serial}। ${p.title} | ${p.grade} | শূন্যপদ: ${p.posts}টি | বেতন: ${p.salary} | ফি: ${p.govtFee} টাকা`);
});
console.log('TOTAL VACANCIES:', totalPosts);
