import 'dotenv/config';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import Fastify from 'fastify';
import { chatRoute } from './routes/chat.js';
import { imagesRoute } from './routes/images.js';
import { csrfRoute } from './routes/csrf.js';
import './types/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

const fastify = Fastify({
  logger: true,
});

// Register cookie support
fastify.register(fastifyCookie);

// Ensure SESSION_SECRET is set in production
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET environment variable must be set in production.');
}
// Register session with secure cookies
fastify.register(fastifySession, {
  secret: process.env.SESSION_SECRET || 'your-session-secret-key-change-this-in-development',
  cookieName: 'sessionId', // Explicit session cookie name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'strict', // Always use strict for better security
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/', // Available for all paths
    domain: undefined, // Let browser handle domain automatically
  },
  saveUninitialized: true, // Save sessions even when empty to ensure session cookie is set
  rolling: true, // Reset expiry on each request
});

// Register rate limiter for specific routes
fastify.register(fastifyRateLimit);

// Add security headers
fastify.addHook('onSend', async (request, reply) => {
  reply.headers({
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });
});

// Serve static files from the React app build directory
fastify.register(fastifyStatic, {
  root: join(rootDir, 'client/dist'),
  prefix: '/',
});

// Register API routes with CORS protection
fastify.register(async function (fastify) {
  // Apply CORS only to API routes
  await fastify.register(fastifyCors, {
    origin:
      process.env.NODE_ENV === 'production'
        ? true
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Register API routes
  await fastify.register(csrfRoute);
  await fastify.register(chatRoute);
  await fastify.register(imagesRoute);
});

// Run the server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start().catch(err => {
  fastify.log.error('Failed to start server:', err);
  process.exit(1);
});
