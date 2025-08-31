import { FastifyReply, FastifyRequest } from 'fastify';
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import '../types/session.js';

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-here';
const TOKEN_EXPIRY = 10 * 60 * 1000; // 10 minutes

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
 * Clear session and send error response for CSRF token issues
 */
function clearSessionAndSendError(
  request: FastifyRequest,
  reply: FastifyReply,
  error: string,
  code: 'missing' | 'expired' | 'invalid' | 'mismatch' = 'invalid'
): boolean {
  // Clear the session to force re-initialization
  if (request.session) {
    void request.session.destroy();
  }

  // Clear both CSRF token and session cookies
  reply.clearCookie('csrf-token', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  reply.clearCookie('sessionId', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  reply.code(403).send({
    error,
    code: `csrf_${code}`,
    requiresReauth: true,
  });
  return false;
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
    return clearSessionAndSendError(request, reply, 'CSRF token missing', 'missing');
  }

  // Check if session exists and has a CSRF token
  if (!request.session) {
    return clearSessionAndSendError(request, reply, 'No session found', 'invalid');
  }

  if (!request.session.csrfToken) {
    return clearSessionAndSendError(request, reply, 'No CSRF token in session', 'invalid');
  }

  const sessionToken = request.session.csrfToken;

  // Verify that the client token matches the session token
  if (!timingSafeEqual(Buffer.from(clientToken), Buffer.from(sessionToken))) {
    return clearSessionAndSendError(request, reply, 'CSRF token mismatch', 'mismatch');
  }

  // Verify the token signature and expiry
  try {
    // Decode the base64 token
    const decoded = Buffer.from(clientToken, 'base64').toString('utf8');
    const parts = decoded.split(':');

    if (parts.length !== 3) {
      return clearSessionAndSendError(request, reply, 'Invalid CSRF token format', 'invalid');
    }

    const [timestamp, randomValue, signature] = parts;
    const payload = `${timestamp}:${randomValue}`;

    // Verify the signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');

    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return clearSessionAndSendError(request, reply, 'Invalid CSRF token signature', 'invalid');
    }

    // Check if token has expired
    const tokenTime = parseInt(timestamp);
    const now = Date.now();

    if (now - tokenTime > TOKEN_EXPIRY) {
      return clearSessionAndSendError(request, reply, 'CSRF token expired', 'expired');
    }

    return true;
  } catch (_error) {
    return clearSessionAndSendError(request, reply, 'Invalid CSRF token', 'invalid');
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
