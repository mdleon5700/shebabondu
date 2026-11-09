import React from 'react';
import { Metadata } from 'next';
import PolicyLayout, { PolicySection } from '@/components/PolicyLayout';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ভুল তথ্য সংশোধন নীতিমালা (Corrections Policy) | চাকরি সেবা',
  description: 'কোনো বিজ্ঞপ্তিতে ত্রুটি পরিলক্ষিত হলে দ্রুত সংশোধন, সরকারি সংশোধনী (Corrigendum) প্রকাশ ও প্রত্যাহারের প্রাতিষ্ঠানিক নিয়মাবলী।',
};

export default function CorrectionsPolicyPage() {
  const sections: PolicySection[] = [
    {
      id: 'commitment',
      title: '১. দ্রুত ও স্বচ্ছ সংশোধনের প্রতিশ্রুতি (Commitment to Transparency)',
      content: (
        <>
          <p>
            চাকরি সেবা কর্তৃপক্ষ তথ্যের সত্যতা ও স্বচ্ছতায় বিশ্বাসী। কোনো বিজ্ঞপ্তিতে মুদ্রণ প্রমাদ, ভুল ডেডলাইন, শূন্যপদের সংখ্যার অমিল বা ফি সংক্রান্ত কোনো অসঙ্গতি ধরা পড়লে আমরা তা গোপন না করে সর্বোচ্চ অগ্রাধিকারের সাথে সংশোধন করি।
          </p>
        </>
      )
    },
    {
      id: 'timeline',
      title: '২. সংশোধন বাস্তবায়নের সুনির্দিষ্ট সময়সীমা (Action Timeline)',
      content: (
        <>
          <p>আমাদের সংশোধন কার্যক্রম নিম্নোক্ত সময়সীমার মধ্যে বাস্তবায়িত হয়:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>সরকারি সংশোধনী নোটিশ (Corrigendum):</strong> সংশ্লিষ্ট সরকারি দপ্তর কর্তৃক সংশোধনী জারি হওয়ার <strong>সর্বোচ্চ ২ ঘণ্টার মধ্যে</strong> ওয়েবসাইটে আপডেট করা হয়।</li>
            <li><strong>প্রার্থী কর্তৃক রিপোর্টের তদন্ত:</strong> আমাদের <a href="/report-a-job" className="text-emerald-700 underline font-semibold">অভিযোগ সেলে (/report-a-job)</a> জমা হওয়া কোনো ভুল সার্কুলার রিপোর্ট ৩ ঘণ্টার মধ্যে আমাদের কমপ্লায়েন্স টিম তদন্ত করে সমাধান নিশ্চিত করে।</li>
          </ul>
        </>
      )
    },
    {
      id: 'change-log',
      title: '৩. সংশোধনী ব্যাজ ও পরিবর্তন লগ প্রদর্শন (Corrigendum Badging & Audit Trail)',
      content: (
        <>
          <p>
            কোনো বিজ্ঞপ্তিতে সংশোধন করা হলে প্রার্থীরা যাতে বিভ্রান্ত না হন, সেজন্য সংশ্লিষ্ট সার্কুলারের শীর্ষে একটি দৃশ্যমান <strong>"সংশোধিত বিজ্ঞপ্তি (Corrigendum)"</strong> ব্যাজ যুক্ত করা হয়।
          </p>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5 text-slate-800">
            <div className="font-bold text-xs text-slate-500 uppercase tracking-wider">সংশোধনী লগে যা যা উল্লেখ থাকে:</div>
            <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
              <li>সংশোধনের তারিখ ও সময়।</li>
              <li>পূর্বে কী তথ্য ছিল এবং পরিবর্তিত হয়ে কী হালনাগাদ হয়েছে।</li>
              <li>সরকারি স্মারক নম্বর ও সংশোধিত অফিসিয়াল আদেশের রেফারেন্স।</li>
            </ul>
          </div>
        </>
      )
    },
    {
      id: 'retraction',
      title: '৪. ভুয়া সার্কুলার প্রত্যাহার ও কালোতালিকাভুক্তি (Retraction & Blacklisting)',
      content: (
        <>
          <p>
            যদি কোনো বিজ্ঞপ্তি সম্পূর্ণ প্রতারণামূলক বা জাল প্রমাণিত হয়, তবে নিম্নলিখিত ব্যবস্থা গ্রহণ করা হয়:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-700">
            <li>বিজ্ঞপ্তিটি অবিলম্বে লাইভ ফিড ও সার্চ রেজাল্ট থেকে প্রত্যাহার (Unpublish) করা হয়।</li>
            <li>যে ইউআরএলটি ছিল সেখানে একটি স্পষ্ট লাল রঙের <strong>"ভুয়া বিজ্ঞপ্তি সতর্কতা ও প্রত্যাহার নোটিশ"</strong> প্রদর্শন করা হয়, যাতে সার্চ ইঞ্জিন থেকে আসা কোনো প্রার্থী প্রতারিত না হন।</li>
            <li>প্রতারক চক্র বা প্রতিষ্ঠানের যাবতীয় তথ্য আমাদের ব্ল্যাকলিস্ট ডেটাবেজে তালিকাভুক্ত করা হয়।</li>
          </ol>
        </>
      )
    },
    {
      id: 'report-channel',
      title: '৫. কীভাবে ত্রুটি রিপোর্ট করবেন (How to Report an Error)',
      content: (
        <>
          <p>
            যেকোনো বিজ্ঞপ্তির যেকোনো তথ্য নিয়ে যদি আপনার সন্দেহ থাকে বা ভুল নজরে আসে, তবে প্রার্থীরা নিচের যেকোনো মাধ্যমে সরাসরি আমাদের অবগত করতে পারেন:
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="/report-a-job" className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
              ভুয়া বিজ্ঞপ্তি অভিযোগ সেল (/report-a-job) →
            </a>
            <a href="/contact" className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">
              হেল্পডেস্কে সরাসরি বার্তা (/contact) →
            </a>
          </div>
        </>
      )
    }
  ];

  const notice = (
    <div>
      <span className="font-bold text-amber-900">ভুল সংশোধনের নীতি: </span>
      কোনো সরকারি দপ্তর থেকে সংশোধনী (Corrigendum) জারি করা হলে ২ ঘণ্টার মধ্যে আমরা তা লাইভ সার্কুলারে হালনাগাদ করি।
    </div>
  );

  return (
    <PolicyLayout
      currentPath="/corrections-policy"
      badge="স্বচ্ছতা ও সংশোধন অধিকার"
      title="তথ্যে কোনো ত্রুটি দেখা দিলে তা দ্রুত সংশোধন ও প্রত্যাহার করার নিয়মাবলী"
      subtitle="চাকরি বিজ্ঞপ্তিতে যেকোনো অনিচ্ছাকৃত মুদ্রণ ত্রুটি, তারিখ পরিবর্তন বা সরকারি সংশোধনী তাৎক্ষণিকভাবে প্রার্থীদের সামনে তুলে ধরার সুস্পষ্ট নীতিমালা।"
      sections={sections}
      importantNotice={notice}
    />
  );
}
