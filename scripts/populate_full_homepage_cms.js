const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'db', 'local_store.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (!db.pages) db.pages = {};
if (!db.pages.home) {
  db.pages.home = {
    id: 'home',
    title: 'হোমপেজ — চাকরি সেবা',
    slug: '/',
    status: 'published',
    isSystemPage: true,
    sections: []
  };
}

const existingHero = db.pages.home.sections?.find(s => s.type === 'hero') || {
  id: 'sec-home-hero',
  type: 'hero',
  title: 'চাকরির খবর জানুন সবার আগে — ১০০% নির্ভুল আবেদন ও ক্যারিয়ার সেবা ২০২৬',
  subtitle: 'সরকারি ও বেসরকারি চাকরির সর্বশেষ বিজ্ঞপ্তি, আবেদন প্রক্রিয়া, যোগ্যতা, প্রয়োজনীয় কাগজপত্র এবং পরীক্ষার আপডেট—সবকিছু এক জায়গায়, আপনার জন্য।',
  content: {
    badge: '⚡ অফিসিয়াল প্ল্যাটফর্ম • নির্ভরযোগ্য চাকরির খবর • আপনার ক্যারিয়ারের বিশ্বস্ত সঙ্গী',
    ctaText: 'চাকরির বিজ্ঞপ্তি দেখুন',
    ctaUrl: '#circulars-section',
    secondaryCtaText: 'আবেদন প্রক্রিয়া জানুন',
    secondaryCtaUrl: '#how-it-works'
  },
  style: {
    backgroundColor: '#011612',
    textColor: '#ffffff',
    titleFontSize: '5xl',
    subtitleFontSize: 'base',
    fontWeight: 'black',
    paddingY: 'lg',
    textAlign: 'left'
  },
  isVisible: true
};

const fullHomeSections = [
  // 1. Hero Section
  existingHero,

  // 2. How It Works Section
  {
    id: 'sec-home-how-it-works',
    type: 'how-it-works',
    title: 'কীভাবে ঘরে বসেই নির্ভুল চাকরি আবেদন করবেন?',
    subtitle: 'সাইবার ক্যাফেতে ঘণ্টার পর ঘণ্টা বসে থাকার ঝামেলা শেষ! আপনার সুবিধার্থে আধুনিক স্মার্ট সিস্টেম:',
    content: {
      badge: 'সহজ ৩ ধাপের প্রক্রিয়া',
      items: [
        {
          step: 1,
          title: '১ বার ডকুমেন্ট ভল্টে সেভ রাখুন',
          desc: 'আপনার পাসপোর্ট ছবি, স্বাক্ষর, এনআইডি এবং শিক্ষাগত সনদের তথ্য মাত্র একবার আপলোড করুন। আমাদের সিস্টেম নিজে থেকেই ৩০০x৩০০ ও ৩০০x৮০ পিক্সেল সাইজে কনভার্ট করে রাখবে।'
        },
        {
          step: 2,
          title: 'পছন্দের জবে আবেদন বুকিং দিন',
          desc: 'যেকোনো সরকারি বা ব্যাংক বিজ্ঞপ্তির নিচে আবেদন করুন চাপুন। বিকাশ/নগদে সরকারি ফি ও সামান্য টিম সার্ভিস চার্জ পেমেন্ট করলেই সরাসরি রিকোয়েস্ট চলে যাবে।'
        },
        {
          step: 3,
          title: 'টিম আবেদন শেষ করে স্লিপ দেবে',
          desc: 'আমাদের অভিজ্ঞ এক্সপার্ট টিম অফিশিয়াল পোর্টালে নিখুঁতভাবে ফর্ম পূরণ করে সরকারি ফি দিয়ে আপনার ড্যাশবোর্ডে অ্যাপ্লিকেন্ট কপি পিডিএফ আপলোড করে দেবে এবং এসএমএস যাবে!'
        }
      ]
    },
    style: {
      backgroundColor: '#f8fafc',
      textColor: '#0f172a',
      titleFontSize: '3xl',
      subtitleFontSize: 'base',
      fontWeight: 'black',
      paddingY: 'md',
      textAlign: 'center'
    },
    isVisible: true
  },

  // 3. Question Bank Download Banner (CTA)
  {
    id: 'sec-home-cta-banner',
    type: 'cta',
    title: 'বিসিএস ও ব্যাংক পরীক্ষার বিগত ১০ বছরের প্রশ্ন ও সমাধান (PDF)',
    subtitle: 'প্রিলিমিনারি ও লিখিত পরীক্ষার পূর্ণাঙ্গ প্রশ্নব্যাংক ব্যাখ্যাসহ ডাউনলোড করুন সম্পূর্ণ বিনামূল্যে।',
    content: {
      badge: 'ফ্রি ডাউনলোড হাব',
      buttonLabel: 'ফ্রি প্রশ্নব্যাংক ডাউনলোড',
      buttonUrl: '/questions'
    },
    style: {
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      titleFontSize: '2xl',
      subtitleFontSize: 'base',
      fontWeight: 'black',
      paddingY: 'md',
      textAlign: 'left'
    },
    isVisible: true
  },

  // 4. Candidate Reviews & Experience (Testimonials)
  {
    id: 'sec-home-reviews',
    type: 'testimonials',
    title: 'সফল চাকরিপ্রার্থীদের বাস্তব অভিজ্ঞতা ও মতামত',
    subtitle: 'সাইবার ক্যাফেতে ঘণ্টার পর ঘণ্টা লাইনে দাঁড়ানোর ভোগান্তি ছাড়াই কীভাবে শত শত চাকরিপ্রার্থী ঘরে বসেই শতভাগ নির্ভুল আবেদন সেবা পেয়েছেন:',
    content: {
      badge: '৪.৯/৫ গড় রেটিং • ৩,৫০০+ ভেরিফাইড আবেদনকারী'
    },
    style: {
      backgroundColor: '#02231b',
      textColor: '#ffffff',
      titleFontSize: '4xl',
      subtitleFontSize: 'base',
      fontWeight: 'black',
      paddingY: 'lg',
      textAlign: 'center'
    },
    isVisible: true
  },

  // 5. Frequently Asked Questions (FAQ)
  {
    id: 'sec-home-faq',
    type: 'faq',
    title: 'সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর (FAQ)',
    subtitle: 'চাকরি সেবা প্ল্যাটফর্ম ও আবেদন প্রক্রিয়া নিয়ে সাধারণ প্রশ্নের সহজ সমাধান',
    content: {
      badge: 'সহায়তা কেন্দ্র',
      faqs: [
        {
          q: 'চাকরি সেবা প্ল্যাটফর্মের মাধ্যমে কীভাবে আবেদন করবেন?',
          a: 'পছন্দের চাকরি সার্কুলারে গিয়ে "আবেদন করুন" বাটনে ক্লিক করুন। আপনার তথ্য প্রদান করে বিকাশ বা নগদে ফি পরিশোধ করলেই আমাদের এক্সপার্ট টিম নির্ভুলভাবে আপনার আবেদনটি সরকারি পোর্টালে সম্পন্ন করে দেবে।'
        },
        {
          q: 'আমার আবেদনের অ্যাপ্লিকেন্ট কপি ও ট্র্যাকিং স্লিপ কখন পাব?',
          a: 'আবেদন সম্পন্ন হওয়া মাত্রই আপনার ড্যাশবোর্ডে অফিসিয়াল অ্যাপ্লিকেন্ট কপি পিডিএফ দেখতে ও ডাউনলোড করতে পারবেন। একই সাথে আপনার মোবাইলে ট্র্যাকিং আইডি সহ এসএমএস নোটিফিকেশন পৌঁছে যাবে।'
        },
        {
          q: 'আমার আপলোডকৃত ছবি ও ডকুমেন্টের নিরাপত্তা কেমন?',
          a: 'আপনার সকল ব্যক্তিগত তথ্য, ছবি ও সার্টিফিকেট আমাদের সিস্টেমে ব্যাংক-গ্রেড এনক্রিপশনের মাধ্যমে সম্পূর্ণ সুরক্ষিত থাকে। আপনার অনুমতি ছাড়া এই তথ্য অন্য কোথাও ব্যবহৃত হয় না।'
        },
        {
          q: 'ভুল তথ্য বা আবেদন সংশোধন করা যায় কি?',
          a: 'আমাদের টিম আবেদন সাবমিট করার আগে আপনার সাথে প্রতিটি তথ্য পুঙ্খানুপুঙ্খ যাচাই করে নেয়। তবে টেলিটক পোর্টালে চূড়ান্ত সাবমিটের আগে যেকোনো সময় পরিবর্তনের অনুরোধ জানাতে পারবেন।'
        }
      ]
    },
    style: {
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      titleFontSize: '3xl',
      subtitleFontSize: 'base',
      fontWeight: 'black',
      paddingY: 'md',
      textAlign: 'center'
    },
    isVisible: true
  }
];

db.pages.home.sections = fullHomeSections;
db.pages.home.version = (db.pages.home.version || 0) + 1;
db.pages.home.updatedAt = new Date().toISOString();

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Successfully populated full Home Page sections in local_store.json!');
