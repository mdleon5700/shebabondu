import { isPublicJob } from '../job-visibility';
import { JobCircular } from '../types';
import { SearchParams, SearchResult, SearchFacets, SearchFacetItem } from './types';
import { SearchScorer } from './scorer';
import { SearchNormalizer } from './normalizer';
import { JobTaxonomyClassifier } from '../taxonomy/classifier';
import { CategoryRecord } from '../taxonomy/types';

export class SearchEngine {
  /**
   * Execute advanced search across eligible canonical jobs with multi-facet filters & sorting
   */
  static search(
    allJobs: JobCircular[],
    categories: CategoryRecord[],
    params: SearchParams
  ): SearchResult {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));

    // 1. STRICT ZERO-LEAKAGE PUBLIC ELIGIBILITY GUARD
    const eligibleJobs = allJobs.filter((j) => {
      if (!isPublicJob(j)) return false;
      if (j.id?.startsWith('draft-')) return false;
      const status = ((j as any).status || '').toLowerCase();
      const pubStatus = ((j as any).publicationStatus || '').toUpperCase();
      if (status === 'draft' || status === 'unpublished' || status === 'archived' || status === 'rejected') {
        return false;
      }
      if (pubStatus === 'DRAFT' || pubStatus === 'UNPUBLISHED' || pubStatus === 'ARCHIVED' || pubStatus === 'REJECTED') {
        return false;
      }
      return true;
    });

    // Pre-classify eligible jobs with taxonomy
    const classifiedList = eligibleJobs.map((job) => ({
      job,
      classification: JobTaxonomyClassifier.classify(job)
    }));

    // 2. Query Search & Scoring
    const query = params.q ? SearchNormalizer.normalize(params.q) : '';
    let matchedList: Array<{ job: JobCircular; classification: any; score: number }> = [];

    if (query) {
      for (const item of classifiedList) {
        const { score } = SearchScorer.scoreJob(item.job, query);
        if (score > 0) {
          matchedList.push({ ...item, score });
        }
      }
    } else {
      matchedList = classifiedList.map((item) => ({ ...item, score: 1 }));
    }

    // 3. Faceted Filtering
    let filtered = matchedList.filter((item) => {
      const { job, classification } = item;

      // Filter: Category
      if (params.category && params.category !== 'all') {
        const catTarget = params.category.toLowerCase();
        const targetCatRecord = categories.find(
          (c) => c.slug.toLowerCase() === catTarget || c.id.toLowerCase() === catTarget
        );

        let matchesCategory = false;
        if (targetCatRecord && targetCatRecord.parent_id) {
          // Subcategory target matching
          matchesCategory = classification.subcategories.some(
            (s: string) =>
              s.toLowerCase() === targetCatRecord.id.toLowerCase() ||
              s.toLowerCase() === targetCatRecord.slug.toLowerCase() ||
              s.toLowerCase() === catTarget
          );
        } else {
          // Root category or generic category target matching
          matchesCategory = Boolean(
            classification.primaryCategory.toLowerCase() === catTarget ||
            classification.categorySlug.toLowerCase() === catTarget ||
            (job.category || '').toLowerCase() === catTarget ||
            (targetCatRecord && classification.primaryCategory.toLowerCase() === targetCatRecord.id.toLowerCase()) ||
            (targetCatRecord && classification.subcategories.some(
              (s: string) => s.toLowerCase() === targetCatRecord.id.toLowerCase() || s.toLowerCase() === targetCatRecord.slug.toLowerCase()
            )) ||
            classification.subcategories.some((s: string) => s.toLowerCase() === catTarget)
          );
        }

        if (!matchesCategory) return false;
      }

      // Filter: Subcategory
      if (params.subcategory && params.subcategory !== 'all') {
        const subTarget = params.subcategory.toLowerCase();
        const matchesSub = classification.subcategories.some(
          (s: string) => s.toLowerCase() === subTarget || s.toLowerCase().includes(subTarget)
        );
        if (!matchesSub) return false;
      }

      // Filter: Organization Type
      if (params.orgType && params.orgType !== 'all') {
        if (classification.organizationType !== params.orgType) return false;
      }

      // Filter: Job Type
      if (params.jobType && params.jobType !== 'all') {
        if (classification.jobType !== params.jobType) return false;
      }

      // Filter: Division
      if (params.division && params.division !== 'all') {
        const divTarget = params.division.toUpperCase();
        if (classification.division !== divTarget && classification.division !== 'ALL_BD') {
          return false;
        }
      }

      // Filter: District
      if (params.district && params.district !== 'all') {
        const distTarget = params.district.toLowerCase().trim();
        const distText = `${job.districts || ''} ${job.district || ''}`.toLowerCase();
        const isNationwide = distText.includes('সকল জেলা') || distText.includes('সারাদেশ') || distText.includes('all');
        const matchesDistrict = distText.includes(distTarget);
        if (!matchesDistrict && !isNationwide) return false;
      }

      // Filter: Education
      if (params.education && params.education !== 'all') {
        const eduTarget = params.education.toLowerCase().trim();
        const clEdu = classification.educationLevel;
        const matchesEdu = clEdu === eduTarget ||
          (eduTarget === 'bachelor' && (clEdu === 'honours' || clEdu === 'bachelor')) ||
          (eduTarget === 'honours' && clEdu === 'honours');
        if (!matchesEdu) return false;
      }

      // Filter: Experience
      if (params.experience && params.experience !== 'all') {
        if (classification.experienceLevel !== params.experience) return false;
      }

      // Filter: Salary Type
      if (params.salaryType && params.salaryType !== 'all') {
        if (params.salaryType === 'disclosed' && classification.salaryType !== 'disclosed') return false;
        if (params.salaryType === 'negotiable' && classification.salaryType !== 'negotiable') return false;
      }

      // Filter: Application Status
      if (params.status && params.status !== 'all') {
        if (classification.applicationStatus !== params.status) return false;
      }

      // Filter: Date Posted
      if (params.datePosted && params.datePosted !== 'all') {
        const now = Date.now();
        const pubTime = job.publishedDate ? new Date(job.publishedDate).getTime() : 0;
        const diffDays = (now - pubTime) / (1000 * 60 * 60 * 24);
        if (params.datePosted === 'today' && diffDays > 1) return false;
        if (params.datePosted === '3days' && diffDays > 3) return false;
        if (params.datePosted === '7days' && diffDays > 7) return false;
        if (params.datePosted === '30days' && diffDays > 30) return false;
      }

      // Filter: Specific Organization
      if (params.org && params.org.trim()) {
        const orgTarget = SearchNormalizer.normalize(params.org);
        if (!SearchNormalizer.normalize(job.organization).includes(orgTarget)) return false;
      }

      return true;
    });

    // 4. Smart Sorting
    const sort = params.sort || (query ? 'relevance' : 'latest');
    filtered.sort((a, b) => {
      switch (sort) {
        case 'relevance':
          if (b.score !== a.score) return b.score - a.score;
          return a.job.daysRemaining - b.job.daysRemaining;

        case 'latest':
          return (b.job.publishedDate || '').localeCompare(a.job.publishedDate || '');

        case 'oldest':
          return (a.job.publishedDate || '').localeCompare(b.job.publishedDate || '');

        case 'deadline_soon':
          return a.job.daysRemaining - b.job.daysRemaining;

        case 'deadline_later':
          return b.job.daysRemaining - a.job.daysRemaining;

        case 'org_asc':
          return (a.job.organization || '').localeCompare(b.job.organization || '');

        case 'org_desc':
          return (b.job.organization || '').localeCompare(a.job.organization || '');

        default:
          return 0;
      }
    });

    // 5. Dynamic Facet Computation
    const facets = this.computeFacets(classifiedList, categories);

    // 6. Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit).map((f) => f.job);

    return {
      jobs: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      facets,
      queryNormalized: query || undefined
    };
  }

  /**
   * Compute dynamic facet item counts from eligible job set
   */
  private static computeFacets(
    classifiedList: Array<{ job: JobCircular; classification: any }>,
    categories: CategoryRecord[]
  ): SearchFacets {
    const catCounts: Record<string, number> = {};
    const divCounts: Record<string, number> = {};
    const eduCounts: Record<string, number> = {};
    const jobTypeCounts: Record<string, number> = {};
    const orgTypeCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};

    for (const item of classifiedList) {
      const c = item.classification;
      catCounts[c.primaryCategory] = (catCounts[c.primaryCategory] || 0) + 1;
      divCounts[c.division] = (divCounts[c.division] || 0) + 1;
      eduCounts[c.educationLevel] = (eduCounts[c.educationLevel] || 0) + 1;
      jobTypeCounts[c.jobType] = (jobTypeCounts[c.jobType] || 0) + 1;
      orgTypeCounts[c.organizationType] = (orgTypeCounts[c.organizationType] || 0) + 1;
      statusCounts[c.applicationStatus] = (statusCounts[c.applicationStatus] || 0) + 1;
    }

    const categoryFacets: SearchFacetItem[] = categories
      .filter((c) => !c.parent_id && c.is_active)
      .map((cat) => ({
        id: cat.id,
        name_bn: cat.name_bn,
        name_en: cat.name_en,
        slug: cat.slug,
        count: catCounts[cat.id] || 0
      }))
      .sort((a, b) => b.count - a.count);

    const divisionNames: Record<string, { bn: string; en: string }> = {
      'DHAKA': { bn: 'ঢাকা', en: 'Dhaka' },
      'CHATTOGRAM': { bn: 'চট্টগ্রাম', en: 'Chattogram' },
      'RAJSHAHI': { bn: 'রাজশাহী', en: 'Rajshahi' },
      'KHULNA': { bn: 'খুলনা', en: 'Khulna' },
      'BARISHAL': { bn: 'বরিশাল', en: 'Barishal' },
      'SYLHET': { bn: 'সিলেট', en: 'Sylhet' },
      'RANGPUR': { bn: 'রংপুর', en: 'Rangpur' },
      'MYMENSINGH': { bn: 'ময়মনসিংহ', en: 'Mymensingh' },
      'ALL_BD': { bn: 'সারাদেশ / সকল জেলা', en: 'All Bangladesh' }
    };

    const divisionFacets: SearchFacetItem[] = Object.entries(divisionNames).map(([key, val]) => ({
      id: key,
      name_bn: val.bn,
      name_en: val.en,
      count: divCounts[key] || 0
    }));

    const educationNames: Record<string, string> = {
      'masters': 'মাস্টার্স / স্নাতকোত্তর',
      'bachelor': 'স্নাতক (ডিগ্রি/সম্মান)',
      'diploma': 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং',
      'hsc': 'এইচএসসি / সমমান',
      'ssc': 'এসএসসি / সমমান',
      'jsc': 'অষ্টম শ্রেণি / জেএসসি',
      'other': 'অন্যান্য শিক্ষাগত যোগ্যতা'
    };

    const educationFacets: SearchFacetItem[] = Object.entries(educationNames).map(([key, name_bn]) => ({
      id: key,
      name_bn,
      count: eduCounts[key] || 0
    }));

    const jobTypeNames: Record<string, string> = {
      'full_time': 'ফুল-টাইম (স্থায়ী)',
      'contractual': 'চুক্তিভিত্তিক',
      'internship': 'ইন্টার্নশিপ',
      'temporary': 'অস্থায়ী',
      'part_time': 'পার্ট-টাইম',
      'project_based': 'প্রকল্পভিত্তিক'
    };

    const jobTypeFacets: SearchFacetItem[] = Object.entries(jobTypeNames).map(([key, name_bn]) => ({
      id: key,
      name_bn,
      count: jobTypeCounts[key] || 0
    }));

    const orgTypeNames: Record<string, string> = {
      'government': 'সরকারি মন্ত্রণালয় ও অধিদপ্তর',
      'public_bank': 'বাংলাদেশ ব্যাংক ও রাষ্ট্রায়ত্ত ব্যাংক',
      'state_owned': 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক',
      'private_bank': 'বেসরকারি বাণিজ্যিক ব্যাংক',
      'autonomous_government': 'স্বায়ত্তশাসিত প্রতিষ্ঠান',
      'educational_institution': 'শিক্ষা প্রতিষ্ঠান ও বিশ্ববিদ্যালয়',
      'healthcare_institution': 'হাসপাতাল ও স্বাস্থ্য সেবা',
      'ngo': 'এনজিও ও উন্নয়ন সংস্থা',
      'private_company': 'বেসরকারি করপোরেট কোম্পানি'
    };

    const orgTypeFacets: SearchFacetItem[] = Object.entries(orgTypeNames).map(([key, name_bn]) => ({
      id: key,
      name_bn,
      count: orgTypeCounts[key] || 0
    }));

    const statusNames: Record<string, string> = {
      'open': 'আবেদন চলছে (Open)',
      'closing_soon': 'আবেদনের শেষ সময় সমাগত (Closing Soon)',
      'closed': 'আবেদনের সময় শেষ (Closed)'
    };

    const statusFacets: SearchFacetItem[] = Object.entries(statusNames).map(([key, name_bn]) => ({
      id: key,
      name_bn,
      count: statusCounts[key] || 0
    }));

    return {
      categories: categoryFacets,
      divisions: divisionFacets,
      educationLevels: educationFacets,
      jobTypes: jobTypeFacets,
      orgTypes: orgTypeFacets,
      statuses: statusFacets
    };
  }
}
