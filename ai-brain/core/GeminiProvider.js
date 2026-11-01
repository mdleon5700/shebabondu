const fs = require('fs');
const path = require('path');
const https = require('https');

class GeminiProvider {
  constructor(options = {}) {
    this.apiKey = options.apiKey !== undefined ? options.apiKey : (process.env.GEMINI_API_KEY || this._loadKeyFromEnvLocal());
    this.model = options.model || process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    this.timeoutMs = options.timeoutMs || 25000;
  }

  _loadKeyFromEnvLocal() {
    try {
      const envPath = path.resolve(__dirname, '..', '..', '.env.local');
      if (fs.existsSync(envPath)) {
        const text = fs.readFileSync(envPath, 'utf8');
        const match = text.match(/GEMINI_API_KEY=(.+)/);
        if (match) return match[1].trim();
      }
    } catch (e) {}
    return null;
  }

  isConfigured() {
    return typeof this.apiKey === 'string' && this.apiKey.trim().length > 10;
  }

  verifyConnectivity() {
    return new Promise((resolve) => {
      if (!this.isConfigured()) {
        return resolve({ connected: false, reason: 'API key not configured' });
      }

      const req = https.get({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models?key=${this.apiKey}`,
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.models && data.models.length > 0) {
              resolve({
                connected: true,
                modelsCount: data.models.length,
                availableModels: data.models.slice(0, 5).map(m => m.name.replace('models/', ''))
              });
            } else {
              resolve({ connected: false, error: data.error?.message || 'No models returned' });
            }
          } catch (e) {
            resolve({ connected: false, error: e.message });
          }
        });
      });

      req.on('error', (err) => resolve({ connected: false, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ connected: false, error: 'Connection timed out' });
      });
    });
  }

  generateContent(prompt, systemInstruction = 'You are a professional software engineering AI brain.') {
    return new Promise((resolve, reject) => {
      if (!this.isConfigured()) {
        return reject(new Error('GEMINI_API_KEY is not configured'));
      }

      const postData = JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048
        }
      });

      const req = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: this.timeoutMs
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode >= 400) {
              return reject(new Error(`Gemini API Error (HTTP ${res.statusCode}): ${data.error?.message || body}`));
            }
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            resolve({
              success: true,
              text,
              model: this.model,
              usage: data.usageMetadata || null
            });
          } catch (e) {
            reject(new Error(`Failed to parse Gemini response: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Gemini request timed out after ${this.timeoutMs}ms`));
      });

      req.write(postData);
      req.end();
    });
  }

  async analyzeDefectAndProposeFix(defectInfo) {
    if (!this.isConfigured()) {
      return this.fallbackDeterministicAnalysis(defectInfo, 'GEMINI_API_KEY_NOT_CONFIGURED');
    }

    const prompt = `Analyze this confirmed software defect and propose a structured JSON repair plan:
Category: ${defectInfo.category}
Description: ${defectInfo.description}
File: ${defectInfo.file}
Evidence: ${defectInfo.evidence}

Respond ONLY in valid JSON matching this schema:
{
  "rootCauseAnalysis": "string",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "proposedPatchStrategy": "string",
  "verificationPlan": "string"
}`;

    try {
      const response = await this.generateContent(prompt, 'You are an autonomous debugging and repair system. Output pure JSON.');
      let parsed = null;
      try {
        const clean = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(clean);
      } catch (e) {
        parsed = { rawAnalysis: response.text };
      }

      return {
        source: 'GEMINI_AI',
        model: this.model,
        analysis: parsed,
        usage: response.usage
      };
    } catch (err) {
      return this.fallbackDeterministicAnalysis(defectInfo, err.message);
    }
  }

  fallbackDeterministicAnalysis(defectInfo, errorReason = 'API_NOT_AVAILABLE') {
    return {
      source: 'DETERMINISTIC_FALLBACK',
      reason: errorReason,
      analysis: {
        rootCauseAnalysis: `Deterministic rule match for category: ${defectInfo.category}`,
        riskLevel: defectInfo.severity === 'CRITICAL' ? 'HIGH' : 'LOW',
        proposedPatchStrategy: `Apply standard localized correction for ${defectInfo.category} in ${defectInfo.file}`,
        verificationPlan: `Run test suite and verify 0 ${defectInfo.category} occurrences`
      }
    };
  }
}

module.exports = GeminiProvider;
