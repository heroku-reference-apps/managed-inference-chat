import '@fastify/session';

declare module 'fastify' {
  interface Session {
    csrfToken?: string;
  }
}
