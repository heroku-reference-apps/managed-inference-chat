import { FastifyPluginAsync } from 'fastify';
import { generateCSRFToken } from '../middleware/security.js';
import '../types/session.js';

export const csrfRoute: FastifyPluginAsync = async fastify => {
  // Initialize CSRF token in session - accessible without CSRF protection
  // This endpoint should be called when the user first loads the app
  fastify.get('/api/csrf-init', async (request, reply) => {
    try {
      // Generate a new CSRF token
      const token = generateCSRFToken();

      // Store the token in the session
      request.session.csrfToken = token;

      // Set additional CSRF token in a readable cookie for client-side access
      // This is safe because it's the same token that's in the httpOnly session
      reply.setCookie('csrf-token', token, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 10 * 60 * 1000, // 10 minutes
        path: '/',
      });

      return reply.send({ success: true });
    } catch (error) {
      console.error('Error initializing CSRF token:', error);
      return reply.code(500).send({ error: 'Failed to initialize CSRF token' });
    }
  });
};
