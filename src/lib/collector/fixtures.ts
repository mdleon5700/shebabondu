/**
 * Test HTML Fixtures for Teletalk / Government Job Portal Parser
 * Covers all 10 required offline test scenarios
 */

// 1. Valid Single Job Listing
export const FIXTURE_VALID_SINGLE = `
<!DOCTYPE html>
<html>
<head><title>Teletalk Alljobs - Circular Detail</title></head>
<body>
  <div class="job-card" data-ref="BPSC-2026-ADM-01">
    <h2 class="job-title">সহকারী পরিচালক (সাধারণ)</h2>
    <div class="organization">বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)</div>
    <div class="meta">
      <span class="ref">স্মারক নং: ০৫.০১.০০০০.১২৩.২৪.০২৬</span>
      <span class="vacancies">পদসংখ্যা: ৪৫</span>
      <span class="published">প্রকাশের তারিখ: ২৫ অক্টোবর ২০২৬</span>
      <span class="start">আবেদন শুরুর তারিখ: ০১ নভেম্বর ২০২৬</span>
      <span class="deadline">আবেদনের শেষ তারিখ: ৩০ নভেম্বর ২০২৬</span>
    </div>
    <div class="actions">
      <a href="https://bpsc.teletalk.com.bd/apply/adm01" class="btn-apply">বিস্তারিত দেখুন ও আবেদন করুন</a>
      <a href="https://bpsc.teletalk.com.bd/circulars/adm01.pdf" class="btn-pdf">অফিসিয়াল সার্কুলার (PDF)</a>
    </div>
  </div>
</body>
</html>
`;

// 2. Multiple Job Listings on One Page
export const FIXTURE_MULTIPLE_LISTINGS = `
<!DOCTYPE html>
<html>
<head><title>Current Job Circulars</title></head>
<body>
  <div class="container">
    <div class="job-card">
      <h3 class="job-title">হিসাবরক্ষণ কর্মকর্তা</h3>
      <div class="organization">বাংলাদেশ ডাক বিভাগ</div>
      <div>স্মারক নং: ১৪.০১.২০২৬.৮৯</div>
      <div>পদসংখ্যা: ২০</div>
      <div>আবেদনের শেষ তারিখ: ২০ ডিসেম্বর ২০২৬</div>
      <a href="https://alljobs.teletalk.com.bd/post/accounts" class="btn">বিস্তারিত আবেদন</a>
      <a href="https://alljobs.teletalk.com.bd/docs/post_accounts.pdf">PDF</a>
    </div>
    <div class="job-card">
      <h3 class="job-title">উপ-সহকারী প্রকৌশলী (টেলিকম)</h3>
      <div class="organization">বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (BTRC)</div>
      <div>স্মারক নং: বিটিআরসি/প্রকৌ/২০২৬/০৫</div>
      <div>পদসংখ্যা: ৩৫</div>
      <div>আবেদনের শেষ তারিখ: ২৫ ডিসেম্বর ২০২৬</div>
      <a href="https://alljobs.teletalk.com.bd/btrc/sub-eng" class="btn">বিস্তারিত দেখুন</a>
    </div>
  </div>
</body>
</html>
`;

// 3. Bengali Text and Bengali Numerals / Dates
export const FIXTURE_BENGALI_NUMERALS_DATES = `
<div class="circular-item">
  <span class="title">সিনিয়র অফিসার (সাধারণ ব্যাংকিং)</span>
  <span class="org">বাংলাদেশ কৃষি ব্যাংক</span>
  <div>স্মারক নম্বর: বিকেবি/প্রশা/২০২৬/৯৯</div>
  <div>পদসংখ্যা: ১৪০টি</div>
  <div>প্রকাশের তারিখ: ১২ অক্টোবর ২০২৬</div>
  <div>আবেদনের শেষ সময়: ১৫ ডিসেম্বর ২০২৬ বিকাল ৫টা পর্যন্ত</div>
  <a href="https://erecruitment.bb.org.bd/onlineapp/bkb_so.php">বিস্তারিত আবেদন করুন</a>
</div>
`;

// 4. Missing Deadline or Reference Number (Flagged for Review)
export const FIXTURE_MISSING_DEADLINE_REF = `
<div class="job-card">
  <h3 class="job-title">ডাটা এন্ট্রি অপারেটর নিয়োগ</h3>
  <div class="organization">পরিসংখ্যান ও তথ্য ব্যবস্থাপনা বিভাগ</div>
  <!-- Note: No deadline or reference number provided in this segment -->
  <div>পদসংখ্যা: ১০</div>
  <a href="https://alljobs.teletalk.com.bd/jobs/deo">বিস্তারিত</a>
</div>
`;

// 5. Duplicate Circular (Exact match to existing canonical job)
export const FIXTURE_DUPLICATE_CIRCULAR = `
<div class="job-card">
  <span class="job-title">সিনিয়র অফিসার (সাধারণ)</span>
  <span class="organization">বাংলাদেশ ব্যাংক ও ৮টি ব্যাংক/আর্থিক প্রতিষ্ঠান (বিএসসিএস)</span>
  <div>স্মারক নং: 20261027_bscs_348</div>
  <div>পদসংখ্যা: ৮৭৪</div>
  <div>আবেদনের শেষ তারিখ: ২৫ নভেম্বর ২০২৬</div>
  <a href="https://erecruitment.bb.org.bd">বিস্তারিত</a>
</div>
`;

// 6. Distinct Positions with Similar Titles Under Same Organization
export const FIXTURE_SIMILAR_TITLE_DISTINCT_ROLE = `
<div class="job-card">
  <span class="job-title">সিনিয়র অফিসার (তথ্যপ্রযুক্তি / আইটি)</span>
  <span class="organization">বাংলাদেশ ব্যাংক ও ৮টি ব্যাংক/আর্থিক প্রতিষ্ঠান (বিএসসিএস)</span>
  <div>স্মারক নং: 20261027_bscs_IT_99</div>
  <div>পদসংখ্যা: ১২০</div>
  <div>আবেদনের শেষ তারিখ: ৩০ ডিসেম্বর ২০২৬</div>
  <a href="https://erecruitment.bb.org.bd/it-recruitment">বিস্তারিত</a>
</div>
`;

// 7. Malformed / Broken HTML
export const FIXTURE_MALFORMED_HTML = `
<div>
  <tr class="job-row">
    <td><a class="job-title">কম্পিউটার অপারেটর</td>
    <td><div class="org">ভূমি সংস্কার বোর্ড</div>
    <td>স্মারক নং: ভূমি/২০২৬/০১
    <td>পদসংখ্যা: ১২
    <td>আবেদনের শেষ তারিখ: ১৮ ডিসেম্বর ২০২৬
    <td><a href="https://alljobs.teletalk.com.bd/land/apply">বিস্তারিত
  </tr>
<!-- unclosed tags and mismatched elements -->
`;

// 8. Unsafe External Links (SSRF & Untrusted Domains)
export const FIXTURE_UNSAFE_LINKS = `
<div class="job-card">
  <h3 class="job-title">অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক</h3>
  <div class="organization">পরিবেশ অধিদপ্তর</div>
  <div>স্মারক নং: ডিওই/২০২৬/০২</div>
  <div>আবেদনের শেষ তারিখ: ১০ ডিসেম্বর ২০২৬</div>
  <!-- Unsafe SSRF target and malicious domain -->
  <a href="http://169.254.169.254/latest/meta-data">বিস্তারিত</a>
  <a href="http://untrusted-scam-phishing.com/steal.pdf">PDF সার্কুলার</a>
</div>
`;

// 9. Empty Listing Page
export const FIXTURE_EMPTY_PAGE = `
<!DOCTYPE html>
<html>
<head><title>Job Listings - None Available</title></head>
<body>
  <div class="container">
    <h2>বর্তমানে কোনো নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়নি</h2>
    <div class="no-records">কোনো তথ্য পাওয়া যায়নি।</div>
  </div>
</body>
</html>
`;

// 10. Changed Page Structure (Site Redesign or Maintenance Shell)
export const FIXTURE_CHANGED_PAGE_STRUCTURE = `
<!DOCTYPE html>
<html>
<head><title>System Maintenance</title></head>
<body>
  <header><h1>Alljobs Portal</h1></header>
  <main>
    <section class="banner">
      <p>ওয়েবসাইট রক্ষণাবেক্ষণের কাজ চলছে। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত।</p>
    </section>
  </main>
</body>
</html>
`;
