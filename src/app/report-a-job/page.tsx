'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';

export default function ReportJobPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [issueType, setIssueType] = useState('fake_job');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">বিজ্ঞপ্তি রিপোর্ট করুন</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>সতর্কতা ও পর্যবেক্ষণ</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            চাকরির বিজ্ঞপ্তি সম্পর্কে রিপোর্ট করুন
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            কোনো বিজ্ঞপ্তিতে ভুল তথ্য, অতিরিক্ত ফি দাবি বা প্রতারণার সন্দেহ হলে আমাদের জানান। আমাদের রিভিউ টিম দ্রুত ব্যবস্থা নেবে।
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">আপনার রিপোর্টটি সফলভাবে গ্রহণ করা হয়েছে!</h2>
            <p className="text-xs text-slate-600">আমাদের রিসার্চ টিম আগামী ২ ঘণ্টার মধ্যে বিজ্ঞপ্তিটি পুনরায় যাচাই করবে। সহযোগিতার জন্য ধন্যবাদ।</p>
            <Link href="/" className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold mt-2">
              হোম পেজে ফিরে যান
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বিজ্ঞপ্তির নাম বা লিংক *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="যেমন: বাংলাদেশ ব্যাংক সহকারী পরিচালক বা লিংক"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">সমস্যার ধরন *</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="fake_job">ভুয়া বা অননুমোদিত বিজ্ঞপ্তি</option>
                <option value="wrong_deadline">আবেদনের ডেডলাইন বা তারিখে ভুল</option>
                <option value="fee_issue">আবেদন ফি নিয়ে বিভ্রান্তি</option>
                <option value="broken_link">অফিসিয়াল লিংক কাজ করছে না</option>
                <option value="other">অন্যান্য সমস্যা</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ *</label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="সমস্যাটি স্পষ্টভাবে বুঝিয়ে লিখুন..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>রিপোর্ট জমা দিন</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
