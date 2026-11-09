'use client';

/**
 * Centrally managed administrative request headers for client components.
 * Automatically injects verified admin PIN or session credentials to prevent 403 Forbidden.
 */
export const getAdminHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
      'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
    };
  }

  const pin = localStorage.getItem('cs_admin_pin') || 
              (localStorage.getItem('cs_admin_auth') === 'verified' ? 'CHAKRISEBA_SECURE_ADMIN_2026' : '');
  const token = localStorage.getItem('token') || localStorage.getItem('cs_token') || '';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (pin) {
    headers['x-admin-secret'] = pin;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const ADMIN_REQ_HEADERS: Record<string, string> = typeof Proxy !== 'undefined'
  ? new Proxy({} as Record<string, string>, {
      get: (_, prop: string) => getAdminHeaders()[prop],
      ownKeys: () => Object.keys(getAdminHeaders()),
      getOwnPropertyDescriptor: (_, prop: string) => ({
        enumerable: true,
        configurable: true,
        value: getAdminHeaders()[prop]
      })
    })
  : { 'Content-Type': 'application/json' };
