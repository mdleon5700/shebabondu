'use client';

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Send, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/platform/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: 'আপনারা কীভাবে আমার হয়ে সরকারি বা ব্যাংক জবে আবেদন করে দেন?',
      a: 'আপনি যখন আমাদের ওয়েবসাইটে অ্যাকাউন্ট খুলে আপনার তথ্য ও ছবি একবার সেভ রাখবেন, যেকোনো বিজ্ঞপ্তিতে "আবেদন করুন" চাপলে আমাদের অভিজ্ঞ ডাটা এন্ট্রি টিম অফিশিয়াল সরকারি পোর্টালে (যেমন Teletalk) নিখুঁতভাবে ফর্ম পূরণ করে সরকারি ফি পরিশোধ করে আপনার ড্যাশবোর্ডে অফিসিয়াল Applicant Copy PDF আপলোড করে দেয়।'
    },
    {
      q: 'আমার ছবি ও স্বাক্ষরের সাইজ ভুল থাকলে কি আবেদন বাতিল হবে?',
      a: 'একদমই না! আমাদের প্ল্যাটফর্মে বিল্ট-ইন অটো-রিসাইজার রয়েছে। আপনি মোবাইল থেকে সাধারণ ছবি আপলোড করলেও সিস্টেম নিজে থেকেই টেলিটকের সঠিক ৩০০x৩০০ পিক্সেল ছবি এবং ৩০০x৮০ পিক্সেল স্বাক্ষরে কনভার্ট করে নেয়।'
    },
    {
      q: 'বিকাশ বা নগদে টাকা দেওয়ার পর আবেদনের প্রমাণ কী পাব?',
      a: 'পেমেন্ট দেওয়ার পর আপনার ড্যাশবোর্ডে উবার-স্টাইল ৫-ধাপের লাইভ ট্র্যাকিং চালু হবে। টিম মেম্বার কাজ শেষ করামাত্রই সরকারি ট্রানজ্যাকশন আইডি ও বারকোড সহ মূল "Applicant Copy PDF" ডাউনলোড লিংক পাবেন এবং আপনার ফোনে এসএমএস চলে যাবে।'
    },
    {
      q: 'আমার এনআইডি ও ব্যক্তিগত তথ্য কি নিরাপদ থাকবে?',
      a: 'হ্যাঁ, শতভাগ নিরাপদ। আমরা সর্বোচ্চ ব্যাংকিং গ্রেড এনক্রিপশন ব্যবহার করি এবং আপনার তথ্য শুধুমাত্র সংশ্লিষ্ট চাকরির ফর্ম পূরণের বাইরে অন্য কোথাও কখনো শেয়ার করা হয় না।'
    },
    {
      q: 'কোনো কারণে আবেদন ব্যর্থ হলে কি টাকা ফেরত পাব?',
      a: 'অবশ্যই। কোনো কারণে যদি অফিশিয়াল সার্ভার জটিলতায় আবেদন সম্পন্ন না হতে পারে, তবে আপনার মূল ফি এবং টিম চার্জ সম্পূর্ণ বিনা প্রশ্নে আপনার বিকাশ/নগদে অথবা ওয়ালেটে রিফান্ড করে দেওয়া হয়।'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setMessage('');
      setSubmitted(false);
      alert('আপনার বার্তা সফলভাবে পাঠানো হয়েছে! আমাদের টিম দ্রুত যোগাযোগ করবে।');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          সাহায্য ও যোগাযোগ
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          যেকোনো প্রয়োজনে আমরা আপনার পাশে আছি
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          আবেদন সংক্রান্ত যেকোনো জিজ্ঞাসা, পেমেন্ট ভেরিফিকেশন বা সহযোগিতার জন্য সরাসরি হেল্পলাইনে কল করুন বা হোয়াটসঅ্যাপে মেসেজ দিন।
        </p>
      </div>

      {/* Support Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Phone */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm hover:border-emerald-500 transition-all text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">জরুরি হেল্পলাইন</h3>
          <div className="text-lg font-black text-emerald-800">{settings?.general?.supportPhone || '+৮৮০ ১৭৭৪-৩৬৬৬৪৩'}</div>
          <p className="text-[16px] text-slate-600">সকাল ৯:০০টা হতে রাত ১১:০০টা (প্রতিদিন)</p>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm hover:border-emerald-500 transition-all text-center">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">WhatsApp চ্যাট সাপোর্ট</h3>
          <a
            href={`https://wa.me/${settings?.general?.whatsappNumber || '8801774366643'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[17px] font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            সরাসরি চ্যাট শুরু করুন
          </a>
          <p className="text-[16px] text-slate-600">২৪ ঘণ্টার মধ্যে দ্রুত উত্তর</p>
        </div>

        {/* Telegram */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm hover:border-emerald-500 transition-all text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">টেলিগ্রাম চ্যানেল</h3>
          <a
            href="https://t.me/chakrisheba"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[17px] font-bold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            চ্যানেলে জয়েন করুন
          </a>
          <p className="text-[16px] text-slate-600">ইনস্ট্যান্ট চাকরির আপডেট পেতে</p>
        </div>

      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ (FAQ)
          </h2>
          <p className="text-[16px] text-slate-600">
            চাকরি আবেদন সেবা ও নিরাপত্তা নিয়ে সাধারণ কিছু প্রশ্নের উত্তর
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-3 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>

              {openFaq === idx && (
                <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
