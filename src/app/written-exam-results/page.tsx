import React from 'react';
import { Metadata } from 'next';
import ExamResultsClient from '@/components/ExamResultsClient';

export const metadata: Metadata = {
  title: 'লিখিত পরীক্ষার ফলাফল ২০২৬ (Written Exam Results & Merit List) | চাকরি সেবা',
  description: 'বিসিএস, বাংলাদেশ ব্যাংক ও সরকারি নিয়োগের লিখিত পরীক্ষার ফলাফল, উত্তীর্ণদের রোল নম্বর এবং মৌখিক পরীক্ষা (ভাইভা) সময়সূচি।',
  openGraph: {
    title: 'লিখিত পরীক্ষার ফলাফল ২০২৬ | চাকরি সেবা',
    description: 'লিখিত পরীক্ষায় উত্তীর্ণ পরীক্ষার্থীদের রোল নম্বর যাচাই করুন এবং ভাইভা শিডিউল জানুন।',
  },
};

export default function WrittenExamResultsPage() {
  return (
    <ExamResultsClient 
      defaultTypeFilter="written" 
      pageTitle="লিখিত পরীক্ষার ফলাফল ও মেধা তালিকা (Written Exam Results)"
      pageSubtitle="সরকারি মন্ত্রণালয়, অধিদপ্তর ও বাংলাদেশ ব্যাংকের লিখিত পরীক্ষায় উত্তীর্ণ পরীক্ষার্থীদের রোল নম্বর ও মেরিট লিস্ট।"
      breadcrumbLabel="লিখিত পরীক্ষার ফলাফল"
    />
  );
}
