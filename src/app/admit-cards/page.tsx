import React from 'react';
import { Metadata } from 'next';
import AdmitCardsClient from '@/components/AdmitCardsClient';

export const metadata: Metadata = {
  title: 'প্রবেশপত্র ডাউনলোড ও অ্যাডমিট কার্ড পোর্টাল ২০২৬ | চাকরি সেবা',
  description: 'টেলিটক ও বাংলাদেশ ব্যাংক নিয়োগ পরীক্ষার প্রবেশপত্র ডাউনলোড লিংক ও ইউজার আইডি রিকভারি নির্দেশিকা।',
  alternates: {
    canonical: 'https://chakrisheba.com/admit-cards',
  },
  openGraph: {
    title: 'প্রবেশপত্র ডাউনলোড ও অ্যাডমিট কার্ড পোর্টাল ২০২৬ | চাকরি সেবা',
    description: 'টেলিটক ও বাংলাদেশ ব্যাংক নিয়োগ পরীক্ষার প্রবেশপত্র ডাউনলোড লিংক ও ইউজার আইডি রিকভারি নির্দেশিকা।',
    url: 'https://chakrisheba.com/admit-cards',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    type: 'website',
    locale: 'bn_BD',
  }
};

export default function AdmitCardsPage() {
  return <AdmitCardsClient />;
}
