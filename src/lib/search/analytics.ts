import { SearchEventRecord, SearchAnalyticsSummary } from './types';

export class SearchAnalyticsManager {
  /**
   * Summarize search analytics events
   */
  static summarize(events: SearchEventRecord[]): SearchAnalyticsSummary {
    const totalSearches = events.length;

    const queryCounts: Record<string, number> = {};
    const zeroResultCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const filterCounts: Record<string, { filter: string; value: string; count: number }> = {};

    for (const ev of events) {
      const q = (ev.query || '').trim().toLowerCase();
      if (q) {
        queryCounts[q] = (queryCounts[q] || 0) + 1;
        if (ev.resultsCount === 0) {
          zeroResultCounts[q] = (zeroResultCounts[q] || 0) + 1;
        }
      }

      if (ev.filters) {
        if (ev.filters.category) {
          const c = String(ev.filters.category).toLowerCase();
          categoryCounts[c] = (categoryCounts[c] || 0) + 1;
        }

        for (const [key, val] of Object.entries(ev.filters)) {
          if (val && val !== 'all') {
            const filterKey = `${key}:${val}`;
            if (!filterCounts[filterKey]) {
              filterCounts[filterKey] = { filter: key, value: String(val), count: 0 };
            }
            filterCounts[filterKey].count += 1;
          }
        }
      }
    }

    const popularQueries = Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const zeroResultQueries = Object.entries(zeroResultCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const popularCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topAppliedFilters = Object.values(filterCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSearches,
      popularQueries,
      zeroResultQueries,
      popularCategories,
      topAppliedFilters
    };
  }
}
