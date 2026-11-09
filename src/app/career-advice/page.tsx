import React from 'react';
import { Metadata } from 'next';
import CareerGuidesListClient from '@/components/CareerGuidesListClient';

export const metadata: Metadata = {
  title: 'ক্যারিয়ার পরামর্শ ও চাকরির প্রস্তুতি টিপস (Career Advice) | চাকরি সেবা',
  description: 'চাকরিপ্রার্থীদের জন্য প্রফেশনাল ক্যারিয়ার অ্যাডভাইস, সিভি রাইটিং টিপস এবং ভাইভা সহায়িকা।',
  openGraph: {
    title: 'ক্যারিয়ার পরামর্শ ও চাকরির গাইডলাইন | চাকরি সেবা',
    description: 'চাকরি সেবা ক্যারিয়ার পরামর্শ ও বিশেষজ্ঞ টিপস পোর্টাল।',
  },
};

export default function CareerAdvicePage() {
  return <CareerGuidesListClient />;
}
