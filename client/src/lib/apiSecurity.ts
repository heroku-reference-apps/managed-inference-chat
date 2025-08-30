export interface CSRFHeaders {
  'X-CSRF-Token': string;
}

// Cache for initialization promise to avoid multiple concurrent requests
let initPromise: Promise<void> | null = null;

/**
 * Get CSRF token from cookie
 */
function getCSRFTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Initialize CSRF token by calling the server endpoint
 */
async function initializeCSRF(): Promise<void> {
  // If already initializing, return the existing promise
  if (initPromise) {
    return initPromise;
  }

  initPromise = fetch('/api/csrf-init', {
    method: 'GET',
    credentials: 'same-origin',
  }).then(response => {
    if (!response.ok) {
      throw new Error('Failed to initialize CSRF token');
    }
  });

  return initPromise;
}

/**
 * Get a valid CSRF token, initializing lazily if needed
 */
async function getCSRFToken(): Promise<string> {
  // Try to get token from cookie first
  let token = getCSRFTokenFromCookie();

  // If no token, initialize CSRF and try again
  if (!token) {
    await initializeCSRF();
    token = getCSRFTokenFromCookie();
  }

  if (!token) {
    throw new Error('Failed to obtain CSRF token');
  }

  return token;
}

/**
 * Generate security headers with CSRF token
 */
export async function generateSecurityHeaders(): Promise<CSRFHeaders> {
  const csrfToken = await getCSRFToken();

  return {
    'X-CSRF-Token': csrfToken,
  };
}

/**
 * Make a secure request with CSRF protection
 */
export async function secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const securityHeaders = await generateSecurityHeaders();

    return fetch(url, {
      ...options,
      credentials: 'same-origin', // Ensure cookies are sent for same-origin requests
      headers: {
        ...options.headers,
        ...securityHeaders,
      },
    });
  } catch (error) {
    // If CSRF token fetch fails, clear the init promise and retry once
    if (initPromise) {
      initPromise = null; // Clear the cached promise to allow retry
      try {
        const securityHeaders = await generateSecurityHeaders();
        return fetch(url, {
          ...options,
          credentials: 'same-origin',
          headers: {
            ...options.headers,
            ...securityHeaders,
          },
        });
      } catch (retryError) {
        throw new Error(`Failed to make secure request: ${retryError}`);
      }
    }
    throw error;
  }
}
