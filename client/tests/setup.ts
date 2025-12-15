import '@testing-library/jest-dom';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

// Mock scrollIntoView and matchMedia
beforeAll(() => {
  // Add scrollIntoView mock
  Element.prototype.scrollIntoView = vi.fn();

  // Mock window.matchMedia (not implemented in jsdom)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
  // Clear all mocks after each test
  vi.clearAllMocks();
});
