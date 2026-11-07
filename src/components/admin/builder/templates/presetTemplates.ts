import { PageSection } from '@/lib/types';
import { PageTemplate } from '../BuilderTypes';

export const PRESET_PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'tpl-home-standard',
    name: 'হোমপেজ স্ট্যান্ডার্ড (Homepage Standard)',
    description: 'সরকারি চাকরির পোর্টাল ব্যানার, লাইভ সার্কুলার ফিড, ক্যাটাগরি, কাজের ধাপ ও এফএকিউ',
    category: 'general',
    targetSlug: '/',
    sections: [
      {
        id: 'hero-sec-1',
        type: 'hero',
        title: 'বাংলাদেশের সকল সরকারি ও শীর্ষ বেসরকারি চাকরির নির্ভরযোগ্য পোর্টাল',
        subtitle: 'প্রতিদিনের নতুন সার্কুলার, সঠিক নিয়মে আবেদন নির্দেশনা এবং ১০০% নির্ভুল আবেদন সেবা ঘরে বসেই।',
        content: {
          badge: '⚡ ২০২৬ সালের সর্বশেষ সরকারি সার্কুলার',
          ctaText: 'সকল সার্কুলার দেখুন',
          ctaUrl: '/jobs',
          secondaryCtaText: 'আবেদন ট্র্যাক করুন',
          secondaryCtaUrl: '/dashboard/applications',
          showSearchForm: true,
          noticeText: 'সতর্কতা: কোনো ভুয়া এজেন্সির প্রতারণায় পা দেবেন না।'
        },
        style: {
          backgroundColor: '#064e3b',
          textColor: '#ffffff',
          accentColor: '#10b981',
          paddingY: 'xl',
          maxWidth: 'lg',
          textAlign: 'center',
          borderRadius: 'none'
        },
        isVisible: true
      },
      {
        id: 'jobs-feed-sec',
        type: 'jobs',
        title: 'চলমান গুরুত্বপূর্ণ সরকারি চাকরির সার্কুলার',
        subtitle: 'আবেদনের শেষ তারিখ ও পদ অনুযায়ী বাছাইকৃত সেরা নিয়োগ বিজ্ঞপ্তি',
        content: {
          limit: 6,
          category: 'all',
          showApplyButton: true,
          viewAllLink: '/jobs'
        },
        style: {
          backgroundColor: '#ffffff',
          textColor: '#0f172a',
          paddingY: 'lg',
          maxWidth: 'lg',
          columns: 3,
          textAlign: 'left'
        },
        isVisible: true
      },
      {
        id: 'how-it-works-sec',
        type: 'how-it-works',
        title: 'কীভাবে ঘরে বসেই নির্ভুল আবেদন করবেন?',
        subtitle: 'মাত্র ৩টি সহজ ধাপে আপনার পছন্দমতো সরকারি চাকরির আবেদন সম্পন্ন করুন',
        content: {
          items: [
            { step: '০১', title: 'সার্কুলার নির্বাচন করুন', desc: 'আপনার শিক্ষাগত যোগ্যতা ও বয়সসীমা অনুযায়ী সঠিক পদ ও প্রতিষ্ঠান বেছে নিন।' },
            { step: '০২', title: 'তথ্য ও ছবি আপলোড করুন', desc: 'প্রয়োজনীয় কাগজপত্র, ছবি ও স্বাক্ষরের সঠিক মাপ যাচাই করে সাবমিট করুন।' },
            { step: '০৩', title: 'কনফার্মেশন ও প্রবেশপত্র পান', desc: 'সফল আবেদনের পর টেলিটক অ্যাপ্লিক্যান্ট কপি ও এসএমএস ট্র্যাকিং সুবিধা পান।' }
          ]
        },
        style: {
          backgroundColor: '#f8fafc',
          textColor: '#0f172a',
          paddingY: 'lg',
          maxWidth: 'lg',
          columns: 3,
          textAlign: 'center'
        },
        isVisible: true
      },
      {
        id: 'stats-sec',
        type: 'stats',
        title: 'চাকরি সেবা প্ল্যাটফর্মের বর্তমান পরিসংখ্যান',
        subtitle: 'সারা দেশের চাকরিপ্রার্থীদের আস্থার প্রতীক',
        content: {
          items: [
            { value: '৭৫+', label: 'সক্রিয় সরকারি সার্কুলার' },
            { value: '৪৮,৯০০+', label: 'নিবন্ধিত চাকরিপ্রার্থী' },
            { value: '১০০%', label: 'যাচাইকৃত নিয়োগ বিজ্ঞপ্তি' },
            { value: '২৪/৭', label: 'গ্রাহক সেবা ও ট্র্যাকিং' }
          ]
        },
        style: {
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          paddingY: 'lg',
          maxWidth: 'lg',
          columns: 4,
          textAlign: 'center'
        },
        isVisible: true
      },
      {
        id: 'faq-sec',
        type: 'faq',
        title: 'সাধারণ জিজ্ঞাসা (FAQ)',
        subtitle: 'চাকরি সেবা ও আবেদন প্রক্রিয়া সম্পর্কিত সাধারণ প্রশ্ন ও উত্তর',
        content: {
          items: [
            { question: 'চাকরি সেবা কি কোনো সরকারি নিয়োগকারী প্রতিষ্ঠান?', answer: 'না, চাকরি সেবা একটি স্বতন্ত্র চাকরি তথ্য ও আবেদন সহায়তা প্ল্যাটফর্ম। আমরা জাতীয় পত্রিকা ও অফিশিয়াল পোর্টাল থেকে সংগৃহীত বিজ্ঞপ্তি প্রকাশ করি।' },
            { question: 'আবেদন করার পর ফি পরিশোধ কীভাবে করব?', answer: 'টেলিটক এসএমএস অথবা আমাদের সমন্বিত বিকাশ/নগদ গেটওয়ের মাধ্যমে সরকারি ফি ও সার্ভিস চার্জ প্রদান করতে পারবেন।' },
            { question: 'আমার অ্যাপ্লিক্যান্ট কপি কোথায় পাব?', answer: 'আপনার ড্যাশবোর্ডে লগইন করে সরাসরি ডাউনলোড ও প্রিন্ট করতে পারবেন।' }
          ]
        },
        style: {
          backgroundColor: '#ffffff',
          textColor: '#0f172a',
          paddingY: 'lg',
          maxWidth: 'md',
          textAlign: 'left'
        },
        isVisible: true
      }
    ]
  },
  {
    id: 'tpl-about-us',
    name: 'আমাদের সম্পর্কে (About Us)',
    description: 'মিশন, ভিশন, কার্যক্রমের মূলনীতি, নির্ভরযোগ্যতার পরিসংখ্যান ও সাপোর্ট চ্যানেল',
    category: 'general',
    targetSlug: '/about-us',
    sections: [
      {
        id: 'about-hero',
        type: 'hero',
        title: 'চাকরি সেবা — বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল সঙ্গী',
        subtitle: 'সঠিক সময়ে সঠিক চাকরির তথ্য পৌঁছে দেওয়া এবং ঘরে বসেই ঝামেলাহীনভাবে আবেদন করার আধুনিক সমাধান।',
        content: {
          badge: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
          ctaText: 'সার্কুলার ব্রাউজ করুন',
          ctaUrl: '/jobs'
        },
        style: {
          backgroundColor: '#064e3b',
          textColor: '#ffffff',
          paddingY: 'lg',
          maxWidth: 'lg',
          textAlign: 'center'
        },
        isVisible: true
      },
      {
        id: 'about-mission',
        type: 'features',
        title: 'আমাদের মূল অঙ্গীকার ও সেবা বৈশিষ্ট্য',
        subtitle: 'চাকরিপ্রার্থীদের সর্বোচ্চ সুবিধা নিশ্চিত করাই আমাদের প্রথম অগ্রাধিকার',
        content: {
          items: [
            { title: '১০০% সঠিক তথ্য', desc: 'প্রতিটি সার্কুলার অফিশিয়াল গেজেট ও ওয়েবসাইট থেকে যাচাই করে প্রকাশ করা হয়।' },
            { title: 'সময়োপযোগী নোটিফিকেশন', desc: 'আবেদনের শেষ তারিখ ও পরীক্ষার তারিখ আগে থেকেই এসএমএস ও এলার্টের মাধ্যমে জানানো হয়।' },
            { title: 'তথ্য নিরাপত্তা', desc: 'চাকরিপ্রার্থীদের ব্যক্তিগত তথ্য ও ডকুমেন্ট সম্পূর্ণ এনক্রিপ্টেড এবং নিরাপদ ভল্টে সংরক্ষিত থাকে।' }
          ]
        },
        style: {
          backgroundColor: '#ffffff',
          textColor: '#0f172a',
          paddingY: 'lg',
          maxWidth: 'lg',
          columns: 3,
          textAlign: 'center'
        },
        isVisible: true
      },
      {
        id: 'about-cta',
        type: 'cta',
        title: 'আজই ফ্রি একাউন্ট তৈরি করে চাকরি প্রস্তুতি শুরু করুন',
        subtitle: 'আপনার যোগ্যতা অনুযায়ী উপযুক্ত চাকরির নোটিফিকেশন পেতে দেরি করবেন না।',
        content: {
          buttonLabel: 'ফ্রি রেজিস্ট্রেশন করুন',
          buttonUrl: '/register'
        },
        style: {
          backgroundColor: '#f8fafc',
          textColor: '#0f172a',
          paddingY: 'lg',
          maxWidth: 'md',
          textAlign: 'center'
        },
        isVisible: true
      }
    ]
  },
  {
    id: 'tpl-contact-us',
    name: 'যোগাযোগ ও সহায়তা (Contact Us)',
    description: 'অফিস ঠিকানা, হেল্পলাইন, হোয়াটসঅ্যাপ চ্যাট ও মেসেজ ইনকোয়ারি ফর্ম',
    category: 'general',
    targetSlug: '/contact-us',
    sections: [
      {
        id: 'contact-hero',
        type: 'hero',
        title: 'আপনার যেকোনো জিজ্ঞাসা বা সহায়তায় আমরা প্রস্তুত',
        subtitle: 'আবেদন সংক্রান্ত সমস্যা, পরামর্শ বা যেকোনো প্রশ্নের জন্য সরাসরি যোগাযোগ করুন।',
        content: {
          badge: '২৪/৭ কাস্টমার সাপোর্ট',
          ctaText: 'হোয়াটসঅ্যাপে চ্যাট করুন',
          ctaUrl: 'https://wa.me/8801774366643'
        },
        style: {
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          paddingY: 'lg',
          maxWidth: 'lg',
          textAlign: 'center'
        },
        isVisible: true
      },
      {
        id: 'contact-channels',
        type: 'features',
        title: 'যোগাযোগের মাধ্যমসমূহ',
        subtitle: 'নিচের যেকোনো মাধ্যমে আমাদের সাথে যুক্ত হতে পারেন',
        content: {
          items: [
            { title: 'মোবাইল হেল্পলাইন', desc: '+৮৮০ ১৭৭৪৩ ৬৬৬৪৩ (সকাল ৯টা - রাত ১০টা)' },
            { title: 'অফিসিয়াল ইমেইল', desc: 'support@chakrisheba.com' },
            { title: 'প্রধান কার্যালয়', desc: 'লেভেল ৪, কারওয়ান বাজার, ঢাকা - ১২১৫, বাংলাদেশ।' }
          ]
        },
        style: {
          backgroundColor: '#ffffff',
          textColor: '#0f172a',
          paddingY: 'lg',
          maxWidth: 'lg',
          columns: 3,
          textAlign: 'center'
        },
        isVisible: true
      }
    ]
  },
  {
    id: 'tpl-dynamic-job-details',
    name: 'সার্কুলার বিস্তারিত ডাইনামিক টেমপ্লেট (Job Details Template)',
    description: 'ডাটাবেস ড্রাইভেন সার্কুলার ভিউ — পদ তালিকা, বেতন স্কেল, বয়সসীমা ও অফিশিয়াল পিডিএফ',
    category: 'dynamic',
    targetSlug: '/jobs/[id]',
    sections: [
      {
        id: 'job-header-slot',
        type: 'hero',
        title: '{{job.title}}',
        subtitle: 'প্রতিষ্ঠান: {{job.organization}} • আবেদনের শেষ তারিখ: {{job.deadline}}',
        content: {
          badge: 'অফিশিয়াল নিয়োগ বিজ্ঞপ্তি ২০২৬',
          ctaText: 'সরাসরি আবেদন করুন',
          ctaUrl: '{{job.applicationUrl}}',
          secondaryCtaText: 'অফিশিয়াল সার্কুলার পিডিএফ',
          secondaryCtaUrl: '{{job.pdfUrl}}',
          isDynamicSlot: true
        },
        style: {
          backgroundColor: '#064e3b',
          textColor: '#ffffff',
          paddingY: 'md',
          maxWidth: 'lg',
          textAlign: 'left'
        },
        isVisible: true
      },
      {
        id: 'job-positions-slot',
        type: 'features',
        title: 'পদসমূহ ও শিক্ষাগত যোগ্যতা',
        subtitle: 'নির্ধারিত পদের নাম, গ্রেড ও স্কেল অনুযায়ী বিবরণ',
        content: {
          isDynamicSlot: true,
          items: [
            { title: 'পদের নাম ও গ্রেড', desc: 'জাতীয় বেতন স্কেল অনুযায়ী নির্ধারিত স্কেল' },
            { title: 'প্রয়োজনীয় যোগ্যতা', desc: 'স্বীকৃত বিশ্ববিদ্যালয় বা বোর্ড থেকে প্রয়োজনীয় ডিগ্রি' },
            { title: 'বয়সসীমা ও শর্তাবলী', desc: '১৮ থেকে ৩০ বছর (কোটা প্রার্থীদের ক্ষেত্রে ৩২ বছর)' }
          ]
        },
        style: {
          backgroundColor: '#ffffff',
          textColor: '#0f172a',
          paddingY: 'md',
          maxWidth: 'lg',
          columns: 3,
          textAlign: 'left'
        },
        isVisible: true
      },
      {
        id: 'job-related-feed',
        type: 'jobs',
        title: 'সম্পর্কিত অন্যান্য সরকারি চাকরির বিজ্ঞপ্তি',
        subtitle: 'এই প্রতিষ্ঠানের সমমানের চলমান অন্যান্য সার্কুলার',
        content: {
          limit: 3,
          category: 'all',
          isDynamicSlot: true
        },
        style: {
          backgroundColor: '#f8fafc',
          textColor: '#0f172a',
          paddingY: 'lg',
          maxWidth: 'lg',
          columns: 3,
          textAlign: 'left'
        },
        isVisible: true
      }
    ]
  }
];
