import React from 'react';
import { Metadata } from 'next';
import { serverDB } from '@/lib/db';
import { PageRecord } from '@/lib/types';
import CmsPageRenderer from '@/components/CmsPageRenderer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে (About Us) | চাকরি সেবা',
  description: 'চাকরি সেবা প্ল্যাটফর্মের উদ্দেশ্য, মিশন ও প্রতিশ্রুতি।',
};

export default function AboutUsPage() {
  const page = serverDB.getPageById('about-us') as unknown as PageRecord || { id: 'about-us', slug: '/about-us', title: 'about-us', metaTitle: '', metaDescription: '', status: 'published', version: 1, sections: [], updatedAt: '', publishedAt: '' } as unknown as PageRecord;

  const fallback = (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          আমাদের লক্ষ্য
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          চাকরি সেবা একটি স্বনামধন্য ও দায়িত্বশীল এডটেক ও ক্যারিয়ার প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য—বাংলাদেশের প্রতিটি অঞ্চলের চাকরিপ্রার্থীর কাছে সরকারি, ব্যাংক ও স্বায়ত্তশাসিত প্রতিষ্ঠানের শতভাগ সঠিক নিয়োগ বিজ্ঞপ্তি পৌঁছে দেওয়া এবং ঘরে বসেই কোনো ভুলত্রুটি ছাড়া আবেদন সম্পন্ন করতে সহায়তা করা।
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          কেন চাকরি সেবা?
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          সাধারণ সাইবার ক্যাফেতে ঘণ্টার পর ঘণ্টা লাইনে দাঁড়িয়ে ছবি রিসাইজ করা ও ভুল ফরম পূরণের কারণে হাজারো প্রার্থীর আবেদন বাতিল হয়। আমরা তৈরি করেছি এমন একটি প্ল্যাটফর্ম যেখানে প্রার্থীদের মাস্টার ডকুমেন্ট ভল্ট, অটো-রিসাইজার ও পেশাদার টিম দিয়ে শতভাগ নির্ভুল আবেদন নিশ্চিত করা হয়।
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
          আমাদের টিম ও পেশাদারিত্ব
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
          আমাদের রিসার্চ টিম প্রতিদিন গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের অফিশিয়াল ওয়েবসাইট, বিপিএসসি গেজেট এবং জাতীয় দৈনিকসমূহ মনিটর করে তথ্য যাচাই-বাছাইয়ের পর প্রকাশ করে থাকে।
        </p>
      </div>
    </div>
  );

  return <CmsPageRenderer page={page} fallbackContent={fallback} />;
}
