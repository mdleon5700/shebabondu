import { redirect } from 'next/navigation';

export default function EducationPage() {
  redirect('/dashboard/profile?tab=education');
}
