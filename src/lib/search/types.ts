import { JobCircular } from '../types';

export interface SearchParams {
  q?: string;
  category?: string; // ID or Slug
  subcategory?: string;
  orgType?: string;
  jobType?: string;
  division?: string;
  district?: string;
  education?: string;
  experience?: string;
  salaryType?: string;
  status?: 'all' | 'open' | 'closing_soon' | 'closed';
  datePosted?: 'all' | 'today' | '3days' | '7days' | '30days';
  org?: string;
  sort?: 'relevance' | 'latest' | 'oldest' | 'deadline_soon' | 'deadline_later' | 'org_asc' | 'org_desc';
  page?: number;
  limit?: number;
}

export interface SearchFacetItem {
  id: string;
  name_bn: string;
  name_en?: string;
  slug?: string;
  count: number;
}

export interface SearchFacets {
  categories: SearchFacetItem[];
  divisions: SearchFacetItem[];
  educationLevels: SearchFacetItem[];
  jobTypes: SearchFacetItem[];
  orgTypes: SearchFacetItem[];
  statuses: SearchFacetItem[];
}

export interface SearchResult {
  jobs: JobCircular[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: SearchFacets;
  queryNormalized?: string;
  suggestedQuery?: string;
}

export interface SearchSuggestionItem {
  text: string;
  type: 'title' | 'org' | 'category' | 'keyword';
  slug?: string;
}

export interface SearchEventRecord {
  id: string;
  query: string;
  filters: Record<string, any>;
  resultsCount: number;
  timestamp: string;
}

export interface SearchAnalyticsSummary {
  totalSearches: number;
  popularQueries: Array<{ query: string; count: number }>;
  zeroResultQueries: Array<{ query: string; count: number }>;
  popularCategories: Array<{ category: string; count: number }>;
  topAppliedFilters: Array<{ filter: string; value: string; count: number }>;
}
