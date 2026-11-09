'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Zap, 
  Sliders, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile, EducationRecord, ExperienceRecord } from '@/lib/types';
import { emptyCandidateProfile as mockUserProfile } from '@/lib/candidate-defaults';
import { BD_DIVISIONS_EN, BD_DIVISIONS_MAP, getAllDistrictsList, getDivisionForDistrict, getDistrictsForDivision, getUpazilasForDistrict, normalizeToEnglishDistrict, normalizeToEnglishDivision } from '@/lib/constants';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile>(mockUserProfile);
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'experience' | 'preferences' | 'quota'>('personal');

  // Skills state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  // Experience state
  const [newExpDesignation, setNewExpDesignation] = useState('');
  const [newExpOrg, setNewExpOrg] = useState('');
  const [newExpStartDate, setNewExpStartDate] = useState('');
  const [newExpEndDate, setNewExpEndDate] = useState('');
  const [newExpIsCurrent, setNewExpIsCurrent] = useState(false);
  const [newExpResponsibilities, setNewExpResponsibilities] = useState('');
  const [isSavingExp, setIsSavingExp] = useState(false);

  // Career Preferences state
  const [prefCategories, setPrefCategories] = useState<string[]>([]);
  const [prefOrgTypes, setPrefOrgTypes] = useState<string[]>([]);
  const [prefDivisions, setPrefDivisions] = useState<string[]>([]);
  const [prefSalaryMin, setPrefSalaryMin] = useState<string>('');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Structured Address States
  const [sameAsPresent, setSameAsPresent] = useState<boolean>(true);
  
  // Present Address Fields (Teletalk / Govt / Bank English Standard)
  const [presentCareOf, setPresentCareOf] = useState<string>('');
  const [presentVillageRoad, setPresentVillageRoad] = useState<string>('');
  const [presentDivision, setPresentDivision] = useState<string>('DHAKA');
  const [presentDistrict, setPresentDistrict] = useState<string>('DHAKA');
  const [presentThana, setPresentThana] = useState<string>('MIRPUR');
  const [presentPostOffice, setPresentPostOffice] = useState<string>('');
  const [presentPostCode, setPresentPostCode] = useState<string>('');

  // Permanent Address Fields (Teletalk / Govt / Bank English Standard)
  const [permanentCareOf, setPermanentCareOf] = useState<string>('');
  const [permanentVillageRoad, setPermanentVillageRoad] = useState<string>('');
  const [permanentDivision, setPermanentDivision] = useState<string>('DHAKA');
  const [permanentDistrict, setPermanentDistrict] = useState<string>('DHAKA');
  const [permanentThana, setPermanentThana] = useState<string>('MIRPUR');
  const [permanentPostOffice, setPermanentPostOffice] = useState<string>('');
  const [permanentPostCode, setPermanentPostCode] = useState<string>('');

  // Auto-selected Upazila / Thana Custom Input Modes
  const [homeDistrictCustomMode, setHomeDistrictCustomMode] = useState<boolean>(false);
  const [presentCustomDivisionMode, setPresentCustomDivisionMode] = useState<boolean>(false);
  const [presentCustomDistrictMode, setPresentCustomDistrictMode] = useState<boolean>(false);
  const [presentCustomThanaMode, setPresentCustomThanaMode] = useState<boolean>(false);
  const [permanentCustomDivisionMode, setPermanentCustomDivisionMode] = useState<boolean>(false);
  const [permanentCustomDistrictMode, setPermanentCustomDistrictMode] = useState<boolean>(false);
  const [permanentCustomThanaMode, setPermanentCustomThanaMode] = useState<boolean>(false);
  const [customQuotaMode, setCustomQuotaMode] = useState<boolean>(false);
  const [customQuotaTitle, setCustomQuotaTitle] = useState<string>('');
  const [eduCustomLevelMode, setEduCustomLevelMode] = useState<boolean>(false);
  const [eduCustomBoardMode, setEduCustomBoardMode] = useState<boolean>(false);

  // Education Modal / Form State
  const [showEduModal, setShowEduModal] = useState(false);
  const [eduLevel, setEduLevel] = useState('স্নাতক (অনার্স)');
  const [eduDegree, setEduDegree] = useState('');
  const [eduBoard, setEduBoard] = useState('');
  const [eduRoll, setEduRoll] = useState('');
  const [eduReg, setEduReg] = useState('');
  const [eduYear, setEduYear] = useState('2021');
  const [eduResult, setEduResult] = useState('');

  // Transliterate / Normalize Bengali Address data to English Standard
  const toEnDigits = (str: string) => str.replace(/[০-৯]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09E6 + 0x30));

  const convertBnAddressToEn = (str: string): string => {
    if (!str) return '';
    let res = str
      .replace(/[০-৯]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09E6 + 0x30))
      .replace(/বাড়ি|বাড়ি|বাসা/gi, 'HOUSE')
      .replace(/রোড|রাস্তা/gi, 'ROAD')
      .replace(/ফ্ল্যাট/gi, 'FLAT')
      .replace(/গ্রাম/gi, 'VILL')
      .replace(/পোস্ট|ডাকঘর/gi, 'PO')
      .replace(/থানা|উপজেলা/gi, 'THANA')
      .replace(/জেলা/gi, 'DIST');
    
    return res.trim().replace(/,\s*$/, '');
  };

  const populateAddressFromProfile = (p: CandidateProfile) => {
    const pAddr = p.presentAddressDetails || {};
    const permAddr = p.permanentAddressDetails || {};
    
    const pCareOf = (pAddr.careOf || p.fatherName || (p as any).biodata?.fatherName || '').trim();

    const pDistrict = pAddr.district || p.district || 'DHAKA';
    const normDistrict = normalizeToEnglishDistrict(pDistrict);
    const normDiv = normalizeToEnglishDivision(pAddr.division || p.division || getDivisionForDistrict(normDistrict));
    
    // Parse raw address if structured details not yet present
    const rawAddr = p.address || '';
    const postCodeMatch = rawAddr.match(/(\d{4}|[০-৯]{4})/);
    const pCode = toEnDigits(pAddr.postCode || (postCodeMatch ? postCodeMatch[1] : ''));

    const rawVillage = pAddr.villageRoad || (rawAddr ? rawAddr.replace(/(\d{4}|[০-৯]{4})/, '').trim().replace(/,\s*$/, '') : '');
    const pVillage = rawVillage.trim();
    
    let defaultThana = pAddr.upazilaThana || '';
    if (!defaultThana) {
      const upazilas = getUpazilasForDistrict(normDistrict);
      for (const u of upazilas) {
        if (rawAddr.toLowerCase().includes(u.toLowerCase())) {
          defaultThana = u;
          break;
        }
      }
      if (!defaultThana) defaultThana = upazilas[0] || '';
    }

    const normThana = defaultThana.trim();
    const normPostOffice = (pAddr.postOffice || normThana).trim();

    setPresentCareOf(pCareOf);
    setPresentVillageRoad(pVillage);
    setPresentDivision(normDiv);
    setPresentDistrict(normDistrict);
    setPresentThana(normThana);
    setPresentPostOffice(normPostOffice);
    setPresentPostCode(pCode);

    const isSame = p.sameAsPresentAddress ?? true;
    setSameAsPresent(isSame);

    const permDist = normalizeToEnglishDistrict(permAddr.district || pDistrict);
    const permDiv = normalizeToEnglishDivision(permAddr.division || p.division || getDivisionForDistrict(permDist));

    if (isSame) {
      setPermanentCareOf(pCareOf);
      setPermanentVillageRoad(pVillage);
      setPermanentDivision(normDiv);
      setPermanentDistrict(normDistrict);
      setPermanentThana(normThana);
      setPermanentPostOffice(normPostOffice);
      setPermanentPostCode(pCode);
    } else {
      const rawPermCare = (permAddr.careOf || pCareOf).trim();
      setPermanentCareOf(rawPermCare);

      const rawPermVillage = (permAddr.villageRoad || pVillage).trim();
      setPermanentVillageRoad(rawPermVillage);

      setPermanentDivision(permDiv);
      setPermanentDistrict(permDist);
      setPermanentThana((permAddr.upazilaThana || normThana).trim());
      setPermanentPostOffice((permAddr.postOffice || normPostOffice).trim());
      setPermanentPostCode(toEnDigits(permAddr.postCode || pCode));
    }
  };

  useEffect(() => {
    const local = storage.getUser();
    setProfile(local);
    if (typeof window !== 'undefined') {
      const searchTab = new URLSearchParams(window.location.search).get('tab');
      if (searchTab && ['personal', 'education', 'skills', 'experience', 'preferences', 'quota'].includes(searchTab)) {
        setActiveTab(searchTab as any);
      }
    }
    populateAddressFromProfile(local);
    setIsLoaded(true);
    fetch('/api/profile', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const p = data?.profile || data?.user;
        if (p) {
          setProfile(p);
          populateAddressFromProfile(p);
          storage.updateUser(p);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('cs_user_changed'));
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  // Auto-sync permanent address whenever present address changes and sameAsPresent is checked
  useEffect(() => {
    if (sameAsPresent) {
      setPermanentCareOf(presentCareOf);
      setPermanentVillageRoad(presentVillageRoad);
      setPermanentDivision(presentDivision);
      setPermanentDistrict(presentDistrict);
      setPermanentThana(presentThana);
      setPermanentPostOffice(presentPostOffice);
      setPermanentPostCode(presentPostCode);
    }
  }, [sameAsPresent, presentCareOf, presentVillageRoad, presentDivision, presentDistrict, presentThana, presentPostOffice, presentPostCode]);

  const handlePresentDivisionChange = (div: string) => {
    setPresentDivision(div);
    const districts = getDistrictsForDivision(div);
    const exists = districts.some(d => d.en === presentDistrict);
    const newDistrict = exists ? presentDistrict : (districts[0]?.en || 'DHAKA');
    setPresentDistrict(newDistrict);
    const upazilas = getUpazilasForDistrict(newDistrict);
    if (!upazilas.includes(presentThana)) {
      setPresentThana(upazilas[0] || 'MIRPUR');
      setPresentCustomThanaMode(false);
    }
  };

  const handlePermanentDivisionChange = (div: string) => {
    setPermanentDivision(div);
    const districts = getDistrictsForDivision(div);
    const exists = districts.some(d => d.en === permanentDistrict);
    const newDistrict = exists ? permanentDistrict : (districts[0]?.en || 'DHAKA');
    setPermanentDistrict(newDistrict);
    const upazilas = getUpazilasForDistrict(newDistrict);
    if (!upazilas.includes(permanentThana)) {
      setPermanentThana(upazilas[0] || 'MIRPUR');
      setPermanentCustomThanaMode(false);
    }
  };

  const handlePresentDistrictChange = (dist: string) => {
    setPresentDistrict(dist);
    setPresentDivision(getDivisionForDistrict(dist));
    const upazilas = getUpazilasForDistrict(dist);
    if (!upazilas.includes(presentThana)) {
      setPresentThana(upazilas[0] || 'SADAR');
      setPresentCustomThanaMode(false);
    }
  };

  const handlePermanentDistrictChange = (dist: string) => {
    setPermanentDistrict(dist);
    setPermanentDivision(getDivisionForDistrict(dist));
    const upazilas = getUpazilasForDistrict(dist);
    if (!upazilas.includes(permanentThana)) {
      setPermanentThana(upazilas[0] || 'SADAR');
      setPermanentCustomThanaMode(false);
    }
  };

  const syncProfileToServer = async (profileToSave: CandidateProfile): Promise<boolean> => {
    try {
      // Optimistically update local state & dispatch change event immediately
      setProfile(profileToSave);
      storage.updateUser(profileToSave);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cs_user_changed'));
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers,
        cache: 'no-store',
        body: JSON.stringify(profileToSave)
      });
      const data = await response.json();
      if (!response.ok || !data.profile) throw new Error(data.error || 'প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে');
      setProfile(data.profile);
      storage.updateUser(data.profile);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cs_user_changed'));
      }
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে');
      return false;
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine structured fields into standard text address strings for backward compatibility
    const combinedPresent = `${presentVillageRoad}${presentThana ? ', ' + presentThana : ''}${presentDistrict ? ', ' + presentDistrict : ''}${presentPostCode ? '-' + presentPostCode : ''}`;
    const combinedPerm = sameAsPresent 
      ? combinedPresent 
      : `${permanentVillageRoad}${permanentThana ? ', ' + permanentThana : ''}${permanentDistrict ? ', ' + permanentDistrict : ''}${permanentPostCode ? '-' + permanentPostCode : ''}`;

    const updatedProfile: CandidateProfile = {
      ...profile,
      division: presentDivision,
      district: presentDistrict,
      address: combinedPresent,
      permanentAddress: combinedPerm,
      sameAsPresentAddress: sameAsPresent,
      presentAddressDetails: {
        careOf: presentCareOf,
        villageRoad: presentVillageRoad,
        division: presentDivision,
        district: presentDistrict,
        upazilaThana: presentThana,
        postOffice: presentPostOffice,
        postCode: presentPostCode
      },
      permanentAddressDetails: {
        careOf: sameAsPresent ? presentCareOf : permanentCareOf,
        villageRoad: sameAsPresent ? presentVillageRoad : permanentVillageRoad,
        division: sameAsPresent ? presentDivision : permanentDivision,
        district: sameAsPresent ? presentDistrict : permanentDistrict,
        upazilaThana: sameAsPresent ? presentThana : permanentThana,
        postOffice: sameAsPresent ? presentPostOffice : permanentPostOffice,
        postCode: sameAsPresent ? presentPostCode : permanentPostCode
      }
    };

    if (!await syncProfileToServer(updatedProfile)) return;
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduDegree || !eduResult) return;
    const newEdu: EducationRecord = {
      id: 'EDU-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      level: eduLevel,
      degree: eduDegree,
      boardOrUni: eduBoard || 'অন্যান্য',
      roll: eduRoll || 'N/A',
      reg: eduReg || 'N/A',
      year: eduYear,
      result: eduResult
    };
    const updated = {
      ...profile,
      education: [newEdu, ...profile.education]
    };
    if (!await syncProfileToServer(updated)) return;
    setShowEduModal(false);
    setEduDegree('');
    setEduResult('');
  };

  const handleDeleteEducation = async (idx: number) => {
    const updatedList = profile.education.filter((_, i) => i !== idx);
    const updated = { ...profile, education: updatedList };
    if (!await syncProfileToServer(updated)) return;
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setIsSavingSkill(true);
    try {
      const res = await fetch('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkillName.trim(), proficiency: newSkillProficiency })
      });
      if (res.ok) {
        const d = await res.json();
        const updatedSkills = d.data || [...(profile.skills || []), { id: 'sk_' + Date.now(), name: newSkillName.trim(), proficiency: newSkillProficiency }];
        const updated = { ...profile, skills: updatedSkills };
        setProfile(updated);
        storage.updateUser(updated);
        window.dispatchEvent(new Event('cs_user_changed'));
        setNewSkillName('');
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const response = await fetch('/api/user/skills/' + encodeURIComponent(skillId), { method: 'DELETE' });
      if (!response.ok) throw new Error('Skill deletion failed');
      const updatedSkills = (profile.skills || []).filter((s: any) => (typeof s === 'string' ? s !== skillId : s.id !== skillId && s.name !== skillId));
      const updated = { ...profile, skills: updatedSkills };
      setProfile(updated);
      storage.updateUser(updated);
      window.dispatchEvent(new Event('cs_user_changed'));
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesignation.trim() || !newExpOrg.trim()) return;
    setIsSavingExp(true);
    try {
      const res = await fetch('/api/user/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designation: newExpDesignation.trim(),
          organization: newExpOrg.trim(),
          startDate: newExpStartDate,
          endDate: newExpIsCurrent ? '' : newExpEndDate,
          isCurrent: newExpIsCurrent,
          responsibilities: newExpResponsibilities.trim()
        })
      });
      if (res.ok) {
        const d = await res.json();
        const updatedExp = d.data || [...(profile.experiences || []), {
          id: 'exp_' + Date.now(),
          designation: newExpDesignation.trim(),
          organization: newExpOrg.trim(),
          startDate: newExpStartDate,
          endDate: newExpIsCurrent ? '' : newExpEndDate,
          isCurrent: newExpIsCurrent,
          responsibilities: newExpResponsibilities.trim()
        }];
        const updated = { ...profile, experiences: updatedExp };
        setProfile(updated);
        storage.updateUser(updated);
        window.dispatchEvent(new Event('cs_user_changed'));
        setNewExpDesignation('');
        setNewExpOrg('');
        setNewExpStartDate('');
        setNewExpEndDate('');
        setNewExpResponsibilities('');
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to add experience:', err);
    } finally {
      setIsSavingExp(false);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    try {
      const response = await fetch('/api/user/experience/' + encodeURIComponent(expId), { method: 'DELETE' });
      if (!response.ok) throw new Error('Experience deletion failed');
      const updatedExp = (profile.experiences || []).filter((e: any) => e.id !== expId);
      const updated = { ...profile, experiences: updatedExp };
      setProfile(updated);
      storage.updateUser(updated);
      window.dispatchEvent(new Event('cs_user_changed'));
    } catch (err) {
      console.error('Failed to delete experience:', err);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    try {
      const payload = {
        preferredCategories: prefCategories,
        preferredOrgTypes: prefOrgTypes,
        preferredDivisions: prefDivisions,
        preferredSalaryMin: prefSalaryMin ? Number(prefSalaryMin) : undefined
      };
      const res = await fetch('/api/user/career-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = { ...profile, careerPreferences: { ...(profile.careerPreferences || {}), ...payload } as any };
        setProfile(updated);
        storage.updateUser(updated);
        window.dispatchEvent(new Event('cs_user_changed'));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save career preferences:', err);
    } finally {
      setIsSavingPrefs(false);
    }
  };


  if (!isLoaded) {
    return (
      <div className="space-y-6 max-w-5xl animate-pulse" suppressHydrationWarning>
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-700" />
              <span>স্মার্ট ক্যান্ডিডেট প্রোফাইল</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              এখানে একবার আপনার সঠিক তথ্য সংরক্ষণ করুন। যেকোনো সরকারি বা ব্যাংক চাকরিতে আবেদনের সময় ডেটা স্বয়ংক্রিয়ভাবে ফিল হবে।
            </p>
          </div>
        </div>

        {/* Profile Section Tabs Skeleton */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <div className="h-9 w-40 bg-emerald-100/70 rounded-xl"></div>
          <div className="h-9 w-36 bg-slate-100 rounded-xl"></div>
          <div className="h-9 w-36 bg-slate-100 rounded-xl"></div>
        </div>

        {/* Form Grid Skeleton */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>

          {/* Address Fields Skeleton */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="h-5 w-56 bg-slate-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-36 bg-slate-200 rounded"></div>
                  <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <div className="h-11 w-44 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-700" />
            <span>স্মার্ট ক্যান্ডিডেট প্রোফাইল</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            এখানে একবার আপনার সঠিক তথ্য সংরক্ষণ করুন। যেকোনো সরকারি বা ব্যাংক চাকরিতে আবেদনের সময় ডেটা স্বয়ংক্রিয়ভাবে ফিল হবে।
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
          </div>
        )}
      </div>

      {/* Profile Section Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'personal'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ব্যক্তিগত তথ্য
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'education'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          শিক্ষাগত যোগ্যতা ({profile.education.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            activeTab === 'skills'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>দক্ষতা ও স্কিলস ({(profile.skills || []).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            activeTab === 'experience'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>অভিজ্ঞতা ({(profile.experiences || []).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            activeTab === 'preferences'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>ক্যারিয়ার পছন্দ</span>
        </button>
        <button
          onClick={() => setActiveTab('quota')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quota'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          কোটা সুবিধা
        </button>
      </div>

      {/* Tab 1: Personal Information */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6" suppressHydrationWarning>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পূর্ণ নাম (ইংরেজি ক্যাপিটাল লেটার)</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পূর্ণ নাম (বাংলায়)</label>
              <input
                type="text"
                value={profile.nameBn}
                onChange={(e) => setProfile({ ...profile, nameBn: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পিতার নাম (ইংরেজি ক্যাপিটাল)</label>
              <input
                type="text"
                value={profile.fatherName}
                onChange={(e) => setProfile({ ...profile, fatherName: e.target.value.toUpperCase() })}
                placeholder="MD. ABDUR RAHMAN"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পিতার নাম (বাংলায়)</label>
              <input
                type="text"
                value={profile.fatherNameBn || ''}
                onChange={(e) => setProfile({ ...profile, fatherNameBn: e.target.value })}
                placeholder="মোঃ আব্দুর রহমান"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">মাতার নাম (ইংরেজি ক্যাপিটাল)</label>
              <input
                type="text"
                value={profile.motherName}
                onChange={(e) => setProfile({ ...profile, motherName: e.target.value.toUpperCase() })}
                placeholder="FATEMA BEGUM"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">মাতার নাম (বাংলায়)</label>
              <input
                type="text"
                value={profile.motherNameBn || ''}
                onChange={(e) => setProfile({ ...profile, motherNameBn: e.target.value })}
                placeholder="মোসাঃ ফাতেমা বেগম"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">জন্ম তারিখ (YYYY-MM-DD)</label>
              <input
                type="date"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">প্রার্থীর জাতীয় পরিচয়পত্র (NID / Smart Card)</label>
              <input
                type="text"
                value={profile.nid}
                onChange={(e) => setProfile({ ...profile, nid: e.target.value })}
                placeholder="10, 13 বা 17 ডিজিটের NID নম্বর"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">পিতার NID নম্বর (ঐচ্ছিক / ভেরিফিকেশন সহায়ক)</label>
              <input
                type="text"
                value={profile.fatherNid && !profile.fatherNid.startsWith('/') && !profile.fatherNid.startsWith('http') ? profile.fatherNid : ''}
                onChange={(e) => setProfile({ ...profile, fatherNid: e.target.value })}
                placeholder="১০, ১৩ বা ১৭ ডিজিটের NID নম্বর"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">মাতার NID নম্বর (ঐচ্ছিক / ভেরিফিকেশন সহায়ক)</label>
              <input
                type="text"
                value={profile.motherNid && !profile.motherNid.startsWith('/') && !profile.motherNid.startsWith('http') ? profile.motherNid : ''}
                onChange={(e) => setProfile({ ...profile, motherNid: e.target.value })}
                placeholder="১০, ১৩ বা ১৭ ডিজিটের NID নম্বর"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">মোবাইল নম্বর (এসএমএস প্রাপ্তির জন্য)</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">নিজ জেলা (Home District — কোটা ও যোগ্যতায় জরুরি)</label>
                <button
                  type="button"
                  onClick={() => setHomeDistrictCustomMode(!homeDistrictCustomMode)}
                  className="text-[11px] text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  {homeDistrictCustomMode ? '৬৪ জেলার তালিকা থেকে বাছুন' : 'অন্যান্য / কাস্টম জেলা লিখুন'}
                </button>
              </div>
              {homeDistrictCustomMode ? (
                <input
                  type="text"
                  value={profile.district}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  placeholder="যেমন: ঢাকা, বগুড়া, নোয়াখালী..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  required
                />
              ) : (
                <select
                  value={profile.district}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setHomeDistrictCustomMode(true);
                      setProfile({ ...profile, district: '' });
                    } else {
                      setProfile({ ...profile, district: e.target.value });
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-emerald-600/30 outline-none cursor-pointer"
                >
                  {getAllDistrictsList().map(d => (
                    <option key={d.en} value={d.bn}>{d.bn} ({d.en}) — {d.division}</option>
                  ))}
                  <option value="__custom__">➕ অন্যান্য (কাস্টম জেলা লিখুন)...</option>
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">লিঙ্গ (Gender)</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
              >
                <option value="male">পুরুষ (Male)</option>
                <option value="female">নারী (Female)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">বৈবাহিক অবস্থা (Marital Status)</label>
              <select
                value={profile.maritalStatus || 'single'}
                onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
              >
                <option value="single">অবিবাহিত (Single)</option>
                <option value="married">বিবাহিত (Married)</option>
                <option value="other">অন্যান্য (Other)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">ধর্ম (Religion)</label>
              <select
                value={(profile as any).religion || 'ইসলাম'}
                onChange={(e) => setProfile({ ...profile, religion: e.target.value } as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
              >
                <option value="ইসলাম">ইসলাম (Islam)</option>
                <option value="হিন্দু">হিন্দু (Hinduism)</option>
                <option value="বৌদ্ধ">বৌদ্ধ (Buddhism)</option>
                <option value="খ্রিস্টান">খ্রিস্টান (Christianity)</option>
                <option value="অন্যান্য">অন্যান্য (Other)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">জাতীয়তা (Nationality)</label>
              <input
                type="text"
                value={profile.nationality || 'বাংলাদেশি (Bangladeshi)'}
                onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
              />
            </div>

            {/* STRUCTURED PRESENT & PERMANENT ADDRESS SECTION (TELETALK & GOVT/BANK ENGLISH STANDARD) */}
            <div className="col-span-1 md:col-span-2 space-y-5 pt-3">
              
              {/* 1. Present Address Card (Clean Header without Icons or Subtitle) */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="pb-3 border-b border-slate-200/80">
                  <h4 className="font-bold text-sm text-slate-900">বর্তমান ঠিকানা (Present Address — English Standard)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Row 1 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">অভিভাবক / পিতা (Care Of — English)</label>
                    <input
                      type="text"
                      value={presentCareOf}
                      onChange={(e) => setPresentCareOf(e.target.value.toUpperCase())}
                      placeholder="e.g. MD. RAFIQUL ISLAM"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">গ্রাম / রোড / বাসা (Village / Road — English)</label>
                    <input
                      type="text"
                      value={presentVillageRoad}
                      onChange={(e) => setPresentVillageRoad(e.target.value.toUpperCase())}
                      placeholder="e.g. HOUSE 12, ROAD 5, MIRPUR-10"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 uppercase font-mono"
                      required
                    />
                  </div>

                  {/* Row 2: Division & District */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">বিভাগ (Division — English)</label>
                      <button
                        type="button"
                        onClick={() => setPresentCustomDivisionMode(!presentCustomDivisionMode)}
                        className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        {presentCustomDivisionMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম বিভাগ'}
                      </button>
                    </div>
                    {presentCustomDivisionMode ? (
                      <input
                        type="text"
                        value={presentDivision}
                        onChange={(e) => setPresentDivision(e.target.value.toUpperCase())}
                        placeholder="e.g. DHAKA"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600/30 outline-none"
                      />
                    ) : (
                      <select
                        value={presentDivision}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setPresentCustomDivisionMode(true);
                          } else {
                            handlePresentDivisionChange(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 cursor-pointer font-bold"
                      >
                        {BD_DIVISIONS_EN.map((div) => (
                          <option key={div} value={div}>
                            {div} ({BD_DIVISIONS_MAP[div]?.bn || div})
                          </option>
                        ))}
                        <option value="__custom__">➕ OTHER (TYPE CUSTOM DIVISION)...</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">জেলা (District — English)</label>
                      <button
                        type="button"
                        onClick={() => setPresentCustomDistrictMode(!presentCustomDistrictMode)}
                        className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        {presentCustomDistrictMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম জেলা'}
                      </button>
                    </div>
                    {presentCustomDistrictMode ? (
                      <input
                        type="text"
                        value={presentDistrict}
                        onChange={(e) => setPresentDistrict(e.target.value.toUpperCase())}
                        placeholder="e.g. DHAKA"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600/30 outline-none"
                      />
                    ) : (
                      <select
                        value={presentDistrict}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setPresentCustomDistrictMode(true);
                          } else {
                            handlePresentDistrictChange(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 cursor-pointer font-bold"
                      >
                        {getDistrictsForDivision(presentDivision).map((d) => (
                          <option key={d.en} value={d.en}>
                            {d.en} ({d.bn})
                          </option>
                        ))}
                        <option value="__custom__">➕ OTHER (TYPE CUSTOM DISTRICT)...</option>
                      </select>
                    )}
                  </div>

                  {/* Row 3: Upazila / Thana & Post Office / Code */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">উপজেলা / থানা (Upazila / Thana — English)</label>
                      <button
                        type="button"
                        onClick={() => setPresentCustomThanaMode(!presentCustomThanaMode)}
                        className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        {presentCustomThanaMode ? 'তালিকা থেকে বাছুন' : 'অন্যান্য / কাস্টম লিখুন'}
                      </button>
                    </div>

                    {presentCustomThanaMode ? (
                      <input
                        type="text"
                        value={presentThana}
                        onChange={(e) => setPresentThana(e.target.value.toUpperCase())}
                        placeholder="e.g. MIRPUR"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 uppercase font-mono"
                        required
                      />
                    ) : (
                      <select
                        value={presentThana}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setPresentCustomThanaMode(true);
                          } else {
                            setPresentThana(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 cursor-pointer font-bold"
                      >
                        {getUpazilasForDistrict(presentDistrict).map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                        <option value="__custom__">➕ OTHER (TYPE CUSTOM)...</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">ডাকঘর ও পোস্ট কোড (Post Office & Code)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={presentPostOffice}
                        onChange={(e) => setPresentPostOffice(e.target.value.toUpperCase())}
                        placeholder="e.g. MIRPUR"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 uppercase font-mono"
                      />
                      <input
                        type="text"
                        value={presentPostCode}
                        onChange={(e) => setPresentPostCode(e.target.value)}
                        placeholder="e.g. 1216"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Permanent Address Card (Clean Header without Icons or Subtitle) */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">স্থায়ী ঠিকানা (Permanent Address — English Standard)</h4>
                  </div>

                  {/* 1-Click Same as Present Checkbox */}
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl cursor-pointer transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={sameAsPresent}
                      onChange={(e) => setSameAsPresent(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-700"
                    />
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                      <span>✓ SAME AS PRESENT (বর্তমান ঠিকানার মতোই একই)</span>
                    </span>
                  </label>
                </div>

                {sameAsPresent ? (
                  <div className="p-3.5 bg-white border border-dashed border-emerald-300 rounded-xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-medium">
                        স্থায়ী ঠিকানা হিসেবে বর্তমান ঠিকানা স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে: <strong className="font-bold text-slate-900 font-mono">{presentVillageRoad || 'VILLAGE/ROAD'}, {presentThana || 'THANA'}, {presentDistrict}, {presentDivision}-{presentPostCode || 'CODE'}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full shrink-0">
                      ✓ AUTO-SYNCED
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fadeIn">
                    {/* Row 1 */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">অভিভাবক / পিতা (Care Of — English)</label>
                      <input
                        type="text"
                        value={permanentCareOf}
                        onChange={(e) => setPermanentCareOf(e.target.value.toUpperCase())}
                        placeholder="e.g. MD. RAFIQUL ISLAM"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 uppercase font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">গ্রাম / রোড / বাসা (Village / Road — English)</label>
                      <input
                        type="text"
                        value={permanentVillageRoad}
                        onChange={(e) => setPermanentVillageRoad(e.target.value.toUpperCase())}
                        placeholder="e.g. PERMANENT VILLAGE / ROAD"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 uppercase font-mono"
                      />
                    </div>

                    {/* Row 2: Division & District */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">স্থায়ী বিভাগ (Division — English)</label>
                        <button
                          type="button"
                          onClick={() => setPermanentCustomDivisionMode(!permanentCustomDivisionMode)}
                          className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          {permanentCustomDivisionMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম বিভাগ'}
                        </button>
                      </div>
                      {permanentCustomDivisionMode ? (
                        <input
                          type="text"
                          value={permanentDivision}
                          onChange={(e) => setPermanentDivision(e.target.value.toUpperCase())}
                          placeholder="e.g. DHAKA"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600/30 outline-none"
                        />
                      ) : (
                        <select
                          value={permanentDivision}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setPermanentCustomDivisionMode(true);
                            } else {
                              handlePermanentDivisionChange(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 cursor-pointer font-bold"
                        >
                          {BD_DIVISIONS_EN.map((div) => (
                            <option key={div} value={div}>
                              {div} ({BD_DIVISIONS_MAP[div]?.bn || div})
                            </option>
                          ))}
                          <option value="__custom__">➕ OTHER (TYPE CUSTOM DIVISION)...</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">স্থায়ী জেলা (District — English)</label>
                        <button
                          type="button"
                          onClick={() => setPermanentCustomDistrictMode(!permanentCustomDistrictMode)}
                          className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          {permanentCustomDistrictMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম জেলা'}
                        </button>
                      </div>
                      {permanentCustomDistrictMode ? (
                        <input
                          type="text"
                          value={permanentDistrict}
                          onChange={(e) => setPermanentDistrict(e.target.value.toUpperCase())}
                          placeholder="e.g. DHAKA"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600/30 outline-none"
                        />
                      ) : (
                        <select
                          value={permanentDistrict}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setPermanentCustomDistrictMode(true);
                            } else {
                              handlePermanentDistrictChange(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 cursor-pointer font-bold"
                        >
                          {getDistrictsForDivision(permanentDivision).map((d) => (
                            <option key={d.en} value={d.en}>
                              {d.en} ({d.bn})
                            </option>
                          ))}
                          <option value="__custom__">➕ OTHER (TYPE CUSTOM DISTRICT)...</option>
                        </select>
                      )}
                    </div>

                    {/* Row 3: Auto-selected Upazila & Post Office / Code */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">স্থায়ী উপজেলা / থানা (Upazila / Thana — English)</label>
                        <button
                          type="button"
                          onClick={() => setPermanentCustomThanaMode(!permanentCustomThanaMode)}
                          className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          {permanentCustomThanaMode ? 'তালিকা থেকে বাছুন' : 'অন্যান্য / কাস্টম লিখুন'}
                        </button>
                      </div>

                      {permanentCustomThanaMode ? (
                        <input
                          type="text"
                          value={permanentThana}
                          onChange={(e) => setPermanentThana(e.target.value.toUpperCase())}
                          placeholder="e.g. MIRPUR"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 uppercase font-mono"
                        />
                      ) : (
                        <select
                          value={permanentThana}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setPermanentCustomThanaMode(true);
                            } else {
                              setPermanentThana(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 cursor-pointer font-bold"
                        >
                          {getUpazilasForDistrict(permanentDistrict).map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                          <option value="__custom__">➕ OTHER (TYPE CUSTOM)...</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">ডাকঘর ও পোস্ট কোড (Post Office & Code)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={permanentPostOffice}
                          onChange={(e) => setPermanentPostOffice(e.target.value.toUpperCase())}
                          placeholder="e.g. MIRPUR"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 uppercase font-mono"
                        />
                        <input
                          type="text"
                          value={permanentPostCode}
                          onChange={(e) => setPermanentPostCode(e.target.value)}
                          placeholder="e.g. 1216"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>প্রোফাইল তথ্য সেভ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Education CRUD */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              সর্বনিম্ন এসএসসি থেকে শুরু করে আপনার সর্বোচ্চ ডিগ্রি যুক্ত করুন:
            </span>
            <button
              onClick={() => setShowEduModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন শিক্ষাগত যোগ্যতা যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {profile.education.map((edu, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {edu.level}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{edu.degree}</span>
                    {edu.verificationStatus === 'VERIFIED' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        ✓ যাচাইকৃত
                      </span>
                    )}
                    {edu.verificationStatus === 'NEEDS_CORRECTION' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        সংশোধন প্রয়োজন
                      </span>
                    )}
                    {edu.verificationStatus === 'REJECTED' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        বাতিল
                      </span>
                    )}
                    {edu.verificationStatus === 'PENDING_REVIEW' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        যাচাই অপেক্ষমান
                      </span>
                    )}
                  </div>
                  {edu.verificationRemarks && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 mt-1 inline-block">
                      ভেরিফিকেশন মন্তব্য: {edu.verificationRemarks}
                    </div>
                  )}
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 pt-1">
                    <span>প্রতিষ্ঠান/বোর্ড: <strong>{edu.boardOrUni}</strong></span>
                    <span>•</span>
                    <span>রোল: {edu.roll}</span>
                    <span>•</span>
                    <span>পাস: {edu.year}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">ফলাফল: {edu.result}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteEducation(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors self-end sm:self-center"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Education Modal */}
          {showEduModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-base text-slate-900">শিক্ষাগত রেকর্ড যুক্ত করুন</h3>
                  <button onClick={() => setShowEduModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleAddEducation} className="space-y-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">পর্যায় (Level)</label>
                      <button
                        type="button"
                        onClick={() => setEduCustomLevelMode(!eduCustomLevelMode)}
                        className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        {eduCustomLevelMode ? 'তালিকা থেকে বাছুন' : 'কাস্টম পর্যায় লিখুন'}
                      </button>
                    </div>
                    {eduCustomLevelMode ? (
                      <input
                        type="text"
                        value={eduLevel}
                        onChange={(e) => setEduLevel(e.target.value)}
                        placeholder="যেমন: ও-লেভেল, এ-লেভেল, ডিপ্লোমা ఇన్ নার্সিং..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none"
                        required
                      />
                    ) : (
                      <select
                        value={eduLevel}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setEduCustomLevelMode(true);
                            setEduLevel('');
                          } else {
                            setEduLevel(e.target.value);
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none cursor-pointer"
                      >
                        <option value="জেএসসি (JSC) / জেডিসি (JDC)">জেএসসি (JSC) / জেডিসি (JDC) / ৮ম শ্রেণি</option>
                        <option value="মাধ্যমিক (SSC)">মাধ্যমিক (SSC) / দাখিল</option>
                        <option value="উচ্চ মাধ্যমিক (HSC)">উচ্চ মাধ্যমিক (HSC) / আলিম</option>
                        <option value="ডিপ্লোমা ইন ইঞ্জিনিয়ারিং">ডিপ্লোমা ইন ইঞ্জিনিয়ারিং / কারিগরি / মেডিকেল</option>
                        <option value="ডিগ্রি (পাস কোর্স)">ডিগ্রি (পাস কোর্স) - ৩ বছর মেয়াদী</option>
                        <option value="স্নাতক (অনার্স)">স্নাতক (অনার্স) / সমমান - ৪ বছর মেয়াদী</option>
                        <option value="স্নাতকোত্তর (মাস্টার্স)">স্নাতকোত্তর (মাস্টার্স) / কামিল</option>
                        <option value="উচ্চতর গবেষণা (এমফিল / পিএইচডি)">উচ্চতর গবেষণা (এমফিল / পিএইচডি)</option>
                        <option value="__custom__">➕ অন্যান্য / কাস্টম শিক্ষাগত পর্যায় লিখুন...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ডিগ্রির নাম ও বিষয় (যেমন: বিএসসি ইন সিএসই)</label>
                    <input
                      type="text"
                      placeholder="যেমন: বিএসসি ইন কম্পিউটার সায়েন্স"
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">বোর্ড / বিশ্ববিদ্যালয়</label>
                      <input
                        type="text"
                        placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                        value={eduBoard}
                        onChange={(e) => setEduBoard(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">পাসের বছর</label>
                      <input
                        type="text"
                        value={eduYear}
                        onChange={(e) => setEduYear(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">রোল নম্বর</label>
                      <input
                        type="text"
                        placeholder="180214"
                        value={eduRoll}
                        onChange={(e) => setEduRoll(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">রেজিস্ট্রেশন</label>
                      <input
                        type="text"
                        placeholder="201755123"
                        value={eduReg}
                        onChange={(e) => setEduReg(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">GPA / CGPA</label>
                      <input
                        type="text"
                        placeholder="৩.৫০"
                        value={eduResult}
                        onChange={(e) => setEduResult(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEduModal(false)}
                      className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Quota Information */}
      {activeTab === 'quota' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">কোটা ও বিশেষ সুবিধা যাচাই</h3>
            <p className="text-xs text-slate-500">
              সরকারি চাকরিতে বয়সসীমা ও সংরক্ষিত কোটা সুবিধার জন্য প্রযোজ্য অপশনটি নির্বাচন করুন। সঠিক প্রমাণ ছাড়া কোটা ক্লেইম করা দণ্ডনীয় অপরাধ।
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={!profile.quota || profile.quota === 'none'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'none' as any, quotaDetails: '' };
                  syncProfileToServer(u);
                }}
                className="text-emerald-700"
              />
              <div>
                <strong className="text-slate-800 block">সাধারণ প্রার্থী (কোনো কোটা প্রযোজ্য নয়)</strong>
                <span className="text-slate-500">বয়সসীমা সাধারণ নিয়মে ১৮ হতে ৩০ বছর পর্যন্ত।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={profile.quota === 'freedom_fighter'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'freedom_fighter' as any };
                  syncProfileToServer(u);
                }}
                className="text-emerald-700"
              />
              <div>
                <strong className="text-slate-800 block">বীর মুক্তিযোদ্ধা / শহীদ মুক্তিযোদ্ধার সন্তান কোটা</strong>
                <span className="text-slate-500">সরকারি নিয়মে আবেদনের বয়সসীমা ৩২ বছর পর্যন্ত কার্যকর হবে।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={profile.quota === 'disabled'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'disabled' as any };
                  syncProfileToServer(u);
                }}
                className="text-emerald-700"
              />
              <div>
                <strong className="text-slate-800 block">শারীরিক প্রতিবন্ধী প্রার্থী কোটা</strong>
                <span className="text-slate-500">সমাজসেবা অধিদপ্তর কর্তৃক প্রদত্ত প্রতিবন্ধী পরিচয়পত্র থাকতে হবে (বয়স ৩২ বছর)।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={(profile.quota as any) === 'tribal'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'tribal' as any };
                  syncProfileToServer(u);
                }}
                className="text-emerald-700"
              />
              <div>
                <strong className="text-slate-800 block">ক্ষুদ্র নৃ-গোষ্ঠী / আদিবাসী কোটা</strong>
                <span className="text-slate-500">জেলা প্রশাসক বা সার্কেল চিফ কর্তৃক প্রদত্ত আদিবাসী সনদপত্র থাকতে হবে (বয়স ৩২ বছর)।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={(profile.quota as any) === 'ansar'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'ansar' as any };
                  syncProfileToServer(u);
                }}
                className="text-emerald-700"
              />
              <div>
                <strong className="text-slate-800 block">আনসার ও গ্রাম প্রতিরক্ষা বাহিনী (Ansar & VDP) কোটা</strong>
                <span className="text-slate-500">আনসার ও ভিডিপি মৌলিক প্রশিক্ষণ সনদপত্রধারী প্রার্থীরা প্রযোজ্য হবেন।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={(profile.quota as any) === 'orphan'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'orphan' as any };
                  syncProfileToServer(u);
                }}
                className="text-emerald-700"
              />
              <div>
                <strong className="text-slate-800 block">এতিম ও সমাজসেবা অধিদপ্তর নিবন্ধিত নিবাসী কোটা</strong>
                <span className="text-slate-500">সরকারি বা অনুমোদিত শিশু পরিবারের নিবাসী প্রার্থীরা প্রযোজ্য হবেন।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={(profile.quota as any) === 'ward'}
                onChange={() => {
                  setCustomQuotaMode(false);
                  const u = { ...profile, quota: 'ward' as any };
                  syncProfileToServer(u);
                }}
                className="text-emerald-700"
              />
              <div>
                <strong className="text-slate-800 block">পোষ্য / বিভাগীয় প্রার্থী কোটা (Departmental / Ward Quota)</strong>
                <span className="text-slate-500">সংশ্লিষ্ট প্রতিষ্ঠান/মন্ত্রণালয়ে কর্মরত চাকরিজীবীদের সন্তানদের ক্ষেত্রে প্রযোজ্য।</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="quota"
                checked={customQuotaMode || (profile.quota as any) === 'custom'}
                onChange={() => {
                  setCustomQuotaMode(true);
                  const u = { ...profile, quota: 'custom' as any };
                  syncProfileToServer(u);
                }}
                className="text-emerald-700"
              />
              <div className="flex-1">
                <strong className="text-slate-800 block">অন্যান্য / কাস্টম কোটা (Custom Quota)</strong>
                <span className="text-slate-500">অন্যান্য বিশেষ কোটা সুবিধা থাকলে নিজে নাম লিখে উল্লেখ করুন।</span>
                {(customQuotaMode || (profile.quota as any) === 'custom') && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customQuotaTitle || (profile as any).customQuotaName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomQuotaTitle(val);
                        const u = { ...profile, quota: 'custom' as any, customQuotaName: val };
                        syncProfileToServer(u);
                      }}
                      placeholder="কাস্টম কোটার নাম লিখুন (যেমন: ক্রীড়াবিদ কোটা, রেলওয়ে পোষ্য কোটা...)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Tab: Skills Management */}
      {activeTab === 'skills' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-700" />
              <span>প্রফেশনাল ও টেকনিক্যাল স্কিলস (Skills & Competencies)</span>
            </h3>
            <p className="text-xs text-slate-500">
              স্মার্ট জব ম্যাচিংয়ে নির্ভুল রিকমেন্ডেশন পেতে আপনার অর্জিত দক্ষতা ও দক্ষতা স্তর নির্বাচন করুন।
            </p>
          </div>

          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">নতুন স্কিল যুক্ত করুন</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">দক্ষতার নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: এমএস এক্সেল, পাইথন, জাভাস্ক্রিপ্ট, অ্যাকাউন্টিং..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">দক্ষতা স্তর (Proficiency)</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                >
                  <option value="BEGINNER">প্রাথমিক (Beginner)</option>
                  <option value="INTERMEDIATE">মাঝারি (Intermediate)</option>
                  <option value="ADVANCED">উন্নত (Advanced)</option>
                  <option value="EXPERT">বিশেষজ্ঞ (Expert)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="hidden sm:flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-bold">জনপ্রিয় স্কিল:</span>
                {['এমএস এক্সেল', 'জাভাস্ক্রিপ্ট', 'পাইথন', 'অ্যাকাউন্টিং', 'ইংরেজি টাইপিং', 'গ্রাফিক ডিজাইন'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewSkillName(s)}
                    className="px-2 py-0.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-700 font-semibold"
                  >
                    + {s}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSavingSkill || !newSkillName.trim()}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSavingSkill ? 'যোগ হচ্ছে...' : 'স্কিল যোগ করুন'}</span>
              </button>
            </div>
          </form>

          {/* Current Skills List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800">সংরক্ষিত দক্ষতা তালিকা ({(profile.skills || []).length} টি)</h4>
            {(profile.skills || []).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                এখনও কোনো স্কিল যোগ করা হয়নি। উপরের ফরম থেকে আপনার দক্ষতা যোগ করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(profile.skills || []).map((s: any, idx: number) => {
                  const sName = typeof s === 'string' ? s : s.name;
                  const sId = typeof s === 'string' ? s : (s.id || s.name);
                  const sProf = typeof s === 'string' ? 'INTERMEDIATE' : (s.proficiency || 'INTERMEDIATE');

                  let profBadge = 'bg-slate-100 text-slate-700';
                  let profLabel = 'মাঝারি';
                  if (sProf === 'EXPERT') { profBadge = 'bg-purple-50 text-purple-700 border-purple-200'; profLabel = 'বিশেষজ্ঞ'; }
                  else if (sProf === 'ADVANCED') { profBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200'; profLabel = 'উন্নত'; }
                  else if (sProf === 'BEGINNER') { profBadge = 'bg-amber-50 text-amber-700 border-amber-200'; profLabel = 'প্রাথমিক'; }

                  return (
                    <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                      <div className="space-y-1 truncate">
                        <div className="font-bold text-xs text-slate-900 truncate">{sName}</div>
                        <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold border ${profBadge}`}>
                          {profLabel}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(sId)}
                        title="মুছুন"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Work Experience */}
      {activeTab === 'experience' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-700" />
              <span>কাজের অভিজ্ঞতা (Employment & Work Experience)</span>
            </h3>
            <p className="text-xs text-slate-500">
              আপনার পূর্ববর্তী বা বর্তমান চাকরির তথ্য যোগ করুন। ফ্রেশার প্রার্থীদের ক্ষেত্রে এটি পূরণ করা বাধ্যতামূলক নয়।
            </p>
          </div>

          {/* Add Experience Form */}
          <form onSubmit={handleAddExperience} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">নতুন কাজের অভিজ্ঞতা যুক্ত করুন</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">পদবী (Designation)</label>
                <input
                  type="text"
                  placeholder="যেমন: সহকারী কর্মকর্তা, সফটওয়্যার ডেভেলপার..."
                  value={newExpDesignation}
                  onChange={(e) => setNewExpDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">প্রতিষ্ঠান বা কোম্পানির নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: রূপালী ব্যাংক লিমিটেড, গ্রামীণফোন..."
                  value={newExpOrg}
                  onChange={(e) => setNewExpOrg(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">শুরুর তারিখ (Start Date)</label>
                <input
                  type="date"
                  value={newExpStartDate}
                  onChange={(e) => setNewExpStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">শেষের তারিখ (End Date)</label>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExpIsCurrent}
                      onChange={(e) => setNewExpIsCurrent(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                    <span>বর্তমানে কর্মরত</span>
                  </label>
                </div>
                <input
                  type="date"
                  disabled={newExpIsCurrent}
                  value={newExpEndDate}
                  onChange={(e) => setNewExpEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white disabled:bg-slate-100 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">সংক্ষিপ্ত দায়িত্ব বা ভূমিকা (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="আপনার প্রধান কাজ বা দায়িত্ব সংক্ষেপে লিখুন..."
                  value={newExpResponsibilities}
                  onChange={(e) => setNewExpResponsibilities(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSavingExp || !newExpDesignation.trim() || !newExpOrg.trim()}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSavingExp ? 'সংরক্ষণ হচ্ছে...' : 'অভিজ্ঞতা যোগ করুন'}</span>
              </button>
            </div>
          </form>

          {/* Current Experience List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800">সংরক্ষিত অভিজ্ঞতার তালিকা ({(profile.experiences || []).length} টি)</h4>
            {(profile.experiences || []).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                কোনো কাজের অভিজ্ঞতা যুক্ত নেই। প্রযোজ্য হলে উপরের ফর্ম ব্যবহার করে অভিজ্ঞতা যোগ করুন।
              </div>
            ) : (
              <div className="space-y-3">
                {(profile.experiences || []).map((exp: any) => (
                  <div key={exp.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900">{exp.designation}</div>
                      <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                        <span>{exp.organization}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          {exp.startDate || 'N/A'} হতে {exp.isCurrent ? 'বর্তমান পর্যন্ত' : (exp.endDate || 'N/A')}
                        </span>
                      </div>
                      {exp.responsibilities && (
                        <p className="text-xs text-slate-500 pt-1 leading-relaxed">{exp.responsibilities}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      title="মুছুন"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Career Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-700" />
              <span>ক্যারিয়ার ও কর্মসংস্থান অগ্রাধিকার (Career Preferences)</span>
            </h3>
            <p className="text-xs text-slate-500">
              আপনার পছন্দের ক্যাটাগরি, প্রতিষ্ঠানের ধরন এবং প্রত্যাশিত বেতন নির্ধারণ করুন যাতে স্মার্ট ম্যাচিং ইঞ্জিন প্রাসঙ্গিক চাকরিগুলোকে তালিকার শীর্ষে প্রদর্শন করতে পারে।
            </p>
          </div>

          <div className="space-y-5 text-xs">
            {/* Preferred Categories */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">পছন্দের চাকরির ক্ষেত্র বা ক্যাটাগরি (একাধিক নির্বাচনযোগ্য)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'govt', label: 'সরকারি চাকরি' },
                  { id: 'bank', label: 'ব্যাংক ও আর্থিক' },
                  { id: 'teacher', label: 'শিক্ষক নিয়োগ' },
                  { id: 'defense', label: 'প্রতিরক্ষা ও বাহিনী' },
                  { id: 'railway', label: 'বাংলাদেশ রেলওয়ে' },
                  { id: 'ngo', label: 'এনজিও ও উন্নয়ন' },
                  { id: 'private', label: 'প্রাইভেট ও কর্পোরেট' },
                  { id: 'engineer', label: 'প্রকৌশল ও কারিগরি' }
                ].map((cat) => {
                  const isChecked = prefCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={`p-3 rounded-xl border cursor-pointer font-bold transition-all flex items-center gap-2 ${
                        isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setPrefCategories([...prefCategories, cat.id]);
                          else setPrefCategories(prefCategories.filter(c => c !== cat.id));
                        }}
                        className="accent-emerald-600 rounded"
                      />
                      <span>{cat.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Preferred Org Types */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">পছন্দের প্রতিষ্ঠানের ধরন</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'government', label: 'সরকারি প্রতিষ্ঠান' },
                  { id: 'bank', label: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান' },
                  { id: 'autonomous', label: 'স্বায়ত্তশাসিত সংস্থা' },
                  { id: 'ngo', label: 'এনজিও ও আন্তর্জাতিক সংস্থা' },
                  { id: 'private_company', label: 'প্রাইভেট ও করপোরেট কোম্পানি' },
                  { id: 'multinational', label: 'মাল্টিন্যাশনাল কোম্পানি' }
                ].map((org) => {
                  const isChecked = prefOrgTypes.includes(org.id);
                  return (
                    <label
                      key={org.id}
                      className={`p-3 rounded-xl border cursor-pointer font-bold transition-all flex items-center gap-2 ${
                        isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setPrefOrgTypes([...prefOrgTypes, org.id]);
                          else setPrefOrgTypes(prefOrgTypes.filter(o => o !== org.id));
                        }}
                        className="accent-emerald-600 rounded"
                      />
                      <span>{org.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Preferred Divisions & Minimum Salary */}
            {/* Professional Summary & Career Objectives (Matches Admin 360 Workspace) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">ক্যারিয়ার উদ্দেশ্য (Career Objective)</label>
                <textarea
                  rows={2}
                  placeholder="যেমন: সরকারি বা স্বায়ত্তশাসিত প্রতিষ্ঠানে আইসিটি বা সাধারণ প্রশাসনিক পদে দায়িত্বশীল ভূমিকা পালন করা..."
                  value={profile.careerObjective || ''}
                  onChange={(e) => setProfile({ ...profile, careerObjective: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">পেশাগত সারসংক্ষেপ (Professional Summary)</label>
                <textarea
                  rows={2}
                  placeholder="আপনার পূর্ববর্তী কাজের অভিজ্ঞতা বা সামগ্রিক দক্ষতার সংক্ষিপ্ত বিবরণ..."
                  value={profile.professionalSummary || ''}
                  onChange={(e) => setProfile({ ...profile, professionalSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">বর্তমান পদবি (Current Position — যদি থাকে)</label>
                <input
                  type="text"
                  placeholder="যেমন: কম্পিউটার অপারেটর / ডাটা এন্ট্রি অ্যাসিস্ট্যান্ট"
                  value={profile.currentPosition || ''}
                  onChange={(e) => setProfile({ ...profile, currentPosition: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">বর্তমান প্রতিষ্ঠান (Current Organization — যদি থাকে)</label>
                <input
                  type="text"
                  placeholder="যেমন: বাংলাদেশ কম্পিউটার কাউন্সিল / ফ্রিল্যান্সার"
                  value={profile.currentOrganization || ''}
                  onChange={(e) => setProfile({ ...profile, currentOrganization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">পছন্দের কর্মসংস্থান বিভাগ</label>
                <div className="grid grid-cols-2 gap-2">
                  {['DHAKA', 'CHITTAGONG', 'RAJSHAHI', 'KHULNA', 'BARISAL', 'SYLHET', 'RANGPUR', 'MYMENSINGH'].map((div) => {
                    const isChecked = prefDivisions.includes(div);
                    return (
                      <label
                        key={div}
                        className={`p-2.5 rounded-xl border cursor-pointer font-bold transition-all flex items-center gap-2 text-[11px] ${
                          isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setPrefDivisions([...prefDivisions, div]);
                            else setPrefDivisions(prefDivisions.filter(d => d !== div));
                          }}
                          className="accent-emerald-600 rounded"
                        />
                        <span>{BD_DIVISIONS_MAP[div]?.bn || div}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">প্রত্যাশিত সর্বনিম্ন মাসিক মূল বেতন (BDT)</label>
                  <input
                    type="number"
                    placeholder="যেমন: ২৫০০০"
                    value={prefSalaryMin}
                    onChange={(e) => setPrefSalaryMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  />
                  <p className="text-[11px] text-slate-400">সরকারি চাকরির ক্ষেত্রে স্কেল অনুযায়ী স্বয়ংক্রিয়ভাবে গণনা হবে।</p>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                  <strong>টিপস:</strong> আপনি যে ক্যাটাগরি ও বিভাগগুলো নির্বাচন করবেন, সেই ফিল্ডের নতুন সার্কুলার প্রকাশিত হওয়ামাত্রই আপনার ড্যাশবোর্ডে অগ্রাধিকার ভিত্তিতে নোটিফিকেশন পৌঁছাবে।
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSavingPrefs}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingPrefs ? 'সংরক্ষণ হচ্ছে...' : 'পছন্দসমূহ সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
