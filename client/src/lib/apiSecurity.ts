import CryptoJS from 'crypto-js';

const API_SECRET = import.meta.env.VITE_API_SECRET || 'your-secret-key-here';
const APP_ID = 'mia-chat-app';

export interface SecurityHeaders {
  'X-App-ID': string;
  'X-Timestamp': string;
  'X-Signature': string;
  'X-Nonce': string;
}

export function generateSecurityHeaders(
  method: string,
  path: string,
  body?: string
): SecurityHeaders {
  const timestamp = Date.now().toString();
  const nonce = CryptoJS.lib.WordArray.random(16).toString();

  // Create signature payload
  const payload = `${method}:${path}:${timestamp}:${nonce}${body ? `:${body}` : ''}`;
  const signature = CryptoJS.HmacSHA256(payload, API_SECRET).toString();

  return {
    'X-App-ID': APP_ID,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
    'X-Nonce': nonce,
  };
}

export async function secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method || 'GET';
  const body = options.body as string;
  const path = new URL(url, window.location.origin).pathname;

  const securityHeaders = generateSecurityHeaders(method, path, body);

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...securityHeaders,
    },
  });
}
