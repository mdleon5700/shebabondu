import React from 'react';
import { Metadata } from 'next';
import CareerGuideDetailClient from '@/components/CareerGuideDetailClient';

export const metadata: Metadata = {
  title: 'টেলিটক ও অনলাইনে সরকারি চাকরির আবেদন করার নির্ভুল নিয়ম | চাকরি সেবা',
  description: 'ছবি ও স্বাক্ষর রিসাইজ (৩০০×৩০০ এবং ৩০০×৮০), কোটা নির্বাচন ও টেলিটক এসএমএস ফি পেমেন্টের সম্পূর্ণ গাইড।',
  openGraph: {
    title: 'অনলাইনে সরকারি চাকরির আবেদনের নির্ভুল নিয়ম | চাকরি সেবা',
    description: 'টেলিটক ও সরকারি চাকরির আবেদনে ছবি, স্বাক্ষর ও কোটা সংক্রান্ত ভুলের সমাধান।',
  },
};

export default function OnlineJobApplicationPage() {
  return <CareerGuideDetailClient slug="online-job-application" />;
}
