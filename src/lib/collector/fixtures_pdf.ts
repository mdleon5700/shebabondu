/**
 * Deterministic In-Memory PDF Fixtures for Chakri Sheba Step 3C Phase 1
 */

export function buildSyntheticPdfBuffer(pages: string[]): Buffer {
  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  const kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj`);

  pages.forEach((pageText, i) => {
    const pageObjNum = 3 + i * 3;
    const fontObjNum = 4 + i * 3;
    const contentObjNum = 5 + i * 3;

    objects.push(`${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj`);
    objects.push(`${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

    let streamText = 'BT /F1 12 Tf 50 720 Td ';
    const lines = pageText.split('\n');
    lines.forEach((l, lineIdx) => {
      const escaped = l.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      if (lineIdx > 0) streamText += ' 0 -18 Td ';
      streamText += `(${escaped}) Tj`;
    });
    streamText += ' ET';

    const streamBuf = Buffer.from(streamText, 'utf-8');
    objects.push(`${contentObjNum} 0 obj\n<< /Length ${streamBuf.length} >>\nstream\n${streamText}\nendstream\nendobj`);
  });

  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [];
  let currentOffset = header.length;

  objects.forEach(obj => {
    offsets.push(currentOffset);
    body += obj + '\n';
    currentOffset += Buffer.byteLength(obj + '\n', 'utf-8');
  });

  const startXref = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => {
    xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  });

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  return Buffer.from(header + body + xref + trailer, 'utf-8');
}

// 1. Valid Standard Text Recruitment Circular
export const FIXTURE_PDF_VALID_TEXT_CIRCULAR = buildSyntheticPdfBuffer([
  [
    'Bangladesh Bank',
    'Head Office, Motijheel, Dhaka-1000',
    'Bankers Selection Committee Secretariat',
    'Circular No: BB/HRD/2026-042',
    'Date: 25 October 2026',
    'Recruitment Notice for the Post of Assistant Director (General)',
    '1. Post Name: Assistant Director (General)',
    '2. Organization: Bangladesh Bank',
    '3. Total Vacancies: 100 Posts',
    '4. Scale of Pay: Grade-9 (22,000 - 53,060 BDT)',
    '5. Educational Qualification: Master Degree or 4-Year Bachelor Degree in any discipline',
    '6. Age Limit: Maximum 30 Years as of 01 October 2026',
    '7. Application Fee: 200 BDT',
    '8. Application Deadline: 30 Nov, 2026',
    '9. Online Application Portal: https://erecruitment.bb.org.bd'
  ].join('\n')
]);

// 2. Circular with Bijoy-Encoded Bengali (Official Bangladesh Bank Standard)
export const FIXTURE_PDF_BENGALI_NUMERALS_DATES = buildSyntheticPdfBuffer([
  [
    'evsjv‡`k e¨vsK',
    'gwZwSj, XvKv-1000',
    'weÁwß bs-347/2026',
    'ZvwiL : 26 A‡±vei 2026',
    'wb‡qvM weÁwß',
    'c‡`i bvg: mnKvix cwiPvjK (AvBwU)',
    'c`msL¨v: 50',
    '‡MÖW: 9g ‡MÖW',
    'wkÿvMZ ‡hvM¨Zv: weGmmwB BwÄwbqvwis',
    'eqm: 30 eQi',
    'wd: 200 UvKv',
    'Av‡e`‡bi ‡kl ZvwiL: 15 wW‡m¤ei 2026',
    'I‡qemvBU: https://erecruitment.bb.org.bd'
  ].join('\n')
]);

// 3. Multi-Post Circular with Different Vacancies
export const FIXTURE_PDF_MULTIPLE_POSTS = buildSyntheticPdfBuffer([
  [
    'Bangladesh Public Service Commission (BPSC)',
    'Agargaon, Sher-e-Bangla Nagar, Dhaka',
    'Memo No: 05.01.0000.123.24.026',
    'Non-Cadre Recruitment Examination Notice 2026',
    '1. Post Name: Accounts Officer Vacancies: 50 Grade: 10',
    '2. Post Name: Sub-Assistant Engineer Vacancies: 70 Grade: 10',
    'Total Vacancies: 120 Posts',
    'Exam Fee: 500 BDT',
    'Application Deadline: 20 Dec, 2026',
    'Application Portal: https://bpsc.teletalk.com.bd'
  ].join('\n')
]);

// 4. Category-Wise Application Fees
export const FIXTURE_PDF_CATEGORY_FEES = buildSyntheticPdfBuffer([
  [
    '51st BCS (Special) Examination 2026',
    'Bangladesh Public Service Commission (BPSC)',
    'Circular No: BPSC/EXAM/BCS-51/2026',
    'Date: 28 October 2026',
    'Post Name: 51st BCS (Special) Examination 2026',
    'Total Vacancies: 450 Posts',
    'Application Fee and Category Details:',
    'General Candidates Exam Fee: 700 BDT',
    'Physically Challenged and Quota Fee: 100 BDT',
    'Application Deadline: 31 Dec, 2026',
    'Online Application Portal: https://bpsc.teletalk.com.bd'
  ].join('\n')
]);

// 5. Missing Fields (No fee, no vacancies, no deadline)
export const FIXTURE_PDF_MISSING_FIELDS = buildSyntheticPdfBuffer([
  [
    'Ansar VDP Unnayan Bank',
    'General Information Notice',
    'Notice regarding Principal Officer recruitment procedures',
    'Post Name: Principal Officer',
    'Organization: Ansar VDP Unnayan Bank',
    'Educational Qualification: Master Degree',
    'Detailed circular terms will be announced later.',
    'Website: https://erecruitment.bb.org.bd'
  ].join('\n')
]);

// 6. Deadline Extension Notice
export const FIXTURE_PDF_DEADLINE_EXTENSION = buildSyntheticPdfBuffer([
  [
    'Bangladesh Bank',
    'Bankers Selection Committee Secretariat',
    'Circular Memo: BB/HRD/2026-042',
    'Date Extension Notice',
    'Regarding Recruitment Notice No: BB/HRD/2026-042 for Assistant Director (General)',
    'The last date of application is extended to: 15 Dec, 2026',
    'Original Deadline: 30 Nov, 2026',
    'Online Portal: https://erecruitment.bb.org.bd'
  ].join('\n')
]);

// 7. Correction / Revised Circular Notice
export const FIXTURE_PDF_CORRECTION_NOTICE = buildSyntheticPdfBuffer([
  [
    'Bangladesh Public Service Commission (BPSC)',
    'Memo No: 05.01.0000.123.24.026-CORR',
    'Corrigendum Notice',
    'Partial amendment to previous non-cadre recruitment circular memo 05.01.0000.123.24.026:',
    'Sub-Assistant Engineer vacancy count is revised to 80 posts instead of 70 posts.',
    'All other terms and conditions remain unchanged.',
    'Date: 30 October 2026'
  ].join('\n')
]);

// 8. Circular with Conflicting Data (Differs from existing HTML candidate)
export const FIXTURE_PDF_CONFLICTING_DATA = buildSyntheticPdfBuffer([
  [
    'Sonali Bank PLC',
    'Circular Ref: SB-IT-2026-09',
    'Post Name: Senior Officer (IT)',
    'Organization: Sonali Bank PLC',
    'Total Vacancies: 200 Posts',
    'Application Fee: 400 BDT',
    'Application Deadline: 25 Nov, 2026',
    'Website: https://erecruitment.bb.org.bd'
  ].join('\n')
]);

// 9. Scanned PDF (Only 1 whitespace character, requires OCR)
export const FIXTURE_PDF_SCANNED_OCR = buildSyntheticPdfBuffer([' ']);

// 10. Empty PDF (0 bytes)
export const FIXTURE_PDF_EMPTY = Buffer.alloc(0);

// 11. Malformed Corrupted PDF
export const FIXTURE_PDF_MALFORMED = Buffer.from('%PDF-1.4 corrupted garbage bytes truncated before header EOF');

// 12. Encrypted / Password Protected PDF
export const FIXTURE_PDF_ENCRYPTED = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R /Encrypt 3 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n3 0 obj\n<< /Filter /Standard /V 2 /R 3 /P -1052 /O (12345678901234567890123456789012) /U (12345678901234567890123456789012) >>\nendobj\ntrailer\n<< /Size 4 /Root 1 0 R /Encrypt 3 0 R >>\nstartxref\n250\n%%EOF'
);

// 13. Oversized 25 Pages PDF (exceeds default 20 pages limit)
export const FIXTURE_PDF_OVERSIZED_PAGES = buildSyntheticPdfBuffer(
  Array.from({ length: 25 }, (_, i) => `Page ${i + 1} content of Bangladesh Bank multi-page manual`)
);

// 14. Fake PDF Response (HTML disguised with PDF name)
export const FIXTURE_PDF_FAKE_SIGNATURE = Buffer.from('<!DOCTYPE html><html><body><h1>Error 404 Not Found</h1></body></html>');
