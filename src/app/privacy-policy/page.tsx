import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';
import CmsPageRenderer from '@/components/CmsPageRenderer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = serverDB.getPublishedPageById('privacy-policy') as unknown as PageRecord;
  return {
    title: page?.metaTitle || page?.title || 'গোপনীয়তা নীতিমালা (Privacy Policy) | চাকরি সেবা',
    description: page?.metaDescription || 'প্রার্থীদের এনআইডি, ছবি ও ব্যক্তিগত তথ্যের সর্বোচ্চ ব্যাংকিং গ্রেড নিরাপত্তা।',
  };
}

export default function PrivacyPolicyPage() {
  const page = serverDB.getPublishedPageById('privacy-policy') as unknown as PageRecord || { id: 'privacy-policy', slug: '/privacy-policy', title: 'privacy-policy', metaTitle: '', metaDescription: '', status: 'published', version: 1, sections: [], updatedAt: '', publishedAt: '' } as unknown as PageRecord;

  const fallback = (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          ১. তথ্য সংগ্রহ ও ব্যবহার
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          চাকরি সেবা প্ল্যাটফর্মে অনলাইন আবেদন সেবার প্রয়োজনে প্রার্থীদের জীবনবৃত্তান্ত, শিক্ষাগত যোগ্যতার সনদ, জাতীয় পরিচয়পত্র (NID) নম্বর ও ছবি নিরাপদে সংরক্ষণ করা হয়। এই তথ্য তৃতীয় কোনো অননুমোদিত পক্ষের সাথে বাণিজ্যিক উদ্দেশ্যে শেয়ার বা বিক্রি করা হয় না।
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          ২. তথ্যের নিরাপত্তা ও এনক্রিপশন
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          আমাদের সার্ভারে প্রার্থীদের সকল তথ্য ব্যাংকিং গ্রেড AES-256 বিট এনক্রিপশনে সংরক্ষিত থাকে। প্রার্থীর সুস্পষ্ট সম্মতি ছাড়া শুধুমাত্র সংশ্লিষ্ট নিয়োগকারী প্রতিষ্ঠান বা সরকারি পোর্টালের নির্ধারিত ফরম পূরণে এই তথ্য ব্যবহার করা হয়।
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          ৩. তথ্য মুছে ফেলার অধিকার (Right to be Forgotten)
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          যেকোনো প্রার্থী চাইলে তাদের প্রোফাইল সেটিংস থেকে আপলোডকৃত যেকোনো ডকুমেন্ট তাৎক্ষণিকভাবে মুছে ফেলতে পারেন। আমাদের হেল্পলাইনে অনুরোধের ভিত্তিতে প্রার্থীর সকল ডাটা সম্পূর্ণভাবে স্থায়ীভাবে অপসারিত করা হয়।
        </p>
      </div>
    </div>
  );

  return <CmsPageRenderer page={page} fallbackContent={fallback} />;
}
