import { JobCircular } from '../types';
import { 
  JobTaxonomyClassification, 
  OrganizationType, 
  JobType, 
  EducationLevel, 
  ExperienceLevel, 
  LocationDivision, 
  ApplicationStatus 
} from './types';
import { normalizeToEnglishDivision, BD_DIVISIONS_MAP } from '../constants';

export class JobTaxonomyClassifier {
  /**
   * Classify any job circular into standard multi-dimensional taxonomy
   */
  static classify(job: JobCircular): JobTaxonomyClassification {
    const title = (job.title || '').toLowerCase();
    const org = (job.organization || '').toLowerCase();
    const minEdu = (job.minEducation || '').toLowerCase();
    const districts = (job.districts || '').toLowerCase();
    const reqs = Array.isArray(job.requirements) ? job.requirements.join(' ').toLowerCase() : '';
    const desc = `${title} ${org} ${minEdu} ${reqs}`;

    // 1. Primary Category Resolution
    let primaryCategory = 'cat-govt';
    let categorySlug = 'government-jobs';
    const subcategories: string[] = [];

    const legacyCat = job.category || 'govt';
    switch (legacyCat) {
      case 'bank':
        primaryCategory = 'cat-bank';
        categorySlug = 'bank-jobs';
        if (org.includes('বাংলাদেশ ব্যাংক')) {
          subcategories.push('cat-bank-bb');
        } else if (org.includes('সমন্বিত') || org.includes('বিএসসিএস') || org.includes('সোনালী') || org.includes('জনতা') || org.includes('অগ্রণী')) {
          subcategories.push('cat-bank-state');
        } else if (org.includes('প্রাইভেট') || org.includes('লিমিটেড') || org.includes('লিঃ')) {
          subcategories.push('cat-bank-private');
        }
        break;

      case 'engineer':
        primaryCategory = 'cat-engineer';
        categorySlug = 'engineering-jobs';
        break;

      case 'teacher':
        primaryCategory = 'cat-teacher';
        categorySlug = 'teacher-jobs';
        break;

      case 'health':
        primaryCategory = 'cat-health';
        categorySlug = 'medical-jobs';
        break;

      case 'defense':
        primaryCategory = 'cat-defense';
        categorySlug = 'defense-jobs';
        break;

      case 'railway':
        primaryCategory = 'cat-govt';
        categorySlug = 'government-jobs';
        subcategories.push('cat-govt-autonomous');
        break;

      case 'ngo':
        primaryCategory = 'cat-ngo';
        categorySlug = 'ngo-jobs';
        break;

      case 'private':
        primaryCategory = 'cat-private';
        categorySlug = 'private-jobs';
        break;

      case 'govt':
      default:
        primaryCategory = 'cat-govt';
        categorySlug = 'government-jobs';
        if (title.includes('বিসিএস') || org.includes('বিপিএসসি') || org.includes('কর্ম কমিশন')) {
          subcategories.push('cat-govt-bcs');
        } else if (org.includes('মন্ত্রণালয়') || org.includes('সচিবালয়')) {
          subcategories.push('cat-govt-ministry');
        } else if (org.includes('অধিদপ্তর') || org.includes('পরিদপ্তর')) {
          subcategories.push('cat-govt-department');
        } else if (org.includes('কর্পোরেশন') || org.includes('ওয়াসা') || org.includes('কর্তৃপক্ষ')) {
          subcategories.push('cat-govt-autonomous');
        }
        break;
    }

    // 2. Organization Type Resolution
    let organizationType: OrganizationType = 'government';
    if (org.includes('বাংলাদেশ ব্যাংক')) {
      organizationType = 'public_bank';
    } else if (primaryCategory === 'cat-bank') {
      if (org.includes('সোনালী') || org.includes('জনতা') || org.includes('অগ্রণী') || org.includes('রূপালী') || org.includes('বিডিবিএল') || org.includes('কৃষি ব্যাংক')) {
        organizationType = 'state_owned';
      } else {
        organizationType = 'private_bank';
      }
    } else if (org.includes('মন্ত্রণালয়') || org.includes('বিভাগ') || org.includes('অধিদপ্তর') || org.includes('পরিদপ্তর')) {
      organizationType = 'government';
    } else if (org.includes('বিশ্ববিদ্যালয়') || org.includes('কলেজ') || org.includes('বিদ্যালয়') || org.includes('মাদ্রাসা')) {
      organizationType = 'educational_institution';
    } else if (org.includes('হাসপাতাল') || org.includes('মেডিকেল') || org.includes('স্বাস্থ্য অধিদপ্তর')) {
      organizationType = 'healthcare_institution';
    } else if (org.includes('কর্পোরেশন') || org.includes('কর্তৃপক্ষ') || org.includes('ওয়াসা') || org.includes('রাজউক') || org.includes('বোর্ড')) {
      organizationType = 'autonomous_government';
    } else if (org.includes('এনজিও') || org.includes('ব্র্যাক') || org.includes('আশা') || org.includes('টিএমএসএস') || legacyCat === 'ngo') {
      organizationType = 'ngo';
    } else if (org.includes('লিমিটেড') || org.includes('লিঃ') || org.includes('গ্রুপ') || legacyCat === 'private') {
      organizationType = 'private_company';
    }

    // 3. Job Type Resolution
    let jobType: JobType = 'full_time';
    if (desc.includes('চুক্তিভিত্তিক') || desc.includes('contractual')) {
      jobType = 'contractual';
    } else if (desc.includes('ইন্টার্ন') || desc.includes('internship')) {
      jobType = 'internship';
    } else if (desc.includes('অস্থায়ী') || desc.includes('temporary')) {
      jobType = 'temporary';
    } else if (desc.includes('খণ্ডকালীন') || desc.includes('part-time')) {
      jobType = 'part_time';
    } else if (desc.includes('প্রকল্প') || desc.includes('project')) {
      jobType = 'project_based';
    }

    // 4. Location / Division Resolution
    let division: LocationDivision = 'ALL_BD';
    let districtName: string | undefined = job.district || undefined;

    if (job.division) {
      const explicitDiv = normalizeToEnglishDivision(job.division);
      if (explicitDiv) division = explicitDiv as LocationDivision;
    }

    if (division === 'ALL_BD') {
      if (districts.includes('সকল জেলা') || districts.includes('সারাদেশ') || districts.includes('anywhere')) {
        division = 'ALL_BD';
      } else {
        const detectedDiv = normalizeToEnglishDivision(districts);
        if (detectedDiv) {
          division = detectedDiv as LocationDivision;
        } else if (districts.includes('ঢাকা') || districts.includes('dhaka')) {
          division = 'DHAKA';
        }
      }
    }

    // 5. Education Level Resolution
    let educationLevel: EducationLevel = 'other';
    if (minEdu.includes('পিএইচডি') || minEdu.includes('phd') || minEdu.includes('এমফিল') || minEdu.includes('mphil') || minEdu.includes('ডক্টরেট')) {
      educationLevel = 'phd';
    } else if (minEdu.includes('মাস্টার্স') || minEdu.includes('স্নাতকোত্তর') || minEdu.includes('masters')) {
      educationLevel = 'masters';
    } else if (minEdu.includes('সম্মান') || minEdu.includes('অনার্স') || minEdu.includes('honours')) {
      educationLevel = 'honours';
    } else if (minEdu.includes('স্নাতক') || minEdu.includes('ডিগ্রি') || minEdu.includes('bachelor') || minEdu.includes('bsc') || minEdu.includes('bba')) {
      educationLevel = 'bachelor';
    } else if (minEdu.includes('ডিপ্লোমা') || minEdu.includes('diploma')) {
      educationLevel = 'diploma';
    } else if (minEdu.includes('এইচএসসি') || minEdu.includes('hsc') || minEdu.includes('উচ্চ মাধ্যমিক') || minEdu.includes('আলিম')) {
      educationLevel = 'hsc';
    } else if (minEdu.includes('এসএসসি') || minEdu.includes('ssc') || minEdu.includes('মাধ্যমিক') || minEdu.includes('দাখিল')) {
      educationLevel = 'ssc';
    } else if (minEdu.includes('জেএসসি') || minEdu.includes('jsc') || minEdu.includes('জেডিসি') || minEdu.includes('jdc') || minEdu.includes('৮ম') || minEdu.includes('অষ্টম')) {
      educationLevel = 'jsc';
    }

    // 6. Experience Level Resolution
    let experienceLevel: ExperienceLevel = 'not_specified';
    if (desc.includes('অভিজ্ঞতার প্রয়োজন নেই') || desc.includes('অভিজ্ঞতা নিষ্প্রয়োজন') || desc.includes('no experience') || desc.includes('freshers')) {
      experienceLevel = 'no_experience';
    } else if (desc.includes('১ বছর') || desc.includes('1 year')) {
      experienceLevel = '1_plus';
    } else if (desc.includes('২ বছর') || desc.includes('2 years')) {
      experienceLevel = '2_plus';
    } else if (desc.includes('৩ বছর') || desc.includes('3 years')) {
      experienceLevel = '3_plus';
    } else if (desc.includes('৫ বছর') || desc.includes('5 years')) {
      experienceLevel = '5_plus';
    }

    // 7. Salary Structure
    let salaryType: 'disclosed' | 'negotiable' | 'not_disclosed' = 'not_disclosed';
    let salaryMin: number | undefined = undefined;
    let salaryMax: number | undefined = undefined;

    if (job.salary) {
      if (job.salary.includes('আলোচনা সাপেক্ষে') || job.salary.includes('negotiable')) {
        salaryType = 'negotiable';
      } else {
        salaryType = 'disclosed';
        // Parse digits in salary (e.g. ২২,০০০ - ৫৩,০৬০)
        const digits = job.salary.replace(/[^\d\-–—]/g, '');
        const parts = digits.split(/[\-–—]/);
        if (parts.length >= 2) {
          salaryMin = parseInt(parts[0], 10) || undefined;
          salaryMax = parseInt(parts[1], 10) || undefined;
        } else if (parts.length === 1 && parts[0]) {
          salaryMin = parseInt(parts[0], 10) || undefined;
        }
      }
    }

    // 8. Application Status & Deadline evaluation
    let applicationStatus: ApplicationStatus = 'open';
    if (job.daysRemaining !== undefined) {
      if (job.daysRemaining <= 0) {
        applicationStatus = 'closed';
      } else if (job.daysRemaining <= 3) {
        applicationStatus = 'closing_soon';
      } else {
        applicationStatus = 'open';
      }
    }

    return {
      primaryCategory,
      categorySlug,
      subcategories,
      organizationType,
      jobType,
      division,
      district: districtName,
      educationLevel,
      experienceLevel,
      salaryType,
      salaryMin,
      salaryMax,
      applicationStatus,
      confidence: 'HIGH',
      needsReview: false,
      evidenceNotes: `Derived deterministically from circular fields: category=${legacyCat}, org=${job.organization}`
    };
  }
}
