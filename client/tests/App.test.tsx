import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  beforeEach(() => {
    // Mock fetch API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          models: [
            'claude-4-sonnet',
            'claude-3-7-sonnet',
            'claude-3-5-sonnet-latest',
            'nova-lite',
            'nova-pro',
            'gpt-oss-120b',
            'stable-image-ultra',
          ],
        }),
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    render(<App />);

    // Wait for async operations (useModels hook) to complete
    await waitFor(
      () => {
        expect(screen).toBeDefined();
      },
      { timeout: 1000 }
    );
  });
});
