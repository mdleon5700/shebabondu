import { URL } from 'url';

export interface UrlSecurityCheckResult {
  safe: boolean;
  reason?: string;
  url?: URL;
}

// Private IPv4 ranges
const PRIVATE_IP_PATTERNS = [
  /^127\./,                         // 127.0.0.0/8 (Loopback)
  /^10\./,                          // 10.0.0.0/8 (Private)
  /^192\.168\./,                    // 192.168.0.0/16 (Private)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12 (Private)
  /^169\.254\./,                    // 169.254.0.0/16 (Link-local / Cloud metadata)
  /^0\.0\.0\.0$/,                   // 0.0.0.0
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./ // 100.64.0.0/10 (Carrier-grade NAT)
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'instance-data',
  'metadata.google.internal',
  'metadata.internal'
]);

const ALLOWED_PORTS = new Set(['', '80', '443', '8080', '8443']);

export function validateSafeUrl(rawUrl: string): UrlSecurityCheckResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, reason: 'URL must be a non-empty string.' };
  }

  const trimmed = rawUrl.trim();

  // Check scheme before parsing
  if (!/^https?:\/\//i.test(trimmed)) {
    return { safe: false, reason: 'Only HTTP and HTTPS protocols are permitted.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch (err: any) {
    return { safe: false, reason: `Malformed URL: ${err.message}` };
  }

  // Enforce protocol
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: `Unpermitted protocol: "${parsed.protocol}". Only http: and https: are allowed.` };
  }

  // Disallow user/password in URL
  if (parsed.username || parsed.password) {
    return { safe: false, reason: 'Credentials in URLs are forbidden.' };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // Block obvious internal names
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.lan')) {
    return { safe: false, reason: `Access to internal hostname "${hostname}" is blocked for security (SSRF prevention).` };
  }

  // Detect IPv6 loopback
  if (hostname === '[::1]' || hostname === '::1' || hostname === '[::]') {
    return { safe: false, reason: 'IPv6 loopback addresses are blocked.' };
  }

  // Detect numeric / octal / hex encoded IPv4 tricks
  if (/^0x[0-9a-f]+$/i.test(hostname) || /^[0-9]+$/.test(hostname)) {
    return { safe: false, reason: 'Decimal or hexadecimal IP representations are blocked.' };
  }

  // Check private IP ranges
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { safe: false, reason: `Access to private IP range "${hostname}" is blocked (SSRF prevention).` };
    }
  }

  // Enforce allowed ports
  if (parsed.port && !ALLOWED_PORTS.has(parsed.port)) {
    return { safe: false, reason: `Port "${parsed.port}" is not permitted for job scraping.` };
  }

  return { safe: true, url: parsed };
}

export function validateSafeRedirect(
  currentUrl: string,
  redirectTarget: string,
  allowedHosts?: Set<string>
): { safe: boolean; resolvedUrl?: string; reason?: string } {
  if (!redirectTarget || typeof redirectTarget !== 'string') {
    return { safe: false, reason: 'Empty redirect target' };
  }

  const cleanTarget = redirectTarget.trim();
  if (cleanTarget.startsWith('javascript:') || cleanTarget.startsWith('data:') || cleanTarget.startsWith('vbscript:')) {
    return { safe: false, reason: 'Unsafe redirect protocol' };
  }

  let resolved: string;
  try {
    resolved = new URL(cleanTarget, currentUrl).toString();
  } catch (err: any) {
    return { safe: false, reason: `Malformed redirect URL: ${err.message}` };
  }

  const secCheck = validateSafeUrl(resolved);
  if (!secCheck.safe || !secCheck.url) {
    return { safe: false, reason: secCheck.reason || 'Redirect blocked by security policy' };
  }

  if (allowedHosts && allowedHosts.size > 0) {
    const host = secCheck.url.hostname.toLowerCase();
    const isAllowed = allowedHosts.has(host) || Array.from(allowedHosts).some(h => host.endsWith('.' + h));
    if (!isAllowed) {
      return { safe: false, reason: `Redirect destination "${host}" is not on the source host allowlist.` };
    }
  }

  return { safe: true, resolvedUrl: resolved };
}
