export interface CSRFHeaders {
  'X-CSRF-Token': string;
}

// Cache for initialization promise to avoid multiple concurrent requests
let initPromise: Promise<void> | null = null;

// Track if we're currently retrying to avoid infinite loops
let isRetrying = false;

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
 * Clear cached tokens and reset state
 */
function clearTokenCache(): void {
  initPromise = null;
  isRetrying = false;
  // Clear the CSRF token cookie with all possible attributes
  document.cookie = 'csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict;';
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
    headers: {
      Accept: 'application/json',
    },
  }).then(async response => {
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
 * Check if response indicates a CSRF error that requires token refresh
 */
function isCSRFError(response: Response): boolean {
  return response.status === 403;
}

/**
 * Make a secure request with CSRF protection and automatic retry on token expiration
 */
export async function secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
  // Prevent infinite loops
  if (isRetrying) {
    throw new Error('CSRF token retry already in progress');
  }

  try {
    const securityHeaders = await generateSecurityHeaders();

    const response = await fetch(url, {
      ...options,
      credentials: 'same-origin', // Ensure cookies are sent for same-origin requests
      headers: {
        ...options.headers,
        ...securityHeaders,
      },
    });

    // If we get a CSRF error, try to refresh the token and retry once
    if (isCSRFError(response)) {
      // Parse the error response to check if it requires reauth
      let errorData: { requiresReauth?: boolean; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // If we can't parse the response, assume it's a CSRF error
      }

      // Only retry if this is a CSRF-related error that requires reauth
      if (errorData.requiresReauth || errorData.code?.startsWith('csrf_')) {
        isRetrying = true;

        try {
          // Clear cached tokens and get a fresh one
          clearTokenCache();
          const newSecurityHeaders = await generateSecurityHeaders();

          const retryResponse = await fetch(url, {
            ...options,
            credentials: 'same-origin',
            headers: {
              ...options.headers,
              ...newSecurityHeaders,
            },
          });

          return retryResponse;
        } finally {
          isRetrying = false;
        }
      }
    }

    return response;
  } catch (error) {
    // If CSRF token fetch fails initially, clear the cache and retry once
    if (!isRetrying && initPromise) {
      isRetrying = true;

      try {
        clearTokenCache();
        const securityHeaders = await generateSecurityHeaders();

        const retryResponse = await fetch(url, {
          ...options,
          credentials: 'same-origin',
          headers: {
            ...options.headers,
            ...securityHeaders,
          },
        });

        return retryResponse;
      } catch (retryError) {
        throw new Error(`Failed to make secure request: ${retryError}`);
      } finally {
        isRetrying = false;
      }
    }
    throw error;
  }
}
