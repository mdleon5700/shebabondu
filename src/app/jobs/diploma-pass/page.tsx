import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'ডিপ্লোমা ইঞ্জিনিয়ারিং সরকারি চাকরি ২০২৬ (Diploma Jobs) | চাকরি সেবা',
  description: 'পলিটেকনিক ইনস্টিটিউট হতে ডিপ্লোমা ইন ইঞ্জিনিয়ারিং পাস প্রার্থীদের ১০ম গ্রেডের উপ-সহকারী প্রকৌশলী নিয়োগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="ডিপ্লোমা ইঞ্জিনিয়ারিং সরকারি চাকরি ২০২৬ (Diploma Jobs)"
      subtitle="পলিটেকনিক ইনস্টিটিউট হতে ডিপ্লোমা ইন ইঞ্জিনিয়ারিং পাস প্রার্থীদের ১০ম গ্রেডের উপ-সহকারী প্রকৌশলী নিয়োগ।"
      badge="ডিপ্লোমা পাস"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "সকল চাকরি", href: "/jobs" }, { label: "ডিপ্লোমা পাস", href: "/jobs/diploma-pass" }
      ]}
      filterType="diploma"
      seoTextContent={{
        heading: "১০ম গ্রেডে উপ-সহকারী প্রকৌশলী (Sub-Assistant Engineer) নিয়োগ প্রস্তুতি",
        paragraphs: ['"কারিগরি শিক্ষা বোর্ডের অধীনে চার বছর মেয়াদী ডিপ্লোমা পাস প্রার্থীদের জন্য সরকারের বিভিন্ন উন্নয়ন সংস্থায় আকর্ষণীয় ১০ম গ্রেডের সুযোগ রয়েছে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
