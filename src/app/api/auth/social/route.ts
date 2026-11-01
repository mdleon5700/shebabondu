import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    error: 'সোশ্যাল লগইন এখনো কনফিগার করা হয়নি। মোবাইল বা ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।'
  }, { status: 503 });
}
