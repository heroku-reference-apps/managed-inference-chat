# Managed Inference Chat

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/heroku-reference-apps/managed-inference-chat)

A React-based chat interface for Heroku's Managed Inference and Agents service.

![Screenshot](screenshot.png)

## Features

- Modern React 18 and React Router v7 application with TypeScript
- Real-time chat interface
- Fastify server for production deployment
- Fully configured for Heroku deployment
- HMAC-based request authentication for API security
- Content Security Policy and security headers
- Rate limiting with IP and user agent tracking

## Project Structure

```text
.
├── app.json         # Heroku application configuration
├── client/          # React frontend application
│   ├── src/         # Source code
│   └── dist/        # Build output
└── server/          # Fastify server for serving the React app
    ├── src/         # Server source code
    └── dist/        # Server build output
```

## Prerequisites

- Node.js 22 or later
- pnpm 10 or later
- Heroku CLI (for deployment)

## Development

1. Install dependencies:

   ```bash
   # Install all dependencies using pnpm workspaces
   pnpm install
   ```

1. Set up environment variables:

   ```bash
   # Create your .env file with the required variables
   # API_SECRET: A secure random key for HMAC signing (generate with: openssl rand -hex 32)
   # VITE_API_SECRET: Same as API_SECRET for client-side usage

   # Example .env file:
   API_SECRET=your-very-secure-secret-key-here
   VITE_API_SECRET=your-very-secure-secret-key-here
   ```

1. Start the development server:

   ```bash
   # Start both client and server in development mode
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Security

This application implements multiple layers of security:

### API Request Authentication

- **HMAC Signing**: All API requests are signed using HMAC-SHA256 with a secret key
- **Timestamp Validation**: Requests must be made within 5 minutes to prevent replay attacks
- **Nonce Protection**: Each request must include a unique nonce to prevent duplicate requests
- **Request Integrity**: Any tampering with the request body or headers invalidates the signature

### Security Headers

- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security**: Enforces HTTPS connections
- **X-XSS-Protection**: Enables browser XSS filtering

### Rate Limiting

- **Per-IP + User Agent**: Rate limits are applied per IP address and user agent combination
- **Configurable Limits**: 20 requests per minute by default
- **Sliding Window**: Uses a sliding window approach for smooth rate limiting

### Environment Variables

Make sure to set secure values for these environment variables:

- `API_SECRET`: A cryptographically secure random key (minimum 32 characters)
- `VITE_API_SECRET`: Must match `API_SECRET` for client-side request signing

Generate a secure key using: `openssl rand -hex 32`

## Building for Production

1. Build all packages:

   ```bash
   pnpm build
   ```

1. Start the production server:

   ```bash
   pnpm start
   ```

## Deploying to Heroku

### Option 1: Deploy via Heroku CLI

1. Install the Heroku CLI AI plugin

   ```bash
   heroku plugins:install @heroku/plugin-ai
   ```

1. Create a new Heroku app:

   ```bash
   heroku create your-app-name
   ```

1. Provision the Heroku Managed Inference and Agents models

   ```bash
   heroku addons:create heroku-inference:claude-4-sonnet --as INFERENCE_4
   heroku addons:create heroku-inference:claude-3-7-sonnet --as INFERENCE_3_7
   heroku addons:create heroku-inference:claude-3-5-sonnet-latest --as INFERENCE_3_5
   heroku addons:create heroku-inference:stable-image-ultra --as DIFFUSION
   ```

1. Deploy to Heroku:

   ```bash
   git push heroku main
   ```

### Option 2: Deploy via Heroku Dashboard

1. Fork or clone this repository
1. Connect your GitHub repository to Heroku
1. Enable automatic deploys or deploy manually from the Heroku Dashboard

## Scripts

- `pnpm dev`: Start development servers for both client and server
- `pnpm build`: Build both client and server for production
- `pnpm start`: Start the production server
- `pnpm test`: Run tests
- `pnpm lint`: Run linting
- `pnpm format`: Format code using Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Apache 2.0
