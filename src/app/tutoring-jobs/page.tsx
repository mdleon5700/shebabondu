import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'টিউশন ও গৃহশিক্ষক নিয়োগ ২০২৬ (Tuition Jobs) | চাকরি সেবা',
  description: 'এনটিআরসিএ, প্রাথমিক শিক্ষক, কোচিং প্রভাষক ও পার্ট-টাইম টিউশন কাজের খবর।',
  alternates: {
    canonical: 'https://chakrisheba.com/tutoring-jobs'
  },
  openGraph: {
    title: 'টিউশন ও গৃহশিক্ষক নিয়োগ ২০২৬ (Tuition Jobs)',
    description: 'এনটিআরসিএ, প্রাথমিক শিক্ষক, কোচিং প্রভাষক ও পার্ট-টাইম টিউশন কাজের খবর।',
    url: 'https://chakrisheba.com/tutoring-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function TutoringJobsPage() {
  return (
    <JobListingView
      title="টিউশন ও গৃহশিক্ষক নিয়োগ ২০২৬ (Tuition Jobs)"
      subtitle="এনটিআরসিএ, প্রাথমিক সহকারী শিক্ষক, কলেজ প্রভাষক ও পার্ট-টাইম শিক্ষকতা।"
      badge="টিউশন ও শিক্ষকতা"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "টিউশন চাকরি", href: "/tutoring-jobs" }
      ]}
      filterType="tutoring"
      seoTextContent={{
        heading: "বিশ্ববিদ্যালয় শিক্ষার্থীদের জন্য সম্মানজনক টিউশন ও শিক্ষকতা গাইড",
        paragraphs: [
          "পড়াশোনার পাশাপাশি টিউশন, অ্যাকাডেমিক কোচিং এবং শিক্ষক নিবন্ধন প্রক্রিয়ায় যুক্ত হয়ে প্রার্থীরা তাদের অভিজ্ঞতার ভিত্তি তৈরি করতে পারেন।"
        ],
        tips: [
          "নিজের পছন্দের বিষয় (গণিত, ইংরেজি, বিজ্ঞান) নির্ধারণ করে প্রস্তুতি নিন।",
          "শিক্ষকতার ক্ষেত্রে ধৈর্য ও কার্যকর পাঠদানের দক্ষতা বৃদ্ধি করুন।"
        ]
      }}
    />
  );
}
