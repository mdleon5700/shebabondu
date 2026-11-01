import { 
  JobCollector, 
  CollectorOptions, 
  CollectorResult, 
  RawDiscoveredNotice, 
  NormalizedCircularCandidate, 
  CollectionError 
} from './types';
import { JobSource, CollectionMethod } from '@/lib/types';
import { normalizeCircularNotice } from './normalizer';

export class MockJobCollector implements JobCollector {
  readonly id = 'mock-collector';
  readonly name = 'Deterministic Fixture Collector';
  readonly supportedMethods: CollectionMethod[] = ['html_scrape', 'json_api', 'rss_feed', 'manual_entry'];

  private fixtures: RawDiscoveredNotice[] = [];
  private shouldFail = false;
  private failureError: CollectionError | null = null;
  private delayMs = 0;

  constructor(fixtures: RawDiscoveredNotice[] = []) {
    this.fixtures = fixtures;
  }

  setFixtures(fixtures: RawDiscoveredNotice[]): this {
    this.fixtures = fixtures;
    return this;
  }

  simulateFailure(error: CollectionError): this {
    this.shouldFail = true;
    this.failureError = error;
    return this;
  }

  simulateSuccess(): this {
    this.shouldFail = false;
    this.failureError = null;
    return this;
  }

  setDelay(ms: number): this {
    this.delayMs = ms;
    return this;
  }

  async collect(source: JobSource, options?: CollectorOptions): Promise<CollectorResult> {
    const startTime = Date.now();

    // Check cancellation
    if (options?.signal?.aborted) {
      return {
        success: false,
        sourceId: source.id,
        candidates: [],
        discoveredCount: 0,
        durationMs: Date.now() - startTime,
        error: {
          code: 'TIMEOUT',
          message: 'Collection aborted by signal.',
          timestamp: new Date().toISOString(),
          retryable: true
        },
        metrics: { discovered: 0, collected: 0, failed: 0, deduplicated: 0 }
      };
    }

    if (this.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }

    // Check failure mode
    if (this.shouldFail && this.failureError) {
      return {
        success: false,
        sourceId: source.id,
        candidates: [],
        discoveredCount: 0,
        durationMs: Date.now() - startTime,
        error: this.failureError,
        metrics: { discovered: 0, collected: 0, failed: 1, deduplicated: 0 }
      };
    }

    const candidates: NormalizedCircularCandidate[] = [];
    let invalidCount = 0;

    const itemsToProcess = options?.maxItems 
      ? this.fixtures.slice(0, options.maxItems) 
      : this.fixtures;

    for (const raw of itemsToProcess) {
      const { valid, candidate } = normalizeCircularNotice(raw, source);
      if (valid && candidate) {
        candidates.push(candidate);
      } else {
        invalidCount++;
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      success: true,
      sourceId: source.id,
      candidates,
      discoveredCount: itemsToProcess.length,
      durationMs,
      metrics: {
        discovered: itemsToProcess.length,
        collected: candidates.length,
        failed: invalidCount,
        deduplicated: 0
      }
    };
  }
}
