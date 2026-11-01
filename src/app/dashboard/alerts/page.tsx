'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Bell, Check, Save, MessageSquare, Mail, Phone, MapPin, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { storage } from '@/lib/store';

export default function JobAlertsPage() {
  const [categories, setCategories] = useState<string[]>([
    'বিসিএস ও সরকারি চাকরি',
    'ব্যাংক ও আর্থিক প্রতিষ্ঠান'
  ]);
  const [district, setDistrict] = useState('ঢাকা');
  const [whatsappAlert, setWhatsappAlert] = useState(true);
  const [smsAlert, setSmsAlert] = useState(true);
  const [emailAlert, setEmailAlert] = useState(true);
  const [frequency, setFrequency] = useState('daily');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allCategories = [
    'বিসিএস ও সরকারি চাকরি',
    'ব্যাংক ও আর্থিক প্রতিষ্ঠান',
    'শিক্ষক নিয়োগ (NTRCA ও প্রাইমারি)',
    'এনজিও (NGO) চাকরি',
    'আইটি ও সফটওয়্যার জবস',
    'প্রকৌশল ও ইঞ্জিনিয়ারিং',
    'প্রতিরক্ষা ও পুলিশ বাহিনী',
    'রেলওয়ে ও যোগাযোগ সেক্টর'
  ];

  const popularDistricts = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ', 'কুমিল্লা'];

  // Load preferences from API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchPrefs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/candidate/alerts');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.alertPreferences && isMounted) {
            const prefs = data.alertPreferences;
            if (Array.isArray(prefs.categories) && prefs.categories.length > 0) {
              setCategories(prefs.categories);
            }
            if (Array.isArray(prefs.districts) && prefs.districts[0]) {
              setDistrict(prefs.districts[0]);
            }
            if (typeof prefs.whatsappAlert === 'boolean') setWhatsappAlert(prefs.whatsappAlert);
            if (typeof prefs.smsAlert === 'boolean') setSmsAlert(prefs.smsAlert);
            if (typeof prefs.emailAlert === 'boolean') setEmailAlert(prefs.emailAlert);
            if (prefs.frequency) setFrequency(prefs.frequency);
          }
        }
      } catch (err) {
        console.warn('Failed to load alert preferences from API', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPrefs();
    return () => { isMounted = false; };
  }, []);

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const payload = {
        categories,
        districts: [district],
        district,
        whatsappAlert,
        smsAlert,
        emailAlert,
        frequency
      };

      const res = await fetch('/api/candidate/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || 'অ্যালার্ট পছন্দ সংরক্ষণ করতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-700" />
            <span>ব্যক্তিগত জব অ্যালার্ট পছন্দসমূহ</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার পছন্দের ক্যাটাগরি ও জেলা অনুযায়ী নতুন সার্কুলার প্রকাশিত হওয়ামাত্রই এসএমএস, হোয়াটসঅ্যাপ ও ইমেইলে নোটিফিকেশন পান।
          </p>
        </div>

        {saveSuccess && (
          <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5 border border-emerald-200 animate-fade-in self-start">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>অ্যালার্ট সংরক্ষিত হয়েছে!</span>
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Categories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 block">যেসব ক্যাটাগরির চাকরির অ্যালার্ট চান:</label>
            <span className="text-[11px] font-bold text-emerald-700">নির্বাচিত: {categories.length} টি</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allCategories.map((cat, idx) => {
              const isChecked = categories.includes(cat);
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleCategory(cat)}
                  className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between text-left ${
                    isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs' : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat}</span>
                  {isChecked && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* District & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>পছন্দের জেলা (হোম বা কাজের এলাকা):</span>
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="যেমন: ঢাকা, চট্টগ্রাম, রাজশাহী..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white transition-all text-xs font-medium text-slate-800"
            />
            {/* Quick District Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {popularDistricts.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDistrict(d)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                    district === d ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-700" />
              <span>অ্যালার্ট পাঠানোর ফ্রিকোয়েন্সি:</span>
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white transition-all text-xs font-medium text-slate-800 cursor-pointer"
            >
              <option value="instant">সার্কুলার প্রকাশের সাথে সাথে সরাসরি ইনস্ট্যান্ট অ্যালার্ট (Instant)</option>
              <option value="daily">প্রতিদিন রাত ৮টায় সমন্বিত সার্কুলার ডাইজেস্ট (Daily)</option>
              <option value="weekly">সাপ্তাহিক চাকরির খবর ও ডেডলাইন রিমাইন্ডার (Weekly)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              {frequency === 'instant' ? '⚡ নতুন সার্কুলার অনুমোদিত হওয়ামাত্রই তাৎক্ষণিক নোটিফিকেশন যাবে।' :
               frequency === 'daily' ? '📅 সারাদিনের সেরা সার্কুলারগুলো নিয়ে প্রতিদিন ১টি কনসোলিডেটেড মেসেজ যাবে।' :
               '🗓️ প্রতি শুক্রবার সপ্তাহের সকল শীর্ষ চাকরির তালিকা পাঠানো হবে।'}
            </p>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-800 block">নোটিফিকেশন চ্যানেল নির্বাচন:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* WhatsApp */}
            <label className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
              whatsappAlert ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <input
                type="checkbox"
                checked={whatsappAlert}
                onChange={(e) => setWhatsappAlert(e.target.checked)}
                className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-xs flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>হোয়াটসঅ্যাপ (WhatsApp)</span>
                </span>
                <p className="text-[10px] text-slate-500">জরুরি সার্কুলার ও অ্যাডমিট নোটিশ সরাসরি হোয়াটসঅ্যাপে</p>
              </div>
            </label>

            {/* SMS */}
            <label className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
              smsAlert ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <input
                type="checkbox"
                checked={smsAlert}
                onChange={(e) => setSmsAlert(e.target.checked)}
                className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-xs flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>মোবাইল এসএমএস (SMS)</span>
                </span>
                <p className="text-[10px] text-slate-500">আবেদনের পিন ও ভেরিফিকেশন এসএমএস অ্যালার্ট</p>
              </div>
            </label>

            {/* Email */}
            <label className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
              emailAlert ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <input
                type="checkbox"
                checked={emailAlert}
                onChange={(e) => setEmailAlert(e.target.checked)}
                className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-xs flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ইমেইল বুলেটিন (Email)</span>
                </span>
                <p className="text-[10px] text-slate-500">ইনবক্সে বিস্তারিত পিডিএফ লিংকসহ চাকরির তালিকা</p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer / Save Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>প্রার্থীরা যেকোনো সময় তাদের অ্যালার্ট পছন্দ পরিবর্তন বা বন্ধ করতে পারেন।</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>সংরক্ষণ করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>সেটিংস সেভ করুন</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}