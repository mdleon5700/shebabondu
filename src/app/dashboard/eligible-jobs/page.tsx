'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EligibleJobsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/recommended-jobs');
  }, [router]);

  return (
    <div className="p-8 text-center text-sm font-semibold text-slate-500">
      সুপারিশকৃত চাকরির তালিকায় রিডাইরেক্ট করা হচ্ছে...
    </div>
  );
}
