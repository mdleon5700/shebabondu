import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, subject, category, message } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'আপনার নাম প্রদান করা আবশ্যক।' }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'যোগাযোগের মোবাইল নম্বর প্রদান করা আবশ্যক।' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'আপনার বার্তা বা সমস্যার বিবরণ লিখুন।' }, { status: 400 });
    }

    let resolvedName = name.trim();
    let resolvedPhone = phone.trim();
    let resolvedEmail = email ? email.trim() : undefined;

    const session = getServerSession(req);
    if (session && session.candidateId) {
      const candidate = serverDB.getCandidateById(session.candidateId);
      if (candidate) {
        resolvedName = resolvedName || candidate.nameBn || candidate.name;
        resolvedPhone = resolvedPhone || candidate.phone;
        resolvedEmail = resolvedEmail || candidate.email;
      }
    }

    const ticket = serverDB.createContactMessage({
      name: resolvedName,
      phone: resolvedPhone,
      email: resolvedEmail,
      subject: subject?.trim() || 'সাধারণ অনুসন্ধান ও সহায়তা',
      category: category || 'general',
      message: message.trim()
    });

    return NextResponse.json({
      success: true,
      message: 'আপনার বার্তাটি সফলভাবে হেল্পডেস্কে জমা হয়েছে। দ্রুত আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।',
      ticketId: ticket.id,
      ticket
    });
  } catch (error: any) {
    console.error('Contact submit error:', error);
    return NextResponse.json({ error: error.message || 'বার্তা পাঠাতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId');
    const phone = searchParams.get('phone');

    if (ticketId) {
      const ticket = serverDB.getContactMessageById(ticketId.trim());
      if (!ticket) {
        return NextResponse.json({ error: 'প্রদত্ত টিকেট নম্বরে কোনো বার্তা বা অনুরোধ পাওয়া যায়নি।' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ticket });
    }

    const messages = serverDB.getContactMessages();
    if (phone) {
      const filtered = messages.filter(m => m.phone === phone.trim());
      return NextResponse.json({ success: true, messages: filtered });
    }

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'টিকেট তথ্য আনতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
