import React from 'react';
import { Metadata } from 'next';
import QuestionBankClient from '@/components/QuestionBankClient';

export const metadata: Metadata = {
  title: 'বিগত বছরের প্রশ্নব্যাংক ও নির্ভুল সমাধান ২০২৬ | চাকরি সেবা',
  description: 'বিসিএস, প্রাথমিক শিক্ষক নিয়োগ ও সরকারি ব্যাংকের বিগত ১০ থেকে ২০ বছরের প্রশ্নপত্র, বিষয়ভিত্তিক সমাধান ও ফ্রি PDF ডাউনলোড।',
  openGraph: {
    title: 'বিগত বছরের প্রশ্ন ও ব্যাখ্যাসহ সমাধান | চাকরি সেবা',
    description: 'বিসিএস, ব্যাংক ও প্রাথমিক শিক্ষক নিয়োগের বিগত ২০ বছরের প্রশ্নব্যাংক ও ১-ক্লিক সমাধান।',
  },
};

export default function QuestionsPage() {
  return <QuestionBankClient />;
}
