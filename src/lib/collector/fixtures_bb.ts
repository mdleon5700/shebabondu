/**
 * Comprehensive Offline HTML Fixtures for Bangladesh Bank e-Recruitment
 */

// 1. Single Valid Tabular Circular
export const FIXTURE_BB_VALID_SINGLE = `
<!DOCTYPE html>
<html>
<head><title>Bangladesh Bank eRecruitment</title></head>
<body>
  <div class="container">
    <h2>Available Job Openings</h2>
    <table class="w3-table">
      <thead>
        <tr>
          <th>SL</th>
          <th>Position & Organization</th>
          <th>Job Tracking / Memo</th>
          <th>Scale</th>
          <th>Vacancies</th>
          <th>Deadline</th>
          <th>Fee</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Assistant Director (General)<br/>for Bangladesh Bank</td>
          <td>BB/HRD/2026-042</td>
          <td>Grade-9</td>
          <td>100</td>
          <td>30 Nov, 2026</td>
          <td>200 BDT</td>
          <td>
            <a href="https://erecruitment.bb.org.bd/onlineapp/joblist.php?id=25103">Apply Online</a>
            <a href="https://erecruitment.bb.org.bd/career/circular_25103.pdf">Download Circular</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
`;

// 2. Real Live-Format Ongoing Applications & Circulars List
export const FIXTURE_BB_MULTIPLE_LISTINGS = `
<!DOCTYPE html>
<html>
<head><title>Bangladesh Bank eRecruitment Website</title></head>
<body>
  <div class="w3-container">
    <h5 class="bar">Ongoing Application: Apply Online</h5>
    <ul class="w3-ul w3-hoverable">
      <li>System Manager (Grade-3) for Ansar VDP Unnayan Bank / Closing date: 02 Nov, 2026&nbsp;&nbsp;<a onclick="openJobList('25101');">[Apply Online]</a></li>
      <li>Principal Officer (Grade-6) for Ansar VDP Unnayan Bank / Closing date: 02 Nov, 2026&nbsp;&nbsp;<a onclick="openJobList('25102');">[Apply Online]</a></li>
      <li>Officer (Cash) (Grade-10) for Bangladesh Bank / Closing date: 15 Dec, 2026&nbsp;&nbsp;<a onclick="openJobList('25105');">[Apply Online]</a></li>
    </ul>

    <h5 class="bar">Job Circulars</h5>
    <ul class="w3-ul w3-hoverable">
      <li>Date extension of job circular for Ansar VDP Unnayan Bank.&nbsp;&nbsp;<a onclick="showpdf('20261026_bscs_347_1793007303.pdf');">details..</a></li>
      <li>New job circular of Ansar VDP Unnayan Bank.&nbsp;&nbsp;<a onclick="showpdf('20261005_bscs_321_1791188486.pdf');">details..</a></li>
    </ul>
  </div>
</body>
</html>
`;

// 3. Bengali Numerals & Dates
export const FIXTURE_BB_BENGALI_NUMERALS_DATES = `
<!DOCTYPE html>
<html>
<head><title>বাংলাদেশ ব্যাংক নিয়োগ পোর্টাল</title></head>
<body>
  <div class="bb-container">
    <table class="w3-table">
      <tr>
        <td>১</td>
        <td>সহকারী পরিচালক (সাধারণ)<br/>বাংলাদেশ ব্যাংক</td>
        <td>স্মারক নং: বিসিএস/নিয়োগ-২০২৬/০৮</td>
        <td>৯ম গ্রেড</td>
        <td>পদসংখ্যা: ১০০টি</td>
        <td>আবেদনের শেষ তারিখ: ১৫ ডিসেম্বর ২০২৬</td>
        <td>ফি: ২০০ টাকা</td>
        <td><a href="https://erecruitment.bb.org.bd/career/circular_ad_bn.pdf">বিজ্ঞপ্তি ডাউনলোড</a></td>
      </tr>
      <tr>
        <td>২</td>
        <td>সিনিয়র অফিসার (সাধারণ)<br/>সোনালী ব্যাংক পিএলসি</td>
        <td>স্মারক নং: এসবি-২০২৬-১১২</td>
        <td>৯ম গ্রেড</td>
        <td>পদসংখ্যা: ৫০</td>
        <td>আবেদনের শেষ তারিখ: ২০ ডিসেম্বর ২০২৬</td>
        <td>ফি: ২০০ টাকা</td>
        <td><a href="https://erecruitment.bb.org.bd/onlineapp/joblist.php">আবেদন করুন</a></td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

// 4. Missing Fields (Requires Manual Review Flag)
export const FIXTURE_BB_MISSING_FIELDS = `
<!DOCTYPE html>
<html>
<body>
  <table class="w3-table">
    <tr>
      <td>১</td>
      <td>অ্যাসিস্ট্যান্ট প্রোগ্রামার (আইটি)<br/>for Bangladesh Bank</td>
      <td>BB/IT/2026-99</td>
      <td>Grade-9</td>
      <td>১৫</td>
      <!-- Missing deadline completely -->
      <td>২০০ টাকা</td>
      <td><a href="https://erecruitment.bb.org.bd/career/it_prog.pdf">Details</a></td>
    </tr>
  </table>
</body>
</html>
`;

// 5. Distinct Positions with Similar Titles Under Same Bank
export const FIXTURE_BB_DISTINCT_SIMILAR_TITLES = `
<!DOCTYPE html>
<html>
<body>
  <table class="w3-table">
    <tr>
      <td>1</td>
      <td>Assistant Director (General)<br/>for Bangladesh Bank</td>
      <td>BB/GEN/2026-01</td>
      <td>Grade-9</td>
      <td>80</td>
      <td>25 Dec, 2026</td>
      <td>200 BDT</td>
      <td><a href="https://erecruitment.bb.org.bd/career/gen.pdf">Details</a></td>
    </tr>
    <tr>
      <td>2</td>
      <td>Assistant Director (IT)<br/>for Bangladesh Bank</td>
      <td>BB/IT/2026-02</td>
      <td>Grade-9</td>
      <td>20</td>
      <td>25 Dec, 2026</td>
      <td>200 BDT</td>
      <td><a href="https://erecruitment.bb.org.bd/career/it.pdf">Details</a></td>
    </tr>
  </table>
</body>
</html>
`;

// 6. Malformed HTML (Broken tags, unclosed cells)
export const FIXTURE_BB_MALFORMED_HTML = `
<div class="w3-card">
  <tr><td>1<td>Principal Officer (Audit) for Bangladesh Bank<td>BB-AUDIT-2026<td>Grade-6<td>5<td>Closing date: 10 Jan, 2027<td><a href="https://erecruitment.bb.org.bd/career/audit.pdf">PDF
  <ul class="w3-ul">
    <li>Officer (General) for Agrani Bank / Closing date: 12 Jan, 2027<a onclick="openJobList('25109');">[Apply]
`;

// 7. Unsafe Links (SSRF Protection & Protocol Neutralization)
export const FIXTURE_BB_UNSAFE_LINKS = `
<table class="w3-table">
  <tr>
    <td>1</td>
    <td>Officer (Cash) for Bangladesh Bank</td>
    <td>BB-REF-SSRF</td>
    <td>Grade-10</td>
    <td>10</td>
    <td>15 Dec, 2026</td>
    <td>200 BDT</td>
    <td>
      <a href="http://169.254.169.254/latest/meta-data">AWS Metadata</a>
      <a href="http://malicious-phishing-site.com/circular.pdf">Malicious Link</a>
      <a href="javascript:alert(1)">XSS Link</a>
      <a href="https://erecruitment.bb.org.bd/career/official.pdf">Legitimate PDF</a>
    </td>
  </tr>
</table>
`;

// 8. Empty Structure / Altered Page
export const FIXTURE_BB_EMPTY_STRUCTURE = `
<!DOCTYPE html>
<html>
<body>
  <div class="empty-notice">
    <p>Currently there are no active recruitment circulars published on this portal.</p>
  </div>
</body>
</html>
`;

// 9. Bot Challenge / Captcha Page
export const FIXTURE_BB_CAPTCHA_CHALLENGE = `
<!DOCTYPE html>
<html>
<head><title>Verification</title></head>
<body>
  <script type="text/javascript" src="/TSPD/0889d536c9ab2000a6108be491a36926a379a3baba0152e32f9bc019aabf8e679b03fa58b255437a?type=5"></script>
  <b>What code is in the image?</b>
  <input type="text" id="ans" name="answer" value="" />
  <button id="jar" type="button">submit</button>
  <p>Your support ID is: 2165770897626339414</p>
</body>
</html>
`;
