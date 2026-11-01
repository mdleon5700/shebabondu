export interface ApiCheckResult {
  endpoint: string;
  method: 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE';
  status: number;
  statusText: string;
  durationMs: number;
  success: boolean;
  contentType?: string;
  data?: any;
  error?: string;
}

export class ApiVerificationModule {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async checkEndpoint(
    endpoint: string, 
    options: { 
      method?: 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE'; 
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ): Promise<ApiCheckResult> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const t0 = Date.now();
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'ChakriShebaTestingSpider/1.0',
        ...(options.headers || {})
      };
      if (options.body && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body
      });
      const durationMs = Date.now() - t0;
      const contentType = res.headers.get('content-type') || undefined;
      let data: any = undefined;
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {}
      }

      return {
        endpoint,
        method: options.method || 'GET',
        status: res.status,
        statusText: res.statusText,
        durationMs,
        success: res.ok,
        contentType,
        data
      };
    } catch (err: any) {
      return {
        endpoint,
        method: options.method || 'GET',
        status: 0,
        statusText: 'FETCH_ERROR',
        durationMs: Date.now() - t0,
        success: false,
        error: err.message
      };
    }
  }

  async checkProtectedRejection(endpoint: string): Promise<boolean> {
    const result = await this.checkEndpoint(endpoint);
    return result.status === 401 || result.status === 403;
  }
}
