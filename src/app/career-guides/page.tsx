import React from 'react';
import { Metadata } from 'next';
import CareerGuidesListClient from '@/components/CareerGuidesListClient';

export const metadata: Metadata = {
  title: 'ক্যারিয়ার গাইড ও চাকরির প্রস্তুতি সহায়িকা ২০২৬ | চাকরি সেবা',
  description: 'আন্তর্জাতিক মানের সিভি তৈরি, ভাইভা প্রস্তুতি, অনলাইন আবেদন নিয়মাবলী ও চাকরির প্রস্তুতিমূলক বিশেষজ্ঞ আর্টিকেল।',
  openGraph: {
    title: 'চাকরির প্রস্তুতি ও সফল ক্যারিয়ার গাইডলাইন | চাকরি সেবা',
    description: 'সিভি তৈরি থেকে ভাইভা প্রস্তুতি পর্যন্ত পূর্ণাঙ্গ ক্যারিয়ার সহায়িকা।',
  },
};

export default function CareerGuidesPage() {
  return <CareerGuidesListClient />;
}
