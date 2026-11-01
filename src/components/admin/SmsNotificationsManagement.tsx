'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Bell, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Smartphone, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  Filter, 
  ShieldCheck, 
  Radio, 
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';

interface SmsNotificationsManagementProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  candidates?: any[];
  applications?: any[];
}

interface SmsLog {
  id: string;
  recipient: string;
  name: string;
  message: string;
  template: string;
  gateway: 'Teletalk SMS' | 'Greenweb BD' | 'SSL Wireless';
  status: 'delivered' | 'pending' | 'failed';
  timestamp: string;
  cost: number;
}

const INITIAL_LOGS: SmsLog[] = [
  {
    id: 'SMS-8921',
    recipient: '01774366643',
    name: 'মো: তানভীর হোসেন',
    message: 'চাকরি সেবা: আপনার ওটিপি ভেরিফিকেশন কোড হলো 849201। এটি কারও সাথে শেয়ার করবেন না।',
    template: 'ওটিপি ভেরিফিকেশন',
    gateway: 'Greenweb BD',
    status: 'delivered',
    timestamp: 'আজ, ১০:৪৫ পূর্বাহ্ন',
    cost: 0.40
  },
  {
    id: 'SMS-8920',
    recipient: '01812345678',
    name: 'ফারহানা ইয়াসমিন',
    message: 'অভিনন্দন ফারহানা! তথ্য ও যোগাযোগ প্রযুক্তি অধিদপ্তর-এর সহকারী প্রোগ্রামার পদের আবেদন সফলভাবে সম্পন্ন হয়েছে। ট্র্যাকিং: CS-2026-ICT-8849',
    template: 'আবেদন সম্পন্ন',
    gateway: 'Teletalk SMS',
    status: 'delivered',
    timestamp: 'আজ, ০৯:১২ পূর্বাহ্ন',
    cost: 0.40
  },
  {
    id: 'SMS-8919',
    recipient: '01998765432',
    name: 'আহমেদ সাদিক',
    message: 'জরুরি নোটিশ: বাংলাদেশ ব্যাংক অফিসার পদের প্রবেশপত্র প্রকাশিত হয়েছে। ডাউনলোড করুন chakrisheba.com থেকে।',
    template: 'অ্যাডমিট কার্ড রিলিজ',
    gateway: 'SSL Wireless',
    status: 'delivered',
    timestamp: 'গতকাল, ১১:৩০ অপরাহ্ন',
    cost: 0.40
  },
  {
    id: 'SMS-8918',
    recipient: '01655443322',
    name: 'রাশেদ খান',
    message: 'চাকরি সেবা: আপনার বিকাশ পেমেন্ট (৳১৬০) সফলভাবে ভেরিফাই করা হয়েছে। আবেদন প্রসেসিং চলছে।',
    template: 'পেমেন্ট নিশ্চিতকরণ',
    gateway: 'Greenweb BD',
    status: 'delivered',
    timestamp: 'গতকাল, ০৫:২০ অপরাহ্ন',
    cost: 0.40
  },
  {
    id: 'SMS-8917',
    recipient: '01511223344',
    name: 'তাসলিমা আক্তার',
    message: 'চাকরি সেবা: সোনালী ব্যাংক পিএলসি সিনিয়র অফিসার পদের আবেদন শেষ হতে আর মাত্র ২৪ ঘণ্টা বাকি!',
    template: 'শেষ সময় রিমাইন্ডার',
    gateway: 'Teletalk SMS',
    status: 'pending',
    timestamp: 'গতকাল, ০২:১৫ অপরাহ্ন',
    cost: 0.40
  }
];

export default function SmsNotificationsManagement({
  activeTab = 'sms-status',
  onTabChange,
  candidates = [],
  applications = []
}: SmsNotificationsManagementProps) {
  // Navigation tabs
  const [currentSubTab, setCurrentSubTab] = useState<'sms-status' | 'notifications' | 'templates-delivery'>(
    activeTab === 'notifications' ? 'notifications' :
    activeTab === 'templates-delivery' ? 'templates-delivery' : 'sms-status'
  );

  // Sync if prop activeTab changes
  React.useEffect(() => {
    if (activeTab === 'notifications' || activeTab === 'sms-status' || activeTab === 'templates-delivery') {
      setCurrentSubTab(activeTab);
    }
  }, [activeTab]);

  const handleSubTabSwitch = (tab: 'sms-status' | 'notifications' | 'templates-delivery') => {
    setCurrentSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // SMS Tester State
  const [recipientNumber, setRecipientNumber] = useState('01774366643');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [messageBody, setMessageBody] = useState('চাকরি সেবা টেস্ট বার্তা: আপনার টেলিটক অনলাইন আবেদন ইঞ্জিন সফলভাবে কার্যকর রয়েছে।');
  const [selectedGateway, setSelectedGateway] = useState<'Greenweb BD' | 'Teletalk SMS' | 'SSL Wireless'>('Teletalk SMS');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Logs state
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(INITIAL_LOGS);
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'delivered' | 'pending' | 'failed'>('all');

  // Broadcast Notification State
  const [broadcastTarget, setBroadcastTarget] = useState<'all_candidates' | 'pending_payment' | 'bcs_aspirants'>('all_candidates');
  const [broadcastTitle, setBroadcastTitle] = useState('নতুন সার্কুলার এলার্ট: ৪৭তম বিসিএস আবেদন বিজ্ঞপ্তি প্রকাশিত!');
  const [broadcastBody, setBroadcastBody] = useState('বাংলাদেশ সরকারি কর্ম কমিশন (বিপিএসসি) ৪৭তম বিসিএস পরীক্ষার আবেদন আহ্বান করেছে। বিস্তারিত দেখতে ভিজিট করুন।');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Templates Management State
  const [templates, setTemplates] = useState([
    {
      id: 'tpl_otp',
      name: 'ওটিপি ভেরিফিকেশন কোড',
      code: 'OTP_VERIFY',
      category: 'সিকিউরিটি',
      body: 'চাকরি সেবা: আপনার ওটিপি কোড হলো {OTP}। ৫ মিনিটের মধ্যে ব্যবহার করুন। এটি কারও সাথে শেয়ার করবেন না।',
      samplePreview: 'চাকরি সেবা: আপনার ওটিপি কোড হলো 948120। ৫ মিনিটের মধ্যে ব্যবহার করুন। এটি কারও সাথে শেয়ার করবেন না।'
    },
    {
      id: 'tpl_app_submitted',
      name: 'আবেদন সফল সাবমিশন',
      code: 'APP_SUBMITTED',
      category: 'আবেদন আপডেট',
      body: 'অভিনন্দন {NAME}! আপনার {JOB_TITLE} পদের আবেদন সফলভাবে সম্পন্ন হয়েছে। ট্র্যাকিং আইডি: {TRACKING}।',
      samplePreview: 'অভিনন্দন মো: তানভীর হোসেন! আপনার তথ্য ও যোগাযোগ প্রযুক্তি অধিদপ্তর পদের আবেদন সফলভাবে সম্পন্ন হয়েছে। ট্র্যাকিং আইডি: CS-2026-ICT-8849।'
    },
    {
      id: 'tpl_payment_verified',
      name: 'পেমেন্ট অনুমোদন ও চালান',
      code: 'PAYMENT_VERIFIED',
      category: 'আর্থিক লেনদেন',
      body: 'চাকরি সেবা: আপনার {AMOUNT} টাকা পেমেন্ট নিশ্চিত হয়েছে। TrxID: {TRXID}। আপনার টেলিটক ফর্ম প্রসেস করা হচ্ছে।',
      samplePreview: 'চাকরি সেবা: আপনার ১৬০ টাকা পেমেন্ট নিশ্চিত হয়েছে। TrxID: BLK8942A9। আপনার টেলিটক ফর্ম প্রসেস করা হচ্ছে।'
    },
    {
      id: 'tpl_admit_card',
      name: 'প্রবেশপত্র (Admit Card) প্রকাশ',
      code: 'ADMIT_CARD_ALERT',
      category: 'পরীক্ষা ও নোটিশ',
      body: 'জরুরি: {JOB_TITLE} পদের প্রবেশপত্র প্রকাশিত হয়েছে। অবিলম্বে chakrisheba.com/dashboard থেকে ডাউনলোড করুন।',
      samplePreview: 'জরুরি: বাংলাদেশ ব্যাংক অফিসার পদের প্রবেশপত্র প্রকাশিত হয়েছে। অবিলম্বে chakrisheba.com/dashboard থেকে ডাউনলোড করুন।'
    },
    {
      id: 'tpl_exam_date',
      name: 'পরীক্ষার তারিখ ও কেন্দ্র নোটিশ',
      code: 'EXAM_DATE_ALERT',
      category: 'পরীক্ষা ও নোটিশ',
      body: 'পরীক্ষার নোটিশ: {JOB_TITLE} পদের প্রিলিমিনারি পরীক্ষা {EXAM_DATE} তারিখে অনুষ্ঠিত হবে। আপনার রোল: {ROLL}। কেন্দ্র: {CENTER}।',
      samplePreview: 'পরীক্ষার নোটিশ: পল্লী বিদ্যুতায়ন বোর্ড পদের প্রিলিমিনারি পরীক্ষা ১৫ মে ২০২৬ তারিখে অনুষ্ঠিত হবে। আপনার রোল: 809214। কেন্দ্র: ঢাকা কলেজ কেন্দ্র।'
    }
  ]);
  const [activeEditingTemplateId, setActiveEditingTemplateId] = useState<string>('tpl_app_submitted');
  const [templateSavedFeedback, setTemplateSavedFeedback] = useState<string | null>(null);

  // Template switch for SMS tester
  const handleTemplateSelect = (val: string) => {
    setSelectedTemplate(val);
    if (val === 'otp') {
      setMessageBody('চাকরি সেবা: আপনার ওটিপি ভেরিফিকেশন কোড হলো 741852। এটি কারও সাথে শেয়ার করবেন না।');
    } else if (val === 'completed') {
      setMessageBody('অভিনন্দন! আপনার আবেদন সফলভাবে সাবমিট হয়েছে। আবেদন কপি ডাউনলোড করতে ভিজিট করুন chakrisheba.com।');
    } else if (val === 'admit') {
      setMessageBody('জরুরি: আপনার আবেদনের প্রবেশপত্র ডাউনলোডযোগ্য হয়েছে। আপনার ইউজার প্রোফাইলে লগইন করুন।');
    } else if (val === 'payment') {
      setMessageBody('চাকরি সেবা: আপনার পেমেন্ট সফল হয়েছে। ট্র্যাকিং কোড অনুযায়ী কাজ শুরু হয়েছে।');
    }
  };

  // Dispatch Test SMS
  const handleSendTestSms = async () => {
    if (!recipientNumber.trim() || !messageBody.trim()) {
      alert('অনুগ্রহ করে প্রাপক নম্বর ও বার্তা লিখুন।');
      return;
    }
    setIsSending(true);
    setSendSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' },
        body: JSON.stringify({
          recipientPhone: recipientNumber.trim(),
          message: messageBody.trim(),
          channel: 'sms'
        })
      });
      const data = await res.json();
      if (res.ok) {
        const newLog: SmsLog = {
          id: data.deliveryId || `SMS-${Math.floor(1000 + Math.random() * 9000)}`,
          recipient: recipientNumber,
          name: 'টেস্ট প্রাপক / ইউজার',
          message: messageBody,
          template: selectedTemplate === 'custom' ? 'কাস্টম বার্তা' : 'সিস্টেম টেমপ্লেট',
          gateway: selectedGateway,
          status: 'delivered',
          timestamp: 'এইমাত্র',
          cost: 0.40
        };
        setSmsLogs([newLog, ...smsLogs]);
        setSendSuccessMessage(`সফলভাবে ${selectedGateway} এর মাধ্যমে ${recipientNumber} নম্বরে এসএমএস প্রেরিত হয়েছে!`);
        setTimeout(() => setSendSuccessMessage(null), 4000);
      } else {
        alert(data.error || 'এসএমএস প্রেরণ ব্যর্থ');
      }
    } catch {
      alert('সার্ভার এরর');
    } finally {
      setIsSending(false);
    }
  };

  // Broadcast Push Notification
  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    setIsBroadcasting(true);
    setBroadcastSuccess(null);

    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          message: broadcastBody.trim(),
          targetAudience: broadcastTarget === 'all_candidates' ? 'all_candidates' : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastSuccess(data.message || 'নোটিফিকেশন সফলভাবে প্রেরিত হয়েছে!');
        setTimeout(() => setBroadcastSuccess(null), 4500);
      } else {
        alert(data.error || 'ব্রডকাস্ট প্রেরণ ব্যর্থ');
      }
    } catch {
      alert('সার্ভার এরর');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Filtered logs
  const filteredLogs = smsLogs.filter(log => {
    const matchesSearch = log.recipient.includes(logSearch) || log.name.toLowerCase().includes(logSearch.toLowerCase()) || log.message.toLowerCase().includes(logSearch.toLowerCase());
    const matchesStatus = logStatusFilter === 'all' || log.status === logStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTemplate = templates.find(t => t.id === activeEditingTemplateId) || templates[0];

  return (
    <div className="space-y-6">
      {/* Top Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-black text-slate-900">যোগাযোগ ও বার্তা ব্যবস্থাপনা হাব</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              গেটওয়ে লাইভ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            টেলিটক অফিসিয়াল গেটওয়ে ও বাল্ক এসএমএস এপিআই কনসোল, পুশ নোটিফিকেশন ডিসপ্যাচার ও লাইভ টেমপ্লেট
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSubTabSwitch('sms-status')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'sms-status' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>এসএমএস গেটওয়ে</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('notifications')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'notifications' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>ব্রডকাস্ট নোটিফিকেশন</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('templates-delivery')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'templates-delivery' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>টেমপ্লেট ও হিস্ট্রি</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SMS GATEWAY STATUS & LIVE DISPATCHER */}
      {currentSubTab === 'sms-status' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">অবশিষ্ট SMS ক্রেডিট</p>
                <h3 className="text-xl font-black text-slate-900">৩,৪৫০টি</h3>
                <p className="text-[11px] font-semibold text-emerald-700">ব্যালেন্স: ৳১,৩৮০.০০</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">আজকের প্রেরিত SMS</p>
                <h3 className="text-xl font-black text-slate-900">১২৮টি</h3>
                <p className="text-[11px] font-semibold text-blue-700">গতকালের চেয়ে +১৮%</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">ডেলিভারি সাকসেস রেট</p>
                <h3 className="text-xl font-black text-emerald-700">৯৯.৪%</h3>
                <p className="text-[11px] font-semibold text-slate-500">গড় লেটেন্সি: ১.৮ সেকেণ্ড</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">ডিফল্ট গেটওয়ে</p>
                <h3 className="text-base font-black text-slate-900 truncate">{selectedGateway}</h3>
                <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  সক্রিয় সংযোগ
                </span>
              </div>
            </div>
          </div>

          {/* Gateway Status Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gateway 1: Teletalk */}
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedGateway === 'Teletalk SMS' 
                ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Teletalk SMS Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  সরকারি চ্যানেল
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                টেলিটক রিক্রুটমেন্ট ও ওটিপি প্রেরণের জন্য ডেডিকেটেড সরাসরি বিটিআরসি অ্যাপ্রুভড গেটওয়ে।
              </p>
              <div className="text-[11px] text-slate-500 space-y-1 mb-3 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 font-mono">
                <div>এপিআই পিং: ১৮ms (অপটিমাল)</div>
                <div>মাস্কিং নাম: CHAKRISHEBA</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGateway('Teletalk SMS')}
                className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGateway === 'Teletalk SMS'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {selectedGateway === 'Teletalk SMS' ? '✓ প্রধান গেটওয়ে নির্বাচিত' : 'প্রধান গেটওয়ে হিসেবে সেট করুন'}
              </button>
            </div>

            {/* Gateway 2: Greenweb */}
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedGateway === 'Greenweb BD' 
                ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Greenweb BD Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  বাল্ক ব্যাকআপ
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                উচ্চ ট্রাফিকের সময় স্বয়ংক্রিয় ব্যাকআপ ট্রানজেকশনাল এসএমএস প্রদানকারী রুট।
              </p>
              <div className="text-[11px] text-slate-500 space-y-1 mb-3 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 font-mono">
                <div>ব্যালেন্স: ১,২০০ ক্রেডিট</div>
                <div>রেসপন্স টাইম: ৪৫ms</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGateway('Greenweb BD')}
                className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGateway === 'Greenweb BD'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {selectedGateway === 'Greenweb BD' ? '✓ প্রধান গেটওয়ে নির্বাচিত' : 'প্রধান গেটওয়ে হিসেবে সেট করুন'}
              </button>
            </div>

            {/* Gateway 3: SSL Wireless */}
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedGateway === 'SSL Wireless' 
                ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  SSL Wireless SMS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                  এন্টারপ্রাইজ
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                মাল্টিপল অপারেটর সাপোর্ট (GP, Robi, BL, Teletalk) সহ প্রিমিয়াম ডেলিভারি চ্যানেল।
              </p>
              <div className="text-[11px] text-slate-500 space-y-1 mb-3 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 font-mono">
                <div>ডেলিভারি রিপোর্ট: লাইভ ওয়েবহুক</div>
                <div>টোকেন মেয়াদ: সক্রিয়</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGateway('SSL Wireless')}
                className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGateway === 'SSL Wireless'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {selectedGateway === 'SSL Wireless' ? '✓ প্রধান গেটওয়ে নির্বাচিত' : 'প্রধান গেটওয়ে হিসেবে সেট করুন'}
              </button>
            </div>
          </div>

          {/* Live SMS Tester & Dispatcher Form */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Send className="w-4 h-4" />
                </span>
                <h3 className="font-black text-sm text-slate-900">লাইভ টেস্ট এসএমএস সেন্ডার কনসোল</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                নির্বাচিত গেটওয়ে: <span className="text-emerald-700">{selectedGateway}</span>
              </span>
            </div>

            {sendSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sendSuccessMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রাপকের মোবাইল নম্বর
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipientNumber}
                    onChange={(e) => setRecipientNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setRecipientNumber('01774366643')}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold"
                  >
                    অ্যাডমিন নম্বর
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  টেমপ্লেট সিলেক্ট করুন (ঐচ্ছিক)
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="custom">কাস্টম মেসেজ (নিজে লিখুন)</option>
                  <option value="otp">ওটিপি ভেরিফিকেশন কোড</option>
                  <option value="completed">আবেদন সফল সাবমিশন নোটিশ</option>
                  <option value="admit">প্রবেশপত্র রিলিজ নোটিশ</option>
                  <option value="payment">পেমেন্ট ভেরিফিকেশন নিশ্চিতকরণ</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  এসএমএস বার্তা
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {messageBody.length} অক্ষর | {Math.ceil(messageBody.length / 160) || 1} এসএমএস (বাংলা ইউনিকোড)
                </span>
              </div>
              <textarea
                rows={3}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="বার্তা লিখুন..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMessageBody('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                রিসেট
              </button>
              <button
                type="button"
                onClick={handleSendTestSms}
                disabled={isSending}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>প্রেরণ করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>টেস্ট এসএমএস পাঠান</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SMS Dispatch Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">রিসেন্ট এসএমএস ডেলিভারি লগ</h3>
                <p className="text-xs text-slate-500">গেটওয়ে ওয়াইজ ট্রানজেকশনাল এসএমএস লগ</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="নম্বর বা নাম দিয়ে খুঁজুন..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">সকল স্ট্যাটাস</option>
                  <option value="delivered">ডেলিভার্ড</option>
                  <option value="pending">পেন্ডিং</option>
                  <option value="failed">ব্যর্থ</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">লগ আইডি</th>
                    <th className="py-2.5 px-3">প্রাপক ও নম্বর</th>
                    <th className="py-2.5 px-3">মেসেজ বডি</th>
                    <th className="py-2.5 px-3">গেটওয়ে</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3 text-right">চার্জ ও সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{log.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{log.name}</div>
                        <div className="font-mono text-[11px] text-emerald-700">{log.recipient}</div>
                      </td>
                      <td className="py-2.5 px-3 max-w-sm truncate text-slate-600" title={log.message}>
                        {log.message}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.gateway}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {log.status === 'delivered' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3" /> ডেলিভার্ড
                          </span>
                        ) : log.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> কিউতে পেন্ডিং
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                            ব্যর্থ
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900">৳{log.cost.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: BROADCAST PUSH NOTIFICATIONS */}
      {currentSubTab === 'notifications' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Compose Broadcast Notification */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                    <Bell className="w-4 h-4" />
                  </span>
                  <h3 className="font-black text-sm text-slate-900">নতুন সিস্টেম ও পুশ ব্রডকাস্ট কম্পোজ</h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  ওয়েব পুশ ও ড্যাশবোর্ড নোটিফিকেশন
                </span>
              </div>

              {broadcastSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{broadcastSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  টার্গেট অডিয়েন্স / প্রাপক গ্রুপ
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all_candidates">সকল নিবন্ধিত চাকরিপ্রার্থী (সবার ড্যাশবোর্ডে পুশ হবে)</option>
                  <option value="pending_payment">যাদের পেমেন্ট বা আবেদন পেন্ডিং রয়েছে</option>
                  <option value="bcs_aspirants">বিসিএস ও সরকারি ক্যাটাগরিতে আগ্রহী প্রার্থীরা</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নোটিফিকেশনের শিরোনাম
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="যেমন: জরুরি সার্কুলার এলার্ট..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিস্তারিত বিবরণ / বার্তা
                </label>
                <textarea
                  rows={4}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="নোটিফিকেশনের বিস্তারিত মেসেজ লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendBroadcast}
                  disabled={isBroadcasting}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isBroadcasting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>ব্রডকাস্ট পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>অবিলম্বে ব্রডকাস্ট পাঠান</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Live Preview Box */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-sm text-slate-900">ক্যান্ডিডেট ড্যাশবোর্ড প্রিভিউ</h3>
                </div>
                <p className="text-xs text-slate-500 mt-2 mb-4">
                  চাকরিপ্রার্থীর ড্যাশবোর্ডের নোটিফিকেশন বেল আইকনে ক্লিক করলে ঠিক যেভাবে প্রদর্শিত হবে:
                </p>

                {/* Mock Notification Card */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-1">{broadcastTitle || 'শিরোনাম লিখুন'}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {broadcastBody || 'এখানে বিস্তারিত নোটিফিকেশনের বিবরণ দেখা যাবে...'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-medium">
                        <span>এইমাত্র</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">চাকরি সেবা অফিশিয়াল</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl">
                💡 <span className="font-bold text-slate-700">টিপস:</span> ব্রডকাস্ট নোটিফিকেশন একইসাথে প্রার্থীর একাউন্ট অ্যালার্ট ও পুশ নোটিফিকেশন হিসেবে সংরক্ষিত থাকে।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: TEMPLATES & LIVE MOBILE PREVIEW */}
      {currentSubTab === 'templates-delivery' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Templates List (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">সিস্টেম নোটিফিকেশন টেমপ্লেট</h3>
                <span className="text-[11px] font-bold text-slate-400">{templates.length}টি টেমপ্লেট</span>
              </div>

              <div className="space-y-1.5">
                {templates.map(tpl => {
                  const isSelected = tpl.id === activeEditingTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setActiveEditingTemplateId(tpl.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' 
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                          {tpl.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {tpl.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{tpl.body}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Middle: Template Editor (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-sm text-slate-900">{activeTemplate.name}</h3>
                  <span className="text-[11px] font-mono text-emerald-700">{activeTemplate.code}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {activeTemplate.category}
                </span>
              </div>

              {templateSavedFeedback && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{templateSavedFeedback}</span>
                </div>
              )}

              {/* Dynamic Variables Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ক্লিক করে ভেরিয়েবল যোগ করুন:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['{NAME}', '{JOB_TITLE}', '{TRACKING}', '{OTP}', '{AMOUNT}', '{TRXID}', '{ROLL}', '{EXAM_DATE}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const updated = templates.map(t => {
                          if (t.id === activeEditingTemplateId) {
                            return { ...t, body: t.body + ' ' + tag };
                          }
                          return t;
                        });
                        setTemplates(updated);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">টেমপ্লেট বার্তা</label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeTemplate.body.length} অক্ষর
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={activeTemplate.body}
                  onChange={(e) => {
                    const newBody = e.target.value;
                    setTemplates(templates.map(t => t.id === activeEditingTemplateId ? { ...t, body: newBody } : t));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setTemplateSavedFeedback('টেমপ্লেট সফলভাবে হালনাগাদ করা হয়েছে!');
                    setTimeout(() => setTemplateSavedFeedback(null), 3000);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  টেমপ্লেট পরিবর্তন সেভ করুন
                </button>
              </div>
            </div>

            {/* Right: Phone Frame Preview (3 cols) */}
            <div className="lg:col-span-3 bg-slate-900 rounded-3xl p-4 text-white shadow-xl flex flex-col justify-between border-4 border-slate-800">
              <div>
                {/* Speaker notch */}
                <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mb-4"></div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-4 px-1">
                  <span>১০:৩০</span>
                  <span>LTE • 100%</span>
                </div>

                <div className="text-center pb-3 border-b border-slate-800 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center mx-auto text-xs">
                    CS
                  </div>
                  <div className="font-bold text-xs mt-1">CHAKRISHEBA</div>
                  <div className="text-[9px] text-emerald-400">অফিসিয়াল এসএমএস</div>
                </div>

                {/* SMS Bubble */}
                <div className="bg-slate-800 text-slate-200 text-xs p-3 rounded-2xl rounded-tl-none border border-slate-700 shadow-sm leading-relaxed">
                  {activeTemplate.samplePreview}
                </div>
                <div className="text-[9px] text-slate-500 mt-1 pl-1">১০:৩০ পূর্বাহ্ন • Teletalk SMS</div>
              </div>

              <div className="pt-4 text-center">
                <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
