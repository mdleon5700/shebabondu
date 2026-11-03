import Link from 'next/link';
import type { PageRecord } from '@/lib/types';
import { serverDB } from '@/lib/db';
import JobCard from './JobCard';

function safeLink(value: unknown): string {
  return typeof value === 'string' && /^(\/(?!\/)|https?:\/\/|#)/i.test(value) ? value : '/jobs';
}

export default function PublishedPage({ page }: { page: NonNullable<PageRecord['publishedContent']> | PageRecord }) {
  return <div>{page.sections.filter(section => section.isVisible !== false).map((section, index) => {
    const content = section.content || {};
    const style = section.style || {};
    const items = Array.isArray(content.items) ? content.items : [];
    const columns = style.columns === 2 ? 'sm:grid-cols-2' : style.columns === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3';
    return <section key={section.id} style={{
      backgroundColor: style.backgroundColor || '#ffffff', color: style.textColor || '#0f172a',
      textAlign: style.textAlign || 'center',
      paddingBlock: style.paddingY === 'xl' ? '4rem' : style.paddingY === 'lg' ? '3rem' : style.paddingY === 'sm' ? '1rem' : '2rem'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        {content.badge && <span className="inline-block rounded-full border px-3 py-1 text-base">{content.badge}</span>}
        {index === 0 ? <h1 className="text-3xl sm:text-4xl font-bold">{section.title}</h1> : <h2 className="text-2xl font-bold">{section.title}</h2>}
        {section.subtitle && <p className="text-base whitespace-pre-line">{section.subtitle}</p>}
        {section.type === 'text' && content.text && <p className="text-base whitespace-pre-line">{content.text}</p>}
        {(section.type === 'hero' || section.type === 'cta') && (content.ctaText || content.buttonLabel) &&
          <Link href={safeLink(content.ctaUrl || content.buttonUrl)} className="inline-block rounded-xl bg-emerald-700 px-6 py-3 text-white text-[17px] font-bold">{content.ctaText || content.buttonLabel}</Link>}
        {(section.type === 'features' || section.type === 'stats') && <div className={`grid grid-cols-1 ${columns} gap-4`}>
          {items.map((item, i) => <div key={i} className="rounded-xl border p-5 space-y-2">
            <h3 className="text-xl font-bold">{item.title || item.value}</h3>
            <p className="text-base">{item.desc || item.label}</p>
          </div>)}
        </div>}
        {section.type === 'faq' && <div className="space-y-3 text-left">{items.map((item, i) => <details key={i} className="rounded-xl border p-4">
          <summary className="cursor-pointer font-bold text-[17px]">{item.question || item.title}</summary>
          <p className="text-base pt-3">{item.answer || item.desc}</p>
        </details>)}</div>}
        {section.type === 'jobs' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serverDB.getPublicJobs().filter(job => !content.category || content.category === 'all' || job.category === content.category)
            .slice(0, Math.min(24, Math.max(1, Number(content.limit) || 6))).map(job => <JobCard key={job.id} job={job} />)}
        </div>}
      </div>
    </section>;
  })}</div>;
}
