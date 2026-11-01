import { CircularDraft } from '../types';
import { JobTaxonomyClassification, CategoryRecord } from './types';
import { JobTaxonomyClassifier } from './classifier';

export class CategorySuggester {
  /**
   * Suggest category and multidimensional classification for an imported circular draft
   */
  static suggestForDraft(
    draft: CircularDraft,
    activeCategories: CategoryRecord[]
  ): JobTaxonomyClassification {
    const title = (draft.extractedTitle || '').toLowerCase();
    const org = (draft.extractedOrg || '').toLowerCase();
    const minEdu = (draft.minEducation || '').toLowerCase();

    // Mock JobCircular adapter for classification
    const tempJob: any = {
      id: draft.id,
      title: draft.extractedTitle || '',
      organization: draft.extractedOrg || '',
      category: draft.category || 'govt',
      minEducation: draft.minEducation || '',
      districts: 'সকল জেলা',
      requirements: [],
      salary: draft.salary || '',
      daysRemaining: 15
    };

    const classification = JobTaxonomyClassifier.classify(tempJob);

    // Confidence scoring
    let confidenceScore = 0;
    if (org.length > 3) confidenceScore += 40;
    if (title.length > 5) confidenceScore += 30;
    if (minEdu.length > 2) confidenceScore += 20;
    if (draft.category) confidenceScore += 10;

    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (confidenceScore >= 80) confidence = 'HIGH';
    else if (confidenceScore < 50) confidence = 'LOW';

    // Needs review if confidence is LOW or org type could not be determined
    const needsReview = confidence === 'LOW' || classification.organizationType === 'other';

    return {
      ...classification,
      confidence,
      needsReview,
      evidenceNotes: `Auto-suggested with confidence ${confidence} (${confidenceScore}% score) based on extractedTitle & extractedOrg`
    };
  }
}
