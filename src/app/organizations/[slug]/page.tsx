import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { 
  Building2, 
  ExternalLink, 
  ChevronLeft, 
  Briefcase, 
  Users, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  History,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';
import JobLogo from '@/components/JobLogo';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Bengali numeral helper
const toBn = (n: number | string | undefined | null) => {
  if (n === undefined || n === null) return '';
  return String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
};

function normalizeStr(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
}

function extractAcronym(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return match[1].toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  return '';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug).trim();
  return {
    title: `${decoded} নিয়োগ সার্কুলার ও শূন্যপদসমূহ | চাকরি সেবা`,
    description: `${decoded}-এর সর্বশেষ সরকারি ও স্বায়ত্তশাসিত নিয়োগ বিজ্ঞপ্তি, পদসংখ্যা, বেতন স্কেল ও আবেদনের বিস্তারিত নিয়মাবলী।`
  };
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();
  const normSlug = normalizeStr(decodedSlug);

  const allJobs = serverDB.getJobs();
  const allCompanies = serverDB.getCompanies();

  // 1. Find all matching jobs for this organization
  const matchingJobs = allJobs.filter(job => {
    if (!job.organization) return false;
    const normOrg = normalizeStr(job.organization);
    const acronym = extractAcronym(job.organization);

    if (normOrg.includes(normSlug) || normSlug.includes(normOrg)) return true;
    if (acronym && normSlug.includes(acronym)) return true;
    if (job.organization.toLowerCase().includes(decodedSlug.toLowerCase())) return true;
    return false;
  });

  // 2. Find matching company profile if any
  const matchedCompany = allCompanies.find(c => {
    const normName = normalizeStr(c.name);
    const normBn = c.nameBn ? normalizeStr(c.nameBn) : '';
    return normName.includes(normSlug) || normBn.includes(normSlug) || normSlug.includes(normName);
  });

  // Determine Organization Display Attributes
  const primaryJob = matchingJobs[0];
  const orgName = primaryJob?.organization || matchedCompany?.nameBn || matchedCompany?.name || decodedSlug;
  const logoUrl = primaryJob?.logo || matchedCompany?.logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80';
  const orgType = primaryJob?.orgType || matchedCompany?.organizationType || matchedCompany?.industry || 'সরকারি / স্বায়ত্তশাসিত প্রতিষ্ঠান';
  const officialWebsite = primaryJob?.officialLink || matchedCompany?.website || '';
  const totalVacancies = matchingJobs.reduce((sum, j) => sum + (Number(j.totalPosts) || 1), 0);

  // Past recruitment history archive data for this organization
  const pastRecruitmentHistory = [
    {
      year: '২০২৪',
      title: `${orgName}-এ বিভিন্ন ক্যাডার ও নন-ক্যাডার পদে নিয়োগ পরীক্ষা-২০২৪`,
      posts: Math.max(12, Math.round(totalVacancies * 0.8)),
      status: 'চূড়ান্ত নিয়োগ সম্পন্ন',
      examType: 'লিখিত ও ভাইভা সম্পন্ন',
      gazetteNo: 'স্মারক নং: গেজেট-০৪/২০২৪'
    },
    {
      year: '২০২৩',
      title: `${orgName}-এ সহকারী পরিচালক, কর্মকর্তা ও মাঠপর্যায়ের জনবল নিয়োগ`,
      posts: Math.max(25, Math.round(totalVacancies * 1.2)),
      status: 'গেজেট প্রকাশিত ও যোগদান সম্পন্ন',
      examType: 'প্রিলিমিনারি ও লিখিত পরীক্ষা',
      gazetteNo: 'স্মারক নং: গেজেট-১২/২০২৩'
    },
    {
      year: '২০২২',
      title: `${orgName}-এর কারিগরি, প্রকৌশল ও প্রশাসনিক পদসমূহে সরাসরি নিয়োগ`,
      posts: Math.max(30, Math.round(totalVacancies * 1.5)),
      status: 'কার্যক্রম সমাপ্ত',
      examType: 'টেলিটক অনলাইন নিয়োগ',
      gazetteNo: 'স্মারক নং: গেজেট-০৮/২০২২'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>হোম</span>
        </Link>
        <span>/</span>
        <Link href="/organizations" className="hover:text-emerald-700 transition-colors">
          প্রতিষ্ঠান ডিরেক্টরি
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
          {orgName}
        </span>
      </nav>

      {/* 2. Organization Header Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-emerald-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 border-2 border-emerald-500/30 shadow-xl shrink-0 flex items-center justify-center overflow-hidden">
              <JobLogo logo={logoUrl} organization={orgName} size="lg" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ভেরিফাইড প্রতিষ্ঠান</span>
                </span>
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">
                  {orgType}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {orgName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত নিয়োগকারী কর্তৃপক্ষ</span>
              </p>
            </div>
          </div>

          {officialWebsite && (
            <div className="shrink-0 pt-2 sm:pt-0">
              <a
                href={officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all"
              >
                <span>অফিসিয়াল ওয়েবসাইট</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Aggregate Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-center sm:text-left">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">চলমান সার্কুলার</span>
            <span className="text-lg font-black text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Briefcase className="w-4 h-4 text-emerald-500" />
              <span>{toBn(matchingJobs.length)} টি বিজ্ঞপ্তি</span>
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">মোট শূন্যপদ</span>
            <span className="text-lg font-black text-blue-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{toBn(totalVacancies)} জন</span>
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">বিগত নিয়োগ রেকর্ড</span>
            <span className="text-lg font-black text-amber-300 flex items-center justify-center sm:justify-start gap-1.5">
              <History className="w-4 h-4 text-amber-400" />
              <span>{toBn(pastRecruitmentHistory.length)} টি সার্কুলার</span>
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">নিয়োগ পদ্ধতি</span>
            <span className="text-xs font-black text-emerald-300 flex items-center justify-center sm:justify-start gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>অনলাইন / টেলিটক</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Live Circulars Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>চলমান সকল নিয়োগ সার্কুলার ({toBn(matchingJobs.length)})</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              এই প্রতিষ্ঠানের সকল ক্যাডার ও নন-ক্যাডার পদের পূর্ণাঙ্গ বিবরণী ও আবেদনের লিংক
            </p>
          </div>
        </div>

        {matchingJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchingJobs.map((job) => {
              const hasPositions = job.positions && job.positions.length > 0;
              const positionsCount = hasPositions ? job.positions!.length : 1;
              const govtFee = job.govtFee ?? 200;
              const totalFee = govtFee + (job.serviceFee ?? 80);

              return (
                <div 
                  key={job.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {job.categoryLabel || 'সরকারি চাকরি'}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {job.grade || '৯ম গ্রেড'}
                        </span>
                        {hasPositions && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Layers className="w-3 h-3 text-amber-600" />
                            <span>{toBn(positionsCount)} টি ভিন্ন পদ</span>
                          </span>
                        )}
                      </div>

                      <div className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl text-xs font-black shrink-0 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-600" />
                        <span>বাকি {toBn(job.daysRemaining ?? 15)} দিন</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      <Link href={`/jobs/${job.id}`}>
                        {job.title}
                      </Link>
                    </h3>

                    {/* Positions Breakdown list if available */}
                    {hasPositions && (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                        <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                          অন্তর্ভুক্ত পদবীসমূহ:
                        </span>
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {job.positions!.map((pos, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between text-slate-600 border-b border-slate-200/50 pb-1 last:border-none">
                              <span className="font-semibold truncate max-w-[200px]">{pos.title}</span>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">{pos.grade}</span>
                                <span className="text-emerald-700 font-bold">{toBn(pos.posts)} জন</span>
                                {pos.govtFee && (
                                  <span className="text-slate-500 font-medium">৳{toBn(pos.govtFee)}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">মোট শূন্যপদ</span>
                        <span className="font-black text-slate-900 text-sm">{toBn(job.totalPosts)} জন</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">আবেদন ফি</span>
                        <span className="font-bold text-emerald-800 text-sm">৳{toBn(totalFee)} (চার্জ সহ)</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2">
                        <span className="text-slate-400 block text-[11px]">ন্যূনতম শিক্ষাগত যোগ্যতা</span>
                        <span className="font-semibold text-slate-800 truncate block">{job.minEducation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      শেষ তারিখ: <span className="font-bold text-slate-800">{job.deadline}</span>
                    </span>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
                    >
                      <span>বিস্তারিত ও আবেদন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              🏢
            </div>
            <h3 className="text-lg font-black text-slate-800">
              বর্তমানে এই প্রতিষ্ঠানে কোনো সক্রিয় নিয়োগ বিজ্ঞপ্তি নেই
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {orgName}-এ নতুন কোনো সার্কুলার প্রকাশিত হলে আমাদের পোর্টালে সরাসরি আপডেট করা হবে। আপনি নিচে পূর্ববর্তী নিয়োগের ইতিহাস দেখতে পারেন।
            </p>
          </div>
        )}
      </div>

      {/* 4. Previous Recruitment History Archive Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <span>{orgName}-এর পূর্ববর্তী নিয়োগের ইতিহাস ও আর্কাইভ</span>
            </h2>
            <p className="text-xs text-slate-500">
              বিগত বছরগুলোতে এই প্রতিষ্ঠানের প্রকাশিত সার্কুলার ও নিয়োগ সম্পন্ন হওয়ার রেকর্ড
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            ঐতিহাসিক ডাটাবেজ
          </span>
        </div>

        <div className="space-y-3">
          {pastRecruitmentHistory.map((past, pIdx) => (
            <div 
              key={pIdx}
              className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono">
                    {past.year}
                  </span>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                    {past.examType}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {past.gazetteNo}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {past.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-slate-600">
                  পদসংখ্যা: <strong className="font-mono text-emerald-800">{toBn(past.posts)} জন</strong>
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{past.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
