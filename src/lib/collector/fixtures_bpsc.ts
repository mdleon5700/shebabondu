/**
 * Comprehensive Offline HTML Fixtures for Bangladesh Public Service Commission (BPSC)
 */

// 1. Single Valid BCS Examination Circular
export const FIXTURE_BPSC_VALID_SINGLE = `
<!DOCTYPE html>
<html>
<head><title>Bangladesh Public Service Commission</title></head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="5">
    <tr>
      <td height="30" colspan="3" bgcolor="#E6E6E6" class="captionL">BCS</td>
    </tr>
    <tr>
      <td width="10%"><img src="commonfiles/arrow.jpg" width="15" height="15" /></td>
      <td width="80%">
        <a href="http://bpsc.teletalk.com.bd/bcs51" class="mainlink">51st BCS (Special) Examination 2026</a>
        <br/><small>Circular No: BPSC/EXAM/2026-51 | Total Posts: 2150 | Deadline: 31 Dec, 2026 | Fee: 700 BDT</small>
      </td>
      <td width="10%">&nbsp;</td>
    </tr>
  </table>
</body>
</html>
`;

// 2. Real Live-Layout Category Tables (BCS & Non Cadre)
export const FIXTURE_BPSC_MULTIPLE_LISTINGS = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Bangladesh Public Service Commission</title></head>
<body>
  <!-- Table 1: BCS -->
  <table width="100%" border="0" cellspacing="0" cellpadding="5">
    <tr>
      <td height="30" colspan="3" bgcolor="#E6E6E6" class="captionL">BCS</td>
    </tr>
    <tr>
      <td width="10%"><img src="commomfiles/arrow.jpg" /></td>
      <td width="80%"><a href="http://bpsc.teletalk.com.bd/bcs51" class="mainlink">51st BCS (Special) Examination 2026</a></td>
      <td width="10%">&nbsp;</td>
    </tr>
    <tr>
      <td><img src="commomfiles/arrow.jpg" /></td>
      <td><a href="http://bpsc.teletalk.com.bd/bcs50" class="mainlink">50th BCS General Examination 2025</a></td>
      <td>&nbsp;</td>
    </tr>
  </table>

  <!-- Table 2: Non Cadre -->
  <table width="100%" border="0" cellspacing="0" cellpadding="5">
    <tr>
      <td height="30" colspan="3" bgcolor="#E6E6E6" class="captionL">Non Cadre</td>
    </tr>
    <tr>
      <td width="10%"><img src="commomfiles/arrow.jpg" /></td>
      <td width="80%"><a href="http://bpsc.teletalk.com.bd/ncad" class="mainlink">Non Cadre Online Application (1st/2nd Class Posts)</a></td>
      <td width="10%">&nbsp;</td>
    </tr>
    <tr>
      <td><img src="commomfiles/arrow.jpg" /></td>
      <td><a href="http://bpsc.teletalk.com.bd/nchoice" class="mainlink">Non Cadre Post Choice for Sub Assistant Engineer</a></td>
      <td>&nbsp;</td>
    </tr>
  </table>
</body>
</html>
`;

// 3. Bengali Numerals & Dates Tabular Layout
export const FIXTURE_BPSC_BENGALI_NUMERALS_DATES = `
<!DOCTYPE html>
<html>
<head><title>বাংলাদেশ সরকারি কর্ম কমিশন (বিপিএসসি)</title></head>
<body>
  <table class="bpsc-table">
    <tr>
      <td>১</td>
      <td>৪৪তম বিসিএস বিশেষ নিয়োগ পরীক্ষা-২০২৬</td>
      <td>জনপ্রশাসন মন্ত্রণালয়</td>
      <td>স্মারক নং: ০৫.০০.০০০০.১৭০.১১.০১২.২৬</td>
      <td>পদসংখ্যা: ৫০০</td>
      <td>আবেদনের শেষ তারিখ: ২০ ডিসেম্বর ২০২৬</td>
      <td>পরীক্ষার ফি: ৭০০ টাকা</td>
      <td><a href="http://bpsc.teletalk.com.bd/circular/44bcs.pdf">বিজ্ঞপ্তি ডাউনলোড</a></td>
    </tr>
    <tr>
      <td>২</td>
      <td>সিনিয়র স্টাফ নার্স (১০ম গ্রেড)</td>
      <td>স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়</td>
      <td>স্মারক নং: ৪৫.০২.০০০০.৮০১.১২.০৪৫.২৬</td>
      <td>পদসংখ্যা: ১২০০</td>
      <td>আবেদনের শেষ তারিখ: ২৫ ডিসেম্বর ২০২৬</td>
      <td>পরীক্ষার ফি: ৫০০ টাকা</td>
      <td><a href="http://bpsc.teletalk.com.bd/circular/nurse_2026.pdf">বিজ্ঞপ্তি</a></td>
    </tr>
  </table>
</body>
</html>
`;

// 4. Missing Deadline / Ref (Flags Manual Review)
export const FIXTURE_BPSC_MISSING_DEADLINE_REF = `
<!DOCTYPE html>
<html>
<body>
  <table class="bpsc-table">
    <tr>
      <td>১</td>
      <td>উপ-সহকারী প্রকৌশলী (সিভিল)</td>
      <td>গৃহায়ন ও গণপূর্ত মন্ত্রণালয়</td>
      <!-- Missing refNo -->
      <td>১০ম গ্রেড</td>
      <td>৫০</td>
      <!-- Missing deadline -->
      <td>৫০০ টাকা</td>
      <td><a href="http://bpsc.teletalk.com.bd/circular/sae.pdf">বিজ্ঞপ্তি</a></td>
    </tr>
  </table>
</body>
</html>
`;

// 5. Distinct Positions with Similar Titles Under Same Ministry
export const FIXTURE_BPSC_DISTINCT_SIMILAR_TITLES = `
<!DOCTYPE html>
<html>
<body>
  <table class="bpsc-table">
    <tr>
      <td>1</td>
      <td>সহকারী পরিচালক (প্রশাসন)</td>
      <td>জনপ্রশাসন মন্ত্রণালয়</td>
      <td>স্মারক: BPSC-ADM-01</td>
      <td>৯ম গ্রেড</td>
      <td>৩০</td>
      <td>15 Jan, 2027</td>
      <td>500 BDT</td>
      <td><a href="http://bpsc.teletalk.com.bd/circular/adm.pdf">PDF</a></td>
    </tr>
    <tr>
      <td>2</td>
      <td>সহকারী পরিচালক (অর্থ ও হিসাব)</td>
      <td>জনপ্রশাসন মন্ত্রণালয়</td>
      <td>স্মারক: BPSC-ACC-02</td>
      <td>৯ম গ্রেড</td>
      <td>১৫</td>
      <td>15 Jan, 2027</td>
      <td>500 BDT</td>
      <td><a href="http://bpsc.teletalk.com.bd/circular/acc.pdf">PDF</a></td>
    </tr>
  </table>
</body>
</html>
`;

// 6. Malformed HTML
export const FIXTURE_BPSC_MALFORMED_HTML = `
<table width="100%">
  <tr><td class="captionL">BCS
  <tr><td><img src="arrow.jpg"><td><a href="http://bpsc.teletalk.com.bd/bcs52" class="mainlink">52nd BCS Examination 2027
  <tr><td>1<td>সহকারী প্রকৌশলী<td>সড়ক পরিবহন বিভাগ<td>স্মারক: RHD-2027<td>20<td>Deadline: 10 Feb, 2027<td><a href="http://bpsc.teletalk.com.bd/rhd.pdf">PDF
</table>
`;

// 7. Unsafe Links (SSRF Protection)
export const FIXTURE_BPSC_UNSAFE_LINKS = `
<table class="bpsc-table">
  <tr>
    <td>1</td>
    <td>প্রশাসনিক কর্মকর্তা</td>
    <td>সংস্থাপন বিভাগ</td>
    <td>BPSC-SEC-99</td>
    <td>10</td>
    <td>28 Dec, 2026</td>
    <td>500 BDT</td>
    <td>
      <a href="http://10.0.0.1/admin">Internal Network</a>
      <a href="http://localhost:8080/exploit">Localhost Link</a>
      <a href="http://unauthorized-domain.com/bpsc.pdf">Untrusted Domain</a>
      <a href="http://bpsc.teletalk.com.bd/circular/legit.pdf">Legitimate BPSC Circular</a>
    </td>
  </tr>
</table>
`;

// 8. Empty Structure / Altered Page
export const FIXTURE_BPSC_EMPTY_STRUCTURE = `
<!DOCTYPE html>
<html>
<body>
  <div class="notice-box">
    <p>No active exams or recruitments published at this time.</p>
  </div>
</body>
</html>
`;
