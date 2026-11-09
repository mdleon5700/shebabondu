import React from 'react';
import { Metadata } from 'next';
import CareerGuideDetailClient from '@/components/CareerGuideDetailClient';

export const metadata: Metadata = {
  title: 'বিসিএস ও সরকারি চাকরির ভাইভা প্রস্তুতি ও শিষ্টাচার গাইড | চাকরি সেবা',
  description: 'মৌখিক পরীক্ষার দিন পোশাকের শালীনতা, রুমে প্রবেশের নিয়ম, বডি ল্যাঙ্গুয়েজ ও আত্মবিশ্বাসী উপস্থাপনার এ টু জেড গাইড।',
  openGraph: {
    title: 'বিসিএস ও সরকারি চাকরির ভাইভা প্রস্তুতি | চাকরি সেবা',
    description: 'ভাইভার পোশাক, বডি ল্যাঙ্গুয়েজ ও আত্মবিশ্বাস বাড়ানোর উপায়।',
  },
};

export default function VivaPreparationPage() {
  return <CareerGuideDetailClient slug="viva-preparation" />;
}
