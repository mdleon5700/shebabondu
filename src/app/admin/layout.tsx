import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'অ্যাডমিন কনসোল • চাকরি সেবা BD',
  description: 'চাকরি সেবা বিডি অ্যাডমিন ম্যানেজমেন্ট কনসোল ও অপারেশনাল ড্যাশবোর্ড।',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 font-solaiman antialiased">
      {children}
    </div>
  );
}
