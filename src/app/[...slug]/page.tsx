import type { Metadata } from 'next';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { serverDB } from '@/lib/db';
import CmsPageRenderer from '@/components/CmsPageRenderer';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!params?.slug || !Array.isArray(params.slug) || params.slug.length === 0) {
    return { robots: { index: false } };
  }
  const first = (params.slug[0] || '').toLowerCase().trim();
  if (first === '_next' || first === 'api' || first === 'favicon.ico' || first === 'images' || first === 'icons' || first === 'uploads') {
    return { robots: { index: false } };
  }
  const fullPath = '/' + params.slug.join('/');
  const page = serverDB.getPublishedPageBySlug(fullPath);
  if (page) {
    return { 
      title: page.metaTitle || `${page.title} | চাকরি সেবা`, 
      description: page.metaDescription || `${page.title} — চাকরি সেবা প্ল্যাটফর্মের অফিসিয়াল পেজ।`,
      openGraph: {
        title: page.metaTitle || page.title,
        description: page.metaDescription,
        type: 'website'
      }
    };
  }
  return { robots: { index: false } };
}

export default async function CustomPage(props: Props) {
  const params = await props.params;
  if (!params?.slug || !Array.isArray(params.slug) || params.slug.length === 0) {
    notFound();
  }

  const rawPath = params.slug.join('/');
  const fullPath = '/' + rawPath;
  const first = (params.slug[0] || '').toLowerCase().trim();

  // Guard against static assets or Next.js internals being intercepted
  if (first === '_next' || first === 'api' || first === 'favicon.ico' || first === 'images' || first === 'icons' || first === 'uploads') {
    notFound();
  }

  // 1. Direct CMS Page
  const page = serverDB.getPublishedPageBySlug(fullPath);
  if (page) {
    return <CmsPageRenderer page={page as any} initialJobs={serverDB.getPublicJobs()} />;
  }

  // 2. High-frequency URL Aliases (Guard against redirecting to itself)
  const ROOT_REDIRECTS: Record<string, string> = {
    'privacy': '/privacy-policy',
    'privacy-policy': '/privacy-policy',
    'terms': '/terms-and-conditions',
    'terms-and-conditions': '/terms-and-conditions',
    'about': '/about-us',
    'about-us': '/about-us',
    'help': '/faq',
    'faq': '/faq',
    'support': '/contact-us',
    'contact': '/contact-us',
    'contact-us': '/contact-us',
    'circulars': '/jobs',
    'circular': '/jobs',
    'alljobs': '/jobs',
    'teletalk': '/jobs',
    'bcs': '/categories/bcs',
    'govt': '/government-jobs',
    'bank': '/bank-jobs',
    'ngo': '/ngo-jobs',
    'teacher': '/teacher-jobs',
    'defense': '/categories/defense-jobs',
    'railway': '/categories/railway-jobs'
  };

  if (params.slug.length === 1 && ROOT_REDIRECTS[first] && ROOT_REDIRECTS[first] !== fullPath) {
    redirect(ROOT_REDIRECTS[first]);
  }

  // 3. /circulars/:id or /circular/:id -> /jobs/:id
  if (first === 'circulars' || first === 'circular') {
    if (params.slug.length > 1) {
      redirect(`/jobs/${params.slug.slice(1).join('/')}`);
    } else {
      redirect('/jobs');
    }
  }

  // 4. /jobs/category/:slug -> /categories/:slug
  if (first === 'jobs' && params.slug[1] === 'category' && params.slug[2]) {
    redirect(`/categories/${params.slug[2]}`);
  }

  // 5. Category alias match
  const matchedCat = serverDB.getCategoryBySlug(rawPath) || (params.slug.length === 1 ? serverDB.getCategoryBySlug(first) : null);
  if (matchedCat) {
    const catTarget = `/categories/${matchedCat.slug}`;
    if (catTarget !== fullPath) {
      redirect(catTarget);
    }
  }

  // 6. Organization match
  if (params.slug.length === 1) {
    const org = serverDB.getCompanies ? serverDB.getCompanies().find((c: any) => c.slug === first || c.id === first) : null;
    if (org) {
      const orgTarget = `/organizations/${(org as any).slug || (org as any).id || first}`;
      if (orgTarget !== fullPath) {
        redirect(orgTarget);
      }
    }
  }

  // 7. Dynamic redirects configured in admin
  if (serverDB.findRedirectByPath) {
    const rec = serverDB.findRedirectByPath(fullPath);
    if (rec && rec.isActive && rec.targetPath && rec.targetPath !== fullPath) {
      redirect(rec.targetPath, RedirectType.replace);
    }
  }

  // 8. Graceful fallback to jobs search instead of hard 404
  const searchQuery = rawPath.replace(/[/-]/g, ' ').trim();
  if (!searchQuery || first === 'jobs') {
    redirect('/jobs');
  }
  redirect(`/jobs?search=${encodeURIComponent(searchQuery)}`);
}
