import React from 'react';
import { Metadata } from 'next';
import ExamResultsClient from '@/components/ExamResultsClient';

export const metadata: Metadata = {
  title: 'সকল সরকারি ও ব্যাংক চাকরির পরীক্ষার ফলাফল ২০২৬ | চাকরি সেবা',
  description: 'বিসিএস, বাংলাদেশ ব্যাংক, প্রাথমিক শিক্ষক ও সরকারি নিয়োগ পরীক্ষার প্রিলিমিনারি, লিখিত ও চূড়ান্ত ফলাফল শিট ও মেরিট লিস্ট।',
  openGraph: {
    title: 'সকল সরকারি ও ব্যাংক চাকরির পরীক্ষার ফলাফল ২০২৬ | চাকরি সেবা',
    description: 'বিসিএস, প্রাথমিক শিক্ষক ও ব্যাংক নিয়োগ পরীক্ষার প্রিলিমিনারি ও লিখিত ফলাফল তাত্ক্ষণিক রোল নম্বর দিয়ে যাচাই করুন।',
  },
};

export default function ExamResultsPage() {
  return <ExamResultsClient defaultTypeFilter="all" />;
}
