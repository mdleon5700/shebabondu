import React from 'react';
import { Metadata } from 'next';
import VivaNoticesClient from '@/components/VivaNoticesClient';

export const metadata: Metadata = {
  title: 'মৌখিক পরীক্ষার সময়সূচি ও নোটিশ ২০২৬ (Viva Notices) | চাকরি সেবা',
  description: 'বিসিএস, প্রাথমিক শিক্ষক ও ব্যাংক মৌখিক পরীক্ষা (ভাইভা) তারিখ, বোর্ডভিত্তিক রোল শিডিউল ও আবশ্যকীয় সনদের তালিকা।',
  alternates: {
    canonical: 'https://chakrisheba.com/viva-notices',
  },
  openGraph: {
    title: 'মৌখিক পরীক্ষার সময়সূচি ও নোটিশ ২০২৬ (Viva Notices) | চাকরি সেবা',
    description: 'বিসিএস, প্রাথমিক শিক্ষক ও ব্যাংক মৌখিক পরীক্ষা (ভাইভা) তারিখ, বোর্ডভিত্তিক রোল শিডিউল ও আবশ্যকীয় সনদের তালিকা।',
    url: 'https://chakrisheba.com/viva-notices',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    type: 'website',
    locale: 'bn_BD',
  }
};

export default function VivaNoticesPage() {
  return <VivaNoticesClient />;
}
