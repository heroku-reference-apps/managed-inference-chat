import { FastifyReply, FastifyRequest } from 'fastify';
import { createHmac, timingSafeEqual } from 'node:crypto';

const API_SECRET = process.env.API_SECRET || 'your-secret-key-here';
const APP_ID = 'mia-chat-app';
const MAX_TIMESTAMP_DIFF = 5 * 60 * 1000; // 5 minutes

const usedNonces = new Set<string>();
const nonceCleanupInterval = setInterval(
  () => {
    usedNonces.clear();
  },
  10 * 60 * 1000
); // Clean up every 10 minutes

export interface SecurityHeaders {
  'x-app-id': string;
  'x-timestamp': string;
  'x-signature': string;
  'x-nonce': string;
}

export async function verifyRequest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
  const headers = request.headers as unknown as SecurityHeaders;
  const {
    'x-app-id': appId,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'x-nonce': nonce,
  } = headers;

  // Check required headers
  if (!appId || !timestamp || !signature || !nonce) {
    reply.code(401).send({ error: 'Missing security headers' });
    return false;
  }

  // Verify app ID
  if (appId !== APP_ID) {
    reply.code(401).send({ error: 'Invalid app ID' });
    return false;
  }

  // Check timestamp (prevent replay attacks)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > MAX_TIMESTAMP_DIFF) {
    reply.code(401).send({ error: 'Request timestamp invalid' });
    return false;
  }

  // Check nonce (prevent replay attacks)
  if (usedNonces.has(nonce)) {
    reply.code(401).send({ error: 'Nonce already used' });
    return false;
  }

  // Verify signature
  const method = request.method;
  const path = request.url;
  const body = request.body ? JSON.stringify(request.body) : '';
  const payload = `${method}:${path}:${timestamp}:${nonce}${body ? `:${body}` : ''}`;

  const expectedSignature = createHmac('sha256', API_SECRET).update(payload).digest('hex');

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    reply.code(401).send({ error: 'Invalid signature' });
    return false;
  }

  // Mark nonce as used
  usedNonces.add(nonce);
  return true;
}

// Clean up interval on process exit
process.on('exit', () => {
  clearInterval(nonceCleanupInterval);
});
