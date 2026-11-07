import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';
import CmsPageRenderer from '@/components/CmsPageRenderer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = serverDB.getPublishedPageById('disclaimer') as unknown as PageRecord;
  return {
    title: page?.metaTitle || page?.title || 'আইনি বার্তা ও দায়-অস্বীকার (Disclaimer) | চাকরি সেবা',
    description: page?.metaDescription || 'চাকরি সেবার আইনগত অবস্থান ও সরকারি অনুমোদনের দায়মুক্তি বার্তা।',
  };
}

export default function PolicyPage() {
  const page = serverDB.getPublishedPageById('disclaimer') as unknown as PageRecord || { id: 'disclaimer', slug: '/disclaimer', title: 'disclaimer', metaTitle: '', metaDescription: '', status: 'published', version: 1, sections: [], updatedAt: '', publishedAt: '' } as unknown as PageRecord;

  const fallback = (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          সরকারি দায়মুক্তি
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          চাকরি সেবা গণপ্রজাতন্ত্রী বাংলাদেশ সরকার বা কোনো সরকারি ব্যাংকের অঙ্গপ্রতিষ্ঠান নয়। আমরা বিভিন্ন প্রকাশ্য অফিশিয়াল ওয়েবসাইট ও জাতীয় পত্রিকা থেকে তথ্য সংগ্রহ করে চাকরিপ্রার্থীদের সুবিধার জন্য পরিবেশন করি।
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          আবেদনের ফলাফল
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          পরীক্ষায় উত্তীর্ণ হওয়া বা চাকরি পাওয়া সম্পূর্ণভাবে প্রার্থীর মেধা ও সরকারি কর্তৃপক্ষের সিদ্ধান্তের ওপর নির্ভরশীল। এতে চাকরি সেবার কোনো প্রভাব বা সংশ্লিষ্টতা নেই।
        </p>
      </div>
    </div>
  );

  return <CmsPageRenderer page={page} fallbackContent={fallback} />;
}
