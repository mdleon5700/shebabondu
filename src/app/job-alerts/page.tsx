'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Send, Sparkles } from 'lucide-react';

export default function JobAlertsPage() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>(['bank', 'govt']);
  const [subscribed, setSubscribed] = useState(false);

  const toggleCat = (cat: string) => {
    setSelectedCats(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !email) {
      alert('মোবাইল নম্বর বা ইমেইল প্রদান করুন');
      return;
    }
    setSubscribed(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ফ্রি জব অ্যালার্ট</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>সবার আগে নোটিফিকেশন</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            ফ্রি জব অ্যালার্ট সাবস্ক্রিপশন
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            আপনার পছন্দের ক্যাটাগরির নতুন কোনো সরকারি বা ব্যাংক সার্কুলার প্রকাশিত হওয়ামাত্রই হোয়াটসঅ্যাপ বা এসএমএস অ্যালার্ট পান সম্পূর্ণ বিনামূল্যে।
          </p>
        </div>

        {subscribed ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">অভিনন্দন! আপনার জব অ্যালার্ট সক্রিয় হয়েছে।</h2>
            <p className="text-xs text-slate-600">নতুন সার্কুলার প্রকাশিত হওয়ামাত্রই আপনার দেওয়া নম্বরে নিয়মিত নোটিফিকেশন পাঠানো হবে।</p>
            <Link href="/" className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold mt-2">
              হোম পেজে ফিরে যান
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">কোন কোন ক্যাটাগরির চাকরি খুঁজছেন? (একাধিক নির্বাচন করুন)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'govt', label: 'সরকারি ও মন্ত্রণালয়' },
                  { id: 'bank', label: 'ব্যাংক জব' },
                  { id: 'teacher', label: 'শিক্ষক নিয়োগ' },
                  { id: 'railway', label: 'রেলওয়ে নিয়োগ' },
                  { id: 'defense', label: 'প্রতিরক্ষা ও পুলিশ' },
                  { id: 'it', label: 'আইটি ও প্রকৌশল' }
                ].map(c => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCat(c.id)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all flex items-center justify-between ${
                      selectedCats.includes(c.id)
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{c.label}</span>
                    {selectedCats.includes(c.id) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ / মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>ফ্রি জব অ্যালার্ট চালু করুন</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
