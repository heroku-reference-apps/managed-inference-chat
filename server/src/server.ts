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

// Register CORS with strict same-origin policy
fastify.register(fastifyCors, {
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin requests)
    if (!origin) return callback(null, true);

    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // In production, only allow the specific domain
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject all other origins
    callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400, // 24 hours
});

// Register cookie support
fastify.register(fastifyCookie);

// Register session with secure cookies
fastify.register(fastifySession, {
  secret: process.env.SESSION_SECRET || 'your-session-secret-key-change-this-in-production',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'strict', // CSRF protection
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/', // Available for all paths
  },
  saveUninitialized: false, // Don't save empty sessions
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

// Register CSRF route (no protection needed)
fastify.register(csrfRoute);

// Register chat route with rate limiting
fastify.register(chatRoute);

// Register images route with rate limiting
fastify.register(imagesRoute);

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
