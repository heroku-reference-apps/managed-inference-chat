import { FastifyReply, FastifyRequest } from 'fastify';
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import '../types/session.js';

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-here';
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export interface CSRFHeaders {
  'x-csrf-token': string;
}

/**
 * Generate a cryptographically signed CSRF token
 */
export function generateCSRFToken(): string {
  const timestamp = Date.now();
  const randomValue = randomBytes(16).toString('hex');

  // Create payload: timestamp:randomValue
  const payload = `${timestamp}:${randomValue}`;

  // Sign the payload with HMAC
  const signature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');

  // Return base64 encoded token: base64(timestamp:randomValue:signature)
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');

  return token;
}

/**
 * Verify CSRF token from request headers against session token
 */
export async function verifyCSRFToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
  const headers = request.headers as unknown as CSRFHeaders;
  const clientToken = headers['x-csrf-token'];

  // Check if CSRF token is provided in headers
  if (!clientToken) {
    reply.code(403).send({ error: 'CSRF token missing' });
    return false;
  }

  // Check if session exists and has a CSRF token
  if (!request.session || !request.session.csrfToken) {
    reply.code(403).send({ error: 'No valid session or CSRF token' });
    return false;
  }

  const sessionToken = request.session.csrfToken;

  // Verify that the client token matches the session token
  if (!timingSafeEqual(Buffer.from(clientToken), Buffer.from(sessionToken))) {
    reply.code(403).send({ error: 'CSRF token mismatch' });
    return false;
  }

  // Verify the token signature and expiry
  try {
    // Decode the base64 token
    const decoded = Buffer.from(clientToken, 'base64').toString('utf8');
    const parts = decoded.split(':');

    if (parts.length !== 3) {
      reply.code(403).send({ error: 'Invalid CSRF token format' });
      return false;
    }

    const [timestamp, randomValue, signature] = parts;
    const payload = `${timestamp}:${randomValue}`;

    // Verify the signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');

    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      reply.code(403).send({ error: 'Invalid CSRF token signature' });
      return false;
    }

    // Check if token has expired
    const tokenTime = parseInt(timestamp);
    const now = Date.now();

    if (now - tokenTime > TOKEN_EXPIRY) {
      reply.code(403).send({ error: 'CSRF token expired' });
      return false;
    }

    return true;
  } catch (_error) {
    reply.code(403).send({ error: 'Invalid CSRF token' });
    return false;
  }
}

/**
 * Verify CSRF token for protected endpoints
 */
export async function verifyRequest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
  // Only verify CSRF token - CORS handles origin verification
  return await verifyCSRFToken(request, reply);
}
