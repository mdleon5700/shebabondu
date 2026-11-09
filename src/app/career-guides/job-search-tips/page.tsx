import React from 'react';
import { Metadata } from 'next';
import CareerGuideDetailClient from '@/components/CareerGuideDetailClient';

export const metadata: Metadata = {
  title: 'অনলাইনে দ্রুত ও সঠিক চাকরি খুঁজে পাওয়ার কার্যকরী উপায় | চাকরি সেবা',
  description: 'চাকরির বাজারে নিজের যোগ্যতা অনুযায়ী উপযুক্ত বিজ্ঞাপন দ্রুত খুঁজে পাওয়ার স্মার্ট ফিল্টারিং টিপস।',
  openGraph: {
    title: 'অনলাইনে দ্রুত চাকরি খুঁজে পাওয়ার স্মার্ট টিপস | চাকরি সেবা',
    description: 'যোগ্যতা ও অভিজ্ঞতা অনুযায়ী সঠিক চাকরি খোঁজার টেকনিক।',
  },
};

export default function JobSearchTipsPage() {
  return <CareerGuideDetailClient slug="job-search-tips" />;
}
