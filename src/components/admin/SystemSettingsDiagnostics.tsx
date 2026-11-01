'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  HardDrive, 
  ShieldAlert, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Activity,
  FileText
} from 'lucide-react';

interface SystemSettingsDiagnosticsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  candidates?: any[];
  applications?: any[];
  jobs?: any[];
  sources?: any[];
  drafts?: any[];
  stats?: any;
  onDownloadBackup?: () => void;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'সুপার অ্যাডমিন' | 'অপারেশনস মডারেটর' | 'টেলিটক অপারেটর' | 'ফাইন্যান্স অফিসার';
  status: 'active' | 'suspended';
  lastActive: string;
  permissions: string[];
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'STF-001',
    name: 'আব্দুর রহমান লিওন',
    email: 'admin@chakrisheba.com',
    phone: '01774366643',
    role: 'সুপার অ্যাডমিন',
    status: 'active',
    lastActive: 'এইমাত্র সক্রিয়',
    permissions: ['সকল পারমিশন', 'ডাটাবেস এক্সেস', 'পেমেন্ট কন্ট্রোল', 'সার্কুলার ম্যানেজমেন্ট', 'ইউজার ভল্ট']
  },
  {
    id: 'STF-002',
    name: 'তানভীর আহমেদ',
    email: 'tanvir.ops@chakrisheba.com',
    phone: '01819283746',
    role: 'টেলিটক অপারেটর',
    status: 'active',
    lastActive: '১৫ মিনিট পূর্বে',
    permissions: ['টেলিটক প্রসেসিং', 'অ্যাডমিট কপি আপলোড', 'আবেদন ট্র্যাকিং']
  },
  {
    id: 'STF-003',
    name: 'মাকসুদা সুলতানা',
    email: 'maksuda.acc@chakrisheba.com',
    phone: '01912345678',
    role: 'ফাইন্যান্স অফিসার',
    status: 'active',
    lastActive: '২ ঘণ্টা পূর্বে',
    permissions: ['পেমেন্ট ভেরিফিকেশন', 'ইনভয়েস অনুমোদন', 'ট্রানজেকশন রিপোর্ট']
  },
  {
    id: 'STF-004',
    name: 'কামরুল হাসান',
    email: 'kamrul.qc@chakrisheba.com',
    phone: '01678912345',
    role: 'অপারেশনস মডারেটর',
    status: 'active',
    lastActive: 'গতকাল',
    permissions: ['সার্কুলার ড্রাফট রিভিউ', 'স্ক্র্যাপার মনিটরিং']
  }
];

export default function SystemSettingsDiagnostics({
  activeTab = 'settings',
  onTabChange,
  candidates = [],
  applications = [],
  jobs = [],
  sources = [],
  drafts = [],
  stats = {},
  onDownloadBackup
}: SystemSettingsDiagnosticsProps) {
  // Navigation tabs
  const [currentSubTab, setCurrentSubTab] = useState<'settings' | 'backup-diagnostics' | 'staff-roles'>(
    activeTab === 'backup-diagnostics' ? 'backup-diagnostics' :
    activeTab === 'staff-roles' ? 'staff-roles' : 'settings'
  );

  React.useEffect(() => {
    if (activeTab === 'settings' || activeTab === 'backup-diagnostics' || activeTab === 'staff-roles') {
      setCurrentSubTab(activeTab);
    }
  }, [activeTab]);

  const handleSubTabSwitch = (tab: 'settings' | 'backup-diagnostics' | 'staff-roles') => {
    setCurrentSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // 1. Settings State
  const [platformName, setPlatformName] = useState('চাকরি সেবা (Chakri Sheba)');
  const [supportPhone, setSupportPhone] = useState('+880 1774-366643');
  const [supportEmail, setSupportEmail] = useState('support@chakrisheba.com');
  const [officeAddress, setOfficeAddress] = useState('ধানমন্ডি ৩২, ঢাকা-১২০৯, বাংলাদেশ');
  const [whatsappNumber, setWhatsappNumber] = useState('8801774366643');
  
  // Fees
  const [standardFee, setStandardFee] = useState('80');
  const [expressFee, setExpressFee] = useState('120');
  const [urgentFee, setUrgentFee] = useState('150');

  // Official MFS Accounts
  const [bkashNumber, setBkashNumber] = useState('01774366643');
  const [nagadNumber, setNagadNumber] = useState('01812345678');
  const [rocketNumber, setRocketNumber] = useState('01912345678');

  // Controls
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [autoScraperCron, setAutoScraperCron] = useState<'6h' | '12h' | '24h'>('6h');
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load live settings from backend on mount
  useEffect(() => {
    const fetchPlatformSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }
        });
        if (res.ok) {
          const d = await res.json();
          if (d.settings) {
            const s = d.settings;
            if (s.general) {
              if (s.general.siteName) setPlatformName(s.general.siteName);
              if (s.general.supportPhone) setSupportPhone(s.general.supportPhone);
              if (s.general.supportEmail) setSupportEmail(s.general.supportEmail);
              if (s.general.officeAddress) setOfficeAddress(s.general.officeAddress);
              if (s.general.whatsappNumber) setWhatsappNumber(s.general.whatsappNumber);
            }
            if (s.workflow) {
              if (s.workflow.maintenanceMode !== undefined) setMaintenanceMode(s.workflow.maintenanceMode);
              if (s.workflow.allowCandidateSelfRegistration !== undefined) setAllowRegistration(s.workflow.allowCandidateSelfRegistration);
              if (s.workflow.autoScrapeInterval) setAutoScraperCron(s.workflow.autoScrapeInterval);
            }
            if (s.operational) {
              if (s.operational.standardServiceFee !== undefined) setStandardFee(String(s.operational.standardServiceFee));
              if (s.operational.expressServiceFee !== undefined) setExpressFee(String(s.operational.expressServiceFee));
              if (s.operational.urgentServiceFee !== undefined) setUrgentFee(String(s.operational.urgentServiceFee));
              if (s.operational.officialBkashNumber) setBkashNumber(s.operational.officialBkashNumber);
              if (s.operational.officialNagadNumber) setNagadNumber(s.operational.officialNagadNumber);
              if (s.operational.officialRocketNumber) setRocketNumber(s.operational.officialRocketNumber);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    };

    fetchPlatformSettings();
  }, []);

  // 2. Diagnostics State
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    timestamp: string;
    avgLatency: number;
    passed: number;
    total: number;
    checks: { name: string; url: string; latency: number; status: 'ok' | 'error'; note: string }[];
  } | null>(null);

  // 3. Staff State
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffMember['role']>('টেলিটক অপারেটর');

  // Run diagnostics
  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    const endpoints = [
      { name: 'সার্ভার এনালিটিক্স ও মেমোরি এপিআই', url: '/api/admin/stats' },
      { name: 'চাকরি আবেদন ডাটাবেজ ও কিউ', url: '/api/applications' },
      { name: 'চাকরিপ্রার্থী ডিরেক্টরি ও ভল্ট', url: '/api/admin/candidates' },
      { name: 'অফিসিয়াল সার্কুলার ম্যানেজমেন্ট', url: '/api/admin/jobs' },
      { name: 'টেলিটক ও সরকারি জব স্ক্র্যাপার সোর্স', url: '/api/admin/sources' },
    ];

    let totalLatency = 0;
    let passedCount = 0;
    const checks: any[] = [];

    for (const ep of endpoints) {
      const t0 = performance.now();
      try {
        const res = await fetch(ep.url);
        const t1 = performance.now();
        const latency = Math.round(t1 - t0);
        totalLatency += latency;
        if (res.ok) {
          passedCount++;
          checks.push({
            name: ep.name,
            url: ep.url,
            latency,
            status: 'ok',
            note: `HTTP ${res.status} OK (সক্রিয় ও রেসপন্সিভ)`
          });
        } else {
          checks.push({
            name: ep.name,
            url: ep.url,
            latency,
            status: 'error',
            note: `HTTP ${res.status} (অনাকাঙ্ক্ষিত কোড)`
          });
        }
      } catch (err: any) {
        checks.push({
          name: ep.name,
          url: ep.url,
          latency: 0,
          status: 'error',
          note: `নেটওয়ার্ক সংযোগ ত্রুটি: ${err.message}`
        });
      }
    }

    setDiagnosticResult({
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      avgLatency: Math.round(totalLatency / endpoints.length),
      passed: passedCount,
      total: endpoints.length,
      checks
    });
    setIsRunningDiagnostics(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsSuccess(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' },
        body: JSON.stringify({
          general: {
            siteName: platformName,
            supportPhone,
            supportEmail,
            officeAddress,
            whatsappNumber
          },
          workflow: {
            maintenanceMode,
            allowCandidateSelfRegistration: allowRegistration,
            autoScrapeInterval: autoScraperCron
          },
          operational: {
            standardServiceFee: Number(standardFee) || 80,
            expressServiceFee: Number(expressFee) || 120,
            urgentServiceFee: Number(urgentFee) || 150,
            officialBkashNumber: bkashNumber,
            officialNagadNumber: nagadNumber,
            officialRocketNumber: rocketNumber
          }
        })
      });

      if (res.ok) {
        setSettingsSuccess('প্ল্যাটফর্মের সকল সেটিংস ও কনফিগারেশন সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে!');
        setTimeout(() => setSettingsSuccess(null), 4000);
      } else {
        const d = await res.json();
        alert(d.error || 'সেটিংস সংরক্ষণে ত্রুটি');
      }
    } catch {
      alert('সার্ভার এরর');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    const newMember: StaffMember = {
      id: `STF-00${staffList.length + 1}`,
      name: newStaffName,
      email: newStaffEmail,
      phone: newStaffPhone || '01XXXXXXXXX',
      role: newStaffRole,
      status: 'active',
      lastActive: 'এইমাত্র যোগ করা হয়েছে',
      permissions: newStaffRole === 'সুপার অ্যাডমিন' ? ['সকল পারমিশন'] : ['সীমিত অপারেটর এক্সেস']
    };

    setStaffList([...staffList, newMember]);
    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Top Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-black text-slate-900">সিস্টেম কনফিগারেশন ও ম্যানেজমেন্ট</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ভার্সন ২.৬ এন্টারপ্রাইজ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            সার্ভিস ফি, পেমেন্ট অ্যাকাউন্ট, ফুল ডাটাবেস ব্যাকআপ এবং স্টাফ পারমিশন নিয়ন্ত্রণ কেন্দ্র
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSubTabSwitch('settings')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'settings' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>সিস্টেম সেটিংস</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('backup-diagnostics')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'backup-diagnostics' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>ব্যাকআপ ও ডায়াগনস্টিকস</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('staff-roles')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'staff-roles' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>স্টাফ ও রোল পারমিশন</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SYSTEM SETTINGS & PAYMENT CONFIGURATION */}
      {currentSubTab === 'settings' && (
        <div className="space-y-6">
          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-sm text-slate-900">প্ল্যাটফর্মের সাধারণ তথ্য</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্ল্যাটফর্মের নাম</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">হেল্পলাইন নম্বর</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সাপোর্ট ইমেইল</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল হোয়াটসঅ্যাপ লিংক নম্বর</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="8801XXXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অফিস ঠিকানা</label>
                <textarea
                  rows={2}
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Service Fees & MFS Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-sm text-slate-900">সার্ভিস ফি ও অফিশিয়াল পেমেন্ট গেটওয়ে</h3>
              </div>

              {/* Service Fees */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">সহায়তাপ্রাপ্ত আবেদন সার্ভিস ফি (টাকায়)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">সাধারণ ফি</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-slate-400">৳</span>
                      <input
                        type="number"
                        value={standardFee}
                        onChange={(e) => setStandardFee(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">এক্সপ্রেস ফি</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-slate-400">৳</span>
                      <input
                        type="number"
                        value={expressFee}
                        onChange={(e) => setExpressFee(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">আর্জেন্ট ফি</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-slate-400">৳</span>
                      <input
                        type="number"
                        value={urgentFee}
                        onChange={(e) => setUrgentFee(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* MFS Payment Numbers */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700">অফিশিয়াল এমএফএস অ্যাকাউন্ট নম্বর</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-20 px-2 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 font-bold text-xs text-center shrink-0">
                      bKash
                    </span>
                    <input
                      type="text"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 px-2 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 font-bold text-xs text-center shrink-0">
                      Nagad
                    </span>
                    <input
                      type="text"
                      value={nagadNumber}
                      onChange={(e) => setNagadNumber(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 px-2 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs text-center shrink-0">
                      Rocket
                    </span>
                    <input
                      type="text"
                      value={rocketNumber}
                      onChange={(e) => setRocketNumber(e.target.value)}
                      placeholder="019XXXXXXXX"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Controls & Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <h3 className="font-black text-sm text-slate-900 pb-3 border-b border-slate-100">
              সিস্টেম অপারেশন ও রিয়েল-টাইম সুইচ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900">মেইনটেন্যান্স মোড</h4>
                  <p className="text-[11px] text-slate-500">অন করলে প্ল্যাটফর্মে নোটিশ দেখাবে</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900">নতুন প্রার্থী নিবন্ধন</h4>
                  <p className="text-[11px] text-slate-500">নতুন ইউজার একাউন্ট তৈরি সক্রিয়</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowRegistration(!allowRegistration)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    allowRegistration ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    allowRegistration ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900">স্বয়ংক্রিয় স্ক্র্যাপার ক্রন</h4>
                  <p className="text-[11px] text-slate-500">সার্কুলার চেকের ব্যবধান</p>
                </div>
                <select
                  value={autoScraperCron}
                  onChange={(e) => setAutoScraperCron(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="6h">প্রতি ৬ ঘণ্টা</option>
                  <option value="12h">প্রতি ১২ ঘণ্টা</option>
                  <option value="24h">প্রতি ২৪ ঘণ্টা</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                সব পরিবর্তন সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DATABASE BACKUP & SYSTEM DIAGNOSTICS */}
      {currentSubTab === 'backup-diagnostics' && (
        <div className="space-y-6">
          {/* Top 4 DB Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">মোট চাকরিপ্রার্থী ভল্ট</p>
                <h3 className="text-xl font-black text-slate-900">{candidates.length} জন</h3>
                <p className="text-[11px] text-slate-500">লাইভ ডাটাবেস রেকর্ড</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">মোট আবেদন রেকর্ড</p>
                <h3 className="text-xl font-black text-slate-900">{applications.length} টি</h3>
                <p className="text-[11px] text-blue-700">প্রসেসিং ও হিস্ট্রি</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">সক্রিয় সার্কুলার</p>
                <h3 className="text-xl font-black text-slate-900">{jobs.length} টি</h3>
                <p className="text-[11px] text-slate-500">পাবলিক পোর্টালে দৃশ্যমান</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">স্ক্র্যাপার ও ড্রাফটস</p>
                <h3 className="text-xl font-black text-slate-900">{sources.length} সোর্স</h3>
                <p className="text-[11px] text-amber-700">{drafts.length}টি পেন্ডিং ড্রাফট</p>
              </div>
            </div>
          </div>

          {/* Backup Action Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ১-ক্লিক ক্লাউড ও লোকাল ডাটা এক্সপোর্ট
              </span>
              <h3 className="text-lg font-black text-white">সম্পূর্ণ ডাটাবেস ব্যাকআপ সংরক্ষণ করুন</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                সকল চাকরি সার্কুলার, আবেদন ডাটা, প্রার্থী প্রোফাইল, স্ক্র্যাপার সোর্স ও সিস্টেম কনফিগারেশন এর সম্পূর্ণ JSON স্ন্যাপশট এক ক্লিকে ডাউনলোড করুন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onDownloadBackup}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>ডাটাবেস ব্যাকআপ ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Real-time Diagnostics Engine */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Activity className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-900">এন্টারপ্রাইজ মাইক্রোসার্ভিস ডায়াগনস্টিক ইঞ্জিন</h3>
                  <p className="text-xs text-slate-500">কোর এপিআই এন্ডপয়েন্ট ও রেসপন্স টাইম নিরীক্ষা</p>
                </div>
              </div>

              <button
                type="button"
                onClick={runDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRunningDiagnostics ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>নিরীক্ষা চলছে...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>সম্পূর্ণ সিস্টেম ডায়াগনস্টিক চালান</span>
                  </>
                )}
              </button>
            </div>

            {/* Diagnostic Table */}
            {diagnosticResult ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-900">
                    ফলাফল: {diagnosticResult.passed}/{diagnosticResult.total} টি এন্ডপয়েন্ট উত্তীর্ণ (গড় লেটেন্সি: {diagnosticResult.avgLatency}ms)
                  </span>
                  <span className="text-[11px] text-slate-500">সময়: {diagnosticResult.timestamp}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">সার্ভিস নাম</th>
                        <th className="py-2.5 px-3 font-mono">এন্ডপয়েন্ট URL</th>
                        <th className="py-2.5 px-3">রেসপন্স টাইম</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                        <th className="py-2.5 px-3">বিবরণ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {diagnosticResult.checks.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-800">{c.url}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">{c.latency} ms</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3" /> সক্রিয়
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{c.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                ডায়াগনস্টিক ফলাফল দেখতে উপরের &quot;সম্পূর্ণ সিস্টেম ডায়াগনস্টিক চালান&quot; বাটনে ক্লিক করুন।
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: STAFF & RBAC PERMISSIONS */}
      {currentSubTab === 'staff-roles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">স্টাফ ও রোল পারমিশন ম্যানেজমেন্ট</h3>
                <p className="text-xs text-slate-500">প্ল্যাটফর্ম অ্যাডমিন, অপারেটর ও মডারেটরদের তালিকা</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন স্টাফ যোগ করুন</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">স্টাফ আইডি</th>
                    <th className="py-2.5 px-3">নাম ও যোগাযোগ</th>
                    <th className="py-2.5 px-3">নিযুক্ত রোল</th>
                    <th className="py-2.5 px-3">পারমিশন স্কোপ</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3 text-right">শেষ সক্রিয়তা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {staffList.map((stf) => (
                    <tr key={stf.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{stf.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{stf.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{stf.email} • {stf.phone}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          stf.role === 'সুপার অ্যাডমিন' ? 'bg-purple-100 text-purple-800' :
                          stf.role === 'টেলিটক অপারেটর' ? 'bg-blue-100 text-blue-800' :
                          stf.role === 'ফাইন্যান্স অফিসার' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {stf.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {stf.permissions.map((p, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> সক্রিয়
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[11px] text-slate-500 font-medium">
                        {stf.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Staff Modal */}
          {showAddStaffModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900">নতুন স্টাফ অ্যাকাউন্ট তৈরি</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">স্টাফের পুরো নাম</label>
                    <input
                      type="text"
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="নাম লিখুন..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
                    <input
                      type="email"
                      required
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="staff@chakrisheba.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">নিযুক্ত পদ / রোল</label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="টেলিটক অপারেটর">টেলিটক অপারেটর</option>
                      <option value="ফাইন্যান্স অফিসার">ফাইন্যান্স অফিসার</option>
                      <option value="অপারেশনস মডারেটর">অপারেশনস মডারেটর</option>
                      <option value="সুপার অ্যাডমিন">সুপার অ্যাডমিন</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      অ্যাকাউন্ট যুক্ত করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
