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

      // Store the token in the session (this will trigger session creation)
      request.session.csrfToken = token;

      // Explicitly save the session to ensure the sessionId cookie is set
      await new Promise<void>((resolve, reject) => {
        request.session.save(err => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set additional CSRF token in a readable cookie for client-side access
      // This is safe because it's the same token that's in the httpOnly session
      reply.setCookie('csrf-token', token, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Always use strict for better security
        maxAge: 10 * 60 * 1000, // 10 minutes
        path: '/',
        domain: undefined, // Let browser handle domain automatically
      });

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error, 'Error initializing CSRF token');
      return reply.code(500).send({
        error: 'Failed to initialize CSRF token',
      });
    }
  });
};
