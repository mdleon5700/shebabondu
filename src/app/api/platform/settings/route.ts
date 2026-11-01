import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = serverDB.getPlatformSettings();
    // Return safe public subset
    const publicSettings = {
      general: {
        siteName: settings.general?.siteName || 'চাকরি সেবা (Chakri Sheba)',
        siteDescription: settings.general?.siteDescription || 'বাংলাদেশের সকল সরকারি ও বেসরকারি চাকরির সার্কুলার ও আবেদন সহায়তা পোর্টাল',
        siteUrl: settings.general?.siteUrl || 'https://chakrisheba.com',
        supportEmail: settings.general?.supportEmail || 'support@chakrisheba.com',
        supportPhone: settings.general?.supportPhone || '+৮৮০ ১৭০০-০০০০০০',
        officeAddress: settings.general?.officeAddress || 'ঢাকা, বাংলাদেশ',
        whatsappNumber: settings.general?.whatsappNumber || '8801700000000',
        logoUrl: settings.general?.logoUrl || '/icons/icon-192x192.png',
        faviconUrl: settings.general?.faviconUrl || '/favicon.ico',
        announcementText: (settings.general as any)?.announcementText || '⚡ সরকারি ও ব্যাংক চাকরির শতভাগ নির্ভুল অনলাইন আবেদন ও এসএমএস ট্র্যাকিং সেবা সক্রিয় রয়েছে।',
        announcementUrl: (settings.general as any)?.announcementUrl || '/jobs',
        announcementEnabled: (settings.general as any)?.announcementEnabled !== false,
        headerMenuItems: (settings.general as any)?.headerMenuItems || null,
        footerAboutText: (settings.general as any)?.footerAboutText || 'বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। ঘরে বসেই সকল সরকারি, ব্যাংক ও শীর্ষ বেসরকারি চাকরির শতভাগ যাচাইকৃত বিজ্ঞপ্তি ও সঠিক নিয়মে অনলাইন আবেদন সহায়তা।',
        facebookUrl: (settings.general as any)?.facebookUrl || 'https://facebook.com/chakrisheba.bd',
        telegramUrl: (settings.general as any)?.telegramUrl || 'https://t.me/chakrisheba',
        youtubeUrl: (settings.general as any)?.youtubeUrl || 'https://youtube.com/@chakrisheba'
      },
      seo: {
        defaultTitle: settings.seo?.defaultTitle || 'চাকরি সেবা | সরকারি ও ব্যাংক চাকরির সার্কুলার ও অনলাইন আবেদন',
        defaultDescription: settings.seo?.defaultDescription || 'বাংলাদেশ সরকারি, ব্যাংক ও শীর্ষ প্রতিষ্ঠানের সকল চাকরির সার্কুলার এবং অনলাইন আবেদন সেবা।',
        defaultKeywords: settings.seo?.defaultKeywords || ['চাকরির খবর', 'সরকারি চাকরি', 'ব্যাংক জব', 'টেলিটক আবেদন'],
        defaultOgImage: settings.seo?.defaultOgImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80'
      },
      operational: {
        standardServiceFee: settings.operational?.standardServiceFee ?? 50,
        officialBkashNumber: settings.operational?.officialBkashNumber || '01700000000',
        officialNagadNumber: settings.operational?.officialNagadNumber || '01700000000'
      }
    };

    return NextResponse.json({
      success: true,
      settings: publicSettings
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to load platform settings'
    }, { status: 500 });
  }
}
