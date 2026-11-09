import React from 'react';
import { Metadata } from 'next';
import ApplicationsTrackingClient from '@/components/ApplicationsTrackingClient';

export const metadata: Metadata = {
  title: 'আমার আবেদন ও ট্র্যাকিং ড্যাশবোর্ড | চাকরি সেবা',
  description: 'প্ল্যাটফর্মের মাধ্যমে দাখিলকৃত সকল সরকারি ও ব্যাংক চাকরির আবেদন, টেলিটক ফি পরিশোধের লাইভ অগ্রগতি এবং সংরক্ষিত সার্কুলারের ওয়ান-স্টপ ট্র্যাকিং।',
  alternates: {
    canonical: 'https://chakrisheba.com/applications',
  },
  openGraph: {
    title: 'আমার আবেদন ও ট্র্যাকিং ড্যাশবোর্ড | চাকরি সেবা',
    description: 'দাখিলকৃত চাকরির আবেদন ও সংরক্ষিত সার্কুলারের লাইভ স্ট্যাটাস ট্র্যাকিং।',
    url: 'https://chakrisheba.com/applications',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    type: 'website',
    locale: 'bn_BD',
  }
};

export default function ApplicationsPage() {
  return <ApplicationsTrackingClient />;
}
