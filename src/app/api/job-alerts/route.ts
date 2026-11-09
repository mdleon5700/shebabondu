import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, channels, categories, divisions, frequency } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'সক্রিয় মোবাইল অথবা হোয়াটসঅ্যাপ নম্বর আবশ্যক।' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const cleanChannels = Array.isArray(channels) && channels.length > 0 ? channels : ['whatsapp', 'sms'];
    const cleanCategories = Array.isArray(categories) && categories.length > 0 
      ? categories 
      : ['বিসিএস ও সরকারি চাকরি', 'ব্যাংক ও আর্থিক প্রতিষ্ঠান'];
    const cleanDivisions = Array.isArray(divisions) && divisions.length > 0 ? divisions : ['ঢাকা'];
    const cleanFrequency = (frequency === 'instant' || frequency === 'daily' || frequency === 'weekly') 
      ? frequency 
      : 'instant';

    const subscription = serverDB.createJobAlertSubscription({
      phone: cleanPhone,
      email: email ? email.trim() : undefined,
      channels: cleanChannels,
      categories: cleanCategories,
      divisions: cleanDivisions,
      frequency: cleanFrequency,
      status: 'active'
    });

    // If candidate session is present or user with this phone exists, sync their candidate alertPreferences
    const session = getServerSession(req);
    const candidateId = session?.candidateId || serverDB.getCandidateByPhone(cleanPhone)?.id;
    if (candidateId) {
      serverDB.updateCandidate(candidateId, {
        alertPreferences: {
          categories: cleanCategories,
          districts: cleanDivisions,
          grades: ['৯ম গ্রেড', '১০ম গ্রেড'],
          emailAlert: cleanChannels.includes('email'),
          smsAlert: cleanChannels.includes('sms'),
          whatsappAlert: cleanChannels.includes('whatsapp'),
          frequency: cleanFrequency === 'weekly' ? 'weekly' : 'daily'
        }
      });

      // Send immediate welcome notification to candidate portal
      serverDB.addCandidateNotification(candidateId, {
        title: 'ফ্রি জব অ্যালার্ট চালু হয়েছে',
        message: `${cleanCategories.slice(0, 2).join(', ')} ক্যাটাগরির নতুন বিজ্ঞপ্তি আসামাত্রই আপনার নম্বরে (${cleanPhone}) সতর্কবার্তা পাঠানো হবে।`,
        type: 'system',
        link: '/job-alerts'
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: 'আপনার ফ্রি জব অ্যালার্ট সফলভাবে চালু হয়েছে! নতুন সার্কুলার প্রকাশিত হওয়ামাত্রই নোটিফিকেশন পাঠানো হবে।'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'সাবস্ক্রিপশন ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const subscriptions = serverDB.getJobAlertSubscriptions();
    const activeCount = subscriptions.filter(s => s.status === 'active').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscribers: Math.max(12850, 12850 + subscriptions.length),
        activeSubscribers: Math.max(12600, 12600 + activeCount),
        supportedCategories: [
          'বিসিএস ও সরকারি চাকরি',
          'ব্যাংক ও আর্থিক প্রতিষ্ঠান',
          'প্রাথমিক ও শিক্ষক নিয়োগ',
          'বাংলাদেশ রেলওয়ে',
          'প্রতিরক্ষা ও পুলিশ',
          'ইঞ্জিনিয়ারিং ও আইটি',
          'এনজিও ও উন্নয়ন সংস্থা',
          'স্বাস্থ্য ও নার্সিং'
        ]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
