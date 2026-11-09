import React from 'react';
import { Metadata } from 'next';
import PolicyLayout, { PolicySection } from '@/components/PolicyLayout';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'চাকরি যাচাই নীতিমালা (Job Verification Policy) | চাকরি সেবা',
  description: 'প্রতিটি সার্কুলার কীভাবে এআই ও ম্যানুয়াল অডিটের মাধ্যমে সরকারি গেজেট মিলিয়ে যাচাই করা হয় তার পূর্ণাঙ্গ বিবরণী।',
};

export default function JobVerificationPolicyPage() {
  const sections: PolicySection[] = [
    {
      id: '3-tier-architecture',
      title: '১. ৩-স্তরের হাইব্রিড যাচাইকরণ আর্কিটেকচার (3-Tier Hybrid Verification)',
      content: (
        <>
          <p>
            চাকরি সেবায় কোনো বিজ্ঞপ্তি সরাসরি বা অপ্রমাণিত অবস্থায় প্রকাশিত হতে পারে না। আমাদের প্ল্যাটফর্মে যুক্ত প্রতিটি সার্কুলারকে বাধ্যতামূলকভাবে ৩টি ভিন্ন প্রযুক্তিগত ও মানবীয় নিরীক্ষা স্তরের মধ্য দিয়ে যেতে হয়:
          </p>
          <div className="space-y-3 pt-2">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">১</span>
                <span>লেভেল ১: এআই ওয়েব স্পাইডার ও এনএলপি পার্সার (AI Spider & Parser)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                আমাদের স্বয়ংক্রিয় এআই রোবট প্রতিদিন সরকারি ডোমেইন (.gov.bd, .org.bd) এবং মূল দৈনিক পত্রিকার ই-পেপার থেকে নতুন বিজ্ঞপ্তির টেক্সট ও স্মারক নম্বর আহরণ করে। এটি ডুপ্লিকেট সার্কুলার ও পুরনো বিজ্ঞপ্তি নিজে থেকেই বাদ দিয়ে দেয়।
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">২</span>
                <span>লেভেল ২: প্রাতিষ্ঠানিক স্মারক ও গেজেট ক্রস-ম্যাচিং (Gazette Cross-Matching)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                বিজ্ঞপ্তিতে উল্লিখিত স্মারক নম্বরটি সরকারি গেজেট প্রেস (BG Press) অথবা সংশ্লিষ্ট মন্ত্রণালয়ের নোটিশবোর্ডের মূল রেকর্ডের সাথে স্বয়ংক্রিয় এপিআই ও ডাটাবেজের মাধ্যমে ক্রস-ম্যাচ করা হয়।
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">৩</span>
                <span>লেভেল ৩: হিউম্যান লিগ্যাল অডিটর ও গেজেট বিশেষজ্ঞ রিভিউ (Human Legal Audit)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                আমাদের রিসার্চ টিমের কর্মকর্তা মূল পিডিএফ বিজ্ঞপ্তির স্বাক্ষর, সিল, পদভিত্তিক বেতন স্কেল এবং আবেদন ফি ম্যানুয়ালি পরীক্ষা করেন। সবকিছু শতভাগ নিখুঁত প্রমাণিত হলে তিনি বিজ্ঞপ্তিকে <strong>'VERIFIED_ACCURATE'</strong> হিসেবে অ্যাপ্রুভ করেন।
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'scam-detection',
      title: '২. প্রতারণামূলক বিজ্ঞপ্তি ও অবৈধ ফি শনাক্তকরণ ফিল্টার (Scam Filter)',
      content: (
        <>
          <p>
            চাকরিপ্রার্থীদের কাছ থেকে অনৈতিক অর্থ হাতিয়ে নেওয়া চক্রগুলোকে প্রতিরোধ করতে আমাদের রয়েছে নিজস্ব সিকিউরিটি ফিল্টার:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>ব্যক্তিগত মোবাইল ব্যাংকিং নিষিদ্ধ:</strong> সরকারি বা ব্যাংক নিয়োগের ক্ষেত্রে শুধুমাত্র অফিশিয়াল টেলিটক এসএমএস কোড অথবা সরকারি ট্রেজারি চালান প্রযোজ্য। কোনো সার্কুলারে যদি ব্যক্তিগত কোনো বিকাশ বা নগদ নম্বরে টাকা পাঠানোর নির্দেশনা থাকে, তা সাথে সাথে ব্লক করে দেওয়া হয়।</li>
            <li><strong>অবাস্তব লোভনীয় বেতন শনাক্তকরণ:</strong> শিক্ষাগত যোগ্যতার তুলনায় অতিরিক্ত বা অবাস্তব বেতনের প্রস্তাব করা যেকোনো বেসরকারি সন্দেহজনক বিজ্ঞপ্তি তাৎক্ষণিকভাবে অতিরিক্ত যাচাইয়ের জন্য ফ্ল্যাগ করা হয়।</li>
          </ul>
        </>
      )
    },
    {
      id: 'verification-badge',
      title: '৩. অফিশিয়াল ভেরিফিকেশন টিক (VERIFIED_ACCURATE) সিস্টেম',
      content: (
        <>
          <p>
            যেসব সার্কুলার আমাদের ৩-স্তরের অডিট সফলভাবে পার করে, সেগুলোর শিরোনামের পাশে একটি সবুজ রঙের <strong>"সরকারি গেজেট যাচাইকৃত (VERIFIED_ACCURATE)"</strong> টিকচিহ্ন ব্যাজ প্রদর্শিত হয়।
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 font-medium">
            প্রার্থীরা এই ব্যাজটি দেখে সম্পূর্ণ নিশ্চিন্ত হতে পারেন যে, উক্ত নিয়োগ বিজ্ঞপ্তির সকল পদ, শর্ত ও ফি সরকারের প্রচলিত নিয়োগ বিধিমালা অনুযায়ী অনুমোদিত।
          </div>
        </>
      )
    },
    {
      id: 'candidate-vigilance',
      title: '৪. প্রার্থীর সচেতনতা ও তাৎক্ষণিক রিপোর্ট ব্যবস্থা (Community Reporting)',
      content: (
        <>
          <p>
            আমাদের উন্নত ভেরিফিকেশন ব্যবস্থার পাশাপাশি আমরা প্রার্থীদের সচেতনতাকে অত্যন্ত গুরুত্ব দিই। কোনো বিজ্ঞপ্তিতে সামান্যতম সন্দেহ পরিলক্ষিত হলে যেকোনো প্রার্থী আমাদের <a href="/report-a-job" className="text-emerald-700 underline font-semibold">ভুয়া বিজ্ঞপ্তি অভিযোগ সেলে (/report-a-job)</a> ওয়ান-ক্লিকে রিপোর্ট করতে পারেন। আমাদের স্পেশাল ইনভেস্টিগেশন স্কোয়াড দ্রুততম সময়ে বিষয়টি খতিয়ে দেখে ব্যবস্থা গ্রহণ করে।
          </p>
        </>
      )
    }
  ];

  const notice = (
    <div>
      <span className="font-bold text-amber-900">ভেরিফিকেশন নিরাপত্তা: </span>
      আমাদের এআই ও ম্যানুয়াল রিসার্চ সেল প্রতিটি সার্কুলার বিপিএসসি, বাংলাদেশ ব্যাংক ও মন্ত্রণালয়ের মূল গেজেট ক্রস-চেক করে 'VERIFIED_ACCURATE' স্ট্যাম্প প্রদান করে।
    </div>
  );

  return (
    <PolicyLayout
      currentPath="/job-verification-policy"
      badge="সার্কুলার যাচাই ও অডিট প্রোটোকল"
      title="প্রতিটি সার্কুলার কীভাবে এআই ও ম্যানুয়াল অডিটের মাধ্যমে গেজেট মিলিয়ে যাচাই করা হয় তার বিবরণী"
      subtitle="ভুয়া বিজ্ঞপ্তি, অসত্য শূন্যপদ ও আর্থিক প্রতারণা রোধে আমাদের ৩-স্তরের এআই স্ক্রিনিং ও মানবীয় গেজেট নিরীক্ষা পদ্ধতির বিস্তারিত বিবরণ।"
      sections={sections}
      importantNotice={notice}
    />
  );
}
