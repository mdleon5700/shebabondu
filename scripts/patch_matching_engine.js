const fs = require('fs');
const path = require('path');

// 1. Patch types.ts
const typesPath = path.join(__dirname, '../src/lib/matching/types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

const oldEduType = `export type NormalizedEducationLevel = 
  | 'jsc' 
  | 'ssc' 
  | 'hsc' 
  | 'diploma' 
  | 'bachelor' 
  | 'masters' 
  | 'phd' 
  | 'any';`;

const newEduType = `export type NormalizedEducationLevel = 
  | 'jsc' 
  | 'jdc'
  | 'ssc' 
  | 'dakhil'
  | 'hsc' 
  | 'alim'
  | 'diploma' 
  | 'degree'
  | 'bachelor' 
  | 'masters' 
  | 'kamil'
  | 'mphil'
  | 'phd' 
  | 'any';`;

if (typesContent.includes(oldEduType)) {
  typesContent = typesContent.replace(oldEduType, newEduType);
  fs.writeFileSync(typesPath, typesContent, 'utf8');
  console.log('✅ types.ts updated');
} else {
  console.log('types.ts pattern not found or already updated');
}

// 2. Patch normalizer.ts
const normalizerPath = path.join(__dirname, '../src/lib/matching/normalizer.ts');
let normContent = fs.readFileSync(normalizerPath, 'utf8');

const oldNormRegex = /public static normalizeEducationLevel\([^\)]*\):[\s\S]*?return \{ level: 'bachelor', labelBn: '[^']*' \};\s*\}/;

const newNormFunction = `public static normalizeEducationLevel(text?: string | null): { level: NormalizedEducationLevel; labelBn: string } {
    if (!text) return { level: 'any', labelBn: 'শিক্ষাগত যোগ্যতা প্রযোজ্য নয়' };
    const lower = text.toLowerCase();

    // 1. PhD / Doctorate
    if (lower.includes('ডক্টরেট') || lower.includes('phd') || lower.includes('পিএইচডি') || lower.includes('doctorate')) {
      return { level: 'phd', labelBn: 'পিএইচডি / ডক্টরেট' };
    }

    // 2. MPhil
    if (lower.includes('এমফিল') || lower.includes('mphil') || lower.includes('m.phil')) {
      return { level: 'mphil', labelBn: 'এমফিল' };
    }

    // 3. Kamil (Madrasah Master\'s equivalent)
    if (lower.includes('কামিল') || lower.includes('kamil')) {
      return { level: 'kamil', labelBn: 'কামিল (মাস্টার্স সমমান)' };
    }

    // 4. Master\'s
    if (lower.includes('স্নাতকোত্তর') || lower.includes('মাস্টার্স') || lower.includes('masters') || lower.includes('msc') || lower.includes('mba') || lower.includes('mss') || lower.includes('m.com')) {
      return { level: 'masters', labelBn: 'স্নাতকোত্তর / মাস্টার্স' };
    }

    // 5. Bachelor\'s (Honours 4-year)
    if (lower.includes('অনার্স') || lower.includes('সম্মান') || lower.includes('honours') || lower.includes('honors') || lower.includes('b.sc') || lower.includes('bsc') || lower.includes('bba') || lower.includes('b.a') || lower.includes('bachelor')) {
      return { level: 'bachelor', labelBn: 'স্নাতক (সম্মান) বা সমমান' };
    }

    // 6. Degree (Pass 3-year)
    if (lower.includes('ডিগ্রি (পাস)') || lower.includes('স্নাতক (পাস)') || lower.includes('ডিগ্রী') || lower.includes('degree (pass)') || lower.includes('pass degree') || lower.includes('ডিগ্রি')) {
      return { level: 'degree', labelBn: 'স্নাতক (পাস) / ডিগ্রি' };
    }

    // 7. General generic স্নাতক
    if (lower.includes('স্নাতক')) {
      return { level: 'bachelor', labelBn: 'স্নাতক (সম্মান) বা সমমান' };
    }

    // 8. Diploma
    if (lower.includes('ডিপ্লোমা') || lower.includes('diploma') || lower.includes('পলিটেকনিক') || lower.includes('polytechnic')) {
      return { level: 'diploma', labelBn: 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং / সমমান' };
    }

    // 9. Alim (Madrasah HSC equivalent)
    if (lower.includes('আলিম') || lower.includes('alim')) {
      return { level: 'alim', labelBn: 'আলিম (এইচএসসি সমমান)' };
    }

    // 10. HSC (Higher Secondary)
    if (lower.includes('এইচএসসি') || lower.includes('উচ্চ মাধ্যমিক') || lower.includes('hsc')) {
      return { level: 'hsc', labelBn: 'এইচএসসি / উচ্চ মাধ্যমিক' };
    }

    // 11. Dakhil (Madrasah SSC equivalent)
    if (lower.includes('দাখিল') || lower.includes('dakhil')) {
      return { level: 'dakhil', labelBn: 'দাখিল (এসএসসি সমমান)' };
    }

    // 12. SSC (Secondary School Certificate)
    if (lower.includes('এসএসসি') || lower.includes('মাধ্যমিক') || lower.includes('ssc')) {
      return { level: 'ssc', labelBn: 'এসএসসি / মাধ্যমিক' };
    }

    // 13. JDC (Junior Dakhil Certificate)
    if (lower.includes('জেডিসি') || lower.includes('jdc') || lower.includes('জুনিয়র দাখিল')) {
      return { level: 'jdc', labelBn: 'জেডিসি (জুনিয়র দাখিল সার্টিফিকেট)' };
    }

    // 14. JSC (Junior School Certificate) / 8th Pass
    if (lower.includes('অষ্টম') || lower.includes('৮ম') || lower.includes('জেএসসি') || lower.includes('jsc') || lower.includes('জুনিয়র স্কুল')) {
      return { level: 'jsc', labelBn: '৮ম শ্রেণি / জেএসসি' };
    }

    return { level: 'any', labelBn: 'শিক্ষাগত যোগ্যতা প্রযোজ্য নয়' };
  }`;

if (oldNormRegex.test(normContent)) {
  normContent = normContent.replace(oldNormRegex, newNormFunction);
  fs.writeFileSync(normalizerPath, normContent, 'utf8');
  console.log('✅ normalizer.ts updated');
} else {
  console.log('normalizer.ts regex mismatch');
}
