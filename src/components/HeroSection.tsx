'use client';
import React from 'react';
import { Sparkles, FileText, ArrowRight, BookOpen, ShieldCheck, Bell, Users, Star, Briefcase } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#011612] via-[#022b22] to-[#011a14] text-white pt-4 pb-5 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[450px] h-[250px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 lg:space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#022822]/90 border border-emerald-500/40 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm font-hind">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>সঠিক তথ্য • নির্ভরযোগ্য চাকরির খবর • আপনার ক্যারিয়ারের সঙ্গী</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.32] sm:leading-[1.35]">
              <span className="block mb-1 sm:mb-1.5">চাকরির খবর জানুন সবার আগে,</span>
              <span className="block">
                <span>ঘরে বসেই নিন </span>
                <span className="text-emerald-400">১০০% নির্ভুল </span>
                <span className="text-amber-400">আবেদন সেবা!</span>
              </span>
            </h1>

            <p className="text-[16px] text-slate-300 font-solaiman leading-relaxed max-w-xl mx-auto lg:mx-0 pt-1">
              সরকারি ও বেসরকারি চাকরির সর্বশেষ বিজ্ঞপ্তি, আবেদন প্রক্রিয়া, যোগ্যতা, প্রয়োজনীয় কাগজপত্র এবং পরীক্ষার আপডেট—সবকিছু এক জায়গায়, আপনার জন্য।
            </p>

            <div className="hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 font-hind">
              <a href="#circulars-section" className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-[17px] shadow-xl shadow-emerald-950/60 flex items-center gap-2 transition-all hover:scale-[1.02]">
                <FileText className="w-4 h-4" />
                <span>চাকরির বিজ্ঞপ্তি দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#how-it-works" className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[17px] border border-white/40 transition-all flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span>আবেদন প্রক্রিয়া জানুন</span>
              </a>
            </div>
            <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-3 sm:pt-4 border-t border-emerald-900/40 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white leading-tight font-hind">নির্ভরযোগ্য তথ্য</div>
                  <div className="text-[13px] text-slate-400 font-solaiman">অফিসিয়াল সূত্র থেকে</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white leading-tight font-hind">ধাপে ধাপে গাইড</div>
                  <div className="text-[13px] text-slate-400 font-solaiman">আবেদন সহজ সহায়তা</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white leading-tight font-hind">নিয়মিত আপডেট</div>
                  <div className="text-[13px] text-slate-400 font-solaiman">নতুন বিজ্ঞপ্তি সবার আগে</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Users className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white leading-tight font-hind">সবার জন্য</div>
                  <div className="text-[13px] text-slate-400 font-solaiman">সরকারি ও বেসরকারি চাকরি</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center">
            <div className="relative w-full max-w-[480px] flex items-center justify-center py-4">
              {/* Radial ambient glow */}
              <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
              <div className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />
              
              {/* Circular decorative rings */}
              <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-emerald-500/20 border-dashed pointer-events-none" />
              <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-teal-500/25 pointer-events-none" />

              {/* Floating Glassmorphic Badges */}
              <div className="absolute top-2 right-2 sm:right-4 z-20 w-11 h-11 rounded-2xl bg-[#032e26]/85 backdrop-blur-md border border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center text-emerald-300">
                <FileText className="w-5 h-5" />
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 -right-1 sm:right-2 z-20 w-11 h-11 rounded-2xl bg-[#032e26]/85 backdrop-blur-md border border-teal-400/40 shadow-[0_0_20px_rgba(45,212,191,0.3)] flex items-center justify-center text-teal-300">
                <Briefcase className="w-5 h-5" />
              </div>

              <div className="absolute bottom-6 right-3 sm:right-6 z-20 w-11 h-11 rounded-2xl bg-[#032e26]/85 backdrop-blur-md border border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center text-emerald-300">
                <Users className="w-5 h-5" />
              </div>

              {/* Handwritten text callout on the left */}
              <div className="hidden sm:block absolute top-10 -left-4 z-20 text-right">
                <div className="text-[16px] font-bold text-emerald-300 font-hind leading-snug drop-shadow-md">
                  আপনার<br />
                  <span className="text-white">উজ্জ্বল ভবিষ্যৎ</span><br />
                  <span className="text-amber-400">এখনই শুরু!</span>
                </div>
                <div className="text-emerald-400 text-lg font-mono transform rotate-45 inline-block mt-0.5">↳</div>
              </div>

              {/* The clean transparent Bangladeshi candidates photo */}
              <img
                src="/images/bangladeshi-job-seekers.png"
                alt="বাংলাদেশি চাকরি প্রার্থী"
                className="relative z-10 w-full max-w-[420px] h-auto object-contain drop-shadow-[0_20px_45px_rgba(16,185,129,0.3)] transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
        <div className="hidden sm:block mt-4 sm:mt-6 lg:mt-10 bg-[#02251e]/80 backdrop-blur-md border border-emerald-500/25 rounded-2xl p-3 sm:p-5 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-emerald-900/40">
            <div className="flex items-center gap-3.5 px-2 py-1">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-hind">৪৭+</div>
                <div className="text-xs text-slate-300 font-solaiman">চলমান চাকরির বিজ্ঞপ্তি</div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-2 py-1 pt-3 md:pt-1">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-hind">৮৫০+</div>
                <div className="text-xs text-slate-300 font-solaiman">আজকের সক্রিয় আবেদন</div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-2 py-1 pt-3 md:pt-1">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-hind">১০০%</div>
                <div className="text-xs text-slate-300 font-solaiman">নির্ভরযোগ্য তথ্য</div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-2 py-1 pt-3 md:pt-1">
              <div className="w-11 h-11 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                <Star className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-teal-300 font-hind">৩.৫+ লাখ</div>
                <div className="text-xs text-slate-300 font-solaiman">সন্তুষ্ট ব্যবহারকারী</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
