import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';
import CmsPageRenderer from '@/components/CmsPageRenderer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = serverDB.getPublishedPageById('terms-and-conditions') as unknown as PageRecord;
  return {
    title: page?.metaTitle || page?.title || 'ব্যবহারের শর্তাবলী (Terms & Conditions) | চাকরি সেবা',
    description: page?.metaDescription || 'চাকরি সেবা ওয়েবসাইট ব্যবহারের সাধারণ নিয়মাবলী ও শর্তাবলী।',
  };
}

export default function TermsPage() {
  const page = serverDB.getPublishedPageById('terms-and-conditions') as unknown as PageRecord || { id: 'terms-and-conditions', slug: '/terms-and-conditions', title: 'terms-and-conditions', metaTitle: '', metaDescription: '', status: 'published', version: 1, sections: [], updatedAt: '', publishedAt: '' } as unknown as PageRecord;

  const fallback = (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          ১. প্ল্যাটফর্ম ব্যবহারের মূল নীতিমালা
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          চাকরি সেবা একটি স্বনামধন্য চাকরি তথ্য ও ডিজিটাল আবেদন সহায়তা কেন্দ্র। আমাদের ওয়েবসাইট ভিজিট বা সেবা গ্রহণের মাধ্যমে ব্যবহারকারী এই শর্তাবলী মেনে নিতে সম্মত হন।
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          ২. তথ্যের নির্ভুলতা ও প্রার্থীর দায়িত্ব
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          আবেদনের সময় প্রার্থী কর্তৃক প্রদত্ত নাম, জন্মতারিখ, বয়স, শিক্ষাগত ফলাফল ও কোটা সম্পর্কিত তথ্যের সত্যতা প্রার্থীর নিজের দায়িত্ব। প্রার্থী অসত্য বা জাল তথ্য প্রদান করলে তার আবেদন যেকোনো পর্যায়ে বাতিল হতে পারে।
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          ৩. ফি ও ক্যাশব্যাক নিশ্চয়তা
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          আমাদের প্ল্যাটফর্মে সকল সরকারি ফি সম্পূর্ণ স্বচ্ছতার সাথে গ্রহণ করা হয়। কোনো কারণে আমাদের প্রযুক্তিগত ত্রুটির কারণে আবেদন জমা হতে ব্যর্থ হলে প্রার্থীর প্রদত্ত সম্পূর্ণ অর্থ ১০০% রিফান্ড করা হয়।
        </p>
      </div>
    </div>
  );

  return <CmsPageRenderer page={page} fallbackContent={fallback} />;
}
