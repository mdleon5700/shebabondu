import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { JobCircular, JobPosition } from '@/lib/types';

// Convert English digits to Bengali digits
function toBn(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)] || d);
}

// Escape XML special characters
function escapeXml(unsafe?: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; page: string } }
) {
  const { id, page } = params;
  const isPage2 = page.includes('2');

  const job = serverDB.getJobById(id);
  if (!job) {
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><text x="400" y="200" text-anchor="middle" font-size="20" fill="#dc2626">বিজ্ঞপ্তি খুঁজে পাওয়া যায়নি</text></svg>`,
      { status: 404, headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  const org = escapeXml(job.organization);
  const title = escapeXml(job.title);
  const officialLink = escapeXml(job.officialLink || 'http://alljobs.teletalk.com.bd');
  const smsPrefix = escapeXml(job.smsPrefix || 'JOB');
  const deadline = escapeXml(job.deadline);
  const publishedDate = escapeXml(job.publishedDate || '২৮ অক্টোবর ২০২৬');
  const memoNo = escapeXml(`স্মারক নং: ${job.smsPrefix || 'CS'}/নিয়োগ/২০২৬-${job.id.slice(-4)}`);
  const districts = escapeXml(job.districts || 'সকল জেলার যোগ্য প্রার্থীরা আবেদন করতে পারবেন');
  const totalPostsBn = toBn(job.totalPosts);
  const govtFeeBn = toBn(job.govtFee);
  const minAgeBn = toBn(job.minAge);
  const maxAgeBn = toBn(job.maxAge);

  const positions: JobPosition[] = job.positions && job.positions.length > 0
    ? job.positions
    : [{
        title: job.title,
        grade: job.grade,
        posts: job.totalPosts,
        salary: job.salary,
        minEducation: job.minEducation,
        govtFee: job.govtFee
      }];

  let svgContent = '';

  if (!isPage2) {
    // -------------------------------------------------------------
    // PAGE 1: OFFICIAL NOTICE & POSITIONS TABLE
    // -------------------------------------------------------------
    const tableRows = positions.slice(0, 5).map((pos, idx) => {
      const rowY = 350 + (idx * 68);
      const rowNumBn = toBn(idx + 1);
      const posTitle = escapeXml(pos.title);
      const posGrade = escapeXml(pos.grade);
      const posSalary = escapeXml(pos.salary);
      const posPosts = toBn(pos.posts) + 'টি';
      const posEdu = escapeXml(pos.minEducation.length > 60 ? pos.minEducation.slice(0, 58) + '...' : pos.minEducation);
      const posFee = toBn(pos.govtFee || job.govtFee) + '/-';

      return `
        <!-- Row ${idx + 1} -->
        <rect x="50" y="${rowY}" width="750" height="68" fill="${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}" stroke="#cbd5e1" stroke-width="0.8" />
        <line x1="90" y1="${rowY}" x2="90" y2="${rowY + 68}" stroke="#cbd5e1" stroke-width="0.8" />
        <line x1="280" y1="${rowY}" x2="280" y2="${rowY + 68}" stroke="#cbd5e1" stroke-width="0.8" />
        <line x1="410" y1="${rowY}" x2="410" y2="${rowY + 68}" stroke="#cbd5e1" stroke-width="0.8" />
        <line x1="475" y1="${rowY}" x2="475" y2="${rowY + 68}" stroke="#cbd5e1" stroke-width="0.8" />
        <line x1="730" y1="${rowY}" x2="730" y2="${rowY + 68}" stroke="#cbd5e1" stroke-width="0.8" />

        <text x="70" y="${rowY + 38}" class="td" text-anchor="middle">${rowNumBn}</text>
        <text x="100" y="${rowY + 28}" class="td bold">${posTitle}</text>
        <text x="100" y="${rowY + 48}" class="meta">${posGrade}</text>
        <text x="290" y="${rowY + 38}" class="td">${posSalary}</text>
        <text x="442" y="${rowY + 38}" class="td bold" text-anchor="middle">${posPosts}</text>
        <text x="485" y="${rowY + 38}" class="td-small">${posEdu}</text>
        <text x="765" y="${rowY + 38}" class="td bold" text-anchor="middle">${posFee}</text>
      `;
    }).join('\n');

    const tableBottom = 350 + (Math.min(positions.length, 5) * 68) + 30;

    svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1200" width="100%" height="100%">
      <defs>
        <style>
          .crest-txt { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 13px; font-weight: bold; fill: #047857; text-anchor: middle; letter-spacing: 0.5px; }
          .org-title { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 21px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
          .sub-title { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 14px; fill: #334155; text-anchor: middle; }
          .head-badge { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 16px; font-weight: bold; fill: #047857; text-anchor: middle; }
          .meta { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 12px; fill: #475569; }
          .text-p { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 13.5px; fill: #1e293b; line-height: 1.6; }
          .th { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 12px; font-weight: bold; fill: #0f172a; }
          .td { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 12px; fill: #0f172a; }
          .td-small { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 11px; fill: #334155; }
          .bold { font-weight: bold; }
          .seal-txt { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 11px; fill: #047857; text-anchor: middle; }
        </style>
      </defs>

      <!-- Background & Official Government Borders -->
      <rect width="850" height="1200" fill="#ffffff" />
      <rect x="25" y="25" width="800" height="1150" fill="none" stroke="#cbd5e1" stroke-width="1.5" />
      <rect x="30" y="30" width="790" height="1140" fill="none" stroke="#047857" stroke-width="0.8" opacity="0.4" />

      <!-- Watermark Background Seal -->
      <g opacity="0.03" transform="translate(425, 600) scale(4)">
        <circle r="60" fill="none" stroke="#047857" stroke-width="3" />
        <text text-anchor="middle" y="10" font-size="28" font-family="'SolaimanLipi', sans-serif">চাকরি সেবা</text>
      </g>

      <!-- Header & Bangladesh Government Crest -->
      <g transform="translate(425, 70)">
        <circle r="26" fill="#ecfdf5" stroke="#059669" stroke-width="1.5" />
        <circle r="22" fill="none" stroke="#047857" stroke-width="0.8" stroke-dasharray="3,2" />
        <text y="7" font-size="24" text-anchor="middle">🏛️</text>
      </g>

      <text x="425" y="118" class="crest-txt">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
      <text x="425" y="145" class="org-title">${org}</text>
      <text x="425" y="167" class="sub-title">প্রশাসন ও মানবসম্পদ বিভাগ, ঢাকা</text>
      <text x="425" y="185" class="sub-title">ওয়েবসাইট: ${officialLink}</text>

      <line x1="50" y1="198" x2="800" y2="198" stroke="#047857" stroke-width="1" />

      <!-- Memo No & Date -->
      <text x="55" y="218" class="meta">${memoNo}</text>
      <text x="795" y="218" class="meta" text-anchor="end">তারিখ: ${publishedDate}</text>

      <!-- Title Pill -->
      <rect x="240" y="235" width="370" height="34" rx="6" fill="#f0fdf4" stroke="#86efac" />
      <text x="425" y="258" class="head-badge">নিয়োগ বিজ্ঞপ্তি (পৃষ্ঠা - ০১)</text>

      <!-- Introductory Notice Body -->
      <text x="50" y="295" class="text-p">${org}-এর রাজস্ব খাতভুক্ত নিম্নবর্ণিত স্থায়ী শূন্য পদসমূহে সরাসরি প্রতিযোগিতামূলক পরীক্ষার মাধ্যমে</text>
      <text x="50" y="315" class="text-p">জনবল নিয়োগের নিমিত্তে পদের পার্শ্বে বর্ণিত যোগ্যতা ও শর্তে প্রকৃত বাংলাদেশি নাগরিকদের নিকট হতে অনলাইনে (${officialLink}) দরখাস্ত আহ্বান করা যাচ্ছে:</text>

      <!-- Positions Table Header -->
      <g transform="translate(50, 325)">
        <rect x="0" y="0" width="750" height="25" fill="#f1f5f9" stroke="#94a3b8" />
        <line x1="40" y1="0" x2="40" y2="25" stroke="#94a3b8" />
        <line x1="230" y1="0" x2="230" y2="25" stroke="#94a3b8" />
        <line x1="360" y1="0" x2="360" y2="25" stroke="#94a3b8" />
        <line x1="425" y1="0" x2="425" y2="25" stroke="#94a3b8" />
        <line x1="680" y1="0" x2="680" y2="25" stroke="#94a3b8" />

        <text x="20" y="17" class="th" text-anchor="middle">ক্র.</text>
        <text x="135" y="17" class="th" text-anchor="middle">পদের নাম ও গ্রেড</text>
        <text x="295" y="17" class="th" text-anchor="middle">বেতন স্কেল</text>
        <text x="392" y="17" class="th" text-anchor="middle">পদসংখ্যা</text>
        <text x="552" y="17" class="th" text-anchor="middle">শিক্ষাগত যোগ্যতা</text>
        <text x="715" y="17" class="th" text-anchor="middle">ফি</text>
      </g>

      <!-- Position Rows -->
      ${tableRows}

      <!-- Bottom Highlights & Eligible Districts -->
      <g transform="translate(50, ${tableBottom})">
        <rect x="0" y="0" width="750" height="70" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="20" y="25" class="text-p bold">আবেদনের নিয়মাবলী ও জেলা কোটা:</text>
        <text x="20" y="45" class="text-p">১. ${districts}। বীর মুক্তিযোদ্ধা, প্রতিবন্ধী ও এতিম কোটার ক্ষেত্রে সকল জেলার প্রার্থীরা আবেদন করতে পারবেন।</text>
        <text x="20" y="62" class="text-p">২. মোট শূন্যপদের সংখ্যা: <tspan class="bold" fill="#047857">${totalPostsBn} টি</tspan>। পদের সংখ্যা হ্রাস/বৃদ্ধি বা বাতিলের ক্ষমতা কর্তৃপক্ষ সংরক্ষণ করেন।</text>
      </g>

      <!-- Official Seal & Signature Section -->
      <g transform="translate(560, ${Math.min(tableBottom + 120, 1050)})">
        <!-- Curve Signature Graphic -->
        <path d="M 20 40 Q 50 10 80 35 T 140 25 T 180 38" fill="none" stroke="#047857" stroke-width="1.8" stroke-linecap="round" />
        <!-- Official Seal Stamp -->
        <circle cx="100" cy="50" r="38" fill="#f0fdf4" stroke="#047857" stroke-width="1.2" opacity="0.6" stroke-dasharray="4,2" />
        <text x="100" y="42" class="seal-txt">অফিসিয়াল সিল</text>
        <text x="100" y="58" class="seal-txt" font-size="9">${publishedDate}</text>
        <text x="100" y="105" class="meta bold" text-anchor="middle">সদস্য-সচিব ও উপ-পরিচালক</text>
        <text x="100" y="122" class="meta" text-anchor="middle">বিভাগীয় নিয়োগ ও পদোন্নতি কমিটি</text>
        <text x="100" y="138" class="meta" text-anchor="middle">${org}</text>
      </g>

      <!-- Security Microtext Footer -->
      <line x1="50" y1="1145" x2="800" y2="1145" stroke="#cbd5e1" stroke-width="0.8" />
      <text x="50" y="1162" class="meta">ভেরিফাইড অফিসিয়াল গ্যাজেট • চাকরি সেবা ডিজিটাল আর্কাইভ • আবেদনের শেষ তারিখ: ${deadline}</text>
      <text x="795" y="1162" class="meta" text-anchor="end">পৃষ্ঠা ০১ / ০২</text>
    </svg>
    `;
  } else {
    // -------------------------------------------------------------
    // PAGE 2: TELETALK ONLINE INSTRUCTIONS & SMS FORMAT
    // -------------------------------------------------------------
    svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1200" width="100%" height="100%">
      <defs>
        <style>
          .crest-txt { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 13px; font-weight: bold; fill: #047857; text-anchor: middle; letter-spacing: 0.5px; }
          .org-title { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 21px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
          .sub-title { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 14px; fill: #334155; text-anchor: middle; }
          .head-badge { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 16px; font-weight: bold; fill: #047857; text-anchor: middle; }
          .meta { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 12px; fill: #475569; }
          .text-p { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 13.5px; fill: #1e293b; line-height: 1.6; }
          .bold { font-weight: bold; }
          .code-box { font-family: 'Courier New', monospace; font-size: 15px; font-weight: bold; fill: #047857; }
          .rule-title { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; }
          .seal-txt { font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif; font-size: 11px; fill: #047857; text-anchor: middle; }
        </style>
      </defs>

      <!-- Background & Official Government Borders -->
      <rect width="850" height="1200" fill="#ffffff" />
      <rect x="25" y="25" width="800" height="1150" fill="none" stroke="#cbd5e1" stroke-width="1.5" />
      <rect x="30" y="30" width="790" height="1140" fill="none" stroke="#047857" stroke-width="0.8" opacity="0.4" />

      <!-- Header -->
      <g transform="translate(425, 65)">
        <circle r="22" fill="#ecfdf5" stroke="#059669" stroke-width="1.5" />
        <text y="7" font-size="20" text-anchor="middle">🏛️</text>
      </g>
      <text x="425" y="110" class="crest-txt">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
      <text x="425" y="135" class="org-title">${org}</text>
      <text x="425" y="157" class="sub-title">অনলাইনে আবেদনপত্র পূরণ ও পরীক্ষার ফি জমাদানের নিয়মাবলী</text>

      <line x1="50" y1="172" x2="800" y2="172" stroke="#047857" stroke-width="1" />

      <!-- Title Pill -->
      <rect x="230" y="185" width="390" height="34" rx="6" fill="#f0fdf4" stroke="#86efac" />
      <text x="425" y="208" class="head-badge">নির্দেশিকা ও টেলিটক SMS পেমেন্ট (পৃষ্ঠা - ০২)</text>

      <!-- Section 1: Age & Eligibility Rules -->
      <g transform="translate(50, 235)">
        <rect x="0" y="0" width="750" height="120" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="20" y="25" class="rule-title">১. বয়সসীমা ও শর্তাবলী:</text>
        <text x="20" y="48" class="text-p">• ০১ নভেম্বর ২০২৬ তারিখে প্রার্থীর বয়সসীমা <tspan class="bold">${minAgeBn} হতে ${maxAgeBn} বছর</tspan> হতে হবে।</text>
        <text x="20" y="70" class="text-p">• বীর মুক্তিযোদ্ধা/শহীদ মুক্তিযোদ্ধার সন্তান এবং শারীরিক প্রতিবন্ধীদের ক্ষেত্রে সর্বোচ্চ বয়সসীমা <tspan class="bold">৩২ বছর</tspan> পর্যন্ত শিথিলযোগ্য।</text>
        <text x="20" y="92" class="text-p">• বয়স প্রমাণের ক্ষেত্রে কোনো প্রকার এফিডেভিট গ্রহণযোগ্য হবে না (এসএসসি/সমমানের সনদ অনুযায়ী যাচাই হবে)।</text>
        <text x="20" y="112" class="text-p">• সরকারি/আধা-সরকারি/স্বায়ত্তশাসিত সংস্থায় কর্মরত প্রার্থীদের যথাযথ কর্তৃপক্ষের অনুমতি নিয়ে আবেদন করতে হবে।</text>
      </g>

      <!-- Section 2: Online Photo & Signature -->
      <g transform="translate(50, 370)">
        <rect x="0" y="0" width="750" height="110" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="20" y="25" class="rule-title">২. অনলাইনে আবেদনপত্র পূরণ ও আপলোড নির্দেশিকা:</text>
        <text x="20" y="48" class="text-p">• প্রার্থীরা <tspan class="bold" fill="#047857">${officialLink}</tspan> অথবা চাকরি সেবা পোর্টাল থেকে সরাসরি আবেদন করতে পারবেন।</text>
        <text x="20" y="70" class="text-p">• <tspan class="bold">রঙিন ছবি:</tspan> ৩০০ × ৩০০ পিক্সেল (সর্বোচ্চ ১০০ KB, সাদা বা হালকা ব্যাকগ্রাউন্ড)।</text>
        <text x="20" y="92" class="text-p">• <tspan class="bold">স্বাক্ষর:</tspan> ৩০০ × ৮০ পিক্সেল (সর্বোচ্চ ৬০ KB, সাদা কাগজে স্পষ্ট কালো কালির স্বাক্ষর)।</text>
      </g>

      <!-- Section 3: Teletalk SMS Procedure (HIGHLIGHTED) -->
      <g transform="translate(50, 495)">
        <rect x="0" y="0" width="750" height="235" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5" />
        <text x="25" y="30" class="rule-title" fill="#047857">৩. টেলিটক প্রিপেইড মোবাইলে SMS-এর মাধ্যমে ফি জমাদান:</text>
        <text x="25" y="52" class="text-p">আবেদনপত্র অনলাইনে সাবমিট করার পর প্রাপ্ত <tspan class="bold">User ID</tspan> ব্যবহার করে ৭২ ঘণ্টার মধ্যে ফি জমা দিতে হবে:</text>

        <!-- SMS 1 Box -->
        <rect x="25" y="65" width="700" height="65" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <text x="40" y="88" class="text-p bold">১ম SMS:</text>
        <text x="110" y="88" class="code-box">${smsPrefix} &lt;space&gt; User ID</text>
        <text x="420" y="88" class="meta">লিখে পাঠিয়ে দিন <tspan class="bold" fill="#047857">16222</tspan> নম্বরে।</text>
        <text x="40" y="112" class="meta">উদাহরণ: ${smsPrefix} ABCDEF (ফিরতি SMS-এ একটি ৮ ডিজিটের PIN নম্বর প্রদান করা হবে)।</text>

        <!-- SMS 2 Box -->
        <rect x="25" y="140" width="700" height="65" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <text x="40" y="163" class="text-p bold">২য় SMS:</text>
        <text x="110" y="163" class="code-box">${smsPrefix} &lt;space&gt; YES &lt;space&gt; PIN</text>
        <text x="460" y="163" class="meta">লিখে পাঠিয়ে দিন <tspan class="bold" fill="#047857">16222</tspan> নম্বরে।</text>
        <text x="40" y="188" class="meta">উদাহরণ: ${smsPrefix} YES 12345678 (ফিরতি SMS-এ পাসওয়ার্ড ও কনফার্মেশন পাবেন)।</text>

        <text x="25" y="222" class="text-p bold" fill="#047857">মোট সরকারি ফি: ৳${govtFeeBn}/- টাকা (টেলিটক এসএমএস চার্জ প্রযোজ্য)।</text>
      </g>

      <!-- Section 4: General Terms & Deadline -->
      <g transform="translate(50, 745)">
        <rect x="0" y="0" width="750" height="120" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="20" y="25" class="rule-title">৪. সাধারণ জ্ঞাতব্য ও প্রবেশপত্র সংগ্রহ:</text>
        <text x="20" y="48" class="text-p">• আবেদনের শেষ তারিখ ও সময়: <tspan class="bold" fill="#b91c1c">${deadline}</tspan> বিকাল ৫:০০ টা পর্যন্ত।</text>
        <text x="20" y="70" class="text-p">• প্রবেশপত্র প্রাপ্তির বিষয়টি প্রার্থীকে তাঁর মোবাইল নম্বরে SMS-এর মাধ্যমে যথাসময়ে অবহিত করা হবে।</text>
        <text x="20" y="92" class="text-p">• লিখিত/ব্যবহারিক/মৌখিক পরীক্ষার সময় আবেদনপত্রের কপি ও সকল মূল সনদ প্রদর্শন করতে হবে।</text>
        <text x="20" y="112" class="text-p">• যেকোনো সহায়তার জন্য টেলিটক থেকে <tspan class="bold">121</tspan> অথবা <tspan class="bold">alljobs.query@teletalk.com.bd</tspan> এ যোগাযোগ করুন।</text>
      </g>

      <!-- Signatory Section & Barcode -->
      <g transform="translate(50, 890)">
        <!-- Barcode Graphic -->
        <rect x="0" y="30" width="220" height="45" fill="#f8fafc" stroke="#cbd5e1" />
        <line x1="20" y1="35" x2="20" y2="70" stroke="#0f172a" stroke-width="2" />
        <line x1="25" y1="35" x2="25" y2="70" stroke="#0f172a" stroke-width="4" />
        <line x1="33" y1="35" x2="33" y2="70" stroke="#0f172a" stroke-width="1.5" />
        <line x1="40" y1="35" x2="40" y2="70" stroke="#0f172a" stroke-width="3" />
        <line x1="50" y1="35" x2="50" y2="70" stroke="#0f172a" stroke-width="2" />
        <line x1="58" y1="35" x2="58" y2="70" stroke="#0f172a" stroke-width="4" />
        <line x1="68" y1="35" x2="68" y2="70" stroke="#0f172a" stroke-width="1.5" />
        <line x1="75" y1="35" x2="75" y2="70" stroke="#0f172a" stroke-width="3" />
        <line x1="85" y1="35" x2="85" y2="70" stroke="#0f172a" stroke-width="2" />
        <line x1="95" y1="35" x2="95" y2="70" stroke="#0f172a" stroke-width="5" />
        <line x1="105" y1="35" x2="105" y2="70" stroke="#0f172a" stroke-width="1.5" />
        <line x1="115" y1="35" x2="115" y2="70" stroke="#0f172a" stroke-width="3" />
        <line x1="125" y1="35" x2="125" y2="70" stroke="#0f172a" stroke-width="2" />
        <line x1="135" y1="35" x2="135" y2="70" stroke="#0f172a" stroke-width="4" />
        <line x1="145" y1="35" x2="145" y2="70" stroke="#0f172a" stroke-width="2" />
        <line x1="155" y1="35" x2="155" y2="70" stroke="#0f172a" stroke-width="3" />
        <line x1="165" y1="35" x2="165" y2="70" stroke="#0f172a" stroke-width="1.5" />
        <line x1="175" y1="35" x2="175" y2="70" stroke="#0f172a" stroke-width="4" />
        <line x1="185" y1="35" x2="185" y2="70" stroke="#0f172a" stroke-width="2" />
        <line x1="195" y1="35" x2="195" y2="70" stroke="#0f172a" stroke-width="3" />
        <text x="110" y="90" class="meta" text-anchor="middle">VERIFIED-TELETALK-2026</text>

        <!-- Right Signatory -->
        <g transform="translate(510, 0)">
          <path d="M 20 40 Q 50 10 80 35 T 140 25 T 180 38" fill="none" stroke="#047857" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="100" cy="50" r="38" fill="#f0fdf4" stroke="#047857" stroke-width="1.2" opacity="0.6" stroke-dasharray="4,2" />
          <text x="100" y="42" class="seal-txt">অফিসিয়াল সিল</text>
          <text x="100" y="58" class="seal-txt" font-size="9">${publishedDate}</text>
          <text x="100" y="105" class="meta bold" text-anchor="middle">সদস্য-সচিব ও উপ-পরিচালক</text>
          <text x="100" y="122" class="meta" text-anchor="middle">বিভাগীয় নিয়োগ ও পদোন্নতি কমিটি</text>
          <text x="100" y="138" class="meta" text-anchor="middle">${org}</text>
        </g>
      </g>

      <!-- Security Microtext Footer -->
      <line x1="50" y1="1145" x2="800" y2="1145" stroke="#cbd5e1" stroke-width="0.8" />
      <text x="50" y="1162" class="meta">টেলিটক বাংলাদেশ লিমিটেড ও চাকরি সেবা ডিজিটাল গেজেট • হেল্পলাইন: ১২১</text>
      <text x="795" y="1162" class="meta" text-anchor="end">পৃষ্ঠা ০২ / ০২</text>
    </svg>
    `;
  }

  return new NextResponse(svgContent.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
    }
  });
}
