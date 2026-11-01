import { convertBnToEnDigits, sanitizeText, inferJobCategory } from './normalizer';
import {
  PdfExtractedField,
  PdfExtractedCircular
} from './types';
import { PdfTextExtractionResult } from './pdf_extractor';

// Bijoy / SutonnyMJ mapping dictionary for key recruitment words in BD govt circulars
const BIJOY_MAP: Array<[RegExp, string]> = [
  [/evsjv‡`k/g, 'বাংলাদেশ'],
  [/e¨vsK/g, 'ব্যাংক'],
  [/weÁwß/g, 'বিজ্ঞপ্তি'],
  [/wb‡qvM/g, 'নিয়োগ'],
  [/ZvwiL/g, 'তারিখ'],
  [/cÖavb/g, 'প্রধান'],
  [/Kvh©vjq/g, 'কার্যালয়'],
  [/mwPevjq/g, 'সচিবালয়'],
  [/c‡`i bvg/g, 'পদের নাম'],
  [/c`msL¨v/g, 'পদসংখ্যা'],
  [/‡eZb/g, 'বেতন'],
  [/‡MÖW/g, 'গ্রেড'],
  [/Av‡e`‡bi/g, 'আবেদনের'],
  [/‡kl ZvwiL/g, 'শেষ তারিখ'],
  [/mgqmxgv/g, 'সময়সীমা'],
  [/e„w×/g, 'বৃদ্ধি'],
  [/ms‡kvabx/g, 'সংশোধনী'],
  [/wd/g, 'ফি'],
  [/UvKv/g, 'টাকা'],
  [/wkÿvMZ/g, 'শিক্ষাগত'],
  [/‡hvM¨Zv/g, 'যোগ্যতা'],
  [/eqm/g, 'বয়স'],
  [/A‡±vei/g, 'অক্টোবর'],
  [/b‡f¤ei/g, 'নভেম্বর'],
  [/wW‡m¤ei/g, 'ডিসেম্বর'],
  [/Rvbyqvix/g, 'জানুয়ারি'],
  [/‡deªæqvix/g, 'ফেব্রুয়ারি'],
  [/gvP©/g, 'মার্চ'],
  [/GwcÖj/g, 'এপ্রিল'],
  [/‡g/g, 'মে'],
  [/Ryb/g, 'জুন'],
  [/RyjvB/g, 'জুলাই'],
  [/AvM÷/g, 'আগস্ট'],
  [/‡m‡Þ¤ei/g, 'সেপ্টেম্বর']
];

export function decodeBijoyRecruitmentTerms(text: string): string {
  if (!text) return '';
  let out = text;
  for (const [regex, repl] of BIJOY_MAP) {
    out = out.replace(regex, repl);
  }
  return out;
}

export function parsePdfCircular(
  pdfResult: PdfTextExtractionResult,
  pdfUrl: string
): PdfExtractedCircular {
  const warnings = [...pdfResult.warnings];
  const fields: PdfExtractedCircular['fields'] = {};

  if (!pdfResult.success || pdfResult.rawTextByPage.length === 0) {
    return {
      pdfUrl,
      pdfHash: pdfResult.pdfHash,
      isScanned: pdfResult.isScanned,
      requiresOcr: pdfResult.requiresOcr,
      totalPages: pdfResult.totalPages,
      pagesProcessed: pdfResult.pagesProcessed,
      extractedAt: new Date().toISOString(),
      fields: {},
      rawTextByPage: pdfResult.rawTextByPage,
      warnings,
      extractionStatus: pdfResult.requiresOcr ? 'requires_ocr' : 'failed'
    };
  }

  // Pre-process pages with Bijoy translation alongside raw text
  const enrichedPages = pdfResult.rawTextByPage.map(p => {
    const raw = p.text;
    const decoded = decodeBijoyRecruitmentTerms(raw);
    return {
      pageNumber: p.pageNumber,
      rawText: raw,
      decodedText: decoded
    };
  });

  let isDeadlineExtended = false;
  let isCorrectionNotice = false;
  let isCancellationNotice = false;

  // 1. EXTRACT RECRUITING ORGANIZATION
  for (const p of enrichedPages) {
    if (fields.organization) break;
    const text = p.decodedText;

    if (text.includes('বাংলাদেশ ব্যাংক') || text.toLowerCase().includes('bangladesh bank')) {
      fields.organization = {
        field: 'organization',
        originalText: 'বাংলাদেশ ব্যাংক',
        normalizedValue: 'Bangladesh Bank',
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, 'বাংলাদেশ ব্যাংক', 150),
        extractionMethod: 'heading_match',
        confidence: 0.95
      };
    } else if (text.includes('সরকারি কর্ম কমিশন') || text.includes('বাংলাদেশ সরকারি কর্ম কমিশন') || text.includes('BPSC')) {
      fields.organization = {
        field: 'organization',
        originalText: 'বাংলাদেশ সরকারি কর্ম কমিশন',
        normalizedValue: 'Bangladesh Public Service Commission (BPSC)',
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, 'কর্ম কমিশন', 150),
        extractionMethod: 'heading_match',
        confidence: 0.95
      };
    } else if (text.includes('আনসার ভিডিপি উন্নয়ন ব্যাংক') || text.includes('Ansar VDP')) {
      fields.organization = {
        field: 'organization',
        originalText: 'আনসার ভিডিপি উন্নয়ন ব্যাংক',
        normalizedValue: 'Ansar VDP Unnayan Bank',
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, 'আনসার ভিডিপি উন্নয়ন ব্যাংক', 150),
        extractionMethod: 'heading_match',
        confidence: 0.92
      };
    } else if (text.includes('সোনালী ব্যাংক') || text.includes('Sonali Bank')) {
      fields.organization = {
        field: 'organization',
        originalText: 'সোনালী ব্যাংক পিএলসি',
        normalizedValue: 'Sonali Bank PLC',
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, 'সোনালী ব্যাংক', 150),
        extractionMethod: 'heading_match',
        confidence: 0.92
      };
    } else if (text.includes('রূপালী ব্যাংক') || text.includes('Rupali Bank')) {
      fields.organization = {
        field: 'organization',
        originalText: 'রূপালী ব্যাংক পিএলসি',
        normalizedValue: 'Rupali Bank PLC',
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, 'রূপালী ব্যাংক', 150),
        extractionMethod: 'heading_match',
        confidence: 0.92
      };
    } else {
      // General Ministry / Directorate / Bank regex
      const orgM = /([^\n]+(?:মন্ত্রণালয়|অধিদপ্তর|পরিদপ্তর|ব্যাংক|কর্তৃপক্ষ|কমিশন|বোর্ড|Bank|Corporation|Ministry|Authority))/i.exec(text);
      if (orgM && orgM[1] && orgM[1].trim().length >= 4 && orgM[1].trim().length < 80) {
        const found = orgM[1].trim();
        fields.organization = {
          field: 'organization',
          originalText: found,
          normalizedValue: found,
          pageNumber: p.pageNumber,
          evidenceSnippet: extractSnippet(text, found, 150),
          extractionMethod: 'regex_pattern',
          confidence: 0.80
        };
      }
    }
  }

  // 2. EXTRACT MEMO / CIRCULAR REFERENCE NUMBER
  for (const p of enrichedPages) {
    if (fields.refNo) break;
    const text = p.decodedText;

    // Pattern 1: স্মারক নং / নম্বর
    const refM1 = /(?:স্মারক\s*নং|স্মারক\s*নম্বর|circular\s*memo|memo\s*no|circular\s*no|ref(?:\s*no)?)[:\s-]*([০-৯0-9a-zA-Z._\/-]+(?:\s*[০-৯0-9a-zA-Z._\/-]+)*)/i.exec(text);
    if (refM1 && refM1[1] && refM1[1].trim().length >= 3) {
      const rawRef = refM1[1].trim().split('\n')[0].replace(/[.,\s]+$/, '');
      fields.refNo = {
        field: 'refNo',
        originalText: rawRef,
        normalizedValue: convertBnToEnDigits(rawRef),
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, refM1[0], 150),
        extractionMethod: 'regex_pattern',
        confidence: 0.92
      };
      break;
    }

    // Pattern 2: বিজ্ঞপ্তি নং-৩৪৭/২০২৬ or weÁwß bs-347/2026
    const refM2 = /(?:বিজ্ঞপ্তি\s*নং|বিএসসিএস\s*বিজ্ঞপ্তি\s*নং)[:\s-]*([০-৯0-9\/-]+)/i.exec(text);
    if (refM2 && refM2[1]) {
      const rawRef = refM2[1].trim();
      fields.refNo = {
        field: 'refNo',
        originalText: rawRef,
        normalizedValue: `বিজ্ঞপ্তি নং-${convertBnToEnDigits(rawRef)}`,
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, refM2[0], 150),
        extractionMethod: 'regex_pattern',
        confidence: 0.90
      };
      break;
    }
  }

  // 3. NOTICE CLASSIFICATION: DEADLINE EXTENSION OR CORRIGENDUM
  for (const p of enrichedPages) {
    const text = p.decodedText;
    if (text.includes('সময়সীমা বৃদ্ধি') || text.includes('সময়সীমা বর্ধিতকরণ') || text.includes('তারিখ বর্ধিতকরণ') || text.toLowerCase().includes('date extension') || text.toLowerCase().includes('deadline extended')) {
      isDeadlineExtended = true;
    }
    if (text.includes('সংশোধনী বিজ্ঞপ্তি') || text.includes('বিজ্ঞপ্তির আংশিক সংশোধন') || text.toLowerCase().includes('corrigendum')) {
      isCorrectionNotice = true;
    }
    if (text.includes('বাতিলকরণ বিজ্ঞপ্তি') || text.toLowerCase().includes('cancellation notice')) {
      isCancellationNotice = true;
    }
  }

  // 4. EXTRACT APPLICATION DEADLINE & EXTENDED DEADLINE
  for (const p of enrichedPages) {
    if (fields.deadline && (!isDeadlineExtended || fields.extendedDeadline)) break;
    const text = p.decodedText;

    // Extended deadline notice pattern
    if (isDeadlineExtended) {
      const extM = /(?:বর্ধিত\s*শেষ\s*তারিখ|আবেদনের\s*সময়সীমা\s*আগামী|extended\s*(?:to|date|deadline)[:\s]*)\s*([০-৯0-9]{1,2}\s+[^\n,]+,\s*[০-৯0-9]{4}|[০-৯0-9]{1,2}[-/.][০-৯0-9]{1,2}[-/.][০-৯0-9]{4}|[০-৯0-9]{1,2}\s+[a-zA-Z]+,?\s+[০-৯0-9]{4})/i.exec(text);
      if (extM && extM[1]) {
        fields.extendedDeadline = {
          field: 'extendedDeadline',
          originalText: extM[1].trim(),
          normalizedValue: extM[1].trim(),
          pageNumber: p.pageNumber,
          evidenceSnippet: extractSnippet(text, extM[0], 150),
          extractionMethod: 'regex_pattern',
          confidence: 0.93
        };
        fields.deadline = {
          field: 'deadline',
          originalText: extM[1].trim(),
          normalizedValue: extM[1].trim(),
          pageNumber: p.pageNumber,
          evidenceSnippet: extractSnippet(text, extM[0], 150),
          extractionMethod: 'regex_pattern',
          confidence: 0.93
        };
      }
    }

    // Standard deadline patterns
    if (!fields.deadline) {
      const deadM = /(?:আবেদনের\s*শেষ\s*তারিখ|দরখাস্ত\s*দাখিলের\s*শেষ\s*তারিখ|application\s*deadline|closing\s*date|last\s*date)[:\s]*([^\n]+)/i.exec(text);
      if (deadM && deadM[1]) {
        const rawDate = deadM[1].split('পর্যন্ত')[0].replace(/[.,\s]+$/, '').trim();
        if (rawDate.length >= 5 && rawDate.length <= 60) {
          fields.deadline = {
            field: 'deadline',
            originalText: rawDate,
            normalizedValue: rawDate,
            pageNumber: p.pageNumber,
            evidenceSnippet: extractSnippet(text, deadM[0], 150),
            extractionMethod: 'regex_pattern',
            confidence: 0.90
          };
        }
      }
    }
  }

  // 5. EXTRACT JOB TITLE / POST NAME & POST-WISE VACANCIES
  const postWiseList: Array<{ postName: string; vacancies: number; grade?: string }> = [];

  for (const p of enrichedPages) {
    const text = p.decodedText;

    // Post-wise rows pattern: check line-by-line for structured post rows
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      const pMatch = /(?:^[১-৯1-9][।.)]\s*)?(?:পদের\s*নাম|post\s*name)[:\s]*([^\n,:]+?)\s*(?:পদসংখ্যা|শূন্যপদ|vacancies|posts?)[:\s]*([০-৯0-9]+)(?:\s*(?:গ্রেড|grade)[:\s]*([০-৯0-9]+))?/i.exec(trimmedLine);
      if (pMatch) {
        const pTitle = pMatch[1].replace(/[.,\s]+$/, '').trim();
        const pVac = parseInt(convertBnToEnDigits(pMatch[2]), 10);
        const pGrade = pMatch[3] ? `${convertBnToEnDigits(pMatch[3])}ম গ্রেড` : undefined;

        if (pTitle && !isNaN(pVac) && pVac > 0 && pTitle.length >= 3 && pTitle.length < 100) {
          if (!postWiseList.some(item => item.postName === pTitle)) {
            postWiseList.push({
              postName: pTitle,
              vacancies: pVac,
              grade: pGrade
            });
          }
        }
      }
    }

    // Direct single title pattern if not found
    if (!fields.title) {
      // 51st BCS Special or standard BCS
      if (text.includes('BCS') || text.includes('বিসিএস')) {
        const bcsM = /(?:([০-৯0-9]+(?:তম|th)?\s*বিসিএস(?:\s*\([^)]+\))?\s*পরীক্ষা(?:\s*[০-৯0-9]{4})?)|([০-৯0-9]+(?:th|st|nd|rd)?\s*BCS(?:\s*\([^)]+\))?\s*Examination(?:\s*[০-৯0-9]{4})?))/i.exec(text);
        if (bcsM) {
          const rawBcs = (bcsM[1] || bcsM[2]).trim();
          fields.title = {
            field: 'title',
            originalText: rawBcs,
            normalizedValue: rawBcs,
            pageNumber: p.pageNumber,
            evidenceSnippet: extractSnippet(text, rawBcs, 150),
            extractionMethod: 'heading_match',
            confidence: 0.95
          };
        }
      }

      // Explicit "পদের নাম"
      const singleTitleM = /(?:পদের\s*নাম|পদের\s*নাম\s*:|post\s*name)[:\s]*([^\n,]+)/i.exec(text);
      if (singleTitleM && singleTitleM[1]) {
        const rawT = singleTitleM[1].replace(/[.,\s]+$/, '').trim();
        if (rawT.length >= 3 && rawT.length < 100 && !rawT.includes('যোগ্যতা') && !rawT.includes('বেতন')) {
          fields.title = {
            field: 'title',
            originalText: rawT,
            normalizedValue: rawT,
            pageNumber: p.pageNumber,
            evidenceSnippet: extractSnippet(text, singleTitleM[0], 150),
            extractionMethod: 'regex_pattern',
            confidence: 0.90
          };
        }
      }

      // Common designated posts: Senior Officer, Assistant Director, Officer (Cash), etc.
      if (!fields.title) {
        const commonRoles = [
          'সিনিয়র অফিসার', 'Senior Officer',
          'সহকারী পরিচালক', 'Assistant Director',
          'অফিসার (ক্যাশ)', 'Officer (Cash)',
          'কম্পিউটার অপারেটর', 'Computer Operator',
          'উপ-সহকারী প্রকৌশলী', 'Sub-Assistant Engineer',
          'হিসাবরক্ষণ কর্মকর্তা', 'Accounts Officer'
        ];
        for (const role of commonRoles) {
          if (text.includes(role)) {
            fields.title = {
              field: 'title',
              originalText: role,
              normalizedValue: role,
              pageNumber: p.pageNumber,
              evidenceSnippet: extractSnippet(text, role, 150),
              extractionMethod: 'section_match',
              confidence: 0.85
            };
            break;
          }
        }
      }
    }
  }

  // If post-wise vacancies found, compute total and save list
  if (postWiseList.length > 0) {
    const totalVac = postWiseList.reduce((acc, curr) => acc + curr.vacancies, 0);
    fields.postWiseVacancies = {
      field: 'postWiseVacancies',
      originalText: `${postWiseList.length}টি পদ`,
      normalizedValue: postWiseList,
      pageNumber: 1,
      evidenceSnippet: `পদসমূহের তালিকা: ${postWiseList.map(p => `${p.postName} (${p.vacancies}টি)`).join(', ')}`,
      extractionMethod: 'table_row',
      confidence: 0.92
    };

    if (!fields.vacancies) {
      fields.vacancies = {
        field: 'vacancies',
        originalText: `${totalVac}`,
        normalizedValue: totalVac,
        pageNumber: 1,
        evidenceSnippet: `মোট পদসংখ্যা: ${totalVac}`,
        extractionMethod: 'table_row',
        confidence: 0.92
      };
    }
    if (!fields.title && postWiseList.length === 1) {
      fields.title = {
        field: 'title',
        originalText: postWiseList[0].postName,
        normalizedValue: postWiseList[0].postName,
        pageNumber: 1,
        evidenceSnippet: postWiseList[0].postName,
        extractionMethod: 'table_row',
        confidence: 0.88
      };
    }
  }

  // 6. TOTAL VACANCIES (Single post or global declaration)
  if (!fields.vacancies) {
    for (const p of enrichedPages) {
      if (fields.vacancies) break;
      const text = p.decodedText;

      const vacM = /(?:মোট\s*পদসংখ্যা|পদসংখ্যা|শূন্য\s*পদের\s*সংখ্যা|total\s*posts?|total\s*vacanc[a-z]*)[:\s]*([০-৯0-9]+)/i.exec(text);
      if (vacM && vacM[1]) {
        const val = parseInt(convertBnToEnDigits(vacM[1]), 10);
        if (!isNaN(val) && val > 0 && val < 50000) {
          fields.vacancies = {
            field: 'vacancies',
            originalText: vacM[1].trim(),
            normalizedValue: val,
            pageNumber: p.pageNumber,
            evidenceSnippet: extractSnippet(text, vacM[0], 150),
            extractionMethod: 'regex_pattern',
            confidence: 0.88
          };
        }
      }
    }
  }

  // 7. APPLICATION FEE & CATEGORY-SPECIFIC FEES
  const feeCategoriesList: Array<{ category: string; amount: number }> = [];

  for (const p of enrichedPages) {
    const text = p.decodedText;

    // Check category-wise fees (e.g. সাধারণ ৭০০ টাকা, কোটা/প্রতিবন্ধী ১০০ টাকা)
    const catFeeRegex = /([^\n,:]+?)(?:\s*(?:পরীক্ষার\s*ফি|আবেদন\s*ফি|ফি|exam\s*fee|application\s*fee|fee))\s*[:\s]+([০-৯0-9]+)\s*(?:টাকা|bdt|\/-)/gi;
    let cfMatch: RegExpExecArray | null;

    while ((cfMatch = catFeeRegex.exec(text)) !== null) {
      const catName = cfMatch[1].replace(/[.,\s]+$/, '').trim();
      const catAmt = parseInt(convertBnToEnDigits(cfMatch[2]), 10);
      if (catName.length <= 40 && !isNaN(catAmt) && catAmt > 0 && catAmt <= 2000) {
        if (!feeCategoriesList.some(f => f.category === catName)) {
          feeCategoriesList.push({ category: catName, amount: catAmt });
        }
      }
    }

    // Direct general fee pattern: পরীক্ষার ফি ২০০ টাকা / 700 BDT
    if (!fields.govtFee) {
      const feeM = /(?:পরীক্ষার\s*ফি|আবেদন\s*ফি|নির্ধারিত\s*ফি|application\s*fee|exam\s*fee)[:\s]*([০-৯0-9]+)\s*(?:টাকা|bdt|\/-)?|([০-৯0-9]+)\s*(?:টাকা|bdt|\/-)\s*(?:ফি|চার্জ)/i.exec(text);
      if (feeM) {
        const rawFee = feeM[1] || feeM[2];
        const val = parseInt(convertBnToEnDigits(rawFee), 10);
        if (!isNaN(val) && val >= 0 && val <= 3000) {
          fields.govtFee = {
            field: 'govtFee',
            originalText: rawFee,
            normalizedValue: val,
            pageNumber: p.pageNumber,
            evidenceSnippet: extractSnippet(text, feeM[0], 150),
            extractionMethod: 'regex_pattern',
            confidence: 0.90
          };
        }
      }
    }
  }

  if (feeCategoriesList.length > 0) {
    fields.feeCategories = {
      field: 'feeCategories',
      originalText: `${feeCategoriesList.length}টি ক্যাটাগরি`,
      normalizedValue: feeCategoriesList,
      pageNumber: 1,
      evidenceSnippet: `ক্যাটাগরি অনুযায়ী ফি: ${feeCategoriesList.map(c => `${c.category}: ${c.amount} টাকা`).join(', ')}`,
      extractionMethod: 'section_match',
      confidence: 0.92
    };

    if (!fields.govtFee) {
      // General applicant fee is prioritized as main fee
      const general = feeCategoriesList.find(c => c.category.includes('সাধারণ') || c.category.includes('General')) || feeCategoriesList[0];
      fields.govtFee = {
        field: 'govtFee',
        originalText: `${general.amount}`,
        normalizedValue: general.amount,
        pageNumber: 1,
        evidenceSnippet: `${general.category}: ${general.amount} টাকা`,
        extractionMethod: 'section_match',
        confidence: 0.90
      };
    }
  }

  // 8. GRADE / SALARY PAY SCALE
  for (const p of enrichedPages) {
    if (fields.grade) break;
    const text = p.decodedText;

    const gradeM = /(?:গ্রেড\s*[-–]?\s*([০-৯0-9]+)|([০-৯0-9]+)\s*(?:ম|তম)?\s*গ্রেড|Grade\s*[-–]?\s*([০-৯0-9]+))/i.exec(text);
    if (gradeM && (gradeM[1] || gradeM[2] || gradeM[3])) {
      const gNum = convertBnToEnDigits(gradeM[1] || gradeM[2] || gradeM[3]);
      fields.grade = {
        field: 'grade',
        originalText: gradeM[0],
        normalizedValue: `${gNum}ম গ্রেড`,
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, gradeM[0], 120),
        extractionMethod: 'regex_pattern',
        confidence: 0.90
      };
    }

    const payM = /(?:বেতন\s*স্কেল|জাতীয়\s*বেতন\s*স্কেল|pay\s*scale)[:\s]*([০-৯0-9,–-]+(?:\s*টাকা)?)/i.exec(text);
    if (payM && payM[1] && !fields.salary) {
      fields.salary = {
        field: 'salary',
        originalText: payM[1].trim(),
        normalizedValue: payM[1].trim(),
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, payM[0], 120),
        extractionMethod: 'regex_pattern',
        confidence: 0.85
      };
    }
  }

  // 9. EDUCATIONAL QUALIFICATIONS
  for (const p of enrichedPages) {
    if (fields.minEducation) break;
    const text = p.decodedText;

    const eduM = /(?:শিক্ষাগত\s*যোগ্যতা|ন্যূনতম\s*শিক্ষাগত\s*যোগ্যতা|educational\s*qualification)[:\s]*([^\n.]+)/i.exec(text);
    if (eduM && eduM[1]) {
      const rawEdu = eduM[1].replace(/[.,\s]+$/, '').trim();
      if (rawEdu.length >= 5 && rawEdu.length <= 150) {
        fields.minEducation = {
          field: 'minEducation',
          originalText: rawEdu,
          normalizedValue: rawEdu,
          pageNumber: p.pageNumber,
          evidenceSnippet: extractSnippet(text, eduM[0], 150),
          extractionMethod: 'regex_pattern',
          confidence: 0.85
        };
      }
    }
  }

  // 10. AGE LIMIT
  for (const p of enrichedPages) {
    if (fields.ageLimit) break;
    const text = p.decodedText;

    const ageM = /(?:বয়সসীমা|প্রার্থীর\s*বয়স|age\s*limit)[:\s]*([^\n.]+)/i.exec(text);
    if (ageM && ageM[1]) {
      const rawAge = ageM[1].replace(/[.,\s]+$/, '').trim();
      if (rawAge.length >= 4 && rawAge.length <= 80) {
        fields.ageLimit = {
          field: 'ageLimit',
          originalText: rawAge,
          normalizedValue: rawAge,
          pageNumber: p.pageNumber,
          evidenceSnippet: extractSnippet(text, ageM[0], 120),
          extractionMethod: 'regex_pattern',
          confidence: 0.85
        };
      }
    }
  }

  // 11. APPLICATION URL & METHOD
  for (const p of enrichedPages) {
    if (fields.applicationUrl) break;
    const text = p.decodedText;

    const urlM = /(https?:\/\/[a-zA-Z0-9.-]+\.teletalk\.com\.bd[^\s)]*|https?:\/\/[a-zA-Z0-9.-]+\.bb\.org\.bd[^\s)]*)/i.exec(text);
    if (urlM && urlM[1]) {
      fields.applicationUrl = {
        field: 'applicationUrl',
        originalText: urlM[1],
        normalizedValue: urlM[1],
        pageNumber: p.pageNumber,
        evidenceSnippet: extractSnippet(text, urlM[1], 120),
        extractionMethod: 'regex_pattern',
        confidence: 0.95
      };
      fields.applicationMethod = {
        field: 'applicationMethod',
        originalText: 'অনলাইন আবেদন',
        normalizedValue: 'online',
        pageNumber: p.pageNumber,
        evidenceSnippet: `অনলাইনে আবেদন লিঙ্ক: ${urlM[1]}`,
        extractionMethod: 'regex_pattern',
        confidence: 0.95
      };
    }
  }

  // Generate warnings for missing critical fields
  if (!fields.deadline && !isCancellationNotice) {
    warnings.push('PDF সার্কুলারে আবেদনের শেষ তারিখ স্পষ্টভাবে পাওয়া যায়নি');
  }
  if (!fields.vacancies && !isCancellationNotice) {
    warnings.push('PDF সার্কুলারে পদসংখ্যা স্পষ্টভাবে অনুল্লিখিত');
  }
  if (!fields.govtFee && !isCancellationNotice) {
    warnings.push('PDF সার্কুলারে আবেদন ফি অনুল্লিখিত (বা বিজ্ঞপ্তি অনুযায়ী প্রযোজ্য)');
  }

  const hasCoreFields = Boolean(fields.title || fields.refNo || fields.organization);
  let extractionStatus: PdfExtractedCircular['extractionStatus'] = 'failed';
  if (pdfResult.requiresOcr) {
    extractionStatus = 'requires_ocr';
  } else if (hasCoreFields) {
    extractionStatus = warnings.length > 0 ? 'partial' : 'success';
  }

  return {
    pdfUrl,
    pdfHash: pdfResult.pdfHash,
    isScanned: pdfResult.isScanned,
    requiresOcr: pdfResult.requiresOcr,
    totalPages: pdfResult.totalPages,
    pagesProcessed: pdfResult.pagesProcessed,
    extractedAt: new Date().toISOString(),
    isDeadlineExtended,
    isCorrectionNotice,
    isCancellationNotice,
    fields,
    rawTextByPage: pdfResult.rawTextByPage,
    warnings,
    extractionStatus
  };
}

function extractSnippet(text: string, anchor: string, length = 150): string {
  const idx = text.indexOf(anchor);
  if (idx === -1) return text.slice(0, length).replace(/\s+/g, ' ').trim();
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + anchor.length + 80);
  return text.slice(start, end).replace(/\s+/g, ' ').trim();
}
