import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';
import CmsPageRenderer from '@/components/CmsPageRenderer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ) | চাকরি সেবা',
  description: 'চাকরি সেবার সার্ভিস, পেমেন্ট, আবেদন ও নিরাপত্তা সম্পর্কিত সকল সাধারণ প্রশ্নের উত্তর।',
};

export default function FaqPage() {
  const page = serverDB.getPageById('faq') as unknown as PageRecord || { id: 'faq', slug: '/faq', title: 'faq', metaTitle: '', metaDescription: '', status: 'published', version: 1, sections: [], updatedAt: '', publishedAt: '' } as unknown as PageRecord;

  const fallback = (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900">প্রশ্ন: চাকরি সেবা প্ল্যাটফর্মের মাধ্যমে কীভাবে আবেদন করবেন?</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          উত্তর: পছন্দের বিজ্ঞপ্তিতে গিয়ে "আবেদন করুন" বাটনে ক্লিক করুন। আপনার প্রোফাইল তথ্য স্বয়ংক্রিয়ভাবে পূরণ হয়ে যাবে। এরপর ফি পেমেন্ট সম্পন্ন করলে আমাদের এক্সপার্ট টিম নির্ধারিত সময়ের মধ্যে সরকারি পোর্টালে নির্ভুল আবেদন দাখিল করে আপনাকে ট্র্যাকিং আইডি ও অ্যাপ্লিক্যান্ট কপি প্রদান করবে।
        </p>
      </div>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900">প্রশ্ন: আবেদন ফি কীভাবে পরিশোধ করব?</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          উত্তর: আপনি সরাসরি বিকাশ, নগদ বা চাকরি সেবা ওয়ালেটের মাধ্যমে নির্ভুলভাবে পেমেন্ট করতে পারবেন।
        </p>
      </div>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900">প্রশ্ন: আমার তথ্যের গোপনীয়তা কীভাবে সংরক্ষিত হয়?</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          উত্তর: আপনার এনআইডি, ছবি, স্বাক্ষর এবং সনদপত্র ব্যাংকিং গ্রেড এনক্রিপশনে সুরক্ষিত থাকে। আপনার অনুমতি ব্যতীত এটি অন্য কোথাও ব্যবহার বা শেয়ার করা হয় না।
        </p>
      </div>
    </div>
  );

  return <CmsPageRenderer page={page} fallbackContent={fallback} />;
}
