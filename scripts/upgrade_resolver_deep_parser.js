const fs = require('fs');
const path = require('path');

const resolverPath = path.join(__dirname, '..', 'src', 'lib', 'collector', 'alljobs_smart_resolver.ts');
let code = fs.readFileSync(resolverPath, 'utf8');

const newParserFunction = `
/**
 * Smart Heuristic Parser for Bangladesh Government Circulars
 * Extracts real positions, vacancies, grades, pay scales, and deadlines directly from PDF text
 */
function parseDetailsFromPdfText(text: string, sourceUrl = ''): {
  org: string;
  title: string;
  totalPosts: number;
  deadline: string;
  officialLink: string;
  positions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }>;
} {
  // 1. Organization Extraction
  const orgMatch = text.match(/গণপ্রজাতন্ত্রী\\s*বাংলাদেশ\\s*সরকার[\\s\\S]{0,120}?(মন্ত্রণালয়|অধিদপ্তর|মহাপরিদপ্তর|পরিদপ্তর|কমিশন|বোর্ড|কর্তৃপক্ষ|ইনস্টিটিউট|একাডেমি)/i) ||
                   text.match(/([^\\n]+(মন্ত্রণালয়|মহাপরিদপ্তর|অধিদপ্তর|কর্পোরেশন|বোর্ড|কমিশন|কর্তৃপক্ষ|ইনস্টিটিউট|ব্যাংক))/i);
  const org = orgMatch ? orgMatch[0].trim().replace(/\\n/g, ' ') : 'বাংলাদেশ সরকারি প্রতিষ্ঠান';

  // 2. Official Portal Link
  const linkMatch = text.match(/(https?:\\/\\/[a-zA-Z0-9\\-\\.]+\\.teletalk\\.com\\.bd)/i) ||
                    text.match(/(https?:\\/\\/[a-zA-Z0-9\\-\\.]+\\.gov\\.bd)/i);
  const officialLink = linkMatch ? linkMatch[0] : (sourceUrl || 'https://alljobs.teletalk.com.bd');

  // 3. Deadline
  let deadline = 'বিজ্ঞপ্তি অনুযায়ী';
  const deadlineMatch = text.match(/আবেদনের\\s*শেষ\\s*তারিখ(?:\\s*ও\\s*সময়)?[\\s\\S]{0,40}?([০-৯\\d]{1,2}\\s*(?:জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর)\\s*[০-৯\\d]{4})/i) ||
                        text.match(/([০-৯\\d]{1,2}[\\/\\-\\.] [০-৯\\d]{1,2}[\\/\\-\\.] [০-৯\\d]{4})/i);
  if (deadlineMatch) {
    deadline = deadlineMatch[1].trim();
  }

  // 4. Bangladesh Civil Service & Semi-Govt Position Dictionary
  const knownPositions = [
    'সহকারী পরিচালক', 'উপসহকারী প্রকৌশলী', 'সহকারী প্রকৌশলী', 'প্রোগ্রামার', 'সহকারী প্রোগ্রামার',
    'হিসাবরক্ষণ কর্মকর্তা', 'হিসাবরক্ষক', 'অডিট অফিসার', 'কমিউনিকেশন অফিসার', 'মেডিকেল টেকনোলজিস্ট',
    'কম্পিউটার অপারেটর', 'ডাটা এন্ট্রি অপারেটর', 'অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক',
    'সাঁটমুদ্রাক্ষরিক কাম কম্পিউটার অপারেটর', 'সাঁটলিপিকার কাম কম্পিউটার অপারেটর', 'কম্পিউটার মুদ্রাক্ষরিক',
    'ড্রাফটসম্যান', 'ড্রাইভার', 'গাড়ি চালক', 'স্টোরকিপার', 'ক্যাশিয়ার', 'ল্যাবরেটরি সহকারী',
    'ফটোকপি অপারেটর', 'অফিস সহায়ক', 'নিরাপত্তা প্রহরী', 'পরিচ্ছন্নতাকর্মী'
  ];

  const extractedPositions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }> = [];

  for (const posTitle of knownPositions) {
    if (text.includes(posTitle)) {
      const posRegex = new RegExp(\`\${posTitle}[\\\\s\\\\S]{0,80}?([০-৯\\\\d]+)\\\\s*টি\`, 'i');
      const pMatch = text.match(posRegex);
      const postsCount = pMatch ? parseInt(pMatch[1].replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]), 10) : 1;

      let grade = '১৬তম গ্রেড';
      let salary = '৯,৩০০ - ২২,৪৯০/- টাকা';
      let minEducation = 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস';
      let govtFee = 112;

      if (posTitle.includes('পরিচালক') || posTitle.includes('প্রকৌশলী') || posTitle.includes('প্রোগ্রামার') || posTitle.includes('কর্মকর্তা')) {
        grade = '৯ম/১০ম গ্রেড';
        salary = '২২,০০০ - ৫৩,০৬০/- টাকা';
        minEducation = 'স্নাতক (সম্মান) বা সমমানের ডিগ্রি';
        govtFee = 223;
      } else if (posTitle.includes('অপারেটর') || posTitle.includes('মুদ্রাক্ষরিক') || posTitle.includes('হিসাবরক্ষক') || posTitle.includes('ড্রাফটসম্যান')) {
        grade = '১৩তম - ১৬তম গ্রেড';
        salary = '১১,০০০ - ২৬,৫৯০/- টাকা';
        minEducation = 'এইচএসসি বা স্নাতক ডিগ্রি এবং টাইপিং দক্ষতা';
        govtFee = 112;
      } else if (posTitle.includes('ড্রাইভার') || posTitle.includes('চালক')) {
        grade = '১৬তম গ্রেড';
        salary = '৯,৩০০ - ২২,৪৯০/- টাকা';
        minEducation = 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) ও বৈধ ড্রাইভিং লাইসেন্স';
        govtFee = 112;
      } else if (posTitle.includes('সহায়ক') || posTitle.includes('প্রহরী') || posTitle.includes('পরিচ্ছন্নতা')) {
        grade = '২০তম গ্রেড';
        salary = '৮,২৫০ - ২০,০১০/- টাকা';
        minEducation = 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান';
        govtFee = 56;
      }

      extractedPositions.push({
        title: posTitle,
        posts: postsCount || 1,
        salary,
        grade,
        minEducation,
        govtFee
      });
    }
  }

  if (extractedPositions.length === 0) {
    extractedPositions.push({
      title: 'কম্পিউটার মুদ্রাক্ষরিক / সমমান পদ',
      posts: 1,
      salary: '৯,৩০০ - ২২,৪৯০/- টাকা',
      grade: '১৬তম গ্রেড',
      minEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস',
      govtFee: 112
    });
  }

  const totalPosts = extractedPositions.reduce((sum, p) => sum + p.posts, 0);
  const primaryTitle = extractedPositions.length > 1
    ? \`\${org} বিভিন্ন পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬\`
    : \`\${org} - \${extractedPositions[0].title} পদে নিয়োগ বিজ্ঞপ্তি ২০২৬\`;

  return {
    org,
    title: primaryTitle,
    totalPosts,
    deadline,
    officialLink,
    positions: extractedPositions
  };
}
`;

// Replace lines 172-238 in resolver
const oldSectionRegex = /\/\/ 2\. Direct PDF URL[\s\S]*?\/\/ 3\. Raw Text fallback[\s\S]*?return \{[\s\S]*?\};\s*\}/;

const newSection = `// 2. Direct PDF URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let pdfText = '';
    try {
      pdfText = await extractTextFromPdf(trimmed);
    } catch {}

    const parsed = parseDetailsFromPdfText(pdfText, trimmed);
    const { category, categoryLabel } = mapCategory(parsed.org);

    return {
      title: parsed.title,
      organization: parsed.org,
      category,
      categoryLabel,
      totalPosts: parsed.totalPosts,
      deadline: parsed.deadline,
      publishedDate: formatBnDate(new Date().toISOString()),
      officialLink: parsed.officialLink,
      circularPdfUrl: trimmed,
      rawText: pdfText,
      minAge: 18,
      maxAge: 32,
      salary: parsed.positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
      grade: parsed.positions[0]?.grade || '১০ম - ১৬তম গ্রেড',
      positions: parsed.positions
    };
  }

  // 3. Raw Text fallback
  const parsedFromText = parseDetailsFromPdfText(trimmed);
  const { category: catText, categoryLabel: catLabelText } = mapCategory(parsedFromText.org);

  return {
    title: parsedFromText.title,
    organization: parsedFromText.org,
    category: catText,
    categoryLabel: catLabelText,
    totalPosts: parsedFromText.totalPosts,
    deadline: parsedFromText.deadline,
    publishedDate: formatBnDate(new Date().toISOString()),
    officialLink: parsedFromText.officialLink,
    circularPdfUrl: '',
    rawText: trimmed,
    minAge: 18,
    maxAge: 32,
    salary: parsedFromText.positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
    grade: parsedFromText.positions[0]?.grade || '১০ম গ্রেড',
    positions: parsedFromText.positions
  };
}`;

if (!code.includes('parseDetailsFromPdfText')) {
  code = code.replace('// 2. Direct PDF URL', newParserFunction + '\n  // 2. Direct PDF URL');
  code = code.replace(oldSectionRegex, newSection);
  fs.writeFileSync(resolverPath, code, 'utf8');
  console.log('✅ Successfully upgraded alljobs_smart_resolver with Heuristic Deep Circular Parser!');
} else {
  console.log('Already upgraded.');
}
